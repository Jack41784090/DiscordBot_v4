import { ButtonInteraction, CategoryChannel, Client, EmbedFieldData, Guild, Interaction, InteractionCollector, Message, MessageButtonOptions, MessageButtonStyle, MessageEmbed, MessageOptions, MessageSelectMenu, MessageSelectOptionData, OverwriteData, SelectMenuInteraction, TextChannel, User } from "discord.js";
import { addHPBar, counterAxis, getAHP, getExecutionSpeed, getCompass, uniformRandom, returnGridCanvas, roundToDecimalPlace, checkWithinDistance, average, getAcc, getDodge, getCrit, getDamage, getProt, getLifesteal, arrayGetLastElement, dealWithAccolade, getWeaponUses, getCoordString, getMapFromCS, getBaseClassStat, getStat, getAbilityIndex, getNewObject, startDrawing, dealWithAction, getDeathEmbed, getSelectMenuActionRow, setUpInteractionCollect, arrayGetLargestInArray, getCoordsWithinRadius, getPyTheorem, handleTokens, getNewNode, getDistance, getMoveAction, getAttackAction, normaliseRGBA, clamp, translateRGBAToStringRGBA, shortenString, drawText, drawCircle, getBuffStatusEffect, getCanvasCoordsFromBattleCoord, getButtonsActionRow, arrayRemoveItemArray, findEqualCoordinate, translateDirectionToMagnitudeAxis, formalise, getGradeTag, getLootAction, getForgeWeaponAttackAbility, getAttackRangeFromAA, getLoadingEmbed, translateActionToCommentary, extractActions } from "./Utility";
import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { getFileImage, getIconCanvas, getUserWelfare } from "./Database";

import { log, debug } from "console";

import fs from 'fs';
import { Action, AINode, AttackAction, BaseStat, BotType, ClashResult, ClashResultFate, Class, Coordinate, Direction, EnemyClass, MapData, MoveAction, MovingError, OwnerID, RGBA, Stat, TargetingError, Team, Vector2, Ability, AbilityTargetting, StatusEffectType, Buff, EMOJI_TICK, UserData, StartBattleOptions, VirtualStat, PossibleAttackInfo, EMOJI_SHIELD, EMOJI_SWORD, NumericDirection, PathFindMethod as PathfindMethod, Loot, MaterialInfo, EMOJI_MONEYBAG, LootAction, ForgeWeaponObject, ForgeWeaponType, StringCoordinate, BattleToken } from "../typedef";
import { hGraph, hNode } from "./hGraphTheory";
import { AbilityEffect } from "./WeaponEffect";
import { StatusEffect } from "./StatusEffect";
import { AI } from "./AI";
import { BotClient } from "..";
import { Item } from "./Item";
import { InteractionEventManager } from "./InteractionEventManager";
import { InteractionEvent } from "./InteractionEvent";
import { enemiesData } from "../jsons";

export class Battle {
    static readonly ROUND_SECONDS = 100;
    static readonly MAX_READINESS = 25;
    static readonly MOVE_READINESS = 5;
    static readonly MOVEMENT_BUTTONOPTIONS: Array<MessageButtonOptions> = [
        {
            label: "UP ⬆️",
            style: "PRIMARY" as Exclude<MessageButtonStyle, 'LINK'>,
            customId: "up"
        },
        {
            label: "DOWN ⬇️",
            style: "SECONDARY" as Exclude<MessageButtonStyle, 'LINK'>,
            customId: "down"
        },
        {
            label: "RIGHT ➡️",
            style: "PRIMARY" as Exclude<MessageButtonStyle, 'LINK'>,
            customId: "right"
        },
        {
            label: "LEFT ⬅️",
            style: "SECONDARY" as Exclude<MessageButtonStyle, 'LINK'>,
            customId: "left"
        },
        {
            label: "Undo",
            style: "SUCCESS" as Exclude<MessageButtonStyle, 'LINK'>,
            customId: "undo"
        },
    ];

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
    CSMap: Map<StringCoordinate, Stat> = new Map<StringCoordinate, Stat>();
    LootMap: Map<StringCoordinate, Array<Loot>> = new Map<StringCoordinate, Array<Loot>>();

    // Round Actions Information (Resets every Round)
    roundActionsArray: Array<Action> = [];

    // Entity-Related Information
    tobespawnedArray: Array<Stat> = [];
    totalEnemyCount: number = 0;
    enemyCount: number = 0;
    playerCount: number = 0;
    allIndex: Map<number, boolean> = new Map<number, boolean>();

    // user cache
    userCache: Map<OwnerID, User> = new Map<OwnerID, User>();
    userDataCache: Map<OwnerID, UserData> = new Map<OwnerID, UserData>();

    // gamemode
    pvp: boolean;

    private constructor(_mapData: MapData, _author: User, _message: Message, _client: Client, _pvp: boolean, _party: OwnerID[]) {
        this.author = _author;
        this.message = _message;
        this.channel = _message.channel as TextChannel;
        this.client = _client;
        this.guild = _message.guild as Guild;
        this.party = _party;

        this.mapData = _mapData;
        this.width = _mapData.map.width;
        this.height = _mapData.map.height;

        this.pixelsPerTile = 50;
        this.pvp = _pvp;

        const allStats = this.allStats(true);

        // fix index
        allStats.forEach(s => {
            if (s.index !== -1) {
                this.allIndex.set(s.index, true);
            }
            else {
                s.index = this.getIndex();
                this.allIndex.set(s.index, true);
            }
        })
    }

    /** Generate a Battle but does not start it */
    static async Generate(_mapData: MapData, _author: User, _message: Message, _party: Array<OwnerID>, _client: Client, _pvp = false) {
        const battle = new Battle(_mapData, _author, _message, _client, _pvp, _party);
        battle.CSMap = await getMapFromCS(_mapData.map.coordStat);
        return battle;
    }

    /** Main function to access in order to start a battle, replacing the constructor */
    static async Start(_mapData: MapData, _author: User, _message: Message, _party: Array<OwnerID>, _client: Client, _pvp = false) {
        const battle = await Battle.Generate(_mapData, _author, _message, _party, _client, _pvp);
        return await battle.StartBattle();
    }

    /** Start an already generated battle. */
    async StartBattle(_options: StartBattleOptions = {
        ambush: null
    }): Promise<boolean> {
        await this.InitiateUsers();
        await this.ManageWelfare();

        await this.InitiateEnemies();
        // ambush
        if (_options.ambush && _options.ambush !== 'block') {
            const ambushingTeam: Team = _options.ambush;
            for (let i = 0; i < this.tobespawnedArray.length; i++) {
                const ambusher = this.tobespawnedArray[i];
                if (ambusher.team === ambushingTeam) {
                    ambusher.readiness = Battle.MAX_READINESS;
                    ambusher.sword = 3;
                    ambusher.sprint = 3;
                }
            }
        }

        return this.StartRound();
    }

    /** Use only once: put all enemies into the spawn array */
    async InitiateEnemies(): Promise<void> {
        // add enemies to the spawning list, only valid if battle is not pvp
        if (!this.pvp) {
            for (const [key, value] of Object.entries(this.mapData.enemiesInfo)) {
                const data = enemiesData[key as EnemyClass];
                const enemyBase: BaseStat = getNewObject(data, {
                    name: data.class as EnemyClass,
                }) as BaseStat;
                const spawnCount = uniformRandom(value.min, value.max);

                for (let i = 0; i < spawnCount; i++) {
                    const enemyEntity: Stat = await getStat(enemyBase);

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
                            const { min, max } = _LInfo.weightDeviation;
                            const weight = uniformRandom(min + min * 0.05, max);
                            enemyEntity.drops.items.push(new Item(_LInfo.materials, weight, _LInfo.itemName));
                        }
                    });

                    this.tobespawnedArray.push(enemyEntity);
                    this.totalEnemyCount++;
                    this.enemyCount++;
                }
            }
        }
    }

    /** Initiate users by registering them into iem, add them in the battle, initiate cache. */
    async InitiateUsers(): Promise<void> {
        const instance = InteractionEventManager.getInstance();
        // initiate users
        for (let i = 0; i < this.party.length; i++) {
            const ownerID = this.party[i];

            // interaction event
            const interactEvent: InteractionEvent = new InteractionEvent(ownerID, this.message, 'battle');
            const userData = await instance.registerInteraction(ownerID, interactEvent);
            if (userData) {
                this.userDataCache.set(ownerID, userData);
                // add to spawn queue
                const blankStat = await getStat(getBaseClassStat(userData.equippedClass), ownerID);
                blankStat.pvp = this.pvp;
                this.tobespawnedArray.push(blankStat);

                // initiate cache
                const user: User | null = await BotClient.users.fetch(ownerID).catch(() => null);
                if (user) {
                    this.userCache.set(ownerID, user);
                }
            }
            else {
                this.message.channel.send(`<@${ownerID}> is busy (most possibly already in another battle) and cannot participate.`)
                arrayRemoveItemArray(this.party, ownerID);
            }
        }
    }

    /** Scale players HP based on their welfare */
    ManageWelfare(): void {
        // check player welfare
        log("Checking welfare...")
        const playerStats = this.party.map(_ownerID => this.tobespawnedArray.find(_s => _s.owner === _ownerID));
        for (let i = 0; i < playerStats.length; i++) {
            const player = playerStats[i];
            if (player) {
                const welfare = this.userDataCache.get(player.owner)?.welfare;
                debug(`\t${player.base.class}`, welfare);
                if (welfare) {
                    log(`\t${player.HP} => ${player.base.maxHP * clamp(welfare, 0, 1)}`)
                    player.HP = player.base.maxHP * clamp(welfare, 0, 1);
                }
                else {
                    this.author.send({
                        embeds: [
                            new MessageEmbed({
                                title: "Alert!",
                                description: `One of your teammates playing ${player.base.class} has 0 welfare and cannot attend the battle.`,
                                footer: {
                                    text: `associated user: ${this.userCache.get(player.owner)?.username || player.owner}`
                                }
                            })
                        ]
                    })
                }
            }
        }
    }

    /** Begin a new round
        Recurses into another StartRound until all enemies / players are defeated (HP <= 0). */
    async StartRound(): Promise<boolean> {
        log("======= New Round =======");

        // resetting action list and round current maps
        this.roundActionsArray = [];

        // SPAWNING
        log("Currently waiting to be spawned...")
        for (let i = 0; i < this.tobespawnedArray.length; i++) {
            const spawning = this.tobespawnedArray[i];
            log(`\t{ index:${spawning.index}, class:${spawning.base.class} }`)
        }

        log("Spawning...");
        this.SpawnOnSpawner();
        const allStats = this.allStats();

        //#region COUNT LIVES
        log("Counting lives...");
        this.playerCount = allStats.reduce((acc, stat) => acc + Number(stat.team === "player" && stat.HP > 0), 0);
        debug("   PlayerCount", this.playerCount);
        debug("   Remaining Enemies", this.totalEnemyCount);
        //#endregion

        //#region INCREASE ALL READINESS & TOKENS
        log("readinessCost ticking...");
        for (let i = 0; i < allStats.length; i++) {
            const s = allStats[i];

            if (s.team === 'block') continue;

            // randomly assign tokens
            for (let i = 0; i < 2; i++) {
                const token: BattleToken =
                    uniformRandom(0, 2);
                switch (token) {
                    case BattleToken.sword:
                        s.sword++;
                        break;
                    case BattleToken.shield:
                        s.shield++;
                        break;
                    case BattleToken.sprint:
                        s.sprint++;
                        break;
                }
            }

            // increment readiness
            const speed = s.base.speed;
            s.readiness += speed;
            s.readiness = clamp(s.readiness, -Battle.MAX_READINESS, Battle.MAX_READINESS);

            // restore stamina
            s.stamina += s.base.maxStamina * 0.1;
            s.stamina = clamp(s.stamina, 0, s.base.maxStamina);
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
                            log(err);
                            return null;
                        });
                
                if (user === null) continue;

                // get a copy of stat (main reference in player control) from the CSMap
                const virtualStat: VirtualStat = getNewObject(realStat, {
                    username: user.username,
                    virtual: true
                }) as VirtualStat;
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
                createdChannel.send(`<@${user?.id}>`).then(mes => mes.delete().catch(log));

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

        // execute every move from lowest priority to highest
        // draw the base tiles and characters (before executing actions)
        const canvas = new Canvas(this.width * this.pixelsPerTile, this.height * this.pixelsPerTile);

        const ctx = canvas.getContext("2d");
        const roundCanvas: Canvas = await this.getNewCanvasMap();
        this.drawHealthArcs(roundCanvas);
        this.drawIndexi(roundCanvas);
        ctx.drawImage(roundCanvas, 0, 0, canvas.width, canvas.height);

        // execution
        const executedActions: Array<Action> = this.executeActions();

        // draw executed actions
        const actualCanvas: Canvas = await this.getActionArrowsCanvas(executedActions);
        ctx.drawImage(actualCanvas, 0, 0, canvas.width, canvas.height);

        //#endregion

        // limit token count
        for (let i = 0; i < allStats.length; i++) {
            const s = allStats[i];
            handleTokens(s, (p, t) => {
                if (p > 3) {
                    log(`\t\t${s.index}) ${t} =${3}`)
                    s[t] = 3;
                }
            });
        }

        //#region REPORT ACTIONS
        log("Reporting...")
        const allPromise: Promise<unknown>[] = [];

        // for each player, send an embed of actions completed of the player.
        const players = allStats.filter(s => s.botType === BotType.naught);
        players.forEach(async stat => {
            const commandRoomReport = this.sendReportToCommand(stat.owner, canvas, executedActions);
            allPromise.push(commandRoomReport);
        });

        // wait for all players to finish reading the reports
        await new Promise((resolve) => {
            Promise.all(allPromise).then(() => resolve(void 0));
            setTimeout(() => {
                resolve(void 0);
            }, 150 * 1000);
        });

        log("Reporting phase finished.")
        // allPromise.forEach(log);
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
            // update InteractionManager userData
            const allStats = this.allStats();
            for (let i = 0; i < this.party.length; i++) {
                const id: OwnerID = this.party[i];
                const stat: Stat = allStats[i];

                const userData = this.userDataCache.get(id);
                if (userData) {
                    userData.welfare = clamp(stat.HP / stat.base.maxHP, 0, 1);
                }

                InteractionEventManager.getInstance().stopInteraction(id, 'battle');
            }

            // == ACCOLADES ==
            const endEmbedFields: EmbedFieldData[] = [];
            this.callbackOnParty((stat: Stat) => {
                const statAcco = stat.accolades;
                const value = `Kills: ${statAcco.kill}
                        damageRange Dealt: ${roundToDecimalPlace(statAcco.damageDealt)}
                        Healing Done: ${roundToDecimalPlace(statAcco.healingDone)}
                        damageRange Absorbed: ${roundToDecimalPlace(statAcco.absorbed)}
                        damageRange Taken: ${roundToDecimalPlace(statAcco.damageTaken)}
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

    /** Get an array showing all nearby enemies reachable by weapon */
    getAllPossibleAttacksInfo(_stat: Stat, _domain: Array<Stat> = this.allStats()): PossibleAttackInfo[] {
        const equippedWeapon: ForgeWeaponObject = _stat.equipped;
        const abilities: Array<Ability> = _stat.base.abilities.filter(_a => 
            (_a.type === 'null' && _a.range !== undefined)||
            _a.type === equippedWeapon.attackType
        );

        return abilities.map(_a => {
            debug("ability", _a);
            const shortestRange: number = Number.isInteger(_a.range?.min)?
                (_a.range!.min):
                equippedWeapon.range.min;
            const longestRange: number = Number.isInteger(_a.range?.max)?
                (_a.range!.max):
                equippedWeapon.range.max;
            const reachableEntities: Array<Stat> =
                this.findEntities_radius(_stat, longestRange, shortestRange === 0, ['block'], _domain);
            debug("reachable", reachableEntities.map(_ => _.index));
            
            const targettedEntities: Array<Stat> =
                reachableEntities.filter(_s => {
                    return _a.targetting.target === AbilityTargetting.ally?
                        _s.team === _stat.team:
                        ((_s.team !== _stat.team) || _s.pvp);
                });
            debug("targetted", targettedEntities.map(_ => _.index))

            return targettedEntities.map(_e => ({
                attacker: _stat,
                target: _e,
                ability: _a,
            }));
        }).flat();
    }

    /** Return an array of coordinates that are not occupied currently, based on the moveAction magnitude and direction */
    getAvailableSpacesAhead(moveAction: MoveAction): Array<Coordinate> {
        const magnitude = moveAction.magnitude;
        const axis = moveAction.axis;
        const stat = moveAction.target;

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

    /** Send a message to a TextChannel in the battle's guild with id name */
    sendToCommand(roomID: string, message: MessageOptions): Promise<Message> | null {
        const commandRoom: TextChannel | null = this.guild.channels.cache.find(c => c.name === roomID && c.type === 'GUILD_TEXT') as TextChannel || null;
        return commandRoom?.send(message) || null;
    }

    /** Send a multi-round report embed to sendToCommand function */
    async sendReportToCommand(roomID: string, chosenCanvas: Canvas, reportedActions: Array<Action>): Promise<boolean> {
        let promisedMsg: Message;
        if (promisedMsg = await this.sendToCommand(roomID, { embeds: [getLoadingEmbed()] })!) {
            const getEmbed = (_: 'all' | number) => {
                const e = new MessageEmbed({
                    description: "",
                    image: {
                        url: "attachment://map.png"
                    }
                });
                return _ === 'all' ?
                    e.setDescription(
                        reportedActions
                            .map(_a => translateActionToCommentary(_a))
                            .join("\n") ||
                        "( *No Actions* )") :
                    e.setDescription(
                        reportedActions
                            .filter(_a =>
                                _a.target.index === _ ||
                                _a.attacker.index === _
                            )
                            .map(_a => translateActionToCommentary(_a))
                            .join("\n") ||
                        "( *No Actions* )");

            }
            const domain = this.allStats(true);
            const filterSelectOption: MessageSelectOptionData[]=
                domain.map(_s => ({
                    label: `${_s.base.class} (${_s.index})`,
                    description: `Show only actions from ${_s.base.class} (${_s.index})`,
                    value: `${_s.index}`,
                })).concat({
                    label: "Show all actions",
                    description: ``,
                    value: `all`
                });
            const messageOption: MessageOptions = {
                embeds: [getEmbed('all')],
                components: [getSelectMenuActionRow(filterSelectOption)],
                files: [{ attachment: chosenCanvas.toBuffer(), name: 'map.png' }]
            };

            await promisedMsg.edit(messageOption);
            return new Promise((resolve) => {
                let timeOut: NodeJS.Timeout, itrCollector: InteractionCollector<Interaction>;
                const hardReset = setTimeout(() => {
                    itrCollector.stop();
                    resolve(true);
                }, 150 * 1000);
                const resetTimeout = () => {
                    clearTimeout(timeOut);
                    timeOut = setTimeout(() => {
                        itrCollector.stop();
                        resolve(true);
                        clearTimeout(hardReset);
                    }, 15 * 1000);
                }
                const collect = () => {
                    resetTimeout();
                    return setUpInteractionCollect(promisedMsg, async itr => {
                        if (itr.isSelectMenu()) {
                            const selected = itr.values[0]; // index or "all"
                            switch (selected) {
                                case "all":
                                    itrCollector = collect();
                                    await itr.update({
                                        embeds: [getEmbed('all')]
                                    })
                                    break;

                                default:
                                    const selectedIndex = parseInt(selected);
                                    if (Number.isInteger(selectedIndex)) {
                                        itrCollector = collect();
                                        await itr.update({
                                            embeds: [getEmbed(selectedIndex)]
                                        })
                                    }
                                    break;
                            }
                        }
                    });
                }

                itrCollector = collect();
            });
        }
        return false;
    }

    /** Get every action done by an entity in this round */
    getStatsRoundActions(stat: Stat): Array<Action> {
        return this.roundActionsArray.filter(a => a.attacker.index === stat.index);
    }

    drawSquareOnBattleCoords(ctx: NodeCanvasRenderingContext2D, coord: Coordinate, rgba?: RGBA) {
        const canvasCoord = getCanvasCoordsFromBattleCoord(coord, this.pixelsPerTile, this.height, false);
        if (rgba) {
            ctx.fillStyle = translateRGBAToStringRGBA(rgba);
        }
        ctx.fillRect(canvasCoord.x, canvasCoord.y, this.pixelsPerTile, this.pixelsPerTile);
    }

    /** Execute an attack that will only mutate the provided stat, as the attacker's, numbers */
    executeVirtualAttack(_aA: AttackAction, _virtualAttacker: Stat) {
        const { target, ability, weapon } = _aA;
        const check: TargetingError | null = this.validateTarget(_virtualAttacker, weapon, ability, target);

        // attack goes through
        if (check === null) {
            _virtualAttacker.weaponUses[getAbilityIndex(ability, _virtualAttacker)]++;

            _virtualAttacker.readiness -= _aA.readinessCost;
            handleTokens(_virtualAttacker, (p, t) => {
                log(`\t\t${_virtualAttacker.index}) ${t} --${_aA[t]}`)
                _virtualAttacker[t] -= _aA[t];
            });
        }
        // attack cannot go through
        else {
            log(`Failed to target. Reason: ${check.reason} (${check.value})`);
        }

        return check === null;
    };
    /** Execute a movement that will only mutate the provided stat, as the mover's, numbers */
    executeVirtualMovement (_mA: MoveAction, _virtualStat: Stat): boolean {
        log(`\tExecuting virtual movement for ${_virtualStat.base.class} (${_virtualStat.index}).`)
        const check: MovingError | null = this.validateMovement(_virtualStat, _mA);

        if (check === null) {
            log("\t\tMoved!");

            // spending sprint to move
            if (_virtualStat.moved === true) {
                handleTokens(_mA, (p, type) => {
                    if (type === "sprint") {
                        log(`\t\t${_virtualStat.index}) ${type} --${p}`)
                        _virtualStat.sprint -= p;
                    }
                });
            }

            // other resource drain
            _virtualStat.readiness -= Battle.MOVE_READINESS * Math.abs(_mA.magnitude);
            _virtualStat.moved = true;
            _virtualStat[_mA.axis] += _mA.magnitude;
        }
        else {
            log(`\t\tFailed to move. Reason: ${check.reason} (${check.value})`);
        }

        return check === null;
    };

    // action reader methods
    async readActions(_givenSeconds: number, _ownerTextChannel: TextChannel, _vS: VirtualStat, _rS: Stat) {
        let possibleError: string = '';

        // Map out the current battlefield's loot boxes. Entries are deleted when looted in readAction to simulate looting.
        const tempLootMap: Map<StringCoordinate, boolean> = new Map<StringCoordinate, boolean>(
            [...this.LootMap.keys()].map(_k => {
                return [
                    _k,
                    true,
                ]
            })
        );

        // set domain, replace all occurences of this actor with its virtual stat
        const domain = this.allStats().map(_s =>
            _s.index === _vS.index?
                _vS:
                _s
        );

        // return MessageOptions containing the entire player-info embed
        const returnMessageInteractionMenus = async (): Promise<MessageOptions> => {
            // available attack options
            const selectMenuOptions: Array<MessageSelectOptionData> =
                this.getAllPossibleAttacksInfo(_vS, domain).map(_attackInfo => {
                    const { ability, attacker, target } = _attackInfo;
                    const icon = ability.targetting.target === AbilityTargetting.ally ?
                        EMOJI_SHIELD :
                        EMOJI_SWORD;

                    return {
                        emoji: icon,
                        label: `${ability.abilityName}`,
                        description: `${target.base.class} (${target.index})`,
                        value: `${attacker.index} ${getAbilityIndex(ability, attacker)} ${target.index}`,
                    }
                });

            // pick up loot option
            const coordString: StringCoordinate = getCoordString(_vS);
            if (tempLootMap.get(coordString)) {
                this.LootMap.get(coordString)?.forEach(_L => {
                    selectMenuOptions.push({
                        emoji: EMOJI_MONEYBAG,
                        label: "Loot",
                        description: `${_L.droppedBy.base.class}`,
                        value: `loot ${coordString}`
                    });
                });
                tempLootMap.delete(coordString);
            }

            // end turn option
            selectMenuOptions.push({
                emoji: EMOJI_TICK,
                label: "End Turn",
                description: "Preemptively end your turn to save time.",
                value: "end"
            })

            // attach interaction components
            const messagePayload: MessageOptions = {
                components: [getButtonsActionRow(Battle.MOVEMENT_BUTTONOPTIONS)],
            }
            if (selectMenuOptions.length > 0) {
                const selectMenuActionRow = getSelectMenuActionRow(selectMenuOptions);
                const selectMenu = selectMenuActionRow.components[0] as MessageSelectMenu;

                selectMenu.placeholder = "Select an Action";
                messagePayload.components!.push(selectMenuActionRow);
            }
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
        const dealWithUndoAction = (stat: Stat, action: Action) => {
            stat.sword += action.sword;
            stat.shield += action.shield;
            stat.sprint += action.sprint;
            stat.readiness += action.readinessCost;
            action.executed = false;

            switch (action.type) {
                case 'Move':
                    const moveAction: MoveAction = action as MoveAction;
                    if (moveAction.magnitude !== undefined) {
                        // if action is a free movement action
                        if (moveAction.sprint === 0) {
                            stat.moved = false;
                        }
                        // reposition
                        stat[moveAction.axis] += moveAction.magnitude * -1;
                    }
                    break;
                case 'Loot':
                    const lootAction: LootAction = action as LootAction;
                    tempLootMap.set(getCoordString(lootAction), true);
                    break;
            }
        }

        const playerInfoMessage = await _ownerTextChannel.send(await returnMessageInteractionMenus());

        // returns a Promise that resolves when the player is finished with their moves
        return new Promise((resolve) => {
            let executingActions: Action[] = [];
            let listener: InteractionCollector<Interaction>;

            const listenToQueue = () => {
                listener = setUpInteractionCollect(playerInfoMessage, async itr => {
                    try {
                        if (itr.user.id !== _rS.owner) {
                            listenToQueue();
                            return;
                        }

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
                        log(_err);
                    }
                }, 1);
            }
            const handleSelectMenu = (_sMItr: SelectMenuInteraction): boolean => {
                const code: string = _sMItr.values[0];
                const codeSections: Array<string> = code.split(" ");
                let valid: boolean = false;

                // attacker-index(0) ability-index(1) target-index(2)
                if (codeSections[0] && codeSections[1] && codeSections[2]) {
                    const attackerIndex: number = parseInt(codeSections[0]);
                    const abilityIndex: number = parseInt(codeSections[1]);
                    const targetIndex: number = parseInt(codeSections[2]);

                    const attacker: Stat = _vS.index === attackerIndex?
                        _vS:
                        domain.find(_s => _s.index === attackerIndex)!;
                    const ability: Ability = attacker?.base.abilities[abilityIndex];
                    const weapon: ForgeWeaponObject = attacker?.equipped || attacker?.base.arsenal[0];
                    const target: Stat = domain.find(_s => _s.index === targetIndex)!;

                    debug("ability", ability);

                    if (attacker && ability && weapon && target) {
                        const virtualAttackAction: AttackAction = getAttackAction(_vS, target, weapon, ability, target);
                        valid = this.executeVirtualAttack(virtualAttackAction, _vS);
                        if (valid) {
                            possibleError = '';
                            const realAttackAction = getAttackAction(_rS, target, weapon, ability, target);
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
                    const lootCoordString: StringCoordinate = code.split(" ")?.[1] as StringCoordinate;
                    const c: Array<string> | undefined = lootCoordString?.split(",");
                    if (c?.length === 2) {
                        let x,y;
                        if (Number.isInteger(x = parseInt(c[0])) && Number.isInteger(y = parseInt(c[1]))) {
                            const lootAction: LootAction = getLootAction(_rS, {
                                x: x,
                                y: y,
                            });
                            executingActions.push(lootAction);
                        }
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
                        // get moveAction based on input
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

            // auto end turn
            setTimeout(() => {
                if (listener) {
                    listener.stop();
                }
                this.roundActionsArray.push(...executingActions);
                resolve(void 0);
            }, Battle.ROUND_SECONDS * 1000 );

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

    tickStatuses(_s: Stat, _currentRoundAction: Action): void {
        log(`\tTick status for ${_s.base.class} (${_s.index})...`);
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
            }
            else {
                debug("status.affected.index === _s.index", status.affected.index === _s.index);
                debug("status.affected.HP > 0", status.affected.HP > 0);
            }
            
        }
    }

    // clash methods
    applyClash(_aA: AttackAction, _cR: ClashResult): void {
        const { attacker, target, ability, weapon, } = _aA;
        let { damage } = _cR;
        
        // activate weapon effects
        const Effect: AbilityEffect = new AbilityEffect(_aA, _cR, this);
        _aA.abilityEffectString = Effect.activate();

        // reduce shield token
        if (_cR.fate !== "Miss" && target.shield > 0) {
            target.shield--;
        }

        if (ability.targetting.target === AbilityTargetting.enemy) {
            if (weapon) {
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

                // search for "Labouring" status
                const labourStatus = arrayGetLargestInArray(this.getStatus(target, "labouring"), _s => _s.value);
                if (labourStatus) {
                    labourStatus.value += damage;
                }

                // lifesteal
                const LS = getLifesteal(attacker, ability);
                if (LS > 0) {
                    this.heal(attacker, damage * LS);
                }

                // apply damage
                target.HP -= damage;

                // save accolades
                dealWithAccolade(_cR, attacker, target);
            }
        }
    }
    clash(_aA: AttackAction): ClashResult {
        log(`\tClash: ${_aA.attacker.base.class} => ${_aA.target.base.class}`);
        let fate: ClashResultFate = 'Miss';
        let damage: number = 0, u_damage: number = 0;

        const { attacker, target, weapon, ability } = _aA;

        // roll
        const hit = uniformRandom(1, 100);
        if (weapon) {
            // define constants
            const hitChance = getAcc(attacker, ability) - getDodge(target);
            const crit = getCrit(attacker, ability);
            const minDamage = getDamage(attacker, ability).min;
            const maxDamage = getDamage(attacker, ability).max;
            const prot = getProt(target);

            // see if it crits
            if (hit <= hitChance) {
                // crit
                if (hit <= hitChance * 0.1 + crit) {
                    u_damage = (uniformRandom(average(minDamage, maxDamage), maxDamage)) * 2;
                    fate = "criticalHit";
                }
                // hit
                else {
                    u_damage = uniformRandom(minDamage, maxDamage);
                    fate = "Hit";
                }
            }

            u_damage = clamp(u_damage, 0, 1000);

            // apply protections
            damage = clamp(u_damage * (1 - (prot * target.shield / 3)), 0, 100);
        }

        return {
            damage: damage,
            u_damage: u_damage,
            fate: fate,
            roll: hit,
        };
    }

    // loot
    loot(_owner: OwnerID, _lootCoordString: StringCoordinate): MessageEmbed | null {
        const allLoot: Array<Loot> | null = this.LootMap.get(_lootCoordString) || null;
        if (allLoot && allLoot.length > 0) {
            const lootEmbed = new MessageEmbed({
                title: "You got..."
            });
            let lootString = '';

            // for each lootbox on the tile
            for (let i = 0; i < allLoot.length; i++) {
                const loot: Loot = allLoot[i];
                const userData: UserData | null = this.userDataCache.get(_owner) || null;

                // for each item in the lootbox
                for (let i = 0; i < loot.items.length; i++) {
                    const item: Item = loot.items[i];
                    userData?.inventory.push(item);

                    const totalWorth: number = roundToDecimalPlace(item.getWorth());
                    const totalWeight: number = roundToDecimalPlace(item.getWeight());

                    const MoM: MaterialInfo = item.getMostOccupiedMaterialInfo()!;
                    const MoM_name = formalise(MoM.materialName);
                    const MoM_tag = getGradeTag(MoM);
                    const MoM_price = roundToDecimalPlace(item.getMaterialInfoPrice(MoM), 2);
                    const MoM_weight = roundToDecimalPlace(totalWeight * MoM.occupation, 2);

                    const MeM: MaterialInfo = item.getMostExpensiveMaterialInfo()!;
                    const MeM_name = formalise(MeM.materialName);
                    const MeM_tag = getGradeTag(MeM);
                    const MeM_price = roundToDecimalPlace(item.getMaterialInfoPrice(MeM), 2);
                    const MeM_weight = roundToDecimalPlace(totalWeight * MeM.occupation, 2);

                    lootString +=
                        `__**${item.getDisplayName()}**__ $${totalWorth} (${totalWeight}μ)
                                    \t${MoM_name} (${MoM_tag}) $${MoM_price} (${MoM_weight}μ)
                                    \t${MeM_name} (${MeM_tag}) $${MeM_price} (${MeM_weight}μ)\n`;
                }
            }
            lootEmbed.setDescription(lootString);

            this.LootMap.delete(_lootCoordString);
            // send acquired items
            return lootEmbed;
        }
        return null;
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
                const c = availableCoords[uniformRandom(0, availableCoords.length - 1)];
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
    
    getNextAction(): Action | null {
        const sortedActions = this.roundActionsArray.sort((_a1, _a2) => {
            _a2.priority = getExecutionSpeed(_a2.attacker, extractActions(_a2).aAction?.ability || { speedScale: 1 })
            _a1.priority = getExecutionSpeed(_a1.attacker, extractActions(_a1).aAction?.ability || { speedScale: 1 })
            return _a2.priority - _a1.priority;
        });
        return sortedActions.shift() || null;
    }

    appendReportString(_stat: Stat, _string: string) {
        // const associatedStringArray = _stat.actionsAssociatedStrings;
        // if (associatedStringArray[_round] === undefined) {
        //     associatedStringArray[_round] = [];
        // }
        // if (_string) {
        //     log(`\t\t\tAppending "${_string.replace("\n", "\\n")}" to (${_stat.index})`)
        //     associatedStringArray[_round].push(_string);
        // }
    }

    // actions
    executeAutoWeapons(_action: Action): void {
        // const round = _action.round;

        const executeAuto = (_s: Stat) => {
            const attacker = _s;
            const target = _s.index === _action.attacker.index?
                _action.target:
                _action.attacker;

            _s.base.autoWeapons.forEach(_a => {
                const weaponTarget: AbilityTargetting = _a.targetting.target;
                const intendedVictim: Stat | null =
                    weaponTarget === AbilityTargetting.ally ?
                        // weapon is intended to target friendly units
                        target.team === attacker.team && _a.targetting.AOE !== "self" ?
                            target : // if the action is targetting a friendly unit, use the effect on them.
                            attacker : // if the action is targetting an enemy, use it on self
                        // weapon is intended to target enemies
                        target.team === attacker.team && (!target.pvp || !attacker.pvp) ?
                            null : // the targetted unit is friendly, ignore the autoWeapon.
                            target; // if the targetted is an enemy, unleash the autoWeapon.

                if (intendedVictim) {
                    const selfActivatingAA: AttackAction =
                        getAttackAction(attacker, intendedVictim, null, _a, {
                            x: intendedVictim.x, y: intendedVictim.y
                        });

                    this.executeAttackAction(selfActivatingAA);
                    // totalString.push(weaponEffect.activate());
                }
            });
        }

        executeAuto(_action.attacker);
        if (_action.attacker.index !== _action.target.index) {
            executeAuto(_action.target);
        }
    }
    executeActions() {
        log("Executing actions...")

        const executedActions: Array<Action> = [];
        let executing = this.getNextAction()
        while (executing) {
            this.executeOneAction(executing);
            executedActions.push(executing);
            executing = this.getNextAction();
        }

        return executedActions;
    }
    executeOneAction(_action: Action) {
        log(`\tExecuting action: ${_action.type}, ${_action.attacker.base.class} => ${_action.target.base.class}`)
        const { aAction, mAction, lAction } = extractActions(_action);

        const actionAffected = _action.target;
        const actionFrom = _action.attacker;

        // activate autoWeapons
        let autoWeaponReportString = this.executeAutoWeapons(_action);
        // this.appendReportString(actionAffected, round, autoWeaponReportString);
        // this.appendReportString(actionFrom, round, autoWeaponReportString);

        // apply statuses for target, then report to target
        const affectedStatusString = this.tickStatuses(actionAffected, _action);
        // if (affectedStatusString) {
        //     this.appendReportString(actionAffected, round, affectedStatusString);
        // }

        // if the action is not self-targetting...
        if (actionAffected.index !== actionFrom.index) {
            // apply statuses for attacker, then report to attacker
            const attackerStatusString = this.tickStatuses(actionFrom, _action);
            // if (attackerStatusString) {
            //     this.appendReportString(actionFrom, round, attackerStatusString);
            // }
        }

        switch (_action.type) {
            case 'Attack':
                return this.executeAttackAction(aAction);
            case 'Move':
                return this.executeMoveAction(mAction);
            case 'Loot':
                const lootEmbed: MessageEmbed | null = this.loot(actionAffected.owner, getCoordString(lAction));
                const user: User | null = this.userCache.get(actionAffected.owner) || null;
                if (user && lootEmbed) {
                    user.send({
                        embeds: [lootEmbed]
                    });
                }
                return lootEmbed;
        }
    }
    executeSingleTargetAttackAction(_aA: AttackAction): void {
        const eM: TargetingError | null = this.validateTarget(_aA);
        const { attacker, target } = _aA;

        if (eM) {
            _aA.clashResult = {
                damage: 0,
                u_damage: 0,
                fate: 'Miss',
                roll: -1,
                error: eM,
            }
        }
        else {
            // valid attack
            const clashResult: ClashResult = this.clash(_aA);
            this.applyClash(_aA, clashResult);
            _aA.clashResult = clashResult;
        }
    };
    executeAOEAttackAction(_aA: AttackAction, inclusive = true): void {
        let string = '';
        const center = _aA.coordinate;
        const { weapon, ability, attacker, target } = _aA;
        const blastRadius=
            ability.range?.max||
            weapon?.range.max;

        if (blastRadius) {
            const enemiesInRadius = this.findEntities_radius(center, blastRadius, inclusive);
            for (let i = 0; i < enemiesInRadius.length; i++) {
                const singleTargetAA = getAttackAction(attacker, enemiesInRadius[i], weapon, ability, enemiesInRadius[i]);
                const SAResult = this.executeSingleTargetAttackAction(singleTargetAA);
                string += SAResult;
                // if (SAResult && enemiesInRadius.length > 1 && i !== enemiesInRadius.length - 1) {
                //     string += "\n";
                // }
            }
        }
    };
    executeLineAttackAction(_aA: AttackAction) {
        const { attacker, target, ability, weapon } = _aA;

        const enemiesInLine = this.findEntities_inLine(attacker, target);
        let string = '';
        for (let i = 0; i < enemiesInLine.length; i++) {
            const singleTargetAA = getAttackAction(attacker, target, weapon, ability, enemiesInLine[i]);
            const SAResult = this.executeSingleTargetAttackAction(singleTargetAA);
            string += SAResult;
        }
        return string;
    };
    executeAttackAction(_aA: AttackAction): AttackAction {
        const { attacker, target, weapon, ability, readinessCost: readiness } = _aA;

        switch (ability.targetting.AOE) {
            case "self":
                _aA.target = _aA.attacker;
            case "single":
            case "touch":
                this.executeSingleTargetAttackAction(_aA);
                break;

            case "circle":
                this.executeAOEAttackAction(_aA, true);
                break;

            case "selfCircle":
                this.executeAOEAttackAction(_aA, false);
                break;

            case "line":
                this.executeLineAttackAction(_aA);
                break;
        }

        // save attack results as reportString
        // this.appendReportString(attacker, round, attackResult);
        // if (attacker.index !== target.index) {
        //     this.appendReportString(target, round, attackResult);
        // }

        // expend resources
        _aA.executed = true;
        attacker.readiness -= readiness;
        attacker.stamina -= (weapon?.staminaCost || 0) * ability.staminaScale;
        attacker.weaponUses[getAbilityIndex(ability, attacker)]++;
        handleTokens(attacker, (p, t) => {
            log(`\t\t${attacker.index}) ${t} --${_aA[t]}`)
            attacker[t] -= _aA[t]
        });

        return _aA;
    }
    executeMoveAction(_mA: MoveAction): MoveAction {
        const stat = _mA.target;
        const axis = _mA.axis;

        const possibleSeats: Array<Coordinate> = this.getAvailableSpacesAhead(_mA);
        const furthestCoord: Coordinate = arrayGetLastElement(possibleSeats);

        const newMagnitude: number = furthestCoord?
            getDistance(furthestCoord, _mA.target) * Math.sign(_mA.magnitude):
            0;

        _mA.magnitude = newMagnitude;

        this.CSMap.delete(getCoordString(stat))
        stat[axis] += newMagnitude;
        this.CSMap = this.CSMap.set(getCoordString(stat), stat);
        
        // log(`${_mA.from.base.class} (${_mA.from.index}) 👢${formalize(direction)} ${Math.abs(newMagnitude)} blocks.`);

        const affected = _mA.target;
        _mA.executed = true;
        affected.readiness -= _mA.readinessCost;
        handleTokens(affected, (p, t) => {
            log(`\t\t${affected.index}) ${t} --${_mA[t]}`)
            affected[t] -= _mA[t]
        });

        return _mA;
    }
    heal(_healedStat: Stat, _val: number): void {
        if (_healedStat.HP > 0) {
            const healed: number = clamp(_val, 0, _healedStat.base.maxHP - _healedStat.HP);
            _healedStat.HP += healed;
            _healedStat.accolades.healingDone += healed;
        }
    }

    /** Draws the base map and character icons. Does not contain health arcs or indexi */
    async getNewCanvasMap(): Promise<Canvas> {
        const allStats = this.allStats();

        // draw initial
        const groundImage = this.mapData.map.groundURL?
            await getFileImage(this.mapData.map.groundURL):
            undefined;
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
            let iconCanvas: Canvas = iconCache.get(baseClass) || await getIconCanvas(stat)
            if (!stat.owner && iconCache.get(baseClass) === undefined) {
                iconCache.set(baseClass, iconCanvas);
            }

            // draw on the main canvas
            const imageCanvasCoord = getCanvasCoordsFromBattleCoord({
                x: X,
                y: Y
            }, this.pixelsPerTile, this.height, false);
            ctx.drawImage(iconCanvas, imageCanvasCoord.x, imageCanvasCoord.y,
                Math.min(iconCanvas.width, this.pixelsPerTile),
                Math.min(iconCanvas.height, this.pixelsPerTile)
            );
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
            ctx.strokeStyle = translateRGBAToStringRGBA(normaliseRGBA(style));

            // draw tracing path
            const victimWithinDistance = checkWithinDistance(_aA, getDistance(_aA.attacker, _aA.target));
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
                const hitImage = _aA.ability.targetting.target === AbilityTargetting.ally ?
                    await getFileImage('./images/Shield.png') :
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
            const angle = Math.atan2(y, x);
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
            ctx.strokeStyle = translateRGBAToStringRGBA(normaliseRGBA(style));

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
            const arrivingCanvasCoord = _mA.executed ?
                beforeCanvasCoord :
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
        const actions =
            _actions.map((_a, i) => {
                return getNewObject(_a, {
                    priority: i
                });
            }).reverse();
        const canvas = new Canvas(this.width * 50, this.height * 50);
        const ctx = canvas.getContext("2d");
        const style: RGBA = {
            r: 0,
            g: 0,
            b: 0,
            alpha: 1
        };

        const virtualCoordsMap = new Map<number, Coordinate>();
        const graph = new hGraph<number, Action>(true);

        ctx.fillStyle = translateRGBAToStringRGBA(style);
        ctx.strokeStyle = translateRGBAToStringRGBA(style);
        
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            const attackerIndex = action.attacker.index;
            const victimIndex = action.target.index;
            const victim_beforeCoords = 
                virtualCoordsMap.get(victimIndex)||
                virtualCoordsMap.set(victimIndex, { x: action.target.x, y: action.target.y }).get(victimIndex)!;
            const attacker_beforeCoords =
                virtualCoordsMap.get(attackerIndex) ||
                virtualCoordsMap.set(attackerIndex, { x: action.attacker.x, y: action.attacker.y }).get(attackerIndex)!;

            await dealWithAction(action,
                async (aA: AttackAction) => {
                    const attackRange = getAttackRangeFromAA(aA);
                    if (attackRange) {
                        const { ability } = aA;
                        switch (ability.targetting.AOE) {
                            case "self":
                            case "single":
                            case "touch":
                                appendGraph(aA, attacker_beforeCoords, victim_beforeCoords, i + 1);
                                break;

                            case "circle":
                            case "selfCircle":
                                // coordinate is either 
                                const epicenterCoord = ability.targetting.AOE === "circle" ?
                                    aA.coordinate :
                                    victim_beforeCoords;
                                const affecteds = this.findEntities_radius(
                                    getNewObject(epicenterCoord, { index: victimIndex }), // assign victim
                                    attackRange.radius,
                                    ability.targetting.AOE === "circle" // if circle: damages epicenter as well
                                );

                                for (let i = 0; i < affecteds.length; i++) {
                                    const af = affecteds[i];
                                    // ** technically from "action.from", but for the sake of visual effects, the epicenter
                                    // coords will be fed instead.
                                    const singleTarget: AttackAction = getNewObject(aA, { from: epicenterCoord, affected: af });
                                    appendGraph(singleTarget, epicenterCoord, af, i + 1);
                                }
                                if (ability.targetting.AOE === "circle") {
                                    // show AOE throw trajectory
                                    appendGraph(aA, attacker_beforeCoords, epicenterCoord, i + 1);
                                }

                                // draw explosion range
                                for (const coord of getCoordsWithinRadius(attackRange.radius, epicenterCoord, true)) {
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
        
        // draw arrows
        for (const [coordString, arrayOfConnections] of graph.getEntries()) {
            // log(`Node ${key}`);
            const solidColumns: number = clamp(arrayOfConnections.length, 0, 10); // attack/move lines
            const columns: number = 2 * solidColumns + 1; // gap + attack/move lines
            const columnWidth: number = Math.floor(this.pixelsPerTile / columns);
            for (let columnIndex = 1; columnIndex <= columns; columnIndex++) {
                const widthStart = (columnIndex-1) * columnWidth;
                const widthEnd = widthStart + columnWidth;
                // is solid column
                if (columnIndex % 2 === 0) {
                    // log(`Solid edge #${o/2}`);
                    const edgeIndex = (columnIndex / 2) - 1;
                    const edge = arrayOfConnections[edgeIndex]; // edge.print();
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
                                x: isYtransition ?
                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
                                    0,
                                y: isXtransition ?
                                    ((widthEnd + widthStart) / 2) - (this.pixelsPerTile / 2) :
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
            const healthPercentage = clamp(stat.HP / stat.base.maxHP, 0, 1);
            ctx.strokeStyle = translateRGBAToStringRGBA({
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
                (this.pixelsPerTile / 2) * 0.9,
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
        // thumbnail (top right icon) generation
        const characterBaseCanvas: Canvas = await getIconCanvas(stat, {
            crop: true,
            frame: true,
            healthArc: true,
        });
        const { width, height } = characterBaseCanvas;
        const { canvas, ctx } = startDrawing(width, height);
        ctx.drawImage(characterBaseCanvas, 0, 0, width, height);

        // player information embed
        const embed = await this.getFullPlayerEmbed(stat);
 
        return {
            embeds: [embed],
            files: [
                { attachment: canvas.toBuffer(), name: "thumbnail.png" }
            ]
        };
    }
    async getFullPlayerEmbed(stat: Stat): Promise<MessageEmbed> {
        const ReadinessBar = `${'`'}${addHPBar(Battle.MAX_READINESS, stat.readiness)}${'`'}`;
        const staminaBar = `${'`'}${
            addHPBar(stat.base.maxStamina, stat.stamina, Math.round(stat.base.maxStamina / 4))
        }${'`'}`;
        const explorerEmbed = new MessageEmbed({
            description:
                `*Readiness* (${Math.round(stat.readiness)}/${Battle.MAX_READINESS})
                ${ReadinessBar}
                *Stamina* (${Math.round(stat.stamina)}/${stat.base.maxStamina})
                ${staminaBar}`,
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
    findEntity_args(_args: Array<string>, _attacker: Stat, _weapon?: Ability): Stat | null {
        const allStats = this.allStats();
        const ignore: Team[] = ["block"];
        const targetNotInIgnore = (c:Stat) => c.team && !ignore.includes(c.team);
        if (_weapon && _weapon.targetting.target === AbilityTargetting.enemy) ignore.push("player");
        if (_weapon && _weapon.targetting.target === AbilityTargetting.ally) ignore.push("enemy");

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
        const entities = _domain.filter(_s =>
            (_s.index !== stat.index || (isStat && _includeSelf)) &&
            !ignored(_s) &&
            Math.sqrt(Math.pow((_s.x - stat.x), 2) + Math.pow((_s.y - stat.y), 2)) <= _r
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

    removeEntity(_stat: Stat) {
        this.CSMap.delete(getCoordString(_stat));
    }

    // validation
    validateTarget(_attacker: Stat, _weapon: ForgeWeaponObject | null, _ability: Ability, _target: Stat): TargetingError | null;
    validateTarget(_aA: AttackAction): TargetingError | null;
    validateTarget(_stat_aa: Stat | AttackAction, _weapon?: ForgeWeaponObject | null, _ability?: Ability, _target?: Stat): TargetingError | null {
        const eM: TargetingError = {
            reason: "",
            value: null,
        };

        let attackerStat, targetStat, weapon, ability;
        if ((_stat_aa as Stat).index === undefined) // is aa
        {
            const aa = _stat_aa as AttackAction;
            attackerStat = aa.attacker;
            targetStat = aa.target;
            weapon = aa.weapon;
            ability = aa.ability;
        }
        else { // is stat
            attackerStat = _stat_aa as Stat;
            targetStat = _target!;
            weapon = _weapon!;
            ability = _ability!;
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
        if (
            ability.targetting.target === AbilityTargetting.enemy&&
            ability.targetting.AOE !== "self"&&
            ability.targetting.AOE !== "selfCircle"&&
            attackerStat.team === targetStat.team&&
            (!targetStat.pvp || !attackerStat.pvp)
        )
        {
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
        if (attackerStat.sword < ability.sword) {
            eM.reason = "Not enough Sword (🗡️) tokens.";
            eM.value = attackerStat.sword;
            return eM;

        }
        if (attackerStat.shield < ability.shield) {
            eM.reason = "Not enough Shield (🛡️) tokens.";
            eM.value = attackerStat.shield;
            return eM;
        }
        if (attackerStat.sprint < ability.sprint) {
            eM.reason = "Not enough Sprint (👢) tokens.";
            eM.value = attackerStat.sprint;
            return eM;
        }

        // weapon uses
        if (ability.UPT <= getWeaponUses(ability, attackerStat)) {
            eM.reason = `You can only use this ability ${ability.UPT} time(s) per turn.`;
            eM.value = getWeaponUses(ability, attackerStat);
            return eM;
        }

        // weird stats
        if (targetStat.team !== "block" && (targetStat.base.protection === undefined || targetStat.HP === undefined)) {
            eM.reason = `Target "${targetStat.base.class}" cannot be attacked.`;
            return eM;
        }

        // target is a block
        if (targetStat.team === "block") {
            eM.reason = `Target "${targetStat.base.class}" is a wall.`;
            return eM;
        }

        // only valid errors if weapon is not a self-target
        if (
            ability.targetting.AOE !== "selfCircle"&&
            ability.targetting.AOE !== "self"&&
            ability.targetting.AOE !== "touch"
        ) {
            // out of range
            if (getDistance(attackerStat, targetStat) > weapon.range.max || getDistance(attackerStat, targetStat) < weapon.range.min) {
                eM.reason = "Target is too far or too close.";
                eM.value = roundToDecimalPlace(getDistance(attackerStat, targetStat), 1);
                return eM;
            }

            // invalid self-targeting
            if (weapon.range.min !== 0 && targetStat.index === attackerStat.index) {
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
        const coordString: StringCoordinate = getCoordString(_s);
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
                const magAxis = translateDirectionToMagnitudeAxis(numDir);

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