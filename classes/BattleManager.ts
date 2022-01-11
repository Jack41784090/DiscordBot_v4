import { OwnerID } from "../typedef";
import { Battle } from "./Battle";

export class BattleManager {
    static Manager = new Map<OwnerID, Battle>();
}