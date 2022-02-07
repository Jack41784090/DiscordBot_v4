"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConditionalTexts = exports.extractActions = exports.sendToSandbox = exports.clearChannel = exports.getButtonsActionRow = exports.getSelectMenuActionRow = exports.setUpInteractionCollect = exports.findReferenceAngle = exports.Test = exports.getAttackAction = exports.directionToMagnitudeAxis = exports.directionToEmoji = exports.replaceCharacterAtIndex = exports.directionToNumericDirection = exports.numericDirectionToDirection = exports.getLootAction = exports.getMoveAction = exports.getDirection = exports.counterAxis = exports.returnGridCanvas = exports.getCanvasCoordsFromBattleCoord = exports.startDrawing = exports.addHPBar = exports.roundToDecimalPlace = exports.newWeapon = exports.getBuffStatusEffect = exports.getCoordsWithinRadius = exports.checkWithinDistance = exports.getDistance = exports.findEqualCoordinate = exports.findLongArm = exports.getProt = exports.getLifesteal = exports.getCrit = exports.getSpd = exports.getDodge = exports.getAcc = exports.getDamage = exports.getAHP = exports.normalRandom = exports.average = exports.uniformRandom = exports.formalise = exports.capitalize = exports.extractCommands = exports.debug = exports.log = exports.stringifyRGBA = exports.normaliseRGBA = exports.clamp = void 0;
exports.getItemType = exports.getGradeTag = exports.breadthFirstSearch = exports.sendInvitation = exports.drawCircle = exports.drawText = exports.shortenString = exports.getNewNode = exports.handleTokens = exports.getDeathEmbed = exports.printAction = exports.dealWithAction = exports.getRandomCode = exports.getCoordString = exports.getStat = exports.getEmptyBuff = exports.getBaseEnemyStat = exports.getBaseClassStat = exports.getWeaponIndex = exports.getEmptyAccolade = exports.getCSFromMap = exports.getMapFromCS = exports.printCSMap = exports.getWeaponUses = exports.arrayGetRandom = exports.arrayRemoveItemArray = exports.arrayGetLargestInArray = exports.arrayGetLastElement = exports.getNewObject = exports.dealWithAccolade = exports.getPyTheorem = exports.getCompass = exports.getStatsEmbed = exports.getWeaponEmbed = exports.getLoadingEmbed = exports.getActionsTranslate = exports.getWithSign = void 0;
var canvas_1 = require("canvas");
var discord_js_1 = require("discord.js");
var __1 = require("..");
var typedef_1 = require("../typedef");
var Battle_1 = require("./Battle");
var jsons_1 = require("../jsons");
// import { Dungeon } from "./Dungeon";
function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}
exports.clamp = clamp;
function normaliseRGBA(rgba) {
    // R
    rgba.r = clamp(Math.round(rgba.r), 0, 255);
    // G
    rgba.g = clamp(Math.round(rgba.g), 0, 255);
    // B
    rgba.b = clamp(Math.round(rgba.b), 0, 255);
    // ALPHA
    rgba.alpha = clamp(rgba.alpha, 0, 1);
    return rgba;
}
exports.normaliseRGBA = normaliseRGBA;
function stringifyRGBA(rgba) {
    return "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + rgba.alpha + ")";
}
exports.stringifyRGBA = stringifyRGBA;
function log() {
    var any = [];
    for (var _a = 0; _a < arguments.length; _a++) {
        any[_a] = arguments[_a];
    }
    any.forEach(function (any) { return console.log(any); });
}
exports.log = log;
function debug(tag, any) {
    console.log(tag + ": ", any);
}
exports.debug = debug;
// string manipulation
function extractCommands(string) {
    var sections = string.split(' ');
    if (sections[0][0] === typedef_1.COMMAND_CALL) {
        sections[0] = sections[0].substring(1);
    }
    return sections;
}
exports.extractCommands = extractCommands;
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.capitalize = capitalize;
function formalise(string) {
    return string.split(" ").map(function (_ss) { return capitalize(_ss.toLowerCase()); }).join(" ");
}
exports.formalise = formalise;
// number manipulation
function uniformRandom(num1, num2) {
    /**
     * num1 == 1, num2 == 3
     *  result == (1, 2) ==> 1
     *  result == (2, 3) ==> 2
     *  result == (3, 4) ==> 3
    **/
    var parametersIntegers = Number.isInteger(num1) && Number.isInteger(num2);
    var random = Math.random(); // [0.0, 1.0]
    var result = Math.min(num1, num2) + ((Math.abs(num1 - num2) + Number(parametersIntegers)) * random);
    return parametersIntegers ?
        Math.floor(result) :
        result;
}
exports.uniformRandom = uniformRandom;
function average() {
    var nums = [];
    for (var _a = 0; _a < arguments.length; _a++) {
        nums[_a] = arguments[_a];
    }
    var total = 0;
    for (var i = 0; i < nums.length; i++) {
        var n = nums[i];
        total += n;
    }
    return total / (nums.length || 1);
}
exports.average = average;
function normalRandom(_mean, _standardDeviation) {
    // Box Muller Transform
    var u, v;
    while (!u || !v) {
        u = Math.random();
        v = Math.random();
    }
    var x_N0_1 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return _mean + _standardDeviation * x_N0_1;
}
exports.normalRandom = normalRandom;
// get battle stats
function getAHP(entity, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var AHP = entity.base.AHP;
    var AHPBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.AHP : 0;
    var AHPDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.AHP : 0;
    return (AHP + AHPBuff - AHPDebuff) || 0;
}
exports.getAHP = getAHP;
function getDamage(entity, weapon, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var damageRange = weapon.Damage;
    var damageBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Damage : 0;
    var damageDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Damage : 0;
    return [damageRange[0] + damageBuff - damageDebuff, damageRange[1] + damageBuff - damageDebuff];
}
exports.getDamage = getDamage;
function getAcc(entity, weapon, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var acc = weapon.Acc;
    var accBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Acc : 0;
    var accDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Acc : 0;
    return (acc + accBuff - accDebuff) || 0;
}
exports.getAcc = getAcc;
function getDodge(entity, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var dodge = entity.base.Dodge;
    var dodgeBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Dodge : 0;
    var dodgeDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Dodge : 0;
    return (dodge + dodgeBuff - dodgeDebuff) || 0;
}
exports.getDodge = getDodge;
function getSpd(entity, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var spd = entity.base.Spd;
    var spdBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Spd : 0;
    var spdDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Spd : 0;
    return (spd + spdBuff - spdDebuff) || 0;
}
exports.getSpd = getSpd;
function getCrit(entity, weapon, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var crit = weapon.Crit;
    var critBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Crit : 0;
    var critDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Crit : 0;
    return (crit + critBuff - critDebuff) || 0;
}
exports.getCrit = getCrit;
function getLifesteal(entity, weapon, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var ls = weapon.lifesteal;
    var lsBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.lifesteal : 0;
    var lsDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.lifesteal : 0;
    return (ls + lsBuff - lsDebuff) || 0;
}
exports.getLifesteal = getLifesteal;
function getProt(entity, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var prot = entity.base.Prot;
    var protBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Prot : 0;
    var protDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Prot : 0;
    return (prot + protBuff - protDebuff) || 0;
}
exports.getProt = getProt;
function findLongArm(weapons) {
    return weapons.reduce(function (lR, thisWeapon) {
        if (thisWeapon.Range[1] > lR.Range[1])
            return thisWeapon;
        return lR;
    }, weapons[0]);
}
exports.findLongArm = findLongArm;
function findEqualCoordinate(_c, __c) {
    return _c.x === __c.x && _c.y === __c.y;
}
exports.findEqualCoordinate = findEqualCoordinate;
function getDistance(stat1, stat2) {
    var xDif = stat1.x - stat2.x;
    var yDif = stat1.y - stat2.y;
    return Math.sqrt((xDif) * (xDif) + (yDif) * (yDif));
}
exports.getDistance = getDistance;
function checkWithinDistance(weapon, distance) {
    var result = weapon.Range[0] <= distance && (weapon.Range[2] || weapon.Range[1]) >= distance;
    return result;
}
exports.checkWithinDistance = checkWithinDistance;
function getCoordsWithinRadius(radius, center, inclusive) {
    if (inclusive === void 0) { inclusive = true; }
    var result = [];
    // 1. find the range and domain
    var range = [center.y - radius, center.y + radius];
    var domain = [center.x - radius, center.x + radius];
    for (var x = Math.ceil(domain[0]); x <= Math.floor(domain[1]); x++) {
        var y = Math.sqrt(Math.pow(radius, 2) - Math.pow((x - center.x), 2)) + center.y;
        var ny = -Math.sqrt(Math.pow(radius, 2) - Math.pow((x - center.x), 2)) + center.y;
        if (inclusive) {
            for (var innerY = Math.ceil(ny); innerY <= Math.floor(y); innerY++) {
                result.push({
                    x: x,
                    y: innerY,
                });
            }
        }
        else {
            result.push({
                x: x,
                y: Math.ceil(ny),
            }, {
                x: x,
                y: Math.floor(y),
            });
        }
    }
    for (var y = Math.ceil(range[0]); y <= Math.floor(range[1]); y++) {
        var x = Math.sqrt(Math.pow(radius, 2) - Math.pow((y - center.y), 2)) + center.x;
        var nx = -Math.sqrt(Math.pow(radius, 2) - Math.pow((y - center.y), 2)) + center.x;
        // Utility.log(`y: (${x}, ${y}) and (${nx}, ${y})`);
        if (inclusive) {
            for (var innerX = Math.ceil(nx); innerX <= Math.floor(x); innerX++) {
                result.push({
                    x: innerX,
                    y: y,
                });
            }
        }
        else {
            result.push({
                x: Math.floor(x),
                y: y,
            }, {
                x: Math.ceil(nx),
                y: y,
            });
        }
    }
    return result;
}
exports.getCoordsWithinRadius = getCoordsWithinRadius;
function getBuffStatusEffect(_buff) {
    return _buff + "Up";
}
exports.getBuffStatusEffect = getBuffStatusEffect;
function newWeapon(origin, modifier) {
    return Object.assign(__assign({}, origin), modifier);
}
exports.newWeapon = newWeapon;
function roundToDecimalPlace(_number, _decimalPlace) {
    if (_number === 0)
        return 0;
    var decimalPlace = _decimalPlace === undefined ?
        1 :
        Math.round(_decimalPlace);
    var decimal = Math.pow(10, decimalPlace);
    if (_decimalPlace === undefined) {
        var value = void 0;
        for (var i = 0; i < 25; i++) {
            var newDecimal = Math.pow(10, decimalPlace + i);
            value = Math.round((_number + Number.EPSILON) * newDecimal) / newDecimal;
            if (value !== 0) {
                break;
            }
        }
        return value;
    }
    else {
        return Math.round((_number + Number.EPSILON) * decimal) / decimal;
    }
}
exports.roundToDecimalPlace = roundToDecimalPlace;
function addHPBar(_maxValue, _nowValue, _maxBarProportion) {
    if (_maxBarProportion === void 0) { _maxBarProportion = Math.round(_maxValue); }
    var bar = '█';
    var line = '|';
    if (_maxValue < 0)
        _maxValue = 0;
    if (_nowValue < 0)
        _nowValue = 0;
    if (_nowValue > _maxValue)
        _nowValue = _maxValue;
    var maxValue = _maxValue * (_maxBarProportion / _maxValue);
    var nowValue = _nowValue * (_maxBarProportion / _maxValue);
    var blockCount = nowValue <= 0 ?
        0 :
        Math.round(nowValue);
    var lineCount = Math.round(maxValue) - blockCount;
    // debug("_maxBarProportion", _maxBarProportion);
    // debug("_maxValue", _maxValue);
    // debug("_nowValue", _nowValue);
    // debug("maxValue", maxValue);
    // debug("nowValue", nowValue);
    // debug("blockCount", blockCount);
    // debug("lineCount", lineCount);
    var result = '';
    for (var i = 0; i < blockCount; i++) {
        result += bar;
    }
    for (var i = 0; i < lineCount; i++) {
        result += line;
    }
    return result;
}
exports.addHPBar = addHPBar;
function startDrawing(width, height) {
    var canvas = new canvas_1.Canvas(width, height);
    return {
        canvas: canvas,
        ctx: canvas.getContext('2d'),
    };
}
exports.startDrawing = startDrawing;
function getCanvasCoordsFromBattleCoord(_c, _pixelsPerTile, _maxHeight, _shiftToMiddle) {
    if (_shiftToMiddle === void 0) { _shiftToMiddle = true; }
    return {
        x: _c.x * _pixelsPerTile + (_pixelsPerTile / 2 * Number(_shiftToMiddle)),
        y: (_maxHeight - _c.y - 1) * _pixelsPerTile + (_pixelsPerTile / 2 * Number(_shiftToMiddle))
    };
}
exports.getCanvasCoordsFromBattleCoord = getCanvasCoordsFromBattleCoord;
function returnGridCanvas(_h, _w, _gridPixels, groundImage) {
    if (_h === void 0) { _h = 9; }
    if (_w === void 0) { _w = 9; }
    if (_gridPixels === void 0) { _gridPixels = 500; }
    var canvas = new canvas_1.Canvas(_w * _gridPixels, _h * _gridPixels);
    var ctx = canvas.getContext('2d');
    if (groundImage) {
        ctx.drawImage(groundImage, 0, 0, _w * _gridPixels, _h * _gridPixels);
    }
    else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, _w * _gridPixels, _h * _gridPixels);
    }
    ctx.strokeStyle = 'black';
    ctx.lineWidth = _gridPixels / 50;
    ctx.beginPath();
    for (var i = 1; i < _h; i++) {
        ctx.moveTo(0, i * _gridPixels);
        ctx.lineTo(_w * _gridPixels, i * _gridPixels);
    }
    for (var i = 1; i < _w; i++) {
        ctx.moveTo(i * _gridPixels, 0);
        ctx.lineTo(i * _gridPixels, _h * _gridPixels);
    }
    ctx.stroke();
    return canvas;
}
exports.returnGridCanvas = returnGridCanvas;
function counterAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
}
exports.counterAxis = counterAxis;
function getDirection(axis, moveMagnitude) {
    var direction = axis === 'x' ? Math.sign(moveMagnitude) > 0 ? "right" : "left" : Math.sign(moveMagnitude) > 0 ? "up" : "down";
    return direction;
}
exports.getDirection = getDirection;
function getMoveAction(_stat, args2, _round, args4) {
    var movetype = "Move";
    var moveAction = {
        executed: false,
        type: movetype,
        from: _stat,
        affected: _stat,
        readiness: 0,
        sword: 0,
        shield: 0,
        sprint: Number(_stat.moved),
        round: _round,
        priority: 4178,
        axis: 'x',
        magnitude: 0,
    };
    var args2_isAction = typeof args2 === 'string'; // args2: string, args4: number
    var args2_isMagnitude = typeof args2 === 'number'; // args2: number, args4: "x" | "y"
    if (args2_isAction) {
        var action = args2;
        var moveMagnitude = args4;
        var translated = directionToMagnitudeAxis(action);
        moveAction.axis = translated.axis;
        moveAction.magnitude = translated.magnitude * moveMagnitude;
    }
    else if (args2_isMagnitude) {
        var moveMagnitude = args2;
        var axis = args4;
        moveAction.readiness = Battle_1.Battle.MOVE_READINESS * Math.abs(moveMagnitude);
        moveAction.axis = axis;
        moveAction.magnitude = moveMagnitude;
    }
    moveAction.readiness = Math.abs(moveAction.magnitude * Battle_1.Battle.MOVE_READINESS);
    return moveAction;
}
exports.getMoveAction = getMoveAction;
function getLootAction(_stat, _c, _round) {
    return {
        x: _c.x,
        y: _c.y,
        round: _round,
        priority: 0,
        from: _stat,
        affected: _stat,
        readiness: 0,
        type: 'Loot',
        executed: false,
        sword: 0,
        shield: 0,
        sprint: 0,
    };
}
exports.getLootAction = getLootAction;
function numericDirectionToDirection(_numericDir) {
    switch (_numericDir) {
        case typedef_1.NumericDirection.down:
            return "down";
        case typedef_1.NumericDirection.up:
            return "up";
        case typedef_1.NumericDirection.right:
            return "right";
        case typedef_1.NumericDirection.left:
            return "left";
    }
}
exports.numericDirectionToDirection = numericDirectionToDirection;
function directionToNumericDirection(_direction) {
    switch (_direction) {
        case "down":
            return typedef_1.NumericDirection.down;
        case "up":
            return typedef_1.NumericDirection.up;
        case "right":
            return typedef_1.NumericDirection.right;
        case "left":
            return typedef_1.NumericDirection.left;
    }
}
exports.directionToNumericDirection = directionToNumericDirection;
function replaceCharacterAtIndex(_string, _replace, _index) {
    return _string.substring(0, _index) + _replace + _string.substring(_index + 1, _string.length);
}
exports.replaceCharacterAtIndex = replaceCharacterAtIndex;
function directionToEmoji(_direction) {
    var direction = Number.isInteger(_direction) ?
        numericDirectionToDirection(_direction) :
        _direction;
    switch (direction) {
        case "down":
            return "⏬";
        case "up":
            return "⏫";
        case "left":
            return "⬅️";
        case "right":
            return "➡️";
    }
}
exports.directionToEmoji = directionToEmoji;
function directionToMagnitudeAxis(_direction) {
    var magnitude, axis;
    if (typeof _direction === 'number') {
        _direction = numericDirectionToDirection(_direction);
    }
    switch (_direction) {
        // move vertically
        case "up":
            magnitude = 1;
            axis = 'y';
            break;
        case "down":
            magnitude = -1;
            axis = 'y';
            break;
        // move horizontally
        case "right":
            magnitude = 1;
            axis = 'x';
            break;
        case "left":
            magnitude = -1;
            axis = 'x';
            break;
        default:
            throw Error("Fatal error at getMoveAction: invalid actionName is invalid.");
    }
    return {
        magnitude: magnitude,
        axis: axis,
    };
}
exports.directionToMagnitudeAxis = directionToMagnitudeAxis;
function getAttackAction(_attacker, _victim, _weapon, _coord, _round) {
    var actionType = "Attack";
    var attackAction = {
        executed: false,
        type: actionType,
        from: _attacker,
        affected: _victim,
        readiness: _weapon.Readiness,
        sword: _weapon.sword,
        shield: _weapon.shield,
        sprint: _weapon.sprint,
        round: _round,
        priority: 4178,
        weapon: _weapon,
        coordinate: _coord
    };
    return attackAction;
}
exports.getAttackAction = getAttackAction;
function Test() {
    return __awaiter(this, void 0, void 0, function () {
        var data, i;
        return __generator(this, function (_a) {
            data = jsons_1.enemiesData["Crystal Zombie"].lootInfo;
            for (i = 0; i < 1000; i++) {
                log(uniformRandom(Number.EPSILON, 1));
            }
            return [2 /*return*/];
        });
    });
}
exports.Test = Test;
function findReferenceAngle(_angle) {
    var angle = Math.abs(_angle);
    if (angle <= 90) {
        return angle;
    }
    else if (angle <= 180) {
        return 180 - angle;
    }
    else if (angle <= 270) {
        return angle - 180;
    }
    else if (angle <= 360) {
        return 360 - angle;
    }
    return findReferenceAngle(angle - 360);
}
exports.findReferenceAngle = findReferenceAngle;
function setUpInteractionCollect(msg, cb, collectCount) {
    if (collectCount === void 0) { collectCount = 1; }
    var interCollectr = new discord_js_1.InteractionCollector(__1.BotClient, { message: msg, max: collectCount });
    interCollectr.on('collect', cb);
    return interCollectr;
}
exports.setUpInteractionCollect = setUpInteractionCollect;
function getSelectMenuActionRow(options, customID) {
    var menu = new discord_js_1.MessageSelectMenu({
        options: options,
        customId: customID || "null",
    });
    var messageActionRow = new discord_js_1.MessageActionRow({ components: [menu] });
    return messageActionRow;
}
exports.getSelectMenuActionRow = getSelectMenuActionRow;
function getButtonsActionRow(_btnOptions) {
    var buttons = [];
    for (var i = 0; i < _btnOptions.length; i++) {
        var btnOption = _btnOptions[i];
        buttons.push(new discord_js_1.MessageButton(btnOption));
    }
    var messageActionRow = new discord_js_1.MessageActionRow({
        components: buttons
    });
    return messageActionRow;
}
exports.getButtonsActionRow = getButtonsActionRow;
function clearChannel(channel, afterMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var options;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = {
                        after: afterMessage.id
                    };
                    return [4 /*yield*/, channel.messages.fetch(options)
                            .then(function (messages) {
                            var e_1, _a;
                            var _loop_1 = function (m) {
                                m.delete().catch(function () {
                                    if (m.deletable)
                                        m.delete().catch();
                                });
                            };
                            try {
                                for (var messages_1 = __values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
                                    var _d = __read(messages_1_1.value, 2), m = _d[1];
                                    _loop_1(m);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (messages_1_1 && !messages_1_1.done && (_a = messages_1.return)) _a.call(messages_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.clearChannel = clearChannel;
function sendToSandbox(mo) {
    return __awaiter(this, void 0, void 0, function () {
        var channel;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __1.BotClient.channels.fetch("882231564715560991").then(function (c) { return c; })];
                case 1:
                    channel = _a.sent();
                    return [4 /*yield*/, channel.send(mo)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.sendToSandbox = sendToSandbox;
function extractActions(action) {
    var aAction = action;
    var mAction = action;
    return { aAction: aAction, mAction: mAction };
}
exports.extractActions = extractActions;
function getConditionalTexts(text, condition) {
    return condition ?
        text :
        '';
}
exports.getConditionalTexts = getConditionalTexts;
function getWithSign(number) {
    return getConditionalTexts("+", number > 0) + getConditionalTexts("-", number < 0) + ("" + Math.abs(number));
}
exports.getWithSign = getWithSign;
function getActionsTranslate(array) {
    var translatedArray = [];
    for (var i = 0; i < array.length; i++) {
        var action = array[i];
        var _a = extractActions(action), aAction = _a.aAction, mAction = _a.mAction;
        var string = action.type;
        if (action.type === 'Attack') {
            string += " \"" + action.affected.base.class + "\" (" + action.affected.index + ") with \"" + aAction.weapon.Name + "\".";
        }
        else if (action.type === 'Move') {
            string += " " + mAction.magnitude + " " + getDirection(mAction.axis, mAction.magnitude) + ".";
        }
        translatedArray.push(string);
    }
    return translatedArray;
}
exports.getActionsTranslate = getActionsTranslate;
function getLoadingEmbed() {
    var url = "https://cdn.discordapp.com/attachments/571180142500511745/829109314668724234/ajax-loader.gif";
    var loadingEmbed = new discord_js_1.MessageEmbed()
        .setAuthor("Wait a while.", url, url)
        .setTitle("Now Loading...");
    return loadingEmbed;
}
exports.getLoadingEmbed = getLoadingEmbed;
function getWeaponEmbed(_weapon) {
    var mWeaponDamage = _weapon.Damage;
    var mWeaponAcc = _weapon.Acc;
    var mWeaponRange = _weapon.Range;
    var mWeaponReadiness = _weapon.Readiness;
    var embed = new discord_js_1.MessageEmbed({
        title: _weapon.Name,
        fields: [],
    });
    if (_weapon.desc) {
        embed.description = _weapon.desc;
    }
    // friendly skill: Readiness, Range, Token Requirements
    // aggressive skill: everything
    switch (_weapon.targetting.target) {
        case typedef_1.WeaponTarget.enemy:
            var damageField = {
                name: "Damage",
                value: mWeaponDamage[0] + " - " + mWeaponDamage[1],
                inline: false,
            };
            var accField = {
                name: "Accuracy",
                value: "" + mWeaponAcc,
                inline: false,
            };
            var critField = {
                name: "Critical Chance",
                value: "+" + _weapon.Crit + "%",
                inline: false,
            };
            embed.fields.push(damageField, accField, critField);
        case typedef_1.WeaponTarget.ally:
            var rangeField = {
                name: "Range",
                value: mWeaponRange[0] + " - " + mWeaponRange[1],
                inline: false,
            };
            var readinessField = {
                name: "Readiness",
                value: "" + mWeaponReadiness,
                inline: false,
            };
            var tokensField = {
                name: "Tokens",
                value: "" + typedef_1.EMOJI_SWORD.repeat(_weapon.sword) + typedef_1.EMOJI_SHIELD.repeat(_weapon.shield) + typedef_1.EMOJI_SPRINT.repeat(_weapon.sprint) || "(no token requirement)",
                inline: false,
            };
            embed.fields.push(rangeField, readinessField, tokensField);
            break;
    }
    return embed;
}
exports.getWeaponEmbed = getWeaponEmbed;
function getStatsEmbed(_class) {
    var embed = new discord_js_1.MessageEmbed();
    var classChosen = getNewObject(jsons_1.classData[_class]);
    for (var i = 0; i < Object.keys(typedef_1.StatMaximus).length; i++) {
        var statName = Object.keys(typedef_1.StatMaximus)[i];
        embed.fields.push({
            name: statName + " (" + classChosen[statName] + "/" + typedef_1.StatMaximus[statName] + ")",
            value: "`" + addHPBar(typedef_1.StatMaximus[statName], classChosen[statName], 20) + "`",
            inline: false,
        });
    }
    return embed;
}
exports.getStatsEmbed = getStatsEmbed;
function getCompass(focus, other) {
    return { x: Math.sign(other.x - focus.x), y: Math.sign(other.y - focus.y) };
}
exports.getCompass = getCompass;
function getPyTheorem(a, b) {
    return Math.sqrt(a * a + b * b);
}
exports.getPyTheorem = getPyTheorem;
function dealWithAccolade(clashResult, attacker, defender) {
    var CR_damage = clashResult.damage;
    var CR_u_damage = clashResult.u_damage;
    var CR_fate = clashResult.fate;
    var CR_roll = clashResult.roll;
    var attackerTAcco = attacker.accolades;
    var targetTAcco = defender.accolades;
    if (attacker.botType === typedef_1.BotType.naught) {
        // kill count
        if (defender.HP > 0 && defender.HP - CR_damage <= 0)
            attackerTAcco.kill++;
        // crit no
        if (CR_fate === 'Crit')
            attackerTAcco.critNo++;
        // damage dealt
        attackerTAcco.damageDealt += CR_damage;
        if (CR_roll !== null) {
            // roll average
            attackerTAcco.rollAverage = (attackerTAcco.rollAverage * attackerTAcco.clashNo + CR_roll) / (attackerTAcco.clashNo + 1);
            attackerTAcco.clashNo++;
        }
    }
    if (defender.botType === typedef_1.BotType.naught) {
        // damage taken
        targetTAcco.damageTaken += CR_damage;
        // damage absorbed
        targetTAcco.absorbed += CR_u_damage - CR_damage;
        // dodge count
        if (CR_fate === 'Miss')
            targetTAcco.dodged++;
        // clash count
        if (CR_roll !== null) {
            targetTAcco.clashNo++;
        }
    }
}
exports.dealWithAccolade = dealWithAccolade;
function getNewObject(origin, _mod) {
    var mod = (_mod || {});
    return Object.assign(__assign({}, origin), mod);
}
exports.getNewObject = getNewObject;
function arrayGetLastElement(array) {
    if (array.length < 1)
        return array[0];
    return array[array.length - 1];
}
exports.arrayGetLastElement = arrayGetLastElement;
function arrayGetLargestInArray(array, _getValue) {
    return array.reduce(function (la, c) {
        return _getValue(la) < _getValue(c) ?
            c :
            la;
    }, array[0]);
}
exports.arrayGetLargestInArray = arrayGetLargestInArray;
function arrayRemoveItemArray(_array, _item) {
    var index = _array.indexOf(_item);
    if (index !== undefined) {
        _array.splice(index, 1);
    }
    return index !== undefined;
}
exports.arrayRemoveItemArray = arrayRemoveItemArray;
function arrayGetRandom(array) {
    return array[uniformRandom(0, array.length - 1)];
}
exports.arrayGetRandom = arrayGetRandom;
function getWeaponUses(weapon, owner) {
    return owner.weaponUses[getWeaponIndex(weapon, owner)];
}
exports.getWeaponUses = getWeaponUses;
function printCSMap(map) {
    log("===================================");
    map.forEach(function (v, k) {
        var _a = { x: k.split(',')[0], y: k.split(',')[1] }, x = _a.x, y = _a.y;
        log(x + ", " + y + "     |      " + v.base.class);
    });
    log("===================================");
}
exports.printCSMap = printCSMap;
function getMapFromCS(coordStat) {
    var e_2, _a, e_3, _d;
    var mapReturn = new Map();
    try {
        for (var _f = __values(Object.values(coordStat)), _g = _f.next(); !_g.done; _g = _f.next()) {
            var yStat = _g.value;
            try {
                for (var _j = (e_3 = void 0, __values(Object.values(yStat))), _k = _j.next(); !_k.done; _k = _j.next()) {
                    var stat = _k.value;
                    mapReturn.set(getCoordString(stat), getStat(stat));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_k && !_k.done && (_d = _j.return)) _d.call(_j);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return mapReturn;
}
exports.getMapFromCS = getMapFromCS;
function getCSFromMap(map) {
    var CSreturn = {};
    map.forEach(function (_stat, _coordString) {
        var _a = { x: _coordString.split(',')[0], y: _coordString.split(',')[1] }, x = _a.x, y = _a.y;
        if (CSreturn[x] === undefined) {
            CSreturn[x] = {};
        }
        CSreturn[x][y] = _stat;
    });
    return CSreturn;
}
exports.getCSFromMap = getCSFromMap;
function getEmptyAccolade() {
    return {
        kill: 0,
        damageDealt: 0,
        healingDone: 0,
        absorbed: 0,
        damageTaken: 0,
        dodged: 0,
        critNo: 0,
        clashNo: 0,
        rollAverage: 0,
        rollNo: 0,
    };
}
exports.getEmptyAccolade = getEmptyAccolade;
function getWeaponIndex(weapon, stat) {
    return stat.base.weapons.indexOf(weapon);
}
exports.getWeaponIndex = getWeaponIndex;
function getBaseClassStat(className) {
    return getNewObject(jsons_1.classData[className]);
}
exports.getBaseClassStat = getBaseClassStat;
function getBaseEnemyStat(enemyClassName) {
    return getNewObject(jsons_1.enemiesData[enemyClassName]);
}
exports.getBaseEnemyStat = getBaseEnemyStat;
function getEmptyBuff() {
    return {
        AHP: 0,
        Damage: 0,
        Acc: 0,
        Dodge: 0,
        Crit: 0,
        Prot: 0,
        Spd: 0,
        lifesteal: 0,
    };
}
exports.getEmptyBuff = getEmptyBuff;
function getStat(_arg0, _owner) {
    if (_owner === void 0) { _owner = ''; }
    var _a = (function () {
        var _b, _s;
        if (typeof _arg0 === 'string') {
            var _c = _arg0;
            _b = getBaseClassStat(_c);
            _s = {
                class: _c,
                team: jsons_1.classData[_c] ?
                    'player' :
                    'enemy',
                botType: typedef_1.BotType.naught,
                x: 0,
                y: 0,
            };
        }
        else {
            _b = 'team' in _arg0 ?
                getNewObject(jsons_1.classData[_arg0.class], _arg0) :
                _arg0;
            _s = _arg0;
        }
        return {
            base: _b,
            ss: _s,
        };
    })(), base = _a.base, ss = _a.ss;
    // add universal weapons
    for (var i = 0; i < Object.keys(jsons_1.universalWeaponsData).length; i++) {
        var universalWeaponName = Object.keys(jsons_1.universalWeaponsData)[i];
        var uniWeapon = getNewObject(jsons_1.universalWeaponsData[universalWeaponName]);
        base.weapons.push(uniWeapon);
    }
    var endStat = {
        base: base,
        index: -1,
        name: "" + base.class,
        weaponUses: [],
        actionsAssociatedStrings: {},
        statusEffects: [],
        HP: base.AHP,
        readiness: 0,
        moved: false,
        sword: 0,
        shield: 0,
        sprint: 0,
        owner: _owner,
        username: _owner,
        team: ss.team === undefined ?
            _owner ?
                "player" :
                "enemy" :
            ss.team,
        botType: ss.botType || (_owner ?
            typedef_1.BotType.naught :
            typedef_1.BotType.approach_attack),
        accolades: getEmptyAccolade(),
        buffs: getEmptyBuff(),
        debuffs: getEmptyBuff(),
        x: ss.x,
        y: ss.y,
        pvp: false,
    };
    for (var i = 0; i < base.weapons.length; i++) {
        endStat.weaponUses.push(0);
    }
    return endStat;
}
exports.getStat = getStat;
function getCoordString(coord) {
    return coord.x + "," + coord.y;
}
exports.getCoordString = getCoordString;
function getRandomCode(length) {
    if (length === void 0) { length = 5; }
    var codeArray = [];
    for (var i = 0; i < length; i++) {
        codeArray.push("" + uniformRandom(0, 9));
    }
    return codeArray.join('');
}
exports.getRandomCode = getRandomCode;
function dealWithAction(action, attCB, movCB) {
    return __awaiter(this, void 0, void 0, function () {
        var moveAction, attackAction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    moveAction = action;
                    attackAction = action;
                    if (!(moveAction.type === 'Move')) return [3 /*break*/, 2];
                    return [4 /*yield*/, movCB(moveAction)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(attackAction.type === 'Attack')) return [3 /*break*/, 4];
                    return [4 /*yield*/, attCB(attackAction)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.dealWithAction = dealWithAction;
function printAction(_action) {
    dealWithAction(_action, function (aA) {
        log(aA.type + " || readiness=" + aA.readiness + " | affected=" + aA.affected.index + " | from=" + aA.from.index + " | weapon=" + aA.weapon.Name);
    }, function (mA) {
        log(mA.type + " || readiness=" + mA.readiness + " | affected=" + mA.affected.index + " | from=" + mA.from.index + " | magnitude=" + mA.magnitude + " | axis=" + mA.axis);
    });
}
exports.printAction = printAction;
function getDeathEmbed() {
    return new discord_js_1.MessageEmbed()
        .setImage('https://i.ytimg.com/vi/Kr9rIx7MVvg/maxresdefault.jpg')
        .setThumbnail('https://i.imgur.com/iUgLdX2.png2')
        .setTitle("*\"" + typedef_1.deathQuotes[uniformRandom(0, typedef_1.deathQuotes.length - 1)] + "\"*")
        .setAuthor(typedef_1.preludeQuotes[uniformRandom(0, typedef_1.preludeQuotes.length - 1)])
        .setColor("#530000");
}
exports.getDeathEmbed = getDeathEmbed;
function handleTokens(changeToken, changingFunction) {
    if (changeToken.sword !== undefined) {
        changingFunction(changeToken.sword, "sword");
    }
    if (changeToken.shield !== undefined) {
        changingFunction(changeToken.shield, "shield");
    }
    if (changeToken.sprint !== undefined) {
        changingFunction(changeToken.sprint, "sprint");
    }
}
exports.handleTokens = handleTokens;
function getNewNode(_x, _y, _destination, _distanceTravelled) {
    if (_distanceTravelled === void 0) { _distanceTravelled = 0; }
    var desC = Math.abs(_x - _destination.x) + Math.abs(_y - _destination.y);
    var totalC = _distanceTravelled + desC;
    var object = {
        x: _x,
        y: _y,
        lastNode: null,
        nextNode: null,
        distanceTravelled: _distanceTravelled,
        distanceToDestination: desC,
        totalCost: totalC,
    };
    return object;
}
exports.getNewNode = getNewNode;
function shortenString(_s, _length) {
    if (_length === void 0) { _length = 2048; }
    var array = _s.split('');
    while (array.length > _length) {
        array.pop();
    }
    return array.join('');
}
exports.shortenString = shortenString;
function drawText(_ctx, _text, _textSize, _canvasCoord, _angle) {
    if (_angle === void 0) { _angle = 0; }
    // log(`\tDrawing "${_text}" at ${JSON.stringify(_canvasCoord)} (angle: ${_angle})`)
    var textSize = Math.round(_textSize);
    _ctx.save();
    _ctx.font = textSize + "px Verdana";
    _ctx.lineWidth = 0.5;
    _ctx.fillStyle = "white";
    _ctx.strokeStyle = "black";
    _ctx.textAlign = "center";
    _ctx.translate(_canvasCoord.x, _canvasCoord.y);
    var referenceAngle = findReferenceAngle(_angle);
    if (referenceAngle < 90) {
        _ctx.rotate(_angle);
    }
    _ctx.fillText(_text, 0, textSize / 3);
    _ctx.strokeText(_text, 0, textSize / 3);
    _ctx.restore();
}
exports.drawText = drawText;
function drawCircle(_ctx, _canvasCoord, _radius, _stroke, _percentage) {
    if (_stroke === void 0) { _stroke = true; }
    if (_percentage === void 0) { _percentage = 1; }
    _ctx.save();
    _ctx.closePath();
    _ctx.beginPath();
    _ctx.arc(_canvasCoord.x, _canvasCoord.y, _radius, 0, Math.PI * 2 * _percentage);
    if (_stroke) {
        _ctx.stroke();
    }
    else {
        _ctx.fill();
    }
    _ctx.closePath();
    _ctx.restore();
}
exports.drawCircle = drawCircle;
function sendInvitation(_user_id, _from, channel) {
    return __awaiter(this, void 0, void 0, function () {
        var inviterUser, _a, user, _d;
        var _this = this;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!_from.avatar) return [3 /*break*/, 1];
                    _a = _from;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, __1.BotClient.users.fetch(_from).then(function (u) { return u; }).catch(function () { return undefined; })];
                case 2:
                    _a = _f.sent();
                    _f.label = 3;
                case 3:
                    inviterUser = _a;
                    if (!_user_id.avatar) return [3 /*break*/, 4];
                    _d = _user_id;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, __1.BotClient.users.fetch(_user_id).then(function (u) { return u; }).catch(function () { return undefined; })];
                case 5:
                    _d = _f.sent();
                    _f.label = 6;
                case 6:
                    user = _d;
                    return [2 /*return*/, new Promise(function (resolve) {
                            if (user && inviterUser) {
                                var buttonOptions = [
                                    {
                                        label: "Accept",
                                        style: "SUCCESS",
                                        customId: "accept"
                                    },
                                    {
                                        label: "Decline",
                                        style: "DANGER",
                                        customId: "decline"
                                    },
                                ];
                                var messagePayload = {
                                    embeds: [
                                        new discord_js_1.MessageEmbed({
                                            title: "You have been invited!",
                                            footer: {
                                                text: "...by " + (inviterUser === null || inviterUser === void 0 ? void 0 : inviterUser.username),
                                                iconURL: inviterUser.displayAvatarURL() || inviterUser.defaultAvatarURL,
                                                icon_url: inviterUser.displayAvatarURL() || inviterUser.defaultAvatarURL,
                                            }
                                        })
                                    ],
                                    components: [getButtonsActionRow(buttonOptions)],
                                };
                                user.send(messagePayload)
                                    .then(function (_m) {
                                    var buttonInteractionCollection = setUpInteractionCollect(_m, function (itr) { return __awaiter(_this, void 0, void 0, function () {
                                        var selectedButton;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!(itr.isButton() && itr.user.id === user.id)) return [3 /*break*/, 2];
                                                    clearTimeout(timeOut);
                                                    selectedButton = itr.customId;
                                                    if (selectedButton === "accept") {
                                                        resolve(true);
                                                    }
                                                    else {
                                                        resolve(false);
                                                    }
                                                    _m.delete();
                                                    return [4 /*yield*/, itr.reply({
                                                            content: selectedButton === "accept" ?
                                                                "Accepted." :
                                                                "Declined."
                                                        })];
                                                case 1:
                                                    _a.sent();
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    // timeout: done checking round
                                    var timeOut = setTimeout(function () {
                                        buttonInteractionCollection.stop();
                                        _m.delete();
                                        resolve(false);
                                    }, 15 * 1000);
                                })
                                    .catch(function (_e) {
                                    log(_e);
                                    resolve(null);
                                });
                            }
                        })];
            }
        });
    });
}
exports.sendInvitation = sendInvitation;
function breadthFirstSearch(_startingRoom, _extender, _pushToQueueCondition, _pushToResultCondition) {
    var result = [];
    var queue = [_startingRoom];
    var exploredRooms = [];
    // branch out and seek
    var currentRoom = queue.shift();
    while (currentRoom) {
        var extension = _extender(currentRoom);
        for (var i = 0; i < extension.length; i++) {
            var r = extension[i];
            if (r && !exploredRooms.includes(r)) {
                exploredRooms.push(r);
                if (_pushToQueueCondition(queue, currentRoom)) {
                    queue.push(r);
                }
            }
        }
        if (_pushToResultCondition(currentRoom)) {
            result.push(currentRoom);
        }
        currentRoom = queue.shift();
    }
    return result;
}
exports.breadthFirstSearch = breadthFirstSearch;
function getGradeTag(_mI) {
    switch (_mI.grade) {
        case typedef_1.MaterialGrade.poor:
            return 'Poor';
        case typedef_1.MaterialGrade.common:
            return 'Common';
        case typedef_1.MaterialGrade.good:
            return '𝑮𝒐𝒐𝒅';
        case typedef_1.MaterialGrade.rare:
            return '𝐑𝐚𝐫𝐞';
        case typedef_1.MaterialGrade.very_rare:
            return '𝔙𝔢𝔯𝔶 ℜ𝔞𝔯𝔢';
        case typedef_1.MaterialGrade.very_very_rare:
            return '𝔙𝔢𝔯𝔶 𝔙𝔢𝔯𝔶 ℜ𝔞𝔯𝔢';
        case typedef_1.MaterialGrade.unique:
            return '𝔘𝔫𝔦𝔮𝔲𝔢';
        case typedef_1.MaterialGrade.epic:
            return '𝕰𝖕𝖎𝖈';
        case typedef_1.MaterialGrade.mythical:
            return '𝕸𝖞𝖙𝖍𝖎𝖈𝖆𝖑';
        case typedef_1.MaterialGrade.legendary:
            return '𝕃𝕖𝕘𝕖𝕟𝕕𝕒𝕣𝕪';
        case typedef_1.MaterialGrade.god:
            return '𝔾 𝕠 𝕕';
    }
}
exports.getGradeTag = getGradeTag;
function getItemType(_i) {
    var e_4, _a, e_5, _d;
    // log(`Get item type for: ${_i.name}`)
    var weight = _i.weight;
    try {
        for (var _f = __values(Object.entries(jsons_1.itemData)), _g = _f.next(); !_g.done; _g = _f.next()) {
            var _j = __read(_g.value, 2), _itemName = _j[0], _data = _j[1];
            // debug("Qualifying for", _itemName);
            var itemName = _itemName;
            var data = _data;
            var qualification = data.qualification;
            /** weight qualification */
            var _k = qualification.weightDeviation, min = _k.min, max = _k.max;
            if (min <= weight && max >= weight) {
                /** materials qualification */
                var passed = 0;
                var _loop_2 = function (_materialInfo) {
                    var material = _materialInfo.materialName;
                    var mI = _i.materialInfo.find(function (_mI) { return _mI.materialName === material; }) ||
                        null;
                    // debug("\t\tTesting for", {
                    //     name: mI?.materialName,
                    //     occupation: mI?.occupation,
                    // });
                    var _p = _materialInfo.occupationDeviation, min_1 = _p.min, max_1 = _p.max;
                    if (mI && mI.occupation >= min_1 && mI.occupation <= max_1) {
                        // log("\t\tQualified!");
                        passed++;
                    }
                };
                try {
                    for (var _l = (e_5 = void 0, __values(qualification.materials)), _o = _l.next(); !_o.done; _o = _l.next()) {
                        var _materialInfo = _o.value;
                        _loop_2(_materialInfo);
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_o && !_o.done && (_d = _l.return)) _d.call(_l);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                if (passed === qualification.materials.length) {
                    // log("\tPassed!\n===================");
                    return itemName;
                }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return null;
}
exports.getItemType = getItemType;
