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
exports.sendToSandbox = exports.clearChannel = exports.getButtonsActionRow = exports.getSelectMenuActionRow = exports.setUpConfirmationInteractionCollect = exports.setUpInteractionCollect = exports.findReferenceAngle = exports.Test = exports.getAttackAction = exports.directionToMagnitudeAxis = exports.directionToEmoji = exports.replaceCharacterAtIndex = exports.directionToNumericDirection = exports.numericDirectionToDirection = exports.getLootAction = exports.getMoveAction = exports.getDirection = exports.counterAxis = exports.returnGridCanvas = exports.getCanvasCoordsFromBattleCoord = exports.startDrawing = exports.addHPBar = exports.roundToDecimalPlace = exports.newWeapon = exports.getBuffStatusEffect = exports.getCoordsWithinRadius = exports.checkWithinDistance = exports.getAttackRange = exports.getDistance = exports.findEqualCoordinate = exports.findLongArm = exports.getLifesteal = exports.getCrit = exports.getExecutionSpeed = exports.getAcc = exports.getDamage = exports.getProt = exports.getDodge = exports.getAHP = exports.normalRandom = exports.average = exports.uniformRandom = exports.formalise = exports.capitalize = exports.extractCommands = exports.debug = exports.log = exports.stringifyRGBA = exports.normaliseRGBA = exports.clamp = void 0;
exports.getForgeWeaponAttackAbility = exports.getForgeWeaponMinMax = exports.getForgeWeaponType = exports.getItemType = exports.getInventorySelectOptions = exports.getGradeTag = exports.breadthFirstSearch = exports.sendInvitation = exports.drawCircle = exports.drawText = exports.shortenString = exports.getNewNode = exports.handleTokens = exports.getDeathEmbed = exports.printAction = exports.dealWithAction = exports.getRandomCode = exports.getCoord = exports.getCoordString = exports.getStat = exports.getEmptyBuff = exports.getBaseEnemyStat = exports.getBaseClassStat = exports.getAbilityIndex = exports.getEmptyAccolade = exports.getCSFromMap = exports.getMapFromCS = exports.printCSMap = exports.getWeaponUses = exports.arrayGetRandom = exports.arrayRemoveItemArray = exports.arrayGetSmallestInArray = exports.arrayGetLargestInArray = exports.arrayGetLastElement = exports.getNewObject = exports.dealWithAccolade = exports.getPyTheorem = exports.getCompass = exports.getStatsEmbed = exports.getAbilityEmbed = exports.getForgeWeaponEmbed = exports.getLoadingEmbed = exports.getActionTranslate = exports.getClashCommentary = exports.getWithSign = exports.getConditionalTexts = exports.extractActions = void 0;
var canvas_1 = require("canvas");
var discord_js_1 = require("discord.js");
var __1 = require("..");
var typedef_1 = require("../typedef");
var Battle_1 = require("./Battle");
var jsons_1 = require("../jsons");
var Database_1 = require("./Database");
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
    for (var _d = 0; _d < arguments.length; _d++) {
        any[_d] = arguments[_d];
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
    for (var _d = 0; _d < arguments.length; _d++) {
        nums[_d] = arguments[_d];
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
// when attacked
function getAHP(_attacker, _options) {
    if (_options === void 0) { _options = 'WithBoth'; }
    var maxHP = _attacker.base.maxHP;
    var AHPBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.maxHP : 0;
    var AHPDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.maxHP : 0;
    return (maxHP + AHPBuff - AHPDebuff) || 0;
}
exports.getAHP = getAHP;
function getDodge(_attacker, _options) {
    if (_options === void 0) { _options = 'WithBoth'; }
    var dodge = _attacker.base.dodge;
    var dodgeBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.dodge : 0;
    var dodgeDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.dodge : 0;
    return (dodge + dodgeBuff - dodgeDebuff) || 0;
}
exports.getDodge = getDodge;
function getProt(_defender, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var equippedWeapon = _defender.equipped;
    var prot = _defender.base.protection;
    var protBuff = (options === 'WithBuff' || options === 'WithBoth') ? _defender.buffs.protection : 0;
    var protDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? _defender.debuffs.protection : 0;
    return (prot + protBuff - protDebuff) || 0;
}
exports.getProt = getProt;
// when attacking
function getDamage(_attacker, _ability, _options) {
    if (_options === void 0) { _options = 'WithBoth'; }
    var _fw = _attacker.equipped;
    var damageRange = _fw.damageRange;
    var damageBuff = (_options === 'WithBuff' || _options === 'WithBoth') ?
        _attacker.buffs.damageRange : 0;
    var damageDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ?
        _attacker.debuffs.damageRange : 0;
    var abilityScaling = _ability.damageScale;
    return {
        min: (damageRange.min * abilityScaling) + _ability.bonus.damage + damageBuff - damageDebuff,
        max: (damageRange.max * abilityScaling) + _ability.bonus.damage + damageBuff - damageDebuff,
    };
}
exports.getDamage = getDamage;
function getAcc(_attacker, _ability, options) {
    if (options === void 0) { options = 'WithBoth'; }
    var _fw = _attacker.equipped;
    var acc = _fw.accuracy;
    var accBuff = (options === 'WithBuff' || options === 'WithBoth') ? _attacker.buffs.accuracy : 0;
    var accDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? _attacker.debuffs.accuracy : 0;
    return (acc + _ability.bonus.accuracy + accBuff - accDebuff) || 0;
}
exports.getAcc = getAcc;
function getExecutionSpeed(_attacker, _ability, _options) {
    if (_options === void 0) { _options = 'WithBoth'; }
    var spd = _attacker.base.speed;
    var spdBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.speed : 0;
    var spdDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.speed : 0;
    return (_attacker.readiness + spd + spdBuff - spdDebuff) * _ability.speedScale || 0;
}
exports.getExecutionSpeed = getExecutionSpeed;
function getCrit(_attacker, _ability, _options) {
    if (_options === void 0) { _options = 'WithBoth'; }
    var weapon = _attacker.equipped;
    var crit = weapon.criticalHit;
    var critBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.criticalHit : 0;
    var critDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.criticalHit : 0;
    return (crit + critBuff + _ability.bonus.criticalHit - critDebuff) || 0;
}
exports.getCrit = getCrit;
function getLifesteal(_attacker, _ability, _options) {
    if (_options === void 0) { _options = 'WithBoth'; }
    var weapon = _attacker.equipped;
    var ls = weapon.lifesteal;
    var lsBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.lifesteal : 0;
    var lsDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.lifesteal : 0;
    return (ls + _ability.bonus.lifesteal + lsBuff - lsDebuff) || 0;
}
exports.getLifesteal = getLifesteal;
function findLongArm(_stat) {
    var abilities = _stat.base.abilities.map(function (_a) {
        if (_a.range) {
            return _a;
        }
        else {
            return getNewObject(_a, {
                range: _stat.equipped.range
            });
        }
    });
    return abilities.reduce(function (lR, thisWeapon) {
        if (thisWeapon.range && (lR === null || thisWeapon.range.max > lR.range.max)) {
            return thisWeapon;
        }
        else {
            return lR;
        }
    }, null);
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
function getAttackRange(_aA) {
    var _d;
    return ((_d = _aA.weapon) === null || _d === void 0 ? void 0 : _d.range) || _aA.ability.range || null;
}
exports.getAttackRange = getAttackRange;
function checkWithinDistance(_aA, distance) {
    var _d;
    var hasWeapon = _aA.weapon !== null;
    var abilityRange = (_d = _aA.ability) === null || _d === void 0 ? void 0 : _d.range;
    var range = hasWeapon && !abilityRange ?
        _aA.weapon.range :
        abilityRange;
    var result = range ?
        range.min <= distance && (range.radius || range.max) >= distance :
        false;
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
        attacker: _stat,
        target: _stat,
        readinessCost: 0,
        sword: 0,
        shield: 0,
        sprint: Number(_stat.moved),
        priority: getExecutionSpeed(_stat, { speedScale: 1 }),
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
        moveAction.readinessCost = Battle_1.Battle.MOVE_READINESS * Math.abs(moveMagnitude);
        moveAction.axis = axis;
        moveAction.magnitude = moveMagnitude;
    }
    moveAction.readinessCost = Math.abs(moveAction.magnitude * Battle_1.Battle.MOVE_READINESS);
    return moveAction;
}
exports.getMoveAction = getMoveAction;
function getLootAction(_stat, _c) {
    return {
        x: _c.x,
        y: _c.y,
        priority: getExecutionSpeed(_stat, { speedScale: 1 }),
        attacker: _stat,
        target: _stat,
        readinessCost: 0,
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
function getAttackAction(_attacker, _victim, _weapon, _ability, _coord) {
    var actionType = "Attack";
    var attackAction = {
        executed: false,
        type: actionType,
        attacker: _attacker,
        target: _victim,
        readinessCost: _ability.readinessCost,
        sword: _ability.sword,
        shield: _ability.shield,
        sprint: _ability.sprint,
        priority: getExecutionSpeed(_attacker, _ability),
        weapon: _weapon,
        ability: _ability,
        coordinate: _coord
    };
    return attackAction;
}
exports.getAttackAction = getAttackAction;
function Test() {
    return __awaiter(this, void 0, void 0, function () {
        var ud;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, Database_1.getUserData)("262871357455466496")];
                case 1:
                    ud = _d.sent();
                    return [2 /*return*/];
            }
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
    var interCollector = new discord_js_1.InteractionCollector(__1.BotClient, { message: msg, max: collectCount });
    interCollector.on('collect', cb);
    return interCollector;
}
exports.setUpInteractionCollect = setUpInteractionCollect;
function setUpConfirmationInteractionCollect(_editMsg, _embed, _yesCB, _noCB) {
    return __awaiter(this, void 0, void 0, function () {
        var yesNoCollector, buttonsOptions;
        var _this = this;
        return __generator(this, function (_d) {
            yesNoCollector = new discord_js_1.InteractionCollector(__1.BotClient, { message: _editMsg, max: 1 });
            buttonsOptions = [
                {
                    emoji: typedef_1.EMOJI_TICK,
                    label: "Yes",
                    style: "SUCCESS",
                    customId: "yes"
                },
                {
                    emoji: typedef_1.EMOJI_CROSS,
                    label: "No",
                    style: "DANGER",
                    customId: "no"
                }
            ];
            yesNoCollector.on('collect', function (_itr) { return __awaiter(_this, void 0, void 0, function () {
                var selected;
                return __generator(this, function (_d) {
                    if (_itr.isButton()) {
                        selected = _itr.customId;
                        switch (selected) {
                            case 'yes':
                                _yesCB(_itr);
                                break;
                            case 'no':
                                _noCB(_itr);
                                break;
                        }
                    }
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/, _editMsg.edit({
                    embeds: [_embed],
                    components: [getButtonsActionRow(buttonsOptions)],
                })];
        });
    });
}
exports.setUpConfirmationInteractionCollect = setUpConfirmationInteractionCollect;
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
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    options = {
                        after: afterMessage.id
                    };
                    return [4 /*yield*/, channel.messages.fetch(options)
                            .then(function (messages) {
                            var e_1, _d;
                            var _loop_1 = function (m) {
                                m.delete().catch(function () {
                                    if (m.deletable)
                                        m.delete().catch();
                                });
                            };
                            try {
                                for (var messages_1 = __values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
                                    var _f = __read(messages_1_1.value, 2), m = _f[1];
                                    _loop_1(m);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (messages_1_1 && !messages_1_1.done && (_d = messages_1.return)) _d.call(messages_1);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        })];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.clearChannel = clearChannel;
function sendToSandbox(mo) {
    return __awaiter(this, void 0, void 0, function () {
        var channel;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, __1.BotClient.channels.fetch("882231564715560991").then(function (c) { return c; })];
                case 1:
                    channel = _d.sent();
                    return [4 /*yield*/, channel.send(mo)];
                case 2: return [2 /*return*/, _d.sent()];
            }
        });
    });
}
exports.sendToSandbox = sendToSandbox;
function extractActions(action) {
    var aAction = action;
    var mAction = action;
    var lAction = action;
    return { aAction: aAction, mAction: mAction, lAction: lAction };
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
function getClashCommentary(_aA) {
    var returnString = '';
    if (_aA.clashResult) {
        var attacker = _aA.attacker, target = _aA.target, ability = _aA.ability;
        var _d = _aA.clashResult, fate = _d.fate, damage = _d.damage, u_damage = _d.u_damage;
        // weapon effect string
        returnString += _aA.abilityEffectString || '';
        // main chunk
        switch (ability.targetting.target) {
            case typedef_1.AbilityTargetting.enemy:
                var accDodge = (getAcc(attacker, ability) - getDodge(target));
                var hitRate = accDodge < 100 ?
                    roundToDecimalPlace(accDodge) :
                    100;
                var critRate = roundToDecimalPlace(accDodge * 0.1 + getCrit(attacker, ability));
                returnString +=
                    "__**" + ability.abilityName + "**__ " + hitRate + "% [" + critRate + "%]\n                **" + fate + "!** -**" + roundToDecimalPlace(damage) + "** (" + roundToDecimalPlace(u_damage) + ") [" + roundToDecimalPlace(target.HP) + " => " + roundToDecimalPlace(target.HP - damage) + "]";
                if (target.HP > 0 && target.HP - damage <= 0) {
                    returnString += "\n__**KILLING BLOW!**__";
                }
                break;
            case typedef_1.AbilityTargetting.ally:
                if (attacker.index === target.index) {
                    returnString +=
                        "**" + attacker.base.class + "** (" + attacker.index + ") Activates __*" + ability.abilityName + "*__";
                }
                else {
                    returnString +=
                        "**" + attacker.base.class + "** (" + attacker.index + ") \uD83D\uDEE1\uFE0F **" + target.base.class + "** (" + target.index + ")\n                    __*" + ability.abilityName + "*__";
                }
                break;
        }
        // healing
        // ...
    }
    return returnString;
}
exports.getClashCommentary = getClashCommentary;
function getActionTranslate(_action) {
    var _d = extractActions(_action), aAction = _d.aAction, mAction = _d.mAction;
    var string = '';
    var attacker = aAction.attacker, target = aAction.target, ability = aAction.ability;
    switch (_action.type) {
        case 'Attack':
            string +=
                typedef_1.EMOJI_SWORD + " " + attacker.base.class + " (" + attacker.index + ") uses __" + ability.abilityName + "__ on " + target.base.class + " (" + target.index + ").";
            string += "\n" + getClashCommentary(aAction);
            break;
        case 'Move':
            string +=
                typedef_1.EMOJI_SPRINT + " " + attacker.base.class + " (" + attacker.index + ") moves " + getDirection(mAction.axis, mAction.magnitude) + ".";
            break;
        case 'Loot':
            string +=
                typedef_1.EMOJI_MONEYBAG + " " + attacker.base.class + " (" + attacker.index + ") loots.";
            break;
    }
    string += " [\uD83C\uDF2C\uFE0F" + _action.priority + "]";
    return string;
}
exports.getActionTranslate = getActionTranslate;
function getLoadingEmbed() {
    var url = "https://cdn.discordapp.com/attachments/571180142500511745/829109314668724234/ajax-loader.gif";
    var loadingEmbed = new discord_js_1.MessageEmbed()
        .setAuthor("Wait a while.", url, url)
        .setTitle("Now Loading...");
    return loadingEmbed;
}
exports.getLoadingEmbed = getLoadingEmbed;
function getForgeWeaponEmbed(_fw) {
}
exports.getForgeWeaponEmbed = getForgeWeaponEmbed;
function getAbilityEmbed(_ability) {
    var damageScale = _ability.damageScale, staminaScale = _ability.staminaScale, readinessCost = _ability.readinessCost, speedScale = _ability.speedScale, range = _ability.range;
    var embed = new discord_js_1.MessageEmbed({
        title: _ability.abilityName,
        fields: [],
    });
    if (_ability.desc) {
        embed.description = _ability.desc;
    }
    // friendly skill: readinessCost, range, Token Requirements
    // aggressive skill: everything
    switch (_ability.targetting.target) {
        case typedef_1.AbilityTargetting.enemy:
            var damageField = {
                name: "Damage Scaling",
                value: "x" + damageScale * 100 + "%",
                inline: false,
            };
            var staminaCostField = {
                name: "Stamina Cost Scaling",
                value: "x" + staminaScale,
                inline: false,
            };
            var speedField = {
                name: "Speed Scaling",
                value: "x" + speedScale,
                inline: false,
            };
            embed.fields.push(damageField, staminaCostField, speedField);
        case typedef_1.AbilityTargetting.ally:
            var rangeField = {
                name: "range",
                value: range ?
                    range.min + " - " + range.max :
                    "( *Weapon Dependent* )",
                inline: false,
            };
            var readinessField = {
                name: "readinessCost",
                value: "" + readinessCost,
                inline: false,
            };
            var tokensField = {
                name: "Tokens",
                value: "" + typedef_1.EMOJI_SWORD.repeat(_ability.sword) + typedef_1.EMOJI_SHIELD.repeat(_ability.shield) + typedef_1.EMOJI_SPRINT.repeat(_ability.sprint) || "(no token requirement)",
                inline: false,
            };
            embed.fields.push(rangeField, readinessField, tokensField);
            break;
    }
    return embed;
}
exports.getAbilityEmbed = getAbilityEmbed;
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
        if (CR_fate === 'criticalHit')
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
function arrayGetSmallestInArray(array, _getValue) {
    return array.reduce(function (smallest, c) {
        return _getValue(smallest) > _getValue(c) ?
            c :
            smallest;
    }, array[0]);
}
exports.arrayGetSmallestInArray = arrayGetSmallestInArray;
function arrayRemoveItemArray(_array, _item) {
    var index = _array.indexOf(_item);
    if (index !== undefined) {
        _array.splice(index, 1);
    }
    return index !== undefined;
}
exports.arrayRemoveItemArray = arrayRemoveItemArray;
function arrayGetRandom(array) {
    return array[uniformRandom(0, array.length - 1)] === undefined ?
        null :
        array[uniformRandom(0, array.length - 1)];
}
exports.arrayGetRandom = arrayGetRandom;
function getWeaponUses(ability, owner) {
    return owner.weaponUses[getAbilityIndex(ability, owner)];
}
exports.getWeaponUses = getWeaponUses;
function printCSMap(map) {
    log("===================================");
    map.forEach(function (v, k) {
        var _d = { x: k.split(',')[0], y: k.split(',')[1] }, x = _d.x, y = _d.y;
        log(x + ", " + y + "     |      " + v.base.class);
    });
    log("===================================");
}
exports.printCSMap = printCSMap;
function getMapFromCS(coordStat) {
    return __awaiter(this, void 0, void 0, function () {
        var mapReturn, _d, _f, yStat, _g, _j, stat, _k, _l, _o, e_2_1, e_3_1;
        var e_3, _p, e_2, _r;
        return __generator(this, function (_u) {
            switch (_u.label) {
                case 0:
                    mapReturn = new Map();
                    _u.label = 1;
                case 1:
                    _u.trys.push([1, 12, 13, 14]);
                    _d = __values(Object.values(coordStat)), _f = _d.next();
                    _u.label = 2;
                case 2:
                    if (!!_f.done) return [3 /*break*/, 11];
                    yStat = _f.value;
                    _u.label = 3;
                case 3:
                    _u.trys.push([3, 8, 9, 10]);
                    _g = (e_2 = void 0, __values(Object.values(yStat))), _j = _g.next();
                    _u.label = 4;
                case 4:
                    if (!!_j.done) return [3 /*break*/, 7];
                    stat = _j.value;
                    _l = (_k = mapReturn).set;
                    _o = [getCoordString(stat)];
                    return [4 /*yield*/, getStat(stat)];
                case 5:
                    _l.apply(_k, _o.concat([_u.sent()]));
                    _u.label = 6;
                case 6:
                    _j = _g.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_2_1 = _u.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (_j && !_j.done && (_r = _g.return)) _r.call(_g);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 10:
                    _f = _d.next();
                    return [3 /*break*/, 2];
                case 11: return [3 /*break*/, 14];
                case 12:
                    e_3_1 = _u.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 14];
                case 13:
                    try {
                        if (_f && !_f.done && (_p = _d.return)) _p.call(_d);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/, mapReturn];
            }
        });
    });
}
exports.getMapFromCS = getMapFromCS;
function getCSFromMap(map) {
    var CSreturn = {};
    map.forEach(function (_stat, _coordString) {
        var _d = { x: _coordString.split(',')[0], y: _coordString.split(',')[1] }, x = _d.x, y = _d.y;
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
function getAbilityIndex(ability, stat) {
    return stat.base.abilities.indexOf(ability);
}
exports.getAbilityIndex = getAbilityIndex;
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
        maxHP: 0,
        damageRange: 0,
        accuracy: 0,
        dodge: 0,
        criticalHit: 0,
        protection: 0,
        speed: 0,
        lifesteal: 0,
    };
}
exports.getEmptyBuff = getEmptyBuff;
function getStat(_arg0, _owner) {
    if (_owner === void 0) { _owner = ''; }
    return __awaiter(this, void 0, void 0, function () {
        var _d, base, ss, i, universalWeaponName, uniWeapon, _f, i, fw, weaponUses, i;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _d = (function () {
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
                    })(), base = _d.base, ss = _d.ss;
                    // add universal weapons
                    for (i = 0; i < Object.keys(jsons_1.universalAbilitiesData).length; i++) {
                        universalWeaponName = Object.keys(jsons_1.universalAbilitiesData)[i];
                        uniWeapon = getNewObject(jsons_1.universalAbilitiesData[universalWeaponName]);
                        base.abilities.push(uniWeapon);
                    }
                    if (!_owner) return [3 /*break*/, 2];
                    _f = base;
                    return [4 /*yield*/, (0, Database_1.getEquippedForgeWeapon)(_owner)];
                case 1:
                    _f.arsenal = _g.sent();
                    _g.label = 2;
                case 2:
                    // add normal attacks for arsenal weapons
                    for (i = 0; i < base.arsenal.length; i++) {
                        fw = base.arsenal[i];
                        base.abilities.push(getForgeWeaponAttackAbility(fw));
                    }
                    weaponUses = [];
                    for (i = 0; i < base.abilities.length; i++) {
                        weaponUses.push(0);
                    }
                    return [2 /*return*/, {
                            base: base,
                            index: -1,
                            equipped: base.arsenal[0] || getNewObject(jsons_1.universalWeaponsData.Unarmed),
                            name: "" + base.class,
                            weaponUses: weaponUses,
                            statusEffects: [],
                            HP: base.maxHP,
                            stamina: base.maxStamina,
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
                        }];
            }
        });
    });
}
exports.getStat = getStat;
function getCoordString(coord) {
    return coord.x + "," + coord.y;
}
exports.getCoordString = getCoordString;
function getCoord(_coordString) {
    var c = _coordString.split(",");
    if (c.length === 2) {
        return {
            x: parseInt(c[0]),
            y: parseInt(c[1]),
        };
    }
    else {
        return null;
    }
}
exports.getCoord = getCoord;
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
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    moveAction = action;
                    attackAction = action;
                    if (!(moveAction.type === 'Move')) return [3 /*break*/, 2];
                    return [4 /*yield*/, movCB(moveAction)];
                case 1:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(attackAction.type === 'Attack')) return [3 /*break*/, 4];
                    return [4 /*yield*/, attCB(attackAction)];
                case 3:
                    _d.sent();
                    _d.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.dealWithAction = dealWithAction;
function printAction(_action) {
    dealWithAction(_action, function (aA) {
        log(aA.type + " || readiness=" + aA.readinessCost + " | affected=" + aA.target.index + " | from=" + aA.attacker.index + " | ability=" + aA.ability.abilityName);
    }, function (mA) {
        log(mA.type + " || readiness=" + mA.readinessCost + " | affected=" + mA.target.index + " | from=" + mA.attacker.index + " | magnitude=" + mA.magnitude + " | axis=" + mA.axis);
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
        var inviterUser, _d, user, _f;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!_from.avatar) return [3 /*break*/, 1];
                    _d = _from;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, __1.BotClient.users.fetch(_from).then(function (u) { return u; }).catch(function () { return undefined; })];
                case 2:
                    _d = _g.sent();
                    _g.label = 3;
                case 3:
                    inviterUser = _d;
                    if (!_user_id.avatar) return [3 /*break*/, 4];
                    _f = _user_id;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, __1.BotClient.users.fetch(_user_id).then(function (u) { return u; }).catch(function () { return undefined; })];
                case 5:
                    _f = _g.sent();
                    _g.label = 6;
                case 6:
                    user = _f;
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
                                        return __generator(this, function (_d) {
                                            switch (_d.label) {
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
                                                    _d.sent();
                                                    _d.label = 2;
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
/** Includes the first 23 items of the inventory. First button "refresh", last button "end" */
function getInventorySelectOptions(_inv) {
    return [{
            emoji: '🔄',
            label: "Refresh",
            description: "Update your inventory",
            value: "refresh"
        }].concat(_inv.map(function (_item, _i) {
        var _d;
        return {
            emoji: ((_d = jsons_1.itemData[_item.getItemType()]) === null || _d === void 0 ? void 0 : _d.emoji) || typedef_1.EMOJI_WHITEB,
            label: _item.getDisplayName() + " (" + _item.getWeight(true) + ")",
            description: "$" + _item.getWorth(true),
            value: "" + _i,
        };
    }).splice(0, 23)).concat([{
            emoji: typedef_1.EMOJI_CROSS,
            label: "Quit",
            description: "",
            value: "end",
        }]);
}
exports.getInventorySelectOptions = getInventorySelectOptions;
function getItemType(_i) {
    var e_4, _d, e_5, _f;
    // log(`Get item type for: ${_i.name}`)
    var weight = _i.getWeight();
    try {
        for (var _g = __values(Object.entries(jsons_1.itemData)), _j = _g.next(); !_j.done; _j = _g.next()) {
            var _k = __read(_j.value, 2), _itemName = _k[0], _data = _k[1];
            // debug("Qualifying for", _itemName);
            var itemName = _itemName;
            var data = _data;
            var qualification = data.qualification;
            /** weight qualification */
            var _l = qualification.weightDeviation, min = _l.min, max = _l.max;
            if (min <= weight && max >= weight) {
                /** materials qualification */
                var passed = 0;
                try {
                    for (var _o = (e_5 = void 0, __values(qualification.materials)), _p = _o.next(); !_p.done; _p = _o.next()) {
                        var _materialInfo = _p.value;
                        var material = _materialInfo.materialName;
                        var mI = _i.getMaterialInfo(material) ||
                            null;
                        // debug("\t\tTesting for", {
                        //     name: mI?.materialName,
                        //     occupation: mI?.occupation,
                        // });
                        var _r = _materialInfo.occupationDeviation, min_1 = _r.min, max_1 = _r.max;
                        if (mI && mI.occupation >= min_1 && mI.occupation <= max_1) {
                            // log("\t\tQualified!");
                            passed++;
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_p && !_p.done && (_f = _o.return)) _f.call(_o);
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
            if (_j && !_j.done && (_d = _g.return)) _d.call(_g);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return null;
}
exports.getItemType = getItemType;
function getForgeWeaponType(_bladeWeight, _guardWeight, _shaftWeight) {
    var type = null;
    var array = Object.keys(jsons_1.forgeWeaponData);
    for (var i = 0; i < array.length; i++) {
        var fwn = array[i];
        var data = jsons_1.forgeWeaponData[fwn];
        if ((data.blade[0] <= _bladeWeight && _bladeWeight <= data.blade[1]) &&
            (data.guard[0] <= _guardWeight && _guardWeight <= data.guard[1]) &&
            (data.shaft[0] <= _shaftWeight && _shaftWeight <= data.shaft[1])) {
            type = fwn;
            break;
        }
    }
    return type;
}
exports.getForgeWeaponType = getForgeWeaponType;
function getForgeWeaponMinMax(_t) {
    var entries = Object.entries(jsons_1.forgeWeaponData);
    var min = arrayGetSmallestInArray(entries, function (_e) {
        return _e[1][_t][0];
    });
    var max = arrayGetLargestInArray(entries, function (_e) {
        return _e[1][_t][1];
    });
    return {
        min: min[1][_t][0],
        max: max[1][_t][1],
    };
}
exports.getForgeWeaponMinMax = getForgeWeaponMinMax;
function getForgeWeaponAttackAbility(_fw) {
    return {
        type: 'melee',
        abilityName: "Attack",
        sword: 0,
        shield: 0,
        sprint: 0,
        readinessCost: _fw.readinessCost,
        staminaCost: 0,
        speedScale: 1,
        damageScale: 1,
        staminaScale: 1,
        cooldown: 0,
        UPT: 10,
        desc: null,
        targetting: {
            target: typedef_1.AbilityTargetting.enemy,
            AOE: 'single',
        },
        bonus: {
            damage: 0,
            accuracy: 0,
            lifesteal: 0,
            criticalHit: 0,
        }
    };
}
exports.getForgeWeaponAttackAbility = getForgeWeaponAttackAbility;
