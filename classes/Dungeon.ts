import { TextChannel, User } from "discord.js";
import { BotClient } from "..";
import { Coordinate, CoordStat, Direction, DungeonData, NumericDirection, RoomDirections, UserData } from "../typedef";
import { Battle } from "./Battle";
import { Room } from "./Room";
import { debug, directionToMagnitudeAxis, findEqualCoordinate, getCanvasCoordsFromBattleCoord, getNewObject, getRandomInArray, log, numericDirectionToDirection, random, returnGridCanvas, startDrawing, stringifyRGBA } from "./Utility";

export class Dungeon {
    static readonly BRANCHOUT_CHANCE = 0.1;
    static readonly BLOCKEDOFF_ROOMDIR: RoomDirections = [null, null, null, null];

    leaderLocation: Coordinate;
    leaderUser: User | null;
    leaderUserData: UserData | null;
    rooms: Room[] = [];
    data: DungeonData;
    CS: CoordStat<Room> = {};

    private constructor(_data: DungeonData, _user?: User, _userData?: UserData) {
        this.data = _data;
        this.leaderUser = _user || null;
        this.leaderUserData = _userData || null;

        this.leaderLocation = _data.start;
    }

    static Start(_dungeonData: DungeonData, _author: User, _authorData: UserData) {
        const dungeon = Dungeon.Generate(_dungeonData);
        dungeon.initialiseUsers(_author, _authorData);
    }

    static Generate(_dungeonData: DungeonData) {
        const dungeon = new Dungeon(_dungeonData);
        const startingCoord: Coordinate = _dungeonData.start;
        const oppositeDirection = (_nD: NumericDirection) => (_nD + 2) % 4;
        const coordEmpty = (_c: Coordinate) => !dungeon.CS[_c.x] || !dungeon.CS[_c.x][_c.y];
        const initiateCoord = (_c: Coordinate) => {
            if (coordEmpty(_c)) {
                if (!dungeon.CS[_c.x]) {
                    dungeon.CS[_c.x] = {};
                }
                const roomDir: RoomDirections = [null, null, null, null];
                dungeon.CS[_c.x][_c.y] = new Room(roomDir, dungeon, _c);
            }
        }
        const branchOut = (_c: Coordinate, _direction: NumericDirection, _length: number): Coordinate | null => {
            // log(`Branching out at ${_direction} with length ${_length}`);
            // initiate given coordinate just in case
            initiateCoord(_c);

            // get starting room
            const startingRoom: Room = dungeon.getRoom(_c)!;
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
                    // log("\tMaking room @ " + JSON.stringify(coord));

                    // initiate room
                    initiateCoord(coord);

                    // connect to previous room
                    const newRoomDir = Array.from(Dungeon.BLOCKEDOFF_ROOMDIR) as RoomDirections;
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;

                    // create room
                    newRoom = new Room(newRoomDir, dungeon, getNewObject(coord, {}));
                    dungeon.CS[coord.x][coord.y] = newRoom;
                    dungeon.rooms.push(newRoom);
                }
                else {
                    // log("\tExisting room @ " + JSON.stringify(coord));
                    newRoom = dungeon.getRoom(coord)!;

                    // connect to previous room
                    const newRoomDir = Array.from(Dungeon.BLOCKEDOFF_ROOMDIR) as RoomDirections;
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;
                    newRoom.directions = newRoomDir;
                }

                // connecting previous room to new room
                previousRoom.directions[_direction] = newRoom;

                // chance for battle
                if (battleRoomsSpawned < battleRoomsCount) {
                    battleEncounterChanceAccumulator++;
                    const encounterChance = battleEncounterChanceAccumulator / (roomsPerBattle * 8);
                    const encounterRoll = random(Number.EPSILON, 1.0);
                    if (encounterRoll < encounterChance) {
                        newRoom.isBattleRoom = true;
                        battleEncounterChanceAccumulator = 0;
                        battleRoomsSpawned++;
                    }
                }

                // chance to branch out again
                const roll = random(Number.EPSILON, 1.0);
                if (roll < Dungeon.BRANCHOUT_CHANCE) {
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
            // log(`Taking root @ ${JSON.stringify(_c)}`);
            const availableDirections = getAvailableDirections(_c, _length);
            // debug("Available", availableDirections);

            const randomDirection: NumericDirection = getRandomInArray(availableDirections);
            if (randomDirection !== undefined) {
                // debug("\tChosen random direction", randomDirection);
                return branchOut(_c, randomDirection, _length);
            }
            // log("\tFailed to find a direction");
        }

        // generate the path lengths
        const roomCount = random(_dungeonData.minRoom, _dungeonData.maxRoom);
        const pathLengths = [];
        for (let i = 0; i < roomCount; i = i) {
            let pathLength = random(_dungeonData.minLength, _dungeonData.maxLength);
            i += pathLength;

            if (i > roomCount) {
                pathLength -= (i - roomCount);
            }

            pathLengths.push(pathLength);
        }

        // branch out paths
        const battleRoomsCount = random(_dungeonData.minBattle, _dungeonData.maxBattle);
        let battleRoomsSpawned = 0;
        const roomsPerBattle = roomCount / battleRoomsCount;
        let battleEncounterChanceAccumulator = 0;

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
                const availableRooms = dungeon.rooms.filter(_r => (
                    _r.directions.includes(null) &&
                    getAvailableDirections(_r.coordinate, length).length > 0
                ));
                if (availableRooms.length > 0) {
                    takeRoot(getRandomInArray(availableRooms).coordinate, length);
                }
                else {
                    log(`Failure to include all lengths @ ${i}.`)
                    break;
                }
            }
            else if (takeRootResult as Coordinate) {
                setRootPoint = takeRootResult as Coordinate;
            }
        }

        // spawn remaining battle rooms
        if (battleRoomsSpawned < battleRoomsCount) {
            const difference = battleRoomsCount - battleRoomsSpawned;
            const deadEndRooms: Room[] = [];
            const roomQueue: Room[] = [dungeon.getRoom(_dungeonData.start)!];
            const exploredRooms: Room[] = [];

            let currentRoom = roomQueue.shift();
            while (currentRoom) {
                for (let i = 0; i < currentRoom.directions.length; i++) {
                    const r = currentRoom.directions[i];
                    if (r && !exploredRooms.includes(r)) {
                        roomQueue.push(r);
                        exploredRooms.push(r);
                    }
                }

                if (currentRoom.directions.filter(_d => _d === null).length === 3) {
                    deadEndRooms.unshift(currentRoom);
                }

                currentRoom = roomQueue.shift();
            }

            for (let i = 0; i < difference; i++) {
                const deadEnd = deadEndRooms[i];
                if (deadEnd) {
                    deadEnd.isBattleRoom = true;
                }
            }
        }

        return dungeon;
    }

    getRoom(_c: Coordinate) {
        if (this.CS[_c.x]) {
            return this.CS[_c.x][_c.y];
        }
    }

    async initialiseUsers(_user: User, _userData: UserData) {
        this.leaderUser = _user;
        this.leaderUserData = _userData;
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            if (room.isBattleRoom) {
                // await Battle.Generate(mapdata, _user, message, _userData.party, BotClient, false)
                //     .then(_b => {
                //         room.battle = _b;
                //     });
            }
        }
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

            ctx.fillStyle = stringifyRGBA({
                r: 255 * Number(room.isBattleRoom),
                b: 0,
                g: 255 * Number(findEqualCoordinate(room.coordinate, this.data.start)),
                alpha: 1
            });
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
                b: 255,
                g: 255,
                alpha: 1
            });
            ctx.lineWidth = 3;
            for (let i = 0; i < room.directions.length; i++) {
                const otherRoom = room.directions[i];
                if (otherRoom) {
                    const otherRoomCanvasCoord = getCanvasCoordsFromBattleCoord(otherRoom.coordinate, pixelsPerTile, this.data.height);
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
    }
}