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
exports.Dungeon = void 0;
var typedef_1 = require("../typedef");
var Room_1 = require("./Room");
var Utility_1 = require("./Utility");
var Dungeon = /** @class */ (function () {
    function Dungeon(_data, _user, _userData) {
        this.rooms = [];
        this.CS = {};
        this.data = _data;
        this.leaderUser = _user || null;
        this.leaderUserData = _userData || null;
        this.leaderLocation = _data.start;
    }
    Dungeon.Start = function (_dungeonData, _author, _authorData) {
        var dungeon = Dungeon.Generate(_dungeonData);
        dungeon.initialiseUsers(_author, _authorData);
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
                if (battleRoomsSpawned < battleRoomsCount) {
                    battleEncounterChanceAccumulator++;
                    var encounterChance = battleEncounterChanceAccumulator / (roomsPerBattle * 8);
                    var encounterRoll = (0, Utility_1.random)(Number.EPSILON, 1.0);
                    if (encounterRoll < encounterChance) {
                        newRoom.isBattleRoom = true;
                        battleEncounterChanceAccumulator = 0;
                        battleRoomsSpawned++;
                    }
                }
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
        if (battleRoomsSpawned < battleRoomsCount) {
            var difference = battleRoomsCount - battleRoomsSpawned;
            var deadEndRooms = [];
            var roomQueue = [dungeon.getRoom(_dungeonData.start)];
            var exploredRooms = [];
            var currentRoom = roomQueue.shift();
            while (currentRoom) {
                for (var i = 0; i < currentRoom.directions.length; i++) {
                    var r = currentRoom.directions[i];
                    if (r && !exploredRooms.includes(r)) {
                        roomQueue.push(r);
                        exploredRooms.push(r);
                    }
                }
                if (currentRoom.directions.filter(function (_d) { return _d === null; }).length === 3) {
                    deadEndRooms.unshift(currentRoom);
                }
                currentRoom = roomQueue.shift();
            }
            for (var i = 0; i < difference; i++) {
                var deadEnd = deadEndRooms[i];
                if (deadEnd) {
                    deadEnd.isBattleRoom = true;
                }
            }
        }
        return dungeon;
    };
    Dungeon.prototype.getRoom = function (_c) {
        if (this.CS[_c.x]) {
            return this.CS[_c.x][_c.y];
        }
    };
    Dungeon.prototype.initialiseUsers = function (_user, _userData) {
        return __awaiter(this, void 0, void 0, function () {
            var i, room;
            return __generator(this, function (_a) {
                this.leaderUser = _user;
                this.leaderUserData = _userData;
                for (i = 0; i < this.rooms.length; i++) {
                    room = this.rooms[i];
                    if (room.isBattleRoom) {
                        // await Battle.Generate(mapdata, _user, message, _userData.party, BotClient, false)
                        //     .then(_b => {
                        //         room.battle = _b;
                        //     });
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    Dungeon.prototype.print = function (_channel) {
        var pixelsPerTile = 250 / this.data.width;
        var _a = (0, Utility_1.startDrawing)(250, 250), canvas = _a.canvas, ctx = _a.ctx;
        var grid = (0, Utility_1.returnGridCanvas)(this.data.height, this.data.width, pixelsPerTile);
        ctx.drawImage(grid, 0, 0, 250, 250);
        for (var i = 0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            var canvasCoord = {
                x: room.coordinate.x * pixelsPerTile,
                y: (this.data.height - room.coordinate.y - 1) * pixelsPerTile
            };
            ctx.fillStyle = (0, Utility_1.stringifyRGBA)({
                r: 255 * Number(room.isBattleRoom),
                b: 0,
                g: 255 * Number((0, Utility_1.findEqualCoordinate)(room.coordinate, this.data.start)),
                alpha: 1
            });
            ctx.fillRect(canvasCoord.x, canvasCoord.y, pixelsPerTile, pixelsPerTile);
        }
        for (var i = 0; i < this.rooms.length; i++) {
            var room = this.rooms[i];
            var canvasCoordShifted = {
                x: room.coordinate.x * pixelsPerTile + (pixelsPerTile / 2),
                y: (this.data.height - room.coordinate.y - 1) * pixelsPerTile + (pixelsPerTile / 2)
            };
            ctx.beginPath();
            ctx.strokeStyle = (0, Utility_1.stringifyRGBA)({
                r: 255,
                b: 255,
                g: 255,
                alpha: 1
            });
            ctx.lineWidth = 3;
            for (var i_1 = 0; i_1 < room.directions.length; i_1++) {
                var otherRoom = room.directions[i_1];
                if (otherRoom) {
                    var otherRoomCanvasCoord = (0, Utility_1.getCanvasCoordsFromBattleCoord)(otherRoom.coordinate, pixelsPerTile, this.data.height);
                    ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                    ctx.lineTo(otherRoomCanvasCoord.x, otherRoomCanvasCoord.y);
                }
            }
            ctx.stroke();
            ctx.closePath();
        }
        _channel.send({
            files: [
                canvas.toBuffer()
            ]
        });
    };
    Dungeon.BRANCHOUT_CHANCE = 0.1;
    Dungeon.BLOCKEDOFF_ROOMDIR = [null, null, null, null];
    return Dungeon;
}());
exports.Dungeon = Dungeon;
