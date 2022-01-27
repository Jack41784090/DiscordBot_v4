import { Message, User } from "discord.js";
import { InteractionEventType } from "../typedef";
import { debug } from "./Utility";

export class InteractionEvent {
    user: User;
    interactedMessage: Message;
    interactionEventType: InteractionEventType;

    constructor(_user: User, _message: Message, _eventType: InteractionEventType) {
        this.user = _user;
        this.interactionEventType = _eventType;
        this.interactedMessage = _message;
    }

    stop() {
        this.interactedMessage.delete()
            .catch(_err => null);
    }
}