"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponTarget = exports.BotType = exports.deathQuotes = exports.preludeQuotes = exports.COMMAND_CALL = void 0;
exports.COMMAND_CALL = ";";
exports.preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
exports.deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];
var BotType;
(function (BotType) {
    BotType[BotType["naught"] = 0] = "naught";
    BotType[BotType["enemy"] = 1] = "enemy";
    BotType[BotType["sentry"] = 2] = "sentry";
})(BotType = exports.BotType || (exports.BotType = {}));
var WeaponTarget;
(function (WeaponTarget) {
    WeaponTarget[WeaponTarget["ally"] = 0] = "ally";
    WeaponTarget[WeaponTarget["enemy"] = 1] = "enemy";
})(WeaponTarget = exports.WeaponTarget || (exports.WeaponTarget = {}));