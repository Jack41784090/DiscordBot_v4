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
exports.InteractionEvent = void 0;
var discord_js_1 = require("discord.js");
var InteractionEventManager_1 = require("./InteractionEventManager");
var console_1 = require("console");
var Utility_1 = require("./Utility");
var __1 = require("..");
var InteractionEvent = /** @class */ (function () {
    function InteractionEvent(_id, _message, _eventType, _options) {
        var _this = this;
        if (_options === void 0) { _options = {}; }
        this.stoppable = false;
        this.finishingPromiseResolve = function () { };
        this.ownerID = _id;
        this.type = _eventType;
        this.interactedMessage = _message;
        this.finishingPromise = new Promise(function (resolve) {
            _this.finishingPromiseResolve = resolve;
        });
        // inactivity stop
        this.finishingPromiseTimer = setTimeout(function () {
            _this.finishingPromiseResolve();
            _this.stop();
        }, _eventType === 'dungeon' ?
            1000 * 1000 :
            InteractionEvent.STANDARD_TIMEOUT);
        // special cases events
        switch (_eventType) {
            case 'battle':
            case 'dungeon':
                if (_options[_eventType] !== undefined) {
                    this.stoppable = false;
                    this[_eventType] = _options[_eventType];
                }
                else {
                    this.finishingPromiseResolve();
                }
                break;
            default:
                this.stoppable = true;
                break;
        }
    }
    InteractionEvent.prototype.stop = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var _c, user, mes, answer, event_1, removingUserData, i, room;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _c = this.type;
                        switch (_c) {
                            case 'battle': return [3 /*break*/, 1];
                            case 'dungeon': return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, __1.BotClient.users.fetch(this.ownerID)];
                    case 2:
                        user = (_d.sent()) || null;
                        if (!user) return [3 /*break*/, 5];
                        return [4 /*yield*/, user.send({
                                embeds: [
                                    new discord_js_1.MessageEmbed({
                                        title: "AFK Warning on your current " + (0, Utility_1.formalise)(this.type) + ".",
                                        footer: {
                                            text: "Answer yes to continue your session or else you will be removed automatically."
                                        }
                                    })
                                ]
                            })];
                    case 3:
                        mes = _d.sent();
                        return [4 /*yield*/, (0, Utility_1.confirmationInteractionCollect)(mes)];
                    case 4:
                        answer = _d.sent();
                        (0, console_1.debug)("answer", answer);
                        if ((answer === 0 || answer === -1)) {
                            (_a = this.battle) === null || _a === void 0 ? void 0 : _a.queueRemovePlayer(this.ownerID);
                        }
                        else {
                            event_1 = new InteractionEvent(this.ownerID, this.interactedMessage, 'battle', {
                                battle: this.battle
                            });
                            InteractionEventManager_1.InteractionEventManager.getInstance().registerInteraction(this.ownerID, event_1);
                        }
                        _d.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        if (this.dungeon) {
                            removingUserData = InteractionEventManager_1.InteractionEventManager.userData(this.ownerID || "");
                            // remove the player from the leader's userData and the dungeon's user cache
                            if (removingUserData) {
                                (0, Utility_1.arrayRemoveItemArray)(this.dungeon.userDataParty, this.dungeon.userDataParty.find(function (_ud) { return _ud.party[0] === _this.ownerID; }));
                                if (this.ownerID !== ((_b = this.dungeon.leaderUser) === null || _b === void 0 ? void 0 : _b.id) && this.dungeon.leaderUserData) {
                                    (0, Utility_1.arrayRemoveItemArray)(this.dungeon.leaderUserData.party, this.ownerID);
                                }
                            }
                            // remove the player from every possible future battles
                            for (i = 0; i < this.dungeon.rooms.length; i++) {
                                room = this.dungeon.rooms[i];
                                if (room.isBattleRoom) {
                                    room.battle.removeEntity(this.ownerID);
                                }
                            }
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        this.interactedMessage.delete()
                            .catch(function (_err) { return null; });
                        clearTimeout(this.finishingPromiseTimer);
                        this.finishingPromiseResolve();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    InteractionEvent.prototype.promise = function () {
        return this.finishingPromise;
    };
    InteractionEvent.prototype.activity = function () {
        var _this = this;
        clearTimeout(this.finishingPromiseTimer);
        this.finishingPromiseTimer = setTimeout(function () {
            _this.finishingPromiseResolve();
            _this.stop();
        }, InteractionEvent.STANDARD_TIMEOUT);
    };
    InteractionEvent.STANDARD_TIMEOUT = 2 * 1000;
    return InteractionEvent;
}());
exports.InteractionEvent = InteractionEvent;
