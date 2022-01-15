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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
var discord_js_1 = require("discord.js");
var Utility_1 = require("./Utility");
var canvas_1 = require("canvas");
var Database_1 = require("./Database");
var enemiesData_json_1 = __importDefault(require("../data/enemiesData.json"));
var weaponData_json_1 = __importDefault(require("../data/weaponData.json"));
var fs_1 = __importDefault(require("fs"));
var MinHeap_1 = require("./MinHeap");
var typedef_1 = require("../typedef");
var hGraphTheory_1 = require("./hGraphTheory");
var WeaponEffect_1 = require("./WeaponEffect");
var BattleManager_1 = require("./BattleManager");
var Battle = /** @class */ (function () {
    function Battle(_mapData, _author, _message, _client, _pvp, _party) {
        var _this = this;
        this.author = _author;
        this.message = _message;
        this.channel = _message.channel;
        this.client = _client;
        this.guild = _message.guild;
        this.party = _party;
        this.mapData = _mapData;
        this.width = _mapData.map.width;
        this.height = _mapData.map.height;
        this.CSMap = (0, Utility_1.getMapFromCS)(_mapData.map.coordStat);
        this.pixelsPerTile = 50;
        this.userCache = new Map();
        this.pvp = _pvp;
        // action strings
        this.roundActionsArray = [];
        this.roundSavedCanvasMap = new Map();
        var allStats = this.allStats(true);
        // fixing spawning
        this.tobespawnedArray = [];
        this.totalEnemyCount = 0;
        this.enemyCount = 0;
        this.playerCount = 0;
        // fix index
        this.allIndex = new Map();
        allStats.forEach(function (s) {
            if (s.index !== -1)
                _this.allIndex.set(s.index, true);
            else {
                s.index = _this.getIndex();
                _this.allIndex.set(s.index, true);
                (0, Utility_1.log)("New index for ", s.base.class, s.index);
            }
        });
    }
    /** Generate a Battle but does not start it */
    Battle.Generate = function (_mapData, _author, _message, _party, _client, _pvp) {
        if (_pvp === void 0) { _pvp = false; }
        return __awaiter(this, void 0, void 0, function () {
            var battle, i, ownerID, userData, blankStat, _b, _c, _d, key, value, Eclass, mod, enemyBase, spawnCount, i;
            var e_1, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        battle = new Battle(_mapData, _author, _message, _client, _pvp, _party);
                        i = 0;
                        _f.label = 1;
                    case 1:
                        if (!(i < _party.length)) return [3 /*break*/, 4];
                        ownerID = _party[i];
                        return [4 /*yield*/, (0, Database_1.getUserData)(ownerID)];
                    case 2:
                        userData = _f.sent();
                        blankStat = (0, Utility_1.getStat)((0, Utility_1.getBaseStat)(userData.equippedClass), ownerID);
                        if (_pvp) {
                            blankStat.pvp = true;
                        }
                        battle.tobespawnedArray.push(blankStat);
                        _f.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // add enemies to the spawning list
                        if (!_pvp) {
                            try {
                                for (_b = __values(Object.entries(_mapData.enemiesInfo)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                                    Eclass = key;
                                    mod = { name: "" + Eclass };
                                    enemyBase = (0, Utility_1.getNewObject)(enemiesData_json_1.default[Eclass], mod);
                                    spawnCount = (0, Utility_1.random)(value.min, value.max);
                                    for (i = 0; i < spawnCount; i++) {
                                        battle.totalEnemyCount++;
                                        battle.enemyCount++;
                                        battle.tobespawnedArray.push((0, Utility_1.getStat)(enemyBase));
                                    }
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_e = _b.return)) _e.call(_b);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                        // attach ongoing battle to Manager
                        BattleManager_1.BattleManager.Manager.set(_author.id, battle);
                        return [2 /*return*/, battle];
                }
            });
        });
    };
    /** Main function to access in order to start a thread of battle */
    Battle.Start = function (_mapData, _author, _message, _party, _client, _pvp) {
        if (_pvp === void 0) { _pvp = false; }
        return __awaiter(this, void 0, void 0, function () {
            var battle;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Battle.Generate(_mapData, _author, _message, _party, _client, _pvp)];
                    case 1:
                        battle = _b.sent();
                        battle.StartRound();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** An alternative to Start when the battle is already initiated. Gives additional options to begin. */
    Battle.prototype.StartBattle = function (_options) {
        return __awaiter(this, void 0, void 0, function () {
            var allStats, playerStats, i, player, welfare, ambushingTeam, i, ambusher;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        allStats = this.allStats();
                        playerStats = this.party.map(function (_ownerID) { return allStats.find(function (_s) { return _s.owner === _ownerID; }); });
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < playerStats.length)) return [3 /*break*/, 4];
                        player = playerStats[i];
                        if (!player) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, Database_1.getUserWelfare)(player.owner)];
                    case 2:
                        welfare = _b.sent();
                        if (welfare !== null) {
                            player.HP = player.base.AHP * (0, Utility_1.clamp)(welfare, 0, 1);
                        }
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // ambush
                        if (_options.ambush && _options.ambush !== 'block') {
                            ambushingTeam = _options.ambush;
                            for (i = 0; i < allStats.length; i++) {
                                ambusher = allStats[i];
                                if (ambusher.team === ambushingTeam) {
                                    ambusher.readiness = 50;
                                    ambusher.sword = 3;
                                    ambusher.sprint = 3;
                                }
                            }
                        }
                        return [2 /*return*/, this.StartRound()];
                }
            });
        });
    };
    /** Begin a new round
        Recurses into another StartRound until all enemies / players are defeated (HP <= 0). */
    Battle.prototype.StartRound = function () {
        var _b, _c, _d;
        return __awaiter(this, void 0, void 0, function () {
            var i, spawning, allStats, _loop_1, i, existingCategory, commandCategory, _e, existingPermissions_everyone, currentMapDataURL, reportPromises, _loop_2, this_1, allStats_1, allStats_1_1, realStat, e_2_1, priorityActionMap, i, act, actionListThisRound, latestAction, latestRound, i, roundExpectedActions, canvas, ctx, roundCanvas, executedActions, actualCanvas, _loop_3, i, allPromise, players;
            var e_2, _f;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        (0, Utility_1.log)("======= New Round =======");
                        // resetting action list and round current maps
                        this.roundActionsArray = [];
                        this.roundSavedCanvasMap.clear();
                        // SPAWNING
                        (0, Utility_1.log)("Currently waiting to be spawned...");
                        for (i = 0; i < this.tobespawnedArray.length; i++) {
                            spawning = this.tobespawnedArray[i];
                            (0, Utility_1.log)("\t{ index:" + spawning.index + ", class:" + spawning.base.class + " }");
                        }
                        (0, Utility_1.log)("Spawning...");
                        this.SpawnOnSpawner();
                        allStats = this.allStats();
                        //#region COUNT LIVES
                        (0, Utility_1.log)("Counting lives...");
                        this.playerCount = allStats.reduce(function (acc, stat) { return acc + Number(stat.team === "player" && stat.HP > 0); }, 0);
                        (0, Utility_1.debug)("   PlayerCount", this.playerCount);
                        (0, Utility_1.debug)("   Remaining Enemies", this.totalEnemyCount);
                        //#endregion
                        //#region INCREASE ALL READINESS & TOKENS
                        (0, Utility_1.log)("Readiness ticking...");
                        _loop_1 = function (i) {
                            var s = allStats[i];
                            if (s.team === 'block')
                                return "continue";
                            // randomly assign tokens
                            for (var i_1 = 0; i_1 < 2; i_1++) {
                                var token = (0, Utility_1.random)(0, 2);
                                (0, Utility_1.log)("\t" + s.base.class + " (" + s.index + ") got " + token);
                                switch (token) {
                                    case 0:
                                        s.sword++;
                                        break;
                                    case 1:
                                        s.shield++;
                                        break;
                                    case 2:
                                        s.sprint++;
                                        break;
                                }
                            }
                            // limit the entity's tokens
                            (0, Utility_1.HandleTokens)(s, function (p, t) {
                                (0, Utility_1.log)("\t\t" + s.index + ") " + t + " =" + (0, Utility_1.clamp)(p, 0, 5));
                                s[t] = (0, Utility_1.clamp)(p, 0, 5);
                            });
                            // increment readiness
                            if (s.readiness <= 50) {
                                var Spd = (0, Utility_1.getSpd)(s);
                                var read = (0, Utility_1.random)(Spd * 4, Spd * 4.25);
                                s.readiness += read;
                                // limit readiness to 50
                                if (s.readiness > 50) {
                                    s.readiness = 50;
                                }
                            }
                        };
                        for (i = 0; i < allStats.length; i++) {
                            _loop_1(i);
                        }
                        existingCategory = this.guild.channels.cache.find(function (gC) { return gC.name === 'CommandRooms' + _this.guild.id && gC.type === 'GUILD_CATEGORY'; });
                        _e = existingCategory;
                        if (_e) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.guild.channels.create('CommandRooms' + this.guild.id, { type: 'GUILD_CATEGORY' })];
                    case 1:
                        _e = (_g.sent());
                        _g.label = 2;
                    case 2:
                        commandCategory = _e;
                        existingPermissions_everyone = (_b = commandCategory.permissionOverwrites.cache.get(this.guild.roles.everyone.id)) === null || _b === void 0 ? void 0 : _b.deny.toArray();
                        if (!(existingPermissions_everyone === null || existingPermissions_everyone === void 0 ? void 0 : existingPermissions_everyone.includes("VIEW_CHANNEL"))) {
                            commandCategory.permissionOverwrites.set([{ id: this.guild.roles.everyone.id, deny: 'VIEW_CHANNEL' }]);
                        }
                        //#endregion
                        //#region SAVE CURRENT MAP TO LOCAL
                        (0, Utility_1.log)("Saving current map to local...");
                        return [4 /*yield*/, this.getNewCanvasMap()];
                    case 3:
                        currentMapDataURL = (_g.sent()).toDataURL();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var thePath = "./maps/battle-" + _this.author.id + ".txt";
                                fs_1.default.writeFile(thePath, currentMapDataURL, 'utf8', function () {
                                    clearTimeout(saveFailedErrorTimeout);
                                    resolve(void 0);
                                });
                                var saveFailedErrorTimeout = setTimeout(function () {
                                    resolve(void 0);
                                }, 10 * 1000);
                            })];
                    case 4:
                        _g.sent();
                        (0, Utility_1.log)("||=> Success.");
                        reportPromises = [];
                        (0, Utility_1.log)("Playing phase!");
                        _loop_2 = function (realStat) {
                            var user, _h, virtualStat_1, channelAlreadyExist, createdChannel_1, _j, existingPermissions_everyone_1, existingPermissions_author, newChannel, noExistingPermission, extraPermissions, missingPermissions, overWrites, playerInfoMessage, _k, _l, readingPlayerPromise, virtualStat, intendedTargets, selectedTarget, weaponSelected, path, moveActionArray, fullActions, i, moveAction, moveMagnitude, valid, error, attackAction, valid;
                            var _m;
                            return __generator(this, function (_o) {
                                switch (_o.label) {
                                    case 0:
                                        // if the entity is dead or is just an inanimate block, skip turn
                                        if (realStat.HP <= 0 || realStat.team === "block")
                                            return [2 /*return*/, "continue"];
                                        // reset weapon uses for entity
                                        realStat.weaponUses = realStat.weaponUses.map(function (_wU) { return 0; });
                                        // reset moved
                                        realStat.moved = false;
                                        // reset associatedStrings
                                        realStat.actionsAssociatedStrings = {};
                                        if (!(realStat.botType === typedef_1.BotType.naught && realStat.owner)) return [3 /*break*/, 7];
                                        _h = this_1.userCache.get(realStat.owner);
                                        if (_h) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this_1.client.users.fetch(realStat.owner)
                                                .then(function (u) {
                                                _this.userCache.set(realStat.owner, u);
                                                return u;
                                            })
                                                .catch(function (err) {
                                                console.log(err);
                                                return null;
                                            })];
                                    case 1:
                                        _h = (_o.sent());
                                        _o.label = 2;
                                    case 2:
                                        user = _h;
                                        virtualStat_1 = (0, Utility_1.getNewObject)(realStat, {
                                            username: user === null || user === void 0 ? void 0 : user.username,
                                            virtual: true
                                        });
                                        channelAlreadyExist = this_1.guild.channels.cache.find(function (c) { return c.name === virtualStat_1.owner && c.type === 'GUILD_TEXT'; });
                                        _j = channelAlreadyExist;
                                        if (_j) return [3 /*break*/, 4];
                                        return [4 /*yield*/, this_1.guild.channels.create("" + virtualStat_1.owner, { type: 'GUILD_TEXT' })];
                                    case 3:
                                        _j = (_o.sent());
                                        _o.label = 4;
                                    case 4:
                                        createdChannel_1 = _j;
                                        if (!createdChannel_1.parent || createdChannel_1.parent.name !== commandCategory.name) {
                                            createdChannel_1.setParent(commandCategory.id);
                                        }
                                        existingPermissions_everyone_1 = (_c = createdChannel_1.permissionOverwrites.cache.get(this_1.guild.roles.everyone.id)) === null || _c === void 0 ? void 0 : _c.deny.toArray();
                                        existingPermissions_author = (_d = createdChannel_1.permissionOverwrites.cache.get(virtualStat_1.owner)) === null || _d === void 0 ? void 0 : _d.allow.toArray();
                                        newChannel = !channelAlreadyExist;
                                        noExistingPermission = (!existingPermissions_author || !existingPermissions_everyone_1);
                                        extraPermissions = existingPermissions_author && existingPermissions_everyone_1 && (existingPermissions_author.length > 1 || existingPermissions_everyone_1.length > 1);
                                        missingPermissions = existingPermissions_author && existingPermissions_everyone_1 && (!existingPermissions_author.includes('VIEW_CHANNEL') || !existingPermissions_everyone_1.includes('VIEW_CHANNEL'));
                                        // log(newChannel, noExistingPermission, extraPermissions, missingPermissions);
                                        if (newChannel ||
                                            // new channel, set permission
                                            noExistingPermission ||
                                            // no existing permissions
                                            extraPermissions ||
                                            // extra permissions
                                            missingPermissions
                                        // missing permissions
                                        ) {
                                            overWrites = [
                                                { id: this_1.guild.roles.everyone, deny: 'VIEW_CHANNEL' },
                                                { id: virtualStat_1.owner, allow: 'VIEW_CHANNEL' }
                                            ];
                                            createdChannel_1.permissionOverwrites.set(overWrites);
                                        }
                                        // mention user
                                        createdChannel_1.send("<@" + (user === null || user === void 0 ? void 0 : user.id) + ">").then(function (mes) { return mes.delete().catch(console.log); });
                                        // send time, player embed, and input manual
                                        createdChannel_1.send("``` ```");
                                        _l = (_k = createdChannel_1).send;
                                        return [4 /*yield*/, this_1.getFullPlayerEmbedMessageOptions(virtualStat_1)];
                                    case 5: return [4 /*yield*/, _l.apply(_k, [_o.sent()])];
                                    case 6:
                                        playerInfoMessage = _o.sent();
                                        readingPlayerPromise = this_1.readActions(120, playerInfoMessage, virtualStat_1, realStat).then(function () {
                                            createdChannel_1.send({ embeds: [new discord_js_1.MessageEmbed().setTitle("Your turn has ended.")] });
                                        });
                                        reportPromises.push(readingPlayerPromise);
                                        _o.label = 7;
                                    case 7:
                                        //#endregion
                                        //#region AI
                                        if (realStat.botType === typedef_1.BotType.enemy) {
                                            virtualStat = (0, Utility_1.getNewObject)(realStat);
                                            intendedTargets = ["block"];
                                            if (virtualStat.team) {
                                                intendedTargets.push(virtualStat.team);
                                            }
                                            selectedTarget = this_1.findEntity_closest(virtualStat, intendedTargets);
                                            // option 2: select the weakest target
                                            // if found a target
                                            if (selectedTarget !== null) {
                                                weaponSelected = virtualStat.base.weapons[0];
                                                path = this_1.startPathFinding(realStat, selectedTarget);
                                                moveActionArray = this_1.getMoveActionListFromCoordArray(realStat, path);
                                                fullActions = [];
                                                i = 0;
                                                // while the enemy has not moved or has enough sprint to make additional moves
                                                // Using (rstat.sprint - i) because rstat is by reference and modification is only legal in execution.
                                                while (i < moveActionArray.length && (virtualStat.moved === false || virtualStat.sprint > 0)) {
                                                    moveAction = moveActionArray[i];
                                                    moveMagnitude = Math.abs(moveAction.magnitude);
                                                    if (moveMagnitude > 0) {
                                                        moveAction.sprint = Number(virtualStat.moved);
                                                        valid = this_1.executeVirtualMovement(moveAction, virtualStat);
                                                        if (valid) {
                                                            virtualStat.moved = true;
                                                            if (moveAction.magnitude !== undefined) {
                                                                fullActions.push(moveAction);
                                                            }
                                                        }
                                                        else {
                                                            error = this_1.validateMovement(virtualStat, moveAction);
                                                            (0, Utility_1.log)("Failed to move. Reason: " + (error === null || error === void 0 ? void 0 : error.reason) + " (" + (error === null || error === void 0 ? void 0 : error.value) + ")");
                                                        }
                                                    }
                                                    i++;
                                                }
                                                // 3. attack with selected weapon
                                                if ((0, Utility_1.checkWithinDistance)(weaponSelected, (0, Utility_1.getDistance)(virtualStat, selectedTarget))) {
                                                    attackAction = (0, Utility_1.getAttackAction)(virtualStat, selectedTarget, weaponSelected, selectedTarget, fullActions.length + 1);
                                                    valid = this_1.executeVirtualAttack(attackAction, virtualStat);
                                                    if (valid) {
                                                        fullActions.push((0, Utility_1.getAttackAction)(realStat, selectedTarget, weaponSelected, selectedTarget, fullActions.length + 1));
                                                    }
                                                }
                                                (_m = this_1.roundActionsArray).push.apply(_m, __spreadArray([], __read(fullActions), false));
                                            }
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _g.label = 5;
                    case 5:
                        _g.trys.push([5, 10, 11, 12]);
                        allStats_1 = __values(allStats), allStats_1_1 = allStats_1.next();
                        _g.label = 6;
                    case 6:
                        if (!!allStats_1_1.done) return [3 /*break*/, 9];
                        realStat = allStats_1_1.value;
                        return [5 /*yield**/, _loop_2(realStat)];
                    case 7:
                        _g.sent();
                        _g.label = 8;
                    case 8:
                        allStats_1_1 = allStats_1.next();
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 12];
                    case 11:
                        try {
                            if (allStats_1_1 && !allStats_1_1.done && (_f = allStats_1.return)) _f.call(allStats_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 12: 
                    //#endregion
                    //#region WAIT FOR PLAYER INPUTS
                    return [4 /*yield*/, Promise.all(reportPromises)];
                    case 13:
                        //#endregion
                        //#region WAIT FOR PLAYER INPUTS
                        _g.sent();
                        (0, Utility_1.log)("Players are all ready!");
                        priorityActionMap = new Map();
                        for (i = 0; i < this.roundActionsArray.length; i++) {
                            act = this.roundActionsArray[i];
                            actionListThisRound = priorityActionMap.get(act.round);
                            if (actionListThisRound)
                                actionListThisRound.push(act);
                            else
                                priorityActionMap.set(act.round, [act]);
                        }
                        latestAction = (0, Utility_1.getLargestInArray)(this.roundActionsArray, function (_a) { return _a.round; });
                        if (!latestAction) return [3 /*break*/, 19];
                        latestRound = latestAction.round;
                        i = 0;
                        _g.label = 14;
                    case 14:
                        if (!(i <= latestRound)) return [3 /*break*/, 18];
                        roundExpectedActions = priorityActionMap.get(i);
                        if (!roundExpectedActions) return [3 /*break*/, 17];
                        this.greaterPriorSort(roundExpectedActions);
                        canvas = this.roundSavedCanvasMap.get(i);
                        if (!canvas) {
                            canvas = new canvas_1.Canvas(this.width * this.pixelsPerTile, this.height * this.pixelsPerTile);
                            if (canvas)
                                this.roundSavedCanvasMap.set(i, canvas);
                        }
                        ctx = canvas.getContext("2d");
                        return [4 /*yield*/, this.getNewCanvasMap()];
                    case 15:
                        roundCanvas = _g.sent();
                        this.drawHealthArcs(roundCanvas);
                        this.drawIndexi(roundCanvas);
                        ctx.drawImage(roundCanvas, 0, 0, canvas.width, canvas.height);
                        executedActions = this.executeActions(roundExpectedActions);
                        return [4 /*yield*/, this.getActionArrowsCanvas(executedActions)];
                    case 16:
                        actualCanvas = _g.sent();
                        ctx.drawImage(actualCanvas, 0, 0, canvas.width, canvas.height);
                        // update the final canvas
                        this.roundSavedCanvasMap.set(i, canvas);
                        _g.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 14];
                    case 18:
                        _loop_3 = function (i) {
                            var s = allStats[i];
                            (0, Utility_1.HandleTokens)(s, function (p, t) {
                                if (p > 3) {
                                    (0, Utility_1.log)("\t\t" + s.index + ") " + t + " =" + 3);
                                    s[t] = 3;
                                }
                            });
                        };
                        //#endregion
                        // limit token count
                        for (i = 0; i < allStats.length; i++) {
                            _loop_3(i);
                        }
                        _g.label = 19;
                    case 19:
                        // check death: after player round
                        this.checkDeath(allStats);
                        //#region REPORT ACTIONS
                        (0, Utility_1.log)("Reporting...");
                        allPromise = [];
                        players = allStats.filter(function (s) { return s.botType === typedef_1.BotType.naught; });
                        players.forEach(function (stat) { return __awaiter(_this, void 0, void 0, function () {
                            var allRounds, greatestRoundNumber, commandRoomReport;
                            return __generator(this, function (_b) {
                                allRounds = Array.from(this.roundSavedCanvasMap.keys());
                                greatestRoundNumber = (0, Utility_1.getLargestInArray)(allRounds, function (_) { return _; });
                                if (greatestRoundNumber) {
                                    commandRoomReport = this.sendReportToCommand(stat.owner, greatestRoundNumber);
                                    allPromise.push(commandRoomReport);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        // wait for all players to finish reading the reports
                        return [4 /*yield*/, new Promise(function (resolve) {
                                Promise.all(allPromise).then(function () { return resolve(void 0); });
                                setTimeout(function () {
                                    resolve(void 0);
                                }, 150 * 1000);
                            })];
                    case 20:
                        // wait for all players to finish reading the reports
                        _g.sent();
                        (0, Utility_1.log)("Reporting phase finished.");
                        // allPromise.forEach(console.log);
                        //#endregion
                        return [2 /*return*/, this.FinishRound()];
                }
            });
        });
    };
    Battle.prototype.FinishRound = function () {
        var _b;
        (0, Utility_1.log)("Finishing Round...");
        var PVE = this.playerCount === 0 || (this.totalEnemyCount === 0 && this.tobespawnedArray.length === 0);
        var PVP = this.playerCount === 1;
        if ((this.pvp && PVP) || (!this.pvp && PVE)) {
            // database work
            // await Database.updateOrAddUser(author, { status: 'idle' });
            // await Database.WriteBattle(author, Object.assign(this.returnObject(), { finished: true }));
            // == ACCOLADES ==
            var endEmbedFields_1 = [];
            this.callbackOnParty(function (stat) {
                var statAcco = stat.accolades;
                var value = "Kills: " + statAcco.kill + "\n                        Damage Dealt: " + (0, Utility_1.roundToDecimalPlace)(statAcco.damageDealt) + "\n                        Healing Done: " + (0, Utility_1.roundToDecimalPlace)(statAcco.healingDone) + "\n                        Damage Absorbed: " + (0, Utility_1.roundToDecimalPlace)(statAcco.absorbed) + "\n                        Damage Taken: " + (0, Utility_1.roundToDecimalPlace)(statAcco.damageTaken) + "\n                        Dodged: " + statAcco.dodged + " times\n                        Critical Hits: " + statAcco.critNo + " times\n                        Clashed " + statAcco.clashNo + " times\n                        Average Rolls: " + ((0, Utility_1.roundToDecimalPlace)(statAcco.rollAverage) || "N/A");
                endEmbedFields_1.push({
                    name: stat.name + (" (" + stat.base.class + ")"),
                    value: value,
                });
            });
            var victoryTitle = this.pvp ?
                (((_b = this.allStats().find(function (_s) { return _s.owner && _s.HP > 0; })) === null || _b === void 0 ? void 0 : _b.base.class) || "What? No one ") + " wins!" :
                this.totalEnemyCount === 0 ? "VICTORY!" : "Defeat.";
            this.channel.send({
                embeds: [new discord_js_1.MessageEmbed({
                        title: victoryTitle,
                        fields: endEmbedFields_1,
                    })]
            });
            return this.totalEnemyCount === 0;
        }
        else {
            return this.StartRound();
        }
    };
    /** Execute function on every stat of players */
    Battle.prototype.callbackOnParty = function (_callback) {
        var playersArray = this.allStats().filter(function (_s) { return _s.owner; });
        playersArray.forEach(_callback);
    };
    /** Get array of all Stat, saved by reference */
    Battle.prototype.allStats = function (excludeBlock) {
        if (excludeBlock === void 0) { excludeBlock = false; }
        var unsorted = __spreadArray([], __read(this.CSMap.values()), false); // saved by reference (pointer), not by value. (?) (https://www.typescriptlang.org/play?#code/PTAEHUFMBsGMHsC2lQBd5oBYoCoE8AHSAZVgCcBLA1UABWgEM8BzM+AVwDsATAGiwoBnUENANQAd0gAjQRVSQAUCEmYKsTKGYUAbpGF4OY0BoadYKdJMoL+gzAzIoz3UNEiPOofEVKVqAHSKymAAmkYI7NCuqGqcANag8ABmIjQUXrFOKBJMggBcISGgoAC0oACCbvCwDKgU8JkY7p7ehCTkVDQS2E6gnPCxGcwmZqDSTgzxxWWVoASMFmgYkAAeRJTInN3ymj4d-jSCeNsMq-wuoPaOltigAKoASgAywhK7SbGQZIIz5VWCFzSeCrZagNYbChbHaxUDcCjJZLfSDbExIAgUdxkUBIursJzCFJtXydajBBCcQQ0eDSABWkFgqAAjKAALygADeoB0DGg7Eg+VALIAvgBuRQUqlJOkM1AAJjZnO5vP5goVYoljSlNPpjIAzIquTy+QLQAaNZLqTLGQAWQ3Kk2Cu0WrU0RAMAiCgCyHoAPFTKJxmPwAPLW1AAPkVnEgElAPoI-tQgeDoDDusjAAoAJTixTuggBQSQVCZgBEIZjZf4OtlTNz+Y9RZL5ZwEng1elGblDYLzdLZZwmGyndr+t7TeLA4AYhwyKPwzaG5rKVaMxUyGQmNO2IgAGoq-SKgDaATPfeN-MEOYAuuLLV3ZRut3gT4-GUya+G5V+M3rf7Kdp3sEyTwNimbuOkioAAyiiIoC+qANpwRQADUqHZpyiglCUD46oqY6oM+TDHhQwE4Wiq5djuSB7gR4bEXgNH7oegikcB2E4ZK8DuAE0DwMwmb4ay7I6sxe4NsKwQqDgzQeGQXiIGBzjAuwNBfG4ZjMOwDDMJA-CwNA6iJAwwJ6CIXhlgAoqsDCIAs+hlkk2JluADioAA5MIABysZlkEKghl8ZDvMW-B6UcqCOAorjSK+ThKTowxYPoKAIIg0LCJcGntmQ0QiAYc7zIwLBsFw3BBCUQA)
        return unsorted.filter(function (s) { return (!excludeBlock || s.team !== "block"); });
    };
    /** Get a string showing all nearby enemies reachable by weapon */
    Battle.prototype.getNearbyEnemiesInfo = function (stat) {
        var enemyCount = 0;
        var string = "";
        var longArm = (0, Utility_1.findLongArm)(stat.base.weapons);
        var longestRange = longArm.Range[1];
        var nearbyEnemies = this.findEntities_radius(stat, longestRange);
        var nearbyEnemiesSorted = nearbyEnemies.sort(function (a, b) { return (0, Utility_1.getDistance)(stat, a) - (0, Utility_1.getDistance)(stat, b); });
        while (nearbyEnemiesSorted[0] && enemyCount < 10) {
            var s = nearbyEnemies.shift();
            var distanceBetween = (0, Utility_1.getDistance)(stat, s);
            var IsWithinDistance = (0, Utility_1.checkWithinDistance)((0, Utility_1.newWeapon)(longArm, { Range: [1, 5] }), distanceBetween);
            var AHP = (0, Utility_1.getAHP)(s);
            if (IsWithinDistance && string.length < 990) {
                string += ("(**" + s.index + "**) " + s.base.class + " (" + s.x + ", " + s.y + ")" + "`" + (0, Utility_1.addHPBar)(AHP * (30 / AHP), s.HP * (30 / AHP))) + "` (" + (0, Utility_1.roundToDecimalPlace)(s.HP, 1) + ")";
                for (var i = 0; i < stat.base.weapons.length; i++) {
                    var isAlly = s.team === "player";
                    var isEnemy = s.team === "enemy";
                    var weapon = stat.base.weapons[i];
                    if ((0, Utility_1.checkWithinDistance)(stat.base.weapons[i], distanceBetween)) {
                        if (isAlly && weapon.targetting.target === typedef_1.WeaponTarget.ally) {
                            string += "`" + "\uD83D\uDEE1\uFE0F" + stat.base.weapons[i].Name + "`";
                        }
                        if (isEnemy && weapon.targetting.target === typedef_1.WeaponTarget.enemy) {
                            string += "`" + "\uD83D\uDDE1\uFE0F" + stat.base.weapons[i].Name + "`";
                        }
                    }
                }
                string += "";
            }
            enemyCount++;
        }
        return string;
    };
    /** Return an array of coordinates that are not occupied currently, based on the moveAction magnitude and direction */
    Battle.prototype.getAvailableSpacesAhead = function (moveAction) {
        var magnitude = moveAction.magnitude;
        var axis = moveAction.axis;
        var stat = moveAction.affected;
        var availableSeats = [];
        var dir = Math.sign(magnitude);
        for (var i = 1; i <= Math.abs(magnitude); i++) {
            var newCoord = { x: stat.x, y: stat.y };
            newCoord[axis] += (i * dir);
            if (this.checkVacantPlace(newCoord))
                availableSeats.push(newCoord);
            else
                return availableSeats;
        }
        return availableSeats;
    };
    Battle.prototype.sendToCommand = function (roomID, message) {
        var commandRoom = this.message.guild.channels.cache.find(function (c) { return c.name === roomID && c.type === 'GUILD_TEXT'; });
        if (commandRoom) {
            return commandRoom.send(message);
        }
    };
    Battle.prototype.sendReportToCommand = function (roomID, round) {
        return __awaiter(this, void 0, void 0, function () {
            var chosenCanvas, menuOptions, embed, messageOption, associatedStat, promisedMsg_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        chosenCanvas = this.roundSavedCanvasMap.get(round);
                        if (!chosenCanvas) return [3 /*break*/, 2];
                        menuOptions = Array.from(this.roundSavedCanvasMap.keys()).map(function (rn) {
                            return {
                                label: "Round " + rn,
                                value: "" + rn,
                            };
                        });
                        embed = new discord_js_1.MessageEmbed({
                            title: "Round " + round,
                            description: ""
                        }).setImage("attachment://map.png");
                        messageOption = {
                            embeds: [embed],
                            components: [(0, Utility_1.getSelectMenuActionRow)(menuOptions)],
                            files: [{ attachment: chosenCanvas.toBuffer(), name: 'map.png' }]
                        };
                        associatedStat = this.allStats(true).find(function (_s) { return _s.owner === roomID; });
                        if (associatedStat && associatedStat.actionsAssociatedStrings[round] !== undefined) {
                            (0, Utility_1.log)(associatedStat.actionsAssociatedStrings[round]);
                            embed.description = (0, Utility_1.shortenString)(associatedStat.actionsAssociatedStrings[round].join('\n\n'));
                        }
                        if (embed.description === "") {
                            embed.description = "*(No Actions this Round )*";
                        }
                        return [4 /*yield*/, this.sendToCommand(roomID, messageOption)];
                    case 1:
                        promisedMsg_1 = _b.sent();
                        if (promisedMsg_1) {
                            return [2 /*return*/, new Promise(function (resolve) {
                                    var itrCollector = (0, Utility_1.setUpInteractionCollect)(promisedMsg_1, function (itr) { return __awaiter(_this, void 0, void 0, function () {
                                        var selectedRound;
                                        return __generator(this, function (_b) {
                                            if (itr.isSelectMenu()) {
                                                selectedRound = parseInt(itr.values[0]);
                                                clearTimeout(timeOut);
                                                promisedMsg_1.delete();
                                                resolve(this.sendReportToCommand(roomID, selectedRound));
                                            }
                                            return [2 /*return*/];
                                        });
                                    }); });
                                    // timeout: done checking round
                                    var timeOut = setTimeout(function () {
                                        itrCollector.stop();
                                        resolve(true);
                                    }, 15 * 1000);
                                })];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    Battle.prototype.getStatsRoundActions = function (stat) {
        return this.roundActionsArray.filter(function (a) { return a.from.index === stat.index; });
    };
    Battle.prototype.drawSquareOnBattleCoords = function (ctx, coord, rgba) {
        var canvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(coord, this.pixelsPerTile, this.height, false);
        if (rgba) {
            ctx.fillStyle = (0, Utility_1.stringifyRGBA)(rgba);
        }
        ctx.fillRect(canvasCoord.x, canvasCoord.y, this.pixelsPerTile, this.pixelsPerTile);
    };
    // virtual actions (actions that only change the virtualStat)
    Battle.prototype.executeVirtualAttack = function (_aA, _virtualAttacker) {
        var target = _aA.affected;
        var weapon = _aA.weapon;
        var check = this.validateTarget(_virtualAttacker, _aA.weapon, target);
        if (check === null) { // attack goes through
            _virtualAttacker.weaponUses[(0, Utility_1.getWeaponIndex)(weapon, _virtualAttacker)]++;
            _virtualAttacker.readiness -= _aA.readiness;
            (0, Utility_1.HandleTokens)(_virtualAttacker, function (p, t) {
                (0, Utility_1.log)("\t\t" + _virtualAttacker.index + ") " + t + " --" + _aA[t]);
                _virtualAttacker[t] -= _aA[t];
            });
        }
        else { // attack cannot go through
            (0, Utility_1.log)("Failed to target. Reason: " + check.reason + " (" + check.value + ")");
        }
        return check === null;
    };
    ;
    Battle.prototype.executeVirtualMovement = function (_mA, virtualStat) {
        (0, Utility_1.log)("\tExecuting virtual movement for " + virtualStat.base.class + " (" + virtualStat.index + ").");
        var check = this.validateMovement(virtualStat, _mA);
        if (check === null) {
            (0, Utility_1.log)("\t\tMoved!");
            // spending sprint to move
            if (virtualStat.moved === true) {
                (0, Utility_1.HandleTokens)(_mA, function (p, type) {
                    if (type === "sprint") {
                        (0, Utility_1.log)("\t\t" + virtualStat.index + ") " + type + " --" + p);
                        virtualStat.sprint -= p;
                    }
                });
            }
            // other resource drain
            virtualStat.readiness -= Battle.MOVE_READINESS * Math.abs(_mA.magnitude);
            virtualStat.moved = true;
            virtualStat[_mA.axis] += _mA.magnitude;
        }
        else {
            (0, Utility_1.log)("\t\tFailed to move. Reason: " + check.reason + " (" + check.value + ")");
        }
        return check === null;
    };
    ;
    // action reader methods
    Battle.prototype.readActions = function (_givenSeconds, _infoMessage, _vS, _rS) {
        var _this = this;
        // returns a Promise that resolves when the player is finished with their moves
        return new Promise(function (resolve) {
            var currentListener;
            var responseQueue = [];
            var x = _vS.x, y = _vS.y, readiness = _vS.readiness, sword = _vS.sword, shield = _vS.shield, sprint = _vS.sprint;
            var executingActions = [];
            var infoMessagesQueue = [_infoMessage];
            var channel = _infoMessage.channel;
            /** Listens to the responseQueue every 300ms, clears the interval and handles the request when detected. */
            var listenToQueue = function () {
                (0, Utility_1.log)("\tListening to queue...");
                if (currentListener) {
                    clearInterval(currentListener);
                }
                currentListener = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        if (responseQueue[0]) {
                            clearInterval(currentListener);
                            handleQueue();
                        }
                        return [2 /*return*/];
                    });
                }); }, 300);
            };
            /** Handles the response (response is Discord.Message) */
            var handleQueue = function () { return __awaiter(_this, void 0, void 0, function () {
                var mes, sections, actionName_1, actionArgs, moveMagnitude, valid_1, _b, moveAction, isFirstMove, realMoveStat, check, attackTarget, enemyTargetWeapons, weaponChosen, virtualAttackAction, realAttackAction, check, undoAction, recklessAction, weaponChosen, attackTarget_1, virtualAttackAction, realAttackAction, check, messageOptions;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            (0, Utility_1.log)("\tHandling queue...");
                            mes = responseQueue.shift();
                            if (!(mes === undefined)) return [3 /*break*/, 1];
                            throw Error("HandleQueue received an undefined message.");
                        case 1:
                            sections = (0, Utility_1.extractCommands)(mes.content);
                            actionName_1 = sections[0].toLocaleLowerCase();
                            actionArgs = sections.slice(1, sections.length);
                            moveMagnitude = parseInt(actionArgs[0]) || 1;
                            valid_1 = false;
                            _b = actionName_1;
                            switch (_b) {
                                case "up": return [3 /*break*/, 2];
                                case "down": return [3 /*break*/, 2];
                                case "right": return [3 /*break*/, 2];
                                case "left": return [3 /*break*/, 2];
                                case "attack": return [3 /*break*/, 3];
                                case "clear": return [3 /*break*/, 4];
                                case "cr": return [3 /*break*/, 4];
                                case "end": return [3 /*break*/, 6];
                                case "log": return [3 /*break*/, 7];
                                case "undo": return [3 /*break*/, 8];
                                case "reckless": return [3 /*break*/, 11];
                                case "reck": return [3 /*break*/, 11];
                                case "brace": return [3 /*break*/, 12];
                                case "defend": return [3 /*break*/, 12];
                                case "br": return [3 /*break*/, 12];
                                case "df": return [3 /*break*/, 12];
                            }
                            return [3 /*break*/, 13];
                        case 2:
                            moveAction = (0, Utility_1.getMoveAction)(_vS, actionName_1, infoMessagesQueue.length, moveMagnitude);
                            isFirstMove = !_vS.moved;
                            // validate + act on (if valid) movement on virtual map
                            valid_1 = this.executeVirtualMovement(moveAction, _vS);
                            // movement is permitted
                            if (valid_1) {
                                realMoveStat = (0, Utility_1.getMoveAction)(_rS, actionName_1, infoMessagesQueue.length, moveMagnitude);
                                if (!isFirstMove) {
                                    realMoveStat.sprint = 1;
                                }
                                executingActions.push(realMoveStat);
                            }
                            else {
                                check = this.validateMovement(_vS, moveAction);
                                if (check) {
                                    channel.send({
                                        embeds: [new discord_js_1.MessageEmbed({
                                                title: check.reason,
                                                description: "Failed to move. Reference value: __" + check.value + "__",
                                            })]
                                    });
                                }
                            }
                            return [3 /*break*/, 14];
                        case 3:
                            attackTarget = this.findEntity_args(actionArgs, _vS);
                            if (attackTarget === null) {
                                channel.send({
                                    embeds: [new discord_js_1.MessageEmbed({
                                            title: "Invalid arguments given.",
                                            description: "Failed to attack.",
                                        })]
                                });
                            }
                            else {
                                enemyTargetWeapons = _vS.base.weapons.filter(function (w) { return (w.targetting.target === typedef_1.WeaponTarget.enemy); });
                                weaponChosen = enemyTargetWeapons[0];
                                virtualAttackAction = (0, Utility_1.getAttackAction)(_vS, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                valid_1 = this.executeVirtualAttack(virtualAttackAction, _vS);
                                if (valid_1) {
                                    realAttackAction = (0, Utility_1.getAttackAction)(_rS, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                    executingActions.push(realAttackAction);
                                }
                                else {
                                    check = this.validateTarget(_vS, weaponChosen, attackTarget);
                                    if (check) {
                                        channel.send({
                                            embeds: [new discord_js_1.MessageEmbed({
                                                    title: check.reason,
                                                    description: "Failed to attack. Reference value: __" + check.value + "__",
                                                })]
                                        });
                                    }
                                }
                            }
                            return [3 /*break*/, 14];
                        case 4:
                            executingActions = [];
                            infoMessagesQueue = [_infoMessage];
                            Object.assign(_vS, { x: x, y: y, readiness: readiness, sword: sword, shield: shield, sprint: sprint });
                            return [4 /*yield*/, (0, Utility_1.clearChannel)(channel, _infoMessage)];
                        case 5:
                            _c.sent();
                            return [3 /*break*/, 14];
                        case 6:
                            newCollector.stop();
                            (0, Utility_1.log)("\tEnded turn for \"" + _vS.name + "\" (" + _vS.base.class + ")");
                            return [3 /*break*/, 14];
                        case 7:
                            Utility_1.log.apply(void 0, __spreadArray([], __read(this.allStats().filter(function (s) { return s.team !== "block"; }).map(function (s) {
                                var string = s.base.class + " (" + s.index + ") (" + s.team + ") " + s.HP + "/" + (0, Utility_1.getAHP)(s) + " (" + s.x + ", " + s.y + ")";
                                return string;
                            })), false));
                            return [3 /*break*/, 14];
                        case 8:
                            if (!(infoMessagesQueue.length > 1)) return [3 /*break*/, 10];
                            undoAction = executingActions.pop();
                            (0, Utility_1.dealWithUndoAction)(_vS, undoAction);
                            infoMessagesQueue.pop();
                            return [4 /*yield*/, (0, Utility_1.clearChannel)(channel, (0, Utility_1.getLastElement)(infoMessagesQueue))];
                        case 9:
                            _c.sent();
                            _c.label = 10;
                        case 10: return [3 /*break*/, 14];
                        case 11:
                            // 2 shields => 1 sword
                            if (_vS.shield >= 2) {
                                valid_1 = true;
                                _vS.shield -= 2;
                                _vS.sword++;
                                recklessAction = (0, Utility_1.getAttackAction)(_rS, _rS, weaponData_json_1.default.Reckless, _vS, infoMessagesQueue.length);
                                executingActions.push(recklessAction);
                            }
                            return [3 /*break*/, 14];
                        case 12: 
                        // no drawing next turn. +1 shield.
                        return [3 /*break*/, 14];
                        case 13:
                            if (actionName_1.length >= 3) {
                                weaponChosen = _vS.base.weapons.find(function (w) {
                                    return w.Name.toLowerCase().search(actionName_1) !== -1;
                                });
                                if (weaponChosen) {
                                    attackTarget_1 = this.findEntity_args(actionArgs, _vS, weaponChosen);
                                    if (attackTarget_1 === null) {
                                        valid_1 = false;
                                    }
                                    else {
                                        virtualAttackAction = (0, Utility_1.getAttackAction)(_vS, attackTarget_1, weaponChosen, attackTarget_1, infoMessagesQueue.length);
                                        valid_1 = this.executeVirtualAttack(virtualAttackAction, _vS);
                                        if (valid_1) {
                                            realAttackAction = (0, Utility_1.getAttackAction)(_rS, attackTarget_1, weaponChosen, attackTarget_1, infoMessagesQueue.length);
                                            executingActions.push(realAttackAction);
                                        }
                                        else {
                                            check = this.validateTarget(_vS, weaponChosen, attackTarget_1);
                                            if (check) {
                                                channel.send({
                                                    embeds: [new discord_js_1.MessageEmbed({
                                                            title: check.reason,
                                                            description: "Failed to attack. Reference value: __" + check.value + "__",
                                                        })]
                                                });
                                            }
                                        }
                                    }
                                }
                                else {
                                    setTimeout(function () { return mes.delete().catch(console.log); }, 10 * 1000);
                                }
                            }
                            return [3 /*break*/, 14];
                        case 14:
                            (0, Utility_1.debug)("\tvalid", valid_1 !== null);
                            if (!valid_1) return [3 /*break*/, 16];
                            mes.react(typedef_1.EMOJI_TICK);
                            return [4 /*yield*/, this.getFullPlayerEmbedMessageOptions(_vS, executingActions)];
                        case 15:
                            messageOptions = _c.sent();
                            channel.send(messageOptions)
                                .then(function (m) {
                                if (valid_1) {
                                    infoMessagesQueue.push(m);
                                }
                                if (responseQueue[0]) {
                                    handleQueue();
                                }
                                else {
                                    listenToQueue();
                                }
                            });
                            return [3 /*break*/, 17];
                        case 16:
                            mes.react(typedef_1.EMOJI_CROSS);
                            listenToQueue();
                            _c.label = 17;
                        case 17: return [2 /*return*/];
                    }
                });
            }); };
            var newCollector = new discord_js_1.MessageCollector(channel, {
                filter: function (m) { return m.author.id === _vS.owner; },
                time: _givenSeconds * 1000,
            });
            newCollector.on('collect', function (mes) {
                if (responseQueue.length < 3) {
                    responseQueue.push(mes);
                }
                else {
                    mes.react("⏱️");
                }
            });
            newCollector.on('end', function () { return __awaiter(_this, void 0, void 0, function () {
                var i;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            clearInterval(currentListener);
                            i = 0;
                            _c.label = 1;
                        case 1:
                            if (!(i < responseQueue.length)) return [3 /*break*/, 4];
                            return [4 /*yield*/, handleQueue()];
                        case 2:
                            _c.sent();
                            _c.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4:
                            (_b = this.roundActionsArray).push.apply(_b, __spreadArray([], __read(executingActions), false));
                            resolve(void 0);
                            return [2 /*return*/];
                    }
                });
            }); });
            listenToQueue();
        });
    };
    // index manipulation
    Battle.prototype.getIndex = function (stat) {
        var _this = this;
        var index = 0;
        if (this.allIndex.size > 0) {
            var lookUp_1 = function (min, max) {
                if (Math.abs(min - max) <= 1) {
                    return null;
                }
                var middle = Math.floor((max + min) / 2);
                var got = _this.allIndex.get(middle);
                return got ?
                    (lookUp_1(min, middle) || lookUp_1(middle, max)) :
                    middle;
            };
            var allIndex = Array.from(this.allIndex.keys()).sort(function (a, b) { return a - b; });
            index = lookUp_1(0, (0, Utility_1.getLastElement)(allIndex));
            if (index === null) {
                index = (0, Utility_1.getLastElement)(allIndex) + 1;
            }
        }
        if (stat) {
            stat.index = index;
        }
        return index === null ?
            this.getIndex() :
            index;
    };
    Battle.prototype.setIndex = function (stat) {
        var oldIndex = stat.index;
        this.getIndex(stat);
        this.allIndex.set(stat.index, true);
        (0, Utility_1.log)("\tSetting index of " + stat.base.class + " from " + oldIndex + " to " + stat.index);
    };
    // checkings regarding this battle
    Battle.prototype.checkVacantPlace = function (coord, exemption) {
        if (exemption === void 0) { exemption = function (c) { return false; }; }
        if (!this.checkWithinWorld(coord))
            return false;
        return exemption(coord) || !this.CSMap.has((0, Utility_1.getCoordString)(coord));
    };
    Battle.prototype.checkWithinWorld = function (coord) {
        // log(`\t\tChecking within world:`)
        // log(`\t\t\tw\\${this.width} h\\${this.height} ${JSON.stringify(coord)}`);
        return this.width > coord.x && this.height > coord.y && coord.x >= 0 && coord.y >= 0;
    };
    Battle.prototype.tickStatuses = function (_s, _currentRoundAction) {
        (0, Utility_1.log)("\tTick status for " + _s.base.class + " (" + _s.index + ")...");
        var returnString = '';
        var statuses = _s.statusEffects;
        (0, Utility_1.debug)("\t(" + _s.index + ") statuses", statuses.map(function (_se) { return _se.type; }));
        for (var i = 0; i < statuses.length; i++) {
            var status_1 = statuses[i];
            // make sure status is affecting the right entity and entity is still alive
            if (status_1.affected.index === _s.index && status_1.affected.HP > 0) {
                // tick
                (0, Utility_1.log)("\t\t" + status_1.type + " " + status_1.value + " (" + status_1.duration + " turns)");
                var statusString = status_1.tick(_currentRoundAction);
                // empty string == invalid status => remove status
                if (!statusString) {
                    (0, Utility_1.log)("\t\t\tRemoving status");
                    this.removeStatus(status_1);
                    i--;
                }
                else {
                    // status header (first time only)
                    if (!returnString) {
                        returnString += "__" + _s.base.class + "__ (" + _s.index + ")\n";
                    }
                    // status report
                    returnString += statusString;
                    if (i !== statuses.length - 1) {
                        returnString += "\n";
                    }
                    // notify the inflicter
                    if (status_1.from.index !== status_1.affected.index) {
                        this.appendReportString(status_1.from, _currentRoundAction.round, "__" + status_1.affected.base.class + "__ (" + status_1.affected.index + ")\n" + statusString);
                    }
                }
            }
            else {
                (0, Utility_1.debug)("status.affected.index === _s.index", status_1.affected.index === _s.index);
                (0, Utility_1.debug)("status.affected.HP > 0", status_1.affected.HP > 0);
            }
        }
        return returnString;
    };
    // clash methods
    Battle.prototype.applyClash = function (_cR, _aA) {
        var returnString = '';
        var target = _aA.affected;
        // weapon effects
        var weaponEffect = new WeaponEffect_1.WeaponEffect(_aA, _cR, this);
        var activationString = weaponEffect.activate();
        // reduce shielding
        if (_cR.fate !== "Miss" && target.shield > 0) {
            target.shield--;
        }
        // apply basic weapon damage
        returnString += this.applyClashDamage(_aA, _cR);
        // attach weapon effects string
        if (activationString) {
            returnString += activationString + "\n";
        }
        return returnString;
    };
    Battle.prototype.applyClashDamage = function (_aA, clashResult) {
        var returnString = '';
        var CR_damage = clashResult.damage;
        var CR_fate = clashResult.fate;
        var attacker = _aA.from;
        var target = _aA.affected;
        var weapon = _aA.weapon;
        var attackerClass = attacker.base.class;
        var targetClass = target.base.class;
        switch (weapon.targetting.target) {
            // damaging
            case typedef_1.WeaponTarget.enemy:
                var hitRate = ((0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target)) < 100 ?
                    (0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target) :
                    100;
                var critRate = ((0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target)) * 0.1 + (0, Utility_1.getCrit)(attacker, weapon);
                // save accolades
                (0, Utility_1.dealWithAccolade)(clashResult, attacker, target);
                // reportString
                returnString +=
                    "**" + attackerClass + "** (" + attacker.index + ") \u2694\uFE0F **" + targetClass + "** (" + target.index + ")\n                    __*" + weapon.Name + "*__ " + hitRate + "% (" + (0, Utility_1.roundToDecimalPlace)(critRate) + "%)\n                    **" + CR_fate + "!** -**" + (0, Utility_1.roundToDecimalPlace)(CR_damage) + "** (" + (0, Utility_1.roundToDecimalPlace)(clashResult.u_damage) + ")\n                    [" + (0, Utility_1.roundToDecimalPlace)(target.HP) + " => " + (0, Utility_1.roundToDecimalPlace)(target.HP - CR_damage) + "]";
                if (target.HP > 0 && target.HP - CR_damage <= 0) {
                    returnString += "\n__**KILLING BLOW!**__";
                }
                // lifesteal
                var LS = (0, Utility_1.getLifesteal)(attacker, weapon);
                if (LS > 0) {
                    returnString += "\n" + this.heal(attacker, CR_damage * LS);
                }
                // search for "Labouring" status
                var labourStatus = (0, Utility_1.getLargestInArray)(this.getStatus(target, "labouring"), function (_s) { return _s.value; });
                if (labourStatus) {
                    labourStatus.value += CR_damage;
                }
                // apply damage
                target.HP -= CR_damage;
                break;
            // non-damaging
            case typedef_1.WeaponTarget.ally:
                if (attacker.index === target.index) {
                    returnString +=
                        "**" + attackerClass + "** (" + attacker.index + ") Activates __*" + weapon.Name + "*__";
                }
                else {
                    returnString +=
                        "**" + attackerClass + "** (" + attacker.index + ") \uD83D\uDEE1\uFE0F **" + targetClass + "** (" + target.index + ")\n                    __*" + weapon.Name + "*__";
                }
                // returningString += abilityEffect();
                break;
        }
        return returnString;
    };
    Battle.prototype.clash = function (_aA) {
        (0, Utility_1.log)("\tClash: " + _aA.from.base.class + " => " + _aA.affected.base.class);
        var fate = 'Miss';
        var damage, u_damage = 0;
        var attacker = _aA.from;
        var weapon = _aA.weapon;
        var target = _aA.affected;
        // define constants
        var hitChance = (0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target);
        var crit = (0, Utility_1.getCrit)(attacker, weapon);
        var minDamage = (0, Utility_1.getDamage)(attacker, weapon)[0];
        var maxDamage = (0, Utility_1.getDamage)(attacker, weapon)[1];
        var prot = (0, Utility_1.getProt)(target);
        // roll
        var hit = (0, Utility_1.random)(1, 100);
        // see if it crits
        if (hit <= hitChance) {
            // crit
            if (hit <= hitChance * 0.1 + crit) {
                u_damage = ((0, Utility_1.random)((0, Utility_1.average)(minDamage, maxDamage), maxDamage)) * 2;
                fate = "Crit";
            }
            // hit
            else {
                u_damage = (0, Utility_1.random)(minDamage, maxDamage);
                fate = "Hit";
            }
        }
        u_damage = (0, Utility_1.clamp)(u_damage, 0, 1000);
        // apply protections
        damage = (0, Utility_1.clamp)(u_damage * (1 - (prot * target.shield / 3)), 0, 999);
        // reduce damage by shielding
        var shieldingStatus = (0, Utility_1.getLargestInArray)(target.statusEffects.filter(function (_status) { return _status.type === "protected"; }), function (_item) {
            return _item.value;
        });
        if (shieldingStatus && shieldingStatus.value > 0) {
            var shieldValue = shieldingStatus.value;
            shieldingStatus.value -= damage;
            if (shieldingStatus.value <= 0) {
                this.removeStatus(shieldingStatus);
            }
            damage -= shieldValue;
            if (damage < 0) {
                damage = 0;
            }
        }
        return {
            damage: damage,
            u_damage: u_damage,
            fate: fate,
            roll: hit,
        };
    };
    // spawning methods
    Battle.prototype.Spawn = function (unit, coords) {
        this.setIndex(unit);
        (0, Utility_1.debug)("Spawning", unit.base.class + " (" + unit.index + ")");
        unit.x = coords.x;
        unit.y = coords.y;
        this.CSMap.set((0, Utility_1.getCoordString)(coords), unit);
    };
    Battle.prototype.SpawnOnSpawner = function (unit) {
        var _this = this;
        // adding addition units to be spawned this round.
        if (unit) {
            this.tobespawnedArray = this.tobespawnedArray.concat(unit);
        }
        var failedToSpawn = [];
        var _loop_4 = function () {
            var stat = this_2.tobespawnedArray.shift();
            // 1. look for spawner
            var possibleCoords = this_2.mapData.map.spawners
                .filter(function (s) { return s.spawns === stat.team; })
                .map(function (s) { return ({ x: s.x, y: s.y }); });
            // 2. look for coords if occupied and spawn if not
            var availableCoords = possibleCoords.filter(function (c) { return !_this.CSMap.has((0, Utility_1.getCoordString)(c)); });
            // 3. Spawn on Coords
            if (availableCoords.length > 0) {
                var c = availableCoords[(0, Utility_1.random)(0, availableCoords.length - 1)];
                this_2.Spawn(stat, c);
            }
            else {
                failedToSpawn.push(stat);
            }
        };
        var this_2 = this;
        while (this.tobespawnedArray[0]) {
            _loop_4();
        }
        for (var i = 0; i < failedToSpawn.length; i++) {
            this.tobespawnedArray.push(failedToSpawn[i]);
        }
    };
    Battle.prototype.getGreaterPrio = function (a) {
        return (1000 * (20 - a.round)) + (a.from.readiness - a.readiness);
    };
    ;
    Battle.prototype.greaterPriorSort = function (_actions) {
        var _this = this;
        var sortedActions = _actions.sort(function (a, b) { return _this.getGreaterPrio(b) - _this.getGreaterPrio(a); });
        return sortedActions;
    };
    Battle.prototype.appendReportString = function (_stat, _round, _string) {
        var associatedStringArray = _stat.actionsAssociatedStrings;
        if (associatedStringArray[_round] === undefined) {
            associatedStringArray[_round] = [];
        }
        if (_string) {
            (0, Utility_1.log)("\t\t\tAppending \"" + _string.replace("\n", "\\n") + "\" to (" + _stat.index + ")");
            associatedStringArray[_round].push(_string);
        }
    };
    // actions
    Battle.prototype.executeAutoWeapons = function (_action) {
        var _this = this;
        var round = _action.round;
        var executeAuto = function (_s) {
            var attacker = _s;
            var target = _s.index === _action.from.index ?
                _action.affected :
                _action.from;
            _s.base.autoWeapons.forEach(function (_w) {
                var weaponTarget = _w.targetting.target;
                var intendedVictim = weaponTarget === typedef_1.WeaponTarget.ally ?
                    // weapon is intended to target friendly units
                    target.team === attacker.team && _w.targetting.AOE !== "self" ?
                        target : // if the action is targetting a friendly unit, use the effect on them.
                        attacker : // if the action is targetting an enemy, use it on self
                    // weapon is intended to target enemies
                    target.team === attacker.team && (!target.pvp || !attacker.pvp) ?
                        null : // the targetted unit is friendly, ignore the autoWeapon.
                        target; // if the targetted is an enemy, unleash the autoWeapon.
                if (intendedVictim) {
                    var selfActivatingAA = (0, Utility_1.getAttackAction)(attacker, intendedVictim, _w, {
                        x: intendedVictim.x, y: intendedVictim.y
                    }, round);
                    _this.executeAttackAction(selfActivatingAA);
                    // totalString.push(weaponEffect.activate());
                }
            });
        };
        var totalString = [];
        executeAuto(_action.from);
        if (_action.from.index !== _action.affected.index) {
            executeAuto(_action.affected);
        }
        return totalString.join("\n");
    };
    Battle.prototype.executeActions = function (_actions) {
        (0, Utility_1.log)("Executing actions...");
        var returning = [];
        this.greaterPriorSort(_actions);
        var executing = _actions.shift();
        while (executing) {
            returning.push(this.executeOneAction(executing));
            executing = _actions.shift();
        }
        return returning;
    };
    Battle.prototype.executeOneAction = function (_action) {
        (0, Utility_1.log)("\tExecuting action: " + _action.type + ", " + _action.from.base.class + " => " + _action.affected.base.class);
        var mAction = _action;
        var aAction = _action;
        var actionAffected = _action.affected;
        var actionFrom = _action.from;
        var round = _action.round;
        // activate autoWeapons
        var autoWeaponReportString = this.executeAutoWeapons(_action);
        this.appendReportString(actionAffected, round, autoWeaponReportString);
        this.appendReportString(actionFrom, round, autoWeaponReportString);
        // apply statuses for target, then report to target
        var affectedStatusString = this.tickStatuses(actionAffected, _action);
        if (affectedStatusString) {
            this.appendReportString(actionAffected, round, affectedStatusString);
        }
        // if the action is not self-targetting...
        if (actionAffected.index !== actionFrom.index) {
            // apply statuses for attacker, then report to attacker
            var attackerStatusString = this.tickStatuses(actionFrom, _action);
            if (attackerStatusString) {
                this.appendReportString(actionFrom, round, attackerStatusString);
            }
        }
        return _action.type === 'Attack' ?
            this.executeAttackAction(aAction) :
            this.executeMoveAction(mAction);
    };
    Battle.prototype.executeSingleTargetAttackAction = function (_aA) {
        var eM = this.validateTarget(_aA);
        var attacker = _aA.from;
        var target = _aA.affected;
        var string = '';
        if (eM) {
            (0, Utility_1.log)("\t" + attacker.base.class + " failed to attack " + target.base.class + ". Reason: " + eM.reason);
            string =
                "**" + attacker.base.class + "** (" + attacker.index + ") failed to attack **" + target.base.class + "** (" + target.index + "). Reason: " + eM.reason;
        }
        else {
            // valid attack
            var clashResult = this.clash(_aA);
            var clashAfterMathString = this.applyClash(clashResult, _aA);
            string = clashAfterMathString;
        }
        return string;
    };
    ;
    Battle.prototype.executeAOEAttackAction = function (_aA, inclusive) {
        if (inclusive === void 0) { inclusive = true; }
        var center = _aA.coordinate;
        var weapon = _aA.weapon;
        var attacker = _aA.from;
        var enemiesInRadius = this.findEntities_radius(center, weapon.Range[2] || weapon.Range[1], inclusive);
        var string = '';
        for (var i = 0; i < enemiesInRadius.length; i++) {
            var singleTargetAA = (0, Utility_1.getAttackAction)(attacker, enemiesInRadius[i], weapon, enemiesInRadius[i], _aA.round);
            var SAResult = this.executeSingleTargetAttackAction(singleTargetAA);
            string += SAResult;
            if (enemiesInRadius.length > 1 && i !== enemiesInRadius.length - 1) {
                string += "\n";
            }
        }
        return string;
    };
    ;
    Battle.prototype.executeLineAttackAction = function (_aA) {
        var target = _aA.affected;
        var attacker = _aA.from;
        var enemiesInLine = this.findEntities_inLine(attacker, target);
        var string = '';
        for (var i = 0; i < enemiesInLine.length; i++) {
            var singleTargetAA = (0, Utility_1.getAttackAction)(attacker, target, _aA.weapon, enemiesInLine[i], _aA.round);
            var SAResult = this.executeSingleTargetAttackAction(singleTargetAA);
            string += SAResult;
        }
        return string;
    };
    ;
    Battle.prototype.executeAttackAction = function (_aA) {
        var attackResult = "";
        switch (_aA.weapon.targetting.AOE) {
            case "self":
                _aA.affected = _aA.from;
            case "single":
            case "touch":
                attackResult = this.executeSingleTargetAttackAction(_aA);
                break;
            case "circle":
                attackResult = this.executeAOEAttackAction(_aA, true);
                break;
            case "selfCircle":
                attackResult = this.executeAOEAttackAction(_aA, false);
                break;
            case "line":
                attackResult = this.executeLineAttackAction(_aA);
                break;
        }
        // save attack results as reportString
        this.appendReportString(_aA.from, _aA.round, attackResult);
        if (_aA.from.index !== _aA.affected.index) {
            this.appendReportString(_aA.affected, _aA.round, attackResult);
        }
        // expend resources
        _aA.executed = true;
        _aA.from.readiness -= _aA.readiness;
        (0, Utility_1.HandleTokens)(_aA.from, function (p, t) {
            (0, Utility_1.log)("\t\t" + _aA.from.index + ") " + t + " --" + _aA[t]);
            _aA.from[t] -= _aA[t];
        });
        return _aA;
    };
    Battle.prototype.executeMoveAction = function (_mA) {
        var stat = _mA.affected;
        var axis = _mA.axis;
        var possibleSeats = this.getAvailableSpacesAhead(_mA);
        var finalCoord = (0, Utility_1.getLastElement)(possibleSeats);
        var newMagnitude = (finalCoord ? (0, Utility_1.getDistance)(finalCoord, _mA.affected) : 0) * Math.sign(_mA.magnitude);
        var direction = (0, Utility_1.getDirection)(axis, newMagnitude);
        this.CSMap.delete((0, Utility_1.getCoordString)(stat));
        stat[axis] += newMagnitude;
        this.CSMap = this.CSMap.set((0, Utility_1.getCoordString)(stat), stat);
        // console.log(`${_mA.from.base.class} (${_mA.from.index}) 👢${formalize(direction)} ${Math.abs(newMagnitude)} blocks.`);
        var affected = _mA.affected;
        _mA.executed = true;
        affected.readiness -= _mA.readiness;
        (0, Utility_1.HandleTokens)(affected, function (p, t) {
            (0, Utility_1.log)("\t\t" + affected.index + ") " + t + " --" + _mA[t]);
            affected[t] -= _mA[t];
        });
        return (0, Utility_1.getNewObject)(_mA, { magnitude: newMagnitude });
    };
    Battle.prototype.heal = function (_healedStat, _val) {
        var beforeHP = (0, Utility_1.roundToDecimalPlace)(_healedStat.HP);
        if (_healedStat.HP > 0) {
            _healedStat.HP += _val;
            if (_healedStat.HP > (0, Utility_1.getAHP)(_healedStat))
                _healedStat.HP = (0, Utility_1.getAHP)(_healedStat);
        }
        var afterHP = (0, Utility_1.roundToDecimalPlace)(_healedStat.HP);
        _healedStat.accolades.healingDone += (afterHP - beforeHP);
        return beforeHP !== afterHP ?
            "\u271A " + beforeHP + " => " + afterHP :
            '';
    };
    // return Battle-related information
    Battle.prototype.getTimerEmbed = function (stat, timeLeft, actions) {
        var titleString = timeLeft + " seconds remaining...";
        var explorerEmbed = new discord_js_1.MessageEmbed({
            title: titleString,
            description: actions || "( *No actions* )",
        });
        // dealing with nearby enemies
        var string = this.getNearbyEnemiesInfo(stat);
        if (string)
            explorerEmbed.fields.push({
                name: "Nearby",
                value: string || "*( no enemies nearby )*",
                inline: true,
            });
        return explorerEmbed;
    };
    /** Draws the base map and character icons. Does not contain health arcs or indexi */
    Battle.prototype.getNewCanvasMap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allStats, groundImage, canvas, ctx, iconCache, i, stat, X, Y, baseClass, iconCanvas, _b, _c, iconSize, iconCtx, imageCanvasCoord;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        allStats = this.allStats();
                        return [4 /*yield*/, (0, Database_1.getFileImage)(this.mapData.map.groundURL)];
                    case 1:
                        groundImage = _d.sent();
                        canvas = (0, Utility_1.returnGridCanvas)(this.height, this.width, this.pixelsPerTile, groundImage);
                        ctx = canvas.getContext('2d');
                        iconCache = new Map();
                        i = 0;
                        _d.label = 2;
                    case 2:
                        if (!(i < allStats.length)) return [3 /*break*/, 9];
                        stat = allStats[i];
                        X = stat.x;
                        Y = stat.y;
                        baseClass = stat.base.class;
                        if (!stat.owner) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, Database_1.getIcon)(stat)];
                    case 3:
                        _b = _d.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        _c = iconCache.get(baseClass);
                        if (_c) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, Database_1.getIcon)(stat)];
                    case 5:
                        _c = (_d.sent());
                        _d.label = 6;
                    case 6:
                        _b = (_c);
                        _d.label = 7;
                    case 7:
                        iconCanvas = _b;
                        iconSize = iconCanvas.width;
                        iconCtx = iconCanvas.getContext("2d");
                        if (!stat.owner && iconCache.get(baseClass) === undefined) {
                            iconCache.set(baseClass, iconCanvas);
                        }
                        imageCanvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)({
                            x: X,
                            y: Y
                        }, this.pixelsPerTile, this.height, false);
                        ctx.drawImage(iconCanvas, imageCanvasCoord.x, imageCanvasCoord.y, Math.min(iconCanvas.width, this.pixelsPerTile), Math.min(iconCanvas.height, this.pixelsPerTile));
                        _d.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9: 
                    // end
                    return [2 /*return*/, canvas];
                }
            });
        });
    };
    /** Draws map from file or invokes getNewCanvasMap. Draws indexi and health arc afterwards. */
    Battle.prototype.getCurrentMapCanvas = function () {
        return __awaiter(this, void 0, void 0, function () {
            var thePath, image, src, readsrc, err_1, newMap, dataBuffer;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        thePath = "./maps/battle-" + this.author.id + ".txt";
                        image = new canvas_1.Image();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 2, , 4]);
                        (0, Utility_1.log)("\tReading existing file...");
                        readsrc = fs_1.default.readFileSync(thePath, 'utf8');
                        (0, Utility_1.log)("\t\tFinish reading.");
                        src = readsrc;
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _b.sent();
                        (0, Utility_1.log)("\tCreating new file...");
                        return [4 /*yield*/, this.getNewCanvasMap()];
                    case 3:
                        newMap = _b.sent();
                        dataBuffer = newMap.toDataURL();
                        fs_1.default.writeFileSync(thePath, dataBuffer);
                        src = dataBuffer;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, new Promise(function (resolve) {
                            image.onload = function () {
                                (0, Utility_1.log)("\t\tSuccessfully loaded.");
                                var _b = (0, Utility_1.startDrawing)(image.width, image.height), canvas = _b.canvas, ctx = _b.ctx;
                                ctx.drawImage(image, 0, 0, image.width, image.height);
                                _this.drawHealthArcs(canvas);
                                _this.drawIndexi(canvas);
                                resolve(canvas);
                            };
                            (0, Utility_1.log)("\tWaiting for image to load...");
                            image.src = src;
                        })];
                }
            });
        });
    };
    Battle.prototype.getCurrentMapBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentMapCanvas()];
                    case 1: return [2 /*return*/, (_b.sent()).toBuffer()];
                }
            });
        });
    };
    /** Invokes getCurrentMapCanvas and draws arrows on top. */
    Battle.prototype.getCurrentMapWithArrowsCanvas = function (stat, actions) {
        return __awaiter(this, void 0, void 0, function () {
            var _b, canvas, ctx, baseImage, arrowsCanvas;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (0, Utility_1.startDrawing)(this.width * 50, this.height * 50), canvas = _b.canvas, ctx = _b.ctx;
                        return [4 /*yield*/, this.getCurrentMapCanvas()];
                    case 1:
                        baseImage = _c.sent();
                        return [4 /*yield*/, this.getActionArrowsCanvas(actions || this.getStatsRoundActions(stat))];
                    case 2:
                        arrowsCanvas = _c.sent();
                        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
                        ctx.drawImage(arrowsCanvas, 0, 0, canvas.width, canvas.height);
                        return [2 /*return*/, canvas];
                }
            });
        });
    };
    Battle.prototype.getCurrentMapWithArrowsBuffer = function (stat) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentMapWithArrowsCanvas(stat)];
                    case 1: return [2 /*return*/, (_b.sent()).toBuffer()];
                }
            });
        });
    };
    /** Draws actions arrows based on provided actions */
    Battle.prototype.getActionArrowsCanvas = function (_actions) {
        return __awaiter(this, void 0, void 0, function () {
            var actions, canvas, ctx, style, drawAttackAction, drawMoveAction, appendGraph, virtualCoordsMap, graph, _loop_5, i, _b, _c, _d, key, value, solidColumns, columns, columnWidth, o, widthStart, widthEnd, edgeIndex, edge, connectingAction, isXtransition, isYtransition;
            var e_3, _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        actions = _actions.map(function (_a, _index) {
                            _a.priority = _index + 1;
                            return _a;
                        });
                        canvas = new canvas_1.Canvas(this.width * 50, this.height * 50);
                        ctx = canvas.getContext("2d");
                        style = {
                            r: 0,
                            g: 0,
                            b: 0,
                            alpha: 1
                        };
                        ctx.fillStyle = (0, Utility_1.stringifyRGBA)(style);
                        ctx.strokeStyle = (0, Utility_1.stringifyRGBA)(style);
                        drawAttackAction = function (_aA, _fromBattleCoord, _toBattleCoord, _width, _offset) {
                            if (_width === void 0) { _width = 5; }
                            if (_offset === void 0) { _offset = {
                                x: 0,
                                y: 0
                            }; }
                            return __awaiter(_this, void 0, void 0, function () {
                                var victimWithinDistance, fromCanvasCoord, toCanvasCoord, hitImage, _b, imageWidth, imageHeight, textCanvasCoordinate, x, y, angle;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            (0, Utility_1.log)("Drawing attack action...");
                                            (0, Utility_1.debug)("\tfromCoord", { x: _fromBattleCoord.x, y: _fromBattleCoord.y });
                                            (0, Utility_1.debug)("\ttoCoord", { x: _toBattleCoord.x, y: _toBattleCoord.y });
                                            ctx.save();
                                            style.r = 255;
                                            style.g = 0;
                                            style.b = 0;
                                            ctx.strokeStyle = (0, Utility_1.stringifyRGBA)((0, Utility_1.normaliseRGBA)(style));
                                            victimWithinDistance = (0, Utility_1.checkWithinDistance)(_aA.weapon, (0, Utility_1.getDistance)(_aA.from, _aA.affected));
                                            ctx.beginPath();
                                            ctx.strokeStyle = victimWithinDistance ?
                                                "red" :
                                                "black";
                                            ctx.lineWidth = _width;
                                            fromCanvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(_fromBattleCoord, this.pixelsPerTile, this.height);
                                            ctx.moveTo(fromCanvasCoord.x + _offset.x, fromCanvasCoord.y + _offset.y);
                                            toCanvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(_toBattleCoord, this.pixelsPerTile, this.height);
                                            ctx.lineTo(toCanvasCoord.x + _offset.x, toCanvasCoord.y + _offset.y);
                                            ctx.stroke();
                                            ctx.closePath();
                                            if (!victimWithinDistance) return [3 /*break*/, 5];
                                            if (!(_aA.weapon.targetting.target === typedef_1.WeaponTarget.ally)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, (0, Database_1.getFileImage)('./images/Shield.png')];
                                        case 1:
                                            _b = _c.sent();
                                            return [3 /*break*/, 4];
                                        case 2: return [4 /*yield*/, (0, Database_1.getFileImage)('./images/Hit.png')];
                                        case 3:
                                            _b = _c.sent();
                                            _c.label = 4;
                                        case 4:
                                            hitImage = _b;
                                            imageWidth = this.pixelsPerTile * (0.7 * _width / (this.pixelsPerTile / 3));
                                            imageHeight = this.pixelsPerTile * (0.7 * _width / (this.pixelsPerTile / 3));
                                            ctx.drawImage(hitImage, toCanvasCoord.x + _offset.x - (imageWidth / 2), toCanvasCoord.y + _offset.y - (imageHeight / 2), imageWidth, imageHeight);
                                            _c.label = 5;
                                        case 5:
                                            textCanvasCoordinate = (0, Utility_1.getCanvasCoordsFromBattleCoord)({
                                                x: (_fromBattleCoord.x + _toBattleCoord.x) / 2,
                                                y: (_fromBattleCoord.y + _toBattleCoord.y) / 2
                                            }, this.pixelsPerTile, this.height);
                                            x = _toBattleCoord.x - _fromBattleCoord.x;
                                            y = _toBattleCoord.y - _fromBattleCoord.y;
                                            angle = Math.atan2(y, x);
                                            (0, Utility_1.drawText)(ctx, "" + _aA.priority, this.pixelsPerTile / 3, {
                                                x: textCanvasCoordinate.x + _offset.x,
                                                y: textCanvasCoordinate.y + _offset.y,
                                            }, -1 * angle);
                                            ctx.restore();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        drawMoveAction = function (_mA, _fromBattleCoord, _toBattleCoord, _width, _offsetCanvas) {
                            if (_width === void 0) { _width = 5; }
                            if (_offsetCanvas === void 0) { _offsetCanvas = {
                                x: 0,
                                y: 0
                            }; }
                            ctx.save();
                            style.r = 0;
                            style.g = 0;
                            style.b = 0;
                            ctx.strokeStyle = (0, Utility_1.stringifyRGBA)((0, Utility_1.normaliseRGBA)(style));
                            (0, Utility_1.log)("Drawing move action: (" + _fromBattleCoord.x + "," + _fromBattleCoord.y + ")=>(" + _toBattleCoord.x + "," + _toBattleCoord.y + ") (width:" + _width + ")(offset x:" + _offsetCanvas.x + " y:" + _offsetCanvas.y + ")");
                            ctx.lineWidth = _width;
                            // get position before move
                            var beforeCanvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(_fromBattleCoord, _this.pixelsPerTile, _this.height);
                            ctx.beginPath();
                            ctx.moveTo(beforeCanvasCoord.x, beforeCanvasCoord.y);
                            // draw a line to the coord after move action
                            var afterCanvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(_toBattleCoord, _this.pixelsPerTile, _this.height);
                            ctx.lineTo(afterCanvasCoord.x, afterCanvasCoord.y);
                            ctx.stroke();
                            ctx.closePath();
                            // draw circle
                            var arrivingCanvasCoord = _mA.executed ?
                                beforeCanvasCoord :
                                afterCanvasCoord;
                            (0, Utility_1.drawCircle)(ctx, arrivingCanvasCoord, _this.pixelsPerTile / 5, false);
                            // priority text
                            var middleCanvasCoord = {
                                x: (beforeCanvasCoord.x + afterCanvasCoord.x) / 2,
                                y: (beforeCanvasCoord.y + afterCanvasCoord.y) / 2,
                            };
                            (0, Utility_1.drawText)(ctx, "" + _mA.priority, _this.pixelsPerTile / 3, {
                                x: middleCanvasCoord.x + _offsetCanvas.x,
                                y: middleCanvasCoord.y + _offsetCanvas.x,
                            });
                            ctx.restore();
                        };
                        appendGraph = function (action, from, to, _iVal) {
                            var fromNode = new hGraphTheory_1.hNode(from, _iVal);
                            var toNode = new hGraphTheory_1.hNode(to, _iVal);
                            graph.connectNodes(fromNode, toNode, action);
                        };
                        virtualCoordsMap = new Map();
                        graph = new hGraphTheory_1.hGraph(true);
                        _loop_5 = function (i) {
                            var action, attackerIndex, victimIndex, victim_beforeCoords, attacker_beforeCoords;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        action = actions[i];
                                        attackerIndex = action.from.index;
                                        victimIndex = action.affected.index;
                                        if (!virtualCoordsMap.has(victimIndex)) {
                                            virtualCoordsMap.set(victimIndex, { x: action.affected.x, y: action.affected.y });
                                        }
                                        if (!virtualCoordsMap.has(attackerIndex)) {
                                            virtualCoordsMap.set(attackerIndex, { x: action.from.x, y: action.from.y });
                                        }
                                        victim_beforeCoords = virtualCoordsMap.get(victimIndex);
                                        attacker_beforeCoords = virtualCoordsMap.get(attackerIndex);
                                        return [4 /*yield*/, (0, Utility_1.dealWithAction)(action, function (aA) { return __awaiter(_this, void 0, void 0, function () {
                                                var weapon, epicenterCoord, affecteds, i_2, af, singleTarget, _b, _c, coord;
                                                var e_4, _d;
                                                return __generator(this, function (_e) {
                                                    weapon = aA.weapon;
                                                    switch (weapon.targetting.AOE) {
                                                        case "self":
                                                        case "single":
                                                        case "touch":
                                                            appendGraph(aA, attacker_beforeCoords, victim_beforeCoords, i + 1);
                                                            break;
                                                        case "circle":
                                                        case "selfCircle":
                                                            epicenterCoord = weapon.targetting.AOE === "circle" ?
                                                                aA.coordinate :
                                                                victim_beforeCoords;
                                                            affecteds = this.findEntities_radius((0, Utility_1.getNewObject)(epicenterCoord, { index: victimIndex }), // assign victim
                                                            weapon.Range[2], weapon.targetting.AOE === "circle");
                                                            for (i_2 = 0; i_2 < affecteds.length; i_2++) {
                                                                af = affecteds[i_2];
                                                                singleTarget = (0, Utility_1.getNewObject)(aA, { from: epicenterCoord, affected: af });
                                                                appendGraph(singleTarget, epicenterCoord, af, i_2 + 1);
                                                            }
                                                            if (weapon.targetting.AOE === "circle") {
                                                                // show AOE throw trajectory
                                                                appendGraph(aA, attacker_beforeCoords, epicenterCoord, i + 1);
                                                            }
                                                            try {
                                                                // draw explosion range
                                                                for (_b = __values((0, Utility_1.getCoordsWithinRadius)(weapon.Range[2], epicenterCoord, true)), _c = _b.next(); !_c.done; _c = _b.next()) {
                                                                    coord = _c.value;
                                                                    this.drawSquareOnBattleCoords(ctx, coord, {
                                                                        r: 255,
                                                                        b: 0,
                                                                        g: 0,
                                                                        alpha: 0.3
                                                                    });
                                                                }
                                                            }
                                                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                                                            finally {
                                                                try {
                                                                    if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                                                                }
                                                                finally { if (e_4) throw e_4.error; }
                                                            }
                                                            break;
                                                        case "line":
                                                            throw new Error("Line-drawing not implemented");
                                                            break;
                                                    }
                                                    return [2 /*return*/];
                                                });
                                            }); }, function (mA) {
                                                var beforeBattleCoord = (0, Utility_1.getNewObject)(victim_beforeCoords);
                                                // log(`BeforeBattleCoord: ${beforeBattleCoord.x}, ${beforeBattleCoord.y}`);
                                                victim_beforeCoords[mA.axis] += mA.magnitude * Math.pow(-1, Number(mA.executed));
                                                // log(`Action: ${mA.magnitude} (${mA.executed})`);
                                                var afterBattleCoord = (0, Utility_1.getNewObject)(victim_beforeCoords);
                                                // log(`AfterBattleCoord: ${afterBattleCoord.x}, ${afterBattleCoord.y}`);
                                                // connect to graph
                                                // drawMoveAction(beforeBattleCoord, afterBattleCoord, i+1);
                                                appendGraph(mA, beforeBattleCoord, afterBattleCoord, i + 1);
                                            })];
                                    case 1:
                                        _g.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _f.label = 1;
                    case 1:
                        if (!(i < actions.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_5(i)];
                    case 2:
                        _f.sent();
                        _f.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        try {
                            for (_b = __values(graph.adjGraph.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                                solidColumns = (0, Utility_1.clamp)(value.length, 0, 10);
                                columns = 2 * solidColumns + 1;
                                columnWidth = Math.floor(this.pixelsPerTile / columns);
                                for (o = 1; o <= columns; o++) {
                                    widthStart = (o - 1) * columnWidth;
                                    widthEnd = widthStart + columnWidth;
                                    /**
                                     * eg:
                                     * columnWidth: 5
                                     * 0th pixel =>   ||==========|| <= 5th pixel
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     *                [-==========-][-==========-]
                                     */
                                    // is solid column
                                    if (o % 2 === 0) {
                                        edgeIndex = (o / 2) - 1;
                                        edge = value[edgeIndex];
                                        connectingAction = edge.weight;
                                        isXtransition = edge.from.position.x !== edge.to.position.x;
                                        isYtransition = edge.from.position.y !== edge.to.position.y;
                                        if (connectingAction.type === "Attack") {
                                            drawAttackAction(connectingAction, edge.from.position, edge.to.position, columnWidth, {
                                                x: isYtransition ?
                                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                                    0,
                                                y: isXtransition ?
                                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                                    0,
                                            });
                                        }
                                        else if (connectingAction.type === "Move") {
                                            drawMoveAction(connectingAction, edge.from.position, edge.to.position, columnWidth, {
                                                x: isYtransition ?
                                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                                    0,
                                                y: isXtransition ?
                                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                                    0,
                                            });
                                        }
                                    }
                                    // is gap column
                                    else {
                                        // log(`Gap edge #${o / 2}`);
                                    }
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_e = _b.return)) _e.call(_b);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        return [2 /*return*/, canvas];
                }
            });
        });
    };
    Battle.prototype.getActionArrowsBuffer = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getActionArrowsCanvas(actions)];
                    case 1: return [2 /*return*/, (_b.sent()).toBuffer()];
                }
            });
        });
    };
    Battle.prototype.drawHealthArcs = function (_canvas) {
        var ctx = _canvas.getContext('2d');
        ctx.save();
        ctx.lineWidth = 3;
        var allStats = this.allStats();
        for (var i = 0; i < allStats.length; i++) {
            var stat = allStats[i];
            // attach health arc
            var healthPercentage = (0, Utility_1.clamp)(stat.HP / stat.base.AHP, 0, 1);
            ctx.strokeStyle = (0, Utility_1.stringifyRGBA)({
                r: 255 * Number(stat.team === "enemy"),
                g: 255 * Number(stat.team === "player"),
                b: 0,
                alpha: 1
            });
            var canvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(stat, this.pixelsPerTile, this.height);
            (0, Utility_1.drawCircle)(ctx, {
                x: canvasCoord.x,
                y: canvasCoord.y
            }, this.pixelsPerTile / 2, true, healthPercentage);
        }
        ctx.restore();
    };
    Battle.prototype.drawIndexi = function (_canvas) {
        var ctx = _canvas.getContext('2d');
        var allStats = this.allStats();
        for (var i = 0; i < allStats.length; i++) {
            var stat = allStats[i];
            var canvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(stat, this.pixelsPerTile, this.height, false);
            // attach index
            (0, Utility_1.drawCircle)(ctx, {
                x: canvasCoord.x + this.pixelsPerTile * 9 / 10,
                y: canvasCoord.y + this.pixelsPerTile * 1 / 5,
            }, this.pixelsPerTile / 6, false);
            (0, Utility_1.drawText)(ctx, "" + stat.index, this.pixelsPerTile / 3, {
                x: canvasCoord.x + this.pixelsPerTile * 9 / 10,
                y: canvasCoord.y + this.pixelsPerTile * 1 / 5,
            });
        }
    };
    Battle.prototype.getFullPlayerEmbedMessageOptions = function (stat, actions) {
        return __awaiter(this, void 0, void 0, function () {
            var mapCanvas, map, frameImage, characterBaseImage, _b, canvas, ctx, embed;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getCurrentMapWithArrowsCanvas(stat, actions)];
                    case 1:
                        mapCanvas = _c.sent();
                        map = mapCanvas.toBuffer();
                        return [4 /*yield*/, (0, Database_1.getFileImage)('images/frame.png')];
                    case 2:
                        frameImage = _c.sent();
                        return [4 /*yield*/, (0, Database_1.getFileImage)(stat.base.iconURL)];
                    case 3:
                        characterBaseImage = _c.sent();
                        _b = (0, Utility_1.startDrawing)(frameImage.width * 3, frameImage.height * 3), canvas = _b.canvas, ctx = _b.ctx;
                        ctx.drawImage(characterBaseImage, 20, 20, canvas.width - 40, canvas.height - 40);
                        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
                        ctx.textAlign = "center";
                        ctx.font = '90px serif';
                        ctx.fillStyle = "rgba(255, 255, 255, 1)";
                        ctx.fillText(stat.base.class, canvas.width / 2, canvas.height * 0.95);
                        ctx.strokeText(stat.base.class, canvas.width / 2, canvas.height * 0.95);
                        return [4 /*yield*/, this.getFullPlayerEmbed(stat)];
                    case 4:
                        embed = _c.sent();
                        // sendToSandbox({ files: [{ attachment: map, name: `map.png`},] });
                        return [2 /*return*/, {
                                embeds: [embed],
                                files: [
                                    { attachment: map, name: "map.png" },
                                    { attachment: canvas.toBuffer(), name: "thumbnail.png" }
                                ]
                            }];
                }
            });
        });
    };
    Battle.prototype.getFullPlayerEmbed = function (stat) {
        return __awaiter(this, void 0, void 0, function () {
            var HP, HealthBar, ReadinessBar, explorerEmbed, green, red, num;
            return __generator(this, function (_b) {
                HP = (stat.HP / (0, Utility_1.getAHP)(stat)) * 50;
                HealthBar = "" + '`' + (0, Utility_1.addHPBar)(50, HP) + '`';
                ReadinessBar = "" + '`' + (0, Utility_1.addHPBar)(50, stat.readiness) + '`';
                explorerEmbed = new discord_js_1.MessageEmbed({
                    title: HealthBar,
                    description: "*Readiness* (" + Math.round(stat.readiness) + "/50)\n                " + ReadinessBar,
                    fields: [
                        {
                            name: "(" + stat.sword + "/3)",
                            value: "🗡️".repeat(stat.sword > 0 ? stat.sword : 0) || '❎',
                            inline: true,
                        },
                        {
                            name: "(" + stat.shield + "/3)",
                            value: "🛡️".repeat(stat.shield > 0 ? stat.shield : 0) || '❎',
                            inline: true,
                        },
                        {
                            name: "(" + stat.sprint + "/3)",
                            value: "👢".repeat(stat.sprint > 0 ? stat.sprint : 0) || '❎',
                            inline: true,
                        },
                    ]
                });
                // thumbnail
                explorerEmbed.setThumbnail("attachment://thumbnail.png");
                // dealing with map
                explorerEmbed.setImage("attachment://map.png");
                green = (Math.round((stat.HP) * (255 / (0, Utility_1.getAHP)(stat)))).toString(16);
                red = (255 - Math.round((stat.HP) * (255 / (0, Utility_1.getAHP)(stat)))).toString(16);
                if (red.length === 1)
                    red = "0" + red;
                if (green.length === 1)
                    green = "0" + green;
                num = "0x" + red + green + "00";
                explorerEmbed.color = parseInt(num, 16);
                return [2 /*return*/, explorerEmbed];
            });
        });
    };
    // find entities
    Battle.prototype.findEntity_args = function (_args, _attacker, _weapon) {
        var allStats = this.allStats();
        var ignore = ["block"];
        var targetNotInIgnore = function (c) { return c.team && !ignore.includes(c.team); };
        if (_weapon && _weapon.targetting.target === typedef_1.WeaponTarget.enemy)
            ignore.push("player");
        if (_weapon && _weapon.targetting.target === typedef_1.WeaponTarget.ally)
            ignore.push("enemy");
        // 0. self target
        if (_weapon && (_weapon.targetting.AOE === "selfCircle" || _weapon.targetting.AOE === "self")) {
            return allStats.find(function (s) { return s.index === _attacker.index; }) || null;
        }
        // 1. attack through the name
        var targetName = _args[0];
        var nameTarget = allStats.find(function (c) {
            return c.index === parseInt(targetName) && targetNotInIgnore(c);
        });
        // 2. attack through direction
        var translateDir = {
            "left": {
                axis: "x",
                dir: -1,
            },
            "right": {
                axis: "x",
                dir: 1,
            },
            "up": {
                axis: "y",
                dir: 1,
            },
            "down": {
                axis: "y",
                dir: -1,
            },
        };
        var direction = _args[0];
        var axisDirection = translateDir[direction];
        var directionTarget = undefined;
        if (axisDirection !== undefined) {
            var axis = axisDirection.axis;
            var dir = axisDirection.dir;
            directionTarget = this.findEntity_closestInAxis(_attacker, axis, 12 * dir, ignore);
        }
        // 3. attack through coordinates
        var x = parseInt(_args[0]);
        var y = parseInt(_args[1]);
        var coordTarget = (x + y) ? (allStats.find(function (c) { return c.x === x && c.y === y && targetNotInIgnore(c); })) : null;
        // 4. attack closest
        var closestTarget = this.findEntity_closest(_attacker, ignore);
        return directionTarget || coordTarget || nameTarget || closestTarget;
    };
    Battle.prototype.findEntity_closestInAxis = function (_attacker, axis, magnitude, ignore) {
        if (ignore === void 0) { ignore = []; }
        var obstacles = this.findEntities_allInAxis(_attacker, axis, magnitude, ignore);
        if (obstacles[0]) {
            var result = obstacles.reduce(function (closest, ob) {
                var newMag = (0, Utility_1.getDistance)(_attacker, ob);
                return newMag < (0, Utility_1.getDistance)(_attacker, closest) ? ob : closest;
            }, obstacles[0]);
            return result;
        }
        else {
            return null;
        }
    };
    Battle.prototype.findEntity_closest = function (_attacker, ignore) {
        if (ignore === void 0) { ignore = ["block"]; }
        var allStats = this.allStats();
        var closestDistance = 100;
        var closestR = allStats.reduce(function (closest, s) {
            if (closest !== null && closest.index === s.index)
                return s;
            var newDistance = (0, Utility_1.getDistance)(s, _attacker);
            // fail cases
            var selfTargettingIgnored = s.index === _attacker.index;
            var ignored = s.team && ignore.includes(s.team);
            var targetIsDead = s.HP <= 0;
            if (selfTargettingIgnored || ignored || targetIsDead) {
                return closest;
            }
            return closestDistance > newDistance ? s : closest;
        }, null);
        return closestR;
    };
    Battle.prototype.findEntity_index = function (_i) {
        return this.allStats().find(function (s) { return (s.index === _i); });
    };
    Battle.prototype.findEntities_allInAxis = function (_attacker, _axis, magnitude, ignore) {
        if (ignore === void 0) { ignore = []; }
        var allStats = this.allStats();
        if (magnitude === 0)
            return [];
        var cAxis = (0, Utility_1.counterAxis)(_axis);
        var result = allStats.filter(function (s) {
            if (s.team && ignore.includes(s.team))
                return false;
            var checkNeg = s[_axis] >= _attacker[_axis] + magnitude && s[_axis] < _attacker[_axis];
            var checkPos = s[_axis] <= _attacker[_axis] + magnitude && s[_axis] > _attacker[_axis];
            // check negative if magnitude is negative. else, check positive axis
            var conditionOne = (Math.sign(magnitude) == -1) ? checkNeg : checkPos;
            return (s[cAxis] === _attacker[cAxis] && (0, Utility_1.getDistance)(_attacker, s) !== 0 && conditionOne);
        });
        return result;
    };
    Battle.prototype.findEntities_radius = function (_stat, _r, includeSelf, ignore) {
        // console.log(_stat, radius, includeSelf, ignore); 
        if (includeSelf === void 0) { includeSelf = false; }
        if (ignore === void 0) { ignore = ["block"]; }
        var targetNotInIgnore = function (c) { return c.team && !ignore.includes(c.team); };
        var stat = _stat;
        return this.allStats().filter(function (s) {
            return (s.index !== stat.index || (typeof stat.index === 'number' && includeSelf)) &&
                targetNotInIgnore(s) &&
                Math.sqrt(Math.pow((s.x - stat.x), 2) + Math.pow((s.y - stat.y), 2)) <= _r;
        });
    };
    Battle.prototype.findEntities_inLine = function (_x1, _x2) {
        var dx = _x2.x - _x1.x;
        var dy = _x2.y - _x1.y;
        var coordDiff = (0, Utility_1.getCompass)(_x1, _x2);
        var slope = dy / dx;
        return this.allStats().filter(function (s) {
            var x = s.x - _x1.x;
            var coordDiff_this = (0, Utility_1.getCompass)(_x1, s);
            var lineLength = (0, Utility_1.getPyTheorem)(dx, dy);
            var isWithinDistance = lineLength >= (0, Utility_1.getDistance)(_x1, s);
            var withinSlopeA = (s.y === (_x1.y + Math.floor(slope * x))) || (s.y === (_x1.y + Math.ceil(slope * x)));
            var isVertSlope = (Math.abs(slope) === Infinity) || (s.x === _x1.x);
            return coordDiff.x === coordDiff_this.x && coordDiff.y === coordDiff_this.y && isWithinDistance && (withinSlopeA || isVertSlope);
        });
    };
    Battle.prototype.validateTarget = function (_stat_aa, _weapon_null, _target_null) {
        var eM = {
            reason: "",
            value: null,
        };
        var attackerStat, targetStat, weapon;
        if (_stat_aa.index === undefined) // is aa
         {
            var aa = _stat_aa;
            attackerStat = aa.from;
            targetStat = aa.affected;
            weapon = aa.weapon;
        }
        else { // is stat
            attackerStat = _stat_aa;
            targetStat = _target_null;
            weapon = _weapon_null;
        }
        // ~~~~~~ UNIVERSAL ~~~~~~ //
        // undefined target
        if (!targetStat) {
            eM.reason = "No target detected.";
            return eM;
        }
        // undefined attacker
        if (!attackerStat) {
            eM.reason = "No attacker detected.";
            return eM;
        }
        // undefined weapon
        if (!weapon) {
            eM.reason = "No weapon detected.";
            return eM;
        }
        // attacker is dead
        if (attackerStat.HP <= 0) {
            eM.reason = "Attacker perished.";
            return eM;
        }
        // targetting a teammate without pvp on
        if (weapon.targetting.target === typedef_1.WeaponTarget.enemy && weapon.targetting.AOE !== "self" && weapon.targetting.AOE !== "selfCircle" && attackerStat.team === targetStat.team && (!targetStat.pvp || !attackerStat.pvp)) {
            eM.reason = "Attempted to attack a teammate without pvp on.";
            return eM;
        }
        // readiness
        if (attackerStat.readiness < 0) {
            eM.reason = "Not enough readiness.";
            eM.value = attackerStat.readiness;
            return eM;
        }
        // tokens
        if (attackerStat.sword < weapon.sword) {
            eM.reason = "Not enough Sword (🗡️) tokens.";
            eM.value = attackerStat.sword;
            return eM;
        }
        if (attackerStat.shield < weapon.shield) {
            eM.reason = "Not enough Shield (🛡️) tokens.";
            eM.value = attackerStat.shield;
            return eM;
        }
        if (attackerStat.sprint < weapon.sprint) {
            eM.reason = "Not enough Sprint (👢) tokens.";
            eM.value = attackerStat.sprint;
            return eM;
        }
        // weapon uses
        if (weapon.UPT < (0, Utility_1.getWeaponUses)(weapon, attackerStat)) {
            eM.reason = "You can only use this ability " + weapon.UPT + " time(s) per turn.";
            eM.value = (0, Utility_1.getWeaponUses)(weapon, attackerStat);
            (0, Utility_1.log)(weapon, attackerStat, (0, Utility_1.getWeaponUses)(weapon, attackerStat));
            return eM;
        }
        // weird stats
        if (targetStat.team !== "block" && (targetStat.base.Prot === undefined || targetStat.HP === undefined)) {
            eM.reason = "Target \"" + targetStat.base.class + "\" cannot be attacked.";
            return eM;
        }
        // target is a block
        if (targetStat.team === "block") {
            eM.reason = "Target \"" + targetStat.base.class + "\" is a wall.";
            return eM;
        }
        // only valid errors if weapon is not a self-target
        if (weapon.targetting.AOE !== "selfCircle" && weapon.targetting.AOE !== "self" && weapon.targetting.AOE !== "touch") {
            // out of range
            if ((0, Utility_1.getDistance)(attackerStat, targetStat) > weapon.Range[1] || (0, Utility_1.getDistance)(attackerStat, targetStat) < weapon.Range[0]) {
                eM.reason = "Target is too far or too close.";
                eM.value = (0, Utility_1.roundToDecimalPlace)((0, Utility_1.getDistance)(attackerStat, targetStat), 1);
                return eM;
            }
            // invalid self-targeting
            if (weapon.Range[0] !== 0 && targetStat.index === attackerStat.index) {
                eM.reason = "Cannot target self.";
                return eM;
            }
        }
        return null;
    };
    Battle.prototype.validateMovement = function (moverStat, _mA) {
        var movingError = null;
        var coord = {
            x: moverStat.x + Number((_mA === null || _mA === void 0 ? void 0 : _mA.axis) === 'x') * Number(_mA === null || _mA === void 0 ? void 0 : _mA.magnitude),
            y: moverStat.y + Number((_mA === null || _mA === void 0 ? void 0 : _mA.axis) === 'y') * Number(_mA === null || _mA === void 0 ? void 0 : _mA.magnitude)
        };
        if (_mA === null) {
            movingError = {
                reason: "FATAL ERROR! Null pointer detected! Contact a mod!",
                value: 0
            };
        }
        else if (moverStat.moved && moverStat.sprint <= 0) {
            movingError = {
                reason: "You have already moved this turn and you have no 'Sprint' tokens.",
                value: moverStat.sprint
            };
        }
        else if (moverStat.base.maxMove < _mA.magnitude) {
            movingError = {
                reason: "Movement exceeding character limits.",
                value: moverStat.base.maxMove
            };
        }
        else if (!this.checkWithinWorld(coord)) {
            movingError = {
                reason: "Movement is escaping the bounds of the battlefield.",
                value: coord.x + coord.y * Math.pow(10, -1)
            };
        }
        else if (Math.abs(_mA.magnitude) < 1) {
            movingError = {
                reason: "Movement magnitude most be at least 1 (or -1).",
                value: _mA.magnitude
            };
        }
        else if (moverStat.HP <= 0) {
            movingError = {
                reason: "Mover perished.",
                value: moverStat.HP
            };
        }
        return movingError;
    };
    // dealing with death
    Battle.prototype.handleDeath = function (s) {
        if (s.botType === typedef_1.BotType.naught) {
            var payload = { embeds: [(0, Utility_1.getDeathEmbed)()] };
            this.sendToCommand(s.owner, payload);
        }
        else {
            this.CSMap.delete((0, Utility_1.getCoordString)(s));
            this.totalEnemyCount--;
            this.enemyCount--;
        }
        this.allIndex.delete(s.index);
    };
    Battle.prototype.checkDeath = function (allStats) {
        var e_5, _b;
        if (allStats === void 0) { allStats = this.allStats(true); }
        var deathCount = 0;
        try {
            for (var _c = __values(allStats.filter(function (p) { return p.HP <= 0; })), _d = _c.next(); !_d.done; _d = _c.next()) {
                var deadPerson = _d.value;
                deathCount++;
                this.handleDeath(deadPerson);
                if (deadPerson.team === "player")
                    this.playerCount--;
                else if (deadPerson.team === "enemy")
                    this.enemyCount--;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return deathCount;
    };
    // Path-finding
    Battle.prototype.startPathFinding = function (start, end, limit) {
        if (limit === void 0) { limit = Number.POSITIVE_INFINITY; }
        // initialize
        var AINodeMap = new Map();
        var nodePriorQueue = new MinHeap_1.MinHeap(function (n) { return (n === null || n === void 0 ? void 0 : n.totalC) || null; });
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var coordString = (0, Utility_1.getCoordString)({ x: x, y: y });
                if (!this.CSMap.has(coordString) || start.x === x && start.y === y) {
                    var node = (0, Utility_1.getNewNode)(x, y, end, Number.POSITIVE_INFINITY);
                    AINodeMap.set(coordString, node);
                    nodePriorQueue.insert(node);
                }
            }
        }
        var startAINode = AINodeMap.get((0, Utility_1.getCoordString)(start));
        startAINode.disC = 0;
        startAINode.totalC = startAINode.desC;
        // 
        var results = [];
        var AINode = nodePriorQueue.remove();
        var ax = [1, -1, 0, 0];
        var ay = [0, 0, 1, -1];
        while (AINode && (AINode.x !== end.x || AINode.y !== end.y)) {
            // log(`spreading @ ${AINode.x} and @ ${AINode.y}`)
            for (var i = 0; i < 4; i++) {
                var coordString = (0, Utility_1.getCoordString)({ x: AINode.x + ax[i], y: AINode.y + ay[i] });
                if (AINodeMap.has(coordString)) {
                    var node = AINodeMap.get(coordString);
                    if (AINode.disC + 1 <= limit && node.totalC > AINode.disC + 1 + node.desC) {
                        node.disC = AINode.disC + 1;
                        node.totalC = node.desC + node.disC;
                        node.lastNode = AINode;
                        AINode.nextNode = node;
                    }
                }
            }
            if (AINode.disC <= limit)
                results.push(AINode);
            AINode = nodePriorQueue.remove();
        }
        // deal with the result
        var fullPath = [];
        if (!AINode) {
            AINode = results.reduce(function (lvN, n) {
                return n.desC < lvN.desC ?
                    n :
                    lvN;
            }, results[0]);
            // log(AINode);
        }
        while (AINode) {
            var coord = { x: AINode.x, y: AINode.y };
            fullPath.unshift(coord);
            AINode = AINode.lastNode;
        }
        return fullPath;
    };
    Battle.prototype.getMoveActionListFromCoordArray = function (rstat, path) {
        var moveActions = [];
        var i = 1;
        var lastCoord = path[0];
        var lastAxisChange = { x: 9, y: 9 };
        while (path[i]) {
            // get the Vector2 difference between last travelled coordinate and this coordinate
            var thisCompass = (0, Utility_1.getCompass)(lastCoord, path[i]);
            // if (lastAxisChange.x !== thisCompass.x || lastAxisChange.y !== thisCompass.y) {
            // append new moveAction
            var axis = (thisCompass.x !== 0) ? "x" : "y";
            var realStat = this.allStats(true).find(function (s) { return s.index === rstat.index; });
            var moveAction = (0, Utility_1.getMoveAction)(realStat, thisCompass[axis], moveActions.length + 1, axis);
            if (moveAction !== null) {
                moveActions.push(moveAction);
            }
            //     lastAxisChange = thisCompass;
            // }
            // else {
            //     // increase magnitude of last moveAction
            //     const lastAction: MoveAction = getLastElement(moveActions);
            //     lastAction.magnitude += Math.sign(lastAction.magnitude);
            // }
            lastCoord = path[i];
            i++;
        }
        return moveActions;
    };
    // status function
    Battle.prototype.removeStatus = function (_status) {
        var owner = _status.affected;
        var index = owner.statusEffects.indexOf(_status);
        if (index !== -1) {
            owner.statusEffects.splice(index);
        }
    };
    Battle.prototype.removeBuffStatus = function (_s, _value, _buffType) {
        // check if current buff is equal to value
        if (_s.buffs[_buffType] === _value) {
            // if true, check if there are other buffs that is giving the same buff
            var otherSameTypeBuffs = this.getStatus(_s, (0, Utility_1.getBuffStatusEffect)(_buffType));
            if (!otherSameTypeBuffs.find(function (_se) { return _se.value === _value; })) {
                // if no other buff is the same, reset buff
                _s.buffs[_buffType] = 0;
                // find other buffs that give the same type of buff
                if (otherSameTypeBuffs.length > 0) {
                    var largestBuff = (0, Utility_1.getLargestInArray)(otherSameTypeBuffs, function (_se) { return _se.value; });
                    _s.buffs[_buffType] = largestBuff.value;
                }
            }
            else {
                // if yes, ignore
            }
        }
        else {
            // is not 5, buff is most probably more than 5. Ignore.
        }
    };
    Battle.prototype.getStatus = function (_stat, _type) {
        return _stat.statusEffects.filter(function (_s) { return _s.type === _type; });
    };
    Battle.MOVE_READINESS = 10;
    return Battle;
}());
exports.Battle = Battle;
