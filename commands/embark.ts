import { Client, Guild, Message, MessageEmbed, TextChannel, User } from "discord.js";
import { formalise, getNewObject } from "../classes/Utility";
import { CommandModule, Location, EMOJI_TICK, UserData, DungeonData } from "../typedef";
import { Dungeon } from "../classes/Dungeon";
import { dungeonData } from "../jsons";
import { InteractionEvent } from "../classes/InteractionEvent";
import { InteractionEventManager } from "../classes/InteractionEventManager";

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

            // MAP DATA INIT
            const dungeonInputData: DungeonData | null = dungeonData[location] ?
                getNewObject<DungeonData, unknown>(dungeonData[location] as DungeonData, {}) :
                null;
            if (dungeonInputData === null) {
                message.reply("Cannot generate map. Check if you are inputting the correct map name.")
                return;
            }

            //#region STATUS WORK
            const dungeon: Dungeon = Dungeon.Generate(dungeonInputData);
            const event: InteractionEvent = new InteractionEvent(author.id, message, 'dungeon', {
                dungeon: dungeon
            });
            const updatedUD: UserData | null = await InteractionEventManager.getInstance()
                .registerInteraction(author.id, event, authorData);

            if (!updatedUD) {
                message.reply("Your request is pending. Please try again later.");
                return;
            }
            if (!updatedUD.equippedClass) {
                message.reply("You have yet to have a class equipped.");
                return;
            }
            //#endregion

            // BATTLEDATA INIT (SPAWN PLAYERS)
            if (dungeonInputData) {
                message.react(EMOJI_TICK);
                await dungeon.initialiseUsers(message);
                dungeon.readAction();
            }
            else {
                message.reply(`The location "${location}" is not valid.`)
            }
        }
    }
} as CommandModule;