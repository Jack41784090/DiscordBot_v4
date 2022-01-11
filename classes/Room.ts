import { Coordinate, NumericDirection, RoomDirections } from "../typedef";
import { Battle } from "./Battle";
import { Dungeon } from "./Dungeon";

export class Room {
    dungeon: Dungeon;
    attachedBattle: Battle | null;
    directions: RoomDirections;
    coordinate: Coordinate;

    constructor(_battle: Battle | null, _roomDir: RoomDirections, _dungeon: Dungeon, _coordinate: Coordinate) {
        this.attachedBattle = _battle;
        this.directions = _roomDir;
        this.dungeon = _dungeon;
        this.coordinate = _coordinate;
    }

    Start() {

    }

    async Next(_direction: NumericDirection) {
    //     let entranceOpened = this.directions[_direction];
        
    //     if (entranceOpened) {
    //         const fromDirection: NumericDirection = (_direction + 2) % 4;
    //         const newRoomDirections: RoomDirections = [null, null, null, null];

    //         const {
    //             mapData,
    //             message,
    //             author,
    //             pvp,
    //             client,
    //             party,
    //         } = this.attachedBattle;
    //         const newBattle = await Battle.Start(mapData, author, message, party, client, pvp);
    //         const newRoom = new Room(newBattle, newRoomDirections, this.dungeon);
    //         newRoomDirections[fromDirection] = newRoom;

    //         return newRoom;
    //     }
    //     else {
    //         return null;
    //     }
    }
}