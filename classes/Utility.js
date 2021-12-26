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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeaponUses = exports.getLastElement = exports.getNewObject = exports.dealWithAccolade = exports.getPyTheorem = exports.getCompass = exports.getLoadingEmbed = exports.getActionsTranslate = exports.getWithSign = exports.getConditionalTexts = exports.extractActions = exports.sendToSandbox = exports.clearChannel = exports.getSelectMenuActionRow = exports.setUpInteractionCollect = exports.Test = exports.getDashAction = exports.getAttackAction = exports.getMoveAction = exports.getDirection = exports.counterAxis = exports.returnGridCanvas = exports.startDrawing = exports.addHPBar = exports.roundToDecimalPlace = exports.newWeapon = exports.getLargestInArray = exports.getCoordsWithinRadius = exports.checkWithinDistance = exports.getDistance = exports.flatten = exports.findLongArm = exports.getProt = exports.getLifesteal = exports.getCrit = exports.getSpd = exports.getDodge = exports.getAcc = exports.getDamage = exports.getAHP = exports.average = exports.random = exports.formalize = exports.capitalize = exports.extractCommands = exports.debug = exports.log = exports.stringifyRGBA = exports.normaliseRGBA = exports.clamp = void 0;
exports.getNewNode = exports.HandleTokens = exports.dealWithUndoAction = exports.getDeathEmbed = exports.printAction = exports.dealWithAction = exports.getRandomCode = exports.getCoordString = exports.getStat = exports.getEmptyBuff = exports.getBaseStat = exports.getWeaponIndex = exports.getEmptyAccolade = exports.getCSFromMap = exports.getMapFromCS = exports.printCSMap = void 0;
var canvas_1 = require("canvas");
var discord_js_1 = require("discord.js");
var classData_json_1 = __importDefault(require("../data/classData.json"));
var __1 = require("..");
var typedef_1 = require("../typedef");
var Battle_1 = require("./Battle");
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
    for (var _i = 0; _i < arguments.length; _i++) {
        any[_i] = arguments[_i];
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
    if (sections[0][0] + sections[0][1] === '//') {
        sections[0] = sections[0].substring(2);
    }
    return sections;
}
exports.extractCommands = extractCommands;
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
exports.capitalize = capitalize;
function formalize(string) {
    return capitalize(string.toLowerCase());
}
exports.formalize = formalize;
// number manipulation
function random(num1, num2) {
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
exports.random = random;
function average() {
    var nums = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        nums[_i] = arguments[_i];
    }
    var total = 0;
    for (var i = 0; i < nums.length; i++) {
        var n = nums[i];
        total += n;
    }
    return total / nums.length;
}
exports.average = average;
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
function flatten(array) {
    var flat = [];
    for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (Array.isArray(el)) {
            flat = flat.concat(flatten(el));
        }
        else {
            flat.push(el);
        }
    }
    return flat;
}
exports.flatten = flatten;
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
function getLargestInArray(array) {
    return array.reduce(function (la, c) {
        return la < c ?
            c :
            la;
    }, array[0]);
}
exports.getLargestInArray = getLargestInArray;
function newWeapon(origin, modifier) {
    return Object.assign(__assign({}, origin), modifier);
}
exports.newWeapon = newWeapon;
function roundToDecimalPlace(number, decimalPlace) {
    if (decimalPlace === void 0) { decimalPlace = 1; }
    decimalPlace = Math.round(decimalPlace);
    var decimal = Math.pow(10, decimalPlace);
    return Math.round((number + Number.EPSILON) * decimal) / decimal;
}
exports.roundToDecimalPlace = roundToDecimalPlace;
function addHPBar(maxValue, nowValue, options) {
    if (options === void 0) { options = { bar: '█', line: '|' }; }
    var result = '';
    if (maxValue < 0)
        maxValue = 0;
    if (nowValue < 0)
        nowValue = 0;
    if (nowValue > maxValue)
        nowValue = maxValue;
    var blockCount = Math.round(nowValue / 2);
    var lineCount = Math.round(maxValue / 2) - blockCount;
    if (nowValue <= 0) {
        blockCount = 0;
        lineCount = Math.round(maxValue / 2);
    }
    for (var i = 0; i < blockCount; i++) {
        result += options.bar;
    }
    for (var i = 0; i < lineCount; i++) {
        result += options.line;
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
function returnGridCanvas(height, width, size, groundImage) {
    if (height === void 0) { height = 9; }
    if (width === void 0) { width = 9; }
    if (size === void 0) { size = 500; }
    var canvas = new canvas_1.Canvas(width * size, height * size);
    var ctx = canvas.getContext('2d');
    if (groundImage) {
        ctx.drawImage(groundImage, 0, 0, width * size, height * size);
    }
    else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width * size, height * size);
    }
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    for (var i = 1; i < height; i++) {
        ctx.moveTo(0, i * size);
        ctx.lineTo(width * size, i * size);
    }
    for (var i = 1; i < width; i++) {
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, height * size);
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
function getMoveAction(stat, args2, priority, args4) {
    var movetype = "Move";
    var moveAction = {
        executed: false,
        type: movetype,
        from: stat,
        affected: stat,
        readiness: 0,
        sword: 0,
        shield: 0,
        sprint: Number(stat.moved),
        priority: priority,
        axis: 'x',
        magnitude: 0,
    };
    var args2_isAction = typeof args2 === 'string'; // args2: string, args4: number
    var args2_isMagnitude = typeof args2 === 'number'; // args2: number, args4: "x" | "y"
    if (args2_isAction) {
        var action = args2;
        var moveMagnitude = args4;
        var axis = void 0, magnitude = void 0;
        switch (action) {
            // move vertically
            case "up":
            case "v":
                magnitude = moveMagnitude;
                axis = 'y';
                break;
            case "down":
                magnitude = -1 * moveMagnitude;
                axis = 'y';
                break;
            // move horizontally
            case "right":
            case "h":
            case "r":
                magnitude = moveMagnitude;
                axis = 'x';
                break;
            case "left":
            case "l":
                magnitude = -1 * moveMagnitude;
                axis = 'x';
                break;
            default:
                return null;
        }
        moveAction.axis = axis;
        moveAction.magnitude = magnitude;
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
function getAttackAction(attacker, victim, weapon, coords, priority) {
    var actionType = "Attack";
    var attackAction = {
        executed: false,
        type: actionType,
        from: attacker,
        affected: victim,
        readiness: weapon.Readiness,
        sword: weapon.sword,
        shield: weapon.shield,
        sprint: weapon.sprint,
        priority: priority,
        weapon: weapon,
        coordinate: coords
    };
    return attackAction;
}
exports.getAttackAction = getAttackAction;
function getDashAction(stat, _target, priority, sprint) {
    var movetype = "Dash";
    var magnitude = getDistance(stat, _target);
    return {
        executed: false,
        type: movetype,
        from: stat,
        affected: stat,
        readiness: Battle_1.Battle.MOVE_READINESS * Math.abs(magnitude),
        sword: 0,
        shield: 0,
        sprint: sprint,
        priority: priority,
        target: _target,
    };
}
exports.getDashAction = getDashAction;
function Test() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
exports.Test = Test;
function setUpInteractionCollect(msg, cb, collectCount) {
    if (collectCount === void 0) { collectCount = 1; }
    var interCollectr = new discord_js_1.InteractionCollector(__1.BotClient, { message: msg, max: collectCount });
    interCollectr.on('collect', cb);
    return interCollectr;
}
exports.setUpInteractionCollect = setUpInteractionCollect;
function getSelectMenuActionRow(options, id, min, max) {
    if (id === void 0) { id = 'customId'; }
    if (min === void 0) { min = 1; }
    if (max === void 0) { max = 1; }
    var menu = new discord_js_1.MessageSelectMenu({
        customId: id,
        minValues: min,
        maxValues: max,
        options: options,
    });
    var messageActionRow = new discord_js_1.MessageActionRow({ components: [menu] });
    return messageActionRow;
}
exports.getSelectMenuActionRow = getSelectMenuActionRow;
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
                            var _loop_1 = function (id, m) {
                                m.delete().catch(function () {
                                    if (m.deletable)
                                        m.delete().catch();
                                });
                            };
                            try {
                                for (var messages_1 = __values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
                                    var _b = __read(messages_1_1.value, 2), id = _b[0], m = _b[1];
                                    _loop_1(id, m);
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
// export function getDeepCopyObject<Type extends Object>(obj: Type) {
//     const result: Type = Object.assign({}, obj);
//     if (typeof obj === 'object') {
//         for (const [key, value] of Object.entries(obj)) {
//             if (typeof value === 'object' && !Array.isArray(value) && value) {
//                 const maximumCallExceeded = Object.assign({ ...getDeepCopyObject(value) });
//                 result[key] = maximumCallExceeded;
//             }
//             else {
//                 result[key] = value;
//             }
//         }
//     }
//     return result;
// }
function getLastElement(array) {
    if (array.length < 1)
        return array[0];
    return array[array.length - 1];
}
exports.getLastElement = getLastElement;
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
    var e_2, _a, e_3, _b;
    var mapReturn = new Map();
    try {
        for (var _c = __values(Object.values(coordStat)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var yStat = _d.value;
            try {
                for (var _e = (e_3 = void 0, __values(Object.values(yStat))), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var stat = _f.value;
                    mapReturn.set(getCoordString(stat), getStat(stat));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return mapReturn;
}
exports.getMapFromCS = getMapFromCS;
function getCSFromMap(map) {
    var CSreturn = {};
    map.forEach(function (v, k) {
        var _a = { x: k.split(',')[0], y: k.split(',')[1] }, x = _a.x, y = _a.y;
        if (CSreturn[x] === undefined)
            CSreturn[x] = {};
        CSreturn[x][y] = v;
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
function getBaseStat(className) {
    return classData_json_1.default[className];
}
exports.getBaseStat = getBaseStat;
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
function getStat(bss, _owner) {
    if (_owner === void 0) { _owner = ''; }
    var classBSS = bss.class;
    var base = 'team' in bss ?
        getNewObject(classData_json_1.default[bss.class], bss) :
        bss;
    var ss = bss;
    var endStat = {
        base: base,
        index: -1,
        name: "" + bss.class,
        weaponUses: [],
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
        botType: ss.botType || (_owner ? typedef_1.BotType.naught : typedef_1.BotType.enemy),
        accolades: getEmptyAccolade(),
        buffs: getEmptyBuff(),
        debuffs: getEmptyBuff(),
        x: ss.x,
        y: ss.y,
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
        codeArray.push("" + random(0, 9));
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
        .setTitle("*\"" + typedef_1.deathQuotes[random(0, typedef_1.deathQuotes.length - 1)] + "\"*")
        .setAuthor(typedef_1.preludeQuotes[random(0, typedef_1.preludeQuotes.length - 1)])
        .setColor("#530000");
}
exports.getDeathEmbed = getDeathEmbed;
function dealWithUndoAction(stat, action) {
    stat.sword += action.sword;
    stat.shield += action.shield;
    stat.sprint += action.sprint;
    stat.readiness += action.readiness;
    action.executed = false;
    var moveAction = action;
    // if action is a free movement action
    if (moveAction.magnitude !== undefined && moveAction.sprint === 0) {
        stat.moved = false;
    }
}
exports.dealWithUndoAction = dealWithUndoAction;
function HandleTokens(changeToken, changingFunction) {
    if (changeToken.sword !== undefined)
        changingFunction(changeToken.sword, "sword");
    if (changeToken.shield !== undefined)
        changingFunction(changeToken.shield, "shield");
    if (changeToken.sprint !== undefined)
        changingFunction(changeToken.sprint, "sprint");
}
exports.HandleTokens = HandleTokens;
function getNewNode(_x, _y, _destination, _distanceTravelled) {
    if (_distanceTravelled === void 0) { _distanceTravelled = 0; }
    var desC = Math.abs(_x - _destination.x) + Math.abs(_y - _destination.y);
    var totalC = _distanceTravelled + desC;
    var object = {
        x: _x,
        y: _y,
        lastNode: null,
        nextNode: null,
        disC: _distanceTravelled,
        desC: desC,
        totalC: totalC,
    };
    return object;
}
exports.getNewNode = getNewNode;
