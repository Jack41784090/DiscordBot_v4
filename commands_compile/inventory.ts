import { User, TextChannel, Guild, Message, Client, MessageEmbed } from "discord.js";
import { formalize, getGradeTag, roundToDecimalPlace } from "../classes/Utility";
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
            _i.materialInfo.sort((_1, _2) => {
                return _2.occupation - _1.occupation;
            });
            let fieldValue = _i.materialInfo.map(_mI => {
                const gradeTag = getGradeTag(_mI);
                const foramlisedName = formalize(_mI.name);
                const materialPrice = roundToDecimalPlace(_i.getMaterialInfoPrice(_mI), 2);
                const materialWeight = roundToDecimalPlace(_mI.occupation * _i.weight, 2);

                return `${foramlisedName} (${gradeTag}) $${materialPrice} (${materialWeight}μ)`;
            }).join("\n");

            embed.addField(
                `__${_i.name}__ $${roundToDecimalPlace(_i.getWorth(), 2)} (${roundToDecimalPlace(_i.weight)}μ)`,
                fieldValue,
            );
        });

        channel.send({
            embeds: [embed]
        });
    }
} as CommandModule;