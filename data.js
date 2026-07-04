const KILLERS = [
  'le Trapper', 'le Wraith', 'la Hillbilly', 'la Nurse', 'le Myers',
  'la Hag', 'le Doctor', 'Freddy', 'le Cannibal', 'le Pig',
  'la Huntress', 'le Clown', 'la Spirit', 'le Legion', 'la Plague',
  'Ghost Face', 'le Demogorgon', "l'Oni", 'le Deathslinger', "l'Executioner",
  'le Blight', 'le Twins', 'le Trickster', 'la Nemesis', "l'Artist",
  'le Dredge', 'le Knight', 'la Skull Merchant', 'le Singularity',
  'le Xenomorph', 'Chucky', 'le Unknown', "l'Onryo", 'Wesker',
  'le Vecna', "l'Animatronic", 'le Ghoul', 'le Slasher'
];

const MAPS = [
  'Autohaven Wreckers', 'Coldwind Farm', 'Crotus Prenn Asylum',
  'Disturbed Ward', 'Grim Pantry', 'Haddonfield', 'Lampkin Lane',
  "Léry's Memorial Institute", 'MacMillan Estate', 'Midwich Elementary School',
  "Mother's Dwelling", 'Ormond', 'Red Forest', 'Springwood', 'The Game',
  'Yamaoka Estate', 'Raccoon City Police Department', 'Nostromo Wreckage',
  'Toba Landing'
];

const SURVIVORS = [
  'Dwight', 'Meg', 'Claudette', 'Jake', 'Nea', 'Laurie', 'Ace',
  'Bill', 'Feng', 'David', 'Kate', 'Adam', 'Jeff', 'Jane',
  'Yui', 'Zarina', 'Cheryl', 'Felix', 'Élodie', 'Yun-Jin',
  'Jill', 'Leon', 'Mikaela', 'Rebecca', 'Vittorio'
];

const PERKS = [
  'Sprint Burst', 'Dead Hard', 'Adrenaline', 'Iron Will', 'Kindred',
  'Borrowed Time', "We'll Make It", 'Self-Care', 'Décisif', 'Lithe',
  'Ouvre-toi les yeux', 'Empathie', 'Ténacité', 'Rusé', 'Résilience',
  'Aide-toi', 'Nulle part où fuir', 'Un pour tous', 'Ultime coup du sort',
  "Esprit vif"
];

const RARITIES = {
  commun:    { label: 'Commun',    weight: 40, mult: 1 },
  peuCommun: { label: 'Peu commun', weight: 27, mult: 1.3 },
  rare:      { label: 'Rare',      weight: 18, mult: 1.6 },
  tresRare:  { label: 'Très rare', weight: 10, mult: 2 },
  ultraRare: { label: 'Ultra rare', weight: 5,  mult: 2.5 },
};

const ITEMS = [
  'une lampe torche', 'une boîte à outils', 'un medkit', 'une carte',
  'une clé', 'un pétard', 'un flacon de brume', 'un miroir brisé'
];

const EVENTS = [
  { name: 'Blood Hunt', desc: 'Les Points de Sang affluent en abondance', mult: 2, duration: 3 * 60 * 1000 },
  { name: 'Brouillard épais', desc: 'La brume ralentit tout le monde, gains réduits', mult: 0.7, duration: 2 * 60 * 1000 },
  { name: 'Killer enragé', desc: 'Le Killer redouble de férocité, les pertes sont plus lourdes mais les gains aussi', mult: 1.4, duration: 2 * 60 * 1000 },
  { name: 'Entité affamée', desc: "L'Entité rôde plus près que jamais, gains légèrement réduits", mult: 0.85, duration: 90 * 1000 },
];

const RANKS = [
  { min: 0,    name: 'Rang Rouille' },
  { min: 200,  name: 'Rang Bronze' },
  { min: 600,  name: 'Rang Argent' },
  { min: 1200, name: 'Rang Or' },
  { min: 2500, name: 'Rang Iridescent' },
];

const OFFERING_COST = 50;
const OFFERING_MULT = 1.5;
const OFFERING_DURATION = 3 * 60 * 1000;

const BLEED_PENALTY = 0.6;

const CONFRONTATION_STAKE_PERCENT = 0.2;
const CONFRONTATION_STAKE_CAP = 100;

const WEEK_RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

// ---------- BOUTIQUE (prix réajustés) ----------
const SHOP = {
  titre: { label: 'Titre personnalisé affiché dans le classement', cost: 500 },
  skip:  { label: "Annule un cooldown en cours (précise la commande, ex: !acheter skip generateur)", cost: 200 },
  vol:   { label: 'Vole 10 à 30 PdS à un viewer au hasard sur la chaîne', cost: 350 },
};
const LOTTERY_ENTRY_COST = 100;
const LOTTERY_DURATION = 5 * 60 * 1000;
const VOL_MIN = 10;
const VOL_MAX = 30;

const TIERS = {
  tresFacile:    [5, 15],
  facile:        [10, 25],
  moyen:         [20, 40],
  difficile:     [40, 70],
  tresDifficile: [70, 120],
  exceptionnel:  [120, 200],
};

const LOSS_TIERS = {
  petite:  [5, 15],
  moyenne: [15, 30],
  grosse:  [30, 60],
};

const COOLDOWNS = {
  generateur:     45,
  coffre:         30,
  totem:          45,
  chase:          60,
  soigner:        50,
  skillcheck:     25,
  camping:        60,
  echappe:        600,
  qte:            20,
  objet:          50,
  offrande:       300,
  perk:           60,
  ranked:         15,
  confrontation:  90,
  role:           600,
  stats:          15,
  commandes:      10,
  forcerevent:    30,
  boutique:       10,
  acheter:        15,
  loterie:        30,
};

const GLOBAL_COOLDOWN = 8;
const EVENT_CHANCE = 0.06;

module.exports = {
  KILLERS, MAPS, SURVIVORS, PERKS, RARITIES, ITEMS, EVENTS, RANKS,
  OFFERING_COST, OFFERING_MULT, OFFERING_DURATION, BLEED_PENALTY,
  CONFRONTATION_STAKE_PERCENT, CONFRONTATION_STAKE_CAP, WEEK_RESET_INTERVAL_MS,
  SHOP, LOTTERY_ENTRY_COST, LOTTERY_DURATION, VOL_MIN, VOL_MAX,
  TIERS, LOSS_TIERS, COOLDOWNS, GLOBAL_COOLDOWN, EVENT_CHANCE
};