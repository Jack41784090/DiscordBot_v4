import { User, TextChannel, Guild, Message, Client, MessageEmbed } from "discord.js";
import { formalise, getGradeTag, getMaterialInfoString, log, roundToDecimalPlace } from "../classes/Utility";
import { UserData, CommandModule } from "../typedef";

module.exports = {
    commands: ['inventory'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const embed: MessageEmbed = new MessageEmbed()
            .setTitle("Inventory")
        authorUserData.inventory.forEach(_i => {
        });

        for (let i = 0; i < authorUserData.inventory.length; i+=2) {
            const _i = authorUserData.inventory[i];
            const _i2 = authorUserData.inventory[i+1];

            embed.addField(
                _i?
                    `__${_i.getDisplayName()}__ $${roundToDecimalPlace(_i.getWorth(), 2)} (${roundToDecimalPlace(_i.weight)}μ)`:
                    "‏",
                _i2?
                    `**__${_i2.getDisplayName()}__ $${roundToDecimalPlace(_i2.getWorth(), 2)} (${roundToDecimalPlace(_i2.weight)}μ)**`:
                    "‏",
            );
        }

        channel.send({
            embeds: [embed]
        });
    }
} as CommandModule;