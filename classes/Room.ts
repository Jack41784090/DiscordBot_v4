import { Coordinate, MapData, NumericDirection, OwnerID, RoomDirections, StartBattleOptions, Team, DungeonTreasure } from "../typedef";
import { Battle } from "./Battle";
import { BattleManager } from "./BattleManager";
import { Dungeon } from "./Dungeon";
import { findEqualCoordinate } from "./Utility";

export class Room {
    battle: Battle | null = null;
    treasure: DungeonTreasure | null = null;
    isBattleRoom: boolean;
    isDiscovered: boolean;

    dungeon: Dungeon;
    directions: RoomDirections;
    coordinate: Coordinate;

    constructor(_roomDir: RoomDirections, _dungeon: Dungeon, _coordinate: Coordinate, _hasBattle = false) {
        this.directions = _roomDir;
        this.dungeon = _dungeon;
        this.coordinate = _coordinate;
        this.isBattleRoom = _hasBattle;
        this.isDiscovered = findEqualCoordinate(this.dungeon.data.start, _coordinate);
    }

    StartBattle(_ambush: Team | null) {
        if (this.battle) {
            const battleOptions: StartBattleOptions = {
                ambush: _ambush,
            };
            return this.battle.StartBattle(battleOptions)
                .then(_r => {
                    this.isBattleRoom = false;
                    const leader: OwnerID | undefined = this.dungeon.leaderUser?.id;
                    if (leader) {
                        BattleManager.Manager.delete(leader);
                    }
                    return _r;
                });
        }
        return null;
    }

    Move(_direction: NumericDirection) {
        
    }
}