import { User } from "discord.js";
import { interactionEventData } from "../jsons";
import { InteractionEventType, OwnerID, UserData } from "../typedef";
import { getUserData, saveUserData } from "./Database";
import { InteractionEvent } from "./InteractionEvent";
import { log } from "./Utility";

interface InteractionSplit {
    userData: UserData,
    timer: NodeJS.Timer,
    'inventory': InteractionEvent | null;
    'shop': InteractionEvent | null;
    'battle': InteractionEvent | null;
    'info': InteractionEvent | null;
}

export class InteractionEventManager {
    private static instance: InteractionEventManager;

    static getInstance(): InteractionEventManager {
        if (InteractionEventManager.instance === undefined) {
            InteractionEventManager.instance = new InteractionEventManager();
        }
        return this.instance;
    }

    user_interaction_map: Map<OwnerID, InteractionSplit>;

    private constructor() {
        this.user_interaction_map = new Map<OwnerID, InteractionSplit>();
    }

    async registerInteraction(_id: OwnerID, _interactionEvent: InteractionEvent, _userData?: UserData): Promise<UserData | null> {
        const split: InteractionSplit =
            this.user_interaction_map.get(_id)||
            this.user_interaction_map.set(_id, {
                userData: _userData || await getUserData(_id),
                timer: setInterval(async () => {
                    // log("Check null...");
                    let nulledCount: number = 0;
                    const interactionSplit: InteractionSplit = this.user_interaction_map.get(_id)!
                    const splitEntries = Object.entries(interactionSplit);
                    for (const [_key, _value] of splitEntries) {
                        if (_value === null) {
                            nulledCount++;
                        }
                    }

                    const interactionEventCount: number = Object.keys(interactionEventData).length;
                    // log(`\tnulled: ${nulledCount} v. eventCount: ${interactionEventCount}`)
                    
                    if (nulledCount === interactionEventCount) {
                        await saveUserData(interactionSplit.userData);
                        clearInterval(interactionSplit.timer);
                        this.user_interaction_map.delete(_id);
                    }
                }, 1000),
                'inventory': null,
                'shop': null,
                'battle': null,
                'info': null,
            }).get(_id)!;
        const existing: InteractionEvent | null = split[_interactionEvent.interactionEventType];
        if (!existing || (existing && existing.stoppable === true)) {
            this.stopInteraction(_id, _interactionEvent.interactionEventType);
            split[_interactionEvent.interactionEventType] = _interactionEvent;
            return split.userData;
        }
        else {
            return null;
        }
    }

    stopInteraction(_userID: OwnerID, _eventType: InteractionEventType) {
        const interaction = this.user_interaction_map.get(_userID);
        if (interaction) {
            interaction[_eventType]?.stop();
            interaction[_eventType] = null;
        }
    }
}