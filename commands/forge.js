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
var discord_js_1 = require("discord.js");
var InteractionEvent_1 = require("../classes/InteractionEvent");
var InteractionEventManager_1 = require("../classes/InteractionEventManager");
var Item_1 = require("../classes/Item");
var Utility_1 = require("../classes/Utility");
var jsons_1 = require("../jsons");
var typedef_1 = require("../typedef");
module.exports = {
    commands: ['forge'],
    expectedArgs: '[weapon/armour]',
    minArgs: 0,
    maxArgs: 1,
    callback: function (author, authorUserData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var forgeMes, iem, event, updatedUserData, selectedWeaponType, selectedItems, selectOptionsCache, getForgeMesOptions, listenFor, weapons, r1, r2, r3, weaponEmbed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, channel.send({
                        embeds: [(0, Utility_1.getLoadingEmbed)()]
                    })];
                case 1:
                    forgeMes = _a.sent();
                    iem = InteractionEventManager_1.InteractionEventManager.getInstance();
                    event = new InteractionEvent_1.InteractionEvent(author.id, forgeMes, 'forge');
                    return [4 /*yield*/, iem.registerInteraction(author.id, event, authorUserData)];
                case 2:
                    updatedUserData = (_a.sent());
                    selectedItems = [];
                    selectOptionsCache = new Map();
                    getForgeMesOptions = function (_t) {
                        var range = jsons_1.forgeWeaponData[selectedWeaponType][_t];
                        var pickedItems = selectOptionsCache.get(_t) ||
                            selectOptionsCache.set(_t, updatedUserData.inventory.filter(function (_i) {
                                var w = _i.getWeight();
                                return range[0] <= w && w <= range[1];
                            })).get(_t);
                        var selectMenuOptions = (0, Utility_1.getInventorySelectOptions)(pickedItems.filter(function (_i) { return !selectedItems.includes(_i); }));
                        return {
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setTitle("Select material for the " + (0, Utility_1.formalise)(_t))
                                    .setFields(selectedItems.map(function (_i) { return ({
                                    name: _i.getDisplayName(),
                                    value: _i.getAllMaterial()
                                        .filter(function (_mi) { return _mi.occupation >= 0.1; })
                                        .map(function (_mi) { return _i.getMaterialInfoString(_mi); })
                                        .join('\n'),
                                }); }))
                            ],
                            components: [(0, Utility_1.getSelectMenuActionRow)(selectMenuOptions)]
                        };
                    };
                    listenFor = function (_t) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            (0, Utility_1.log)("listen for " + _t);
                            return [2 /*return*/, forgeMes.edit(getForgeMesOptions(_t))
                                    .then(function () {
                                    return new Promise(function (resolve) {
                                        (0, Utility_1.setUpInteractionCollect)(forgeMes, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                                            var ans, _a, int;
                                            var _b;
                                            return __generator(this, function (_c) {
                                                switch (_c.label) {
                                                    case 0:
                                                        if (!_itr.isSelectMenu()) return [3 /*break*/, 7];
                                                        ans = _itr.values[0];
                                                        _a = ans;
                                                        switch (_a) {
                                                            case 'refresh': return [3 /*break*/, 1];
                                                            case 'end': return [3 /*break*/, 3];
                                                        }
                                                        return [3 /*break*/, 4];
                                                    case 1: return [4 /*yield*/, _itr.update(getForgeMesOptions(_t))];
                                                    case 2:
                                                        _c.sent();
                                                        resolve(listenFor(_t));
                                                        return [3 /*break*/, 6];
                                                    case 3:
                                                        iem.stopInteraction(author.id, 'forge');
                                                        resolve(null);
                                                        return [3 /*break*/, 6];
                                                    case 4:
                                                        int = parseInt(ans);
                                                        return [4 /*yield*/, _itr.update({})];
                                                    case 5:
                                                        _c.sent();
                                                        resolve(Number.isInteger(int) ?
                                                            (((_b = selectOptionsCache.get(_t)) === null || _b === void 0 ? void 0 : _b[int]) || null) :
                                                            null);
                                                        return [3 /*break*/, 6];
                                                    case 6: return [3 /*break*/, 8];
                                                    case 7: return [2 /*return*/, null];
                                                    case 8: return [2 /*return*/];
                                                }
                                            });
                                        }); }, 1);
                                    });
                                })];
                        });
                    }); };
                    weapons = Object.keys(jsons_1.forgeWeaponData).map(function (_wN) {
                        var bladeCost = jsons_1.forgeWeaponData[_wN].blade;
                        var guardCost = jsons_1.forgeWeaponData[_wN].guard;
                        var shaftCost = jsons_1.forgeWeaponData[_wN].shaft;
                        return {
                            label: (0, Utility_1.formalise)(_wN),
                            value: _wN,
                            description: "" + bladeCost + typedef_1.MEW + "-" + guardCost + typedef_1.MEW + "-" + shaftCost + typedef_1.MEW
                        };
                    });
                    return [4 /*yield*/, forgeMes.edit({
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setTitle("Select Weapon")
                            ],
                            components: [(0, Utility_1.getSelectMenuActionRow)(weapons)]
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var timeout = setTimeout(function () {
                                iem.stopInteraction(author.id, 'forge');
                                itrC.stop();
                                resolve(null);
                            }, 100 * 1000);
                            var itrC = (0, Utility_1.setUpInteractionCollect)(forgeMes, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                                var selected;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            clearTimeout(timeout);
                                            if (!_itr.isSelectMenu()) return [3 /*break*/, 2];
                                            selected = _itr.values[0];
                                            return [4 /*yield*/, _itr.update({})];
                                        case 1:
                                            _a.sent();
                                            resolve(selected);
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }, 1);
                        })];
                case 4:
                    selectedWeaponType = _a.sent();
                    if (selectedWeaponType === null) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, listenFor('blade')];
                case 5:
                    r1 = _a.sent();
                    if (r1 === null) {
                        return [2 /*return*/];
                    }
                    selectedItems.push(r1);
                    return [4 /*yield*/, listenFor('guard')];
                case 6:
                    r2 = _a.sent();
                    if (r2 === null) {
                        return [2 /*return*/];
                    }
                    selectedItems.push(r2);
                    return [4 /*yield*/, listenFor('shaft')];
                case 7:
                    r3 = _a.sent();
                    if (r3 === null) {
                        return [2 /*return*/];
                    }
                    selectedItems.push(r3);
                    weaponEmbed = Utility_1.getAbilityEmbed;
                    (0, Utility_1.setUpConfirmationInteractionCollect)(forgeMes, new discord_js_1.MessageEmbed({
                        title: "Forge " + (0, Utility_1.formalise)(selectedWeaponType) + "?",
                        fields: (selectedItems.map(function (_i) { return ({
                            name: _i.getDisplayName(),
                            value: _i.getAllMaterial()
                                .filter(function (_mi) { return _mi.occupation >= 0.1; })
                                .map(function (_mi) { return _i.getMaterialInfoString(_mi); })
                                .join('\n'),
                        }); }))
                    }), 
                    // yes, forge!
                    function () {
                        var forged = Item_1.Item.Forge(r1, r2, r3, selectedWeaponType);
                        (0, Utility_1.log)(forged);
                    }, 
                    // no, don't forge!
                    function () {
                    });
                    return [2 /*return*/];
            }
        });
    }); }
};
