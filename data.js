// ---------- KILLERS (avec formes grammaticales correctes) ----------
const KILLERS = [
  { subject: 'le Trapper', a: 'au Trapper', de: 'du Trapper' },
  { subject: 'le Wraith', a: 'au Wraith', de: 'du Wraith' },
  { subject: 'la Hillbilly', a: 'à la Hillbilly', de: 'de la Hillbilly' },
  { subject: 'la Nurse', a: 'à la Nurse', de: 'de la Nurse' },
  { subject: 'le Myers', a: 'au Myers', de: 'du Myers' },
  { subject: 'la Hag', a: 'à la Hag', de: 'de la Hag' },
  { subject: 'le Doctor', a: 'au Doctor', de: 'du Doctor' },
  { subject: 'Freddy', a: 'à Freddy', de: 'de Freddy' },
  { subject: 'le Cannibal', a: 'au Cannibal', de: 'du Cannibal' },
  { subject: 'le Pig', a: 'au Pig', de: 'du Pig' },
  { subject: 'la Huntress', a: 'à la Huntress', de: 'de la Huntress' },
  { subject: 'le Clown', a: 'au Clown', de: 'du Clown' },
  { subject: 'la Spirit', a: 'à la Spirit', de: 'de la Spirit' },
  { subject: 'le Legion', a: 'au Legion', de: 'du Legion' },
  { subject: 'la Plague', a: 'à la Plague', de: 'de la Plague' },
  { subject: 'Ghost Face', a: 'à Ghost Face', de: 'de Ghost Face' },
  { subject: 'le Demogorgon', a: 'au Demogorgon', de: 'du Demogorgon' },
  { subject: "l'Oni", a: "à l'Oni", de: "de l'Oni" },
  { subject: 'le Deathslinger', a: 'au Deathslinger', de: 'du Deathslinger' },
  { subject: "l'Executioner", a: "à l'Executioner", de: "de l'Executioner" },
  { subject: 'le Blight', a: 'au Blight', de: 'du Blight' },
  { subject: 'le Twins', a: 'au Twins', de: 'du Twins' },
  { subject: 'le Trickster', a: 'au Trickster', de: 'du Trickster' },
  { subject: 'la Nemesis', a: 'à la Nemesis', de: 'de la Nemesis' },
  { subject: "l'Artist", a: "à l'Artist", de: "de l'Artist" },
  { subject: 'le Dredge', a: 'au Dredge', de: 'du Dredge' },
  { subject: 'le Knight', a: 'au Knight', de: 'du Knight' },
  { subject: 'la Skull Merchant', a: 'à la Skull Merchant', de: 'de la Skull Merchant' },
  { subject: 'le Singularity', a: 'au Singularity', de: 'du Singularity' },
  { subject: 'le Xenomorph', a: 'au Xenomorph', de: 'du Xenomorph' },
  { subject: 'Chucky', a: 'à Chucky', de: 'de Chucky' },
  { subject: "l'Unknown", a: "à l'Unknown", de: "de l'Unknown" },
  { subject: "l'Onryo", a: "à l'Onryo", de: "de l'Onryo" },
  { subject: 'Wesker', a: 'à Wesker', de: 'de Wesker' },
  { subject: 'le Vecna', a: 'au Vecna', de: 'du Vecna' },
  { subject: "l'Animatronic", a: "à l'Animatronic", de: "de l'Animatronic" },
  { subject: 'le Ghoul', a: 'au Ghoul', de: 'du Ghoul' },
  { subject: 'le Slasher', a: 'au Slasher', de: 'du Slasher' },
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

// ---------- PERKS SURVIVANT (noms français officiels vérifiés) ----------
const PERKS = [
  'Course effrénée', 'Dur à cuir', 'Adrénaline', 'Volonté de fer', 'Kindred',
  'Sursis', "We'll Make It", 'Auto-traitement', 'Coup décisif', 'Souple',
  'Empathie', 'Ténacité', 'Résilience', 'Lien', 'Incassable',
  'Rapide et silencieux', 'Esprit calme', 'Prémonition', "Objet d'obsession",
  'Distorsion', 'Bouclez votre ceinture', 'Vigile', 'Résurgence',
  'Atterrissage équilibré', 'Espoir', 'Prouvez-vous', 'Leader',
  'Power Struggle', 'Autodidacte', 'Déjà Vu'
];

// ---------- OBJETS + RARETÉS ----------
const RARITIES = {
  commun:    { label: 'Commun',    weight: 40, mult: 1 },
  peuCommun: { label: 'Peu commun', weight: 27, mult: 1.3 },
  rare:      { label: 'Rare',      weight: 18, mult: 1.6 },
  tresRare:  { label: 'Très rare', weight: 10, mult: 2 },
  ultraRare: { label: 'Ultra rare', weight: 5,  mult: 2.5 },
};

const ITEMS = [
  'une lampe torche', 'une lampe torche renforcée', 'une boîte à outils',
  'une boîte à outils rouillée', 'une trousse de soins', 'une trousse de soins renforcée',
  'une trousse de secours usée', 'une carte', 'une carte topographique déchirée',
  'une clé', 'une clé squelette', 'un pétard', 'un pétard artisanal',
  'un flacon de brume', 'un flacon de brume épaisse', 'un miroir brisé',
  'un miroir fêlé', 'des gants chirurgicaux', 'un pack de piles'
];

// ---------- OFFRANDES (noms traduits en français) ----------
const OFFERINGS = [
  { name: 'Laurier des marais',              rarityLabel: 'Commun',     cost: 30,  mult: 1.2, duration: 2 * 60 * 1000 },
  { name: 'Amarante craquante',              rarityLabel: 'Commun',     cost: 30,  mult: 1.2, duration: 2 * 60 * 1000 },
  { name: 'Œillet de poète',                 rarityLabel: 'Commun',     cost: 30,  mult: 1.2, duration: 2 * 60 * 1000 },
  { name: 'Sachet de sel',                   rarityLabel: 'Peu commun', cost: 50,  mult: 1.3, duration: 2 * 60 * 1000 },
  { name: 'Pièce ternie',                    rarityLabel: 'Peu commun', cost: 50,  mult: 1.3, duration: 2 * 60 * 1000 },
  { name: "Linceul de l'union",              rarityLabel: 'Peu commun', cost: 50,  mult: 1.3, duration: 2 * 60 * 1000 },
  { name: 'Enveloppe scellée',               rarityLabel: 'Rare',       cost: 90,  mult: 1.5, duration: 3 * 60 * 1000 },
  { name: 'Statuette de sel noir',           rarityLabel: 'Rare',       cost: 90,  mult: 1.5, duration: 3 * 60 * 1000 },
  { name: 'Serpentins de fête ensanglantés', rarityLabel: 'Très rare',  cost: 140, mult: 1.8, duration: 3 * 60 * 1000 },
  { name: 'Linceul du lien',                 rarityLabel: 'Très rare',  cost: 140, mult: 1.6, duration: 4 * 60 * 1000 },
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

const BLEED_PENALTY = 0.6;
const CONFRONTATION_STAKE_PERCENT = 0.2;
const CONFRONTATION_STAKE_CAP = 100;
const CONFRONTATION_BLESSURE_MALUS = 15;

const WEEK_RESET_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;

const SHOP = {
  titre: { label: 'Titre personnalisé affiché dans le classement', cost: 500 },
  skip:  { label: "Annule un cooldown en cours (précise la commande, ex: !acheter skip generateur)", cost: 200 },
};
const LOTTERY_ENTRY_COST = 100;
const LOTTERY_DURATION = 5 * 60 * 1000;

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
  KILLERS, MAPS, SURVIVORS, PERKS, RARITIES, ITEMS, OFFERINGS, EVENTS, RANKS,
  BLEED_PENALTY, CONFRONTATION_STAKE_PERCENT, CONFRONTATION_STAKE_CAP,
  CONFRONTATION_BLESSURE_MALUS, WEEK_RESET_INTERVAL_MS,
  SHOP, LOTTERY_ENTRY_COST, LOTTERY_DURATION,
  TIERS, LOSS_TIERS, COOLDOWNS, GLOBAL_COOLDOWN, EVENT_CHANCE
};