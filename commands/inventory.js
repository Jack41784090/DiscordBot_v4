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
var Database_1 = require("../classes/Database");
var Utility_1 = require("../classes/Utility");
var jsons_1 = require("../jsons");
var typedef_1 = require("../typedef");
module.exports = {
    commands: ['inventory'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: function (author, authorUserData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var getTimeout, returnSelectItemsMessage, returnItemsActionMessage, listen, itemSelected, timeout, invMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getTimeout = function () {
                        return setTimeout(function () {
                            (0, Database_1.saveUserData)(authorUserData);
                            invMessage.delete()
                                .catch(function (_err) { return console.error; });
                        }, 120 * 1000);
                    };
                    returnSelectItemsMessage = function () {
                        var selectMenuOptions = authorUserData.inventory.map(function (_item, _i) {
                            var _a;
                            return {
                                emoji: ((_a = jsons_1.itemData[_item.type]) === null || _a === void 0 ? void 0 : _a.emoji) || typedef_1.EMOJI_WHITEB,
                                label: _item.getDisplayName() + " (" + _item.getWeight(true) + ")",
                                description: "$" + _item.getWorth(true),
                                value: "" + _i,
                            };
                        }).splice(0, 24);
                        selectMenuOptions.push({
                            emoji: typedef_1.EMOJI_CROSS,
                            label: "Close",
                            value: "end",
                        });
                        var selectMenuActionRow = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions, "select");
                        return {
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setThumbnail('https://i.imgur.com/40Unw4T.png')
                                    .setTitle('Inventory')
                                    .setFooter("" + authorUserData.money, typedef_1.coinURL)
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
                            }
                        ];
                        var actionRow = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions, "manage");
                        _i.materialInfo.sort(function (_1, _2) { return _2.occupation - _1.occupation; });
                        return {
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setDescription(_i.materialInfo.map(function (_mI) { return _i.getMaterialInfoString(_mI); }).join("\n"))
                                    .setThumbnail('https://i.imgur.com/SCT19EA.png')
                                    .setTitle(_i.getDisplayName())
                                    .setFooter("" + authorUserData.money, typedef_1.coinURL)
                            ],
                            components: [actionRow],
                        };
                    };
                    listen = function () {
                        (0, Utility_1.setUpInteractionCollect)(invMessage, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, index, action, _b, _err_1;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!_itr.isSelectMenu()) return [3 /*break*/, 10];
                                        _c.label = 1;
                                    case 1:
                                        _c.trys.push([1, 9, , 10]);
                                        clearTimeout(timeout);
                                        timeout = getTimeout();
                                        _a = _itr.customId;
                                        switch (_a) {
                                            case "select": return [3 /*break*/, 2];
                                            case "manage": return [3 /*break*/, 4];
                                        }
                                        return [3 /*break*/, 8];
                                    case 2:
                                        index = parseInt(_itr.values[0]);
                                        itemSelected = authorUserData.inventory[index];
                                        return [4 /*yield*/, _itr.update(returnItemsActionMessage(itemSelected))];
                                    case 3:
                                        _c.sent();
                                        return [3 /*break*/, 8];
                                    case 4:
                                        action = _itr.values[0];
                                        _b = action;
                                        switch (_b) {
                                            case "sell": return [3 /*break*/, 5];
                                        }
                                        return [3 /*break*/, 7];
                                    case 5:
                                        authorUserData.money += itemSelected.getWorth();
                                        (0, Utility_1.arrayRemoveItemArray)(authorUserData.inventory, itemSelected);
                                        return [4 /*yield*/, _itr.update(returnSelectItemsMessage())];
                                    case 6:
                                        _c.sent();
                                        return [3 /*break*/, 7];
                                    case 7: return [3 /*break*/, 8];
                                    case 8:
                                        listen();
                                        return [3 /*break*/, 10];
                                    case 9:
                                        _err_1 = _c.sent();
                                        console.error(_err_1);
                                        listen();
                                        return [3 /*break*/, 10];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); }, 1);
                    };
                    timeout = getTimeout();
                    return [4 /*yield*/, message.reply(returnSelectItemsMessage())];
                case 1:
                    invMessage = _a.sent();
                    listen();
                    return [2 /*return*/];
            }
        });
    }); }
};
