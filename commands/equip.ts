import { User, TextChannel, Guild, Message, Client, MessageSelectMenuOptions, MessageSelectOptionData } from "discord.js";
import { InteractionEvent } from "../classes/InteractionEvent";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { Item } from "../classes/Item";
import { getLoadingEmbed, setUpInteractionCollect, Test } from "../classes/Utility";
import { itemData } from "../jsons";
import { UserData, CommandModule, EMOJI_CROSS, MaterialInfo, EMOJI_WHITEB } from "../typedef";

module.exports = {
    commands: ['forge'],
    expectedArgs: '[weapon/armour]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
    }
} as CommandModule;