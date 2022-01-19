import { ButtonInteraction, EmbedField, EmbedFieldData, Message, MessageButtonOptions, MessageEmbed, MessageOptions, MessageSelectOptionData, SelectMenuInteraction, TextChannel, User } from "discord.js";
import { BotClient } from "..";
import { Coordinate, CoordStat, Direction, DungeonData, MapData, MapName, NumericDirection, RoomDirections, UserData, DungeonItem, DungeonItemType, Team, DungeonDisplayMode, DungeonBlockCode, OwnerID } from "../typedef";
import { Battle } from "./Battle";
import { Room } from "./Room";
import { addHPBar, debug, directionToEmoji, directionToMagnitudeAxis, directionToNumericDirection, findEqualCoordinate, formalize, getButtonsActionRow, getDistance, getNewObject, getRandomInArray, getSelectMenuActionRow, log, numericDirectionToDirection, random, replaceCharacterAtIndex, setUpInteractionCollect } from "./Utility";

import areasData from "../data/areasData.json";
import { getUserData, getUserWelfare } from "./Database";

export class Dungeon {
    static readonly BRANCHOUT_CHANCE = 0.1;
    static readonly BLOCKED_OFF_ROOMDIR: RoomDirections = [null, null, null, null];

    static readonly BLOCKICONS_PC = {
        "empty": "███",
        "00": " + ",
        "03": "╞══",
        "06": "══╡",
        "09": "═══",
        "30": "_╨_",
        "33": " ╚═",
        "36": "═╝ ",
        "39": "═╩═",
        "60": "-╥-",
        "63": " ╔═",
        "66": "═╗ ",
        "69": "═╦═",
        "90": " ║ ",
        "93": " ╠═",
        "96": "═╣ ",
        "99": "═╬═",
    };
    static readonly BLOCKICONS_MOBILE = {
        "empty": "█",
        "00": "+",
        "03": "╞",
        "06": "╡",
        "09": "═",
        "30": "╨",
        "33": "╚",
        "36": "╝",
        "39": "╩",
        "60": "╥",
        "63": "╔",
        "66": "╗",
        "69": "╦",
        "90": "║",
        "93": "╠",
        "96": "╣",
        "99": "╬",
    };

    displayMode: DungeonDisplayMode = "pc";

    inventory: DungeonItem[] = [{
        type: 'torch',
        uses: 1,
    }, {
        type: 'scout',
        uses: 1,
    }];
    callMessage: Message | null = null;

    leaderCoordinate: Coordinate;
    leaderUser: User | null = null;
    leaderUserData: UserData | null = null;
    party: User[] = [];
    partyWelfare: Map<OwnerID, number> = new Map<OwnerID, number>();

    data: DungeonData;
    rooms: Room[] = [];
    CS: CoordStat<Room> = {};
    mapDoubleArray: string[][] = [];

    /** Be sure to follow it up with initialise users */
    private constructor(_data: DungeonData) {
        this.data = _data;
        this.leaderCoordinate = getNewObject(_data.start);
    }

    static async Start(_dungeonData: DungeonData, _message: Message) {
        const dungeon = Dungeon.Generate(_dungeonData);
        await dungeon.initialiseUsers(_message);
        dungeon.readAction();
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
                // empty space
                if (coordEmpty(coord)) {
                    // initiate room
                    initiateCoord(coord);

                    // connect to previous room
                    const newRoomDir = Array.from(Dungeon.BLOCKED_OFF_ROOMDIR) as RoomDirections;
                    newRoomDir[oppositeDirection(_direction)] = previousRoom;

                    // create room
                    newRoom = new Room(newRoomDir, dungeon, getNewObject(coord, {}));
                    dungeon.CS[coord.x][coord.y] = newRoom;
                    dungeon.rooms.push(newRoom);
                }
                // room is initiated by previous branchOut
                else {
                    newRoom = dungeon.getRoom(coord)!;

                    // connect to previous room
                    const newRoomDir = newRoom.directions as RoomDirections;
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

            // look left
            if (_c.x - 1 >= 0 && _c.x - _length >= 0 && coordEmpty(getNewObject(_c, { x: _c.x - 1 }))) {
                availableDirections.push(NumericDirection.left);
            }
            // look down
            if (_c.y - 1 >= 0 && _c.y - _length >= 0 && coordEmpty(getNewObject(_c, { y: _c.y - 1 }))) {
                availableDirections.push(NumericDirection.down);
            }
            // look right
            if (_c.x + 1 < _dungeonData.width && _c.x + _length < _dungeonData.width && coordEmpty(getNewObject(_c, { x: _c.x + 1 }))) {
                availableDirections.push(NumericDirection.right);
            }
            // look up
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
        const battleRoomsCount = random(_dungeonData.minBattle, _dungeonData.maxBattle); debug("battleRoomsCount", battleRoomsCount);
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

                }
            }
            else if (takeRootResult as Coordinate) {
                setRootPoint = takeRootResult as Coordinate;
            }
        }

        // spawn remaining battle rooms
        if (battleRoomsSpawned < battleRoomsCount) {
            const difference = battleRoomsCount - battleRoomsSpawned;
            const startingRoom = dungeon.getRoom(_dungeonData.start)!;
            const deadEndRooms: Room[] = dungeon.breathFirstSearch(startingRoom,
                (_q, _c) => true,
                (_c) => {
                    return !findEqualCoordinate(_c.coordinate, startingCoord) &&
                        _c.directions.filter(_d => _d === null).length === 3;
                }
            );
            deadEndRooms.reverse();

            // Spawn treasures and boss rooms in the longest ones
            for (let i = 0; i < difference; i++) {
                const deadEnd = deadEndRooms[i];
                if (deadEnd) {
                    deadEnd.isBattleRoom = true;
                    // TODO: spawn treasure

                }
            }
        }

        return dungeon;
    }

    async updateWelfare() {
        for (let i = 0; i < this.party.length; i++) {
            const user = this.party[i];
            await getUserWelfare(user)
                .then(_wel => {
                    if (_wel === null) {
                        // remove player
                        this.party.splice(i, 1);
                        i--;
                    }
                    else {
                        this.partyWelfare.set(user.id, _wel);
                    }
                })
        }
    }

    breathFirstSearch(
        _startingRoom: Room,
        _pushToQueueCondition: (_q: Room[], _current: Room) => boolean,
        _pushToResultCondition: (_current: Room) => boolean,
    ) {
        const queue: Room[] = [_startingRoom];
        const result: Room[] = [];
        const exploredRooms: Room[] = [];

        // branch out and seek the longest dead end
        let currentRoom = queue.shift();
        while (currentRoom) {
            for (let i = 0; i < currentRoom.directions.length; i++) {
                const r = currentRoom.directions[i];
                if (r && !exploredRooms.includes(r)) {
                    exploredRooms.push(r);
                    if (_pushToQueueCondition(queue, currentRoom)) {
                        queue.push(r);
                    }
                }
            }

            if (_pushToResultCondition(currentRoom)) {
                result.push(currentRoom);
            }

            currentRoom = queue.shift();
        }

        return result;
    }

    validateMovement(_direction: NumericDirection | Direction): boolean {
        const direction: Direction = Number.isInteger(_direction)?
            numericDirectionToDirection(_direction as NumericDirection):
            _direction as Direction;
        const numericDirection: NumericDirection = directionToNumericDirection(direction);

        let valid = false;

        const currentRoom = this.getRoom(this.leaderCoordinate);
        if (currentRoom) {
            valid = currentRoom.directions[numericDirection] !== null;
        }
        else {
            this.leaderCoordinate = getNewObject(this.data.start);
            valid = this.validateMovement(_direction);
        }

        return valid;
    }

    getImageEmbedMessageOptions(_messageOption: MessageOptions = {}) {
        const mapEmbed = new MessageEmbed()
            .setFooter(`${this.leaderUser?.username}`, `${this.leaderUser?.displayAvatarURL() || this.leaderUser?.defaultAvatarURL}`)
            .setDescription(`${this.getMapString()}`);
        let currentRoom: Room | undefined = this.getRoom(this.leaderCoordinate);
        
        // encounter text
        if (currentRoom && currentRoom.isBattleRoom) {
            if (currentRoom.isDiscovered) {
                mapEmbed.setTitle(`🪓 Prepare for Battle! 🪓`);
            }
            else {
                mapEmbed.setTitle(`❗❗ Enemy Ambush! ❗❗`);
            }
        }

        // welfare report
        const fields: EmbedField[] = [{
            name: "‏",
            value: "Welfare",
            inline: false,
        }];
        for (let i = 0; i < this.party.length; i++) {
            const welfare = this.partyWelfare.get(this.party[i].id);
            if (welfare) {
                fields.push({
                    name: `${this.party[i].username}`,
                    value: "`"+addHPBar(25, welfare * 25)+"`",
                    inline: true,
                })
            }   
        }
        mapEmbed.fields = fields;

        const messageOption: MessageOptions = getNewObject({
            embeds: [mapEmbed],
        }, _messageOption);

        return messageOption;
    }

    async readAction() {
        const returnMapMessage = () => {
            const buttonOptions: MessageButtonOptions[] = [
                {
                    label: "UP ⬆️",
                    style: "PRIMARY",
                    customId: "up"
                },
                {
                    label: "DOWN ⬇️",
                    style: "SECONDARY",
                    customId: "down"
                },
                {
                    label: "RIGHT ➡️",
                    style: "PRIMARY",
                    customId: "right"
                },
                {
                    label: "LEFT ⬅️",
                    style: "SECONDARY",
                    customId: "left"
                },
                {
                    label: this.displayMode === "pc"?
                        "📱":
                        "🖥️",
                    style: "SUCCESS",
                    customId: "switch"
                }
            ];
            const selectMenuOptions: MessageSelectOptionData[] = this.inventory.map(_dItem => {
                return {
                    label: `${formalize(_dItem.type)} x${_dItem.uses}`,
                    value: _dItem.type,
                }
            });
            const messagePayload: MessageOptions = {
                components: [getButtonsActionRow(buttonOptions)],
            }
            if (selectMenuOptions.length > 0) {
                messagePayload.components!.push(getSelectMenuActionRow(selectMenuOptions));
            }

            return this.getImageEmbedMessageOptions(messagePayload);
        }
        const listenToQueue = async () => {
            setUpInteractionCollect(mapMessage, async itr => {
                if (itr.user.id === this.leaderUser!.id) {
                    try {
                        if (itr.isButton()) {
                            handleMovement(itr);
                            await itr.update(returnMapMessage());
                        }
                        else if (itr.isSelectMenu()) {
                            handleItem(itr);
                            await itr.update(returnMapMessage());
                        }
                    }
                    catch (_err) {
                        console.log(_err);
                    }
                }
            }, 1);
        }
        const handleItem = (_itr: SelectMenuInteraction) => {
            const itemSelected: DungeonItemType = _itr.values[0] as DungeonItemType;

            // find item used
            let itemIndex: number | null = null;
            const invItem = this.inventory.find((_it, _i) => {
                const valid = _it.type === itemSelected && _it.uses > 0;
                if (valid) {
                    itemIndex = _i;
                }
                return valid;
            });

            if (invItem && itemIndex !== null) {
                // consume item
                invItem.uses--;
                if (invItem.uses <= 0) {
                    this.inventory.splice(itemIndex, 1);
                }

                // execute action
                switch (itemSelected) {
                    case "torch":
                        const discoveredRooms = this.breathFirstSearch(
                            this.getRoom(this.leaderCoordinate)!,
                            (_q, _c) => {
                                return getDistance(_c.coordinate, this.leaderCoordinate) <= 1;
                            },
                            (_c) => true
                        );
                        discoveredRooms.forEach(_r => _r.isDiscovered = true);
                        break;

                    case "scout":
                        const battleRooms = this.rooms.filter(_r => _r.isBattleRoom);
                        const closestBattle = battleRooms.reduce((_closest: Room | null, _c: Room) => {
                            if (_c.isDiscovered) {
                                return _closest
                            }
                            else {
                                return _closest === null||
                                    getDistance(_closest.coordinate, this.leaderCoordinate) > getDistance(_c.coordinate, this.leaderCoordinate)?
                                        _c:
                                        _closest;
                            }
                        }, null);
                        if (closestBattle) {
                            closestBattle.isDiscovered = true;
                        }
                        break;
                }
            }

            listenToQueue();
        }
        const handleMovement = async (_itr: ButtonInteraction) => {
            const direction = _itr.customId;

            let valid: boolean = false;
            switch (direction) {
                case "up":
                case "down":
                case "right":
                case "left":
                    const magAxis = directionToMagnitudeAxis(direction);
                    valid = this.validateMovement(direction);

                    if (valid) {
                        this.leaderCoordinate[magAxis.axis] += magAxis.magnitude;
                    }
                    break;

                case "switch":
                    this.displayMode = this.displayMode === 'pc'?
                        'mobile':
                        'pc';
                    break;

                default:
                    valid = false;
            }

            // permitted movement and execute battle
            let nextRoom: Room | undefined = this.getRoom(this.leaderCoordinate);
            if (valid && nextRoom?.isBattleRoom) {
                // check ambush
                let ambush: Team | null = null;
                if (!nextRoom.isDiscovered) {
                    ambush = "enemy" as Team;
                }

                // start battle
                const victory = await nextRoom.StartBattle(ambush)!
                nextRoom.isDiscovered = true;
                await this.updateWelfare();
                mapMessage.edit(returnMapMessage())
                    .then(() => {
                        if (victory) {
                            listenToQueue();
                        }
                    })
            }
            // movement is not valid or no battle, listen again
            else {
                listenToQueue();
                if (nextRoom) {
                    nextRoom.isDiscovered = true;
                }
            }
        }

        const channel = this.callMessage!.channel;
        const mapMessage: Message = await channel.send(returnMapMessage());

        listenToQueue();
    }

    getRoom(_c: Coordinate) {
        if (this.CS[_c.x]) {
            return this.CS[_c.x][_c.y];
        }
    }

    getMapDoubleArray(_c: Coordinate): string | undefined {
        if (this.mapDoubleArray[this.data.height - 1 - _c.y] === undefined) {
            this.mapDoubleArray[this.data.height - 1 - _c.y] = [];
        }
        return this.mapDoubleArray[this.data.height - 1 - _c.y][_c.x]
    }
    setMapDoubleArray(_c: Coordinate, _string: string): void {
        if (this.mapDoubleArray[this.data.height - 1 - _c.y] === undefined) {
            this.mapDoubleArray[this.data.height - 1 - _c.y] = [];
        }
        this.mapDoubleArray[this.data.height - 1 - _c.y][_c.x] = _string;
    }

    getMapString() {
        const width = this.data.width;
        const height = this.data.height;
        const widthP1 = width + 1;
        const referObj = this.displayMode === "pc"?
            Dungeon.BLOCKICONS_PC:
            Dungeon.BLOCKICONS_MOBILE;

        // draw
        for (let i = 0; i < (width + 1) * height; i++) {
            const level = Math.floor(i / widthP1);
            const x = (i - (level * widthP1));
            const y = ((height - 1) - level);
            let room: Room | undefined = this.getRoom({ x: x, y: y });
            let icon = '';

            // if there is a room and room is discovered
            if (room && room.isDiscovered) {
                // get room code
                let UD = 0;
                if (room.directions[NumericDirection.up]) UD += 3;
                if (room.directions[NumericDirection.down]) UD += 6;
                let LR = 0;
                if (room.directions[NumericDirection.right]) LR += 3;
                if (room.directions[NumericDirection.left]) LR += 6;

                const code: DungeonBlockCode = `${UD}${LR}` as DungeonBlockCode;
                icon = referObj[code] as string;

                // replace middle character
                // leader's location
                if (findEqualCoordinate(this.leaderCoordinate, room.coordinate)) {
                    icon = replaceCharacterAtIndex(icon, '♦', Number(this.displayMode === 'pc'));
                }
                // enemy spotted
                else if (room.isBattleRoom) {
                    icon = replaceCharacterAtIndex(icon, '♠', Number(this.displayMode === 'pc'));
                }
                // treasure room
                else if (room.treasure !== null) {
                    icon = replaceCharacterAtIndex(icon, '♠', Number(this.displayMode === 'pc'));
                }
            }
            // empty
            else {
                icon = referObj.empty;
            }

            this.setMapDoubleArray({
                x: x,
                y: y,
            }, icon);
        }

        // combine mapDoubleArray into one string
        const returnString = [];
        for (let i = 0; i < this.mapDoubleArray.length; i++) {
            const a = this.mapDoubleArray[i];
            const string = a.join("");
            returnString.push(string);
        }

        return "```" + returnString.join("\n") + "```";
    }

    print(_channel: TextChannel) {
        const canvas = this.getMapString();
        _channel.send({
            embeds: [
                new MessageEmbed().setDescription(canvas)
            ]
        });
    }

    async initialiseUsers(_message: Message) {
        const user = _message.author;
        const userData = await getUserData(user.id);

        // set leader data
        this.leaderUser = user;
        this.leaderUserData = userData;
        this.callMessage = _message;
        this.party = await Promise.all(userData.party.map(async _id => BotClient.users.fetch(_id)))
        await this.updateWelfare();

        // initialise all battles
        for (let i = 0; i < this.rooms.length; i++) {
            const room = this.rooms[i];
            if (room.isBattleRoom) {
                const encounterName: MapName = getRandomInArray(this.data.encounterMaps);
                if (encounterName && areasData[encounterName]) {
                    const mapdata: MapData = getNewObject(areasData[encounterName]) as MapData;
                    await Battle.Generate(mapdata, this.leaderUser, _message, userData.party, BotClient, false)
                        .then(_b => {
                            room.battle = _b;
                        });
                }
            }
        }
    }
}