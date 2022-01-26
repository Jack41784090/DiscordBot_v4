import { ButtonInteraction, CategoryChannel, Client, EmbedFieldData, Guild, Message, MessageButtonOptions, MessageCollector, MessageEmbed, MessageOptions, MessageSelectMenu, MessageSelectOptionData, OverwriteData, SelectMenuInteraction, TextChannel, User } from "discord.js";
import { addHPBar, clearChannel, counterAxis, extractCommands, findLongArm, getAHP, getDirection, getSpd, getCompass, log, newWeapon, random, returnGridCanvas, roundToDecimalPlace, checkWithinDistance, average, getAcc, getDodge, getCrit, getDamage, getProt, getLifesteal, arrayGetLastElement, dealWithAccolade, getWeaponUses, getCoordString, getMapFromCS, getBaseClassStat, getStat, getWeaponIndex, getNewObject, startDrawing, dealWithAction, getDeathEmbed, getSelectMenuActionRow, setUpInteractionCollect, arrayGetLargestInArray, getCoordsWithinRadius, getPyTheorem, dealWithUndoAction, HandleTokens, getNewNode, getDistance, getMoveAction, debug, getAttackAction, normaliseRGBA, clamp, stringifyRGBA, shortenString, drawText, drawCircle, getBuffStatusEffect, getCanvasCoordsFromBattleCoord, getButtonsActionRow, arrayRemoveItemArray, findEqualCoordinate, directionToMagnitudeAxis, formalise, getGradeTag } from "./Utility";
import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { getFileImage, getIcon, getUserData, getUserWelfare, saveUserData, setUserWelfare } from "./Database";
import enemiesData from "../data/enemiesData.json";
import globalWeaponsData from "../data/universalWeaponsData.json";

import fs from 'fs';
import { Action, AINode, AttackAction, BaseStat, BotType, ClashResult, ClashResultFate, Class, Coordinate, Direction, EnemyClass, MapData, MoveAction, MovingError, OwnerID, Round, RGBA, Stat, TargetingError, Team, Vector2, Weapon, WeaponTarget, StatusEffectType, Buff, EMOJI_TICK, EMOJI_CROSS, UserData, StartBattleOptions, VirtualStat, PossibleAttackInfo, EMOJI_SHIELD, EMOJI_SWORD, WeaponName, UniversalWeaponName, NumericDirection, PathFindMethod as PathfindMethod, Loot, MaterialQualityInfo } from "../typedef";
import { hGraph, hNode } from "./hGraphTheory";
import { WeaponEffect } from "./WeaponEffect";
import { StatusEffect } from "./StatusEffect";
import { BattleManager } from "./BattleManager";
import { AI } from "./AI";
import { BotClient } from "..";
import { Item } from "./Item";

export class Battle {
    static readonly MOVE_READINESS = 10;

    // Discord-related Information
    author: User;
    message: Message;
    channel: TextChannel;
    client: Client;
    guild: Guild;
    party: OwnerID[];

    // Map-related Information
    mapData: MapData;
    width: number;
    height: number;
    pixelsPerTile: number;
    CSMap: Map<string, Stat>;
    LootMap: Map<string, Array<Loot>>;

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
    userDataCache: Map<OwnerID, UserData>;

    // gamemode
    pvp: boolean;

    private constructor(_mapData: MapData, _author: User, _message: Message, _client: Client, _pvp: boolean, _party: OwnerID[]) {
        this.author = _author;
        this.message = _message;
        this.channel = _message.channel as TextChannel;
        this.client = _client;
        this.guild = _message.guild as Guild;
        this.party = _party;
        this.userDataCache = new Map<OwnerID, UserData>();

        this.mapData = _mapData;
        this.width = _mapData.map.width;
        this.height = _mapData.map.height;
        this.CSMap = getMapFromCS(_mapData.map.coordStat);
        this.LootMap = new Map<string, Array<Loot>>();

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

    /** Generate a Battle but does not start it */
    static async Generate(_mapData: MapData, _author: User, _message: Message, _party: Array<OwnerID>, _client: Client, _pvp = false) {
        const battle = new Battle(_mapData, _author, _message, _client, _pvp, _party);

        // initiate users
        for (let i = 0; i < _party.length; i++) {
            // add to spawn queue
            const ownerID = _party[i];
            const userData: UserData = await getUserData(ownerID);
            const blankStat = getStat(getBaseClassStat(userData.equippedClass), ownerID);
            if (_pvp) {
                blankStat.pvp = true;
            }
            battle.tobespawnedArray.push(blankStat);

            // initiate cache
            const user: User | null = await BotClient.users.fetch(ownerID).catch(() => null);
            battle.userDataCache.set(ownerID, userData);
            if (user) {
                battle.userCache.set(ownerID, user);
            }

            // add universal weapons
            for (let i = 0; i < Object.keys(globalWeaponsData).length; i++) {
                const universalWeaponName: keyof typeof globalWeaponsData = Object.keys(globalWeaponsData)[i] as keyof typeof globalWeaponsData;
                const uniWeapon: Weapon = getNewObject(globalWeaponsData[universalWeaponName] as Weapon);
                log("Pushing universal weapon " + universalWeaponName + " into the arsenal of " + `${blankStat.base.class} (${blankStat.index})`)
                blankStat.base.weapons.push(uniWeapon);
            }
        }

        // add enemies to the spawning list, only valid if battle is not pvp
        if (!_pvp) {
            for (const [key, value] of Object.entries(_mapData.enemiesInfo)) {
                const Eclass = key as EnemyClass;
                const mod = { name: `${Eclass}` };
                const enemyBase: BaseStat = getNewObject(enemiesData[Eclass], mod) as BaseStat;
                const spawnCount = random(value.min, value.max);

                for (let i = 0; i < spawnCount; i++) {
                    const enemyEntity: Stat = getStat(enemyBase);
                    
                    // randomly spawn in loot
                    enemyEntity.base.lootInfo.forEach(_LInfo => {
                        // roll for spawn item
                        const roll = Math.random();
                        if (roll < _LInfo.chance) {
                            // initialise if haven't yet
                            if (enemyEntity.drops === undefined) {
                                enemyEntity.drops = {
                                    items: [],
                                    money: 0,
                                    droppedBy: enemyEntity
                                }
                            }

                            // spawn in item
                            const weight = random(_LInfo.weightDeviation.min + Number.EPSILON, _LInfo.weightDeviation.max + Number.EPSILON);
                            enemyEntity.drops.items.push(new Item(_LInfo.materials, weight, _LInfo.itemName));
                        }
                    });

                    battle.tobespawnedArray.push(enemyEntity);
                    battle.totalEnemyCount++;
                    battle.enemyCount++;
                }
            }
        }

        // attach ongoing battle to Manager
        BattleManager.Manager.set(_author.id, battle);
        return battle;
    }

    /** Main function to access in order to start a thread of battle */
    static async Start(_mapData: MapData, _author: User, _message: Message, _party: Array<OwnerID>, _client: Client, _pvp = false) {
        const battle = await Battle.Generate(_mapData, _author, _message, _party, _client, _pvp);
        battle.StartRound();
    }

    /** An alternative to Start when the battle is already initiated. Gives additional options to begin. */
    async StartBattle(_options: StartBattleOptions) {
        // check player welfare
        log("Checking welfare...")
        const playerStats = this.party.map(_ownerID => this.tobespawnedArray.find(_s => _s.owner === _ownerID));
        for (let i = 0; i < playerStats.length; i++) {
            const player = playerStats[i];
            if (player) {
                const welfare = await getUserWelfare(player.owner);
                debug(`\t${player.base.class}`, welfare);
                if (welfare !== null) {
                    log(`\t${player.HP} => ${player.base.AHP * clamp(welfare, 0, 1)}`)
                    player.HP = player.base.AHP * clamp(welfare, 0, 1);
                    if (welfare <= 0) {
                        this.author.send({
                            embeds: [
                                new MessageEmbed({
                                    title: "Alert!",
                                    description: `One of your teammates, ${player.base.class}, has 0 welfare and cannot attend the battle.`,
                                    footer: {
                                        text: `id: ${player.owner}`
                                    }
                                })
                            ]
                        })
                    }
                }
            }
        }

        // ambush
        if (_options.ambush && _options.ambush !== 'block') {
            const ambushingTeam: Team = _options.ambush;
            for (let i = 0; i < this.tobespawnedArray.length; i++) {
                const ambusher = this.tobespawnedArray[i];
                if (ambusher.team === ambushingTeam) {
                    ambusher.readiness = 50;
                    ambusher.sword = 3;
                    ambusher.sprint = 3;
                }
            }
        }

        return this.StartRound();
    }

    /** Begin a new round
        Recurses into another StartRound until all enemies / players are defeated (HP <= 0). */
    async StartRound(): Promise<boolean> {
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
                const token = random(0, 2);
                log(`\t${s.base.class} (${s.index}) got ${token}`)
                switch (token) {
                    case 0:
                        s.sword++;
                        break;
                    case 1:
                        s.shield++;
                        break;
                    case 2:
                        s.sprint++;
                        break;
                }
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
                log(`Player: ${realStat.base.class} (${realStat.index})`)
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
                
                if (user === null) continue;

                // get a copy of stat (main reference in player control) from the CSMap
                const virtualStat: VirtualStat = getNewObject(realStat,
                    {
                        username: user.username,
                        virtual: true
                    }
                ) as VirtualStat;
                virtualStat.weaponUses = realStat.weaponUses.map(_ => _);

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
                createdChannel.send({
                    files: [
                        { attachment: await this.getCurrentMapBuffer(), name: "map.png" }
                    ],
                    embeds: [
                        new MessageEmbed()
                            .setImage("attachment://map.png")
                    ]
                });
                // const timerMessage: Message = await createdChannel.send({ embeds: [this.getTimerEmbed(stat, timeLeft, getActionsTranslate(this.getStatActions(stat)).join(''))] });

                // listen to actions with collector
                const readingPlayerPromise = this.readActions(120, createdChannel, virtualStat, realStat).then(() => {
                    createdChannel.send({ embeds: [new MessageEmbed().setTitle("Your turn has ended.")] });
                });
                reportPromises.push(readingPlayerPromise);
            }
            //#endregion

            //#region AI
            if (realStat.botType !== BotType.naught) {
                log(`AI: ${realStat.base.class} (${realStat.index})`)
                const ai_f = new AI(realStat, realStat.botType, this);
                ai_f.activate();
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
        const latestAction = arrayGetLargestInArray(this.roundActionsArray, _a => _a.round);
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

        //#region REPORT ACTIONS
        log("Reporting...")
        const allPromise: Promise<unknown>[] = [];

        // for each player, send an embed of actions completed of the player.
        const players = allStats.filter(s => s.botType === BotType.naught);
        players.forEach(async stat => {
            const allRounds: Round[] = Array.from(this.roundSavedCanvasMap.keys());
            const greatestRoundNumber: Round | undefined = arrayGetLargestInArray(allRounds, _ => _);
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

        // check death: after player round
        this.checkDeath(allStats);

        return this.FinishRound();
    }

    async FinishRound(): Promise<boolean> {
        log("Finishing Round...");
        const PVE = this.playerCount === 0 || (this.totalEnemyCount === 0 && this.tobespawnedArray.length === 0);
        const PVP = this.playerCount === 1;
        if ((this.pvp && PVP) || (!this.pvp && PVE))
        {
            // database work
            // await Database.updateOrAddUser(author, { status: 'idle' });
            const allStats = this.allStats();
            for (let i = 0; i < this.party.length; i++) {
                const id: OwnerID = this.party[i];
                const stat: Stat = allStats[i];
                await setUserWelfare(id, clamp(stat.HP / stat.base.AHP, 0, 1));
                await saveUserData(this.userDataCache.get(id)!);
            }

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
            return this.totalEnemyCount === 0;
        }
        else {
            return this.StartRound();
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
    getAllPossibleAttacksInfo(_stat: Stat, _domain: Stat[] = this.allStats()): PossibleAttackInfo[] {
        return _stat.base.weapons.map(_w => {
            const shortestRange = _w.Range[0];
            const longestRange = _w.Range[1];
            const reachableEntities = this.findEntities_radius(_stat, longestRange, shortestRange === 0, ['block'], _domain);
            const targettedEntities = reachableEntities.filter(_s => 
                _w.targetting.target === WeaponTarget.ally?
                    _s.team === _stat.team:
                    _s.team !== _stat.team
            );

            return targettedEntities.map(_e => {
                return {
                    attacker: _stat,
                    target: _e,
                    weapon: _w,
                }
            })
        }).flat();
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
            const menuOptions: MessageSelectOptionData[] = Array.from(this.roundSavedCanvasMap.keys()).map(rn => {
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

    drawSquareOnBattleCoords(ctx: NodeCanvasRenderingContext2D, coord: Coordinate, rgba?: RGBA) {
        const canvasCoord = getCanvasCoordsFromBattleCoord(coord, this.pixelsPerTile, this.height, false);
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
    async readActions(_givenSeconds: number, _ownerTextChannel: TextChannel, _vS: VirtualStat, _rS: Stat) {
        let possibleError: string = '';
        const domain = this.allStats().map(_s =>
            _s.index === _vS.index?
                _vS:
                _s
        );
        const buttonOptions: MessageButtonOptions[] = [
            {
                label: "UP ⬆️",
                style: "PRIMARY",
                customId: "up"
            },
            {
                label: "DOWN ⬇️",
                style: "SECONDARY",
                customId: "down"
            },
            {
                label: "RIGHT ➡️",
                style: "PRIMARY",
                customId: "right"
            },
            {
                label: "LEFT ⬅️",
                style: "SECONDARY",
                customId: "left"
            },
            {
                label: "Undo",
                style: "SUCCESS",
                customId: "undo"
            },
        ];
        const returnMessageInteractionMenus = async () => {
            // all available attack options
            const selectMenuOptions: MessageSelectOptionData[] =
                this.getAllPossibleAttacksInfo(_vS, domain).map(_attackInfo => {
                    const weapon = _attackInfo.weapon;
                    const target = _attackInfo.target;
                    const icon = weapon.targetting.target === WeaponTarget.ally ?
                        EMOJI_SHIELD :
                        EMOJI_SWORD;
                    return {
                        emoji: icon,
                        label: `${weapon.Name}`,
                        description: `${target.base.class} (${target.index})`,
                        value: `${_attackInfo.attacker.index} ${getWeaponIndex(weapon, _attackInfo.attacker)} ${target.index}`,
                    }
                });

            // pick up loot option
            const coordString: string = getCoordString(_vS);
            this.LootMap.get(coordString)?.forEach(_L => {
                selectMenuOptions.push({
                    emoji: '💰',
                    label: "Loot",
                    description: `${_L.droppedBy.base.class}`,
                    value: `loot ${coordString}`
                });
            });

            // end turn option
            selectMenuOptions.push({
                emoji: EMOJI_TICK,
                label: "End Turn",
                description: "Preemptively end your turn to save time.",
                value: "end"
            })

            const messagePayload: MessageOptions = {
                components: [getButtonsActionRow(buttonOptions)],
            }
            if (selectMenuOptions.length > 0) {
                const selectMenuActionRow = getSelectMenuActionRow(selectMenuOptions);
                const selectMenu = selectMenuActionRow.components[0] as MessageSelectMenu;
                
                selectMenu.placeholder = "Select an Action";
                messagePayload.components!.push(selectMenuActionRow);
            }

            // attach interaction components
            const m = await this.getFullPlayerEmbedMessageOptions(_vS);
            m.components = messagePayload.components;

            // add/remove error field
            let errorField = m.embeds![0].fields?.find(_f => _f.name === "ERROR:");
            if (errorField && possibleError) {
                errorField.value = possibleError;
            }
            else if (errorField) {
                arrayRemoveItemArray(m.embeds![0].fields!, errorField);
            }
            else if (possibleError) {
                m.embeds![0].fields?.push({
                    name: "ERROR:",
                    value: possibleError,
                    inline: false,
                });
            }

            return m;
        }
        const _infoMessage = await _ownerTextChannel.send(await returnMessageInteractionMenus());
        // returns a Promise that resolves when the player is finished with their moves
        return new Promise((resolve) => {
            let executingActions: Action[] = [];

            const listenToQueue = () => {
                setUpInteractionCollect(_infoMessage, async itr => {
                    if (itr.user.id === _rS.owner) {
                        try {
                            if (itr.isButton()) {
                                const valid = handleButton(itr);
                                await itr.update(await returnMessageInteractionMenus());
                            }
                            else if (itr.isSelectMenu()) {
                                const valid = handleSelectMenu(itr);
                                await itr.update(await returnMessageInteractionMenus());
                            }
                        }
                        catch (_err) {
                            console.log(_err);
                        }
                    }
                    else {
                        listenToQueue();
                    }
                }, 1);
            }
            const handleSelectMenu = (_sMItr: SelectMenuInteraction): boolean => {
                const round = executingActions.length + 1;
                // [attacker index] [weapon index] [target index]
                const code = _sMItr.values[0];
                const codeSections = code.split(" ");
                let valid = false;

                if (codeSections[0] && codeSections[1] && codeSections[2]) {
                    const attackerIndex = parseInt(codeSections[0]);
                    const weaponIndex = parseInt(codeSections[1]);
                    const targetIndex = parseInt(codeSections[2]);

                    const attacker = _vS.index === attackerIndex?
                        _vS:
                        this.allStats().find(_s => _s.index === attackerIndex);
                    const weapon = attacker?.base.weapons[weaponIndex];
                    const target = this.allStats().find(_s => _s.index === targetIndex);

                    if (attacker && weapon && target) {
                        const virtualAttackAction = getAttackAction(_vS, target, weapon, target, round);
                        valid = this.executeVirtualAttack(virtualAttackAction, _vS);
                        if (valid) {
                            possibleError = '';
                            const realAttackAction = getAttackAction(_rS, target, weapon, target, round);
                            executingActions.push(realAttackAction);
                        }
                        else {
                            const error = this.validateTarget(virtualAttackAction)!;
                            possibleError = `${error.reason} Reference value: ${error.value}`;
                        }
                    }
                    listenToQueue();
                }
                else if (code === "end") {
                    this.roundActionsArray.push(...executingActions);
                    resolve(void 0);
                }
                else if (code.split(" ")?.[0] === "loot") {
                    const lootCoordString: string = code.split(" ")?.[1];
                    const allLoot: Array<Loot> | null = this.LootMap.get(lootCoordString) || null;
                    if (allLoot && allLoot.length > 0) {
                        this.LootMap.delete(lootCoordString);
                        const lootEmbed = new MessageEmbed({
                            title: "You got..."
                        });
                        let lootString = '';

                        // for each lootbox on the tile
                        for (let i = 0; i < allLoot.length; i++) {
                            const loot: Loot = allLoot[i];
                            const userData: UserData | null = this.userDataCache.get(_rS.owner) || null;

                            // for each item in the lootbox
                            for (let i = 0; i < loot.items.length; i++) {
                                const item: Item = loot.items[i];
                                userData?.inventory.push(item);

                                const totalWorth: number = roundToDecimalPlace(item.getWorth());
                                const totalWeight: number = roundToDecimalPlace(item.weight);

                                const MoM: MaterialQualityInfo = item.getMostOccupiedMaterialInfo()!;
                                const MoM_name = formalise(MoM.materialName);
                                const MoM_tag = getGradeTag(MoM);
                                const MoM_price = roundToDecimalPlace(item.getMaterialInfoPrice(MoM), 2);
                                const MoM_weight = roundToDecimalPlace(totalWeight * MoM.occupation, 2);

                                const MeM: MaterialQualityInfo = item.getMostExpensiveMaterialInfo()!;
                                const MeM_name = formalise(MeM.materialName);
                                const MeM_tag = getGradeTag(MeM);
                                const MeM_price = roundToDecimalPlace(item.getMaterialInfoPrice(MeM), 2);
                                const MeM_weight = roundToDecimalPlace(totalWeight * MeM.occupation, 2);

                                lootString +=
                                    `__**${item.name}**__ $${totalWorth} (${totalWeight}μ)
                                    \t${MoM_name} (${MoM_tag}) $${MoM_price} (${MoM_weight}μ)
                                    \t${MeM_name} (${MeM_tag}) $${MeM_price} (${MeM_weight}μ)\n`;
                            }
                        }
                        lootEmbed.setDescription(lootString);
                        
                        // send acquired items
                        _ownerTextChannel.send({
                            embeds: [lootEmbed]
                        });
                    }
                    listenToQueue();
                }

                return valid;
            }
            const handleButton = (_btnItr: ButtonInteraction): boolean => {
                const round = executingActions.length + 1;
                const direction = _btnItr.customId as Direction;
                let valid = false;

                switch (_btnItr.customId) {
                    case "up":
                    case "right":
                    case "down":
                    case "left":
                        // get moveAction based on input (blackboxed)
                        const moveAction = getMoveAction(_vS, direction, round, 1);

                        // record if it is first move or not
                        const isFirstMove = !_vS.moved;

                        // validate + act on (if valid) movement on virtual map
                        valid = this.executeVirtualMovement(moveAction!, _vS);

                        // movement is permitted
                        if (valid) {
                            possibleError = '';
                            const realMoveStat = getMoveAction(_rS, direction, round, 1);
                            if (!isFirstMove) {
                                realMoveStat.sprint = 1;
                            }
                            executingActions.push(realMoveStat);
                        }
                        else {
                            const error = this.validateMovement(_vS, moveAction)!;
                            possibleError = `${error.reason} Reference value: ${error.value}`;
                        }
                        break;
                    
                    case "undo":
                        possibleError = '';
                        if (executingActions.length > 0) {
                            const undoAction = executingActions.pop()!;
                            dealWithUndoAction(_vS, undoAction);
                            valid = true;
                        }
                        break;
                }

                listenToQueue();

                return valid;
            }

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
            index = lookUp(0, arrayGetLastElement(allIndex));

            if (index === null) {
                index = arrayGetLastElement(allIndex) + 1;
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
            log(`Loop ${i}`);
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

        // reduce shield token
        if (_cR.fate !== "Miss" && target.shield > 0) {
            target.shield--;
        }

        // apply basic weapon damage
        returnString += this.applyClashDamage(_aA, _cR);

        // attach weapon effects string
        if (activationString) {
            returnString += activationString + "\n";
        }

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
                const labourStatus = arrayGetLargestInArray(this.getStatus(target, "labouring"), _s => _s.value);
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
                        `**${attackerClass}** (${attacker.index}) Activates __*${weapon.Name}*__`;
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
        damage = clamp(u_damage * (1 - (prot * target.shield / 3)), 0, 100);

        // reduce damage by shielding
        let shieldingStatus = arrayGetLargestInArray(target.statusEffects.filter(_status => _status.type === "protected"), _item => _item.value);
        while (damage > 0 && shieldingStatus && shieldingStatus.value > 0) {
            const shieldValue = shieldingStatus.value;
            log(`reduced ${shieldValue} damage!`);
            shieldingStatus.value -= damage;
            damage -= shieldValue;
            if (damage < 0) {
                damage = 0;
            }
            shieldingStatus = arrayGetLargestInArray(target.statusEffects.filter(_status => _status.type === "protected"), _item => _item.value);
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
        _aA.from.weaponUses[getWeaponIndex(_aA.weapon, _aA.from)]++;
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
        const finalCoord = arrayGetLastElement(possibleSeats);

        const newMagnitude = (finalCoord ? getDistance(finalCoord, _mA.affected) : 0) * Math.sign(_mA.magnitude);

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
            if (!stat.owner && iconCache.get(baseClass) === undefined) {
                iconCache.set(baseClass, iconCanvas);
            }

            // draw on the main canvas
            const imageCanvasCoord = getCanvasCoordsFromBattleCoord({
                x: X,
                y: Y
            }, this.pixelsPerTile, this.height, false);
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
            const fromCanvasCoord = getCanvasCoordsFromBattleCoord(_fromBattleCoord, this.pixelsPerTile, this.height);
            ctx.moveTo(fromCanvasCoord.x + _offset.x, fromCanvasCoord.y + _offset.y);

            const toCanvasCoord = getCanvasCoordsFromBattleCoord(_toBattleCoord, this.pixelsPerTile, this.height);
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
            const textCanvasCoordinate = getCanvasCoordsFromBattleCoord({
                x: (_fromBattleCoord.x + _toBattleCoord.x) / 2,
                y: (_fromBattleCoord.y + _toBattleCoord.y) / 2
            }, this.pixelsPerTile, this.height);
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
            const beforeCanvasCoord = getCanvasCoordsFromBattleCoord(_fromBattleCoord, this.pixelsPerTile, this.height);
            ctx.beginPath();
            ctx.moveTo(beforeCanvasCoord.x, beforeCanvasCoord.y);

            // draw a line to the coord after move action
            const afterCanvasCoord = getCanvasCoordsFromBattleCoord(_toBattleCoord, this.pixelsPerTile, this.height);
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
            const canvasCoord = getCanvasCoordsFromBattleCoord(stat, this.pixelsPerTile, this.height);
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
            const canvasCoord = getCanvasCoordsFromBattleCoord(stat, this.pixelsPerTile, this.height, false);

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
        // const mapCanvas = await this.getCurrentMapWithArrowsCanvas(stat, actions);
        // const map: Buffer = mapCanvas.toBuffer();

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
                // { attachment: map, name: "map.png" },
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
            ],
            footer: {
                text: `Coordinate: (${stat.x}, ${stat.y})`
            }
        });

        // thumbnail
        explorerEmbed.setThumbnail("attachment://thumbnail.png")

        // dealing with map
        // explorerEmbed.setImage(`attachment://map.png`);

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
    findEntity_coord(_coord: Coordinate): Stat | undefined {
        return this.CSMap.get(getCoordString(_coord));
    }
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
    findEntities_allInAxis(_attacker: Stat, _axis: 'x' | 'y', magnitude: number, _ignoring: Team[] = []): Array<Stat> {
        const allStats = this.allStats();

        if (magnitude === 0) return [];
        const cAxis = counterAxis(_axis);
        const result = allStats.filter(s => {
            if (s.team && _ignoring.includes(s.team)) return false;

            const checkNeg = s[_axis] >= _attacker[_axis] + magnitude && s[_axis] < _attacker[_axis];
            const checkPos = s[_axis] <= _attacker[_axis] + magnitude && s[_axis] > _attacker[_axis];

            // check negative if magnitude is negative. else, check positive axis
            const conditionOne = (Math.sign(magnitude) == -1) ? checkNeg : checkPos;
            return (s[cAxis] === _attacker[cAxis] && getDistance(_attacker, s) !== 0 && conditionOne);
        });
        return result;
    }
    findEntities_radius(_stat: Coordinate, _r: number, _includeSelf: boolean = false, _ignoring: Array<Team> = ["block"], _domain: Stat[] = this.allStats()): Array<Stat> { 
        const ignored = (c: Stat) => c.team && _ignoring.includes(c.team);
        const stat = _stat as (Stat | any);
        const isStat = stat.index !== undefined;
        const entities = _domain.filter(s =>
            (s.index !== stat.index || (isStat && _includeSelf)) &&
            !ignored(s) &&
            Math.sqrt(Math.pow((s.x - stat.x), 2) + Math.pow((s.y - stat.y), 2)) <= _r
        );
        
        return entities;
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
        if (weapon.targetting.target === WeaponTarget.enemy && weapon.targetting.AOE !== "self" && weapon.targetting.AOE !== "selfCircle" && attackerStat.team === targetStat.team && (!targetStat.pvp || !attackerStat.pvp)) {
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
        if (weapon.UPT <= getWeaponUses(weapon, attackerStat)) {
            eM.reason = `You can only use this ability ${weapon.UPT} time(s) per turn.`;
            eM.value = getWeaponUses(weapon, attackerStat);
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

    dropDrops(_s: Stat) {
        const coordString: string = getCoordString(_s);
        if (_s.drops) {
            const lootBox: Array<Loot> =
                this.LootMap.get(coordString) ||
                this.LootMap.set(coordString, []).get(coordString)!;
            lootBox.push(_s.drops);
        }
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

        // remove index
        this.allIndex.delete(s.index!);

        // manage drop
        this.dropDrops(s);
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
    startPathFinding(_startCoord: Coordinate, _destinationCoord: Coordinate, _method: PathfindMethod, _limit = Number.POSITIVE_INFINITY): Array<Coordinate> {
        // initialize
        const AINodeMap = new Map<string, AINode>(); // string == CoordString
        const AINodePriorQueue: Array<AINode> = []; // sorted smallest to largest in total cost
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const coord = { x: x, y: y };
                const coordString = getCoordString(coord);
                const coordVacant: boolean = !this.CSMap.has(coordString);
                const coordIsStart: boolean = findEqualCoordinate(coord, _startCoord);

                if (coordVacant || coordIsStart) {
                    const node = getNewNode(x, y, _destinationCoord, Number.POSITIVE_INFINITY);
                    AINodeMap.set(coordString, node);
                    AINodePriorQueue.push(node);
                }
            }
        }

        // initiate the beginning node, ie. spread from there
        const startAINode = AINodeMap.get(getCoordString(_startCoord));
        if (startAINode) {
            startAINode.distanceTravelled = 0;
            startAINode.totalCost = startAINode.distanceToDestination;
        }
        else {
            console.error(`\tACHTUNG! Starting node invalid. Coord: ${getCoordString(_startCoord)}`);
        }

        AINodePriorQueue.sort((_1, _2) => ( _1.totalCost - _2.totalCost ));

        // get the smallest totalCost node
        const getNextAINode = () => {
            let next: AINode | null = null; 
            switch (_method) {
                case 'lowest':
                    next = AINodePriorQueue.shift() || null;
                    break;
                case 'highest':
                    next = arrayGetLargestInArray(AINodePriorQueue, _n => {
                        return _n.totalCost === Number.POSITIVE_INFINITY ?
                            -1 :
                            _n.totalCost;
                    }) || null;
                    arrayRemoveItemArray(AINodePriorQueue, next);
                    break;
            }
            return next;
        }
        const results: AINode[] = [];
        let AINode: AINode | null = getNextAINode();
        while (AINode && (AINode.x !== _destinationCoord.x || AINode.y !== _destinationCoord.y)) {
            // == Update surrounding nodes
            // look at surrounding nodes
            for (let i = 0; i < 4; i++) {
                const numDir = i as NumericDirection;
                const magAxis = directionToMagnitudeAxis(numDir);

                const nodeDirectedCoord = { x: AINode.x, y: AINode.y }; nodeDirectedCoord[magAxis.axis] += magAxis.magnitude;
                const nodeDirectedCoordString = getCoordString(nodeDirectedCoord);

                // if directed node is unexplored
                if (AINodeMap.has(nodeDirectedCoordString) && !results.includes(AINodeMap.get(nodeDirectedCoordString)!) && AINode.distanceTravelled < _limit) {
                    // update unexplored node
                    const unexploredNode = AINodeMap.get(nodeDirectedCoordString)!;
                    unexploredNode.distanceTravelled = AINode.distanceTravelled + 1;
                    unexploredNode.totalCost = unexploredNode.distanceToDestination + unexploredNode.distanceTravelled;
                    unexploredNode.lastNode = AINode;
                    AINode.nextNode = unexploredNode;
                }
            }

            // == Push current node to path
            // only push to result when node is within limit
            if (AINode.distanceTravelled <= _limit) {
                results.push(AINode);
            }

            // updates
            AINodePriorQueue.sort((_1, _2) => (_1.totalCost - _2.totalCost));
            AINode = getNextAINode();
        }

        // deal with the result
        const fullPath: Coordinate[] = [];
        if (!AINode) {
            // if node is null, find the closest node to destination
            AINode = results.reduce((lvN, n) =>
                n.distanceToDestination < lvN.distanceToDestination?
                    n:
                    lvN,
            results[0]);
        }
        while (AINode) {
            const coord = { x: AINode.x, y: AINode.y };
            fullPath.unshift(coord);
            AINode = AINode.lastNode || null;
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
    normaliseMoveActions(_mAArray: MoveAction[], _vS: Stat) {
        let i = 0;
        const fullActions = [];
        // while the enemy has not moved or has enough sprint to make additional moves
        // Using (rstat.sprint - i) because rstat is by reference and modification is only legal in execution.
        while (i < _mAArray.length && (_vS.moved === false || _vS.sprint > 0)) {
            const moveAction = _mAArray[i];
            const moveMagnitude = Math.abs(moveAction.magnitude);
            if (moveMagnitude > 0) {
                moveAction.sprint = Number(_vS.moved);
                const valid = this.executeVirtualMovement(moveAction, _vS);
                if (valid) {
                    _vS.moved = true;
                    fullActions.push(moveAction);
                }
            }
            i++;
        }
        return fullActions;
    }

    // status function
    removeStatus(_status: StatusEffect) {
        debug("\tRemoving status", `${_status.type} ${_status.value} (x${_status.duration})`);
        const owner = _status.affected;
        arrayRemoveItemArray(owner.statusEffects, _status);
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
                    const largestBuff = arrayGetLargestInArray(otherSameTypeBuffs, _se => _se.value);
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