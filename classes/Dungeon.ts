import { TextChannel } from "discord.js";
import { Coordinate, CoordStat, Direction, DungeonData, NumericDirection, RoomDirections } from "../typedef";
import { Battle } from "./Battle";
import { Room } from "./Room";
import { debug, directionToMagnitudeAxis, getCompass, getNewObject, getRandomInArray, log, numericDirectionToDirection, random, returnGridCanvas, startDrawing, stringifyRGBA } from "./Utility";

export class Dungeon {
    static readonly BRANCHOUT_CHANCE = 0.1;
    static readonly BLOCKEDOFF_ROOMDIR: RoomDirections = [null, null, null, null];
    rooms: Room[];
    data: DungeonData;

    constructor(_data: DungeonData) {
        this.rooms = [];
        this.data = _data;
    }

    print(_channel: TextChannel) {
        const pixelsPerTile = 250 / this.data.width;
        const { canvas, ctx } = startDrawing(250, 250);

        const grid = returnGridCanvas(this.data.height, this.data.width, pixelsPerTile);
        ctx.drawImage(grid, 0, 0, 250, 250);

        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            const canvasCoord = {
                x: room.coordinate.x * pixelsPerTile,
                y: (this.data.height - room.coordinate.y - 1) * pixelsPerTile
            };

            ctx.fillRect(canvasCoord.x, canvasCoord.y, pixelsPerTile, pixelsPerTile);
        }

        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];

            const canvasCoordShifted = {
                x: room.coordinate.x * pixelsPerTile + (pixelsPerTile / 2),
                y: (this.data.height - room.coordinate.y - 1) * pixelsPerTile + (pixelsPerTile / 2)
            };

            ctx.beginPath();
            ctx.strokeStyle = stringifyRGBA({
                r: 255,
                b: 0,
                g: 0,
                alpha: 1
            });
            ctx.lineWidth = 3;
            if (room.directions[NumericDirection.up]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x, canvasCoordShifted.y - pixelsPerTile);
            }
            if (room.directions[NumericDirection.down]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x, canvasCoordShifted.y + pixelsPerTile);
            }
            if (room.directions[NumericDirection.left]) {
                ctx.moveTo(canvasCoordShifted.x, canvasCoordShifted.y);
                ctx.lineTo(canvasCoordShifted.x - pixelsPerTile, canvasCoordShifted.y);
            }
            if (room.directions[NumericDirection.right]) {
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
    }

    static Start(_dungeonData: DungeonData) {
        const dungeon = new Dungeon(_dungeonData);
        const CS: CoordStat<Room> = {};
        const startingCoord: Coordinate = _dungeonData.start;
        const oppositeDirection = (_nD: NumericDirection) => (_nD + 2)%4;
        const coordEmpty = (_c: Coordinate) => !CS[_c.x] || !CS[_c.x][_c.y];
        const initiateCoord = (_c: Coordinate) => {
            if (coordEmpty(_c)) {
                if (!CS[_c.x]) {
                    CS[_c.x] = {};
                }
                const roomDir: RoomDirections = [null, null, null, null];
                CS[_c.x][_c.y] = new Room(null, roomDir, dungeon, _c);
            }
        }
        const getRoom = (_c: Coordinate) => {
            if (CS[_c.x]) {
                return CS[_c.x][_c.y];
            }
        }
        const branchOut = (_c: Coordinate, _direction: NumericDirection, _length: number): Coordinate | null => {
            log(`Branching out at ${_direction} with length ${_length}`);
            // initiate given coordinate just in case
            initiateCoord(_c);

            // get starting room
            const startingRoom: Room = getRoom(_c)!;
            dungeon.rooms.push(startingRoom);

            // starting extending the path
            let branchOutCoord: Coordinate | null = null;
            let previousRoom: Room = startingRoom;

            const direction: Direction = numericDirectionToDirection(_direction);
            const magAxis = directionToMagnitudeAxis(direction);
            const coord = {
                x: _c.x,
                y: _c.y,
            };
            for (let i = 0; i < _length; i++) {
                coord[magAxis.axis] += magAxis.magnitude;

                let newRoom: Room;
                if (coordEmpty(coord)) {
                    log("\tMaking room @ " + JSON.stringify(coord));

                    // connecting new room to previous room
                    initiateCoord(coord);
                    const newRoomDir = Array.from(Dungeon.BLOCKEDOFF_ROOMDIR) as RoomDirections;
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;
                    newRoom = new Room(null, newRoomDir, dungeon, getNewObject(coord, {}));
                    CS[coord.x][coord.y] = newRoom;

                    // connecting previous room to new room
                    previousRoom.directions[_direction] = newRoom;

                    dungeon.rooms.push(newRoom);
                }
                else {
                    log("\tExisting room @ " + JSON.stringify(coord));
                    newRoom = getRoom(coord)!;
                }

                // chance to branch out again
                const roll = random(0.0, 1.0);
                if (roll < Dungeon.BRANCHOUT_CHANCE) {
                    log(`\tBranch out again at ${JSON.stringify(coord)}`);
                    branchOutCoord = coord;
                }

                previousRoom = newRoom;
            }

            return branchOutCoord;
        };
        const getAvailableDirections = (_c: Coordinate, _length: number) => {
            const availableDirections: NumericDirection[] = [];
            if (_c.x - 1 >= 0 && _c.x - _length >= 0 && coordEmpty(getNewObject(_c, { x: _c.x - 1 }))) {
                availableDirections.push(NumericDirection.left);
            }
            if (_c.y - 1 >= 0 && _c.y - _length >= 0 && coordEmpty(getNewObject(_c, { y: _c.y - 1 }))) {
                availableDirections.push(NumericDirection.down);
            }
            if (_c.x + 1 < _dungeonData.width && _c.x + _length < _dungeonData.width && coordEmpty(getNewObject(_c, { x: _c.x + 1 }))) {
                availableDirections.push(NumericDirection.right);
            }
            if (_c.y + 1 < _dungeonData.height && _c.y + _length < _dungeonData.height && coordEmpty(getNewObject(_c, { y: _c.y + 1 }))) {
                availableDirections.push(NumericDirection.up);
            }
            return availableDirections;
        }
        const takeRoot = (_c: Coordinate, _length: number): Coordinate | null | undefined => {
            log(`Taking root @ ${JSON.stringify(_c)}`);
            const availableDirections = getAvailableDirections(_c, _length);
            debug("Available", availableDirections);

            const randomDirection: NumericDirection = getRandomInArray(availableDirections);
            if (randomDirection !== undefined) {
                debug("\tChosen random direction", randomDirection);
                return branchOut(_c, randomDirection, _length);
            }
            log("\tFailed to find a direction");
        }

        const roomCount = random(_dungeonData.minRoom, _dungeonData.maxRoom); debug("roomCount", roomCount);
        const pathLengths = [];
        for (let i = 0; i < roomCount; i = i) {
            let pathLength = random(_dungeonData.minLength, _dungeonData.maxLength);
            i += pathLength;

            if (i > roomCount) {
                pathLength -= (i - roomCount);
            }

            pathLengths.push(pathLength);
        }
        debug("pathLength", pathLengths);

        let setRootPoint: Coordinate = startingCoord;
        for (let i = 0; i < pathLengths.length; i++) {
            const length = pathLengths[i];
            let takeRootResult = null;

            // takeRootResult
                // == null => branchOut failed to proc
                // == Coordinate => branchOut returned a Coord
                // == undefined => no available space to takeRoot

            takeRootResult = takeRoot(setRootPoint, length);

            if (takeRootResult === undefined) {
                const availableRooms = dungeon.rooms.filter(_r => _r.directions.includes(null));
                if (availableRooms.length > 0) {
                    setRootPoint = getRandomInArray(availableRooms).coordinate;
                }
                else {
                    break;
                }
            }
            else if (takeRootResult as Coordinate) {
                setRootPoint = takeRootResult as Coordinate;
            }
        }

        return dungeon;
    }
}