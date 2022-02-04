import { Client, Guild, Message, TextChannel, User } from "discord.js";
import { Battle } from "../classes/Battle";
import { CommandModule, MapData, UserData } from "../typedef";
import { getNewObject } from "../classes/Utility";
import { areasData } from "../jsons";

module.exports = {
    commands: ['pvp'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        if (authorUserData.party.length < 2) {
            message.reply("Have more than just yourself in the team!");
        }
        else {
            const mapData: MapData = getNewObject<MapData, unknown>(areasData.pvp_5x5 as MapData, {});
            Battle.Start(mapData, author, message, authorUserData.party, client, true);
        }
    }
} as CommandModule;