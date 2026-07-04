require('dotenv').config();
const tmi = require('tmi.js');
const fs = require('fs');
const {
  KILLERS, MAPS, SURVIVORS, PERKS, RARITIES, ITEMS, OFFERINGS, EVENTS, RANKS,
  BLEED_PENALTY, CONFRONTATION_STAKE_PERCENT, CONFRONTATION_STAKE_CAP,
  CONFRONTATION_BLESSURE_MALUS, WEEK_RESET_INTERVAL_MS,
  SHOP, LOTTERY_ENTRY_COST, LOTTERY_DURATION,
  TIERS, LOSS_TIERS, COOLDOWNS, GLOBAL_COOLDOWN, EVENT_CHANCE
} = require('./data.js');

const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('SurvivantsBot est en ligne 🩸'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Serveur web actif'));

// ---------- STOCKAGE ----------
const POINTS_FILE = './points.json';
let points = fs.existsSync(POINTS_FILE) ? JSON.parse(fs.readFileSync(POINTS_FILE)) : {};
function savePoints() { fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 2)); }
function addPoints(channel, user, amount) {
  if (!points[channel]) points[channel] = {};
  if (!points[channel][user]) points[channel][user] = 0;
  points[channel][user] += amount;
  if (points[channel][user] < 0) points[channel][user] = 0;
  savePoints();
  return points[channel][user];
}
function getTotal(channel, user) { return (points[channel] && points[channel][user]) || 0; }

const STATS_FILE = './stats.json';
let stats = fs.existsSync(STATS_FILE) ? JSON.parse(fs.readFileSync(STATS_FILE)) : {};
function saveStats() { fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2)); }
function getStats(ch, user) {
  if (!stats[ch]) stats[ch] = {};
  if (!stats[ch][user]) stats[ch][user] = { echappes: 0, campingSubis: 0, meilleureRareteLabel: null, meilleureRareteWeight: undefined, duelsGagnes: 0 };
  return stats[ch][user];
}
function maybeUpdateBestRarity(ch, user, rarity) {
  const s = getStats(ch, user);
  if (s.meilleureRareteWeight === undefined || rarity.weight < s.meilleureRareteWeight) {
    s.meilleureRareteWeight = rarity.weight;
    s.meilleureRareteLabel = rarity.label;
    saveStats();
  }
}

const ROLES_FILE = './roles.json';
let roles = fs.existsSync(ROLES_FILE) ? JSON.parse(fs.readFileSync(ROLES_FILE)) : {};
function saveRoles() { fs.writeFileSync(ROLES_FILE, JSON.stringify(roles, null, 2)); }

const TITLES_FILE = './titles.json';
let titles = fs.existsSync(TITLES_FILE) ? JSON.parse(fs.readFileSync(TITLES_FILE)) : {};
function saveTitles() { fs.writeFileSync(TITLES_FILE, JSON.stringify(titles, null, 2)); }
function getTitle(ch, user) { return titles[`${ch}-${user}`] || null; }

const LEADERBOARD_META_FILE = './leaderboardMeta.json';
let leaderboardMeta = fs.existsSync(LEADERBOARD_META_FILE) ? JSON.parse(fs.readFileSync(LEADERBOARD_META_FILE)) : {};
function saveLeaderboardMeta() { fs.writeFileSync(LEADERBOARD_META_FILE, JSON.stringify(leaderboardMeta, null, 2)); }

const LOTTERIES_FILE = './lotteries.json';
let lotteriesData = fs.existsSync(LOTTERIES_FILE) ? JSON.parse(fs.readFileSync(LOTTERIES_FILE)) : {};
function saveLotteries() { fs.writeFileSync(LOTTERIES_FILE, JSON.stringify(lotteriesData, null, 2)); }

// ---------- HELPERS ----------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const gain = (tier) => rand(...TIERS[tier]);
const loss = (tier) => rand(...LOSS_TIERS[tier]);

function pickRarity() {
  const total = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);
  let roll = Math.random() * total;
  for (const key in RARITIES) {
    roll -= RARITIES[key].weight;
    if (roll <= 0) return RARITIES[key];
  }
  return RARITIES.commun;
}

function getRank(totalPoints) {
  let current = RANKS[0];
  for (const r of RANKS) { if (totalPoints >= r.min) current = r; }
  return current;
}

function isModOrBroadcaster(tags) {
  if (tags.badges && tags.badges.broadcaster) return true;
  if (tags.mod) return true;
  return false;
}

// ---------- BLESSURE (clés normalisées en minuscules pour éviter les soucis de casse) ----------
const blessed = new Map();
function isBlessed(ch, user) { return blessed.get(`${ch}-${user.toLowerCase()}`) === true; }
function setBlessed(ch, user) { blessed.set(`${ch}-${user.toLowerCase()}`, true); }
function healUser(ch, user) { blessed.delete(`${ch}-${user.toLowerCase()}`); }

// ---------- ACCROCHÉ (prérequis pour !camping) ----------
const hooked = new Map();
function isHooked(ch, user) { return hooked.get(`${ch}-${user.toLowerCase()}`) === true; }
function setHooked(ch, user) { hooked.set(`${ch}-${user.toLowerCase()}`, true); }
function unhook(ch, user) { hooked.delete(`${ch}-${user.toLowerCase()}`); }

// ---------- ÉVÉNEMENTS DE CHAÎNE ----------
const activeEvents = new Map();
function getEventMultiplier(ch) {
  const ev = activeEvents.get(ch);
  if (ev && Date.now() < ev.endsAt) return ev.mult;
  if (ev) activeEvents.delete(ch);
  return 1;
}
function triggerEvent(ch, client, channelFull, ev, forced = false) {
  activeEvents.set(ch, { ...ev, endsAt: Date.now() + ev.duration });
  client.say(channelFull, `🌫 ${forced ? '[FORCÉ] ' : ''}ÉVÉNEMENT : ${ev.name} — ${ev.desc} ! (${Math.round(ev.duration / 60000)} min)`);
  setTimeout(() => {
    if (activeEvents.get(ch) && activeEvents.get(ch).name === ev.name) {
      activeEvents.delete(ch);
      client.say(channelFull, `🌫 L'événement "${ev.name}" prend fin, la partie reprend son cours normal.`);
    }
  }, ev.duration);
}
function maybeTriggerEvent(ch, client, channelFull) {
  if (activeEvents.has(ch)) return;
  if (Math.random() > EVENT_CHANCE) return;
  triggerEvent(ch, client, channelFull, pick(EVENTS));
}

// ---------- OFFRANDES ----------
const personalBuffs = new Map();
function getPersonalMultiplier(ch, user) {
  const key = `${ch}-${user}`;
  const buff = personalBuffs.get(key);
  if (buff && Date.now() < buff.endsAt) return buff.mult;
  if (buff) personalBuffs.delete(key);
  return 1;
}
function applyMultipliers(ch, user, pts) {
  const eventMult = getEventMultiplier(ch);
  const personalMult = getPersonalMultiplier(ch, user);
  const bleedMult = (pts > 0 && isBlessed(ch, user)) ? BLEED_PENALTY : 1;
  return Math.round(pts * eventMult * personalMult * bleedMult);
}

// ---------- COOLDOWNS ----------
const globalCd = new Map();
const cmdCd = new Map();
function onGlobalCooldown(channel, user) {
  const key = `${channel}-${user}`;
  const now = Date.now();
  if (globalCd.has(key) && now - globalCd.get(key) < GLOBAL_COOLDOWN * 1000) return true;
  globalCd.set(key, now);
  return false;
}
function onCmdCooldown(channel, user, cmd) {
  const key = `${channel}-${user}-${cmd}`;
  const now = Date.now();
  const seconds = COOLDOWNS[cmd];
  if (cmdCd.has(key) && now - cmdCd.get(key) < seconds * 1000) return true;
  cmdCd.set(key, now);
  return false;
}

// ---------- ANTI-DOUBLON MULTI-CHAÎNES (mécanisme d'origine, qui fonctionnait) ----------
const crossChannelDedupe = new Map();
const DEDUPE_WINDOW_MS = 4000;
function isDuplicateAcrossChannels(user, cmdName) {
  const key = `${user}-${cmdName}`;
  const now = Date.now();
  if (crossChannelDedupe.has(key) && now - crossChannelDedupe.get(key) < DEDUPE_WINDOW_MS) return true;
  crossChannelDedupe.set(key, now);
  return false;
}

// ---------- CLIENT TWITCH ----------
const CHANNEL_LIST = process.env.TWITCH_CHANNELS.split(',').map(c => c.trim());
const client = new tmi.Client({
  options: { debug: true },
  identity: { username: process.env.TWITCH_BOT_USERNAME, password: process.env.TWITCH_TOKEN },
  channels: CHANNEL_LIST
});
client.connect();
client.on('connected', (addr, port) => {
  console.log(`✅ SurvivantsBot connecté à ${addr}:${port}`);
  checkWeeklyResets();
  checkLotteries();
});

// ---------- CLASSEMENT HEBDOMADAIRE ----------
function ensureWeekInit(ch) {
  if (!leaderboardMeta[ch]) {
    leaderboardMeta[ch] = { nextReset: Date.now() + WEEK_RESET_INTERVAL_MS };
    saveLeaderboardMeta();
  }
}
function checkWeeklyResets() {
  CHANNEL_LIST.forEach(ch => {
    ensureWeekInit(ch);
    if (Date.now() >= leaderboardMeta[ch].nextReset) {
      const chPoints = points[ch] || {};
      const top = Object.entries(chPoints).sort((a, b) => b[1] - a[1]);
      const channelFull = '#' + ch;
      if (top.length > 0) {
        const [mvpName, mvpScore] = top[0];
        client.say(channelFull, `🏆 Fin de semaine ! MVP Survivant : ${mvpName} avec ${mvpScore} Points de Sang ! Classement remis à zéro pour une nouvelle semaine 🩸`);
      }
      points[ch] = {};
      savePoints();
      leaderboardMeta[ch].nextReset = Date.now() + WEEK_RESET_INTERVAL_MS;
      saveLeaderboardMeta();
    }
  });
}
setInterval(checkWeeklyResets, 5 * 60 * 1000);

// ---------- LOTERIE ----------
function startLottery(ch) {
  lotteriesData[ch] = { participants: [], endsAt: Date.now() + LOTTERY_DURATION };
  saveLotteries();
}
function checkLotteries() {
  Object.keys(lotteriesData).forEach(ch => {
    const lot = lotteriesData[ch];
    if (lot && Date.now() >= lot.endsAt) {
      const channelFull = '#' + ch;
      if (lot.participants.length > 0) {
        const winner = pick(lot.participants);
        const pot = lot.participants.length * LOTTERY_ENTRY_COST;
        const total = addPoints(ch, winner, pot);
        client.say(channelFull, `🎟️ Tirage de la loterie ! ${winner} remporte la cagnotte de ${pot} PdS (total : ${total}) !`);
      }
      delete lotteriesData[ch];
      saveLotteries();
    }
  });
}
setInterval(checkLotteries, 30 * 1000);

// ---------- COMMANDES ----------
client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const user = tags['display-name'];
  const msg = message.trim().toLowerCase();
  const ch = channel.replace('#', '');
  const killer = pick(KILLERS);
  const map = pick(MAPS);
  const survivor = pick(SURVIVORS);

  const cmdName = msg.split(' ')[0].replace('!', '');
  if (COOLDOWNS[cmdName] !== undefined) {
    if (onGlobalCooldown(ch, user)) return;
    if (onCmdCooldown(ch, user, cmdName)) return;
    if (isDuplicateAcrossChannels(user, cmdName)) return;
    if (cmdName !== 'forcerevent') maybeTriggerEvent(ch, client, channel);
  }

  if (msg === '!generateur') {
    const pts = applyMultipliers(ch, user, gain('moyen'));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `⚙️ ${user} se connecte à un générateur sur ${map}, tandis que ${killer} patrouille au loin. Réparation terminée ! +${pts} PdS (total : ${total})`,
      `⚙️ Sur ${map}, ${user} répare un générateur en retenant son souffle, ${killer} passant à quelques mètres. +${pts} PdS (total : ${total})`,
      `⚙️ ${user} termine un générateur juste avant que ${killer} n'apparaisse à l'horizon de ${map} ! +${pts} PdS (total : ${total})`,
      `⚙️ ${survivor} aide ${user} à finir ce générateur de ${map} en un temps record. +${pts} PdS (total : ${total})`,
      `⚙️ ${user} sursaute à chaque bruit sur ${map}, mais le générateur crache enfin ses dernières étincelles. +${pts} PdS (total : ${total})`,
      `⚙️ Concentré malgré les cris au loin, ${user} boucle la réparation sur ${map}. +${pts} PdS (total : ${total})`,
      `⚙️ ${user} et ${survivor} se relaient sur ce générateur de ${map}, ${killer} rôdant sans les voir. +${pts} PdS (total : ${total})`,
      `⚙️ Un bruit de terreur retentit au loin sur ${map}, mais ${user} garde son sang-froid et termine le générateur. +${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!coffre') {
    const rarity = pickRarity();
    const item = pick(ITEMS);
    maybeUpdateBestRarity(ch, user, rarity);
    const pts = applyMultipliers(ch, user, Math.round(gain('facile') * rarity.mult));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `📦 ${user} fouille un coffre sur ${map} et trouve ${item} (${rarity.label}) ! +${pts} PdS (total : ${total})`,
      `📦 Dans un coin sombre de ${map}, ${user} déniche ${item} (${rarity.label}) au fond d'un coffre poussiéreux. +${pts} PdS (total : ${total})`,
      `📦 ${user} force un coffre rouillé pendant que ${killer} rôde ailleurs sur ${map} : ${item} (${rarity.label}) ! +${pts} PdS (total : ${total})`,
      `📦 ${user} et ${survivor} se partagent la fouille d'un coffre sur ${map}, qui contenait ${item} (${rarity.label}). +${pts} PdS (total : ${total})`,
      `📦 Un grincement inquiétant, mais ${user} garde son calme et récupère ${item} (${rarity.label}) sur ${map}. +${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!totem') {
    const pts = applyMultipliers(ch, user, gain('moyen'));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `🕯️ ${user} repère un totem hexagonal maudit sur ${map} et l'éteint d'un geste sûr. +${pts} PdS (total : ${total})`,
      `🕯️ Malgré la malédiction de ${killer}, ${user} nettoie un totem sur ${map}. +${pts} PdS (total : ${total})`,
      `🕯️ ${user} détruit un totem hex caché dans les buissons de ${map}, brisant une partie du pouvoir de ${killer}. +${pts} PdS (total : ${total})`,
      `🕯️ Guidé par ${survivor}, ${user} localise et éteint un totem maudit sur ${map}. +${pts} PdS (total : ${total})`,
      `🕯️ La flamme du totem vacille puis s'éteint sous les mains de ${user}, quelque part sur ${map}. +${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!chase') {
    const roll = rand(1, 100);
    if (roll > 25) {
      const pts = applyMultipliers(ch, user, gain('difficile'));
      const total = addPoints(ch, user, pts);
      client.say(channel, pick([
        `🏃 ${user} est pris en chasse par ${killer} sur ${map}... et sème son poursuivant ! +${pts} PdS (total : ${total})`,
        `🏃 ${killer} charge ${user} sur ${map}, mais un juke bien placé sauve la mise ! +${pts} PdS (total : ${total})`,
        `🏃 ${user} enchaîne les loops autour d'un générateur pour épuiser ${killer} sur ${map}. +${pts} PdS (total : ${total})`,
        `🏃 Cœur battant, ${user} slalome entre les palettes de ${map} pour échapper à ${killer}. +${pts} PdS (total : ${total})`,
        `🏃 ${survivor} distrait ${killer} pendant que ${user} s'échappe de justesse sur ${map}. +${pts} PdS (total : ${total})`,
        `🏃 ${user} vault une fenêtre à la dernière seconde, ${killer} ratant son swing sur ${map}. +${pts} PdS (total : ${total})`,
      ]));
    } else {
      setHooked(ch, user);
      const pts = applyMultipliers(ch, user, -loss('moyenne'));
      const total = addPoints(ch, user, pts);
      client.say(channel, pick([
        `🏃 ${user} se fait rattraper par ${killer} sur ${map} et se retrouve accroché à un crochet... ${pts} PdS (total : ${total})`,
        `🏃 Épuisé, ${user} finit par se faire plaquer par ${killer} sur ${map} et est suspendu au crochet le plus proche. ${pts} PdS (total : ${total})`,
        `🏃 ${killer} referme la chasse sur ${user} au beau milieu de ${map} : direction le crochet. ${pts} PdS (total : ${total})`,
      ]));
    }
  }

  else if (msg === '!moonwalk') {
    const distance = rand(3, 120);
    const roll = rand(1, 100);

    if (roll > 85) {
      const pts = applyMultipliers(ch, user, Math.round(gain('exceptionnel') * (distance / 120)));
      const total = addPoints(ch, user, pts);
      client.say(channel, pick([
        `🕺 ${user} moonwalk ${distance}m devant ${killer} sur ${map} sans jamais rompre le contact visuel... LÉGENDAIRE ! +${pts} PdS (total : ${total})`,
        `🕺 ${distance}m de moonwalk pur devant ${killer}, ${user} nargue littéralement la Brume sur ${map}. +${pts} PdS (total : ${total})`,
        `🕺 ${user} exécute un moonwalk parfait de ${distance}m sur ${map}, ${killer} en reste bouche bée. +${pts} PdS (total : ${total})`,
        `🕺 ${distance}m plus tard, ${user} moonwalk toujours à travers ${map}, ${killer} a abandonné et regarde le spectacle. +${pts} PdS (total : ${total})`,
        `🕺 Une performance de ${distance}m qui restera dans les annales de ${map}, même ${killer} applaudit intérieurement. +${pts} PdS (total : ${total})`,
        `🕺 ${user} traverse ${distance}m de ${map} en moonwalk ininterrompu, un exploit que même ${survivor} n'ose pas croire. +${pts} PdS (total : ${total})`,
      ]));
    } else if (roll > 55) {
      const pts = applyMultipliers(ch, user, Math.round(gain('moyen') * (distance / 120)));
      const total = addPoints(ch, user, pts);
      client.say(channel, pick([
        `🕺 ${user} moonwalk ${distance}m devant ${killer} sur ${map}, personne n'y comprend rien mais ça marche. +${pts} PdS (total : ${total})`,
        `🕺 ${survivor} filme ${user} en train de moonwalker ${distance}m face à ${killer} sur ${map}. +${pts} PdS (total : ${total})`,
        `🕺 ${user} recule stylé sur ${distance}m à ${map}, ${killer} hésite à avancer. +${pts} PdS (total : ${total})`,
        `🕺 ${distance}m de moonwalk correct, un peu essoufflé sur la fin, mais ${user} assure sur ${map}. +${pts} PdS (total : ${total})`,
        `🕺 ${user} enchaîne ${distance}m de pas glissés sur ${map}, ${killer} ne sait plus s'il doit rire ou attaquer. +${pts} PdS (total : ${total})`,
      ]));
    } else if (roll > 25) {
      const pts = applyMultipliers(ch, user, -loss('petite'));
      const total = addPoints(ch, user, pts);
      client.say(channel, pick([
        `🕺 ${user} moonwalk tranquillement sur ${map}... jusqu'à percuter ${survivor} de plein fouet après ${distance}m. Fin de la choré. ${pts} PdS (total : ${total})`,
        `🕺 En pleine trajectoire, ${survivor} se met accidentellement devant ${user} au bout de ${distance}m, moonwalk interrompu sur ${map}. ${pts} PdS (total : ${total})`,
        `🕺 ${user} et ${survivor} se percutent en pleine chorégraphie après ${distance}m sur ${map}, moment gênant. ${pts} PdS (total : ${total})`,
        `🕺 ${distance}m de moonwalk, puis ${user} trébuche sur une racine qui n'existait clairement pas avant sur ${map}. ${pts} PdS (total : ${total})`,
        `🕺 Après ${distance}m, ${user} percute un mur invisible sur ${map} en pleine choré. Le public de ${survivor} est mort de rire. ${pts} PdS (total : ${total})`,
      ]));
    } else {
      setBlessed(ch, user);
      const pts = applyMultipliers(ch, user, -loss('grosse'));
      const total = addPoints(ch, user, pts);
      client.say(channel, pick([
        `🕺 ${user} moonwalk avec trop de style sur ${map}... ${killer} en profite et frappe en pleine choré après ${distance}m. Tu es blessé ! ${pts} PdS (total : ${total})`,
        `🕺 Concentré sur ses pas, ${user} ne voit pas ${killer} arriver après ${distance}m sur ${map}. Moonwalk fatal, tu es blessé ! ${pts} PdS (total : ${total})`,
        `🕺 ${killer} n'apprécie pas le show : ${user} se fait frapper en pleine performance de ${distance}m sur ${map}. Tu es blessé ! ${pts} PdS (total : ${total})`,
        `🕺 ${distance}m de gloire, puis ${killer} met fin au spectacle d'un coup bien placé sur ${map}. Tu es blessé ! ${pts} PdS (total : ${total})`,
        `🕺 ${user} pousse le moonwalk jusqu'à ${distance}m, trop absorbé pour remarquer ${killer} juste derrière sur ${map}. Tu es blessé ! ${pts} PdS (total : ${total})`,
      ]));
    }
  }

  else if (msg.startsWith('!soigner')) {
    const parts = message.trim().split(' ');
    if (parts.length < 2) return;
    const target = parts[1].replace('@', '');
    if (target.toLowerCase() === user.toLowerCase()) {
      client.say(channel, `💉 ${user}, tu ne peux pas te soigner toi-même ! Demande de l'aide à un autre survivant.`);
      return;
    }
    if (isBlessed(ch, target)) {
      const pts = applyMultipliers(ch, user, gain('facile'));
      addPoints(ch, user, pts);
      const total = addPoints(ch, target, pts);
      healUser(ch, target);
      client.say(channel, pick([
        `💉 ${user} soigne ${target}, blessé par ${killer} sur ${map}. Les deux gagnent +${pts} PdS !`,
        `💉 À l'abri des regards de ${killer}, ${user} recoud les blessures de ${target} sur ${map}. +${pts} PdS chacun !`,
        `💉 ${user} presse une compresse sur la plaie de ${target}, ${killer} n'étant jamais loin sur ${map}. +${pts} PdS chacun !`,
        `💉 Dos à dos derrière un mur de ${map}, ${user} soigne ${target} en silence. +${pts} PdS chacun !`,
      ]));
    } else {
      const pts = applyMultipliers(ch, user, gain('tresFacile'));
      const total = addPoints(ch, user, pts);
      client.say(channel, `💉 ${user} vérifie l'état de ${target}, mais il n'a aucune blessure à soigner pour l'instant. Petite pause sympa quand même ! +${pts} PdS (total : ${total})`);
    }
  }

  else if (msg === '!skillcheck') {
    const roll = rand(1, 100);
    let pts, result;
    if (roll > 85) { pts = gain('tresDifficile'); result = 'GREAT SKILL CHECK 💥'; }
    else if (roll > 30) { pts = gain('moyen'); result = 'Skill check réussi'; }
    else { pts = -loss('petite'); result = 'Skill check raté, tu es blessé...'; setBlessed(ch, user); }
    pts = applyMultipliers(ch, user, pts);
    const total = addPoints(ch, user, pts);
    client.say(channel, `🔧 ${user} tente un skill check sur ${map} face à ${killer} : ${result} ${pts >= 0 ? '+' : ''}${pts} PdS (total : ${total})`);
  }

  else if (msg === '!qte') {
    const roll = rand(1, 100);
    let pts, result;
    if (roll > 90) { pts = gain('exceptionnel'); result = 'QTE PARFAIT ⚡'; }
    else if (roll > 50) { pts = gain('difficile'); result = 'QTE réussi'; }
    else { pts = -loss('moyenne'); result = "QTE raté, tu es blessé..."; setBlessed(ch, user); }
    pts = applyMultipliers(ch, user, pts);
    const total = addPoints(ch, user, pts);
    client.say(channel, `⚡ ${user} déclenche un QTE d'urgence face à ${killer} : ${result} ${pts >= 0 ? '+' : ''}${pts} PdS (total : ${total})`);
  }

  else if (msg === '!objet') {
    const rarity = pickRarity();
    const item = pick(ITEMS);
    maybeUpdateBestRarity(ch, user, rarity);
    const pts = applyMultipliers(ch, user, Math.round(gain('moyen') * rarity.mult));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `🎒 ${user} déniche ${item} de rareté ${rarity.label} sur ${map} ! +${pts} PdS (total : ${total})`,
      `🎒 Caché sous un tas de débris sur ${map}, ${user} trouve ${item} (${rarity.label}). +${pts} PdS (total : ${total})`,
      `🎒 ${survivor} indique une cachette à ${user}, qui y récupère ${item} (${rarity.label}) sur ${map}. +${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!camping') {
    if (!isHooked(ch, user)) {
      client.say(channel, `🔦 ${user}, tu dois d'abord te faire accrocher (rate un !chase) avant de pouvoir être campé !`);
      return;
    }
    setBlessed(ch, user);
    unhook(ch, user);
    const s = getStats(ch, user); s.campingSubis++; saveStats();
    const pts = applyMultipliers(ch, user, -loss('grosse'));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `🔦 ${user} se fait camper par ${killer} juste après avoir été accroché sur ${map}... ${pts} PdS (total : ${total})`,
      `🔦 ${killer} reste planté devant le crochet de ${user} sur ${map}, aucune chance de sauvetage. ${pts} PdS (total : ${total})`,
      `🔦 ${survivor} tente de s'approcher mais ${killer} ne bouge pas du crochet de ${user} sur ${map}. ${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!echappe') {
    if (isBlessed(ch, user)) {
      client.say(channel, `🚪 ${user} est blessé et ne peut pas s'échapper dans cet état ! Fais-toi soigner avec !soigner d'abord.`);
      return;
    }
    const s = getStats(ch, user); s.echappes++; saveStats();
    const pts = applyMultipliers(ch, user, gain('exceptionnel'));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `🚪 ${user} s'échappe par la porte de sortie de ${map}, échappant à ${killer} ! JACKPOT +${pts} PdS (total : ${total})`,
      `🚪 Après une partie intense face à ${killer}, ${user} franchit la sortie de ${map} en vie ! +${pts} PdS (total : ${total})`,
      `🚪 ${user} et ${survivor} filent ensemble par la sortie de ${map}, laissant ${killer} bredouille ! +${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!offrande') {
    const currentTotal = getTotal(ch, user);
    const key = `${ch}-${user}`;
    if (personalBuffs.has(key) && Date.now() < personalBuffs.get(key).endsAt) {
      client.say(channel, `🕯️ ${user}, une offrande est déjà active pour toi !`);
      return;
    }
    const affordable = OFFERINGS.filter(o => o.cost <= currentTotal);
    if (affordable.length === 0) {
      const cheapest = OFFERINGS.reduce((a, b) => a.cost < b.cost ? a : b);
      client.say(channel, `🕯️ ${user}, il te faut au moins ${cheapest.cost} PdS pour brûler une offrande (tu en as ${currentTotal}).`);
      return;
    }
    const offering = pick(affordable);
    addPoints(ch, user, -offering.cost);
    personalBuffs.set(key, { mult: offering.mult, endsAt: Date.now() + offering.duration });
    client.say(channel, `🕯️ ${user} brûle ${offering.name} (${offering.rarityLabel}) avant d'entrer dans la brume... Gains boostés (x${offering.mult}) pendant ${Math.round(offering.duration / 60000)} min ! (-${offering.cost} PdS)`);
  }

  else if (msg === '!perk') {
    const perk = pick(PERKS);
    const rarity = pickRarity();
    maybeUpdateBestRarity(ch, user, rarity);
    const pts = applyMultipliers(ch, user, Math.round(gain('facile') * rarity.mult));
    const total = addPoints(ch, user, pts);
    client.say(channel, pick([
      `🃏 ${user} tire la perk "${perk}" (${rarity.label}) dans son build ! +${pts} PdS (total : ${total})`,
      `🃏 ${survivor} inspire ${user}, qui débloque "${perk}" (${rarity.label}). +${pts} PdS (total : ${total})`,
      `🃏 Une carte de build apparaît devant ${user} : "${perk}" (${rarity.label}) ! +${pts} PdS (total : ${total})`,
    ]));
  }

  else if (msg === '!ranked') {
    const total = getTotal(ch, user);
    const rank = getRank(total);
    client.say(channel, `🎖️ ${user} est actuellement ${rank.name} avec ${total} Points de Sang au total.`);
  }

  else if (msg.startsWith('!confrontation')) {
    const parts = message.trim().split(' ');
    if (parts.length < 2) { client.say(channel, `⚔️ Utilise !confrontation @pseudo pour défier quelqu'un !`); return; }
    const target = parts[1].replace('@', '');
    if (target.toLowerCase() === user.toLowerCase()) { client.say(channel, `⚔️ ${user}, tu ne peux pas te défier toi-même !`); return; }
    let userRoll = rand(1, 100) - (isBlessed(ch, user) ? CONFRONTATION_BLESSURE_MALUS : 0);
    let targetRoll = rand(1, 100) - (isBlessed(ch, target) ? CONFRONTATION_BLESSURE_MALUS : 0);
    if (userRoll === targetRoll) {
      client.say(channel, `⚔️ ${user} affronte ${target} face à ${killer} sur ${map}... égalité parfaite, personne ne gagne !`);
      return;
    }
    const winner = userRoll > targetRoll ? user : target;
    const loser = userRoll > targetRoll ? target : user;
    const loserTotal = getTotal(ch, loser);
    const stake = Math.min(Math.round(loserTotal * CONFRONTATION_STAKE_PERCENT), CONFRONTATION_STAKE_CAP);
    addPoints(ch, loser, -stake);
    const winnerTotal = addPoints(ch, winner, stake);
    if (winner === user) { const s = getStats(ch, user); s.duelsGagnes++; saveStats(); }
    client.say(channel, `⚔️ ${user} défie ${target} face à ${killer} sur ${map} : ${winner} l'emporte et rafle ${stake} PdS (total : ${winnerTotal}) !`);
  }

  else if (msg === '!role') {
    const isKillerRole = Math.random() < 0.5;
    const roleName = isKillerRole ? pick(KILLERS) : pick(SURVIVORS);
    roles[`${ch}-${user}`] = { roleType: isKillerRole ? 'Killer' : 'Survivant', roleName };
    saveRoles();
    client.say(channel, isKillerRole
      ? `🎭 ${user} incarne ${roleName} pour cette session !`
      : `🎭 ${user} incarne le Survivant ${roleName} pour cette session !`);
  }

  else if (msg === '!stats') {
    const s = getStats(ch, user);
    const rarityText = s.meilleureRareteLabel || 'aucun trouvé';
    client.say(channel, `📊 ${user} — Échappées : ${s.echappes} | Fois campé : ${s.campingSubis} | Meilleur loot : ${rarityText} | Confrontations gagnées : ${s.duelsGagnes}`);
  }

  else if (msg === '!classement') {
    const chPoints = points[ch] || {};
    const top = Object.entries(chPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length === 0) {
      client.say(channel, `Aucun Point de Sang enregistré pour l'instant !`);
    } else {
      const list = top.map((p, i) => {
        const t = getTitle(ch, p[0]);
        return `${i + 1}. ${p[0]}${t ? ` [${t}]` : ''} (${p[1]})`;
      }).join(' | ');
      client.say(channel, `🏆 Classement : ${list}`);
    }
  }

  else if (msg === '!points') {
    const total = getTotal(ch, user);
    const t = getTitle(ch, user);
    client.say(channel, `🩸 ${user}${t ? ` [${t}]` : ''}, tu as ${total} Points de Sang.`);
  }

  else if (msg.startsWith('!forcerevent')) {
    if (!isModOrBroadcaster(tags)) {
      client.say(channel, `⛔ ${user}, seuls les modérateurs peuvent forcer un événement.`);
      return;
    }
    const parts = message.trim().split(' ');
    const keyword = parts.slice(1).join(' ').toLowerCase();
    const found = EVENTS.find(e => e.name.toLowerCase().includes(keyword));
    if (!found) {
      client.say(channel, `⛔ Introuvable. Choix : ${EVENTS.map(e => e.name).join(', ')}`);
      return;
    }
    triggerEvent(ch, client, channel, found, true);
  }

  else if (msg === '!boutique') {
    const list = Object.entries(SHOP).map(([key, item]) => `!acheter ${key} (${item.cost} PdS: ${item.label})`).join(' | ');
    client.say(channel, `🛒 Boutique : ${list} | !loterie (${LOTTERY_ENTRY_COST} PdS pour participer)`);
  }

  else if (msg.startsWith('!acheter')) {
    const parts = message.trim().split(' ');
    const key = (parts[1] || '').toLowerCase();
    const item = SHOP[key];
    if (!item) {
      client.say(channel, `🛒 Objet inconnu. Tape !boutique pour voir la liste.`);
      return;
    }
    const currentTotal = getTotal(ch, user);
    if (currentTotal < item.cost) {
      client.say(channel, `🛒 ${user}, il te faut ${item.cost} PdS pour ça (tu en as ${currentTotal}).`);
      return;
    }

    if (key === 'titre') {
      const customTitle = parts.slice(2).join(' ').trim();
      if (!customTitle || customTitle.length > 24) {
        client.say(channel, `🛒 Utilise !acheter titre <ton texte> (24 caractères max).`);
        return;
      }
      addPoints(ch, user, -item.cost);
      titles[`${ch}-${user}`] = customTitle;
      saveTitles();
      client.say(channel, `🛒 ${user} débloque le titre "${customTitle}" ! (-${item.cost} PdS)`);
    }

    else if (key === 'skip') {
      const targetCmd = (parts[2] || '').toLowerCase();
      if (!COOLDOWNS[targetCmd]) {
        client.say(channel, `🛒 Précise une commande valide, ex: !acheter skip generateur`);
        return;
      }
      const cdKey = `${ch}-${user}-${targetCmd}`;
      if (!cmdCd.has(cdKey)) {
        client.say(channel, `🛒 ${user}, aucun cooldown actif sur !${targetCmd}, rien à débloquer !`);
        return;
      }
      addPoints(ch, user, -item.cost);
      cmdCd.delete(cdKey);
      client.say(channel, `🛒 ${user} débloque instantanément !${targetCmd} ! (-${item.cost} PdS)`);
    }
  }

  else if (msg === '!loterie') {
    const currentTotal = getTotal(ch, user);
    if (currentTotal < LOTTERY_ENTRY_COST) {
      client.say(channel, `🎟️ ${user}, il te faut ${LOTTERY_ENTRY_COST} PdS pour participer (tu en as ${currentTotal}).`);
      return;
    }
    if (!lotteriesData[ch]) {
      startLottery(ch);
      client.say(channel, `🎟️ Une loterie démarre sur la chaîne ! Tape !loterie pour rejoindre (${LOTTERY_ENTRY_COST} PdS), tirage dans ${Math.round(LOTTERY_DURATION / 60000)} min.`);
    }
    if (lotteriesData[ch].participants.includes(user)) {
      client.say(channel, `🎟️ ${user}, tu es déjà inscrit à cette loterie !`);
      return;
    }
    addPoints(ch, user, -LOTTERY_ENTRY_COST);
    lotteriesData[ch].participants.push(user);
    saveLotteries();
    client.say(channel, `🎟️ ${user} rejoint la loterie ! (${lotteriesData[ch].participants.length} participant(s))`);
  }

  else if (msg === '!commandes') {
    const withCd = Object.keys(COOLDOWNS)
      .filter(c => c !== 'forcerevent')
      .map(c => `!${c}(${COOLDOWNS[c]}s)`)
      .join(' ');
    client.say(channel, `📜 ${withCd} !classement !points (mods: !forcerevent)`);
  }
});