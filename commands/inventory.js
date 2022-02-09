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
var Utility_1 = require("../classes/Utility");
var typedef_1 = require("../typedef");
var InteractionEventManager_1 = require("../classes/InteractionEventManager");
var InteractionEvent_1 = require("../classes/InteractionEvent");
module.exports = {
    commands: ['inventory'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: function (author, authorUserData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var returnSelectItemsMessage, returnItemsActionMessage, selectingItem, managingItem, listen, invMessage, interactionEvent, iem, updatedUserData, itemSelected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    returnSelectItemsMessage = function () {
                        var selectMenuOptions = (0, Utility_1.getInventorySelectOptions)(updatedUserData.inventory);
                        var selectMenuActionRow = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions, "select");
                        return {
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setThumbnail('https://i.imgur.com/40Unw4T.png')
                                    .setTitle('Inventory')
                                    .setFooter("" + updatedUserData.money, typedef_1.coinURL)
                            ],
                            components: [selectMenuActionRow]
                        };
                    };
                    returnItemsActionMessage = function (_i) {
                        var selectMenuOptions = [
                            {
                                emoji: typedef_1.EMOJI_MONEYBAG,
                                label: "Sell",
                                description: "Sell this item for precisely: $" + _i.getWorth(),
                                value: "sell",
                            },
                            {
                                emoji: '🪚',
                                label: "Chip",
                                description: "($10) Randomly chip off 20% weight (" + (0, Utility_1.roundToDecimalPlace)(_i.getWeight() * 0.2) + typedef_1.MEW + ").",
                                value: "chip",
                            },
                            {
                                emoji: '💉',
                                label: "Extract",
                                description: "($50) Extract 20% weight into a new item (" + (0, Utility_1.roundToDecimalPlace)(_i.getWeight() * 0.2) + typedef_1.MEW + ").",
                                value: "extract",
                            },
                            {
                                emoji: typedef_1.EMOJI_CROSS,
                                label: "Close",
                                value: "end",
                            },
                        ];
                        var actionRow = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions, "manage");
                        _i.getAllMaterial().sort(function (_1, _2) { return _2.occupation - _1.occupation; });
                        return {
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setDescription(_i.getAllMaterial().map(function (_mI) { return _i.getMaterialInfoString(_mI); }).join("\n"))
                                    .setThumbnail('https://i.imgur.com/SCT19EA.png')
                                    .setTitle(_i.getDisplayName() + " " + (0, Utility_1.roundToDecimalPlace)(_i.getWeight()) + typedef_1.MEW)
                                    .setFooter("" + updatedUserData.money, typedef_1.coinURL)
                            ],
                            components: [actionRow],
                        };
                    };
                    selectingItem = function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                        var action, _a, index, _err_1;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 7, , 8]);
                                    action = _itr.values[0];
                                    _a = action;
                                    switch (_a) {
                                        case "refresh": return [3 /*break*/, 1];
                                        case "end": return [3 /*break*/, 3];
                                    }
                                    return [3 /*break*/, 4];
                                case 1: return [4 /*yield*/, _itr.update(returnSelectItemsMessage())];
                                case 2:
                                    _b.sent();
                                    return [3 /*break*/, 6];
                                case 3:
                                    iem.stopInteraction(author.id, 'inventory');
                                    return [3 /*break*/, 6];
                                case 4:
                                    index = parseInt(_itr.values[0]);
                                    itemSelected = updatedUserData.inventory[index];
                                    return [4 /*yield*/, _itr.update(returnItemsActionMessage(itemSelected))];
                                case 5:
                                    _b.sent();
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 8];
                                case 7:
                                    _err_1 = _b.sent();
                                    console.error(_err_1);
                                    listen();
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); };
                    managingItem = function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                        var action, _a, roll_chip, extracted, _err_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 10, , 11]);
                                    action = _itr.values[0];
                                    _a = action;
                                    switch (_a) {
                                        case "sell": return [3 /*break*/, 1];
                                        case "chip": return [3 /*break*/, 3];
                                        case "extract": return [3 /*break*/, 5];
                                        case "end": return [3 /*break*/, 7];
                                    }
                                    return [3 /*break*/, 9];
                                case 1:
                                    updatedUserData.money += itemSelected.getWorth();
                                    (0, Utility_1.arrayRemoveItemArray)(updatedUserData.inventory, itemSelected);
                                    return [4 /*yield*/, _itr.update(returnSelectItemsMessage())];
                                case 2:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 3:
                                    roll_chip = (0, Utility_1.uniformRandom)(Number.EPSILON, (itemSelected.getWeight() / itemSelected.getMaxWeight()));
                                    itemSelected.chip(roll_chip, 0.2);
                                    itemSelected.cleanUp();
                                    return [4 /*yield*/, _itr.update(returnItemsActionMessage(itemSelected))];
                                case 4:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 5:
                                    extracted = itemSelected.extract(0.2);
                                    itemSelected.cleanUp();
                                    updatedUserData.inventory.push(extracted);
                                    itemSelected = extracted;
                                    return [4 /*yield*/, _itr.update(returnItemsActionMessage(extracted))];
                                case 6:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 7: return [4 /*yield*/, _itr.update(returnSelectItemsMessage())];
                                case 8:
                                    _b.sent();
                                    return [3 /*break*/, 9];
                                case 9: return [3 /*break*/, 11];
                                case 10:
                                    _err_2 = _b.sent();
                                    console.error(_err_2);
                                    listen();
                                    return [3 /*break*/, 11];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); };
                    listen = function () {
                        (0, Utility_1.setUpInteractionCollect)(invMessage, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!_itr.isSelectMenu()) return [3 /*break*/, 6];
                                        _a = _itr.customId;
                                        switch (_a) {
                                            case "select": return [3 /*break*/, 1];
                                            case "manage": return [3 /*break*/, 3];
                                        }
                                        return [3 /*break*/, 5];
                                    case 1: return [4 /*yield*/, selectingItem(_itr)];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 3: return [4 /*yield*/, managingItem(_itr)];
                                    case 4:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 5:
                                        listen();
                                        _b.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }, 1);
                    };
                    return [4 /*yield*/, message.reply({
                            embeds: [(0, Utility_1.getLoadingEmbed)()]
                        })];
                case 1:
                    invMessage = _a.sent();
                    interactionEvent = new InteractionEvent_1.InteractionEvent(author.id, invMessage, 'inventory');
                    iem = InteractionEventManager_1.InteractionEventManager.getInstance();
                    return [4 /*yield*/, iem.registerInteraction(author.id, interactionEvent, authorUserData)];
                case 2:
                    updatedUserData = (_a.sent());
                    invMessage.edit(returnSelectItemsMessage());
                    listen();
                    return [2 /*return*/];
            }
        });
    }); }
};
