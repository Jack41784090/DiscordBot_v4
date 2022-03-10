"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var discord_js_1 = require("discord.js");
var Utility_1 = require("../classes/Utility");
var typedef_1 = require("../typedef");
var Dungeon_1 = require("../classes/Dungeon");
var jsons_1 = require("../jsons");
module.exports = {
    commands: ['embark', 'adventure', 'go'],
    expectedArgs: '[location]',
    minArgs: 0,
    maxArgs: 1,
    callback: function (author, authorData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var locationsEmbed, _a, _b, locationName, formalName, location_1, dungeonInputData, dungeon, initSuccessful;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(args[0] === undefined)) return [3 /*break*/, 1];
                    locationsEmbed = new discord_js_1.MessageEmbed({
                        title: "Here are all the places you can go...",
                        description: '',
                        footer: {
                            text: "//go [location]"
                        }
                    });
                    try {
                        for (_a = __values(Object.keys(jsons_1.dungeonData)), _b = _a.next(); !_b.done; _b = _a.next()) {
                            locationName = _b.value;
                            formalName = (0, Utility_1.formalise)(locationName);
                            locationsEmbed.description += "**" + formalName + "**\n";
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    channel.send({ embeds: [locationsEmbed] });
                    return [3 /*break*/, 4];
                case 1:
                    if (!args[0]) return [3 /*break*/, 4];
                    location_1 = args[0];
                    dungeonInputData = jsons_1.dungeonData[location_1] ?
                        (0, Utility_1.getNewObject)(jsons_1.dungeonData[location_1], {}) :
                        null;
                    if (dungeonInputData === null) {
                        message.reply("Cannot generate map. Check if you are inputting the correct map name.");
                        return [2 /*return*/];
                    }
                    dungeon = Dungeon_1.Dungeon.Generate(dungeonInputData);
                    if (!authorData) {
                        message.reply("Your request is pending. Please try again later.");
                        return [2 /*return*/];
                    }
                    if (!authorData.equippedClass) {
                        message.reply("You have yet to have a class equipped.");
                        return [2 /*return*/];
                    }
                    if (!dungeonInputData) return [3 /*break*/, 3];
                    message.react(typedef_1.EMOJI_TICK);
                    return [4 /*yield*/, dungeon.initialiseUsersAndInteraction(message)];
                case 2:
                    initSuccessful = _d.sent();
                    if (initSuccessful) {
                        dungeon.readAction();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    message.reply("The location \"" + location_1 + "\" is not valid.");
                    _d.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); }
};
