import { Client, Guild, GuildMember, Message, MessageEmbed, TextChannel, User } from "discord.js";
import { formalize, getNewObject, log, random } from "../classes/Utility";
import { Class, CommandModule, Mapdata, UserData, UserStatus } from "../typedef";
import { Battle } from "../classes/Battle";
import areasData from "../data/areasData.json";
import enemiesData from "../data/enemiesData.json"
import * as Database from "../classes/Database";

module.exports = {
    commands: ['embark', 'adventure', 'go'],
    expectedArgs: '[location]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        // if (args[0] === undefined) {
        if (false) {
            //#region STARTING WITHOUT A LOCATION
            const locationsEmbed = new MessageEmbed({
                title: "Here are all the places you can go...",
                description: '',
                footer: {
                    text: "//go [location]"
                }
            });
            for (const locationName of Object.keys(areasData)) {
                const formalName = formalize(locationName);
                locationsEmbed.description += `**${formalName}**\n`;
            }
            channel.send({ embeds: [locationsEmbed] });
            //#endregion
        }
        // else if (areasData[args[0]]) {
        else {
            message.delete();
            
            //#region STATUS WORK
            
            // const authorData = await Database.getUserData(author);
            // if (!authorData) {
            //     message.reply("you don't have an account set up yet. Use the `//begin` command first!");
            //     return;
            // }
            // if (authorData.status !== UserStatus.idle) {
            //     message.reply("you need to be in an 'idle' state. You are currently in this state: " + authorData.status);
            //     return;
            // }
            // if (authorData.equippedClass === 'Dud') {
            //     message.reply("you have yet to have a class equipped.");
            //     return;
            // }

            // //#endregion

            // //#region MAP DATA INIT

            const mapData: Mapdata = getNewObject<Mapdata, unknown>(areasData.farmstead as Mapdata, {}); // temporary
            // const locationName = "Farmstead" // temporary

            // //#endregion

            // //#region BATTLEDATA INIT (SPAWN PLAYERS)

            log("Defining battleData...");
            // const battleData = new Battle(mapData, author, message, [author.id], client);
            // // battleData.Spawn(battleData.Party);

            // //#endregion

            // // battleData.syncronizeData();

            // //#region CALCULATE SPAWNING ALGORITHM AND PUSH TO BATTLEDATA
            // const difficultyRoll = random(0.0, 100.0);
            // let difficulty = 'common';
            // if (difficultyRoll > 50) difficulty = 'squad'
            // if (difficultyRoll > 80) difficulty = 'mob';
            // if (difficultyRoll > 95) difficulty = 'raid';
            // if (difficultyRoll > 97.5) difficulty = 'legion';

            // log(`Difficulty is ${difficulty}`);

            // const difficultyInformation = mapData.enemiesInfo['common']; // this is temporary: change 'common' to difficulty
            // const minSpawnCount = difficultyInformation.count[0];
            // const maxSpawnCount = difficultyInformation.count[1];
            // const spawnEnemyCount = random(minSpawnCount, maxSpawnCount);
            // const enemyTypeCount = Object.keys(difficultyInformation.enemies).length;

            // let spawningIndex = 1;
            // let enemyCountNow = 0;
            // log(Object.entries(difficultyInformation.enemies));
            // for (const [enemyName, enemyInfo] of Object.entries(difficultyInformation.enemies)) {
            //     const min = enemyInfo.min;
            //     const max = enemyInfo.max;

            //     if (!enemiesData[enemyName]) {
            //         log(`Unknown enemy: ${enemyName}`);
            //         continue;
            //     }

            //     // spawn the minimum amount
            //     for (let i = 0; i < min; i++) {
            //         battleData.spawning.push(Object.assign({}, enemiesData[enemyName]));
            //         battleData.totalEnemyCount++;
            //         enemyCountNow++;
            //     }

            //     if (spawningIndex === enemyTypeCount)
            //     {
            //         // spawn in remaining amount to fill the quota
            //         const quotaReach = spawnEnemyCount - enemyCountNow;
            //         for (let i = 0; i < quotaReach; i++) {
            //             battleData.spawning.push(Object.assign({}, enemiesData[enemyName]));
            //             battleData.totalEnemyCount++;
            //         }
            //     }
            //     else
            //     {
            //         // randomly choose the exceeding amount
            //         const exceeding = Math.round(random(0, (max - min) * 0.75));
            //         for (let i = 0; i < exceeding; i++) {
            //             battleData.spawning.push(Object.assign({}, enemiesData[enemyName]));
            //             battleData.totalEnemyCount++;
            //             enemyCountNow++;
            //         }
            //     }

            //     spawningIndex++;
            // }
            //#endregion

            // Database.WriteBattle(author, battleData.returnObject());
            try {
                Battle.Start(mapData, author, message, authorData.party, client);
            }
            catch (_err) {
                channel.send(`${_err}`);
            }
        }
    }
} as CommandModule;