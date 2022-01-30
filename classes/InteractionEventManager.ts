import { User } from "discord.js";
import { InteractionEventType, OwnerID, UserData } from "../typedef";
import { getUserData, saveUserData } from "./Database";
import { InteractionEvent } from "./InteractionEvent";

interface InteractionSplit {
    'userData': UserData | null,
    'inventory': InteractionEvent | null;
    'shop': InteractionEvent | null;
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

    async registerInteraction(_user: User, _interactionEvent: InteractionEvent, _userData?: UserData): Promise<UserData> {
        const split: InteractionSplit =
            this.user_interaction_map.get(_user.id)||
            this.user_interaction_map.set(_user.id, {
                userData: _userData || await getUserData(_user.id),
                'inventory': null,
                'shop': null,
                'info': null,
            }).get(_user.id)!;
        const existing: InteractionEvent | null = split[_interactionEvent.interactionEventType];
        if (existing) {
            InteractionEventManager.instance.stopInteraction(_user.id, _interactionEvent.interactionEventType);
        }
        split[_interactionEvent.interactionEventType] = _interactionEvent;

        const checkAllNull = setInterval(async () => {
            let nulledCount: number = 0;
            const interactionSplit: InteractionSplit = this.user_interaction_map.get(_user.id)!
            const entries = Object.entries(interactionSplit);
            for (const [_key, _value] of entries) {
                const key = _key as keyof InteractionSplit;
                if (key !== 'userData' && _value === null) {
                    nulledCount++;
                }
            }
            if (nulledCount === entries.length - 1) {
                await saveUserData(interactionSplit.userData!);
                clearInterval(checkAllNull);
                this.user_interaction_map.delete(_user.id);
            }
        }, 1000);

        return split.userData || await getUserData(_user.id).then(_ud => {
            split.userData = _ud;
            return _ud;
        });
    }

    stopInteraction(_userID: OwnerID, _eventType: InteractionEventType) {
        const interaction = this.user_interaction_map.get(_userID);
        if (interaction) {
            interaction[_eventType]?.stop();
            interaction[_eventType] = null;
        }
    }
}