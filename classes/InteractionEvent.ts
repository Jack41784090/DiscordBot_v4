import { Interaction, InteractionCollector, Message, MessageEmbed, User } from "discord.js";
import { InteractionEventOptions, InteractionEventType, OwnerID, UserData } from "../typedef";
import { Battle } from "./Battle";
import { Dungeon } from "./Dungeon";
import { InteractionEventManager } from "./InteractionEventManager";

import { debug, log } from "console"
import { getUserData } from "./Database";
import { arrayRemoveItemArray, confirmationInteractionCollect, formalise } from "./Utility";
import { Room } from "./Room";
import { BotClient } from "..";

export class InteractionEvent {
    static STANDARD_TIMEOUT = 10 * 1000;

    battle?: Battle;
    dungeon?: Dungeon;

    ownerID: OwnerID;
    interactedMessage: Message;
    type: InteractionEventType;
    stoppable: boolean = false;
    stopped: boolean = false;
    timerPromise_resolve: (_v: void | PromiseLike<void>) => void = () => {};
    timerPromise_timeout: NodeJS.Timeout;
    timerPromise: Promise<void>;

    constructor(_id: OwnerID, _message: Message, _eventType: InteractionEventType, _options: InteractionEventOptions = {}) {
        this.ownerID = _id;
        this.type = _eventType;
        this.interactedMessage = _message;

        this.timerPromise = new Promise<void>((resolve) => {
            this.timerPromise_resolve = resolve;
        });

        // inactivity stop
        this.timerPromise_timeout = this.generateTimeout();

        // special cases events
        switch (_eventType) {
            case 'battle':
            case 'dungeon':
                if (_options[_eventType] !== undefined) {
                    this.stoppable = false;
                    this[_eventType] = _options[_eventType] as (Battle & Dungeon);
                }
                else {
                    this.timerPromise_resolve();
                }
                break;
        
            default:
                this.stoppable = true;
                break;
        }
    }

    /** Removing the player's presence in the activity and allows for a new one to be generated */
    async stop() {
        this.stopped = true;
        switch (this.type) {
            case 'battle':
                this.battle?.queueRemovePlayer(this.ownerID);
                break;

            case 'dungeon':
                if (this.dungeon) {
                    const removingUserData: UserData | null = InteractionEventManager.userData(this.ownerID || "");
                    // remove player from the dungeon's userData cache ...
                    if (removingUserData) {
                        arrayRemoveItemArray(
                            this.dungeon.userDataParty,
                            this.dungeon.userDataParty.find(_ud => _ud.party[0] === this.ownerID)
                        );
                        // ... and from the leader's userData party.
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
                            room.battle?.queueRemovePlayer(this.ownerID);
                        }
                    }
                }
                break;
        
            default:
                this.interactedMessage.delete()
                    .catch(_err => null);
                clearTimeout(this.timerPromise_timeout);
                this.timerPromise_resolve();
                break;
        }
    }

    promise() {
        return this.timerPromise;
    }

    activity() {
        console.log('===========================activity');
        clearTimeout(this.timerPromise_timeout);
        this.timerPromise_timeout = this.generateTimeout();
    }

    generateTimeout(): NodeJS.Timeout {
        return setTimeout(async () => {
            switch (this.type) {
                case 'battle':
                case 'dungeon':
                    const user: User | null = await BotClient.users.fetch(this.ownerID) || null;
                    if (user) {
                        const mes: Message = await user.send({
                            embeds: [
                                new MessageEmbed({
                                    title: `AFK Warning on your current ${formalise(this.type)}.`,
                                    footer: {
                                        text: "Answer yes to continue your session or else you will be removed automatically."
                                    }
                                })
                            ]
                        })
                        const answer: number = await confirmationInteractionCollect(mes);
                        if (answer === 0 || answer === -1) {
                            this.timerPromise_resolve();
                            this.stop();
                        }
                        else {
                            const event: InteractionEvent = new InteractionEvent(this.ownerID, this.interactedMessage, this.type, {
                                battle: this.battle,
                                dungeon: this.dungeon
                            })
                            InteractionEventManager.getInstance().registerInteraction(this.ownerID, event);
                        }
                    }
                    break;

                default:
                    this.timerPromise_resolve();
                    this.stop();
            }
        }, InteractionEvent.STANDARD_TIMEOUT);
    }
}