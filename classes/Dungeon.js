"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dungeon = void 0;
var typedef_1 = require("../typedef");
var Room_1 = require("./Room");
var Utility_1 = require("./Utility");
var Dungeon = /** @class */ (function () {
    function Dungeon(_data) {
        this.rooms = [];
        this.data = _data;
    }
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
                b: 0,
                g: 0,
                alpha: 1
            });
            ctx.lineWidth = 3;
            if (room.directions[typedef_1.NumericDirection.up]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x, canvasCoordShifted.y - pixelsPerTile);
            }
            if (room.directions[typedef_1.NumericDirection.down]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x, canvasCoordShifted.y + pixelsPerTile);
            }
            if (room.directions[typedef_1.NumericDirection.left]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x - pixelsPerTile, canvasCoordShifted.y);
            }
            if (room.directions[typedef_1.NumericDirection.right]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x + pixelsPerTile, canvasCoordShifted.y);
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
    Dungeon.Start = function (_dungeonData) {
        var dungeon = new Dungeon(_dungeonData);
        var CS = {};
        var startingCoord = _dungeonData.start;
        var oppositeDirection = function (_nD) { return (_nD + 2) % 4; };
        var coordEmpty = function (_c) { return !CS[_c.x] || !CS[_c.x][_c.y]; };
        var initiateCoord = function (_c) {
            if (coordEmpty(_c)) {
                if (!CS[_c.x]) {
                    CS[_c.x] = {};
                }
                var roomDir = [null, null, null, null];
                CS[_c.x][_c.y] = new Room_1.Room(null, roomDir, dungeon, _c);
            }
        };
        var getRoom = function (_c) {
            if (CS[_c.x]) {
                return CS[_c.x][_c.y];
            }
        };
        var branchOut = function (_c, _direction, _length) {
            (0, Utility_1.log)("Branching out at " + _direction + " with length " + _length);
            // initiate given coordinate just in case
            initiateCoord(_c);
            // get starting room
            var startingRoom = getRoom(_c);
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
                    (0, Utility_1.log)("\tMaking room @ " + JSON.stringify(coord));
                    // connecting new room to previous room
                    initiateCoord(coord);
                    var newRoomDir = Array.from(Dungeon.BLOCKEDOFF_ROOMDIR);
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;
                    newRoom = new Room_1.Room(null, newRoomDir, dungeon, (0, Utility_1.getNewObject)(coord, {}));
                    CS[coord.x][coord.y] = newRoom;
                    // connecting previous room to new room
                    previousRoom.directions[_direction] = newRoom;
                    dungeon.rooms.push(newRoom);
                }
                else {
                    (0, Utility_1.log)("\tExisting room @ " + JSON.stringify(coord));
                    newRoom = getRoom(coord);
                }
                // chance to branch out again
                var roll = (0, Utility_1.random)(0.0, 1.0);
                if (roll < Dungeon.BRANCHOUT_CHANCE) {
                    (0, Utility_1.log)("\tBranch out again at " + JSON.stringify(coord));
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
            (0, Utility_1.log)("Taking root @ " + JSON.stringify(_c));
            var availableDirections = getAvailableDirections(_c, _length);
            (0, Utility_1.debug)("Available", availableDirections);
            var randomDirection = (0, Utility_1.getRandomInArray)(availableDirections);
            if (randomDirection !== undefined) {
                (0, Utility_1.debug)("\tChosen random direction", randomDirection);
                return branchOut(_c, randomDirection, _length);
            }
            (0, Utility_1.log)("\tFailed to find a direction");
        };
        var roomCount = (0, Utility_1.random)(_dungeonData.minRoom, _dungeonData.maxRoom);
        (0, Utility_1.debug)("roomCount", roomCount);
        var pathLengths = [];
        for (var i = 0; i < roomCount; i = i) {
            var pathLength = (0, Utility_1.random)(_dungeonData.minLength, _dungeonData.maxLength);
            i += pathLength;
            if (i > roomCount) {
                pathLength -= (i - roomCount);
            }
            pathLengths.push(pathLength);
        }
        (0, Utility_1.debug)("pathLength", pathLengths);
        var setRootPoint = startingCoord;
        for (var i = 0; i < pathLengths.length; i++) {
            var length_1 = pathLengths[i];
            var takeRootResult = null;
            // takeRootResult
            // == null => branchOut failed to proc
            // == Coordinate => branchOut returned a Coord
            // == undefined => no available space to takeRoot
            takeRootResult = takeRoot(setRootPoint, length_1);
            if (takeRootResult === undefined) {
                var availableRooms = dungeon.rooms.filter(function (_r) { return _r.directions.includes(null); });
                if (availableRooms.length > 0) {
                    setRootPoint = (0, Utility_1.getRandomInArray)(availableRooms).coordinate;
                }
                else {
                    break;
                }
            }
            else if (takeRootResult) {
                setRootPoint = takeRootResult;
            }
        }
        return dungeon;
    };
    Dungeon.BRANCHOUT_CHANCE = 0.1;
    Dungeon.BLOCKEDOFF_ROOMDIR = [null, null, null, null];
    return Dungeon;
}());
exports.Dungeon = Dungeon;
