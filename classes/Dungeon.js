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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dungeon = void 0;
var discord_js_1 = require("discord.js");
var __1 = require("..");
var typedef_1 = require("../typedef");
var Battle_1 = require("./Battle");
var Room_1 = require("./Room");
var Utility_1 = require("./Utility");
var areasData_json_1 = __importDefault(require("../data/areasData.json"));
var Database_1 = require("./Database");
var Dungeon = /** @class */ (function () {
    function Dungeon(_data, _message, _user, _userData) {
        this.rooms = [];
        this.CS = {};
        this.mapDoubleArray = [];
        this.data = _data;
        this.leaderUser = _user || null;
        this.leaderUserData = _userData || null;
        this.callMessage = _message || null;
        this.leaderCoordinate = (0, Utility_1.getNewObject)(_data.start);
    }
    Dungeon.Start = function (_dungeonData, _message) {
        return __awaiter(this, void 0, void 0, function () {
            var dungeon;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dungeon = Dungeon.Generate(_dungeonData);
                        return [4 /*yield*/, dungeon.initialiseUsers(_message)];
                    case 1:
                        _a.sent();
                        dungeon.readAction();
                        return [2 /*return*/];
                }
            });
        });
    };
    Dungeon.Generate = function (_dungeonData) {
        var dungeon = new Dungeon(_dungeonData);
        var startingCoord = _dungeonData.start;
        var oppositeDirection = function (_nD) { return (_nD + 2) % 4; };
        var coordEmpty = function (_c) { return !dungeon.CS[_c.x] || !dungeon.CS[_c.x][_c.y]; };
        var initiateCoord = function (_c) {
            if (coordEmpty(_c)) {
                if (!dungeon.CS[_c.x]) {
                    dungeon.CS[_c.x] = {};
                }
                var roomDir = [null, null, null, null];
                dungeon.CS[_c.x][_c.y] = new Room_1.Room(roomDir, dungeon, _c);
            }
        };
        var branchOut = function (_c, _direction, _length) {
            // log(`Branching out at ${_direction} with length ${_length}`);
            // initiate given coordinate just in case
            initiateCoord(_c);
            // get starting room
            var startingRoom = dungeon.getRoom(_c);
            dungeon.rooms.push(startingRoom);
            // starting extending the path
            var branchOutCoord = null;
            var previousRoom = startingRoom;
            var direction = (0, Utility_1.numericDirectionToDirection)(_direction);
            var magAxis = (0, Utility_1.directionToMagnitudeAxis)(direction);
            var coord = {
                x: _c.x,
                y: _c.y,
            };
            for (var i = 0; i < _length; i++) {
                coord[magAxis.axis] += magAxis.magnitude;
                var newRoom = void 0;
                if (coordEmpty(coord)) {
                    // log("\tMaking room @ " + JSON.stringify(coord));
                    // initiate room
                    initiateCoord(coord);
                    // connect to previous room
                    var newRoomDir = Array.from(Dungeon.BLOCKEDOFF_ROOMDIR);
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;
                    // create room
                    newRoom = new Room_1.Room(newRoomDir, dungeon, (0, Utility_1.getNewObject)(coord, {}));
                    dungeon.CS[coord.x][coord.y] = newRoom;
                    dungeon.rooms.push(newRoom);
                }
                else {
                    // log("\tExisting room @ " + JSON.stringify(coord));
                    newRoom = dungeon.getRoom(coord);
                    // connect to previous room
                    var newRoomDir = Array.from(Dungeon.BLOCKEDOFF_ROOMDIR);
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;
                    newRoom.directions = newRoomDir;
                }
                // connecting previous room to new room
                previousRoom.directions[_direction] = newRoom;
                // chance for battle
                // if (battleRoomsSpawned < battleRoomsCount) {
                //     battleEncounterChanceAccumulator++;
                //     const encounterChance = battleEncounterChanceAccumulator / (roomsPerBattle * 8);
                //     const encounterRoll = random(Number.EPSILON, 1.0);
                //     if (encounterRoll < encounterChance) {
                //         newRoom.isBattleRoom = true;
                //         battleEncounterChanceAccumulator = 0;
                //         battleRoomsSpawned++;
                //     }
                // }
                // chance to branch out again
                var roll = (0, Utility_1.random)(Number.EPSILON, 1.0);
                if (roll < Dungeon.BRANCHOUT_CHANCE) {
                    branchOutCoord = coord;
                }
                previousRoom = newRoom;
            }
            return branchOutCoord;
        };
        var getAvailableDirections = function (_c, _length) {
            var availableDirections = [];
            if (_c.x - 1 >= 0 && _c.x - _length >= 0 && coordEmpty((0, Utility_1.getNewObject)(_c, { x: _c.x - 1 }))) {
                availableDirections.push(typedef_1.NumericDirection.left);
            }
            if (_c.y - 1 >= 0 && _c.y - _length >= 0 && coordEmpty((0, Utility_1.getNewObject)(_c, { y: _c.y - 1 }))) {
                availableDirections.push(typedef_1.NumericDirection.down);
            }
            if (_c.x + 1 < _dungeonData.width && _c.x + _length < _dungeonData.width && coordEmpty((0, Utility_1.getNewObject)(_c, { x: _c.x + 1 }))) {
                availableDirections.push(typedef_1.NumericDirection.right);
            }
            if (_c.y + 1 < _dungeonData.height && _c.y + _length < _dungeonData.height && coordEmpty((0, Utility_1.getNewObject)(_c, { y: _c.y + 1 }))) {
                availableDirections.push(typedef_1.NumericDirection.up);
            }
            return availableDirections;
        };
        var takeRoot = function (_c, _length) {
            // log(`Taking root @ ${JSON.stringify(_c)}`);
            var availableDirections = getAvailableDirections(_c, _length);
            // debug("Available", availableDirections);
            var randomDirection = (0, Utility_1.getRandomInArray)(availableDirections);
            if (randomDirection !== undefined) {
                // debug("\tChosen random direction", randomDirection);
                return branchOut(_c, randomDirection, _length);
            }
            // log("\tFailed to find a direction");
        };
        // generate the path lengths
        var roomCount = (0, Utility_1.random)(_dungeonData.minRoom, _dungeonData.maxRoom);
        var pathLengths = [];
        for (var i = 0; i < roomCount; i = i) {
            var pathLength = (0, Utility_1.random)(_dungeonData.minLength, _dungeonData.maxLength);
            i += pathLength;
            if (i > roomCount) {
                pathLength -= (i - roomCount);
            }
            pathLengths.push(pathLength);
        }
        // branch out paths
        var battleRoomsCount = (0, Utility_1.random)(_dungeonData.minBattle, _dungeonData.maxBattle);
        var battleRoomsSpawned = 0;
        var roomsPerBattle = roomCount / battleRoomsCount;
        var battleEncounterChanceAccumulator = 0;
        var setRootPoint = startingCoord;
        var _loop_1 = function (i) {
            var length_1 = pathLengths[i];
            var takeRootResult = null;
            // takeRootResult
            // == null => branchOut failed to proc
            // == Coordinate => branchOut returned a Coord
            // == undefined => no available space to takeRoot
            takeRootResult = takeRoot(setRootPoint, length_1);
            if (takeRootResult === undefined) {
                var availableRooms = dungeon.rooms.filter(function (_r) { return (_r.directions.includes(null) &&
                    getAvailableDirections(_r.coordinate, length_1).length > 0); });
                if (availableRooms.length > 0) {
                    takeRoot((0, Utility_1.getRandomInArray)(availableRooms).coordinate, length_1);
                }
                else {
                    (0, Utility_1.log)("Failure to include all lengths @ " + i + ".");
                    return "break";
                }
            }
            else if (takeRootResult) {
                setRootPoint = takeRootResult;
            }
        };
        for (var i = 0; i < pathLengths.length; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
        // spawn remaining battle rooms
        // if (battleRoomsSpawned < battleRoomsCount) {
        //     const difference = battleRoomsCount - battleRoomsSpawned;
        //     const deadEndRooms: Room[] = [];
        //     const roomQueue: Room[] = [dungeon.getRoom(_dungeonData.start)!];
        //     const exploredRooms: Room[] = [];
        //     // branch out and seek the longest dead end
        //     let currentRoom = roomQueue.shift();
        //     while (currentRoom) {
        //         for (let i = 0; i < currentRoom.directions.length; i++) {
        //             const r = currentRoom.directions[i];
        //             if (r && !exploredRooms.includes(r)) {
        //                 roomQueue.push(r);
        //                 exploredRooms.push(r);
        //             }
        //         }
        //         if (
        //             !findEqualCoordinate(currentRoom.coordinate, startingCoord)&&
        //             currentRoom.directions.filter(_d => _d === null).length === 3
        //         ) {
        //             deadEndRooms.unshift(currentRoom);
        //         }
        //         currentRoom = roomQueue.shift();
        //     }
        //     // deadEndRooms is sorted longest to shortest. Spawn treasures and boss rooms in the longest ones
        //     for (let i = 0; i < difference; i++) {
        //         const deadEnd = deadEndRooms[i];
        //         if (deadEnd) {
        //             deadEnd.isBattleRoom = true;
        //             // TODO: spawn treasure
        //         }
        //     }
        // }
        return dungeon;
    };
    Dungeon.prototype.validateMovement = function (_direction) {
        var direction = Number.isInteger(_direction) ?
            (0, Utility_1.numericDirectionToDirection)(_direction) :
            _direction;
        var numericDirection = (0, Utility_1.directionToNumericDirection)(direction);
        var valid = false;
        var currentRoom = this.getRoom(this.leaderCoordinate);
        if (currentRoom) {
            valid = currentRoom.directions[numericDirection] !== null;
        }
        else {
            this.leaderCoordinate = (0, Utility_1.getNewObject)(this.data.start);
            valid = this.validateMovement(_direction);
        }
        return valid;
    };
    Dungeon.prototype.getImageEmbedMessageOptions = function () {
        var mapEmbed = new discord_js_1.MessageEmbed().setDescription("" + this.getMapString());
        var currentRoom;
        if ((currentRoom = this.getRoom(this.leaderCoordinate)) && (currentRoom === null || currentRoom === void 0 ? void 0 : currentRoom.isBattleRoom)) {
            mapEmbed.setTitle("Danger! Enemy Spotted!");
        }
        var messageOption = {
            embeds: [mapEmbed],
        };
        return messageOption;
    };
    Dungeon.prototype.readAction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var channel, mapMessage, buttonOptions, listenToQueue, handleQueue;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channel = this.callMessage.channel;
                        return [4 /*yield*/, channel.send(this.getImageEmbedMessageOptions())];
                    case 1:
                        mapMessage = _a.sent();
                        buttonOptions = [
                            {
                                label: "⬆️",
                                style: "PRIMARY",
                                customId: "up"
                            },
                            {
                                label: "⬇️",
                                style: "SECONDARY",
                                customId: "down"
                            },
                            {
                                label: "➡️",
                                style: "PRIMARY",
                                customId: "right"
                            },
                            {
                                label: "⬅️",
                                style: "SECONDARY",
                                customId: "left"
                            },
                        ];
                        listenToQueue = function () {
                            // log("\tListening to queue...");
                            var messagePayload = {
                                components: [(0, Utility_1.getButtonsActionRow)(buttonOptions)],
                            };
                            mapMessage.edit(messagePayload);
                            (0, Utility_1.setUpInteractionCollect)(mapMessage, function (itr) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(itr.isButton() && itr.user.id === this.leaderUser.id)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, handleQueue(itr)];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, itr.update(this.getImageEmbedMessageOptions())];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }, 1);
                        };
                        handleQueue = function (_itr) { return __awaiter(_this, void 0, void 0, function () {
                            var direction, valid, magAxis, nextRoom;
                            var _a;
                            return __generator(this, function (_d) {
                                direction = _itr.customId;
                                valid = false;
                                switch (direction) {
                                    case "up":
                                    case "down":
                                    case "right":
                                    case "left":
                                        magAxis = (0, Utility_1.directionToMagnitudeAxis)(direction);
                                        // validate + act on (if valid) movement on virtual map
                                        valid = this.validateMovement(direction);
                                        // movement is permitted
                                        if (valid) {
                                            this.leaderCoordinate[magAxis.axis] += magAxis.magnitude;
                                        }
                                        break;
                                    default:
                                        valid = false;
                                        break;
                                }
                                if (valid) {
                                    nextRoom = this.getRoom(this.leaderCoordinate);
                                    nextRoom.isDiscovered = true;
                                    if (nextRoom.isBattleRoom) {
                                        (_a = nextRoom.StartBattle()) === null || _a === void 0 ? void 0 : _a.then(function (_sieg) {
                                            if (_sieg) {
                                                listenToQueue();
                                            }
                                        });
                                    }
                                    else {
                                        listenToQueue();
                                    }
                                }
                                else {
                                    listenToQueue();
                                }
                                return [2 /*return*/];
                            });
                        }); };
                        listenToQueue();
                        return [2 /*return*/];
                }
            });
        });
    };
    Dungeon.prototype.getRoom = function (_c) {
        if (this.CS[_c.x]) {
            return this.CS[_c.x][_c.y];
        }
    };
    Dungeon.prototype.getMapDoubleArray = function (_c) {
        if (this.mapDoubleArray[this.data.height - 1 - _c.y] === undefined) {
            this.mapDoubleArray[this.data.height - 1 - _c.y] = [];
        }
        return this.mapDoubleArray[this.data.height - 1 - _c.y][_c.x];
    };
    Dungeon.prototype.setMapDoubleArray = function (_c, _string) {
        if (this.mapDoubleArray[this.data.height - 1 - _c.y] === undefined) {
            this.mapDoubleArray[this.data.height - 1 - _c.y] = [];
        }
        this.mapDoubleArray[this.data.height - 1 - _c.y][_c.x] = _string;
    };
    Dungeon.prototype.getMapString = function () {
        var _a;
        var width = this.data.width;
        var height = this.data.height;
        var widthP1 = width + 1;
        // debug("mapstring", map)
        // draw initial
        if (this.mapDoubleArray.length === 0) {
            var levelArray = [];
            for (var i = 0; i < (width + 1) * height; i++) {
                var level = Math.floor(i / widthP1);
                // if new line
                if (i === (widthP1 * level) + width) {
                    this.mapDoubleArray.push(levelArray);
                    levelArray = [];
                }
                else {
                    levelArray.push(typedef_1.EMOJI_BLACKB);
                }
            }
        }
        // debug("init", map);
        // get rooms accessible
        var leaderRoom = this.getRoom(this.leaderCoordinate);
        var accessibleRooms = this.rooms.filter(function (_r) { return _r.isDiscovered; });
        // update all the accesible rooms
        for (var i = 0; i < accessibleRooms.length; i++) {
            var room = accessibleRooms[i];
            var icon = '';
            // leader's location
            if ((0, Utility_1.findEqualCoordinate)(this.leaderCoordinate, room.coordinate)) {
                icon = '🌠';
            }
            // starting mark
            else if ((0, Utility_1.findEqualCoordinate)(this.data.start, room.coordinate)) {
                icon = '❎';
            }
            // empty room
            else {
                icon = this.getMapDoubleArray(room.coordinate) || typedef_1.EMOJI_WHITEB;
            }
            this.setMapDoubleArray(room.coordinate, icon);
        }
        // draw brown walls
        for (var w = 0; w < leaderRoom.directions.length; w++) {
            var leaderRoomCoordinate = (0, Utility_1.getNewObject)(leaderRoom.coordinate);
            var accessible = leaderRoom.directions[w];
            var magAxis = (0, Utility_1.directionToMagnitudeAxis)((0, Utility_1.numericDirectionToDirection)(w));
            leaderRoomCoordinate[magAxis.axis] += magAxis.magnitude;
            var withinWorld = leaderRoomCoordinate.x >= 0 && leaderRoomCoordinate.y >= 0 && leaderRoomCoordinate.x < width && leaderRoomCoordinate.y < height;
            if (withinWorld) {
                var icon = accessible && ((_a = leaderRoom.directions[w]) === null || _a === void 0 ? void 0 : _a.isDiscovered) === false ?
                    (0, Utility_1.directionToEmoji)((0, Utility_1.numericDirectionToDirection)(w)) :
                    accessible ?
                        typedef_1.EMOJI_WHITEB :
                        typedef_1.EMOJI_BROWNB;
                this.setMapDoubleArray(leaderRoomCoordinate, icon);
            }
        }
        var returnString = [];
        for (var i = 0; i < this.mapDoubleArray.length; i++) {
            var a = this.mapDoubleArray[i];
            var string = a.join("");
            returnString.push(string);
        }
        return returnString.join("\n");
    };
    Dungeon.prototype.print = function (_channel) {
        var canvas = this.getMapString();
        _channel.send({
            embeds: [
                new discord_js_1.MessageEmbed().setDescription(canvas)
            ]
        });
    };
    Dungeon.prototype.initialiseUsers = function (_message) {
        return __awaiter(this, void 0, void 0, function () {
            var user, userData, _loop_2, this_1, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        user = _message.author;
                        return [4 /*yield*/, (0, Database_1.getUserData)(user.id)];
                    case 1:
                        userData = _a.sent();
                        this.leaderUser = user;
                        this.leaderUserData = userData;
                        this.callMessage = _message;
                        _loop_2 = function (i) {
                            var room, encounterName, mapdata;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        room = this_1.rooms[i];
                                        if (!room.isBattleRoom) return [3 /*break*/, 2];
                                        encounterName = (0, Utility_1.getRandomInArray)(this_1.data.encounterMaps);
                                        if (!(encounterName && areasData_json_1.default[encounterName])) return [3 /*break*/, 2];
                                        mapdata = (0, Utility_1.getNewObject)(areasData_json_1.default[encounterName]);
                                        return [4 /*yield*/, Battle_1.Battle.Generate(mapdata, user, _message, userData.party, __1.BotClient, false)
                                                .then(function (_b) {
                                                room.battle = _b;
                                            })];
                                    case 1:
                                        _d.sent();
                                        _d.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < this.rooms.length)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_2(i)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Dungeon.BRANCHOUT_CHANCE = 0.1;
    Dungeon.BLOCKEDOFF_ROOMDIR = [null, null, null, null];
    return Dungeon;
}());
exports.Dungeon = Dungeon;
