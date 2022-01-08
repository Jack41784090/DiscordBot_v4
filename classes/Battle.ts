import { CategoryChannel, Client, EmbedField, EmbedFieldData, Guild, Message, MessageCollector, MessageEmbed, MessageOptions, OverwriteData, TextChannel, User } from "discord.js";
import { addHPBar, clearChannel, counterAxis, extractCommands, findLongArm, getAHP, getDirection, getSpd, getCompass, log, newWeapon, random, returnGridCanvas, roundToDecimalPlace, checkWithinDistance, average, getAcc, getDodge, getCrit, getDamage, getProt, getLifesteal, getLastElement, formalize, dealWithAccolade, getWeaponUses, getCoordString, getMapFromCS, getBaseStat, getStat, getWeaponIndex, getNewObject, startDrawing, dealWithAction, getDeathEmbed, getSelectMenuActionRow, setUpInteractionCollect, getLargestInArray, getCoordsWithinRadius, getPyTheorem, dealWithUndoAction, HandleTokens, getNewNode, getDistance, getMoveAction, debug, getAttackAction, normaliseRGBA, clamp, stringifyRGBA, shortenString, drawText, drawCircle, getBuffStatusEffect } from "./Utility";
import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { getFileImage, getIcon, getUserData, saveBattle } from "./Database";
import enemiesData from "../data/enemiesData.json";
import weaponData from "../data/weaponData.json";

import fs from 'fs';
import { MinHeap } from "./MinHeap";
import { Action, AINode, AttackAction, BaseStat, BotType, ClashResult, ClashResultFate, Class, Coordinate, Direction, EnemyClass, Mapdata, MenuOption, MoveAction, MovingError, OwnerID, Round, RGBA, Stat, TargetingError, Team, Vector2, Weapon, WeaponTarget, StatusEffectType, Buff } from "../typedef";
import { hGraph, hNode } from "./hGraphTheory";
import { WeaponEffect } from "./WeaponEffect";
import { StatusEffect } from "./StatusEffect";

export class Battle {
    static readonly MOVE_READINESS = 10;

    // Discord-related Information
    author: User;
    message: Message;
    channel: TextChannel;
    client: Client;
    guild: Guild;

    // Map-related Information
    mapData: Mapdata;
    width: number;
    height: number;
    CSMap: Map<string, Stat>;
    pixelsPerTile: number;

    // Round Actions Information (Resets every Round)
    roundActionsArray: Array<Action>;
    roundSavedCanvasMap: Map<number, Canvas>;

    // Entity-Related Information
    tobespawnedArray: Array<Stat>;
    totalEnemyCount: number;
    enemyCount: number;
    playerCount: number;
    allIndex: Map<number, boolean>;

    // user cache
    userCache: Map<OwnerID, User>;

    // gamemode
    pvp: boolean;

    private constructor(_mapData: Mapdata, _author: User, _message: Message, _client: Client, _pvp = false) {
        this.author = _author;
        this.message = _message;
        this.channel = _message.channel as TextChannel;
        this.client = _client;
        this.guild = _message.guild as Guild;

        this.mapData = _mapData;
        this.width = _mapData.map.width;
        this.height = _mapData.map.height;
        this.CSMap = getMapFromCS(_mapData.map.coordStat);

        this.pixelsPerTile = 50;

        this.userCache = new Map<OwnerID, User>();

        this.pvp = _pvp;

        // action strings
        this.roundActionsArray = [];
        this.roundSavedCanvasMap = new Map<number, Canvas>();

        const allStats = this.allStats(true);

        // fixing spawning
        this.tobespawnedArray = [];
        this.totalEnemyCount = 0;
        this.enemyCount = 0;
        this.playerCount = 0;

        // fix index
        this.allIndex = new Map<number, boolean>();
        allStats.forEach(s => {
            if (s.index !== -1) this.allIndex.set(s.index, true);
            else {
                s.index = this.getIndex();
                this.allIndex.set(s.index, true);
                log("New index for ", s.base.class, s.index);
            }
        })
    }

    /** Main function to access in order to start a thread of battle */
    static async Start(_mapData: Mapdata, _author: User, _message: Message, _party: Array<OwnerID>, _client: Client, _pvp = false) {
        debug("pvp", _pvp);
        const battle = new Battle(_mapData, _author, _message, _client, _pvp);

        // add players to spawning list
        for (let i = 0; i < _party.length; i++) {
            const ownerID = _party[i];
            const userData = await getUserData(ownerID);
            const blankStat = getStat(getBaseStat(userData.equippedClass), ownerID);
            if (_pvp) {
                blankStat.pvp = true;
            }
            battle.tobespawnedArray.push(blankStat);
        }

        // add enemies to the spawning list
        if (!_pvp) {
            for (const [key, value] of Object.entries(_mapData.enemiesInfo)) {
                const Eclass = key as EnemyClass;
                const mod = { name: `${Eclass}` };
                const enemyBase: BaseStat = getNewObject(enemiesData[Eclass], mod) as BaseStat;
                const spawnCount = random(value.min, value.max);

                for (let i = 0; i < spawnCount; i++) {
                    battle.totalEnemyCount++;
                    battle.enemyCount++;
                    battle.tobespawnedArray.push(getStat(enemyBase));
                }
            }
        }

        battle.StartRound();
    }

    /** Begin a new round
        Recurses into another StartRound until all enemies / players are defeated (HP <= 0). */
    async StartRound() {
        log("======= New Round =======");

        // resetting action list and round current maps
        this.roundActionsArray = [];
        this.roundSavedCanvasMap.clear();

        // SPAWNING
        log("Currently waiting to be spawned...")
        for (let i = 0; i < this.tobespawnedArray.length; i++) {
            const spawning = this.tobespawnedArray[i];
            log(`\t{ index:${spawning.index}, class:${spawning.base.class} }`)
        }

        log("Spawning...");
        this.SpawnOnSpawner();
        // await saveBattle(this);
        const allStats = this.allStats();

        //#region COUNT LIVES
        log("Counting lives...");
        this.playerCount = allStats.reduce((acc, stat) => acc + Number(stat.team === "player" && stat.HP > 0), 0);
        debug("   PlayerCount", this.playerCount);
        debug("   Remaining Enemies", this.totalEnemyCount);
        //#endregion

        //#region INCREASE ALL READINESS & TOKENS
        log("Readiness ticking...");
        for (let i = 0; i < allStats.length; i++) {
            const s = allStats[i];

            if (s.team === 'block') continue;

            // randomly assign tokens
            for (let i = 0; i < 2; i++) {
                // const token = random(0, 2);
                // log(`\t${s.base.class} (${s.index}) got ${token}`)
                // switch (token) {
                    // case 0:
                        s.sword++;
                    //     break;
                    // case 1:
                    //     s.shield++;
                    //     break;
                    // case 2:
                    //     s.sprint++;
                    //     break;
                // }
            }

            // limit the entity's tokens
            HandleTokens(s, (p, t) => {
                log(`\t\t${s.index}) ${t} =${clamp(p, 0, 5)}`)
                s[t] = clamp(p, 0, 5);
            })

            // increment readiness
            if (s.readiness <= 50) {
                const Spd = getSpd(s);
                const read = random(Spd * 4, Spd * 4.25);

                s.readiness += read;

                // limit readiness to 50
                if (s.readiness > 50) {
                    s.readiness = 50;
                }
            }
        }
        //#endregion

        //#region FIND / CREATE COMMAND ROOM CATEGORY
        
        // find if the "CommandRooms" category already exists
        const existingCategory = this.guild.channels.cache.find(gC => gC.name === 'CommandRooms' + this.guild.id && gC.type === 'GUILD_CATEGORY' ) as CategoryChannel;
        
        // set the command category as the existing one, or create one in the server.
        const commandCategory = existingCategory || await this.guild.channels.create('CommandRooms' + this.guild.id, { type: 'GUILD_CATEGORY' });

        // set category to not show to everyone the channels
        const existingPermissions_everyone = commandCategory.permissionOverwrites.cache.get(this.guild.roles.everyone.id)?.deny.toArray();
        if (!existingPermissions_everyone?.includes("VIEW_CHANNEL")) {
            commandCategory.permissionOverwrites.set([ { id: this.guild.roles.everyone.id, deny: 'VIEW_CHANNEL' } ]);
        }
        
        //#endregion

        //#region SAVE CURRENT MAP TO LOCAL
        log("Saving current map to local...")
        
        // get a new image of the map from scratch and convert it to DataURL for storage.
        const currentMapDataURL = (await this.getNewCanvasMap()).toDataURL();
        await new Promise((resolve) => {
            const thePath = `./maps/battle-${this.author.id}.txt`;
            fs.writeFile(thePath, currentMapDataURL, 'utf8', () => {
                clearTimeout(saveFailedErrorTimeout);
                resolve(void 0);
            });
            const saveFailedErrorTimeout = setTimeout(() => {
                resolve(void 0);
            }, 10 * 1000);
        });
        log("||=> Success.");

        //#endregion

        //#region PLAYING PHASE. INPUT ACTIONS!
        const reportPromises: Promise<unknown>[] = []; // to save the promises waiting for player responses

        log("Playing phase!");
        for (const realStat of allStats) {
            // if the entity is dead or is just an inanimate block, skip turn
            if (realStat.HP <= 0 || realStat.team === "block") continue;

            // reset weapon uses for entity
            realStat.weaponUses = realStat.weaponUses.map(_wU => 0);
            // reset moved
            realStat.moved = false;
            // reset associatedStrings
            realStat.actionsAssociatedStrings = {};

            //#region PLAYER CONTROL
            if (realStat.botType === BotType.naught && realStat.owner) {
                // fetch the Discord.User 
                const user: User | null = 
                    this.userCache.get(realStat.owner)||
                    await this.client.users.fetch(realStat.owner)
                        .then(u => {
                            this.userCache.set(realStat.owner, u);
                            return u;
                        })
                        .catch(err => {
                            console.log(err);
                            return null;
                        });

                // get a copy of stat (main reference in player control) from the CSMap
                const virtualStat: Stat = getNewObject(realStat,
                    {
                        username: user?.username,
                        virtual: true
                    }
                );

                // creating channel
                const channelAlreadyExist = this.guild.channels.cache.find(c => c.name === virtualStat.owner && c.type === 'GUILD_TEXT') as TextChannel;
                const createdChannel = channelAlreadyExist || await this.guild.channels.create(`${virtualStat.owner}`, { type: 'GUILD_TEXT' });
                if (!createdChannel.parent || createdChannel.parent.name !== commandCategory.name) {
                    createdChannel.setParent(commandCategory.id);
                }
                const existingPermissions_everyone = createdChannel.permissionOverwrites.cache.get(this.guild.roles.everyone.id)?.deny.toArray();
                const existingPermissions_author = createdChannel.permissionOverwrites.cache.get(virtualStat.owner)?.allow.toArray();
                
                const newChannel = !channelAlreadyExist;
                const noExistingPermission = (!existingPermissions_author || !existingPermissions_everyone);
                const extraPermissions = existingPermissions_author && existingPermissions_everyone && (existingPermissions_author.length > 1 || existingPermissions_everyone.length > 1);
                const missingPermissions = existingPermissions_author && existingPermissions_everyone && (!existingPermissions_author.includes('VIEW_CHANNEL') || !existingPermissions_everyone.includes('VIEW_CHANNEL'));
                
                // log(newChannel, noExistingPermission, extraPermissions, missingPermissions);
                if (
                    newChannel||
                        // new channel, set permission
                    noExistingPermission||
                        // no existing permissions
                    extraPermissions||
                        // extra permissions
                    missingPermissions
                        // missing permissions
                    )
                {
                    const overWrites: Array<OverwriteData> = [
                        { id: this.guild.roles.everyone, deny: 'VIEW_CHANNEL' },
                        { id: virtualStat.owner, allow: 'VIEW_CHANNEL' }
                    ];
                    createdChannel.permissionOverwrites.set(overWrites);
                }

                // mention user
                createdChannel.send(`<@${user?.id}>`).then(mes => mes.delete().catch(console.log));

                // send time, player embed, and input manual
                createdChannel.send("``` ```");
                // const timerMessage: Message = await createdChannel.send({ embeds: [this.getTimerEmbed(stat, timeLeft, getActionsTranslate(this.getStatActions(stat)).join(''))] });
                const playerInfoMessage: Message = await createdChannel.send(await this.getFullPlayerEmbedMessageOptions(virtualStat));

                // listen to actions with collector
                const readingPlayerPromise = this.readActions(120, playerInfoMessage, virtualStat, realStat).then(() => {
                    createdChannel.send({ embeds: [new MessageEmbed().setTitle("Your turn has ended.")] });
                });
                reportPromises.push(readingPlayerPromise);
            }
            //#endregion

            //#region AI
            if (realStat.botType === BotType.enemy) {
                const virtualStat = getNewObject<Stat, unknown>(realStat);

                // target selection
                // option 1: select the closest target
                const intendedTargets: Team[] = ["block"];
                if (virtualStat.team) {
                    intendedTargets.push(virtualStat.team);
                }
                const selectedTarget = this.findEntity_closest(virtualStat, intendedTargets);
                // option 2: select the weakest target

                // if found a target
                if (selectedTarget !== null) {
                    // 1. select weapon
                    const weaponSelected: Weapon = virtualStat.base.weapons[0];

                    // 2. move to preferred location
                    const path: Array<Coordinate> = this.startPathFinding(realStat, selectedTarget);
                    const moveActionArray: Array<MoveAction> = this.getMoveActionListFromCoordArray(realStat, path);
                    const fullActions: Array<Action> = [];

                    let i = 0;
                    // while the enemy has not moved or has enough sprint to make additional moves
                    // Using (rstat.sprint - i) because rstat is by reference and modification is only legal in execution.
                    while (i < moveActionArray.length && (virtualStat.moved === false || virtualStat.sprint > 0)) {
                        const moveAction = moveActionArray[i];
                        const moveMagnitude = Math.abs(moveAction.magnitude);
                        if (moveMagnitude > 0) {
                            moveAction.sprint = Number(virtualStat.moved);
                            const valid = this.executeVirtualMovement(moveAction, virtualStat);
                            if (valid) {
                                virtualStat.moved = true;
                                if (moveAction.magnitude !== undefined) {
                                    fullActions.push(moveAction);
                                }
                            }
                            else {
                                const error = this.validateMovement(virtualStat, moveAction);
                                log(`Failed to move. Reason: ${error?.reason} (${error?.value})`);
                            }
                        }
                        i++;
                    }

                    // 3. attack with selected weapon
                    if (checkWithinDistance(weaponSelected, getDistance(virtualStat, selectedTarget))) {
                        const attackAction = getAttackAction(virtualStat, selectedTarget, weaponSelected, selectedTarget, fullActions.length+1);
                        const valid = this.executeVirtualAttack(attackAction, virtualStat);
                        if (valid) {
                            fullActions.push(getAttackAction(realStat, selectedTarget, weaponSelected, selectedTarget, fullActions.length+1));
                        }
                    }

                    this.roundActionsArray.push(...fullActions);
                }
            }
            //#endregion
        }
        //#endregion

        //#region WAIT FOR PLAYER INPUTS
        await Promise.all(reportPromises);
        log("Players are all ready!");
        //#endregion

        //#region EXECUTING ACTIONS

        // sort actions in priority using map
        const priorityActionMap = new Map<Round, Action[]>();
        for (let i = 0; i < this.roundActionsArray.length; i++) {
            const act: Action = this.roundActionsArray[i];
            const actionListThisRound: Action[] | undefined = priorityActionMap.get(act.round);

            if (actionListThisRound)
                actionListThisRound.push(act);
            else
                priorityActionMap.set(act.round, [act]);
        }

        // find the latest action's priority
        const latestAction = getLargestInArray(this.roundActionsArray, _a => _a.round);
        if (latestAction) {
            const latestRound = latestAction.round;

            // execute every move from lowest priority to highest
            for (let i = 0; i <= latestRound; i++) {
                const roundExpectedActions: Action[] | undefined = priorityActionMap.get(i);
                if (roundExpectedActions) {
                    this.greaterPriorSort(roundExpectedActions);

                    // draw the base tiles and characters (before executing actions)
                    let canvas = this.roundSavedCanvasMap.get(i);
                    if (!canvas) {
                        canvas = new Canvas(this.width * this.pixelsPerTile, this.height * this.pixelsPerTile);
                        if (canvas) this.roundSavedCanvasMap.set(i, canvas);
                    }
                    const ctx = canvas.getContext("2d");
                    const roundCanvas = await this.getNewCanvasMap();
                    this.drawHealthArcs(roundCanvas);
                    this.drawIndexi(roundCanvas);
                    ctx.drawImage(roundCanvas, 0, 0, canvas.width, canvas.height);

                    // execution
                    const executedActions = this.executeActions(roundExpectedActions);

                    // draw executed actions
                    const actualCanvas = await this.getActionArrowsCanvas(executedActions);
                    ctx.drawImage(actualCanvas, 0, 0, canvas.width, canvas.height);

                    // update the final canvas
                    this.roundSavedCanvasMap.set(i, canvas);
                }
            }
            //#endregion

            // limit token count
            for (let i = 0; i < allStats.length; i++) {
                const s = allStats[i];
                HandleTokens(s, (p, t) => {
                    if (p > 3) {
                        log(`\t\t${s.index}) ${t} =${3}`)
                        s[t] = 3;
                    }
                });
            }
        }

        // check death: after player round
        this.checkDeath(allStats);

        //#region REPORT ACTIONS
        log("Reporting...")
        const allPromise: Promise<unknown>[] = [];

        // for each player, send an embed of actions completed of the player.
        const players = allStats.filter(s => s.botType === BotType.naught);
        players.forEach(async stat => {
            const allRounds: Round[] = Array.from(this.roundSavedCanvasMap.keys());
            const greatestRoundNumber: Round | undefined = getLargestInArray(allRounds, _ => _);
            if (greatestRoundNumber) {
                const commandRoomReport = this.sendReportToCommand(stat.owner, greatestRoundNumber);
                allPromise.push(commandRoomReport);
            }
        });

        // wait for all players to finish reading the reports
        await new Promise((resolve) => {
            Promise.all(allPromise).then(() => resolve(void 0));
            setTimeout(() => {
                resolve(void 0);
            }, 150 * 1000);
        });

        log("Reporting phase finished.")
        // allPromise.forEach(console.log);
        //#endregion

        this.FinishRound();
    }

    FinishRound() {
        log("Finishing Round...");
        const PVE = this.playerCount === 0 || (this.totalEnemyCount === 0 && this.tobespawnedArray.length === 0);
        const PVP = this.playerCount === 1;
        if ((this.pvp && PVP) || (!this.pvp && PVE))
        {
            // database work
            // await Database.updateOrAddUser(author, { status: 'idle' });
            // await Database.WriteBattle(author, Object.assign(this.returnObject(), { finished: true }));

            // == ACCOLADES ==
            const endEmbedFields: EmbedFieldData[] = [];
            this.callbackOnParty((stat: Stat) => {
                const statAcco = stat.accolades;
                const value = `Kills: ${statAcco.kill}
                        Damage Dealt: ${roundToDecimalPlace(statAcco.damageDealt)}
                        Healing Done: ${roundToDecimalPlace(statAcco.healingDone)}
                        Damage Absorbed: ${roundToDecimalPlace(statAcco.absorbed)}
                        Damage Taken: ${roundToDecimalPlace(statAcco.damageTaken)}
                        Dodged: ${statAcco.dodged} times
                        Critical Hits: ${statAcco.critNo} times
                        Clashed ${statAcco.clashNo} times
                        Average Rolls: ${roundToDecimalPlace(statAcco.rollAverage) || "N/A"}`;
                endEmbedFields.push({
                    name: stat.name + ` (${stat.base.class})`,
                    value: value,
                });
            });

            const victoryTitle =
                this.pvp ?
                    `${this.allStats().find(_s => _s.owner && _s.HP > 0)?.base.class || "What? No one "} wins!` :
                    this.totalEnemyCount === 0 ? "VICTORY!" : "Defeat."
            this.channel.send({
                embeds: [new MessageEmbed({
                    title: victoryTitle,
                    fields: endEmbedFields,
                })]
            });
        }
        else {
            this.StartRound();
        }
    }

    /** Execute function on every stat of players */
    callbackOnParty(_callback: (stat: Stat) => void) {
        const playersArray = this.allStats().filter(_s => _s.owner);
        playersArray.forEach(_callback);
    }

    /** Get array of all Stat, saved by reference */
    allStats(excludeBlock = false): Array<Stat> {
        const unsorted: Array<Stat> = [...this.CSMap.values()]; // saved by reference (pointer), not by value. (?) (https://www.typescriptlang.org/play?#code/PTAEHUFMBsGMHsC2lQBd5oBYoCoE8AHSAZVgCcBLA1UABWgEM8BzM+AVwDsATAGiwoBnUENANQAd0gAjQRVSQAUCEmYKsTKGYUAbpGF4OY0BoadYKdJMoL+gzAzIoz3UNEiPOofEVKVqAHSKymAAmkYI7NCuqGqcANag8ABmIjQUXrFOKBJMggBcISGgoAC0oACCbvCwDKgU8JkY7p7ehCTkVDQS2E6gnPCxGcwmZqDSTgzxxWWVoASMFmgYkAAeRJTInN3ymj4d-jSCeNsMq-wuoPaOltigAKoASgAywhK7SbGQZIIz5VWCFzSeCrZagNYbChbHaxUDcCjJZLfSDbExIAgUdxkUBIursJzCFJtXydajBBCcQQ0eDSABWkFgqAAjKAALygADeoB0DGg7Eg+VALIAvgBuRQUqlJOkM1AAJjZnO5vP5goVYoljSlNPpjIAzIquTy+QLQAaNZLqTLGQAWQ3Kk2Cu0WrU0RAMAiCgCyHoAPFTKJxmPwAPLW1AAPkVnEgElAPoI-tQgeDoDDusjAAoAJTixTuggBQSQVCZgBEIZjZf4OtlTNz+Y9RZL5ZwEng1elGblDYLzdLZZwmGyndr+t7TeLA4AYhwyKPwzaG5rKVaMxUyGQmNO2IgAGoq-SKgDaATPfeN-MEOYAuuLLV3ZRut3gT4-GUya+G5V+M3rf7Kdp3sEyTwNimbuOkioAAyiiIoC+qANpwRQADUqHZpyiglCUD46oqY6oM+TDHhQwE4Wiq5djuSB7gR4bEXgNH7oegikcB2E4ZK8DuAE0DwMwmb4ay7I6sxe4NsKwQqDgzQeGQXiIGBzjAuwNBfG4ZjMOwDDMJA-CwNA6iJAwwJ6CIXhlgAoqsDCIAs+hlkk2JluADioAA5MIABysZlkEKghl8ZDvMW-B6UcqCOAorjSK+ThKTowxYPoKAIIg0LCJcGntmQ0QiAYc7zIwLBsFw3BBCUQA)
        return unsorted.filter(s => (!excludeBlock || s.team !== "block"));
    }

    /** Get a string showing all nearby enemies reachable by weapon */
    getNearbyEnemiesInfo(stat: Stat): string {
        let enemyCount = 0;
        let string = "";
        const longArm = findLongArm(stat.base.weapons);
        const longestRange = longArm.Range[1];
        const nearbyEnemies = this.findEntities_radius(stat, longestRange);
        const nearbyEnemiesSorted = nearbyEnemies.sort((a, b) => getDistance(stat, a) - getDistance(stat, b));
        while (nearbyEnemiesSorted[0] && enemyCount < 10) {
            const s = nearbyEnemies.shift() as Stat;
            const distanceBetween = getDistance(stat, s);
            const IsWithinDistance = checkWithinDistance(newWeapon(longArm, { Range: [1, 5] }), distanceBetween);
            const AHP = getAHP(s);
            if (IsWithinDistance && string.length < 990) {
                string += (`(**${s.index}**) ${s.base.class} (${s.x}, ${s.y})` + "`" + addHPBar(AHP * (30 / AHP), s.HP * (30 / AHP))) + "` (" + roundToDecimalPlace(s.HP, 1) + ")";
                for (let i = 0; i < stat.base.weapons.length; i++) {
                    const isAlly = s.team === "player";
                    const isEnemy = s.team === "enemy";
                    const weapon = stat.base.weapons[i];
                    if (checkWithinDistance(stat.base.weapons[i], distanceBetween)) {
                        if (isAlly && weapon.targetting.target === WeaponTarget.ally) {
                            string += `${"`"}🛡️${stat.base.weapons[i].Name}${"`"}`;
                        }
                        if (isEnemy && weapon.targetting.target === WeaponTarget.enemy) {
                            string += `${"`"}🗡️${stat.base.weapons[i].Name}${"`"}`;
                        }
                    }
                }
                string += "";
            }
            enemyCount++;
        }

        return string;
    }

    /** Return an array of coordinates that are not occupied currently, based on the moveAction magnitude and direction */
    getAvailableSpacesAhead(moveAction: MoveAction): Array<Coordinate> {
        const magnitude = moveAction.magnitude;
        const axis = moveAction.axis;
        const stat = moveAction.affected;

        const availableSeats: Array<Coordinate> = [];
        const dir = Math.sign(magnitude);
        for (let i = 1; i <= Math.abs(magnitude); i++) {
            const newCoord = { x: stat.x, y: stat.y } as Coordinate;
            newCoord[axis] += (i * dir);

            if (this.checkVacantPlace(newCoord)) availableSeats.push(newCoord);
            else return availableSeats;
        }

        return availableSeats;
    }

    sendToCommand(roomID: string, message: MessageOptions) {
        const commandRoom = this.message.guild!.channels.cache.find(c => c.name === roomID && c.type === 'GUILD_TEXT');
        if (commandRoom) {
            return (commandRoom as TextChannel).send(message);
        }
    }
    async sendReportToCommand(roomID: string, round: Round): Promise<boolean> {
        const chosenCanvas = this.roundSavedCanvasMap.get(round);
        if (chosenCanvas) {
            const menuOptions: MenuOption[] = Array.from(this.roundSavedCanvasMap.keys()).map(rn => {
                return {
                    label: `Round ${rn}`,
                    value: `${rn}`,
                }
            });
            const embed = new MessageEmbed({
                title: `Round ${round}`,
                description: ""
            }).setImage("attachment://map.png");
            const messageOption: MessageOptions = {
                embeds: [embed],
                components: [getSelectMenuActionRow(menuOptions)],
                files: [{ attachment: chosenCanvas.toBuffer(), name: 'map.png' }]
            };

            // add description as actions done and done-to
            const associatedStat = this.allStats(true).find(_s => _s.owner === roomID);
            if (associatedStat && associatedStat.actionsAssociatedStrings[round] !== undefined) {
                log(associatedStat.actionsAssociatedStrings[round]);
                embed.description = shortenString(associatedStat.actionsAssociatedStrings[round].join('\n\n'));
            }

            if (embed.description === "") {
                embed.description = "*(No Actions this Round )*";
            }
            const promisedMsg = await this.sendToCommand(roomID, messageOption);
            if (promisedMsg) {
                return new Promise((resolve) => {
                    const itrCollector = setUpInteractionCollect(promisedMsg, async itr => {
                        if (itr.isSelectMenu()) {
                            const selectedRound = parseInt(itr.values[0]);
                            clearTimeout(timeOut);
                            promisedMsg.delete();
                            resolve(this.sendReportToCommand(roomID, selectedRound));
                        }
                    });

                    // timeout: done checking round
                    const timeOut = setTimeout(() => {
                        itrCollector.stop();
                        resolve(true);
                    }, 15 * 1000);
                });
            }
            else {
                return true;
            }
        }
        return false;
    }

    getStatsRoundActions(stat: Stat): Array<Action> {
        return this.roundActionsArray.filter(a => a.from.index === stat.index);
    }

    getCanvasCoordsFromBattleCoord(s: Coordinate, shift = true) {
        return {
            x: s.x * this.pixelsPerTile + (this.pixelsPerTile/2 * Number(shift)),
            y: (this.height - s.y - 1) * this.pixelsPerTile + (this.pixelsPerTile/2 * Number(shift))
        };
    }

    drawSquareOnBattleCoords(ctx: NodeCanvasRenderingContext2D, coord: Coordinate, rgba?: RGBA) {
        const canvasCoord = this.getCanvasCoordsFromBattleCoord(coord, false);
        if (rgba) {
            ctx.fillStyle = stringifyRGBA(rgba);
        }
        ctx.fillRect(canvasCoord.x, canvasCoord.y, this.pixelsPerTile, this.pixelsPerTile);
    }

    // virtual actions (actions that only change the virtualStat)
    executeVirtualAttack(_aA: AttackAction, _virtualAttacker: Stat) {
        const target = _aA.affected;
        const weapon = _aA.weapon;
        const check: TargetingError | null = this.validateTarget(_virtualAttacker, _aA.weapon, target);

        if (check === null) { // attack goes through
            _virtualAttacker.weaponUses[getWeaponIndex(weapon, _virtualAttacker)]++;

            _virtualAttacker.readiness -= _aA.readiness;
            HandleTokens(_virtualAttacker, (p, t) => {
                log(`\t\t${_virtualAttacker.index}) ${t} --${_aA[t]}`)
                _virtualAttacker[t] -= _aA[t];
            });
        }
        else { // attack cannot go through
            log(`Failed to target. Reason: ${check.reason} (${check.value})`);
        }
        return check === null;
    };
    executeVirtualMovement (_mA: MoveAction, virtualStat: Stat): boolean {
        log(`\tExecuting virtual movement for ${virtualStat.base.class} (${virtualStat.index}).`)
        const check: MovingError | null = this.validateMovement(virtualStat, _mA);

        if (check === null) {
            log("\t\tMoved!");

            // spending sprint to move
            if (virtualStat.moved === true) {
                HandleTokens(_mA, (p, type) => {
                    if (type === "sprint") {
                        log(`\t\t${virtualStat.index}) ${type} --${p}`)
                        virtualStat.sprint -= p;
                    }
                });
            }
            // other resource drain
            virtualStat.readiness -= Battle.MOVE_READINESS * Math.abs(_mA.magnitude);
            virtualStat.moved = true;
            virtualStat[_mA.axis] += _mA.magnitude;
        }
        else {
            log(`\t\tFailed to move. Reason: ${check.reason} (${check.value})`);
        }
        return check === null;
    };

    // action reader methods
    readActions(_givenSeconds: number, _infoMessage: Message, _vS: Stat, _rS: Stat) {
        // returns a Promise that resolves when the player is finished with their moves
        return new Promise((resolve) => {
            let currentListener: NodeJS.Timer;
            const responseQueue: Message[] = [];
            const { x, y, readiness, sword, shield, sprint } = _vS;

            let executingActions: Action[] = [];
            let infoMessagesQueue: Message[] = [_infoMessage];
            const channel = _infoMessage.channel;

            /** Listens to the responseQueue every 300ms, clears the interval and handles the request when detected. */
            const listenToQueue = () => {
                log("\tListening to queue...");
                if (currentListener) {
                    clearInterval(currentListener);
                }
                currentListener = setInterval(async () => {
                    if (responseQueue[0]) {
                        clearInterval(currentListener);
                        handleQueue();
                    }
                }, 300);
            }
            /** Handles the response (response is Discord.Message) */
            const handleQueue = async () => {
                log("\tHandling queue...");
                const mes = responseQueue.shift();
                if (mes === undefined) {
                    throw Error("HandleQueue received an undefined message.")
                }
                else {
                    const sections = extractCommands(mes.content);
                    const actionName = sections[0].toLocaleLowerCase();
                    const actionArgs = sections.slice(1, sections.length);
                    const moveMagnitude = parseInt(actionArgs[0]) || 1;

                    let valid: boolean = false;
                    switch (actionName) {
                        case "up":
                        case "u":
                        case "down":
                        case "d":
                        case "right":
                        case "r":
                        case "left":
                        case "l":
                            // get moveAction based on input (blackboxed)
                            const moveAction = getMoveAction(_vS, actionName, infoMessagesQueue.length, moveMagnitude);

                            // record if it is first move or not
                            const isFirstMove = !_vS.moved;

                            // validate + act on (if valid) movement on virtual map
                            valid = this.executeVirtualMovement(moveAction!, _vS);

                            // movement is permitted
                            if (valid) {
                                const realMoveStat = getMoveAction(_rS, actionName, infoMessagesQueue.length, moveMagnitude);
                                if (!isFirstMove) {
                                    realMoveStat.sprint = 1;
                                }
                                executingActions.push(realMoveStat);
                            }
                            else {
                                const check = this.validateMovement(_vS, moveAction)!;
                                if (check) {
                                    channel.send({
                                        embeds: [new MessageEmbed({
                                            title: check.reason,
                                            description: `Failed to move. Reference value: __${check.value}__`,
                                        })]
                                    });
                                }
                            }
                            break;

                        // attack
                        case "attack":
                            const attackTarget = this.findEntity_args(actionArgs, _vS);
                            if (attackTarget === null) {
                                channel.send({
                                    embeds: [new MessageEmbed({
                                        title: `Invalid arguments given.`,
                                        description: `Failed to attack.`,
                                    })]
                                });
                            }
                            else {
                                const enemyTargetWeapons = _vS.base.weapons.filter(w => (
                                    w.targetting.target === WeaponTarget.enemy
                                ));
                                const weaponChosen = enemyTargetWeapons[0];

                                const virtualAttackAction = getAttackAction(_vS, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                valid = this.executeVirtualAttack(virtualAttackAction, _vS);

                                if (valid) {
                                    const realAttackAction = getAttackAction(_rS, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                    executingActions.push(realAttackAction);
                                }
                                else {
                                    const check = this.validateTarget(_vS, weaponChosen, attackTarget)!;
                                    if (check) {
                                        channel.send({
                                            embeds: [new MessageEmbed({
                                                title: check.reason,
                                                description: `Failed to attack. Reference value: __${check.value}__`,
                                            })]
                                        });
                                    }
                                }
                            }
                            break;

                        // clear
                        case "clear":
                        case "cr":
                            executingActions = [];
                            infoMessagesQueue = [_infoMessage];
                            Object.assign(_vS, { x: x, y: y, readiness: readiness, sword: sword, shield: shield, sprint: sprint });
                            await clearChannel(channel as TextChannel, _infoMessage);
                            break;

                        case "end":
                            newCollector.stop();
                            log(`\tEnded turn for "${_vS.name}" (${_vS.base.class})`);
                            break;

                        case "log":
                            log(...this.allStats().filter(s => s.team !== "block").map(s => {
                                let string = `${s.base.class} (${s.index}) (${s.team}) ${s.HP}/${getAHP(s)} (${s.x}, ${s.y})`
                                return string;
                            }));
                            break;

                        case "undo":
                            if (infoMessagesQueue.length > 1) {
                                const undoAction = executingActions.pop();
                                dealWithUndoAction(_vS, undoAction!);
                                infoMessagesQueue.pop();
                                await clearChannel(channel as TextChannel, getLastElement(infoMessagesQueue));
                            }
                            break;

                        case "reckless":
                        case "reck":
                            // 2 shields => 1 sword
                            if (_vS.shield >= 2) {
                                _vS.shield -= 2;
                                _vS.sword++;
                                valid = true;
                                const recklessAction = getAttackAction(_rS, _rS, weaponData.Reckless as Weapon, _vS, infoMessagesQueue.length);
                                executingActions.push(recklessAction);
                            }
                            break;

                        case "smash":
                        case "sm":
                            // use 2 sprints to perform an attack
                            break;

                        case "brace":
                        case "defend":
                        case "br":
                        case "df":
                            // no drawing next turn. +1 shield.
                            break;

                        default:
                            if (actionName.length >= 3) {
                                const weaponChosen = _vS.base.weapons.find(w => {
                                    return w.Name.toLowerCase().search(actionName) !== -1;
                                });
                                if (weaponChosen) {
                                    const attackTarget = this.findEntity_args(actionArgs, _vS, weaponChosen);
                                    if (attackTarget === null) {
                                        valid = false;
                                    }
                                    else {
                                        const virtualAttackAction = getAttackAction(_vS, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                        valid = this.executeVirtualAttack(virtualAttackAction, _vS);

                                        if (valid) {
                                            const realAttackAction = getAttackAction(_rS, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                            executingActions.push(realAttackAction);
                                        }
                                        else {
                                            const check = this.validateTarget(_vS, weaponChosen, attackTarget)!;
                                            if (check) {
                                                channel.send({
                                                    embeds: [new MessageEmbed({
                                                        title: check.reason,
                                                        description: `Failed to attack. Reference value: __${check.value}__`,
                                                    })]
                                                });
                                            }
                                        }
                                    }
                                }
                                else {
                                    setTimeout(() => mes.delete().catch(console.log), 10 * 1000);
                                }
                            }
                            break;
                    }

                    debug("\tvalid", valid !== null);

                    if (valid) {
                        mes.react('✅');
                        // send the predicted map of the next move to channel
                        const messageOptions = await this.getFullPlayerEmbedMessageOptions(_vS, executingActions);
                        channel.send(messageOptions)
                            .then(m => {
                                if (valid) {
                                    infoMessagesQueue.push(m);
                                }
                                if (responseQueue[0]) {
                                    handleQueue();
                                }
                                else {
                                    listenToQueue();
                                }
                            })
                    }
                    else {
                        mes.react('❎');
                        listenToQueue();
                    }
                }
            }

            const newCollector = new MessageCollector(channel, {
                filter: m => m.author.id === _vS.owner,
                time: _givenSeconds * 1000,
            });
            newCollector.on('collect', mes => {
                if (responseQueue.length < 3) {
                    responseQueue.push(mes);
                }
                else {
                    mes.react("⏱️")
                }
            });
            newCollector.on('end', async () => {
                clearInterval(currentListener);
                for (let i = 0; i < responseQueue.length; i++) {
                    await handleQueue();
                }
                this.roundActionsArray.push(...executingActions);
                resolve(void 0);
            });

            listenToQueue();
        })
    }

    // index manipulation
    getIndex(stat?: Stat): number {
        let index: number | null = 0;
        if (this.allIndex.size > 0) {
            const lookUp = (min: number, max: number): number | null => {
                if (Math.abs(min - max) <= 1) {
                    return null;
                }

                const middle = Math.floor((max + min) / 2);
                const got = this.allIndex.get(middle);

                return got ?
                    (lookUp(min, middle) || lookUp(middle, max)) :
                    middle;
            }

            const allIndex: number[] = Array.from(this.allIndex.keys()).sort((a, b) => a - b);
            index = lookUp(0, getLastElement(allIndex));

            if (index === null) {
                index = getLastElement(allIndex) + 1;
            }
        }
        if (stat) {
            stat.index = index;
        }

        return index === null?
            this.getIndex():
            index as number;
    }
    setIndex(stat: Stat) {
        const oldIndex: number = stat.index;
        this.getIndex(stat);
        this.allIndex.set(stat.index, true);
        log(`\tSetting index of ${stat.base.class} from ${oldIndex} to ${stat.index}`);
    }

    // checkings regarding this battle
    checkVacantPlace(coord: Coordinate, exemption = (c:Coordinate) => false): boolean {
        if (!this.checkWithinWorld(coord)) return false;
        return exemption(coord) || !this.CSMap.has(getCoordString(coord));
    }
    checkWithinWorld(coord: Coordinate) {
        // log(`\t\tChecking within world:`)
        // log(`\t\t\tw\\${this.width} h\\${this.height} ${JSON.stringify(coord)}`);
        return this.width > coord.x && this.height > coord.y && coord.x >= 0 && coord.y >= 0;
    }

    tickStatuses(_s: Stat, _currentRoundAction: Action): string {
        log(`\tTick status for ${_s.base.class} (${_s.index})...`);

        let returnString = '';
        const statuses = _s.statusEffects; debug(`\t(${_s.index}) statuses`, statuses.map(_se => _se.type))

        for (let i = 0; i < statuses.length; i++) {
            const status = statuses[i];
            // make sure status is affecting the right entity and entity is still alive
            if (status.affected.index === _s.index && status.affected.HP > 0) {
                // tick
                log(`\t\t${status.type} ${status.value} (${status.duration} turns)`)
                const statusString = status.tick(_currentRoundAction);

                // empty string == invalid status => remove status
                if (!statusString) {
                    log(`\t\t\tRemoving status`)
                    this.removeStatus(status);
                    i--;
                }
                else {
                    // status header (first time only)
                    if (!returnString) {
                        returnString += `__${_s.base.class}__ (${_s.index})\n`
                    }

                    // status report
                    returnString += statusString;
                    if (i !== statuses.length - 1) {
                        returnString += "\n";
                    }

                    // notify the inflicter
                    if (status.from.index !== status.affected.index) {
                        this.appendReportString(status.from, _currentRoundAction.round, `__${status.affected.base.class}__ (${status.affected.index})\n` + statusString);
                    }
                }
            }
            else {
                debug("status.affected.index === _s.index", status.affected.index === _s.index);
                debug("status.affected.HP > 0", status.affected.HP > 0);
            }
            
        }
        return returnString;
    }

    // clash methods
    applyClash(_cR: ClashResult, _aA: AttackAction): string {
        let returnString = '';
        const target = _aA.affected;
        
        // weapon effects
        const weaponEffect: WeaponEffect = new WeaponEffect(_aA, _cR, this);
        const activationString = weaponEffect.activate();
        if (activationString) {
            returnString += activationString + "\n";
        }

        // reduce shielding
        if (_cR.fate !== "Miss" && target.shield > 0) {
            target.shield--;
        }

        // apply basic weapon damage
        returnString += this.applyClashDamage(_aA, _cR);

        return returnString;
    }
    applyClashDamage(_aA: AttackAction, clashResult: ClashResult): string {
        let returnString = '';

        const CR_damage = clashResult.damage;
        const CR_fate = clashResult.fate;

        const attacker = _aA.from;
        const target = _aA.affected;
        const weapon = _aA.weapon;

        const attackerClass = attacker.base.class;
        const targetClass = target.base.class;
        switch (weapon.targetting.target) {
            // damaging
            case WeaponTarget.enemy:
                const hitRate =
                    (getAcc(attacker, weapon) - getDodge(target)) < 100?
                        getAcc(attacker, weapon) - getDodge(target):
                        100;
                const critRate =
                    (getAcc(attacker, weapon) - getDodge(target)) * 0.1 + getCrit(attacker, weapon);

                // save accolades
                dealWithAccolade(clashResult, attacker, target);

                // reportString
                returnString +=
                    `**${attackerClass}** (${attacker.index}) ⚔️ **${targetClass}** (${target.index})
                    __*${weapon.Name}*__ ${hitRate}% (${roundToDecimalPlace(critRate)}%)
                    **${CR_fate}!** -**${roundToDecimalPlace(CR_damage)}** (${roundToDecimalPlace(clashResult.u_damage)})
                    [${roundToDecimalPlace(target.HP)} => ${roundToDecimalPlace(target.HP - CR_damage)}]`
                if (target.HP > 0 && target.HP - CR_damage <= 0) {
                    returnString += "\n__**KILLING BLOW!**__";
                }

                // lifesteal
                const LS = getLifesteal(attacker, weapon);
                if (LS > 0) {
                    returnString += "\n" + this.heal(attacker, CR_damage * LS);
                }

                // search for "Labouring" status
                const labourStatus = getLargestInArray(this.getStatus(target, "labouring"), _s => _s.value);
                if (labourStatus) {
                    labourStatus.value += CR_damage;
                }

                // apply damage
                target.HP -= CR_damage;
                break;

            // non-damaging
            case WeaponTarget.ally:
                if (attacker.index === target.index) {
                    returnString +=
                        `**${attackerClass}** (${attacker.index})) Activates __*${weapon.Name}*__`;
                }
                else {
                    returnString +=
                        `**${attackerClass}** (${attacker.index}) 🛡️ **${targetClass}** (${target.index})
                    __*${weapon.Name}*__`;
                }
                // returningString += abilityEffect();
                break;
        }
        return returnString;
    }
    clash(_aA: AttackAction): ClashResult {
        log(`\tClash: ${_aA.from.base.class} => ${_aA.affected.base.class}`);
        let fate: ClashResultFate = 'Miss';
        let damage: number, u_damage: number = 0;

        const attacker = _aA.from;
        const weapon = _aA.weapon;
        const target = _aA.affected;

        // define constants
        const hitChance = getAcc(attacker, weapon) - getDodge(target);
        const crit = getCrit(attacker, weapon);
        const minDamage = getDamage(attacker, weapon)[0];
        const maxDamage = getDamage(attacker, weapon)[1];
        const prot = getProt(target);

        // roll
        const hit = random(1, 100);

        // see if it crits
        if (hit <= hitChance) {
            // crit
            if (hit <= hitChance * 0.1 + crit) {
                u_damage = (random(average(minDamage, maxDamage), maxDamage)) * 2;
                fate = "Crit";
            }
            // hit
            else {
                u_damage = random(minDamage, maxDamage);
                fate = "Hit";
            }
        }

        u_damage = clamp(u_damage, 0, 1000);

        // apply protections
        damage = clamp(u_damage * (1 - (prot * target.shield / 3)), 0, 999);

        // reduce damage by shielding
        const shieldingStatus = getLargestInArray(target.statusEffects.filter(_status => _status.type === "protected"),
            (_item) => {
                return _item.value;
            }
        );
        if (shieldingStatus && shieldingStatus.value > 0) {
            const shieldValue = shieldingStatus.value;

            shieldingStatus.value -= damage;
            if (shieldingStatus.value <= 0) {
                this.removeStatus(shieldingStatus);
            }

            damage -= shieldValue;

            if (damage < 0) {
                damage = 0;
            }
        }

        return {
            damage: damage,
            u_damage: u_damage,
            fate: fate,
            roll: hit,
        };
    }

    // spawning methods
    Spawn(unit: Stat, coords: Coordinate) {
        this.setIndex(unit);
        debug("Spawning", `${unit.base.class} (${unit.index})`)

        unit.x = coords.x;
        unit.y = coords.y;
        this.CSMap.set(getCoordString(coords), unit);
    }
    SpawnOnSpawner(unit?: Array<Stat>) {
        // adding addition units to be spawned this round.
        if (unit) {
            this.tobespawnedArray = this.tobespawnedArray.concat(unit);
        }

        const failedToSpawn = [];
        while (this.tobespawnedArray[0]) {
            const stat = this.tobespawnedArray.shift() as Stat;

            // 1. look for spawner
            const possibleCoords = this.mapData.map.spawners
                .filter(s => s.spawns === stat.team)
                .map(s => (
                    { x: s.x, y: s.y } as Coordinate
                ));

            // 2. look for coords if occupied and spawn if not
            const availableCoords = possibleCoords.filter(c => !this.CSMap.has(getCoordString(c)));

            // 3. Spawn on Coords
            if (availableCoords.length > 0) {
                const c = availableCoords[random(0, availableCoords.length - 1)];
                this.Spawn(stat, c);
            }
            else {
                failedToSpawn.push(stat);
            }
        }

        for (let i = 0; i < failedToSpawn.length; i++) {
            this.tobespawnedArray.push(failedToSpawn[i]);
        }
    }

    getGreaterPrio (a: Action) {
        return (1000 * (20 - a.round)) + (a.from.readiness - a.readiness);
    };
    greaterPriorSort(_actions: Action[]) {
        const sortedActions = _actions.sort((a, b) => this.getGreaterPrio(b) - this.getGreaterPrio(a));
        return sortedActions;
    }

    appendReportString(_stat: Stat, _round: Round, _string: string) {
        const associatedStringArray = _stat.actionsAssociatedStrings;
        if (associatedStringArray[_round] === undefined) {
            associatedStringArray[_round] = [];
        }
        if (_string) {
            log(`\t\t\tAppending "${_string.replace("\n", "\\n")}" to (${_stat.index})`)
            associatedStringArray[_round].push(_string);
        }
    }

    // actions
    executeAutoWeapons(_action: Action): string {
        const round = _action.round;

        const executeAuto = (_s: Stat) => {
            const attacker = _s;
            const target = _s.index === _action.from.index?
                _action.affected:
                _action.from;

            _s.base.autoWeapons.forEach(_w => {
                const weaponTarget: WeaponTarget = _w.targetting.target;
                const intendedVictim: Stat | null =
                    weaponTarget === WeaponTarget.ally ?
                        // weapon is intended to target friendly units
                        target.team === attacker.team && _w.targetting.AOE !== "self" ?
                            target : // if the action is targetting a friendly unit, use the effect on them.
                            attacker : // if the action is targetting an enemy, use it on self
                        // weapon is intended to target enemies
                        target.team === attacker.team && (!target.pvp || !attacker.pvp) ?
                            null : // the targetted unit is friendly, ignore the autoWeapon.
                            target; // if the targetted is an enemy, unleash the autoWeapon.

                if (intendedVictim) {
                    const selfActivatingAA: AttackAction = getAttackAction(attacker, intendedVictim, _w, {
                        x: intendedVictim.x, y: intendedVictim.y
                    }, round);

                    this.executeAttackAction(selfActivatingAA);
                    // totalString.push(weaponEffect.activate());
                }
            });
        }

        let totalString: string[] = [];

        executeAuto(_action.from);
        if (_action.from.index !== _action.affected.index) {
            executeAuto(_action.affected);
        }

        return totalString.join("\n");
    }
    executeActions(_actions: Action[]) {
        log("Executing actions...")

        const returning: Action[] = [];
        this.greaterPriorSort(_actions);

        let executing = _actions.shift();
        while (executing) {
            returning.push(this.executeOneAction(executing));
            executing = _actions.shift();
        }

        return returning;
    }
    executeOneAction(_action: Action) {
        log(`\tExecuting action: ${_action.type}, ${_action.from.base.class} => ${_action.affected.base.class}`)
        const mAction = _action as MoveAction;
        const aAction = _action as AttackAction;

        const actionAffected = _action.affected;
        const actionFrom = _action.from;
        const round = _action.round;

        // activate autoWeapons
        let autoWeaponReportString = this.executeAutoWeapons(_action);
        this.appendReportString(actionAffected, round, autoWeaponReportString);
        this.appendReportString(actionFrom, round, autoWeaponReportString);

        // apply statuses for target, then report to target
        const affectedStatusString = this.tickStatuses(actionAffected, _action);
        if (affectedStatusString) {
            this.appendReportString(actionAffected, round, affectedStatusString);
        }

        // if the action is not self-targetting...
        if (actionAffected.index !== actionFrom.index) {
            // apply statuses for attacker, then report to attacker
            const attackerStatusString = this.tickStatuses(actionFrom, _action);
            if (attackerStatusString) {
                this.appendReportString(actionFrom, round, attackerStatusString);
            }
        }

        return _action.type === 'Attack' ?
            this.executeAttackAction(aAction) :
            this.executeMoveAction(mAction);
    }
    executeSingleTargetAttackAction(_aA: AttackAction) {
        const eM = this.validateTarget(_aA);
        const attacker = _aA.from;
        const target = _aA.affected;
        let string = '';

        if (eM) {
            log(`\t${attacker.base.class} failed to attack ${target.base.class}. Reason: ${eM.reason}`);
            string =
                `**${attacker.base.class}** (${attacker.index}) failed to attack **${target.base.class}** (${target.index}). Reason: ${eM.reason}`;
        }
        else {
            // valid attack
            const clashResult: ClashResult = this.clash(_aA);
            const clashAfterMathString: string = this.applyClash(clashResult, _aA);
            string = clashAfterMathString;
        }

        return string;
    };
    executeAOEAttackAction(_aA: AttackAction, inclusive = true) {
        const center = _aA.coordinate;
        const weapon = _aA.weapon;
        const attacker = _aA.from;

        const enemiesInRadius = this.findEntities_radius(center, weapon.Range[2] || weapon.Range[1], inclusive);
        let string = '';
        for (let i = 0; i < enemiesInRadius.length; i++) {
            const singleTargetAA = getAttackAction(attacker, enemiesInRadius[i], weapon, enemiesInRadius[i], _aA.round);
            const SAResult = this.executeSingleTargetAttackAction(singleTargetAA);
            string += SAResult;
            if (enemiesInRadius.length > 1 && i !== enemiesInRadius.length - 1) {
                string += "\n";
            }
        }
        return string;
    };
    executeLineAttackAction(_aA: AttackAction) {
        const target = _aA.affected;
        const attacker = _aA.from;

        const enemiesInLine = this.findEntities_inLine(attacker, target);
        let string = '';
        for (let i = 0; i < enemiesInLine.length; i++) {
            const singleTargetAA = getAttackAction(attacker, target, _aA.weapon, enemiesInLine[i], _aA.round);
            const SAResult = this.executeSingleTargetAttackAction(singleTargetAA);
            string += SAResult;
        }
        return string;
    };
    executeAttackAction(_aA: AttackAction): AttackAction {
        let attackResult = "";
        switch (_aA.weapon.targetting.AOE) {
            case "self":
                _aA.affected = _aA.from;
            case "single":
            case "touch":
                attackResult = this.executeSingleTargetAttackAction(_aA);
                break;

            case "circle":
                attackResult = this.executeAOEAttackAction(_aA, true);
                break;

            case "selfCircle":
                attackResult = this.executeAOEAttackAction(_aA, false);
                break;

            case "line":
                attackResult = this.executeLineAttackAction(_aA);
                break;
        }

        // save attack results as reportString
        this.appendReportString(_aA.from, _aA.round, attackResult);
        if (_aA.from.index !== _aA.affected.index) {
            this.appendReportString(_aA.affected, _aA.round, attackResult);
        }

        // expend resources
        _aA.executed = true;
        _aA.from.readiness -= _aA.readiness;
        HandleTokens(_aA.from, (p, t) => {
            log(`\t\t${_aA.from.index}) ${t} --${_aA[t]}`)
            _aA.from[t] -= _aA[t]
        });

        return _aA;
    }
    executeMoveAction(_mA: MoveAction): MoveAction {
        const stat = _mA.affected;
        const axis = _mA.axis;

        const possibleSeats = this.getAvailableSpacesAhead(_mA);
        const finalCoord = getLastElement(possibleSeats);

        const newMagnitude = (finalCoord ? getDistance(finalCoord, _mA.affected) : 0) * Math.sign(_mA.magnitude);
        const direction = getDirection(axis, newMagnitude);

        this.CSMap.delete(getCoordString(stat))
        stat[axis] += newMagnitude;
        this.CSMap = this.CSMap.set(getCoordString(stat), stat);
        
        // console.log(`${_mA.from.base.class} (${_mA.from.index}) 👢${formalize(direction)} ${Math.abs(newMagnitude)} blocks.`);

        const affected = _mA.affected;
        _mA.executed = true;
        affected.readiness -= _mA.readiness;
        HandleTokens(affected, (p, t) => {
            log(`\t\t${affected.index}) ${t} --${_mA[t]}`)
            affected[t] -= _mA[t]
        });

        return getNewObject(_mA, { magnitude: newMagnitude });
    }
    heal(_healedStat: Stat, _val: number): string {
        const beforeHP = roundToDecimalPlace(_healedStat.HP);
        if (_healedStat.HP > 0) {
            _healedStat.HP += _val;
            if (_healedStat.HP > getAHP(_healedStat)) _healedStat.HP = getAHP(_healedStat);
        }
        const afterHP = roundToDecimalPlace(_healedStat.HP);

        _healedStat.accolades.healingDone += (afterHP - beforeHP);
        return beforeHP !== afterHP?
            `✚ ${beforeHP} => ${afterHP}`:
            '';
    }

    // return Battle-related information
    getTimerEmbed(stat: Stat, timeLeft: number, actions: string): MessageEmbed {
        const titleString = `${timeLeft} seconds remaining...`;
        const explorerEmbed = new MessageEmbed({
            title: titleString,
            description: actions || "( *No actions* )",
        });

        // dealing with nearby enemies
        const string = this.getNearbyEnemiesInfo(stat);
        if (string) explorerEmbed.fields.push({
            name: "Nearby",
            value: string || "*( no enemies nearby )*",
            inline: true,
        });
        return explorerEmbed;
    }

    /** Draws the base map and character icons. Does not contain health arcs or indexi */
    async getNewCanvasMap(): Promise<Canvas> {
        const allStats = this.allStats();

        // draw initial
        const groundImage = await getFileImage(this.mapData.map.groundURL);
        const canvas = returnGridCanvas(this.height, this.width, this.pixelsPerTile, groundImage);
        const ctx = canvas.getContext('2d');

        // putting other stats in the map
        const iconCache = new Map<Class | EnemyClass, Canvas>(); 
        for (let i = 0; i < allStats.length; i++) {
            const stat = allStats[i];
            const X = stat.x;
            const Y = stat.y;
            const baseClass = stat.base.class;

            // get character icon (template)
            let iconCanvas: Canvas = stat.owner?
                await getIcon(stat):
                (iconCache.get(baseClass) || await getIcon(stat));
            // let iconCanvas: Canvas = await getIcon(stat);
            const iconSize = iconCanvas.width;
            const iconCtx = iconCanvas.getContext("2d");
            if (!stat.owner && iconCache.get(baseClass) === undefined) {
                iconCache.set(baseClass, iconCanvas);
            }

            // draw on the main canvas
            const imageCanvasCoord = this.getCanvasCoordsFromBattleCoord({
                x: X,
                y: Y
            }, false);
            ctx.drawImage(iconCanvas, imageCanvasCoord.x, imageCanvasCoord.y, Math.min(iconCanvas.width, this.pixelsPerTile), Math.min(iconCanvas.height, this.pixelsPerTile));
        }

        // end
        return canvas;
    }

    /** Draws map from file or invokes getNewCanvasMap. Draws indexi and health arc afterwards. */
    async getCurrentMapCanvas(): Promise<Canvas> {
        const thePath = `./maps/battle-${this.author.id}.txt`;
        let image = new Image();
        let src: string | Buffer;
        try {
            log("\tReading existing file...")
            const readsrc = fs.readFileSync(thePath, 'utf8');
            log("\t\tFinish reading.")
            src = readsrc;
        }
        catch (err) {
            log("\tCreating new file...")
            const newMap = await this.getNewCanvasMap();
            const dataBuffer = newMap.toDataURL();
            fs.writeFileSync(thePath, dataBuffer);
            src = dataBuffer;
        }

        return new Promise((resolve) => {
            image.onload = () => {
                log("\t\tSuccessfully loaded.")
                const { canvas, ctx } = startDrawing(image.width, image.height);
                ctx.drawImage(image, 0, 0, image.width, image.height);
                this.drawHealthArcs(canvas);
                this.drawIndexi(canvas);
                resolve(canvas);
            }
            log("\tWaiting for image to load...");
            image.src = src;
        });
    }
    async getCurrentMapBuffer(): Promise<Buffer> {
        return (await this.getCurrentMapCanvas()).toBuffer();
    }

    /** Invokes getCurrentMapCanvas and draws arrows on top. */
    async getCurrentMapWithArrowsCanvas(stat: Stat, actions?: Action[]): Promise<Canvas> {
        const { canvas, ctx } = startDrawing(this.width * 50, this.height * 50);
        const baseImage = await this.getCurrentMapCanvas();
        const arrowsCanvas = await this.getActionArrowsCanvas(actions || this.getStatsRoundActions(stat));
        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(arrowsCanvas, 0, 0, canvas.width, canvas.height);

        return canvas;
    }
    async getCurrentMapWithArrowsBuffer(stat: Stat): Promise<Buffer> {
        return (await this.getCurrentMapWithArrowsCanvas(stat)).toBuffer();
    }

    /** Draws actions arrows based on provided actions */
    async getActionArrowsCanvas(_actions: Action[]): Promise<Canvas> {
        const actions = _actions.map((_a: Action, _index: number) => {
            _a.priority = _index + 1;
            return _a;
        });
        const canvas = new Canvas(this.width * 50, this.height * 50);
        const ctx = canvas.getContext("2d");

        const style: RGBA = {
            r: 0,
            g: 0,
            b: 0,
            alpha: 1
        };
        ctx.fillStyle = stringifyRGBA(style);
        ctx.strokeStyle = stringifyRGBA(style);

        /**
         * @param _aA 
         * @param _fromBattleCoord 
         * @param _toBattleCoord 
         * @param minorPrio 
         * @param _width 
         * @param _offset default: half of this.pixelsPerTile
         */
        const drawAttackAction = async (_aA: AttackAction, _fromBattleCoord: Coordinate, _toBattleCoord: Coordinate, _width: number = 5, _offset: Coordinate = {
            x: 0,
            y: 0
        }) => {
            log("Drawing attack action...")
            debug("\tfromCoord", { x: _fromBattleCoord.x, y: _fromBattleCoord.y });
            debug("\ttoCoord", { x: _toBattleCoord.x, y: _toBattleCoord.y });
            
            ctx.save();

            style.r = 255;
            style.g = 0;
            style.b = 0;
            ctx.strokeStyle = stringifyRGBA(normaliseRGBA(style));

            // draw tracing path
            const victimWithinDistance = checkWithinDistance(_aA.weapon, getDistance(_aA.from, _aA.affected));
            ctx.beginPath();
            ctx.strokeStyle = victimWithinDistance ?
                "red" :
                "black";
            ctx.lineWidth = _width;
            const fromCanvasCoord = this.getCanvasCoordsFromBattleCoord(_fromBattleCoord);
            ctx.moveTo(fromCanvasCoord.x + _offset.x, fromCanvasCoord.y + _offset.y);

            const toCanvasCoord = this.getCanvasCoordsFromBattleCoord(_toBattleCoord);
            ctx.lineTo(toCanvasCoord.x + _offset.x, toCanvasCoord.y + _offset.y);
            ctx.stroke();
            ctx.closePath();

            // draw hit
            if (victimWithinDistance) {
                const hitImage = _aA.weapon.targetting.target === WeaponTarget.ally?
                    await getFileImage('./images/Shield.png'):
                    await getFileImage('./images/Hit.png');
                const imageWidth = this.pixelsPerTile * (0.7 * _width / (this.pixelsPerTile / 3));
                const imageHeight = this.pixelsPerTile * (0.7 * _width / (this.pixelsPerTile / 3));
                ctx.drawImage(
                    hitImage,
                    toCanvasCoord.x + _offset.x - (imageWidth / 2),
                    toCanvasCoord.y + _offset.y - (imageHeight / 2),
                    imageWidth,
                    imageHeight
                );
            }

            // priority text
            const textCanvasCoordinate = this.getCanvasCoordsFromBattleCoord({
                x: (_fromBattleCoord.x + _toBattleCoord.x) / 2,
                y: (_fromBattleCoord.y + _toBattleCoord.y) / 2
            });
            const x = _toBattleCoord.x - _fromBattleCoord.x;
            const y = _toBattleCoord.y - _fromBattleCoord.y;
            const angle = Math.atan2(y,x);
            drawText(
                ctx,
                `${_aA.priority}`,
                this.pixelsPerTile / 3,
                {
                    x: textCanvasCoordinate.x + _offset.x,
                    y: textCanvasCoordinate.y + _offset.y,
                },
                -1 * angle
            );

            ctx.restore();
        }
        const drawMoveAction = (_mA: MoveAction, _fromBattleCoord: Coordinate, _toBattleCoord: Coordinate, _width: number = 5, _offsetCanvas: Coordinate = {
            x: 0,
            y: 0
        }) => {
            ctx.save();

            style.r = 0;
            style.g = 0;
            style.b = 0;
            ctx.strokeStyle = stringifyRGBA(normaliseRGBA(style));

            log(`Drawing move action: (${_fromBattleCoord.x},${_fromBattleCoord.y})=>(${_toBattleCoord.x},${_toBattleCoord.y}) (width:${_width})(offset x:${_offsetCanvas.x} y:${_offsetCanvas.y})`)
            ctx.lineWidth = _width;

            // get position before move
            const beforeCanvasCoord = this.getCanvasCoordsFromBattleCoord(_fromBattleCoord);
            ctx.beginPath();
            ctx.moveTo(beforeCanvasCoord.x, beforeCanvasCoord.y);

            // draw a line to the coord after move action
            const afterCanvasCoord = this.getCanvasCoordsFromBattleCoord(_toBattleCoord);
            ctx.lineTo(afterCanvasCoord.x, afterCanvasCoord.y);
            ctx.stroke();
            ctx.closePath();

            // draw circle
            const arrivingCanvasCoord = _mA.executed?
                beforeCanvasCoord:
                afterCanvasCoord;
            drawCircle(ctx, arrivingCanvasCoord, this.pixelsPerTile / 5, false);

            // priority text
            const middleCanvasCoord = {
                x: (beforeCanvasCoord.x + afterCanvasCoord.x) / 2,
                y: (beforeCanvasCoord.y + afterCanvasCoord.y) / 2,
            };
            drawText(
                ctx,
                `${_mA.priority}`,
                this.pixelsPerTile / 3,
                {
                    x: middleCanvasCoord.x + _offsetCanvas.x,
                    y: middleCanvasCoord.y + _offsetCanvas.x,
                }
            );
            ctx.restore();
        }

        const appendGraph = (action: Action, from: Coordinate, to: Coordinate, _iVal: number) => {
            const fromNode = new hNode<number>(from, _iVal);
            const toNode = new hNode<number>(to, _iVal);
            graph.connectNodes(fromNode, toNode, action);
        }

        const virtualCoordsMap = new Map<number, Coordinate>();
        const graph = new hGraph<number, Action>(true);
        
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const attackerIndex = action.from.index;
            const victimIndex = action.affected.index;
            if (!virtualCoordsMap.has(victimIndex)) {
                virtualCoordsMap.set(victimIndex, { x: action.affected.x, y: action.affected.y });
            }
            if (!virtualCoordsMap.has(attackerIndex)) {
                virtualCoordsMap.set(attackerIndex, { x: action.from.x, y: action.from.y });
            }
            const victim_beforeCoords = virtualCoordsMap.get(victimIndex)!;
            const attacker_beforeCoords = virtualCoordsMap.get(attackerIndex)!;

            await dealWithAction(action,
                async (aA: AttackAction) => {
                    const weapon = aA.weapon;
                    switch (weapon.targetting.AOE) {
                        case "self":
                        case "single":
                        case "touch":
                            appendGraph(aA, attacker_beforeCoords, victim_beforeCoords, i+1);
                            break;

                        case "circle":
                        case "selfCircle":
                            // coordinate is either 
                            const epicenterCoord = weapon.targetting.AOE === "circle" ?
                                aA.coordinate:
                                victim_beforeCoords;
                            const affecteds = this.findEntities_radius(
                                getNewObject(epicenterCoord, {index: victimIndex}), // assign victim
                                weapon.Range[2],
                                weapon.targetting.AOE === "circle"); // if circle: damages epicenter as well

                            for (let i = 0; i < affecteds.length; i++) {
                                const af = affecteds[i];
                                // ** technically from "action.from", but for the sake of visual effects, the epicenter
                                // coords will be fed instead.
                                const singleTarget: AttackAction = getNewObject(aA, { from: epicenterCoord, affected: af });
                                appendGraph(singleTarget, epicenterCoord, af, i+1);
                            }
                            if (weapon.targetting.AOE === "circle") {
                                // show AOE throw trajectory
                                appendGraph(aA, attacker_beforeCoords, epicenterCoord, i+1);
                            }

                            // draw explosion range
                            for (const coord of getCoordsWithinRadius(weapon.Range[2], epicenterCoord, true)) {
                                this.drawSquareOnBattleCoords(ctx, coord, {
                                    r: 255,
                                    b: 0,
                                    g: 0,
                                    alpha: 0.3
                                });
                            }
                            break;

                        case "line":
                            throw new Error("Line-drawing not implemented");
                            break;
                    }
                },
                (mA: MoveAction) => {
                    const beforeBattleCoord = getNewObject(victim_beforeCoords);
                    // log(`BeforeBattleCoord: ${beforeBattleCoord.x}, ${beforeBattleCoord.y}`);

                    victim_beforeCoords[mA.axis] += mA.magnitude * Math.pow(-1, Number(mA.executed));
                    // log(`Action: ${mA.magnitude} (${mA.executed})`);
                    
                    const afterBattleCoord = getNewObject(victim_beforeCoords);
                    // log(`AfterBattleCoord: ${afterBattleCoord.x}, ${afterBattleCoord.y}`);

                    // connect to graph
                    // drawMoveAction(beforeBattleCoord, afterBattleCoord, i+1);
                    appendGraph(mA, beforeBattleCoord, afterBattleCoord, i+1);
                }
            );
        }
        
        for (const [key, value] of graph.adjGraph.entries()) {
            // log(`Node ${key}`);
            const solidColumns = clamp(value.length, 0, 10);
            const columns = 2 * solidColumns + 1;
            const columnWidth = Math.floor(this.pixelsPerTile / columns);
            for (let o = 1; o <= columns; o++) {
                const widthStart = (o-1) * columnWidth;
                const widthEnd = widthStart + columnWidth;
                /**
                 * eg:
                 * columnWidth: 5
                 * 0th pixel =>   ||==========|| <= 5th pixel
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 *                [-==========-][-==========-]
                 */

                // is solid column
                if (o % 2 === 0) {
                    // log(`Solid edge #${o/2}`);
                    const edgeIndex = (o / 2) - 1;
                    const edge = value[edgeIndex]; // edge.print();
                    const connectingAction = edge.weight;

                    const isXtransition = edge.from.position.x !== edge.to.position.x; // change y
                    const isYtransition = edge.from.position.y !== edge.to.position.y; // change x

                    if (connectingAction.type === "Attack") {
                        drawAttackAction(
                            connectingAction as AttackAction,
                            edge.from.position,
                            edge.to.position,
                            columnWidth,
                            {
                                x: isYtransition?
                                    ((widthEnd + widthStart)/2) - (this.pixelsPerTile/2):
                                    0,
                                y: isXtransition?
                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2):
                                    0,
                            }
                        );
                    }
                    else if (connectingAction.type === "Move") {
                        drawMoveAction(
                            connectingAction as MoveAction,
                            edge.from.position,
                            edge.to.position,
                            columnWidth,
                            {
                                x: isYtransition ?
                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                    0,
                                y: isXtransition ?
                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                    0,
                            }
                        );
                    }
                }
                // is gap column
                else {
                    // log(`Gap edge #${o / 2}`);
                }
            }
        }

        return canvas;
    }
    async getActionArrowsBuffer(actions: Action[]): Promise<Buffer> {
        return (await this.getActionArrowsCanvas(actions)).toBuffer();
    }

    drawHealthArcs(_canvas: Canvas) {
        const ctx = _canvas.getContext('2d');

        ctx.save();

        ctx.lineWidth = 3;
        const allStats = this.allStats();
        for (let i = 0; i < allStats.length; i++) {
            const stat = allStats[i];

            // attach health arc
            const healthPercentage = clamp(stat.HP / stat.base.AHP, 0, 1);
            ctx.strokeStyle = stringifyRGBA({
                r: 255 * Number(stat.team === "enemy"),
                g: 255 * Number(stat.team === "player"),
                b: 0,
                alpha: 1
            });
            const canvasCoord = this.getCanvasCoordsFromBattleCoord(stat);
            drawCircle(
                ctx,
                {
                    x: canvasCoord.x,
                    y: canvasCoord.y
                },
                this.pixelsPerTile / 2,
                true,
                healthPercentage
            );
        }

        ctx.restore();
    }
    drawIndexi(_canvas: Canvas) {
        const ctx = _canvas.getContext('2d');

        const allStats = this.allStats();
        for (let i = 0; i < allStats.length; i++) {
            const stat = allStats[i];
            const canvasCoord = this.getCanvasCoordsFromBattleCoord(stat, false);

            // attach index
            drawCircle(
                ctx,
                {
                    x: canvasCoord.x + this.pixelsPerTile * 9 / 10,
                    y: canvasCoord.y + this.pixelsPerTile * 1 / 5,
                },
                this.pixelsPerTile / 6,
                false
            );
            drawText(
                ctx,
                `${stat.index}`,
                this.pixelsPerTile / 3,
                {
                    x: canvasCoord.x + this.pixelsPerTile * 9 / 10,
                    y: canvasCoord.y + this.pixelsPerTile * 1 / 5,
                }
            );
        }
    }

    async getFullPlayerEmbedMessageOptions(stat: Stat, actions?: Array<Action>): Promise<MessageOptions> {
        // log("actions",actions);
        const mapCanvas = await this.getCurrentMapWithArrowsCanvas(stat, actions);
        const map: Buffer = mapCanvas.toBuffer();

        const frameImage: Image = await getFileImage('images/frame.png');
        const characterBaseImage: Image = await getFileImage(stat.base.iconURL);
        const { canvas, ctx } = startDrawing(frameImage.width * 3, frameImage.height * 3);
        ctx.drawImage(characterBaseImage, 20, 20, canvas.width - 40, canvas.height - 40);
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center";
        ctx.font = '90px serif';
        
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        
        ctx.fillText(stat.base.class, canvas.width / 2, canvas.height * 0.95);
        ctx.strokeText(stat.base.class, canvas.width / 2, canvas.height * 0.95);

        const embed = await this.getFullPlayerEmbed(stat);
        // sendToSandbox({ files: [{ attachment: map, name: `map.png`},] });
        return {
            embeds: [embed],
            files: [
                { attachment: map, name: "map.png" },
                { attachment: canvas.toBuffer(), name: "thumbnail.png" }
            ]
        };
    }
    async getFullPlayerEmbed(stat: Stat): Promise<MessageEmbed> {
        const HP = (stat.HP / getAHP(stat)) * 50;
        const HealthBar = `${'`'}${addHPBar(50, HP)}${'`'}`;
        const ReadinessBar = `${'`'}${addHPBar(50, stat.readiness)}${'`'}`;
        const explorerEmbed = new MessageEmbed({
            title: HealthBar,
            description:
                `*Readiness* (${Math.round(stat.readiness)}/50)
                ${ReadinessBar}`,
            fields: [
                {
                    name: `(${stat.sword}/3)`,
                    value: "🗡️".repeat(stat.sword > 0 ? stat.sword : 0) || '❎',
                    inline: true,
                },
                {
                    name: `(${stat.shield}/3)`,
                    value: "🛡️".repeat(stat.shield > 0 ? stat.shield : 0) || '❎',
                    inline: true,
                },
                {
                    name: `(${stat.sprint}/3)`,
                    value: "👢".repeat(stat.sprint > 0 ? stat.sprint : 0) || '❎',
                    inline: true,
                },
            ]
        });

        // thumbnail
        explorerEmbed.setThumbnail("attachment://thumbnail.png")

        // dealing with map
        explorerEmbed.setImage(`attachment://map.png`);

        // embed color to HP
        let green = (Math.round((stat.HP) * (255 / getAHP(stat)))).toString(16);
        let red = (255 - Math.round((stat.HP) * (255 / getAHP(stat)))).toString(16);
        if (red.length === 1) red = "0" + red;
        if (green.length === 1) green = "0" + green;
        const num = `0x${red}${green}00`;
        explorerEmbed.color = parseInt(num, 16);

        return explorerEmbed;
    }

    // find entities
    findEntity_args(_args: Array<string>, _attacker: Stat, _weapon?: Weapon): Stat | null {
        const allStats = this.allStats();
        const ignore: Team[] = ["block"];
        const targetNotInIgnore = (c:Stat) => c.team && !ignore.includes(c.team);
        if (_weapon && _weapon.targetting.target === WeaponTarget.enemy) ignore.push("player");
        if (_weapon && _weapon.targetting.target === WeaponTarget.ally) ignore.push("enemy");

        // 0. self target
        if (_weapon && (_weapon.targetting.AOE === "selfCircle" || _weapon.targetting.AOE === "self")) {
            return allStats.find(s => s.index === _attacker.index) || null;
        }

        // 1. attack through the name
        const targetName = _args[0];
        const nameTarget = allStats.find(c => {
            return c.index === parseInt(targetName) && targetNotInIgnore(c);
        });

        // 2. attack through direction
        const translateDir = {
            "left": {
                axis : "x",
                dir: -1,
            },
            "right": {
                axis: "x",
                dir: 1,
            },
            "up": {
                axis: "y",
                dir: 1,
            },
            "down": {
                axis: "y",
                dir: -1,
            },
        };
        const direction: Direction = _args[0] as Direction;
        const axisDirection = translateDir[direction];
        let directionTarget = undefined;
        if (axisDirection !== undefined) {
            const axis: 'x' | 'y' = axisDirection.axis as ('x' | 'y');
            const dir = axisDirection.dir;
            directionTarget = this.findEntity_closestInAxis(_attacker, axis, 12 * dir, ignore);
        }

        // 3. attack through coordinates
        const x = parseInt(_args[0]);
        const y = parseInt(_args[1]);
        const coordTarget = (x + y) ? (allStats.find(c => c.x === x && c.y === y && targetNotInIgnore(c))) : null;

        // 4. attack closest
        const closestTarget = this.findEntity_closest(_attacker, ignore);

        return directionTarget || coordTarget || nameTarget || closestTarget;
    }
    findEntity_closestInAxis(_attacker: Stat, axis: 'x' | 'y', magnitude: number, ignore: Team[] = []): Stat | null {
        const obstacles = this.findEntities_allInAxis(_attacker, axis, magnitude, ignore);

        if (obstacles[0]) {
            const result = obstacles.reduce((closest, ob) => {
                const newMag = getDistance(_attacker, ob);
                return newMag < getDistance(_attacker, closest) ? ob : closest;
            }, obstacles[0]);
            return result;
        }
        else
        {
            return null;
        }
    }
    findEntity_closest(_attacker: Stat, ignore: Team[] = ["block"]): Stat | null {
        const allStats = this.allStats();
        let closestDistance = 100;
        const closestR = allStats.reduce((closest: Stat | null, s: Stat) => {
            if (closest !== null && closest.index === s.index) return s;

            const newDistance = getDistance(s, _attacker);

            // fail cases
            const selfTargettingIgnored = s.index === _attacker.index;
            const ignored = s.team && ignore.includes(s.team);
            const targetIsDead = s.HP <= 0;
            if (selfTargettingIgnored || ignored || targetIsDead) {
                return closest;
            }

            return closestDistance > newDistance ? s : closest;
        }, null);
        return closestR;
    }
    findEntity_index(_i: number): Stat | undefined {
        return this.allStats().find(s => (
            s.index === _i
        ));
    }
    findEntities_allInAxis(_attacker: Stat, _axis: 'x' | 'y', magnitude: number, ignore: Team[] = []): Array<Stat> {
        const allStats = this.allStats();

        if (magnitude === 0) return [];
        const cAxis = counterAxis(_axis);
        const result = allStats.filter(s => {
            if (s.team && ignore.includes(s.team)) return false;

            const checkNeg = s[_axis] >= _attacker[_axis] + magnitude && s[_axis] < _attacker[_axis];
            const checkPos = s[_axis] <= _attacker[_axis] + magnitude && s[_axis] > _attacker[_axis];

            // check negative if magnitude is negative. else, check positive axis
            const conditionOne = (Math.sign(magnitude) == -1) ? checkNeg : checkPos;
            return (s[cAxis] === _attacker[cAxis] && getDistance(_attacker, s) !== 0 && conditionOne);
        });
        return result;
    }
    findEntities_radius(_stat: Coordinate, _r: number, includeSelf: boolean = false, ignore: Array<Team> = ["block"]): Array<Stat> {
        // console.log(_stat, radius, includeSelf, ignore); 
        
        const targetNotInIgnore = (c: Stat) => c.team && !ignore.includes(c.team);
        const stat = _stat as Stat;
        
        return this.allStats().filter(s => {
            return (s.index !== stat.index || (typeof stat.index === 'number' && includeSelf))&&
                targetNotInIgnore(s)&&
                Math.sqrt(Math.pow((s.x - stat.x), 2) + Math.pow((s.y - stat.y), 2)) <= _r;
        });
    }
    findEntities_inLine(_x1: Coordinate, _x2: Coordinate): Stat[] {
        const dx = _x2.x - _x1.x;
        const dy = _x2.y - _x1.y;
        const coordDiff = getCompass(_x1, _x2);
        const slope = dy/dx;
        return this.allStats().filter(s => {
            const x = s.x - _x1.x;

            const coordDiff_this = getCompass(_x1, s);

            const lineLength = getPyTheorem(dx, dy);
            const isWithinDistance = lineLength >= getDistance(_x1, s);

            const withinSlopeA = (s.y === (_x1.y + Math.floor(slope * x))) || (s.y === (_x1.y + Math.ceil(slope * x)));
            const isVertSlope = (Math.abs(slope) === Infinity) || (s.x === _x1.x);

            return coordDiff.x === coordDiff_this.x && coordDiff.y === coordDiff_this.y && isWithinDistance && (withinSlopeA || isVertSlope);
        });
    }

    // validation
    validateTarget(_attacker: Stat, _weapon: Weapon, _target: Stat): TargetingError | null;
    validateTarget(_aA: AttackAction, _?: null, __?: null): TargetingError | null;
    validateTarget(_stat_aa: Stat | AttackAction, _weapon_null?: Weapon | null, _target_null?: Stat | null): TargetingError | null {
        const eM: TargetingError = {
            reason: "",
            value: null,
        };

        let attackerStat, targetStat, weapon;
        if ((_stat_aa as Stat).index === undefined) // is aa
        {
            const aa = _stat_aa as AttackAction;
            attackerStat = aa.from;
            targetStat = aa.affected;
            weapon = aa.weapon;
        }
        else { // is stat
            attackerStat = _stat_aa as Stat;
            targetStat = _target_null as Stat;
            weapon = _weapon_null as Weapon;
        }

        // ~~~~~~ UNIVERSAL ~~~~~~ //
        // undefined target
        if (!targetStat) {
            eM.reason = "No target detected.";
            return eM;
        }
        // undefined attacker
        if (!attackerStat) {
            eM.reason = "No attacker detected.";
            return eM;
        }
        // undefined weapon
        if (!weapon) {
            eM.reason = "No weapon detected.";
            return eM;
        }
        // attacker is dead
        if (attackerStat.HP <= 0) {
            eM.reason = "Attacker perished.";
            return eM;
        }
        // targetting a teammate without pvp on
        if (attackerStat.team === targetStat.team && (!targetStat.pvp || !attackerStat.pvp)) {
            eM.reason = "Attempted to attack a teammate without pvp on.";
            return eM;
        }

        // readiness
        if (attackerStat.readiness < 0) {
            eM.reason = "Not enough readiness.";
            eM.value = attackerStat.readiness;
            return eM;
        }

        // tokens
        if (attackerStat.sword < weapon.sword) {
            eM.reason = "Not enough Sword (🗡️) tokens.";
            eM.value = attackerStat.sword;
            return eM;

        }
        if (attackerStat.shield < weapon.shield) {
            eM.reason = "Not enough Shield (🛡️) tokens.";
            eM.value = attackerStat.shield;
            return eM;

        }
        if (attackerStat.sprint < weapon.sprint) {
            eM.reason = "Not enough Sprint (👢) tokens.";
            eM.value = attackerStat.sprint;
            return eM;

        }

        // weapon uses
        if (weapon.UPT < getWeaponUses(weapon, attackerStat)) {
            eM.reason = `You can only use this ability ${weapon.UPT} time(s) per turn.`;
            eM.value = getWeaponUses(weapon, attackerStat);
            log(weapon, attackerStat, getWeaponUses(weapon, attackerStat));
            return eM;
        }

        // weird stats
        if (targetStat.team !== "block" && (targetStat.base.Prot === undefined || targetStat.HP === undefined)) {
            eM.reason = `Target "${targetStat.base.class}" cannot be attacked.`;
            return eM;
        }

        // target is a block
        if (targetStat.team === "block") {
            eM.reason = `Target "${targetStat.base.class}" is a wall.`;
            return eM;
        }

        // only valid errors if weapon is not a self-target
        if (weapon.targetting.AOE !== "selfCircle" && weapon.targetting.AOE !== "self" && weapon.targetting.AOE !== "touch") {
            // out of range
            if (getDistance(attackerStat, targetStat) > weapon.Range[1] || getDistance(attackerStat, targetStat) < weapon.Range[0]) {
                eM.reason = "Target is too far or too close.";
                eM.value = roundToDecimalPlace(getDistance(attackerStat, targetStat), 1);
                return eM;
            }

            // invalid self-targeting
            if (weapon.Range[0] !== 0 && targetStat.index === attackerStat.index) {
                eM.reason = "Cannot target self.";
                return eM;
            }
        }
        
        return null;
    }
    validateMovement(moverStat: Stat, _mA: MoveAction | null): MovingError | null {
        let movingError: MovingError | null = null;
        const coord = {
            x: moverStat.x + Number(_mA?.axis === 'x') * Number(_mA?.magnitude),
            y: moverStat.y + Number(_mA?.axis === 'y') * Number(_mA?.magnitude)
        };

        if (_mA === null) {
            movingError = {
                reason: "FATAL ERROR! Null pointer detected! Contact a mod!",
                value: 0
            };
        }
        else if (moverStat.moved && moverStat.sprint <= 0) {
            movingError = {
                reason: "You have already moved this turn and you have no 'Sprint' tokens.",
                value: moverStat.sprint
            };
        }
        else if (moverStat.base.maxMove < _mA.magnitude) {
            movingError = {
                reason: "Movement exceeding character limits.",
                value: moverStat.base.maxMove
            };
        }
        else if (!this.checkWithinWorld(coord)) {
            movingError = {
                reason: "Movement is escaping the bounds of the battlefield.",
                value: coord.x + coord.y * Math.pow(10, -1)
            };
        }
        else if (Math.abs(_mA.magnitude) < 1) {
            movingError = {
                reason: "Movement magnitude most be at least 1 (or -1).",
                value: _mA.magnitude
            };
        }
        else if (moverStat.HP <= 0) {
            movingError = {
                reason: "Mover perished.",
                value: moverStat.HP
            };
        }

        return movingError;
    }

    // dealing with death
    handleDeath(s: Stat) {
        if (s.botType === BotType.naught) {
            const payload: MessageOptions = { embeds: [getDeathEmbed()] };
            this.sendToCommand(s.owner, payload);
        } else {
            this.CSMap.delete(getCoordString(s));
            this.totalEnemyCount--;
            this.enemyCount--;
        }
        this.allIndex.delete(s.index!);
    }
    checkDeath(allStats = this.allStats(true)) {
        let deathCount = 0;
        for (const deadPerson of allStats.filter(p => p.HP <= 0)) {
            deathCount++;
            this.handleDeath(deadPerson);
            if (deadPerson.team === "player") this.playerCount--;
            else if (deadPerson.team === "enemy") this.enemyCount--;
        }
        return deathCount;
    }

    // Path-finding
    startPathFinding(start: Coordinate, end: Coordinate, limit = Number.POSITIVE_INFINITY): Coordinate[] {
        // initialize
        const AINodeMap = new Map<string, AINode>();
        const nodePriorQueue = new MinHeap<AINode>(n => n?.totalC || null);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const coordString = getCoordString({ x: x, y: y });
                if (!this.CSMap.has(coordString) || start.x === x && start.y === y) {
                    const node = getNewNode(x, y, end, Number.POSITIVE_INFINITY);
                    AINodeMap.set(coordString, node);
                    nodePriorQueue.insert(node);
                }
            }
        }
        const startAINode = AINodeMap.get(getCoordString(start))!;
        startAINode.disC = 0;
        startAINode.totalC = startAINode.desC;

        // 
        const results = [];
        let AINode = nodePriorQueue.remove();
        const ax = [1, -1, 0, 0];
        const ay = [0, 0, 1, -1];
        while (AINode && (AINode.x !== end.x || AINode.y !== end.y)) {
            // log(`spreading @ ${AINode.x} and @ ${AINode.y}`)
            for (let i = 0; i < 4; i++) {
                const coordString = getCoordString({ x: AINode.x + ax[i], y: AINode.y + ay[i] });
                if (AINodeMap.has(coordString)) {
                    const node = AINodeMap.get(coordString)!;
                    if (AINode.disC + 1 <= limit && node.totalC > AINode.disC + 1 + node.desC) {
                        node.disC = AINode.disC + 1;
                        node.totalC = node.desC + node.disC;
                        node.lastNode = AINode;
                        AINode.nextNode = node;
                    }
                }
            }
            if (AINode.disC <= limit) results.push(AINode);
            AINode = nodePriorQueue.remove();
        }

        // deal with the result
        const fullPath: Coordinate[] = [];
        if (!AINode) {
            AINode = results.reduce((lvN, n) => {
                return n.desC < lvN.desC?
                    n :
                    lvN;
            }, results[0]);
            // log(AINode);
        }

        while (AINode) {
            const coord = { x: AINode.x, y: AINode.y };
            fullPath.unshift(coord);
            AINode = AINode.lastNode;
        }

        return fullPath;
    }
    getMoveActionListFromCoordArray(rstat: Stat, path: Coordinate[]): Array<MoveAction> {
        const moveActions: MoveAction[] = [];

        let i = 1;
        let lastCoord: Coordinate = path[0];
        let lastAxisChange: Vector2 = { x: 9, y: 9 };
        while (path[i]) {
            // get the Vector2 difference between last travelled coordinate and this coordinate
            const thisCompass: Vector2 = getCompass(lastCoord, path[i]);

            // if (lastAxisChange.x !== thisCompass.x || lastAxisChange.y !== thisCompass.y) {
                // append new moveAction
                const axis = (thisCompass.x !== 0) ? "x" : "y";
                const realStat = this.allStats(true).find(s => s.index === rstat.index)!;
                const moveAction: MoveAction | null = getMoveAction(realStat, thisCompass[axis], moveActions.length + 1, axis);
                if (moveAction !== null) {
                    moveActions.push(moveAction);
                }

            //     lastAxisChange = thisCompass;
            // }
            // else {
            //     // increase magnitude of last moveAction
            //     const lastAction: MoveAction = getLastElement(moveActions);
            //     lastAction.magnitude += Math.sign(lastAction.magnitude);
            // }

            lastCoord = path[i];
            i++;
        }

        return moveActions;
    }

    // status function
    removeStatus(_status: StatusEffect) {
        const owner = _status.affected;
        const index = owner.statusEffects.indexOf(_status);
        if (index !== -1) {
            owner.statusEffects.splice(index);
        }
    }
    removeBuffStatus(_s: Stat, _value: number, _buffType: Buff) {
        // check if current buff is equal to value
        if (_s.buffs[_buffType] === _value) {
            // if true, check if there are other buffs that is giving the same buff
            const otherSameTypeBuffs = this.getStatus(_s, getBuffStatusEffect(_buffType));
            if (!otherSameTypeBuffs.find(_se => _se.value === _value)) {
                // if no other buff is the same, reset buff
                _s.buffs[_buffType] = 0;

                // find other buffs that give the same type of buff
                if (otherSameTypeBuffs.length > 0) {
                    const largestBuff = getLargestInArray(otherSameTypeBuffs, _se => _se.value);
                    _s.buffs[_buffType] = largestBuff!.value;
                }
            }
            else {
                // if yes, ignore
            }
        }
        else {
            // is not 5, buff is most probably more than 5. Ignore.
        }
    }
    getStatus(_stat: Stat, _type: StatusEffectType) {
        return _stat.statusEffects.filter(_s => _s.type === _type);
    }
}