import { Message, User } from "discord.js";
import { InteractionEventOptions, InteractionEventType, OwnerID } from "../typedef";
import { Battle } from "./Battle";
import { InteractionEventManager } from "./InteractionEventManager";

export class InteractionEvent {
    battle?: Battle;
    ownerID: OwnerID;
    interactedMessage: Message;
    interactionEventType: InteractionEventType;
    stoppable: boolean;

    constructor(_id: OwnerID, _message: Message, _eventType: InteractionEventType, _options: InteractionEventOptions = {}) {
        this.ownerID = _id;
        this.interactionEventType = _eventType;
        this.interactedMessage = _message;

        if (_eventType === 'battle') {
            if (_options.battle) {
                this.battle = _options.battle;
            }
            else {
                InteractionEventManager.getInstance().stopInteraction(_id, 'battle');
            }
        }

        this.stoppable = (() => {
            switch (_eventType) {
                case 'battle':
                    return false;
                default:
                    return true;
            }
        })();
    }

    stop() {
        switch (this.interactionEventType) {
            case 'battle':
                if (this.battle) {
                    const stat = this.battle.allStats().find(_s => _s.owner === this.ownerID);
                    if (stat) {
                        this.battle.removeEntity(stat);
                    }
                }
                break;
        
            default:
                this.interactedMessage.delete()
                    .catch(_err => null);
                break;
        }
    }
}