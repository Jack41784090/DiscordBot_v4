import { Interaction, InteractionCollector, Message, User } from "discord.js";
import { InteractionEventOptions, InteractionEventType, OwnerID, UserData } from "../typedef";
import { Battle } from "./Battle";
import { Dungeon } from "./Dungeon";
import { InteractionEventManager } from "./InteractionEventManager";

import { debug, log } from "console"
import { getUserData } from "./Database";
import { arrayRemoveItemArray } from "./Utility";
import { Room } from "./Room";

export class InteractionEvent {
    battle?: Battle;
    dungeon?: Dungeon;

    ownerID: OwnerID;
    interactedMessage: Message;
    type: InteractionEventType;
    stoppable: boolean = false;
    collectors: Array<InteractionCollector<Interaction>> = [];
    finishingPromiseResolve: (_v: void | PromiseLike<void>) => void = () => {};
    finishingPromiseTimer: NodeJS.Timeout = setTimeout(() => {}, 1);
    finishingPromise: Promise<void>;

    constructor(_id: OwnerID, _message: Message, _eventType: InteractionEventType, _options: InteractionEventOptions = {}) {
        this.ownerID = _id;
        this.type = _eventType;
        this.interactedMessage = _message;

        this.finishingPromise = new Promise<void>((resolve) => {
            this.finishingPromiseResolve = resolve;

            // inactivity stop
            this.finishingPromiseTimer = setTimeout(() => {
                this.collectors.forEach(_c => _c.stop());
                resolve();
                this.stop();
            }, 100 * 1000);

            // stop function stop: calling this.finishingPromise(true)
        });

        // special cases events
        switch (_eventType) {
            case 'battle':
            case 'dungeon':
                if (_options[_eventType] !== undefined) {
                    this.stoppable = false;
                    this[_eventType] = _options[_eventType] as (Battle & Dungeon);
                }
                else {
                    this.finishingPromiseResolve();
                }
                break;
        
            default:
                this.stoppable = true;
                break;
        }
    }

    async stop() {
        switch (this.type) {
            case 'battle':
                if (this.battle) {
                    const stat = this.battle.allStats().find(_s => _s.owner === this.ownerID);
                    if (stat) {
                        this.battle.removeEntity(stat);
                    }
                }
                clearTimeout(this.finishingPromiseTimer);
                this.finishingPromiseResolve();
                break;

            case 'dungeon':
                if (this.dungeon) {
                    const removingUserData: UserData | null = InteractionEventManager.userData(this.ownerID || "");
                    // remove the player from the leader's userData and the dungeon's user cache
                    if (removingUserData) {
                        arrayRemoveItemArray(
                            this.dungeon.userDataParty,
                            this.dungeon.userDataParty.find(_ud => _ud.party[0] === this.ownerID)
                        );
                        if (this.ownerID !== this.dungeon.leaderUser?.id && this.dungeon.leaderUserData) {
                            arrayRemoveItemArray(
                                this.dungeon.leaderUserData.party,
                                this.ownerID
                            )
                        }
                    }

                    // remove the player from every possible future battles
                    for (let i = 0; i < this.dungeon.rooms.length; i++) {
                        const room: Room = this.dungeon.rooms[i];
                        if (room.isBattleRoom) {
                            room.battle!.removeEntity(this.ownerID);
                        }
                    }
                }
                break;
        
            default:
                this.interactedMessage.delete()
                    .catch(_err => null);
                clearTimeout(this.finishingPromiseTimer);
                this.finishingPromiseResolve();
                break;
        }
    }

    promise() {
        return this.finishingPromise;
    }

    activity() {
        clearTimeout(this.finishingPromiseTimer);
        this.finishingPromiseTimer = setTimeout(() => {
            this.collectors.forEach(_c => _c.stop());
            this.finishingPromiseResolve;
            this.stop();
        }, 5 * 1000);
    }
}