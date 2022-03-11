import { User } from "discord.js";
import { interactionEventData } from "../jsons";
import { InteractionEventType, OwnerID, UserData } from "../typedef";
import { getUserData, saveUserData } from "./Database";
import { InteractionEvent } from "./InteractionEvent";

import { debug, log } from "console"
import { getPromiseStatus } from "./Utility";

interface InteractionUserProfile {
    userData: UserData,
    pending: Array<InteractionEvent>,
    handling: Array<InteractionEvent>,
    handlerPromise?: Promise<unknown>,
}

export class InteractionEventManager {
    private static instance: InteractionEventManager;

    // static to access data easier
    static getInstance(): InteractionEventManager {
        if (InteractionEventManager.instance === undefined) {
            InteractionEventManager.instance = new InteractionEventManager();
        }
        return this.instance;
    }
    static userData(_id: OwnerID): UserData | null {
        return this.getInstance().userProfilesMap.get(_id)?.userData || null;
    }
    
    // instance values
    userProfilesMap: Map<OwnerID, InteractionUserProfile>;

    private constructor() {
        this.userProfilesMap = new Map<OwnerID, InteractionUserProfile>();
    }

    handle(_id: OwnerID) {
        log("New Handle");
        const userProfile: InteractionUserProfile | null =
            this.userProfilesMap.get(_id) || null;
        if (userProfile) {
            if (userProfile.handling.length === 0) {
                userProfile.handling = userProfile.pending;
                userProfile.pending = [];
            }

            debug("\tHandling", userProfile.handling.map(_e => `${_e.type} ${_e.timerPromise}`));
            debug("\tPending", userProfile.pending.map(_e => `${_e.type} ${_e.timerPromise}`));

            userProfile.handlerPromise =
                Promise.allSettled(userProfile.handling.map(_e => _e.promise()))
                    .then(() => {
                        userProfile.handling.forEach(_e => {
                            if (!_e.stopped) {
                                _e.stop()
                            }
                        });
                        userProfile.handling = [];
                        if (userProfile.pending.length > 0) {
                            log("\t\tPending is not empty, reusing.")
                            return this.handle(_id);
                        }
                        else {
                            log("\t\tAll done.")
                            saveUserData(userProfile.userData);
                            return 1;
                        }
                    });
        }
    }

    async registerInteraction(_id: OwnerID, _interactionEvent: InteractionEvent, _userData?: UserData): Promise<UserData | null> {
        let returning = null;
        const { type } = _interactionEvent;
        const userProfile: InteractionUserProfile =
            this.userProfilesMap.get(_id)||
            await (async () => {
                return this.userProfilesMap.set(_id, {
                    pending: [],
                    handling: [],
                    userData: _userData || await getUserData(_id),
                }).get(_id)!;
            })();
        
        if (userProfile.pending.length < 5) {
            const duplicateEvent: InteractionEvent | null =
                userProfile.pending.find(_e => _e.type === type) ||
                userProfile.handling.find(_e => _e.type === type) ||
                null;

            if (!duplicateEvent || duplicateEvent.stoppable) {
                log(`Registering event (${_id}): ${_interactionEvent.type}`);
                duplicateEvent?.stop();
                userProfile.pending.push(_interactionEvent);
                returning = userProfile.userData;

                const promiseStatus = userProfile.handlerPromise?
                    (await getPromiseStatus(userProfile.handlerPromise)):
                    undefined;
                debug("\tHandler Promise is", promiseStatus);
                if (promiseStatus === 'fulfilled') {
                    this.handle(_id);
                }
            }
        }

        return returning;
    }
}