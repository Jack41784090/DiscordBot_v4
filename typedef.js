"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponTarget = exports.BotType = exports.AllTeams = exports.DungeonItemInfoChart = exports.StatMaximus = exports.NumericDirection = exports.deathQuotes = exports.preludeQuotes = exports.EMOJI_SPRINT = exports.EMOJI_SWORD = exports.EMOJI_SHIELD = exports.EMOJI_BROWNB = exports.EMOJI_BLACKB = exports.EMOJI_WHITEB = exports.EMOJI_STAR = exports.EMOJI_CROSS = exports.EMOJI_TICK = exports.COMMAND_CALL = void 0;
exports.COMMAND_CALL = ";";
exports.EMOJI_TICK = '✅';
exports.EMOJI_CROSS = '❎';
exports.EMOJI_STAR = '🌠';
exports.EMOJI_WHITEB = '⬜';
exports.EMOJI_BLACKB = '⬛';
exports.EMOJI_BROWNB = '🟫';
exports.EMOJI_SHIELD = '🛡️';
exports.EMOJI_SWORD = '🗡️';
exports.EMOJI_SPRINT = '👢';
exports.preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
exports.deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];
var NumericDirection;
(function (NumericDirection) {
    NumericDirection[NumericDirection["up"] = 0] = "up";
    NumericDirection[NumericDirection["right"] = 1] = "right";
    NumericDirection[NumericDirection["down"] = 2] = "down";
    NumericDirection[NumericDirection["left"] = 3] = "left";
})(NumericDirection = exports.NumericDirection || (exports.NumericDirection = {}));
exports.StatMaximus = {
    AHP: 100,
    Dodge: 30,
    Prot: 0.5,
    Spd: 10,
};
exports.DungeonItemInfoChart = new Map([
    [
        "torch",
        {
            emoji: '🔦',
            prize: 20,
        }
    ],
    [
        "scout",
        {
            emoji: '👾',
            prize: 20,
        }
    ]
]);
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
// weapons
var WeaponTarget;
(function (WeaponTarget) {
    WeaponTarget[WeaponTarget["ally"] = 0] = "ally";
    WeaponTarget[WeaponTarget["enemy"] = 1] = "enemy";
})(WeaponTarget = exports.WeaponTarget || (exports.WeaponTarget = {}));
