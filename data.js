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

// ---------- PERKS SURVIVANT (noms officiels français) ----------
const PERKS = [
  'Course Effrénée', 'De Front', 'Adrénaline', 'Volonté de Fer', 'Parenté',
  'Sursis', 'Nous Y Arriverons', 'Auto-Traitement', 'Volonté de Vivre', 'Souple',
  'Empathie', 'Ténacité', 'Fais tes Preuves', 'Déjà-Vu', 'Connaissances en Botanique',
  'Conçu pour Durer', 'Débrouillardise', 'Lien', 'Indéfectible', 'Rapide et Silencieux',
  'Poids Plume', 'Esprit Calme', 'Hyperconcentration', 'En Planque', 'Pour le Peuple',
  "Intuition de l'Inspecteur", 'Objet de Fascination', 'Frisson', 'Prémonition',
  'Parfaite Occasion', 'Distorsion', 'Assurance', 'Libération', 'Résistance',
  'Effusion', 'Bras de Fer', 'Effondrement', 'Autodidacte',
  'Nous Vivrons Éternellement', 'Veillée', 'Second Souffle', 'Par Tous les Moyens',
  'Camaraderie', 'Force Intérieure', 'Solidarité', 'Technicien', 'Confidentiel',
  'Suivi des Soins', 'Renaissance'
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
  'une boîte à outils rouillée', 'un kit de premiers secours',
  'un kit de premiers secours amélioré', 'une trousse de secours usée',
  'une carte', 'une carte topographique déchirée', 'une clé', 'une clé squelette',
  'une fiole de brume', 'une fiole de brume épaisse', 'un miroir brisé',
  'un miroir fêlé', 'des gants chirurgicaux', 'un jeu de piles'
];

// ---------- EFFETS DES OBJETS (un seul objet actif à la fois, se consomme à l'usage) ----------
const ITEM_EFFECTS = {
  'une lampe torche':                    { boostCmd: 'chase',      mult: 1.3 },
  'une lampe torche renforcée':          { boostCmd: 'chase',      mult: 1.6 },
  'un jeu de piles':                     { boostCmd: 'chase',      mult: 1.15 },
  'une boîte à outils':                  { boostCmd: 'generateur', mult: 1.3 },
  'une boîte à outils rouillée':         { boostCmd: 'generateur', mult: 1.15 },
  'un kit de premiers secours':          { boostCmd: 'echappe',    autoHeal: true },
  'un kit de premiers secours amélioré': { boostCmd: 'echappe',    autoHeal: true },
  'une trousse de secours usée':         { boostCmd: 'soigner',    mult: 1.2 },
  'des gants chirurgicaux':              { boostCmd: 'soigner',    mult: 1.4 },
  'une carte':                           { boostCmd: 'totem',      mult: 1.3 },
  'une carte topographique déchirée':    { boostCmd: 'totem',      mult: 1.15 },
  'une clé':                             { boostCmd: 'echappe',    mult: 1.3 },
  'une clé squelette':                   { boostCmd: 'echappe',    mult: 1.6 },
  'une fiole de brume':                  { boostCmd: 'camping',    reducePenalty: 0.5 },
  'une fiole de brume épaisse':          { boostCmd: 'camping',    reducePenalty: 0.7 },
  'un miroir brisé':                     { boostCmd: 'skillcheck', mult: 1.3 },
  'un miroir fêlé':                      { boostCmd: 'qte',        mult: 1.3 },
};

// ---------- OFFRANDES (noms officiels français) ----------
const OFFERINGS = [
  { name: 'le Laurier des Marais',      rarityLabel: 'Commun',     cost: 30,  mult: 1.2, duration: 2 * 60 * 1000 },
  { name: "l'Amarante Craquante",       rarityLabel: 'Commun',     cost: 30,  mult: 1.2, duration: 2 * 60 * 1000 },
  { name: "l'Œillet de Poète",          rarityLabel: 'Commun',     cost: 30,  mult: 1.2, duration: 2 * 60 * 1000 },
  { name: 'la Pochette de Sel',         rarityLabel: 'Peu commun', cost: 50,  mult: 1.3, duration: 2 * 60 * 1000 },
  { name: 'la Pièce Ternie',            rarityLabel: 'Peu commun', cost: 50,  mult: 1.3, duration: 2 * 60 * 1000 },
  { name: "le Linceul de l'Union",      rarityLabel: 'Peu commun', cost: 50,  mult: 1.3, duration: 2 * 60 * 1000 },
  { name: "l'Enveloppe Liée",           rarityLabel: 'Rare',       cost: 90,  mult: 1.5, duration: 3 * 60 * 1000 },
  { name: 'la Statuette de Sel Noir',   rarityLabel: 'Rare',       cost: 90,  mult: 1.5, duration: 3 * 60 * 1000 },
  { name: 'les Serpentins Sanglants',   rarityLabel: 'Très rare',  cost: 140, mult: 1.8, duration: 3 * 60 * 1000 },
  { name: 'le Linceul du Lien',         rarityLabel: 'Très rare',  cost: 140, mult: 1.6, duration: 4 * 60 * 1000 },
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

// ---------- BOUTIQUE ----------
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
  moonwalk:       50,
  patrouille:     45,
  frappe:         60,
  camper:         60,
  trappe:         400,
  nouvellepartie: 30,
};

const GLOBAL_COOLDOWN = 8;
const EVENT_CHANCE = 0.06;

// ---------- SYSTÈME DE PARTIE (portes/générateurs/trappe) ----------
const GENS_REQUIRED = 5;
const TRIAL_RESET_INTERVAL_MS = 20 * 60 * 1000;
const HATCH_CHANCE = 0.25;

// ---------- EFFETS DE PERKS (un perk équipé à la fois, reste actif jusqu'au prochain !perk) ----------
const PERK_EFFECTS = {
  'Auto-Traitement':            { allowSelfHeal: true },
  'Sursis':                     { boostCmd: 'camping',    reducePenalty: 0.4 },
  'Adrénaline':                 { boostCmd: 'echappe',    mult: 1.3 },
  'Esprit Calme':               { boostCmd: 'chase',      mult: 1.2 },
  'Fais tes Preuves':           { boostCmd: 'generateur', mult: 1.25 },
  'Déjà-Vu':                    { boostCmd: 'totem',      mult: 1.25 },
  'Connaissances en Botanique': { boostCmd: 'soigner',    mult: 1.3 },
  'Second Souffle':             { boostCmd: 'skillcheck', mult: 1.2 },
  'Hyperconcentration':         { boostCmd: 'qte',        mult: 1.2 },
  'Volonté de Fer':             { boostCmd: 'chase',      mult: 1.15 },
  'Résistance':                 { boostCmd: 'totem',      mult: 1.15 },
  'Ténacité':                   { boostCmd: 'camping',    reducePenalty: 0.25 },
  'Souple':                     { boostCmd: 'chase',      mult: 1.2 },
  'Objet de Fascination':       { boostCmd: 'objet',      mult: 1.2 },
};

module.exports = {
  KILLERS, MAPS, SURVIVORS, PERKS, PERK_EFFECTS, RARITIES, ITEMS, ITEM_EFFECTS, OFFERINGS, EVENTS, RANKS,
  BLEED_PENALTY, CONFRONTATION_STAKE_PERCENT, CONFRONTATION_STAKE_CAP,
  CONFRONTATION_BLESSURE_MALUS, WEEK_RESET_INTERVAL_MS,
  SHOP, LOTTERY_ENTRY_COST, LOTTERY_DURATION,
  TIERS, LOSS_TIERS, COOLDOWNS, GLOBAL_COOLDOWN, EVENT_CHANCE,
  GENS_REQUIRED, TRIAL_RESET_INTERVAL_MS, HATCH_CHANCE
};
