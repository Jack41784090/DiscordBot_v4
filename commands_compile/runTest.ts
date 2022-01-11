import { User, TextChannel, Guild, Message, Client } from "discord.js";
import { Test } from "../classes/Utility";
import { UserData, CommandModule } from "../typedef";

module.exports = {
    commands: ['r'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        Test();
    }
} as CommandModule;