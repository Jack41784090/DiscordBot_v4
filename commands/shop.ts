import { User, TextChannel, Guild, Message, Client, MessageOptions, MessageSelectOptionData, MessageActionRow, MessageEmbed } from "discord.js";
import { InteractionEvent } from "../classes/InteractionEvent";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { Item } from "../classes/Item";
import { formalise, getSelectMenuActionRow, setUpInteractionCollect, getLoadingEmbed } from "../classes/Utility";
import { itemData } from "../jsons";
import { UserData, ItemType, EMOJI_WHITEB, EMOJI_CROSS, CommandModule } from "../typedef";

module.exports = {
    commands: ['shop'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const returnMessage = (): MessageOptions => {
            const selectMenuOptions: MessageSelectOptionData[] = [];
            for (const itemType of Object.keys(itemData)) {
                const itemName = itemType as ItemType;
                const itemsInInv: Array<Item> = updatedUserData.inventory.filter(_i => _i.type === itemName);
                if (itemData[itemName]?.price > 0) {
                    selectMenuOptions.push({
                        emoji: itemData[itemName]?.emoji || EMOJI_WHITEB,
                        label: `${formalise(itemName)} x${itemsInInv.length}`,
                        description: `Buy $${itemData[itemName]?.price}`,
                        value: itemName,
                    });
                }
            }
            selectMenuOptions.push({
                emoji: EMOJI_CROSS,
                label: "Leave Shop",
                value: "end",
            });
            const selectMenuActionRow: MessageActionRow = getSelectMenuActionRow(selectMenuOptions);

            return {
                embeds: [
                    new MessageEmbed()
                        .setThumbnail('https://i.imgur.com/7ZU6klq.png')
                        .setTitle('"All the items you need to survive a dungeon."')
                        .setFooter(`${updatedUserData.money}`, 'https://i.imgur.com/FWylmwo.jpeg')
                ],
                components: [selectMenuActionRow]
            }
        }
        const listen = () => {
            setUpInteractionCollect(shopMessage, async _itr => {
                if (_itr.isSelectMenu()) {
                    try {
                        const itemBought: ItemType = _itr.values[0] as ItemType;
                        const cost: number | null = itemData[itemBought]?.price || null;
                        if (_itr.values[0] === 'end') {
                            shopMessage.delete()
                                .catch(_err => console.error);
                        }
                        else if (cost !== null && updatedUserData.money - cost >= 0) {
                            const vendorItem: Item = Item.Generate(itemBought, "Vendor");
                            updatedUserData.money -= cost;
                            updatedUserData.inventory.push(vendorItem);
                            await _itr.update(returnMessage())
                        }
                        listen();
                    }
                    catch (_err) {
                        console.error(_err);
                        listen();
                    }
                }
            }, 1);
        }

        const shopMessage: Message = await message.reply({
            embeds: [getLoadingEmbed()]
        });
        const interactionEvent: InteractionEvent = new InteractionEvent(author.id, shopMessage, 'shop');
        const updatedUserData: UserData = await InteractionEventManager.getInstance().registerInteraction(author.id, interactionEvent, authorUserData);

        shopMessage.edit(returnMessage());

        listen();
    }
} as CommandModule;