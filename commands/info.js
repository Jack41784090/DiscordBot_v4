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
Object.defineProperty(exports, "__esModule", { value: true });
var typedef_1 = require("../typedef");
var Utility_1 = require("../classes/Utility");
var Database_1 = require("../classes/Database");
var InteractionEventManager_1 = require("../classes/InteractionEventManager");
var InteractionEvent_1 = require("../classes/InteractionEvent");
var jsons_1 = require("../jsons");
module.exports = {
    commands: ['info'],
    expectedArgs: '[class name]',
    minArgs: 0,
    maxArgs: 1,
    callback: function (author, authorUserData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var mes, iem, iE, iconCache, getClassIconLink, getClassEmbed, selectMenuOptions, actionrow_1, selectMenu, _a, _b, _c, _d, collect_1, className_1, classChosen_1, arsenal, selectMenuOptions, weaponSelectActionRow_1, _e, _f, _g, _h, collect_2;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0: return [4 /*yield*/, message.reply({
                        embeds: [(0, Utility_1.getLoadingEmbed)()]
                    })];
                case 1:
                    mes = _j.sent();
                    iem = InteractionEventManager_1.InteractionEventManager.getInstance();
                    iE = new InteractionEvent_1.InteractionEvent(author.id, mes, 'info');
                    return [4 /*yield*/, iem.registerInteraction(author.id, iE, authorUserData)];
                case 2:
                    _j.sent();
                    iconCache = new Map();
                    getClassIconLink = function (className) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b, _c, _d, _e;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _a = iconCache.get(className);
                                    if (_a) return [3 /*break*/, 3];
                                    _c = (_b = iconCache).set;
                                    _d = [className];
                                    _e = Database_1.getIconImgurLink;
                                    return [4 /*yield*/, (0, Utility_1.getStat)(className)];
                                case 1: return [4 /*yield*/, _e.apply(void 0, [_f.sent()])];
                                case 2:
                                    _a = _c.apply(_b, _d.concat([(_f.sent()) || typedef_1.defaultAvatarURL])).get(className);
                                    _f.label = 3;
                                case 3: return [2 /*return*/, _a];
                            }
                        });
                    }); };
                    getClassEmbed = function (className) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, _b;
                        var _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _c = {};
                                    _b = (_a = (0, Utility_1.getStatsEmbed)(className))
                                        .setThumbnail;
                                    return [4 /*yield*/, getClassIconLink(className)];
                                case 1: return [2 /*return*/, (_c.embeds = [
                                        _b.apply(_a, [_d.sent()])
                                    ],
                                        _c)];
                            }
                        });
                    }); };
                    if (!(args[0] === undefined)) return [3 /*break*/, 5];
                    selectMenuOptions = Object.keys(jsons_1.classData)
                        .map(function (_className) { return ({
                        label: _className,
                        value: _className,
                    }); });
                    actionrow_1 = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions);
                    selectMenu = actionrow_1.components[0];
                    selectMenu.placeholder = "Select a Class";
                    _b = (_a = mes).edit;
                    _d = (_c = Object).assign;
                    return [4 /*yield*/, getClassEmbed('Fighter')];
                case 3: return [4 /*yield*/, _b.apply(_a, [_d.apply(_c, [_j.sent(), {
                                components: [actionrow_1]
                            }])])];
                case 4:
                    _j.sent();
                    collect_1 = function () {
                        (0, Utility_1.setUpInteractionCollect)(mes, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                            var classChosen, _a, _b, _c, _d, _err_1;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _e.trys.push([0, 4, , 5]);
                                        if (!_itr.isSelectMenu()) return [3 /*break*/, 3];
                                        classChosen = _itr.values[0];
                                        _b = (_a = _itr).update;
                                        _d = (_c = Object).assign;
                                        return [4 /*yield*/, getClassEmbed(classChosen)];
                                    case 1: return [4 /*yield*/, _b.apply(_a, [_d.apply(_c, [_e.sent(), {
                                                    components: [actionrow_1]
                                                }])])];
                                    case 2:
                                        _e.sent();
                                        collect_1();
                                        _e.label = 3;
                                    case 3: return [3 /*break*/, 5];
                                    case 4:
                                        _err_1 = _e.sent();
                                        console.error(_err_1);
                                        iem.stopInteraction(author.id, 'info');
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); }, 1);
                    };
                    collect_1();
                    return [3 /*break*/, 9];
                case 5:
                    if (!(jsons_1.classData[args[0]] === undefined)) return [3 /*break*/, 6];
                    message.react(typedef_1.EMOJI_CROSS)
                        .catch(function (_err) { return console.log; });
                    (0, Utility_1.log)("dne stop");
                    iem.stopInteraction(author.id, 'info');
                    return [3 /*break*/, 9];
                case 6:
                    className_1 = (0, Utility_1.formalise)(args[0]);
                    classChosen_1 = (0, Utility_1.getNewObject)(jsons_1.classData[className_1]);
                    arsenal = classChosen_1.abilities.concat(classChosen_1.autoWeapons);
                    selectMenuOptions = arsenal.map(function (_w, _i) {
                        return {
                            emoji: _w.targetting.target === typedef_1.AbilityTargetting.ally ?
                                typedef_1.EMOJI_SHIELD :
                                typedef_1.EMOJI_SWORD,
                            label: _w.abilityName,
                            value: "" + _i,
                        };
                    }).concat([{
                            emoji: typedef_1.EMOJI_STAR,
                            label: "Stats",
                            value: "menu",
                        }]);
                    weaponSelectActionRow_1 = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions);
                    _f = (_e = mes).edit;
                    _h = (_g = Object).assign;
                    return [4 /*yield*/, getClassEmbed(className_1)];
                case 7: return [4 /*yield*/, _f.apply(_e, [_h.apply(_g, [_j.sent(), {
                                components: [weaponSelectActionRow_1],
                            }])])];
                case 8:
                    _j.sent();
                    collect_2 = function () {
                        (0, Utility_1.setUpInteractionCollect)(mes, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                            var weaponIndex, weaponChosen, _a, _b, _c, _d, _err_2;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _e.trys.push([0, 7, , 8]);
                                        if (!_itr.isSelectMenu()) return [3 /*break*/, 6];
                                        weaponIndex = parseInt(_itr.values[0]);
                                        weaponChosen = classChosen_1.abilities[weaponIndex] ||
                                            classChosen_1.autoWeapons[weaponIndex % classChosen_1.abilities.length];
                                        if (!weaponChosen) return [3 /*break*/, 2];
                                        return [4 /*yield*/, _itr.update({
                                                embeds: [(0, Utility_1.getAbilityEmbed)(weaponChosen)]
                                            })];
                                    case 1:
                                        _e.sent();
                                        return [3 /*break*/, 5];
                                    case 2:
                                        _b = (_a = _itr).update;
                                        _d = (_c = Object).assign;
                                        return [4 /*yield*/, getClassEmbed(className_1)];
                                    case 3: return [4 /*yield*/, _b.apply(_a, [_d.apply(_c, [_e.sent(), {
                                                    components: [weaponSelectActionRow_1],
                                                }])])];
                                    case 4:
                                        _e.sent();
                                        _e.label = 5;
                                    case 5:
                                        collect_2();
                                        _e.label = 6;
                                    case 6: return [3 /*break*/, 8];
                                    case 7:
                                        _err_2 = _e.sent();
                                        console.log(_err_2);
                                        (0, Utility_1.log)("error stop");
                                        iem.stopInteraction(author.id, 'info');
                                        return [3 /*break*/, 8];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); }, 1);
                    };
                    collect_2();
                    _j.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    }); }
};
