import { User } from "discord.js";
import { InteractionEventType, OwnerID } from "../typedef";
import { InteractionEvent } from "./InteractionEvent";

interface InteractionSplit {
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

    registerInteraction(_user: User, _interactionEvent: InteractionEvent) {
        const split: InteractionSplit =
            this.user_interaction_map.get(_user.id)||
            this.user_interaction_map.set(_user.id, {
                'inventory': null,
                'shop': null,
                'info': null,
            }).get(_user.id)!;
        const existing: InteractionEvent | null = split[_interactionEvent.interactionEventType];
        if (existing && existing.interactedMessage.id !== _interactionEvent.interactedMessage.id) {
            existing.stop();
        }
        split[_interactionEvent.interactionEventType] = _interactionEvent;
    }
}