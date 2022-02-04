import { Client, Guild, Message, MessageEmbed, TextChannel, User } from "discord.js";
import { formalise, getNewObject } from "../classes/Utility";
import { CommandModule, Location, EMOJI_TICK, UserData, DungeonData } from "../typedef";
import { Dungeon } from "../classes/Dungeon";
import { dungeonData } from "../jsons";

module.exports = {
    commands: ['embark', 'adventure', 'go'],
    expectedArgs: '[location]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        if (args[0] === undefined) {
            //#region STARTING WITHOUT A LOCATION
            const locationsEmbed = new MessageEmbed({
                title: "Here are all the places you can go...",
                description: '',
                footer: {
                    text: "//go [location]"
                }
            });

            for (const locationName of Object.keys(dungeonData)) {
                const formalName = formalise(locationName);
                locationsEmbed.description += `**${formalName}**\n`;
            }
            channel.send({ embeds: [locationsEmbed] });
            //#endregion
        }
        else if (args[0]) {
            const location: Location = args[0] as Location;
            
            //#region STATUS WORK
            if (!authorData) {
                message.reply("You don't have an account set up yet. Use the `//begin` command first!");
                return;
            }
            if (!authorData.equippedClass) {
                message.reply("You have yet to have a class equipped.");
                return;
            }
            //#endregion

            // MAP DATA INIT
            const dungeon: DungeonData | null = dungeonData[location]?
                getNewObject<DungeonData, unknown>(dungeonData[location] as DungeonData, {}):
                null;

            // BATTLEDATA INIT (SPAWN PLAYERS)
            if (dungeon) {
                message.react(EMOJI_TICK);
                Dungeon.Start(dungeon, message);
            }
            else {
                message.reply(`The location "${location}" is not valid.`)
            }
        }
    }
} as CommandModule;