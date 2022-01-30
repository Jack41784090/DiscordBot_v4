import { Message, User } from "discord.js";
import { InteractionEventType } from "../typedef";
import { InteractionEventManager } from "./InteractionEventManager";

export class InteractionEvent {
    user: User;
    interactedMessage: Message;
    interactionEventType: InteractionEventType;
    active: boolean = true;

    constructor(_user: User, _message: Message, _eventType: InteractionEventType) {
        this.user = _user;
        this.interactionEventType = _eventType;
        this.interactedMessage = _message;
    }

    stop() {
        this.active = false;
        this.interactedMessage.delete()
            .catch(_err => null);
    }
}