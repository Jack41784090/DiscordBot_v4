"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbilityTargetting = exports.BotType = exports.AllTeams = exports.MaterialGrade = exports.NumericDirection = exports.StatMaximus = exports.defaultAvatarURL = exports.coinURL = exports.deathQuotes = exports.preludeQuotes = exports.MEW = exports.EMOJI_MONEYBAG = exports.EMOJI_SPRINT = exports.EMOJI_SWORD = exports.EMOJI_SHIELD = exports.EMOJI_BROWNB = exports.EMOJI_BLACKB = exports.EMOJI_WHITEB = exports.EMOJI_STAR = exports.EMOJI_CROSS = exports.EMOJI_TICK = exports.COMMAND_CALL = void 0;
exports.COMMAND_CALL = ";";
// EMOJIS
exports.EMOJI_TICK = '✅';
exports.EMOJI_CROSS = '❎';
exports.EMOJI_STAR = '🌠';
exports.EMOJI_WHITEB = '⬜';
exports.EMOJI_BLACKB = '⬛';
exports.EMOJI_BROWNB = '🟫';
exports.EMOJI_SHIELD = '🛡️';
exports.EMOJI_SWORD = '🗡️';
exports.EMOJI_SPRINT = '👢';
exports.EMOJI_MONEYBAG = '💰';
exports.MEW = 'μ';
// RANDOM STRINGS
exports.preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
exports.deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];
// LINKS
exports.coinURL = 'https://i.imgur.com/NK84zBg.png';
exports.defaultAvatarURL = "https://cdn.discordapp.com/embed/avatars/0.png";
// STATISTICAL
exports.StatMaximus = {
    AHP: 100,
    Dodge: 50,
    Prot: 1,
    speed: 10,
};
var NumericDirection;
(function (NumericDirection) {
    NumericDirection[NumericDirection["up"] = 0] = "up";
    NumericDirection[NumericDirection["right"] = 1] = "right";
    NumericDirection[NumericDirection["down"] = 2] = "down";
    NumericDirection[NumericDirection["left"] = 3] = "left";
})(NumericDirection = exports.NumericDirection || (exports.NumericDirection = {}));
var MaterialGrade;
(function (MaterialGrade) {
    MaterialGrade[MaterialGrade["poor"] = 0] = "poor";
    MaterialGrade[MaterialGrade["common"] = 1] = "common";
    MaterialGrade[MaterialGrade["good"] = 2] = "good";
    MaterialGrade[MaterialGrade["rare"] = 3] = "rare";
    MaterialGrade[MaterialGrade["very_rare"] = 4] = "very_rare";
    MaterialGrade[MaterialGrade["very_very_rare"] = 5] = "very_very_rare";
    MaterialGrade[MaterialGrade["unique"] = 6] = "unique";
    MaterialGrade[MaterialGrade["epic"] = 7] = "epic";
    MaterialGrade[MaterialGrade["mythical"] = 8] = "mythical";
    MaterialGrade[MaterialGrade["legendary"] = 9] = "legendary";
    MaterialGrade[MaterialGrade["god"] = 10] = "god";
})(MaterialGrade = exports.MaterialGrade || (exports.MaterialGrade = {}));
exports.AllTeams = [
    'block',
    'player',
    'enemy',
];
var BotType;
(function (BotType) {
    BotType[BotType["naught"] = 0] = "naught";
    BotType[BotType["approach_attack"] = 1] = "approach_attack";
    BotType[BotType["passive_supportive"] = 2] = "passive_supportive";
})(BotType = exports.BotType || (exports.BotType = {}));
// ABILITIES
var AbilityTargetting;
(function (AbilityTargetting) {
    AbilityTargetting[AbilityTargetting["ally"] = 0] = "ally";
    AbilityTargetting[AbilityTargetting["enemy"] = 1] = "enemy";
})(AbilityTargetting = exports.AbilityTargetting || (exports.AbilityTargetting = {}));
