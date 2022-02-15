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
exports.InteractionEventManager = void 0;
var jsons_1 = require("../jsons");
var Database_1 = require("./Database");
var InteractionEventManager = /** @class */ (function () {
    function InteractionEventManager() {
        this.user_interaction_map = new Map();
    }
    InteractionEventManager.getInstance = function () {
        if (InteractionEventManager.instance === undefined) {
            InteractionEventManager.instance = new InteractionEventManager();
        }
        return this.instance;
    };
    InteractionEventManager.prototype.userData = function (_id) {
        var _a;
        return ((_a = this.user_interaction_map.get(_id)) === null || _a === void 0 ? void 0 : _a.userData) || null;
    };
    InteractionEventManager.prototype.registerInteraction = function (_id, _interactionEvent, _userData) {
        return __awaiter(this, void 0, void 0, function () {
            var split, _a, _b, _c, _d, _e, existing;
            var _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = this.user_interaction_map.get(_id);
                        if (_a) return [3 /*break*/, 3];
                        _c = (_b = this.user_interaction_map).set;
                        _d = [_id];
                        _f = {};
                        _e = _userData;
                        if (_e) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, Database_1.getUserData)(_id)];
                    case 1:
                        _e = (_g.sent());
                        _g.label = 2;
                    case 2:
                        _a = _c.apply(_b, _d.concat([(_f.userData = _e,
                                _f.timer = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var nulledCount, interactionSplit, splitEntries, splitEntries_1, splitEntries_1_1, _a, _key, _value, interactionEventCount;
                                    var e_1, _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                nulledCount = 0;
                                                interactionSplit = this.user_interaction_map.get(_id);
                                                splitEntries = Object.entries(interactionSplit);
                                                try {
                                                    for (splitEntries_1 = __values(splitEntries), splitEntries_1_1 = splitEntries_1.next(); !splitEntries_1_1.done; splitEntries_1_1 = splitEntries_1.next()) {
                                                        _a = __read(splitEntries_1_1.value, 2), _key = _a[0], _value = _a[1];
                                                        if (_value === null) {
                                                            nulledCount++;
                                                        }
                                                    }
                                                }
                                                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                                finally {
                                                    try {
                                                        if (splitEntries_1_1 && !splitEntries_1_1.done && (_b = splitEntries_1.return)) _b.call(splitEntries_1);
                                                    }
                                                    finally { if (e_1) throw e_1.error; }
                                                }
                                                interactionEventCount = Object.keys(jsons_1.interactionEventData).length;
                                                if (!(nulledCount === interactionEventCount)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, (0, Database_1.saveUserData)(interactionSplit.userData)];
                                            case 1:
                                                _c.sent();
                                                clearInterval(interactionSplit.timer);
                                                this.user_interaction_map.delete(_id);
                                                _c.label = 2;
                                            case 2: return [2 /*return*/];
                                        }
                                    });
                                }); }, 1000),
                                _f['inventory'] = null,
                                _f['shop'] = null,
                                _f['battle'] = null,
                                _f['info'] = null,
                                _f['forge'] = null,
                                _f)])).get(_id);
                        _g.label = 3;
                    case 3:
                        split = _a;
                        existing = split[_interactionEvent.interactionEventType];
                        if (!existing || (existing && existing.stoppable === true)) {
                            this.stopInteraction(_id, _interactionEvent.interactionEventType);
                            split[_interactionEvent.interactionEventType] = _interactionEvent;
                            return [2 /*return*/, split.userData];
                        }
                        else {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    InteractionEventManager.prototype.stopInteraction = function (_userID, _eventType) {
        var _a;
        var interaction = this.user_interaction_map.get(_userID);
        if (interaction) {
            (_a = interaction[_eventType]) === null || _a === void 0 ? void 0 : _a.stop();
            interaction[_eventType] = null;
        }
    };
    return InteractionEventManager;
}());
exports.InteractionEventManager = InteractionEventManager;
