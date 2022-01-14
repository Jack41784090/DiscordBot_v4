"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponTarget = exports.BotType = exports.NumericDirection = exports.deathQuotes = exports.preludeQuotes = exports.EMOJI_BROWNB = exports.EMOJI_BLACKB = exports.EMOJI_WHITEB = exports.EMOJI_STAR = exports.EMOJI_CROSS = exports.EMOJI_TICK = exports.COMMAND_CALL = void 0;
exports.COMMAND_CALL = ";";
exports.EMOJI_TICK = '✅';
exports.EMOJI_CROSS = '❎';
exports.EMOJI_STAR = '🌠';
exports.EMOJI_WHITEB = '⬜';
exports.EMOJI_BLACKB = '⬛';
exports.EMOJI_BROWNB = '🟫';
exports.preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
exports.deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];
var NumericDirection;
(function (NumericDirection) {
    NumericDirection[NumericDirection["up"] = 0] = "up";
    NumericDirection[NumericDirection["right"] = 1] = "right";
    NumericDirection[NumericDirection["down"] = 2] = "down";
    NumericDirection[NumericDirection["left"] = 3] = "left";
})(NumericDirection = exports.NumericDirection || (exports.NumericDirection = {}));
var BotType;
(function (BotType) {
    BotType[BotType["naught"] = 0] = "naught";
    BotType[BotType["enemy"] = 1] = "enemy";
    BotType[BotType["sentry"] = 2] = "sentry";
})(BotType = exports.BotType || (exports.BotType = {}));
// weapons
var WeaponTarget;
(function (WeaponTarget) {
    WeaponTarget[WeaponTarget["ally"] = 0] = "ally";
    WeaponTarget[WeaponTarget["enemy"] = 1] = "enemy";
})(WeaponTarget = exports.WeaponTarget || (exports.WeaponTarget = {}));
