import { User, TextChannel, Guild, Message, Client, MessageEmbed, MessageOptions, MessageSelectOptionData, MessageActionRow, SelectMenuInteraction } from "discord.js";
import { Item } from "../classes/Item";
import { arrayRemoveItemArray, getSelectMenuActionRow, uniformRandom, roundToDecimalPlace, setUpInteractionCollect, getLoadingEmbed, getInventorySelectOptions } from "../classes/Utility";
import { itemData } from "../jsons";
import { UserData, CommandModule, EMOJI_WHITEB, EMOJI_CROSS, coinURL, EMOJI_MONEYBAG, MEW } from "../typedef";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { InteractionEvent } from "../classes/InteractionEvent";

module.exports = {
    commands: ['inventory'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const returnSelectItemsMessage = (): MessageOptions => {
            const selectMenuOptions: MessageSelectOptionData[] = getInventorySelectOptions(updatedUserData.inventory);
            const selectMenuActionRow: MessageActionRow = getSelectMenuActionRow(selectMenuOptions, "select");

            return {
                embeds: [
                    new MessageEmbed()
                        .setThumbnail('https://i.imgur.com/40Unw4T.png')
                        .setTitle('Inventory')
                        .setFooter(`${updatedUserData.money}`, coinURL)
                ],
                components: [selectMenuActionRow]
            }
        }
        const returnItemsActionMessage = (_i: Item): MessageOptions => {
            const selectMenuOptions: MessageSelectOptionData[] = [
                {
                    emoji: EMOJI_MONEYBAG,
                    label: "Sell",
                    description: `Sell this item for precisely: $${_i.getWorth()}`,
                    value: "sell",
                },
                {
                    emoji: '🪚',
                    label: "Chip",
                    description: `($10) Randomly chip off 20% weight (${roundToDecimalPlace(_i.getWeight() * 0.2)}${MEW}).`,
                    value: "chip",
                },
                {
                    emoji: '💉',
                    label: "Extract",
                    description: `($50) Extract 20% weight into a new item (${roundToDecimalPlace(_i.getWeight() * 0.2)}${MEW}).`,
                    value: "extract",
                },
                {
                    emoji: EMOJI_CROSS,
                    label: "Close",
                    value: "end",
                },
            ];
            const actionRow: MessageActionRow = getSelectMenuActionRow(selectMenuOptions, "manage");

            _i.getAllMaterial().sort((_1, _2) => _2.occupation - _1.occupation);

            return {
                embeds: [
                    new MessageEmbed()
                        .setDescription(_i.getAllMaterial().map(_mI => _i.getMaterialInfoString(_mI)).join("\n"))
                        .setThumbnail('https://i.imgur.com/SCT19EA.png')
                        .setTitle(`${_i.getDisplayName()} ${roundToDecimalPlace(_i.getWeight())}${MEW}`)
                        .setFooter(`${updatedUserData.money}`, coinURL)
                ],
                components: [actionRow],
            }
        }
        const selectingItem = async (_itr: SelectMenuInteraction) => {
            try {
                const action: string = _itr.values[0];
                switch (action) {
                    case "refresh":
                        await _itr.update(returnSelectItemsMessage());
                        break;

                    case "end":
                        iem.stopInteraction(author.id, 'inventory');
                        break;

                    default:
                        const index: number = parseInt(_itr.values[0]);
                        itemSelected = updatedUserData.inventory[index];
                        await _itr.update(returnItemsActionMessage(itemSelected));
                        break;
                }
            }
            catch (_err) {
                console.error(_err);
                listen();
            }
        }
        const managingItem = async (_itr: SelectMenuInteraction) => {
            try {
                const action: string = _itr.values[0];
                switch (action) {
                    case "sell":
                        updatedUserData.money += itemSelected.getWorth();
                        arrayRemoveItemArray(updatedUserData.inventory, itemSelected);
                        await _itr.update(returnSelectItemsMessage());
                        break;
                    case "chip":
                        const roll_chip = uniformRandom(Number.EPSILON, (itemSelected.getWeight() / itemSelected.getMaxWeight()));
                        itemSelected.chip(roll_chip, 0.2);
                        itemSelected.cleanUp();
                        await _itr.update(returnItemsActionMessage(itemSelected));
                        break;
                    case "extract":
                        const extracted: Item = itemSelected.extract(0.2);
                        itemSelected.cleanUp();
                        updatedUserData.inventory.push(extracted);

                        itemSelected = extracted;
                        await _itr.update(returnItemsActionMessage(extracted));
                        break;
                    case "end":
                        await _itr.update(returnSelectItemsMessage());
                        break;
                }
            }
            catch (_err) {
                console.error(_err);
                listen();
            }
        }
        const listen = () => {
            setUpInteractionCollect(invMessage, async _itr => {
                if (_itr.isSelectMenu()) {
                    switch (_itr.customId) {
                        case "select":
                            await selectingItem(_itr);
                            break;
                        case "manage":
                            await managingItem(_itr);
                            break;
                    }
                    listen();
                }
            }, 1);
        }

        const invMessage: Message = await message.reply({
            embeds: [getLoadingEmbed()]
        });
        const interactionEvent: InteractionEvent = new InteractionEvent(author.id, invMessage, 'inventory');
        const iem = InteractionEventManager.getInstance();
        const updatedUserData: UserData = (await iem.registerInteraction(author.id, interactionEvent, authorUserData))!;
        let itemSelected: Item;
        invMessage.edit(returnSelectItemsMessage());
        listen();
    }
} as CommandModule;