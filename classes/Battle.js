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
var fs_1 = __importDefault(require("fs"));
var MinHeap_1 = require("./MinHeap");
var typedef_1 = require("../typedef");
var Battle = /** @class */ (function () {
    function Battle(_mapData, _author, _message, _client) {
        var _this = this;
        this.author = _author;
        this.message = _message;
        this.channel = _message.channel;
        this.client = _client;
        this.guild = _message.guild;
        this.mapData = _mapData;
        this.width = _mapData.map.width;
        this.height = _mapData.map.height;
        this.CSMap = (0, Utility_1.getMapFromCS)(_mapData.map.coordStat);
        this.pixelsPerTile = 50;
        // sort status
        // this.beforeActionStatusVL = {};
        // this.afterActionStatusVL = {};
        // this.beforeStatusVL = {};
        // this.afterStatusVL = {};
        // this.onHitStatusVL = {};
        // action strings
        this.roundActionsArray = [];
        this.roundSavedCanvasMap = new Map();
        var allStats = this.allStats(true);
        // fixing spawning
        this.enemiesToBeSpawnedArray = [];
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
    /** Main function to access in order to start a thread of battle */
    Battle.Start = function (_mapData, _author, _message, _party, _client) {
        return __awaiter(this, void 0, void 0, function () {
            var battle, i, ownerID, userData, blankStat, _a, _b, _c, key, value, Eclass, mod, enemyBase, spawnCount, i;
            var e_1, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        battle = new Battle(_mapData, _author, _message, _client);
                        i = 0;
                        _e.label = 1;
                    case 1:
                        if (!(i < _party.length)) return [3 /*break*/, 4];
                        ownerID = _party[i];
                        return [4 /*yield*/, (0, Database_1.getUserData)(ownerID)];
                    case 2:
                        userData = _e.sent();
                        blankStat = (0, Utility_1.getStat)((0, Utility_1.getBaseStat)(userData.equippedClass), ownerID);
                        battle.enemiesToBeSpawnedArray.push(blankStat);
                        _e.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        try {
                            // add enemies to the spawning list
                            for (_a = __values(Object.entries(_mapData.enemiesInfo)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                _c = __read(_b.value, 2), key = _c[0], value = _c[1];
                                Eclass = key;
                                mod = { name: "" + Eclass };
                                enemyBase = (0, Utility_1.getNewObject)(enemiesData_json_1.default[Eclass], mod);
                                spawnCount = (0, Utility_1.random)(value.min, value.max);
                                for (i = 0; i < spawnCount; i++) {
                                    battle.totalEnemyCount++;
                                    battle.enemyCount++;
                                    battle.enemiesToBeSpawnedArray.push((0, Utility_1.getStat)(enemyBase));
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        battle.StartRound();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Begin a new round
        Recurses into another StartRound until all enemies / players are defeated (HP <= 0). */
    Battle.prototype.StartRound = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var allStats, _loop_1, i, existingCategory, commandCategory, _d, existingPermissions_everyone, currentMapDataURL, reportPromises, _loop_2, this_1, allStats_1, allStats_1_1, rstat, e_2_1, _loop_3, i, allPromise, players, endEmbedFields_1;
            var e_2, _e;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        (0, Utility_1.log)("======= New Round =======");
                        // resetting action list and round current maps
                        this.roundActionsArray = [];
                        this.roundSavedCanvasMap = new Map();
                        // SPAWNING
                        (0, Utility_1.log)("Spawning...");
                        this.SpawnOnSpawner();
                        return [4 /*yield*/, (0, Database_1.saveBattle)(this)];
                    case 1:
                        _f.sent();
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
                            // randomly assign tokens
                            for (var i_1 = 0; i_1 < 2; i_1++) {
                                var got = (0, Utility_1.random)(0, 2);
                                switch (got) {
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
                                s[t] = (0, Utility_1.clamp)(p, 0, 5);
                            });
                            // increment readiness
                            if (s.team && s.readiness <= 50) {
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
                        _d = existingCategory;
                        if (_d) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.guild.channels.create('CommandRooms' + this.guild.id, { type: 'GUILD_CATEGORY' })];
                    case 2:
                        _d = (_f.sent());
                        _f.label = 3;
                    case 3:
                        commandCategory = _d;
                        existingPermissions_everyone = (_a = commandCategory.permissionOverwrites.cache.get(this.guild.roles.everyone.id)) === null || _a === void 0 ? void 0 : _a.deny.toArray();
                        if (!(existingPermissions_everyone === null || existingPermissions_everyone === void 0 ? void 0 : existingPermissions_everyone.includes("VIEW_CHANNEL"))) {
                            commandCategory.permissionOverwrites.set([{ id: this.guild.roles.everyone.id, deny: 'VIEW_CHANNEL' }]);
                        }
                        //#endregion
                        // this.BeforeAll(allStats);
                        // check death: after passive
                        // this.CheckDeath(allStats);
                        //#region SAVE CURRENT MAP TO LOCAL
                        (0, Utility_1.log)("Saving current map to local...");
                        return [4 /*yield*/, this.getNewCanvasMap()];
                    case 4:
                        currentMapDataURL = (_f.sent()).toDataURL();
                        return [4 /*yield*/, new Promise(function (resolve) {
                                var thePath = "./maps/battle-" + _this.author.id + ".txt";
                                fs_1.default.writeFile(thePath, currentMapDataURL, 'utf8', function () {
                                    resolve(void 0);
                                });
                            })];
                    case 5:
                        _f.sent();
                        reportPromises = [];
                        (0, Utility_1.log)("Playing phase!");
                        _loop_2 = function (rstat) {
                            var user, stat_1, channelAlreadyExist, createdChannel_1, _g, existingPermissions_everyone_1, existingPermissions_author, overWrites, playerInfoMessage, _h, _j, readingPlayerPromise, virtualStat, selectedTarget, weaponSelected, path, moveActionArray, fullActions, i, moveAction, moveMagnitude, result, errorEmbed, attackCheck, attackAction, result;
                            var _k;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        // if the entity is dead or is just an inanimate block, skip turn
                                        if (rstat.HP <= 0 || rstat.team === "block")
                                            return [2 /*return*/, "continue"];
                                        // reset weapon uses for entity
                                        rstat.weaponUses.forEach(function (wU) { return wU = 0; });
                                        // reset moved
                                        rstat.moved = false;
                                        if (!(rstat.botType === typedef_1.BotType.naught)) return [3 /*break*/, 6];
                                        return [4 /*yield*/, this_1.client.users.fetch(rstat.owner)
                                                .then(function (u) { return u; })
                                                .catch(function (err) {
                                                console.log(err);
                                                return null;
                                            })];
                                    case 1:
                                        user = _l.sent();
                                        stat_1 = (0, Utility_1.getNewObject)(rstat, { username: (user ? user.username : rstat.owner) });
                                        channelAlreadyExist = this_1.guild.channels.cache.find(function (c) { return c.name === stat_1.owner && c.type === 'GUILD_TEXT'; });
                                        _g = channelAlreadyExist;
                                        if (_g) return [3 /*break*/, 3];
                                        return [4 /*yield*/, this_1.guild.channels.create("" + stat_1.owner, { type: 'GUILD_TEXT' })];
                                    case 2:
                                        _g = (_l.sent());
                                        _l.label = 3;
                                    case 3:
                                        createdChannel_1 = _g;
                                        createdChannel_1.setParent(commandCategory.id);
                                        existingPermissions_everyone_1 = (_b = createdChannel_1.permissionOverwrites.cache.get(this_1.guild.roles.everyone.id)) === null || _b === void 0 ? void 0 : _b.deny.toArray();
                                        existingPermissions_author = (_c = createdChannel_1.permissionOverwrites.cache.get(stat_1.owner)) === null || _c === void 0 ? void 0 : _c.allow.toArray();
                                        if (!channelAlreadyExist ||
                                            !existingPermissions_author ||
                                            !existingPermissions_everyone_1 ||
                                            existingPermissions_author.length > 1 ||
                                            existingPermissions_everyone_1.length > 1 ||
                                            !existingPermissions_author.includes('VIEW_CHANNEL') ||
                                            !existingPermissions_everyone_1.includes('VIEW_CHANNEL')) {
                                            overWrites = [
                                                { id: this_1.guild.roles.everyone, deny: 'VIEW_CHANNEL' },
                                                { id: stat_1.owner, allow: 'VIEW_CHANNEL' }
                                            ];
                                            createdChannel_1.permissionOverwrites.set(overWrites);
                                        }
                                        // mention user
                                        createdChannel_1.send("<@" + (user === null || user === void 0 ? void 0 : user.id) + ">").then(function (mes) { return mes.delete().catch(console.log); });
                                        // send time, player embed, and input manual
                                        createdChannel_1.send("``` ```");
                                        _j = (_h = createdChannel_1).send;
                                        return [4 /*yield*/, this_1.getFullPlayerEmbedMessageOptions(stat_1)];
                                    case 4: return [4 /*yield*/, _j.apply(_h, [_l.sent()])];
                                    case 5:
                                        playerInfoMessage = _l.sent();
                                        readingPlayerPromise = this_1.readActions(120, playerInfoMessage, stat_1).then(function () {
                                            createdChannel_1.send({ embeds: [new discord_js_1.MessageEmbed().setTitle("Your turn has ended.")] });
                                        });
                                        reportPromises.push(readingPlayerPromise);
                                        _l.label = 6;
                                    case 6:
                                        //#endregion
                                        //#region AI
                                        if (rstat.botType === typedef_1.BotType.enemy) {
                                            virtualStat = (0, Utility_1.getNewObject)(rstat);
                                            selectedTarget = this_1.findEntity_closest(virtualStat, ["block", virtualStat.team]);
                                            // option 2: select the weakest target
                                            // if found a target
                                            if (selectedTarget !== null) {
                                                weaponSelected = virtualStat.base.weapons[0];
                                                path = this_1.startPathFinding(rstat, selectedTarget);
                                                moveActionArray = this_1.getMoveActionListFromCoordArray(rstat, path);
                                                fullActions = [];
                                                i = 0;
                                                // while the enemy has not moved or has enough sprint to make additional moves
                                                // Using (rstat.sprint - i) because rstat is by reference and modification is only legal in execution.
                                                while (i < moveActionArray.length && (virtualStat.moved === false || virtualStat.sprint > 0)) {
                                                    moveAction = moveActionArray[i];
                                                    moveMagnitude = Math.abs(moveAction.magnitude);
                                                    // log(`move checking for ${rstat.base.class} (${rstat.index}): ${moveAction.magnitude} ${moveAction.axis}`)
                                                    if (moveMagnitude > 0) {
                                                        moveAction.sprint = Number(virtualStat.moved);
                                                        result = this_1.executeVirtualMovement(moveAction, virtualStat);
                                                        if (result.magnitude !== undefined) {
                                                            virtualStat.moved = true;
                                                            if (result.magnitude !== undefined) {
                                                                fullActions.push(moveAction);
                                                            }
                                                        }
                                                        else if (result !== null) {
                                                            errorEmbed = result;
                                                            (0, Utility_1.log)("Failed to move. Reason: " + errorEmbed.title + " (" + errorEmbed.description + ")");
                                                        }
                                                    }
                                                    i++;
                                                }
                                                // 3. attack with selected weapon
                                                if ((0, Utility_1.checkWithinDistance)(weaponSelected, (0, Utility_1.getDistance)(virtualStat, selectedTarget))) {
                                                    attackCheck = this_1.validateTarget(virtualStat, weaponSelected, selectedTarget);
                                                    if (attackCheck === null) {
                                                        attackAction = (0, Utility_1.getAttackAction)(virtualStat, selectedTarget, weaponSelected, selectedTarget, fullActions.length);
                                                        result = this_1.executeVirtualAttack(attackAction, virtualStat);
                                                        if (result.weapon !== undefined) {
                                                            fullActions.push(attackAction);
                                                        }
                                                    }
                                                }
                                                (_k = this_1.roundActionsArray).push.apply(_k, __spreadArray([], __read(fullActions), false));
                                            }
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _f.label = 6;
                    case 6:
                        _f.trys.push([6, 11, 12, 13]);
                        allStats_1 = __values(allStats), allStats_1_1 = allStats_1.next();
                        _f.label = 7;
                    case 7:
                        if (!!allStats_1_1.done) return [3 /*break*/, 10];
                        rstat = allStats_1_1.value;
                        return [5 /*yield**/, _loop_2(rstat)];
                    case 8:
                        _f.sent();
                        _f.label = 9;
                    case 9:
                        allStats_1_1 = allStats_1.next();
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_2_1 = _f.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (allStats_1_1 && !allStats_1_1.done && (_e = allStats_1.return)) _e.call(allStats_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 13: 
                    //#endregion
                    //#region WAIT FOR PLAYER INPUTS
                    return [4 /*yield*/, Promise.all(reportPromises)];
                    case 14:
                        //#endregion
                        //#region WAIT FOR PLAYER INPUTS
                        _f.sent();
                        (0, Utility_1.log)("Players are all ready!");
                        //#endregion
                        //#region EXECUTING ACTIONS
                        return [4 /*yield*/, this.totalExecution()];
                    case 15:
                        //#endregion
                        //#region EXECUTING ACTIONS
                        _f.sent();
                        _loop_3 = function (i) {
                            var s = allStats[i];
                            (0, Utility_1.HandleTokens)(s, function (p, t) {
                                if (p > 3) {
                                    s[t] = 3;
                                }
                            });
                        };
                        //#endregion
                        for (i = 0; i < allStats.length; i++) {
                            _loop_3(i);
                        }
                        // check death: after player round
                        this.checkDeath(allStats);
                        // status: check deaths after 
                        //#region REPORT ACTIONS
                        (0, Utility_1.log)("Reporting...");
                        allPromise = [];
                        players = allStats.filter(function (s) { return s.botType === typedef_1.BotType.naught; });
                        players.forEach(function (stat) { return __awaiter(_this, void 0, void 0, function () {
                            var greatestRoundNumber, commandRoomReport;
                            return __generator(this, function (_a) {
                                greatestRoundNumber = (0, Utility_1.getLargestInArray)(Array.from(this.roundSavedCanvasMap.keys()));
                                commandRoomReport = this.sendReportToCommand(stat.owner, greatestRoundNumber);
                                allPromise.push(commandRoomReport);
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
                    case 16:
                        // wait for all players to finish reading the reports
                        _f.sent();
                        (0, Utility_1.log)("Reporting phase finished.");
                        // allPromise.forEach(console.log);
                        //#endregion
                        //#region Finish the Round
                        (0, Utility_1.log)("Finishing Round...");
                        // if (this.playerCount === 0 || (this.totalEnemyCount === 0 && this.spawning.length === 0))
                        if (false) {
                            endEmbedFields_1 = [];
                            this.callbackOnParty(function (stat) {
                                var statAcco = stat.accolades;
                                var value = "Kills: " + statAcco.kill + "\n                        Damage Dealt: " + (0, Utility_1.roundToDecimalPlace)(statAcco.damageDealt) + "\n                        Healing Done: " + (0, Utility_1.roundToDecimalPlace)(statAcco.healingDone) + "\n                        Damage Absorbed: " + (0, Utility_1.roundToDecimalPlace)(statAcco.absorbed) + "\n                        Damage Taken: " + (0, Utility_1.roundToDecimalPlace)(statAcco.damageTaken) + "\n                        Dodged: " + statAcco.dodged + " times\n                        Critical Hits: " + statAcco.critNo + " times\n                        Clashed " + statAcco.clashNo + " times\n                        Average Rolls: " + ((0, Utility_1.roundToDecimalPlace)(statAcco.rollAverage) || "N/A");
                                endEmbedFields_1.push({
                                    name: stat.name + (" (" + stat.base.class + ")"),
                                    value: value,
                                });
                            });
                            this.channel.send({
                                embeds: [new discord_js_1.MessageEmbed({
                                        title: this.totalEnemyCount === 0 ? "VICTORY!" : "Defeat.",
                                        fields: endEmbedFields_1,
                                    })]
                            });
                        }
                        else {
                            this.StartRound();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Execute function on every stat of players */
    Battle.prototype.callbackOnParty = function (arg0) {
        throw new Error("Method not implemented.");
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
            var embed, menuOptions, chosenCanvas, messageOption, promisedMsg_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        embed = new discord_js_1.MessageEmbed({ title: "Round " + round, }).setImage("attachment://map.png");
                        menuOptions = Array.from(this.roundSavedCanvasMap.keys()).map(function (rn) {
                            return {
                                label: "Round " + rn,
                                value: "" + rn,
                            };
                        });
                        chosenCanvas = this.roundSavedCanvasMap.get(round);
                        if (!chosenCanvas) return [3 /*break*/, 2];
                        messageOption = {
                            embeds: [embed],
                            components: [(0, Utility_1.getSelectMenuActionRow)(menuOptions)],
                            files: [{ attachment: chosenCanvas.toBuffer(), name: 'map.png' }]
                        };
                        return [4 /*yield*/, this.sendToCommand(roomID, messageOption)];
                    case 1:
                        promisedMsg_1 = _a.sent();
                        if (promisedMsg_1) {
                            return [2 /*return*/, new Promise(function (resolve) {
                                    var itrCollector = (0, Utility_1.setUpInteractionCollect)(promisedMsg_1, function (itr) { return __awaiter(_this, void 0, void 0, function () {
                                        var selectedRound;
                                        return __generator(this, function (_a) {
                                            if (itr.isSelectMenu()) {
                                                selectedRound = parseInt(itr.values[0]);
                                                clearTimeout(timeOut);
                                                promisedMsg_1.delete();
                                                resolve(this.sendReportToCommand(roomID, selectedRound));
                                            }
                                            return [2 /*return*/];
                                        });
                                    }); });
                                    var timeOut = setTimeout(function () {
                                        itrCollector.stop();
                                        resolve(true);
                                    }, 15 * 1000);
                                })];
                        }
                        else {
                            return [2 /*return*/, true];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    Battle.prototype.getStatsRoundActions = function (stat) {
        return this.roundActionsArray.filter(function (a) { return a.from.index === stat.index; });
    };
    Battle.prototype.getCanvasCoordsFromBattleCoord = function (s) {
        return {
            x: s.x * this.pixelsPerTile + this.pixelsPerTile / 2,
            y: (this.height - s.y) * this.pixelsPerTile - this.pixelsPerTile / 2
        };
    };
    Battle.prototype.drawSquareOnBattleCoords = function (ctx, coord, rgba) {
        var canvasCoord = this.getCanvasCoordsFromBattleCoord(coord);
        if (rgba) {
            ctx.fillStyle = (0, Utility_1.stringifyRGBA)(rgba);
        }
        ctx.fillRect(canvasCoord.x, canvasCoord.y, this.pixelsPerTile, this.pixelsPerTile);
    };
    Battle.prototype.executeVirtualAttack = function (attackAction, virtualStat) {
        var realStat = this.allStats(true).find(function (s) { return s.index === virtualStat.index; });
        var target = attackAction.affected;
        var weapon = attackAction.weapon;
        var check = this.validateTarget(virtualStat, attackAction.weapon, target);
        if (check === null) { // attack goes through
            virtualStat.weaponUses[(0, Utility_1.getWeaponIndex)(weapon, virtualStat)]++;
            var action_1 = {
                executed: false,
                type: "Attack",
                from: realStat,
                affected: target,
                readiness: weapon.Readiness,
                sword: weapon.sword,
                shield: weapon.shield,
                sprint: weapon.sprint,
                priority: attackAction.priority,
                weapon: weapon,
                coordinate: { x: target.x, y: target.y },
            };
            virtualStat.readiness -= action_1.readiness;
            (0, Utility_1.HandleTokens)(virtualStat, function (p, t) {
                virtualStat[t] -= action_1[t];
            });
            return action_1;
        }
        else { // attack cannot go through
            (0, Utility_1.log)("Failed to target. Reason: " + check.reason + " (" + check.value + ")");
            return new discord_js_1.MessageEmbed({
                title: check.reason,
                description: "Failed to target. Reason: " + check.reason + " (" + check.value + ")",
            });
        }
    };
    ;
    Battle.prototype.executeVirtualMovement = function (moveAction, virtualStat) {
        if (Math.abs(moveAction.magnitude) > 0) {
            var realStat = this.allStats(true).find(function (s) { return s.index === virtualStat.index; });
            moveAction.affected = realStat;
            moveAction.from = realStat;
            if (moveAction !== null) {
                var check = this.validateMovement(virtualStat, moveAction);
                if (check === null) {
                    (0, Utility_1.log)("\t\tMoved!");
                    // second (or above) move
                    if (virtualStat.moved === true) {
                        (0, Utility_1.HandleTokens)(moveAction, function (p, type) {
                            if (type === "sprint") {
                                virtualStat.sprint -= p;
                            }
                        });
                    }
                    // other resource drain
                    virtualStat.readiness -= Battle.MOVE_READINESS * Math.abs(moveAction.magnitude);
                    virtualStat.moved = true;
                    return moveAction;
                }
                else {
                    (0, Utility_1.log)("\t\tFailed to move. Reason: " + check.reason + " (" + check.value + ")");
                    // no target warning
                    return new discord_js_1.MessageEmbed({
                        title: check.reason,
                        description: "Failed to move. Reference value: __" + check.value + "__",
                    });
                }
            }
        }
        return null;
    };
    ;
    // action reader methods
    Battle.prototype.readActions = function (time, infoMessage, virtualStat) {
        var _this = this;
        // returns a Promise that resolves when the player is finished with their moves
        return new Promise(function (resolve) {
            var currentListener;
            var responseQueue = [];
            var x = virtualStat.x, y = virtualStat.y, readiness = virtualStat.readiness, sword = virtualStat.sword, shield = virtualStat.shield, sprint = virtualStat.sprint;
            var actions = [];
            var infoMessagesQueue = [infoMessage];
            var channel = infoMessage.channel;
            var listenToQueue = function () {
                (0, Utility_1.log)("\tListening to queue...");
                if (currentListener) {
                    clearInterval(currentListener);
                }
                currentListener = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (responseQueue[0]) {
                            clearInterval(currentListener);
                            handleQueue();
                        }
                        return [2 /*return*/];
                    });
                }); }, 300);
            };
            var handleQueue = function () { return __awaiter(_this, void 0, void 0, function () {
                var mes, sections, actionName, actionArgs, moveMagnitude, valid, _a, moveAction, attackTarget, range_1, listOfWeaponsInRange, weaponChosen, attackAction, undoAction, targetedWeapon, victim, coord, AOE, attackAction, messageOptions;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            (0, Utility_1.log)("\tHandling queue...");
                            mes = responseQueue.shift();
                            sections = (0, Utility_1.extractCommands)(mes.content);
                            actionName = sections[0].toLocaleLowerCase();
                            actionArgs = sections.slice(1, sections.length);
                            moveMagnitude = parseInt(actionArgs[0]) || 1;
                            valid = null;
                            _a = actionName;
                            switch (_a) {
                                case "up": return [3 /*break*/, 1];
                                case "v": return [3 /*break*/, 1];
                                case "down": return [3 /*break*/, 1];
                                case "right": return [3 /*break*/, 1];
                                case "h": return [3 /*break*/, 1];
                                case "r": return [3 /*break*/, 1];
                                case "left": return [3 /*break*/, 1];
                                case "l": return [3 /*break*/, 1];
                                case "attack": return [3 /*break*/, 2];
                                case "clear": return [3 /*break*/, 3];
                                case "cr": return [3 /*break*/, 3];
                                case "end": return [3 /*break*/, 5];
                                case "log": return [3 /*break*/, 6];
                                case "undo": return [3 /*break*/, 7];
                            }
                            return [3 /*break*/, 10];
                        case 1:
                            moveAction = (0, Utility_1.getMoveAction)(virtualStat, actionName, infoMessagesQueue.length, moveMagnitude);
                            // debug("actionName", actionName);
                            // debug("axis", moveAction?.axis);
                            // debug("magnitude", moveAction?.magnitude);
                            // validate + act on (if valid) movement on virtual map
                            valid = this.executeVirtualMovement(moveAction, virtualStat);
                            // movement is permitted
                            if (valid.magnitude !== undefined) {
                                mes.react('✅');
                                actions.push(valid);
                            }
                            else {
                                mes.react('❎');
                                if (valid !== null) {
                                    channel.send({
                                        embeds: [valid]
                                    });
                                }
                            }
                            return [3 /*break*/, 11];
                        case 2:
                            attackTarget = this.findEntity_byArgs(actionArgs, virtualStat);
                            range_1 = attackTarget ?
                                (0, Utility_1.getDistance)(attackTarget, virtualStat) :
                                0;
                            listOfWeaponsInRange = attackTarget ?
                                virtualStat.base.weapons.filter(function (w) {
                                    return w.Range[0] <= range_1 &&
                                        w.Range[1] >= range_1 &&
                                        w.targetting.target === typedef_1.WeaponTarget.enemy;
                                }) :
                                [];
                            weaponChosen = attackTarget ?
                                listOfWeaponsInRange[(0, Utility_1.random)(0, listOfWeaponsInRange.length - 1)] :
                                null;
                            if (attackTarget === null || weaponChosen === null) {
                                valid = null;
                            }
                            else {
                                attackAction = (0, Utility_1.getAttackAction)(virtualStat, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                valid = attackAction ?
                                    this.executeVirtualAttack(attackAction, virtualStat) :
                                    null;
                            }
                            if (valid.weapon !== undefined) {
                                mes.react('✅');
                                actions.push(valid);
                            }
                            else {
                                mes.react('❎');
                                if (valid !== null) {
                                    channel.send({
                                        embeds: [valid]
                                    });
                                }
                            }
                            return [3 /*break*/, 11];
                        case 3:
                            actions = [];
                            infoMessagesQueue = [infoMessage];
                            Object.assign(virtualStat, { x: x, y: y, readiness: readiness, sword: sword, shield: shield, sprint: sprint });
                            return [4 /*yield*/, (0, Utility_1.clearChannel)(channel, infoMessage)];
                        case 4:
                            _b.sent();
                            return [3 /*break*/, 11];
                        case 5:
                            newCollector.stop();
                            (0, Utility_1.log)("Ended turn for \"" + virtualStat.name + "\" (" + virtualStat.base.class + ")");
                            return [3 /*break*/, 11];
                        case 6:
                            Utility_1.log.apply(void 0, __spreadArray([], __read(this.allStats().filter(function (s) { return s.team !== "block"; }).map(function (s) {
                                var string = s.base.class + " (" + s.index + ") (" + s.team + ") " + s.HP + "/" + (0, Utility_1.getAHP)(s) + " (" + s.x + ", " + s.y + ")";
                                return string;
                            })), false));
                            return [3 /*break*/, 11];
                        case 7:
                            if (!(infoMessagesQueue.length > 1)) return [3 /*break*/, 9];
                            undoAction = actions.pop();
                            (0, Utility_1.dealWithUndoAction)(virtualStat, undoAction);
                            infoMessagesQueue.pop();
                            return [4 /*yield*/, (0, Utility_1.clearChannel)(channel, (0, Utility_1.getLastElement)(infoMessagesQueue))];
                        case 8:
                            _b.sent();
                            _b.label = 9;
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            targetedWeapon = virtualStat.base.weapons.find(function (w) { return w.Name.toLowerCase().search(actionName) !== -1; });
                            if (targetedWeapon) {
                                mes.react('✅');
                                victim = this.findEntity_byArgs(actionArgs, virtualStat, targetedWeapon);
                                if (victim === null) {
                                    valid = null;
                                }
                                else {
                                    coord = void 0;
                                    AOE = targetedWeapon.targetting.AOE;
                                    if (AOE === "self" || AOE === "selfCircle") {
                                        coord = {
                                            x: virtualStat.x,
                                            y: virtualStat.y,
                                        };
                                    }
                                    else {
                                        coord = {
                                            x: victim.x,
                                            y: victim.y
                                        };
                                    }
                                    attackAction = (0, Utility_1.getAttackAction)(virtualStat, victim, targetedWeapon, coord, infoMessagesQueue.length);
                                    valid = this.executeVirtualAttack(attackAction, virtualStat);
                                }
                            }
                            else {
                                mes.react('❎');
                                setTimeout(function () { return mes.delete().catch(console.log); }, 10 * 1000);
                            }
                            return [3 /*break*/, 11];
                        case 11:
                            (0, Utility_1.debug)("\tvalid", valid !== null);
                            if (!(valid !== null)) return [3 /*break*/, 13];
                            return [4 /*yield*/, this.getFullPlayerEmbedMessageOptions(virtualStat, actions)];
                        case 12:
                            messageOptions = _b.sent();
                            channel.send(messageOptions)
                                .then(function (m) {
                                if (valid.priority !== undefined) {
                                    infoMessagesQueue.push(m);
                                }
                                if (responseQueue[0]) {
                                    handleQueue();
                                }
                                else {
                                    listenToQueue();
                                }
                            });
                            return [3 /*break*/, 14];
                        case 13:
                            listenToQueue();
                            _b.label = 14;
                        case 14: return [2 /*return*/];
                    }
                });
            }); };
            var newCollector = new discord_js_1.MessageCollector(channel, {
                filter: function (m) { return m.author.id === virtualStat.owner; },
                time: time * 1000,
            });
            listenToQueue();
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
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            clearInterval(currentListener);
                            i = 0;
                            _b.label = 1;
                        case 1:
                            if (!(i < responseQueue.length)) return [3 /*break*/, 4];
                            return [4 /*yield*/, handleQueue()];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4:
                            (_a = this.roundActionsArray).push.apply(_a, __spreadArray([], __read(actions), false));
                            resolve(void 0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    // index manipulation
    Battle.prototype.getIndex_lookUp = function (min, max) {
        if (Math.abs(min - max) <= 1)
            return null;
        var middle = Math.floor((max + min) / 2);
        var got = this.allIndex.get(middle);
        // log(min, middle, max);
        if (!got)
            return middle;
        else
            return this.getIndex_lookUp(min, middle) || this.getIndex_lookUp(middle, max);
    };
    Battle.prototype.getIndex = function (stat) {
        if (this.allIndex.size < 1) {
            if (stat)
                stat.index = 0;
            return 0;
        }
        var indexi = Array.from(this.allIndex.keys()).sort(function (a, b) { return a - b; });
        var lookUpIndex = this.getIndex_lookUp(0, (0, Utility_1.getLastElement)(indexi));
        if (lookUpIndex === null)
            lookUpIndex = (0, Utility_1.getLastElement)(indexi) + 1;
        if (stat) {
            stat.index = lookUpIndex;
        }
        return lookUpIndex;
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
        return this.width > coord.x && this.height > coord.y && coord.x >= 0 && coord.y >= 0;
    };
    Battle.prototype.clashAfterMath = function (clashResult, attacker_attackAction, _target, _weapon) {
        var attacker = attacker_attackAction.from || attacker_attackAction;
        var target = attacker_attackAction.affected || _target;
        var weapon = attacker_attackAction.weapon || _weapon;
        var returnString = '';
        // vantage
        // effects
        // apply basic weapon damage
        returnString += this.applyDamage(attacker, target, weapon, clashResult);
        // retaliation
        return returnString;
    };
    Battle.prototype.applyDamage = function (attacker, target, weapon, clashResult) {
        var returnString = '';
        var CR_damage = clashResult.damage;
        var CR_fate = clashResult.fate;
        var CR_roll = clashResult.roll;
        switch (weapon.targetting.target) {
            // damaging
            case typedef_1.WeaponTarget.enemy:
                var hitRate = ((0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target)) < 100 ? (0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target) : 100;
                var critRate = ((0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(target)) * 0.1 + (0, Utility_1.getCrit)(attacker, weapon);
                (0, Utility_1.dealWithAccolade)(clashResult, attacker, target);
                returnString += "**" + attacker.base.class + "** (" + attacker.index + ") \u2694\uFE0F **" + target.base.class + "** (" + target.index + ") __*" + weapon.Name + "*__" + hitRate + "% (" + (0, Utility_1.roundToDecimalPlace)(critRate) + "% Crit)**" + CR_fate + "!** -**" + (0, Utility_1.roundToDecimalPlace)(CR_damage) + "** HP";
                if (target.HP > 0 && target.HP - CR_damage <= 0)
                    returnString += "**KILLING BLOW!**";
                var LS = (0, Utility_1.getLifesteal)(attacker, weapon);
                if (LS > 0) {
                    returnString += this.heal(attacker, CR_damage * LS);
                }
                target.HP -= CR_damage;
                break;
            // non-damaging
            case typedef_1.WeaponTarget.ally:
                returnString += "**" + attacker.base.class + "** \uD83D\uDEE1\uFE0F **" + (target && target.index !== attacker.index ? target.base.class : "") + "** (*" + weapon.Name + "*)";
                returnString += "";
                break;
        }
        return returnString;
    };
    Battle.prototype.clash = function (attacker, defender, weapon) {
        var fate = 'Miss';
        var roll, damage, u_damage = 0;
        // define constants
        var hitChance = (0, Utility_1.getAcc)(attacker, weapon) - (0, Utility_1.getDodge)(defender);
        var crit = (0, Utility_1.getCrit)(attacker, weapon);
        var minDamage = (0, Utility_1.getDamage)(attacker, weapon)[0];
        var maxDamage = (0, Utility_1.getDamage)(attacker, weapon)[1];
        var prot = (0, Utility_1.getProt)(defender);
        // roll
        var hit = (0, Utility_1.random)(1, 100);
        roll = hit;
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
        if (u_damage < 0)
            u_damage = 0;
        // apply protections
        damage = u_damage * (1 - prot);
        return {
            damage: damage,
            u_damage: u_damage,
            fate: fate,
            roll: roll,
        };
    };
    // spawning methods
    Battle.prototype.Spawn = function (unit, coords) {
        this.setIndex(unit);
        unit.x = coords.x;
        unit.y = coords.y;
        this.CSMap.set((0, Utility_1.getCoordString)(coords), unit);
    };
    Battle.prototype.SpawnOnSpawner = function (unit) {
        var _this = this;
        // adding addition units to be spawned this round.
        if (unit) {
            this.enemiesToBeSpawnedArray = this.enemiesToBeSpawnedArray.concat(unit);
        }
        var _loop_4 = function () {
            var stat = this_2.enemiesToBeSpawnedArray.shift();
            // 1. look for spawner
            var possibleCoords = this_2.mapData.map.spawners.filter(function (s) { return s.spawns === stat.team; }).map(function (s) {
                return { x: s.x, y: s.y };
            });
            // 2. look for coords if occupied and spawn if not
            var availableCoords = possibleCoords.filter(function (c) { return !_this.CSMap.has((0, Utility_1.getCoordString)(c)); });
            // 3. Spawn on Coords
            if (availableCoords.length > 0) {
                var c = availableCoords[(0, Utility_1.random)(0, availableCoords.length - 1)];
                this_2.Spawn(stat, c);
                // log(stat.base.class + " @ " + c.x + "," + c.y);
            }
        };
        var this_2 = this;
        while (this.enemiesToBeSpawnedArray[0]) {
            _loop_4();
        }
    };
    // execute actions
    Battle.prototype.totalExecution = function () {
        return __awaiter(this, void 0, void 0, function () {
            var priorityActionMap, i, act, actionListThisRound, latestPrio, i, expectedActions, canvas, ctx, _a, _b, expectedCanvas, executedActions, actualCanvas;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        priorityActionMap = new Map();
                        for (i = 0; i < this.roundActionsArray.length; i++) {
                            act = this.roundActionsArray[i];
                            actionListThisRound = priorityActionMap.get(act.priority);
                            if (actionListThisRound)
                                actionListThisRound.push(act);
                            else
                                priorityActionMap.set(act.priority, [act]);
                        }
                        latestPrio = (0, Utility_1.getLargestInArray)(this.roundActionsArray.map(function (a) { return a.priority; }));
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i <= latestPrio)) return [3 /*break*/, 6];
                        expectedActions = priorityActionMap.get(i);
                        if (!expectedActions) return [3 /*break*/, 5];
                        this.sortActionsByGreaterPrior(expectedActions);
                        canvas = this.roundSavedCanvasMap.get(i);
                        if (!canvas) {
                            canvas = new canvas_1.Canvas(this.width * 50, this.height * 50);
                            if (canvas)
                                this.roundSavedCanvasMap.set(i, canvas);
                        }
                        ctx = canvas.getContext("2d");
                        _b = (_a = ctx).drawImage;
                        return [4 /*yield*/, this.getNewCanvasMap()];
                    case 2:
                        _b.apply(_a, [_c.sent(), 0, 0, canvas.width, canvas.height]);
                        return [4 /*yield*/, this.getActionArrowsCanvas(expectedActions, {
                                r: 255,
                                g: 0,
                                b: 0,
                                alpha: 0.25
                            })];
                    case 3:
                        expectedCanvas = _c.sent();
                        executedActions = this.executeActions(expectedActions);
                        return [4 /*yield*/, this.getActionArrowsCanvas(executedActions)];
                    case 4:
                        actualCanvas = _c.sent();
                        // draw executed actions
                        ctx.drawImage(actualCanvas, 0, 0, canvas.width, canvas.height);
                        // draw the arrows of expected actions on top
                        // ctx.drawImage(expectedCanvas, 0, 0, canvas.width, canvas.height);
                        // update the final canvas
                        this.roundSavedCanvasMap.set(i, canvas);
                        _c.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Battle.prototype.sortActionsByGreaterPrior = function (actions) {
        var getGreaterPrio = function (a) { return (1000 * (20 - a.priority)) + (a.from.readiness - a.readiness); };
        var sortedActions = actions.sort(function (a, b) { return getGreaterPrio(b) - getGreaterPrio(a); });
        return sortedActions;
    };
    Battle.prototype.executeActions = function (actions) {
        (0, Utility_1.log)("Executing actions...");
        var returning = [];
        this.sortActionsByGreaterPrior(actions);
        var executing = actions.shift();
        while (executing) {
            returning.push(this.executeOneAction(executing));
            executing = actions.shift();
        }
        return returning;
    };
    Battle.prototype.executeOneAction = function (action, show) {
        if (show === void 0) { show = true; }
        var stat = action.from;
        var mAction = action;
        var aAction = action;
        // =========LOG=========
        if (show && 'axis' in action) {
            (0, Utility_1.log)("\tmove: " + mAction.axis + " " + mAction.magnitude);
        }
        else if (show) {
            (0, Utility_1.log)("\tattack: " + aAction.affected.base.class + " (" + aAction.affected.index + ") using " + aAction.weapon.Name);
        }
        // =========LOG=========
        action.executed = true;
        stat.readiness -= action.readiness;
        (0, Utility_1.HandleTokens)(stat, function (p, t) { return stat[t] -= action[t]; });
        return action.type === 'Attack' ?
            this.executeAttackAction(aAction) :
            this.executeMoveAction(mAction);
    };
    // actions
    Battle.prototype.executeAttackAction = function (attackAction) {
        var _this = this;
        var target = attackAction.affected;
        var attacker = attackAction.from;
        var weapon = attackAction.weapon;
        var SA = function (gStat, gTarget) {
            if (gStat === void 0) { gStat = attacker; }
            if (gTarget === void 0) { gTarget = target; }
            var eM = _this.validateTarget(attacker, weapon, target);
            if (eM) {
                (0, Utility_1.log)(attacker.base.class + " failed to attack " + target.base.class + ". Reason: " + eM.reason);
                // return `**${attacker.base.class}** (${attacker.index}) ⚔️ **${target.base.class}** (${target.index}) ❌${eM.reason}${eM.value !== null ? ` ( ${eM.value} )` : ""}`;
            }
            else {
                // valid attack
                var clashResult = _this.clash(gStat, gTarget, weapon);
                var clashAfterMathString = _this.clashAfterMath(clashResult, gStat, gTarget, weapon);
                // return clashAfterMathString + "";
            }
        };
        var AOE = function (center, inclusive) {
            var enemiesInRadius = _this.findEntities_radius(center, weapon.Range[2] || weapon.Range[1], inclusive);
            var arrayOfResults = [];
            var string = '';
            for (var i = 0; i < enemiesInRadius.length; i++) {
                var SAResult = SA(attacker, enemiesInRadius[i]);
                string += SAResult;
                arrayOfResults.push(SAResult);
            }
            // return string;
        };
        var line = function () {
            var yDif = target.y - attacker.y;
            var xDif = target.x - attacker.x;
            var slope = yDif / xDif;
            (0, Utility_1.log)("   slope: " + slope);
            var enemiesInLine = _this.findEntities_inLine(attacker, target);
            (0, Utility_1.log)("   " + enemiesInLine.length + " enemies in line");
            var string = '';
            var arrayOfResults = [];
            for (var i = 0; i < enemiesInLine.length; i++) {
                var SAResult = SA(attacker, enemiesInLine[i]);
                string += SAResult;
                arrayOfResults.push(SAResult);
            }
        };
        switch (weapon.targetting.AOE) {
            case "single":
            case "touch":
                SA();
                break;
            case "circle":
                AOE(attackAction.coordinate, true);
                break;
            case "selfCircle":
                AOE(attacker, false);
                break;
            case "line":
                line();
                break;
        }
        return attackAction;
    };
    Battle.prototype.executeMoveAction = function (moveAction) {
        var stat = moveAction.affected;
        var axis = moveAction.axis;
        var possibleSeats = this.getAvailableSpacesAhead(moveAction);
        var finalCoord = (0, Utility_1.getLastElement)(possibleSeats);
        var newMagnitude = (finalCoord ? (0, Utility_1.getDistance)(finalCoord, moveAction.affected) : 0) * Math.sign(moveAction.magnitude);
        var direction = (0, Utility_1.getDirection)(axis, newMagnitude);
        this.CSMap.delete((0, Utility_1.getCoordString)(stat));
        stat[axis] += newMagnitude;
        this.CSMap = this.CSMap.set((0, Utility_1.getCoordString)(stat), stat);
        console.log(moveAction.from.base.class + " (" + moveAction.from.index + ") \uD83D\uDC62" + (0, Utility_1.formalize)(direction) + " " + Math.abs(newMagnitude) + " blocks.");
        return (0, Utility_1.getNewObject)(moveAction, { magnitude: newMagnitude });
    };
    Battle.prototype.heal = function (stat, value) {
        var beforeHP = (0, Utility_1.roundToDecimalPlace)(stat.HP);
        if (stat.HP > 0) {
            stat.HP += value;
            if (stat.HP > (0, Utility_1.getAHP)(stat))
                stat.HP = (0, Utility_1.getAHP)(stat);
        }
        var afterHP = (0, Utility_1.roundToDecimalPlace)(stat.HP);
        stat.accolades.healingDone += (afterHP - beforeHP);
        return beforeHP !== afterHP ? "\u271A " + beforeHP + " => " + afterHP : '';
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
    Battle.prototype.getNewCanvasMap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var allStats, groundImage, canvas, ctx, i, stat, X, Y, iconImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allStats = this.allStats();
                        return [4 /*yield*/, (0, Database_1.getFileImage)(this.mapData.map.groundURL)];
                    case 1:
                        groundImage = _a.sent();
                        canvas = (0, Utility_1.returnGridCanvas)(this.height, this.width, this.pixelsPerTile, groundImage);
                        ctx = canvas.getContext('2d');
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < allStats.length)) return [3 /*break*/, 5];
                        stat = allStats[i];
                        X = stat.x;
                        Y = stat.y;
                        return [4 /*yield*/, (0, Database_1.getIcon)(stat)];
                    case 3:
                        iconImage = _a.sent();
                        // log(`   ||=> Done.`);
                        ctx.drawImage(iconImage, X * this.pixelsPerTile, (this.height - 1 - Y) * this.pixelsPerTile, this.pixelsPerTile, this.pixelsPerTile);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: 
                    // end
                    return [2 /*return*/, canvas];
                }
            });
        });
    };
    Battle.prototype.getCurrentMapCanvas = function () {
        return __awaiter(this, void 0, void 0, function () {
            var thePath, image, src, readsrc, err_1, newMap, dataBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        thePath = "./maps/battle-" + this.author.id + ".txt";
                        image = new canvas_1.Image();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 2, , 4]);
                        readsrc = fs_1.default.readFileSync(thePath, 'utf8');
                        // log("|| Finish reading.")
                        src = readsrc;
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        (0, Utility_1.log)("|| Creating new file...");
                        return [4 /*yield*/, this.getNewCanvasMap()];
                    case 3:
                        newMap = _a.sent();
                        dataBuffer = newMap.toDataURL();
                        fs_1.default.writeFileSync(thePath, dataBuffer);
                        src = dataBuffer;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, new Promise(function (resolve) {
                            image.onload = function () {
                                var _a = (0, Utility_1.startDrawing)(image.width, image.height), canvas = _a.canvas, ctx = _a.ctx;
                                ctx.drawImage(image, 0, 0, image.width, image.height);
                                // log("||=> Success. Canvas returned.")
                                resolve(canvas);
                            };
                            // log("|| Waiting for image to load...");
                            image.src = src;
                        })];
                }
            });
        });
    };
    Battle.prototype.getCurrentMapBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentMapCanvas()];
                    case 1: return [2 /*return*/, (_a.sent()).toBuffer()];
                }
            });
        });
    };
    Battle.prototype.getCurrentMapWithArrowsCanvas = function (stat, actions) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, canvas, ctx, baseImage, arrowsCanvas;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = (0, Utility_1.startDrawing)(this.width * 50, this.height * 50), canvas = _a.canvas, ctx = _a.ctx;
                        return [4 /*yield*/, this.getCurrentMapCanvas()];
                    case 1:
                        baseImage = _b.sent();
                        return [4 /*yield*/, this.getActionArrowsCanvas(actions || this.getStatsRoundActions(stat))];
                    case 2:
                        arrowsCanvas = _b.sent();
                        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
                        ctx.drawImage(arrowsCanvas, 0, 0, canvas.width, canvas.height);
                        return [2 /*return*/, canvas];
                }
            });
        });
    };
    Battle.prototype.getCurrentMapWithArrowsBuffer = function (stat) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentMapWithArrowsCanvas(stat)];
                    case 1: return [2 /*return*/, (_a.sent()).toBuffer()];
                }
            });
        });
    };
    Battle.prototype.getActionArrowsCanvas = function (actions, style) {
        if (style === void 0) { style = {
            r: 0,
            g: 0,
            b: 0,
            alpha: 1
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var canvas, ctx, drawPriorityText, drawAttackAction, virtualCoordsMap, _loop_5, i;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canvas = new canvas_1.Canvas(this.width * 50, this.height * 50);
                        ctx = canvas.getContext("2d");
                        style = (0, Utility_1.normaliseRGBA)(style);
                        ctx.fillStyle = (0, Utility_1.stringifyRGBA)(style);
                        ctx.strokeStyle = (0, Utility_1.stringifyRGBA)(style);
                        drawPriorityText = function (priority, coord, angle) {
                            ctx.save();
                            ctx.font = "15px Verdana";
                            ctx.lineWidth = 0.5;
                            ctx.fillStyle = "white";
                            ctx.strokeStyle = "black";
                            ctx.textAlign = "center";
                            ctx.translate(coord.x, coord.y);
                            ctx.rotate(angle);
                            ctx.fillText("" + priority, 0, 0);
                            ctx.strokeText("" + priority, 0, 0);
                            ctx.restore();
                        };
                        drawAttackAction = function (action, fromCoord, toCoord, priority) { return __awaiter(_this, void 0, void 0, function () {
                            var victimWithinDistance, fromCanvasCoord, toCanvasCoord, textCanvasCoordinate, x, y, angle, victimDead, greenBarPercentage, targetCanvasCoords, image, reversedY, edgeDistance, barStartingCanvasPosition, barEndingCanvasPosition, greenLineLength;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        (0, Utility_1.log)("Drawing attack action...");
                                        (0, Utility_1.debug)("\tfromCoord", { x: fromCoord.x, y: fromCoord.y });
                                        (0, Utility_1.debug)("\ttoCoord", { x: toCoord.x, y: toCoord.y });
                                        ctx.save();
                                        victimWithinDistance = (0, Utility_1.checkWithinDistance)(action.weapon, (0, Utility_1.getDistance)(action.from, action.affected));
                                        ctx.beginPath();
                                        ctx.strokeStyle = victimWithinDistance ?
                                            "red" :
                                            "black";
                                        ctx.lineWidth = 5;
                                        fromCanvasCoord = this.getCanvasCoordsFromBattleCoord(fromCoord);
                                        ctx.moveTo(fromCanvasCoord.x, fromCanvasCoord.y);
                                        toCanvasCoord = this.getCanvasCoordsFromBattleCoord(toCoord);
                                        ctx.lineTo(toCanvasCoord.x, toCanvasCoord.y);
                                        ctx.stroke();
                                        ctx.closePath();
                                        (0, Utility_1.debug)("\tfromCanvasCoord", { x: fromCanvasCoord.x, y: fromCanvasCoord.y });
                                        (0, Utility_1.debug)("\ttoCanvasCoord", { x: toCanvasCoord.x, y: toCanvasCoord.y });
                                        textCanvasCoordinate = this.getCanvasCoordsFromBattleCoord({
                                            x: (fromCoord.x + toCoord.x) / 2,
                                            y: (fromCoord.y + toCoord.y) / 2
                                        });
                                        x = toCoord.x - fromCoord.x;
                                        y = toCoord.y - fromCoord.y;
                                        angle = Math.atan2(y, x);
                                        drawPriorityText(priority, textCanvasCoordinate, -1 * angle);
                                        (0, Utility_1.debug)("\ttextCanvasCoord", textCanvasCoordinate);
                                        if (!victimWithinDistance) return [3 /*break*/, 2];
                                        victimDead = action.affected.HP <= 0;
                                        greenBarPercentage = victimDead ?
                                            1 :
                                            action.affected.HP / action.affected.base.AHP;
                                        ctx.lineWidth = 10;
                                        targetCanvasCoords = this.getCanvasCoordsFromBattleCoord(action.affected);
                                        return [4 /*yield*/, (0, Database_1.getFileImage)('./images/Hit.png')];
                                    case 1:
                                        image = _a.sent();
                                        reversedY = (this.height - 1 - action.affected.y);
                                        ctx.drawImage(image, action.affected.x * this.pixelsPerTile, reversedY * this.pixelsPerTile, this.pixelsPerTile * 0.7, this.pixelsPerTile * 0.7);
                                        edgeDistance = this.pixelsPerTile * (1 / 3);
                                        barStartingCanvasPosition = {
                                            x: targetCanvasCoords.x - edgeDistance,
                                            y: targetCanvasCoords.y - edgeDistance,
                                        };
                                        barEndingCanvasPosition = {
                                            x: targetCanvasCoords.x + edgeDistance,
                                            y: targetCanvasCoords.y - edgeDistance,
                                        };
                                        // draw red bar
                                        ctx.beginPath();
                                        // shift 1/3 of a block top and left from the center
                                        ctx.moveTo(barStartingCanvasPosition.x, barStartingCanvasPosition.y);
                                        ctx.strokeStyle = "red";
                                        // 1/3 to the top right
                                        ctx.lineTo(barEndingCanvasPosition.x, barEndingCanvasPosition.y);
                                        ctx.stroke();
                                        ctx.closePath();
                                        // draw green bar
                                        ctx.beginPath();
                                        ctx.moveTo(barStartingCanvasPosition.x, barStartingCanvasPosition.y);
                                        ctx.strokeStyle = victimDead ?
                                            "black" :
                                            "green";
                                        greenLineLength = 2 * edgeDistance * greenBarPercentage;
                                        ctx.lineTo(barStartingCanvasPosition.x + greenLineLength, barEndingCanvasPosition.y);
                                        ctx.stroke();
                                        ctx.closePath();
                                        _a.label = 2;
                                    case 2:
                                        ctx.restore();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        virtualCoordsMap = new Map();
                        _loop_5 = function (i) {
                            var action, attackerIndex, victimIndex, victim_beforeCoords, attacker_beforeCoords;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
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
                                        // printAction(action);
                                        // log("   Dealing with Action...")
                                        return [4 /*yield*/, (0, Utility_1.dealWithAction)(action, function (aA) { return __awaiter(_this, void 0, void 0, function () {
                                                var weapon, _a, epicenterCoord, affecteds, i_2, af, singleTarget, _b, _c, coord;
                                                var e_3, _d;
                                                return __generator(this, function (_e) {
                                                    switch (_e.label) {
                                                        case 0:
                                                            weapon = aA.weapon;
                                                            _a = weapon.targetting.AOE;
                                                            switch (_a) {
                                                                case "single": return [3 /*break*/, 1];
                                                                case "touch": return [3 /*break*/, 1];
                                                                case "circle": return [3 /*break*/, 3];
                                                                case "selfCircle": return [3 /*break*/, 3];
                                                                case "line": return [3 /*break*/, 10];
                                                            }
                                                            return [3 /*break*/, 11];
                                                        case 1: return [4 /*yield*/, drawAttackAction(aA, attacker_beforeCoords, aA.affected, i)];
                                                        case 2:
                                                            _e.sent();
                                                            return [3 /*break*/, 11];
                                                        case 3:
                                                            epicenterCoord = weapon.targetting.AOE === "circle" ?
                                                                aA.coordinate :
                                                                victim_beforeCoords;
                                                            affecteds = this.findEntities_radius((0, Utility_1.getNewObject)(epicenterCoord, { index: victimIndex }), // assign victim
                                                            weapon.Range[2], weapon.targetting.AOE === "circle");
                                                            i_2 = 0;
                                                            _e.label = 4;
                                                        case 4:
                                                            if (!(i_2 < affecteds.length)) return [3 /*break*/, 7];
                                                            af = affecteds[i_2];
                                                            singleTarget = (0, Utility_1.getNewObject)(aA, { from: epicenterCoord, affected: af });
                                                            return [4 /*yield*/, drawAttackAction(singleTarget, epicenterCoord, af, i_2)];
                                                        case 5:
                                                            _e.sent();
                                                            _e.label = 6;
                                                        case 6:
                                                            i_2++;
                                                            return [3 /*break*/, 4];
                                                        case 7:
                                                            if (!(weapon.targetting.AOE === "circle")) return [3 /*break*/, 9];
                                                            // show AOE throw trajectory
                                                            return [4 /*yield*/, drawAttackAction(aA, attacker_beforeCoords, epicenterCoord, i)];
                                                        case 8:
                                                            // show AOE throw trajectory
                                                            _e.sent();
                                                            _e.label = 9;
                                                        case 9:
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
                                                            catch (e_3_1) { e_3 = { error: e_3_1 }; }
                                                            finally {
                                                                try {
                                                                    if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                                                                }
                                                                finally { if (e_3) throw e_3.error; }
                                                            }
                                                            return [3 /*break*/, 11];
                                                        case 10: throw new Error("Line-drawing not implemented");
                                                        case 11: return [2 /*return*/];
                                                    }
                                                });
                                            }); }, function (mA) {
                                                // draw move trail
                                                ctx.beginPath();
                                                ctx.lineWidth = 10;
                                                // get position before move
                                                var move = _this.getCanvasCoordsFromBattleCoord(victim_beforeCoords);
                                                ctx.moveTo(move.x, move.y);
                                                // moved after action
                                                victim_beforeCoords[mA.axis] += mA.magnitude * Math.pow(-1, Number(action.executed));
                                                // draw a line to the coord after move action
                                                var line = _this.getCanvasCoordsFromBattleCoord(victim_beforeCoords);
                                                ctx.lineTo(line.x, line.y);
                                                ctx.stroke();
                                                ctx.closePath();
                                                // draw circle
                                                ctx.beginPath();
                                                var coord = action.executed ?
                                                    move :
                                                    line;
                                                ctx.arc(coord.x, coord.y, _this.pixelsPerTile / 5, 0, Math.PI * 2);
                                                ctx.fill();
                                                // priority text
                                                drawPriorityText(i, coord, 90);
                                            })];
                                    case 1:
                                        // printAction(action);
                                        // log("   Dealing with Action...")
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < actions.length)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_5(i)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, canvas];
                }
            });
        });
    };
    Battle.prototype.getMoveActionArrowsCanvas = function (mActions, style) {
        if (style === void 0) { style = {
            r: 0,
            g: 0,
            b: 0,
            alpha: 1
        }; }
        var canvas = new canvas_1.Canvas(this.width * 50, this.height * 50);
        var ctx = canvas.getContext("2d");
        style = (0, Utility_1.normaliseRGBA)(style);
        ctx.fillStyle = (0, Utility_1.stringifyRGBA)(style);
        ctx.strokeStyle = (0, Utility_1.stringifyRGBA)(style);
        var virtualCoordsMap = new Map();
        for (var i = 0; i < mActions.length; i++) {
            var action = mActions[i];
            var victimIndex = action.affected.index;
            if (!virtualCoordsMap.has(victimIndex)) {
                virtualCoordsMap.set(victimIndex, { x: action.affected.x, y: action.affected.y });
            }
            var beforeActionsCoords = virtualCoordsMap.get(victimIndex);
            // draw move trail
            ctx.beginPath();
            ctx.lineWidth = 10;
            // get position before move
            var move = this.getCanvasCoordsFromBattleCoord(beforeActionsCoords);
            ctx.moveTo(move.x, move.y);
            // moved after action
            beforeActionsCoords[action.axis] += action.magnitude * Math.pow(-1, Number(action.executed));
            // draw a line to the coord after move action
            var line = this.getCanvasCoordsFromBattleCoord(beforeActionsCoords);
            ctx.lineTo(line.x, line.y);
            ctx.stroke();
            ctx.closePath();
            // draw circle
            ctx.beginPath();
            var coord = action.executed ?
                move :
                line;
            ctx.arc(coord.x, coord.y, this.pixelsPerTile / 5, 0, Math.PI * 2);
            ctx.fill();
            // priority text
            ctx.font = "30px Arial";
            ctx.fillText("" + i, coord.x, coord.y);
            // log("   Done with Action.")
        }
        return canvas;
    };
    Battle.prototype.getActionArrowsBuffer = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getActionArrowsCanvas(actions)];
                    case 1: return [2 /*return*/, (_a.sent()).toBuffer()];
                }
            });
        });
    };
    Battle.prototype.getFullPlayerEmbedMessageOptions = function (stat, actions) {
        return __awaiter(this, void 0, void 0, function () {
            var mapCanvas, map, frameImage, characterBaseImage, _a, canvas, ctx, embed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCurrentMapWithArrowsCanvas(stat, actions)];
                    case 1:
                        mapCanvas = _b.sent();
                        map = mapCanvas.toBuffer();
                        return [4 /*yield*/, (0, Database_1.getFileImage)('images/frame.png')];
                    case 2:
                        frameImage = _b.sent();
                        return [4 /*yield*/, (0, Database_1.getFileImage)(stat.base.portraitURL)];
                    case 3:
                        characterBaseImage = _b.sent();
                        _a = (0, Utility_1.startDrawing)(frameImage.width * 3, frameImage.height * 3), canvas = _a.canvas, ctx = _a.ctx;
                        ctx.drawImage(characterBaseImage, 20, 20, characterBaseImage.width * 3, characterBaseImage.height * 3);
                        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
                        ctx.textAlign = "center";
                        ctx.font = '90px serif';
                        ctx.fillStyle = "rgba(255, 255, 255, 1)";
                        ctx.fillText(stat.base.class, canvas.width / 2, canvas.height * 0.95);
                        ctx.strokeText(stat.base.class, canvas.width / 2, canvas.height * 0.95);
                        return [4 /*yield*/, this.getFullPlayerEmbed(stat)];
                    case 4:
                        embed = _b.sent();
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
            return __generator(this, function (_a) {
                HP = (stat.HP / (0, Utility_1.getAHP)(stat)) * 50;
                HealthBar = "" + '`' + (0, Utility_1.addHPBar)(50, HP) + '`';
                ReadinessBar = "" + '`' + (0, Utility_1.addHPBar)(50, stat.readiness) + '`';
                explorerEmbed = new discord_js_1.MessageEmbed({
                    title: HealthBar,
                    description: "*Readiness* (" + Math.round(stat.readiness) + "/50)\n" + ReadinessBar,
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
    Battle.prototype.findEntity_byArgs = function (args, stat, weapon) {
        var allStats = this.allStats();
        var ignore = ["block"];
        var targetNotInIgnore = function (c) { return !ignore.includes(c.team); };
        if (weapon && weapon.targetting.target === typedef_1.WeaponTarget.enemy)
            ignore.push("player");
        if (weapon && weapon.targetting.target === typedef_1.WeaponTarget.ally)
            ignore.push("enemy");
        // 0. self target
        if (weapon && (weapon.targetting.AOE === "selfCircle" || weapon.targetting.AOE === "self")) {
            return allStats.find(function (s) { return s.index === stat.index; }) || null;
        }
        // 1. attack through the name
        var targetName = args[0];
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
        var direction = args[0];
        var axisDirection = translateDir[direction];
        var directionTarget = undefined;
        if (axisDirection !== undefined) {
            var axis = axisDirection.axis;
            var dir = axisDirection.dir;
            directionTarget = this.findEntity_closestInAxis(stat, axis, 12 * dir, ignore);
        }
        // 3. attack through coordinates
        var x = parseInt(args[0]);
        var y = parseInt(args[1]);
        var coordTarget = (x + y) ? (allStats.find(function (c) { return c.x === x && c.y === y && targetNotInIgnore(c); })) : null;
        // 4. attack closest
        var closestTarget = this.findEntity_closest(stat, ignore);
        return directionTarget || coordTarget || nameTarget || closestTarget;
    };
    Battle.prototype.findEntity_closestInAxis = function (attacker, axis, magnitude, ignore) {
        if (ignore === void 0) { ignore = []; }
        var obstacles = this.findEntities_allInAxis(attacker, axis, magnitude, ignore);
        if (obstacles[0]) {
            var result = obstacles.reduce(function (closest, ob) {
                var newMag = (0, Utility_1.getDistance)(attacker, ob);
                return newMag < (0, Utility_1.getDistance)(attacker, closest) ? ob : closest;
            }, obstacles[0]);
            return result;
        }
        else {
            return null;
        }
    };
    Battle.prototype.findEntity_closest = function (attacker, ignore) {
        if (ignore === void 0) { ignore = ["block"]; }
        var allStats = this.allStats();
        var closestDistance = 100;
        var closestR = allStats.reduce(function (closest, s) {
            if (closest !== null && closest.index === s.index)
                return s;
            var newDistance = (0, Utility_1.getDistance)(s, attacker);
            // fail cases
            var selfTargettingIgnored = s.index === attacker.index;
            var ignored = ignore.includes(s.team);
            var targetIsDead = s.HP <= 0;
            if (selfTargettingIgnored || ignored || targetIsDead) {
                return closest;
            }
            return closestDistance > newDistance ? s : closest;
        }, null);
        return closestR;
    };
    Battle.prototype.findEntities_allInAxis = function (attacker, axis, magnitude, ignore) {
        if (ignore === void 0) { ignore = []; }
        var allStats = this.allStats();
        if (magnitude === 0)
            return [];
        var cAxis = (0, Utility_1.counterAxis)(axis);
        var result = allStats.filter(function (s) {
            if (ignore.includes(s.team))
                return false;
            var checkNeg = s[axis] >= attacker[axis] + magnitude && s[axis] < attacker[axis];
            var checkPos = s[axis] <= attacker[axis] + magnitude && s[axis] > attacker[axis];
            // check negative if magnitude is negative. else, check positive axis
            var conditionOne = (Math.sign(magnitude) == -1) ? checkNeg : checkPos;
            return (s[cAxis] === attacker[cAxis] && (0, Utility_1.getDistance)(attacker, s) !== 0 && conditionOne);
        });
        return result;
    };
    Battle.prototype.findEntities_radius = function (_stat, radius, includeSelf, ignore) {
        // console.log(_stat, radius, includeSelf, ignore); 
        if (includeSelf === void 0) { includeSelf = false; }
        if (ignore === void 0) { ignore = ["block"]; }
        var targetNotInIgnore = function (c) { return !ignore.includes(c.team); };
        var stat = _stat;
        return this.allStats().filter(function (s) {
            return (s.index !== stat.index || (typeof stat.index === 'number' && includeSelf)) &&
                targetNotInIgnore(s) &&
                Math.sqrt(Math.pow((s.x - stat.x), 2) + Math.pow((s.y - stat.y), 2)) <= radius;
        });
    };
    Battle.prototype.findEntities_inLine = function (dot1, dot2) {
        var dx = dot2.x - dot1.x;
        var dy = dot2.y - dot1.y;
        var coordDiff = (0, Utility_1.getCompass)(dot1, dot2);
        var slope = dy / dx;
        return this.allStats().filter(function (s) {
            var x = s.x - dot1.x;
            var coordDiff_this = (0, Utility_1.getCompass)(dot1, s);
            var lineLength = (0, Utility_1.getPyTheorem)(dx, dy);
            var isWithinDistance = lineLength >= (0, Utility_1.getDistance)(dot1, s);
            var withinSlopeA = (s.y === (dot1.y + Math.floor(slope * x))) || (s.y === (dot1.y + Math.ceil(slope * x)));
            var isVertSlope = (Math.abs(slope) === Infinity) || (s.x === dot1.x);
            return coordDiff.x === coordDiff_this.x && coordDiff.y === coordDiff_this.y && isWithinDistance && (withinSlopeA || isVertSlope);
        });
    };
    Battle.prototype.validateTarget = function (attackerStat, weapon, targetStat) {
        var eM = {
            reason: "",
            value: null,
        };
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
        (0, Utility_1.log)("\tname: " + weapon.Name, "\tdamage: " + weapon.Damage, "\trange: " + weapon.Range, "\tattacker: " + attackerStat.base.class + " (" + attackerStat.index + ")", "\ttarget: " + targetStat.base.class + " (" + targetStat.index + ")");
        // location
        // if (targetStat.base.class === "location") {
        //     eM.reason = "You are targetting an empty location.";
        //     eM.advice = "Continue casting?";
        //     eM.tragic = "Swung at the air.";
        //     eM.harsh = false;
        //     return eM;
        // }
        // readiness
        if (attackerStat.readiness < 0) {
            eM.reason = "Not enough readiness.";
            eM.value = attackerStat.readiness;
            return eM;
        }
        // weapon uses
        if (weapon.UPT < (0, Utility_1.getWeaponUses)(weapon, attackerStat)) {
            eM.reason = "You can only use this ability " + weapon.UPT + " time(s) per turn.";
            eM.value = (0, Utility_1.getWeaponUses)(weapon, attackerStat);
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
        if (weapon.targetting.AOE !== "selfCircle" && weapon.targetting.AOE !== "self") {
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
    Battle.prototype.validateMovement = function (moverStat, moveAction) {
        var movingError = null;
        var coord = {
            x: moverStat.x + Number((moveAction === null || moveAction === void 0 ? void 0 : moveAction.axis) === 'x') * Number(moveAction === null || moveAction === void 0 ? void 0 : moveAction.magnitude),
            y: moverStat.y + Number((moveAction === null || moveAction === void 0 ? void 0 : moveAction.axis) === 'y') * Number(moveAction === null || moveAction === void 0 ? void 0 : moveAction.magnitude)
        };
        if (moveAction === null) {
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
        else if (moverStat.base.maxMove < moveAction.magnitude) {
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
        var e_4, _a;
        if (allStats === void 0) { allStats = this.allStats(true); }
        var deathCount = 0;
        try {
            for (var _b = __values(allStats.filter(function (p) { return p.HP <= 0; })), _c = _b.next(); !_c.done; _c = _b.next()) {
                var deadPerson = _c.value;
                deathCount++;
                this.handleDeath(deadPerson);
                if (deadPerson.team === "player")
                    this.playerCount--;
                else if (deadPerson.team === "enemy")
                    this.enemyCount--;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
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
    Battle.MOVE_READINESS = 10;
    return Battle;
}());
exports.Battle = Battle;
