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
var InteractionEvent_1 = require("../classes/InteractionEvent");
var InteractionEventManager_1 = require("../classes/InteractionEventManager");
var Item_1 = require("../classes/Item");
var Utility_1 = require("../classes/Utility");
var jsons_1 = require("../jsons");
var typedef_1 = require("../typedef");
module.exports = {
    commands: ['shop'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: function (author, authorUserData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var returnMessage, listen, shopMessage, interactionEvent, updatedUserData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    returnMessage = function () {
                        var e_1, _a;
                        var _b, _c, _d;
                        var selectMenuOptions = [];
                        var _loop_1 = function (itemType) {
                            var itemName = itemType;
                            var itemsInInv = updatedUserData.inventory.filter(function (_i) { return _i.getItemType() === itemName; });
                            if (((_b = jsons_1.itemData[itemName]) === null || _b === void 0 ? void 0 : _b.price) > 0) {
                                selectMenuOptions.push({
                                    emoji: ((_c = jsons_1.itemData[itemName]) === null || _c === void 0 ? void 0 : _c.emoji) || typedef_1.EMOJI_WHITEB,
                                    label: (0, Utility_1.formalise)(itemName) + " x" + itemsInInv.length,
                                    description: "Buy $" + ((_d = jsons_1.itemData[itemName]) === null || _d === void 0 ? void 0 : _d.price),
                                    value: itemName,
                                });
                            }
                        };
                        try {
                            for (var _e = __values(Object.keys(jsons_1.itemData)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var itemType = _f.value;
                                _loop_1(itemType);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        selectMenuOptions.push({
                            emoji: typedef_1.EMOJI_CROSS,
                            label: "Leave Shop",
                            value: "end",
                        });
                        var selectMenuActionRow = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions);
                        return {
                            embeds: [
                                new discord_js_1.MessageEmbed()
                                    .setThumbnail('https://i.imgur.com/7ZU6klq.png')
                                    .setTitle('"All the items you need to survive a dungeon."')
                                    .setFooter("" + updatedUserData.money, 'https://i.imgur.com/FWylmwo.jpeg')
                            ],
                            components: [selectMenuActionRow]
                        };
                    };
                    listen = function () {
                        (0, Utility_1.setUpInteractionCollect)(shopMessage, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                            var itemBought, cost, vendorItem, _err_1;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!_itr.isSelectMenu()) return [3 /*break*/, 6];
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 5, , 6]);
                                        itemBought = _itr.values[0];
                                        cost = ((_a = jsons_1.itemData[itemBought]) === null || _a === void 0 ? void 0 : _a.price) || null;
                                        if (!(_itr.values[0] === 'end')) return [3 /*break*/, 2];
                                        shopMessage.delete()
                                            .catch(function (_err) { return console.error; });
                                        return [3 /*break*/, 4];
                                    case 2:
                                        if (!(cost !== null && updatedUserData.money - cost >= 0)) return [3 /*break*/, 4];
                                        vendorItem = Item_1.Item.Generate(itemBought, "Vendor");
                                        updatedUserData.money -= cost;
                                        updatedUserData.inventory.push(vendorItem);
                                        return [4 /*yield*/, _itr.update(returnMessage())];
                                    case 3:
                                        _b.sent();
                                        _b.label = 4;
                                    case 4:
                                        listen();
                                        return [3 /*break*/, 6];
                                    case 5:
                                        _err_1 = _b.sent();
                                        console.error(_err_1);
                                        listen();
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }, 1);
                    };
                    return [4 /*yield*/, message.reply({
                            embeds: [(0, Utility_1.getLoadingEmbed)()]
                        })];
                case 1:
                    shopMessage = _a.sent();
                    interactionEvent = new InteractionEvent_1.InteractionEvent(author.id, shopMessage, 'shop');
                    return [4 /*yield*/, InteractionEventManager_1.InteractionEventManager.getInstance().registerInteraction(author.id, interactionEvent, authorUserData)];
                case 2:
                    updatedUserData = (_a.sent());
                    shopMessage.edit(returnMessage());
                    listen();
                    return [2 /*return*/];
            }
        });
    }); }
};
