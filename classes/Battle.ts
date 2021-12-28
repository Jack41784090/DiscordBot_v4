import { CategoryChannel, Client, DiscordAPIError, Guild, GuildMember, Message, MessageAttachment, MessageCollector, MessageEditOptions, MessageEmbed, MessageEmbedImage, MessageOptions, MessagePayload, OverwriteData, TextChannel, User } from "discord.js";
import { addHPBar, clearChannel, counterAxis, extractCommands, findLongArm, getActionsTranslate, getAHP, getDirection, getLoadingEmbed, getSpd, getCompass, log, newWeapon, random, returnGridCanvas, roundToDecimalPlace, checkWithinDistance, average, getAcc, getDodge, getCrit, getDamage, getProt, getLifesteal, getLastElement, capitalize, formalize, dealWithAccolade, getWeaponUses, getCoordString, getMapFromCS, getBaseStat, getStat, getWeaponIndex, getCSFromMap, printCSMap, getNewObject, startDrawing, dealWithAction, printAction, sendToSandbox, getRandomCode, getDeathEmbed, getSelectMenuActionRow, setUpInteractionCollect, getWithSign, getLargestInArray, getCoordsWithinRadius, getPyTheorem, dealWithUndoAction, HandleTokens as HandleTokens, getNewNode, getDistance, getMoveAction, debug, getAttackAction, normaliseRGBA, clamp, stringifyRGBA } from "./Utility";
import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { getBufferFromImage, getFileImage, getIcon, getUserData, saveBattle } from "./Database";
import enemiesData from "../data/enemiesData.json";

import fs from 'fs';
import { MinHeap } from "./MinHeap";
import { Action, ActionType, AINode, AttackAction, BaseStat, BotType, ClashResult, ClashResultFate, Coordinate, Direction, EnemyClass, Mapdata, MenuOption, MoveAction, MovingError, OwnerID, PriorityRound, RGBA, Stat, TargetingError, Team, Vector2, Weapon, WeaponAOE, WeaponTarget } from "../typedef";
import { hGraph } from "./hGraphTheory";

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

    // Status-related Information <Up for Change>
    /* beforeActionStatusVL: Object;
    afterActionStatusVL: Object;
    beforeStatusVL: Object;
    afterStatusVL: Object;
    onHitStatusVL: Object;
    statusArray: Array<typeof Status>; */

    // Round Actions Information (Resets every Round)
    roundActionsArray: Array<Action>;
    roundSavedCanvasMap: Map<number, Canvas>;

    // Entity-Related Information
    enemiesToBeSpawnedArray: Array<Stat>;
    totalEnemyCount: number;
    enemyCount: number;
    playerCount: number;
    allIndex: Map<number, boolean>;

    private constructor(_mapData: Mapdata, _author: User, _message: Message, _client: Client) {
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

        // sort status
        // this.beforeActionStatusVL = {};
        // this.afterActionStatusVL = {};
        // this.beforeStatusVL = {};
        // this.afterStatusVL = {};
        // this.onHitStatusVL = {};

        // action strings
        this.roundActionsArray = [];
        this.roundSavedCanvasMap = new Map<number, Canvas>();

        const allStats = this.allStats(true);

        // fixing spawning
        this.enemiesToBeSpawnedArray = [];
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
    static async Start(_mapData: Mapdata, _author: User, _message: Message, _party: Array<OwnerID>, _client: Client) {
        const battle = new Battle(_mapData, _author, _message, _client);

        // add players to spawning list
        for (let i = 0; i < _party.length; i++) {
            const ownerID = _party[i];
            const userData = await getUserData(ownerID);
            const blankStat = getStat(getBaseStat(userData.equippedClass), ownerID);
            battle.enemiesToBeSpawnedArray.push(blankStat);
        }

        // add enemies to the spawning list
        for (const [key, value] of Object.entries(_mapData.enemiesInfo)) {
            const Eclass = key as EnemyClass;
            const mod = { name: `${Eclass}` };
            const enemyBase: BaseStat = getNewObject(enemiesData[Eclass], mod) as BaseStat;
            const spawnCount = random(value.min, value.max);

            for (let i = 0; i < spawnCount; i++) {
                battle.totalEnemyCount++;
                battle.enemyCount++;
                battle.enemiesToBeSpawnedArray.push(getStat(enemyBase));
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
        this.roundSavedCanvasMap = new Map<number, Canvas>();

        // SPAWNING
        log("Spawning...");
        this.SpawnOnSpawner();
        await saveBattle(this);
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

            // randomly assign tokens
            for (let i = 0; i < 2; i++) {
                const got = random(0, 2);
                switch (got) {
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
                s[t] = clamp(p, 0, 5);
            })

            // increment readiness
            if (s.team && s.readiness <= 50) {
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

        //#region SORT STATUS EFFECTS
        // log("Sorting status...");
        // this.sortStatus();
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

        // this.BeforeAll(allStats);

        // check death: after passive
        // this.CheckDeath(allStats);

        //#region SAVE CURRENT MAP TO LOCAL
        log("Saving current map to local...")
        
        // get a new image of the map from scratch and convert it to DataURL for storage.
        const currentMapDataURL = (await this.getNewCanvasMap()).toDataURL();
        await new Promise((resolve) => {
            const thePath = `./maps/battle-${this.author.id}.txt`;
            fs.writeFile(thePath, currentMapDataURL, 'utf8', () => {
                resolve(void 0);
            });
        });
        // log("||=> Success.");

        //#endregion

        //#region PLAYING PHASE. INPUT ACTIONS!
        const reportPromises: Promise<unknown>[] = []; // to save the promises waiting for player responses

        log("Playing phase!");
        for (const realStat of allStats) {
            // if the entity is dead or is just an inanimate block, skip turn
            if (realStat.HP <= 0 || realStat.team === "block") continue;

            // reset weapon uses for entity
            realStat.weaponUses.forEach(wU => wU = 0);
            // reset moved
            realStat.moved = false;

            //#region PLAYER CONTROL
            if (realStat.botType === BotType.naught) {
                // fetch the Discord.User 
                const user: User | null = await this.client.users.fetch(realStat.owner)
                    .then(u => u)
                    .catch(err => {
                        console.log(err);
                        return null;
                    });

                // get a copy of stat (main reference in player control) from the CSMap
                const virtualStat: Stat = getNewObject(realStat,
                    {
                        username: (user?
                            user.username:
                            realStat.owner)
                    }
                );

                // creating channel
                const channelAlreadyExist = this.guild.channels.cache.find(c => c.name === virtualStat.owner && c.type === 'GUILD_TEXT') as TextChannel;
                const createdChannel = channelAlreadyExist || await this.guild.channels.create(`${virtualStat.owner}`, { type: 'GUILD_TEXT' });
                createdChannel.setParent(commandCategory.id);
                const existingPermissions_everyone = createdChannel.permissionOverwrites.cache.get(this.guild.roles.everyone.id)?.deny.toArray();
                const existingPermissions_author = createdChannel.permissionOverwrites.cache.get(virtualStat.owner)?.allow.toArray();
                if (
                    !channelAlreadyExist||
                    !existingPermissions_author||
                    !existingPermissions_everyone||
                    existingPermissions_author.length > 1 ||
                    existingPermissions_everyone.length > 1 ||
                    !existingPermissions_author.includes('VIEW_CHANNEL') ||
                    !existingPermissions_everyone.includes('VIEW_CHANNEL')
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
                const selectedTarget = this.findEntity_closest(virtualStat, ["block", virtualStat.team]);
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
        await this.totalExecution();
        //#endregion

        for (let i = 0; i < allStats.length; i++) {
            const s = allStats[i];
            HandleTokens(s, (p, t) => {
                if (p > 3) {
                    s[t] = 3;
                }
            });
        }

        // check death: after player round
        this.checkDeath(allStats);

        // status: check deaths after 

        //#region REPORT ACTIONS
        log("Reporting...")
        const allPromise: Promise<unknown>[] = [];

        // for each player, send an embed of actions completed of the player.
        const players = allStats.filter(s => s.botType === BotType.naught);
        players.forEach(async stat => {
            const greatestRoundNumber: PriorityRound = getLargestInArray(Array.from(this.roundSavedCanvasMap.keys()));
            const commandRoomReport = this.sendReportToCommand(stat.owner, greatestRoundNumber);

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
        // allPromise.forEach(console.log);
        //#endregion

        //#region Finish the Round
        log("Finishing Round...");
        // if (this.playerCount === 0 || (this.totalEnemyCount === 0 && this.spawning.length === 0))
        if (false)
        {
            // database work
            // await Database.updateOrAddUser(author, { status: 'idle' });
            // await Database.WriteBattle(author, Object.assign(this.returnObject(), { finished: true }));

            // == ACCOLADES ==
            const endEmbedFields = [];
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
            this.channel.send({
                embeds: [new MessageEmbed({
                    title: this.totalEnemyCount === 0 ? "VICTORY!" : "Defeat.",
                    fields: endEmbedFields,
                })]
            });
        }
        else {
            this.StartRound();
        }
        //#endregion
    }

    /** Execute function on every stat of players */
    callbackOnParty(arg0: (stat: Stat) => void) {
        throw new Error("Method not implemented.");
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
    async sendReportToCommand(roomID: string, round: number): Promise<boolean> {
        const embed = new MessageEmbed({ title: `Round ${round}`, }).setImage("attachment://map.png");
        const menuOptions: MenuOption[] = Array.from(this.roundSavedCanvasMap.keys()).map(rn => {
            return {
                label: `Round ${rn}`,
                value: `${rn}`,
            }
        });
        const chosenCanvas = this.roundSavedCanvasMap.get(round);
        if (chosenCanvas) {
            const messageOption: MessageOptions = {
                embeds: [embed],
                components: [getSelectMenuActionRow(menuOptions)],
                files: [{ attachment: chosenCanvas.toBuffer(), name: 'map.png' }]
            };

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

    getCanvasCoordsFromBattleCoord(s: Coordinate) {
        return {
            x: s.x * this.pixelsPerTile + this.pixelsPerTile/2,
            y: (this.height - s.y) * this.pixelsPerTile - this.pixelsPerTile/2
        };
    }

    drawSquareOnBattleCoords(ctx: NodeCanvasRenderingContext2D, coord: Coordinate, rgba?: RGBA) {
        const canvasCoord = this.getCanvasCoordsFromBattleCoord(coord);
        if (rgba) {
            ctx.fillStyle = stringifyRGBA(rgba);
        }
        ctx.fillRect(canvasCoord.x, canvasCoord.y, this.pixelsPerTile, this.pixelsPerTile);
    }

    executeVirtualAttack(attackAction: AttackAction, virtualStat: Stat) {
        const target = attackAction.affected;
        const weapon = attackAction.weapon;
        const check: TargetingError | null = this.validateTarget(virtualStat, attackAction.weapon, target);

        if (check === null) { // attack goes through
            virtualStat.weaponUses[getWeaponIndex(weapon, virtualStat)]++;

            virtualStat.readiness -= attackAction.readiness;
            HandleTokens(virtualStat, (p, t) => {
                virtualStat[t] -= attackAction[t];
            });
        }
        else { // attack cannot go through
            log(`Failed to target. Reason: ${check.reason} (${check.value})`);
        }
        return check === null;
    };
    executeVirtualMovement (moveAction: MoveAction, virtualStat: Stat): boolean {
        log(`\tExecuting virtual movement for ${virtualStat.base.class} (${virtualStat.index}).`)
        const check: MovingError | null = this.validateMovement(virtualStat, moveAction);

        if (check === null) {
            log("\t\tMoved!");

            // spending sprint to move
            if (virtualStat.moved === true) {
                HandleTokens(moveAction, (p, type) => {
                    if (type === "sprint") {
                        virtualStat.sprint -= p;
                    }
                });
            }
            // other resource drain
            virtualStat.readiness -= Battle.MOVE_READINESS * Math.abs(moveAction.magnitude);
            virtualStat.moved = true;
        }
        else {
            log(`\t\tFailed to move. Reason: ${check.reason} (${check.value})`);
        }
        return check === null;
    };

    // action reader methods
    readActions(time: number, infoMessage: Message, virtualStat: Stat, realStat: Stat) {
        if (realStat === undefined) {
            throw Error(`Fatal error at readActions: cannot find realStat. (${virtualStat.base.class} (${virtualStat.index}))`)
        }
        // returns a Promise that resolves when the player is finished with their moves
        return new Promise((resolve) => {
            let currentListener: NodeJS.Timer;
            const responseQueue: Message[] = [];
            const { x, y, readiness, sword, shield, sprint } = virtualStat;

            let executingActions: Action[] = [];
            let infoMessagesQueue: Message[] = [infoMessage];
            const channel = infoMessage.channel;

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
                        case "v":
                        case "down":
                        case "right":
                        case "h":
                        case "r":
                        case "left":
                        case "l":
                            // get moveAction based on input (blackboxed)
                            const moveAction = getMoveAction(virtualStat, actionName, infoMessagesQueue.length, moveMagnitude);

                            // validate + act on (if valid) movement on virtual map
                            valid = this.executeVirtualMovement(moveAction!, virtualStat);

                            // movement is permitted
                            if (valid) {
                                const realMoveStat = getMoveAction(realStat, actionName, infoMessagesQueue.length, moveMagnitude);
                                mes.react('✅');
                                executingActions.push(realMoveStat);
                            }
                            else {
                                mes.react('❎');
                                const check = this.validateMovement(virtualStat, moveAction)!;
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
                            const attackTarget = this.findEntity_args(actionArgs, virtualStat);
                            if (attackTarget === null) {
                                mes.react('❎');
                                const check = this.validateTarget(virtualStat, null, attackTarget)!;
                                if (check) {
                                    channel.send({
                                        embeds: [new MessageEmbed({
                                            title: check.reason,
                                            description: `Failed to move. Reference value: __${check.value}__`,
                                        })]
                                    });
                                }
                            }
                            else {
                                const range = getDistance(attackTarget, virtualStat);
                                const listOfWeaponsInRange = virtualStat.base.weapons.filter(w => (
                                    w.Range[0] <= range &&
                                    w.Range[1] >= range &&
                                    w.targetting.target === WeaponTarget.enemy
                                ));
                                const weaponChosen = listOfWeaponsInRange[0];

                                const virtualAttackAction = getAttackAction(virtualStat, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                valid = this.executeVirtualAttack(virtualAttackAction, virtualStat);

                                if (valid) {
                                    mes.react('✅');
                                    const realAttackAction = getAttackAction(realStat, attackTarget, weaponChosen, attackTarget, infoMessagesQueue.length);
                                    executingActions.push(realAttackAction);
                                }
                                else {
                                    mes.react('❎');
                                    const check = this.validateTarget(virtualStat, weaponChosen, attackTarget)!;
                                    if (check) {
                                        channel.send({
                                            embeds: [new MessageEmbed({
                                                title: check.reason,
                                                description: `Failed to move. Reference value: __${check.value}__`,
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
                            infoMessagesQueue = [infoMessage];
                            Object.assign(virtualStat, { x: x, y: y, readiness: readiness, sword: sword, shield: shield, sprint: sprint });
                            await clearChannel(channel as TextChannel, infoMessage);
                            break;

                        case "end":
                            newCollector.stop();
                            log(`Ended turn for "${virtualStat.name}" (${virtualStat.base.class})`);
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
                                dealWithUndoAction(virtualStat, undoAction!);
                                infoMessagesQueue.pop();
                                await clearChannel(channel as TextChannel, getLastElement(infoMessagesQueue));
                            }
                            break;

                        default:
                            const targetedWeapon = virtualStat.base.weapons.find(w => w.Name.toLowerCase().search(actionName) !== -1);
                            if (targetedWeapon) {
                                mes.react('✅');
                                const victim = this.findEntity_args(actionArgs, virtualStat, targetedWeapon);
                                if (victim === null) {
                                    valid = false;
                                }
                                else {
                                    let coord: Coordinate;
                                    const AOE = targetedWeapon.targetting.AOE;
                                    if (AOE === "self" || AOE === "selfCircle") {
                                        coord = {
                                            x: virtualStat.x,
                                            y: virtualStat.y,
                                        }
                                    }
                                    else {
                                        coord = {
                                            x: victim.x,
                                            y: victim.y
                                        }
                                    }

                                    const attackAction = getAttackAction(virtualStat, victim, targetedWeapon, coord, infoMessagesQueue.length);
                                    valid = this.executeVirtualAttack(attackAction, virtualStat);
                                }
                            }
                            else {
                                mes.react('❎');
                                setTimeout(() => mes.delete().catch(console.log), 10 * 1000);
                            }
                            break;
                    }

                    debug("\tvalid", valid !== null);

                    if (valid) {
                        // send the predicted map of the next move to channel
                        const messageOptions = await this.getFullPlayerEmbedMessageOptions(virtualStat, executingActions);
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
                        listenToQueue();
                    }
                }
            }

            const newCollector = new MessageCollector(channel, {
                filter: m => m.author.id === virtualStat.owner,
                time: time * 1000,
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
    private getIndex_lookUp(min: number, max: number): number | null {
        if (Math.abs(min - max) <= 1) return null;

        const middle = Math.floor((max + min) / 2);
        const got = this.allIndex.get(middle);
        // log(min, middle, max);

        if (!got) return middle;
        else return this.getIndex_lookUp(min, middle) || this.getIndex_lookUp(middle, max);
    }
    getIndex(stat?: Stat) {
        if (this.allIndex.size < 1) {
            if (stat) stat.index = 0;
            return 0;
        }

        const indexi = Array.from(this.allIndex.keys()).sort((a, b) => a - b);
        let lookUpIndex = this.getIndex_lookUp(0, getLastElement(indexi));

        if (lookUpIndex === null) lookUpIndex = getLastElement(indexi) + 1;

        if (stat) {
            stat.index = lookUpIndex;
        }

        return lookUpIndex;
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
        return this.width > coord.x && this.height > coord.y && coord.x >= 0 && coord.y >= 0;
    }

    // clash methods
    clashAfterMath(clashResult: ClashResult, attacker: Stat, target: Stat, weapon: Weapon): string;
    clashAfterMath(clashResult: ClashResult, attackAction: AttackAction): string;
    clashAfterMath(clashResult: ClashResult, attacker_attackAction: Stat | AttackAction, _target?: Stat, _weapon?: Weapon): string {
        const attacker = (attacker_attackAction as AttackAction).from || attacker_attackAction as Stat;
        const target = (attacker_attackAction as AttackAction).affected || _target;
        const weapon = (attacker_attackAction as AttackAction).weapon || _weapon;
        let returnString = '';

        // vantage

        // effects

        // apply basic weapon damage
        returnString += this.applyDamage(attacker, target, weapon, clashResult);

        // retaliation

        return returnString;
    }
    applyDamage(attacker: Stat, target: Stat, weapon: Weapon, clashResult: ClashResult) {
        let returnString = '';
        const CR_damage = clashResult.damage;
        const CR_fate = clashResult.fate;
        const CR_roll = clashResult.roll;
        switch (weapon.targetting.target) {
            // damaging
            case WeaponTarget.enemy:
                const hitRate = (getAcc(attacker, weapon) - getDodge(target)) < 100 ? getAcc(attacker, weapon) - getDodge(target) : 100;
                const critRate = (getAcc(attacker, weapon) - getDodge(target)) * 0.1 + getCrit(attacker, weapon);

                dealWithAccolade(clashResult, attacker, target);

                returnString += `**${attacker.base.class}** (${attacker.index}) ⚔️ **${target.base.class}** (${target.index}) __*${weapon.Name}*__${hitRate}% (${roundToDecimalPlace(critRate)}% Crit)**${CR_fate}!** -**${roundToDecimalPlace(CR_damage)}** HP`;
                if (target.HP > 0 && target.HP - CR_damage <= 0) returnString += "**KILLING BLOW!**";
                const LS = getLifesteal(attacker, weapon);
                if (LS > 0) {
                    returnString += this.heal(attacker, CR_damage * LS);
                }
                target.HP -= CR_damage;
                break;

            // non-damaging
            case WeaponTarget.ally:
                returnString += `**${attacker.base.class}** 🛡️ **${target && target.index !== attacker.index ? target.base.class : ""}** (*${weapon.Name}*)`;
                returnString += "";
                break;
        }
        return returnString;
    }
    clash(attacker: Stat, defender: Stat, weapon: Weapon): ClashResult {
        let fate: ClashResultFate = 'Miss';
        let roll: number, damage: number, u_damage: number = 0;

        // define constants
        const hitChance = getAcc(attacker, weapon) - getDodge(defender);
        const crit = getCrit(attacker, weapon);
        const minDamage = getDamage(attacker, weapon)[0];
        const maxDamage = getDamage(attacker, weapon)[1];
        const prot = getProt(defender);

        // roll
        const hit = random(1, 100);
        roll = hit;

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

        if (u_damage < 0) u_damage = 0;

        // apply protections
        damage = u_damage * (1 - prot);

        return {
            damage: damage,
            u_damage: u_damage,
            fate: fate,
            roll: roll,
        };
    }

    // spawning methods
    Spawn(unit: Stat, coords: Coordinate) {
        this.setIndex(unit);

        unit.x = coords.x;
        unit.y = coords.y;
        this.CSMap.set(getCoordString(coords), unit);
    }
    SpawnOnSpawner(unit?: Array<Stat>) {
        // adding addition units to be spawned this round.
        if (unit) {
            this.enemiesToBeSpawnedArray = this.enemiesToBeSpawnedArray.concat(unit);
        }

        while (this.enemiesToBeSpawnedArray[0]) {
            const stat = this.enemiesToBeSpawnedArray.shift() as Stat;

            // 1. look for spawner
            const possibleCoords = this.mapData.map.spawners.filter(s => s.spawns === stat.team).map(s => {
                return { x: s.x, y: s.y };
            });

            // 2. look for coords if occupied and spawn if not
            const availableCoords = possibleCoords.filter(c => !this.CSMap.has(getCoordString(c)));

            // 3. Spawn on Coords
            if (availableCoords.length > 0) {
                const c = availableCoords[random(0, availableCoords.length - 1)];
                this.Spawn(stat, c);
                // log(stat.base.class + " @ " + c.x + "," + c.y);
            }
        }
    }

    // execute actions
    async totalExecution() {
        // sort actions in priority using map
        const priorityActionMap = new Map<PriorityRound, Action[]>();
        for (let i = 0; i < this.roundActionsArray.length; i++) {
            const act: Action = this.roundActionsArray[i];
            const actionListThisRound: Action[] | undefined = priorityActionMap.get(act.priority);

            if (actionListThisRound)
                actionListThisRound.push(act);
            else
                priorityActionMap.set(act.priority, [act]);
        }

        // find the latest action's priority
        const latestPrio: PriorityRound = getLargestInArray(this.roundActionsArray.map(a => a.priority));

        // execute every move from lowest priority to highest
        for (let i = 0; i <= latestPrio; i++) {
            const expectedActions: Action[] | undefined = priorityActionMap.get(i);
            if (expectedActions) {
                this.sortActionsByGreaterPrior(expectedActions);

                // draw the base tiles and characters (before executing actions)
                let canvas = this.roundSavedCanvasMap.get(i);
                if (!canvas) {
                    canvas = new Canvas(this.width * 50, this.height * 50);
                    if (canvas) this.roundSavedCanvasMap.set(i, canvas);
                }
                const ctx = canvas.getContext("2d");
                ctx.drawImage(await this.getNewCanvasMap(), 0, 0, canvas.width, canvas.height);

                const expectedCanvas = await this.getActionArrowsCanvas(expectedActions, {
                    r: 255,
                    g: 0,
                    b: 0,
                    alpha: 0.25
                });
                const executedActions = this.executeActions(expectedActions);
                const actualCanvas = await this.getActionArrowsCanvas(executedActions);

                // draw executed actions
                ctx.drawImage(actualCanvas, 0, 0, canvas.width, canvas.height);

                // draw the arrows of expected actions on top
                // ctx.drawImage(expectedCanvas, 0, 0, canvas.width, canvas.height);

                // update the final canvas
                this.roundSavedCanvasMap.set(i, canvas);
            }
        }
    }
    getGreaterPrio (a: Action){ return (1000 * (20 - a.priority)) + (a.from.readiness - a.readiness)};
    sortActionsByGreaterPrior(actions: Action[]) {
        const sortedActions = actions.sort((a, b) => this.getGreaterPrio(b) - this.getGreaterPrio(a));
        return sortedActions;
    }
    executeActions(actions: Action[]) {
        log("Executing actions...")

        const returning: Action[] = [];
        this.sortActionsByGreaterPrior(actions);

        let executing = actions.shift();
        while (executing) {
            returning.push(this.executeOneAction(executing));
            executing = actions.shift();
        }
        
        return returning;
    }
    executeOneAction(action: Action, show = true) {
        const stat = action.from;
        const mAction = action as MoveAction;
        const aAction = action as AttackAction;

        // =========LOG=========
        if (show && 'axis' in action) {
            log(`\tmove: ${mAction.axis} ${mAction.magnitude}`);
        }
        else if (show) {
            log(`\tattack: ${aAction.affected.base.class} (${aAction.affected.index}) using ${aAction.weapon.Name}`);
        }
        // =========LOG=========

        action.executed = true;
        stat.readiness -= action.readiness;
        HandleTokens(stat, (p, t) => stat[t] -= action[t]);
        return action.type === 'Attack' ?
            this.executeAttackAction(aAction):
            this.executeMoveAction(mAction);
    }

    // actions
    executeAttackAction(attackAction: AttackAction): AttackAction {
        const target = attackAction.affected;
        const attacker = attackAction.from;
        const weapon = attackAction.weapon;

        const SA = (gStat = attacker, gTarget = target) => {
            const eM = this.validateTarget(attacker, weapon, target);
            
            if (eM) {
                log(`${attacker.base.class} failed to attack ${target.base.class}. Reason: ${eM.reason}`);
                // return `**${attacker.base.class}** (${attacker.index}) ⚔️ **${target.base.class}** (${target.index}) ❌${eM.reason}${eM.value !== null ? ` ( ${eM.value} )` : ""}`;
            } else {
                // valid attack
                const clashResult = this.clash(gStat, gTarget, weapon);
                const clashAfterMathString = this.clashAfterMath(clashResult, gStat, gTarget, weapon);
                // return clashAfterMathString + "";
            }
        };
        const AOE = (center: Coordinate, inclusive: boolean) => {
            const enemiesInRadius = this.findEntities_radius(center, weapon.Range[2] || weapon.Range[1], inclusive);
            const arrayOfResults = [];
            let string = '';
            for (let i = 0; i < enemiesInRadius.length; i++) {
                const SAResult = SA(attacker, enemiesInRadius[i]);
                string += SAResult;
                arrayOfResults.push(SAResult);
            }
            // return string;
        };
        const line = () => {
            const yDif = target.y - attacker.y;
            const xDif = target.x - attacker.x;
            const slope = yDif / xDif;
            log(`   slope: ${slope}`);
            const enemiesInLine = this.findEntities_inLine(attacker, target);
            log(`   ${enemiesInLine.length} enemies in line`);
            let string = '';
            const arrayOfResults = [];
            for (let i = 0; i < enemiesInLine.length; i++) {
                const SAResult = SA(attacker, enemiesInLine[i]);
                string += SAResult;
                arrayOfResults.push(SAResult);
            }
        };

        switch (weapon.targetting.AOE) {
            case "single":
            case "touch":
                SA();
                break;

            case "circle":
                AOE(attackAction.coordinate, true);
                break;

            case "selfCircle":
                AOE(attacker, false);
                break;

            case "line":
                line();
                break;
        }

        return attackAction;
    }
    executeMoveAction(moveAction: MoveAction): MoveAction {
        const stat = moveAction.affected;
        const axis = moveAction.axis;

        const possibleSeats = this.getAvailableSpacesAhead(moveAction);
        const finalCoord = getLastElement(possibleSeats);

        const newMagnitude = (finalCoord ? getDistance(finalCoord, moveAction.affected) : 0) * Math.sign(moveAction.magnitude);
        const direction = getDirection(axis, newMagnitude);

        this.CSMap.delete(getCoordString(stat))
        stat[axis] += newMagnitude;
        this.CSMap = this.CSMap.set(getCoordString(stat), stat);
        
        console.log(`${moveAction.from.base.class} (${moveAction.from.index}) 👢${formalize(direction)} ${Math.abs(newMagnitude)} blocks.`);

        return getNewObject(moveAction, { magnitude: newMagnitude });
    }
    heal(stat: Stat, value: number): string {
        const beforeHP = roundToDecimalPlace(stat.HP);
        if (stat.HP > 0) {
            stat.HP += value;
            if (stat.HP > getAHP(stat)) stat.HP = getAHP(stat);
        }
        const afterHP = roundToDecimalPlace(stat.HP);

        stat.accolades.healingDone += (afterHP - beforeHP);
        return beforeHP !== afterHP ? `✚ ${beforeHP} => ${afterHP}` : '';
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
    async getNewCanvasMap(): Promise<Canvas> {
        const allStats = this.allStats();

        // draw initial
        const groundImage = await getFileImage(this.mapData.map.groundURL);
        const canvas = returnGridCanvas(this.height, this.width, this.pixelsPerTile, groundImage);
        const ctx = canvas.getContext('2d');

        // putting other stats in the map
        for (let i = 0; i < allStats.length; i++) {
            const stat = allStats[i];
            const X = stat.x;
            const Y = stat.y;

            // log(`   || Loading an icon: "${stat.base.iconURL}"...`);
            let iconImage: Image = await getIcon(stat);
            // log(`   ||=> Done.`);

            ctx.drawImage(iconImage, X * this.pixelsPerTile, (this.height - 1 - Y) * this.pixelsPerTile, this.pixelsPerTile, this.pixelsPerTile);
        }

        // end
        return canvas;
    }
    async getCurrentMapCanvas(): Promise<Canvas> {
        const thePath = `./maps/battle-${this.author.id}.txt`;
        let image = new Image();
        let src: string | Buffer;
        try {
            // log("|| Reading existing file...")
            const readsrc = fs.readFileSync(thePath, 'utf8');
            // log("|| Finish reading.")
            src = readsrc;
        }
        catch (err) {
            log("|| Creating new file...")
            const newMap = await this.getNewCanvasMap();
            const dataBuffer = newMap.toDataURL();
            fs.writeFileSync(thePath, dataBuffer);
            src = dataBuffer;
        }

        return new Promise((resolve) => {
            image.onload = () => {
                const { canvas, ctx } = startDrawing(image.width, image.height);
                ctx.drawImage(image, 0, 0, image.width, image.height);
                // log("||=> Success. Canvas returned.")
                resolve(canvas);
            }
            // log("|| Waiting for image to load...");
            image.src = src;
        });
    }
    async getCurrentMapBuffer(): Promise<Buffer> {
        return (await this.getCurrentMapCanvas()).toBuffer();
    }
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
    async getActionArrowsCanvas(_actions: Action[], style: RGBA = {
        r: 0,
        g: 0,
        b: 0,
        alpha: 1
    }): Promise<Canvas> {
        const canvas = new Canvas(this.width * 50, this.height * 50);
        const ctx = canvas.getContext("2d");

        style = normaliseRGBA(style);
        ctx.fillStyle = stringifyRGBA(style);
        ctx.strokeStyle = stringifyRGBA(style);

        const drawPriorityText = (priority: number, canvasCoord: Coordinate, angle: number = 0) => {
            ctx.save();
            ctx.font = "15px Verdana";
            ctx.lineWidth = 0.5;
            ctx.fillStyle = "white"
            ctx.strokeStyle = "black"
            ctx.textAlign = "center"

            ctx.translate(canvasCoord.x, canvasCoord.y);
            ctx.rotate(angle);
            ctx.fillText(`${priority}`, 0, 0);
            ctx.strokeText(`${priority}`, 0, 0);
            ctx.restore();
        }
        /**
         * @param action 
         * @param fromBattleCoord 
         * @param toBattleCoord 
         * @param priority 
         * @param width 
         * @param offset default: half of this.pixelsPerTile
         */
        const drawAttackAction = async (action: AttackAction, fromBattleCoord: Coordinate, toBattleCoord: Coordinate, priority: number, width: number = 5, offset: Coordinate = {
            x: 0,
            y: 0
        }) => {
            
            log("Drawing attack action...")
            debug("\tfromCoord", { x: fromBattleCoord.x, y: fromBattleCoord.y });
            debug("\ttoCoord", { x: toBattleCoord.x, y: toBattleCoord.y });
            
            ctx.save();

            // draw tracing path
            const victimWithinDistance = checkWithinDistance(action.weapon, getDistance(action.from, action.affected));
            ctx.beginPath();
            ctx.strokeStyle = victimWithinDistance?
                                "red":
                                "black";
            ctx.lineWidth = width;
            const fromCanvasCoord = this.getCanvasCoordsFromBattleCoord(fromBattleCoord);
            ctx.moveTo(fromCanvasCoord.x + offset.x, fromCanvasCoord.y + offset.y);

            const toCanvasCoord = this.getCanvasCoordsFromBattleCoord(toBattleCoord);
            ctx.lineTo(toCanvasCoord.x + offset.x, toCanvasCoord.y + offset.y);
            ctx.stroke();
            ctx.closePath();

            debug("\tfromCanvasCoord", { x: fromCanvasCoord.x, y: fromCanvasCoord.y });
            debug("\ttoCanvasCoord", { x: toCanvasCoord.x, y: toCanvasCoord.y });

            // priority text
            const textCanvasCoordinate = this.getCanvasCoordsFromBattleCoord({
                x: (fromBattleCoord.x + toBattleCoord.x) / 2,
                y: (fromBattleCoord.y + toBattleCoord.y) / 2
            });
            const x = toBattleCoord.x - fromBattleCoord.x;
            const y = toBattleCoord.y - fromBattleCoord.y;
            const angle = Math.atan2(y,x);
            drawPriorityText(priority, textCanvasCoordinate, -1 * angle);
            debug("\ttextCanvasCoord", textCanvasCoordinate);

            if (victimWithinDistance) {
                const victimDead = action.affected.HP <= 0;
                const greenBarPercentage = victimDead?
                    1:
                    action.affected.HP / action.affected.base.AHP;

                ctx.lineWidth = 10;
                const targetCanvasCoords = this.getCanvasCoordsFromBattleCoord(action.affected);

                // draw hit
                const image = await getFileImage('./images/Hit.png');
                const reversedY = (this.height - 1 - action.affected.y); // y is treated differently in canvas (up to down instead of down to up)
                ctx.drawImage(image,
                    action.affected.x * this.pixelsPerTile,
                    reversedY * this.pixelsPerTile,
                    this.pixelsPerTile * 0.7,
                    this.pixelsPerTile * 0.7);

                const edgeDistance = this.pixelsPerTile * (1 / 3);
                const barStartingCanvasPosition = {
                    x: targetCanvasCoords.x - edgeDistance,
                    y: targetCanvasCoords.y - edgeDistance,
                }
                const barEndingCanvasPosition = {
                    x: targetCanvasCoords.x + edgeDistance,
                    y: targetCanvasCoords.y - edgeDistance,
                }

                // draw red bar
                ctx.beginPath();
                // shift 1/3 of a block top and left from the center
                ctx.moveTo(barStartingCanvasPosition.x, barStartingCanvasPosition.y);
                ctx.strokeStyle = "red";
                // 1/3 to the top right
                ctx.lineTo(barEndingCanvasPosition.x, barEndingCanvasPosition.y);
                ctx.stroke();
                ctx.closePath();

                // draw green bar
                ctx.beginPath();
                ctx.moveTo(barStartingCanvasPosition.x, barStartingCanvasPosition.y);
                ctx.strokeStyle = victimDead?
                    "black":
                    "green";

                // ** full bar === 2 * edgeDistance
                const greenLineLength = 2 * edgeDistance * greenBarPercentage;
                ctx.lineTo(barStartingCanvasPosition.x + greenLineLength, barEndingCanvasPosition.y);
                ctx.stroke();
                ctx.closePath();
            }

            ctx.restore();
        }
        const drawMoveAction = (fromBattleCoord: Coordinate, toBattleCoord: Coordinate, priority: number, width: number = 5, offset: Coordinate = {
            x: 0,
            y: 0
        }) => {
            log(`Drawing move action: (${fromBattleCoord.x},${fromBattleCoord.y})=>(${toBattleCoord.x},${toBattleCoord.y}) (width:${width})(offset x:${offset.x} y:${offset.y})`)
            ctx.lineWidth = width;

            // get position before move
            const beforeCanvasCoord = this.getCanvasCoordsFromBattleCoord(fromBattleCoord);
            ctx.beginPath();
            ctx.moveTo(beforeCanvasCoord.x, beforeCanvasCoord.y);

            // draw a line to the coord after move action
            const afterCanvasCoord = this.getCanvasCoordsFromBattleCoord(toBattleCoord);
            ctx.lineTo(afterCanvasCoord.x, afterCanvasCoord.y);
            ctx.stroke();
            ctx.closePath();

            // draw circle
            ctx.arc(afterCanvasCoord.x, afterCanvasCoord.y, this.pixelsPerTile / 5, 0, Math.PI * 2);
            ctx.fill();

            // priority text
            drawPriorityText(priority, toBattleCoord);
        }

        const appendGraph = (action: Action, from: Coordinate, to: Coordinate) => {
            graph.connectNodes(from, to, action);
        }

        const virtualCoordsMap = new Map<number, Coordinate>();
        const graph = new hGraph<null, Action>(true);
        
        for (let i = 0; i < _actions.length; i++) {
            const action = _actions[i];
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
                        case "single":
                        case "touch":
                            appendGraph(aA, attacker_beforeCoords, victim_beforeCoords);
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
                                appendGraph(singleTarget, epicenterCoord, af);
                                // await drawAttackAction(singleTarget, epicenterCoord, af, i+1);
                            }
                            if (weapon.targetting.AOE === "circle") {
                                // show AOE throw trajectory
                                appendGraph(aA, attacker_beforeCoords, epicenterCoord);
                                // await drawAttackAction(aA, attacker_beforeCoords, epicenterCoord, i+1);
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
                    log(`BeforeBattleCoord: ${beforeBattleCoord.x}, ${beforeBattleCoord.y}`);

                    victim_beforeCoords[mA.axis] += mA.magnitude * Math.pow(-1, Number(mA.executed));
                    log(`Action: ${mA.magnitude} (${mA.executed})`);
                    
                    const afterBattleCoord = getNewObject(victim_beforeCoords);
                    log(`AfterBattleCoord: ${afterBattleCoord.x}, ${afterBattleCoord.y}`);

                    // connect to graph
                    // drawMoveAction(beforeBattleCoord, afterBattleCoord, i+1);
                    appendGraph(mA, beforeBattleCoord, afterBattleCoord);
                }
            );
        }
        
        for (const [key, value] of graph.adjGraph.entries()) {
            log(`Node ${key}`);
            const solidColumns = clamp(value.length, 0, 10);
            const columns = 2 * solidColumns + 1;
            const columnWidth = Math.floor(this.pixelsPerTile / columns);
            for (let o = 1; o <= columns; o++) {
                const widthStart = (o-1) * columnWidth;
                const widthEnd = widthStart + columnWidth;
                /**
                 * eg:
                 * columnWidth: 5
                 * 0th pixel => ||[-==========-]|| <= 5th pixel
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 *                [-==========-]  [-==========-]
                 */

                // is solid column
                if (o % 2 === 0) {
                    log(`Solid edge #${o/2}`);
                    const edge = value[(o/2)-1]; edge.print();
                    const connectingAction = edge.weight;

                    const isXtransition = edge.from.position.x !== edge.to.position.x; // change y
                    const isYtransition = edge.from.position.y !== edge.to.position.y; // change x

                    if (connectingAction.type === "Attack") {
                        drawAttackAction(
                            connectingAction as AttackAction,
                            edge.from.position,
                            edge.to.position,
                            connectingAction.priority,
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
                            edge.from.position,
                            edge.to.position,
                            connectingAction.priority,
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
                    log(`Gap edge #${o / 2}`);
                }
            }
        }

        return canvas;
    }
    async getActionArrowsBuffer(actions: Action[]): Promise<Buffer> {
        return (await this.getActionArrowsCanvas(actions)).toBuffer();
    }
    async getFullPlayerEmbedMessageOptions(stat: Stat, actions?: Array<Action>): Promise<MessageOptions> {
        const mapCanvas = await this.getCurrentMapWithArrowsCanvas(stat, actions);
        const map: Buffer = mapCanvas.toBuffer();

        const frameImage: Image = await getFileImage('images/frame.png');
        const characterBaseImage: Image = await getFileImage(stat.base.portraitURL);
        const { canvas, ctx } = startDrawing(frameImage.width * 3, frameImage.height * 3);
        ctx.drawImage(characterBaseImage, 20, 20, characterBaseImage.width * 3, characterBaseImage.height * 3);
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
                { attachment: map, name: `map.png` },
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
            description: `*Readiness* (${Math.round(stat.readiness)}/50)\n${ReadinessBar}`,
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
    findEntity_args(args: Array<string>, stat: Stat, weapon?: Weapon): Stat | null {
        const allStats = this.allStats();
        const ignore: Team[] = ["block"];
        const targetNotInIgnore = (c:Stat) => !ignore.includes(c.team);
        if (weapon && weapon.targetting.target === WeaponTarget.enemy) ignore.push("player");
        if (weapon && weapon.targetting.target === WeaponTarget.ally) ignore.push("enemy");

        // 0. self target
        if (weapon && (weapon.targetting.AOE === "selfCircle" || weapon.targetting.AOE === "self")) {
            return allStats.find(s => s.index === stat.index) || null;
        }

        // 1. attack through the name
        const targetName = args[0];
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
        const direction: Direction = args[0] as Direction;
        const axisDirection = translateDir[direction];
        let directionTarget = undefined;
        if (axisDirection !== undefined) {
            const axis: 'x' | 'y' = axisDirection.axis as ('x' | 'y');
            const dir = axisDirection.dir;
            directionTarget = this.findEntity_closestInAxis(stat, axis, 12 * dir, ignore);
        }

        // 3. attack through coordinates
        const x = parseInt(args[0]);
        const y = parseInt(args[1]);
        const coordTarget = (x + y) ? (allStats.find(c => c.x === x && c.y === y && targetNotInIgnore(c))) : null;

        // 4. attack closest
        const closestTarget = this.findEntity_closest(stat, ignore);

        return directionTarget || coordTarget || nameTarget || closestTarget;
    }
    findEntity_closestInAxis(attacker: Stat, axis: 'x' | 'y', magnitude: number, ignore: Team[] = []): Stat | null {
        const obstacles = this.findEntities_allInAxis(attacker, axis, magnitude, ignore);

        if (obstacles[0]) {
            const result = obstacles.reduce((closest, ob) => {
                const newMag = getDistance(attacker, ob);
                return newMag < getDistance(attacker, closest) ? ob : closest;
            }, obstacles[0]);
            return result;
        }
        else
        {
            return null;
        }
    }
    findEntity_closest(attacker: Stat, ignore: Team[] = ["block"]): Stat | null {
        const allStats = this.allStats();
        let closestDistance = 100;
        const closestR = allStats.reduce((closest: Stat | null, s: Stat) => {
            if (closest !== null && closest.index === s.index) return s;

            const newDistance = getDistance(s, attacker);

            // fail cases
            const selfTargettingIgnored = s.index === attacker.index;
            const ignored = ignore.includes(s.team);
            const targetIsDead = s.HP <= 0;
            if (selfTargettingIgnored || ignored || targetIsDead) {
                return closest;
            }

            return closestDistance > newDistance ? s : closest;
        }, null);
        return closestR;
    }
    findEntity_index(index: number): Stat | undefined {
        return this.allStats().find(s => (
            s.index === index
        ));
    }
    findEntities_allInAxis(attacker: Stat, axis: 'x' | 'y', magnitude: number, ignore: Team[] = []): Array<Stat> {
        const allStats = this.allStats();

        if (magnitude === 0) return [];
        const cAxis = counterAxis(axis);
        const result = allStats.filter(s => {
            if (ignore.includes(s.team)) return false;

            const checkNeg = s[axis] >= attacker[axis] + magnitude && s[axis] < attacker[axis];
            const checkPos = s[axis] <= attacker[axis] + magnitude && s[axis] > attacker[axis];

            // check negative if magnitude is negative. else, check positive axis
            const conditionOne = (Math.sign(magnitude) == -1) ? checkNeg : checkPos;
            return (s[cAxis] === attacker[cAxis] && getDistance(attacker, s) !== 0 && conditionOne);
        });
        return result;
    }
    findEntities_radius(_stat: Coordinate, radius: number, includeSelf: boolean = false, ignore: Array<Team> = ["block"]): Array<Stat> {
        // console.log(_stat, radius, includeSelf, ignore); 
        
        const targetNotInIgnore = (c: Stat) => !ignore.includes(c.team);
        const stat = _stat as Stat;
        
        return this.allStats().filter(s => {
            return (s.index !== stat.index || (typeof stat.index === 'number' && includeSelf))&&
                targetNotInIgnore(s)&&
                Math.sqrt(Math.pow((s.x - stat.x), 2) + Math.pow((s.y - stat.y), 2)) <= radius;
        });
    }
    findEntities_inLine(dot1: Coordinate, dot2: Coordinate): Stat[] {
        const dx = dot2.x - dot1.x;
        const dy = dot2.y - dot1.y;
        const coordDiff = getCompass(dot1, dot2);
        const slope = dy/dx;
        return this.allStats().filter(s => {
            const x = s.x - dot1.x;

            const coordDiff_this = getCompass(dot1, s);

            const lineLength = getPyTheorem(dx, dy);
            const isWithinDistance = lineLength >= getDistance(dot1, s);

            const withinSlopeA = (s.y === (dot1.y + Math.floor(slope * x))) || (s.y === (dot1.y + Math.ceil(slope * x)));
            const isVertSlope = (Math.abs(slope) === Infinity) || (s.x === dot1.x);

            return coordDiff.x === coordDiff_this.x && coordDiff.y === coordDiff_this.y && isWithinDistance && (withinSlopeA || isVertSlope);
        });
    }
    validateTarget(attackerStat: Stat | null, weapon: Weapon | null, targetStat: Stat | null): TargetingError | null {
        const eM: TargetingError = {
            reason: "",
            value: null,
        };

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

        log(
            `\tname: ${weapon.Name}`,
            `\tdamage: ${weapon.Damage}`,
            `\trange: ${weapon.Range}`,
            `\tattacker: ${attackerStat.base.class} (${attackerStat.index})`,
            `\ttarget: ${targetStat.base.class} (${targetStat.index})`
        );

        // location
        // if (targetStat.base.class === "location") {
        //     eM.reason = "You are targetting an empty location.";
        //     eM.advice = "Continue casting?";
        //     eM.tragic = "Swung at the air.";
        //     eM.harsh = false;
        //     return eM;
        // }

        // readiness
        if (attackerStat.readiness < 0) {
            eM.reason = "Not enough readiness.";
            eM.value = attackerStat.readiness;
            return eM;
        }

        // weapon uses
        if (weapon.UPT < getWeaponUses(weapon, attackerStat)) {
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
        if (weapon.targetting.AOE !== "selfCircle" && weapon.targetting.AOE !== "self") {
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
    validateMovement(moverStat: Stat, moveAction: MoveAction | null): MovingError | null {
        let movingError: MovingError | null = null;
        const coord = {
            x: moverStat.x + Number(moveAction?.axis === 'x') * Number(moveAction?.magnitude),
            y: moverStat.y + Number(moveAction?.axis === 'y') * Number(moveAction?.magnitude)
        };

        if (moveAction === null) {
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
        else if (moverStat.base.maxMove < moveAction.magnitude) {
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
        else if (Math.abs(moveAction.magnitude) < 1) {
            movingError = {
                reason: "Movement magnitude most be at least 1 (or -1).",
                value: moveAction.magnitude
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
}