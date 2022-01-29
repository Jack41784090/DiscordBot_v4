import { User, TextChannel, Guild, Message, Client, MessageEmbed, MessageSelectMenuOptions, MessageOptions, MessageSelectOptionData, MessageActionRow, SelectMenuInteraction } from "discord.js";
import { saveUserData } from "../classes/Database";
import { Item } from "../classes/Item";
import { arrayRemoveItemArray, formalise, getGradeTag, getSelectMenuActionRow, log, uniformRandom, roundToDecimalPlace, setUpInteractionCollect } from "../classes/Utility";
import { itemData } from "../jsons";
import { UserData, CommandModule, EMOJI_WHITEB, EMOJI_CROSS, coinURL, EMOJI_MONEYBAG, MEW, MaterialQualityInfo } from "../typedef";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { InteractionEvent } from "../classes/InteractionEvent";

module.exports = {
    commands: ['inventory'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const getTimeout = () => {
            return setTimeout(() => {
                saveUserData(authorUserData);
                invMessage.delete()
                    .catch(_err => console.error);
            }, 120 * 1000);
        }
        const returnSelectItemsMessage = (): MessageOptions => {
            const selectMenuOptions: MessageSelectOptionData[] = authorUserData.inventory.map((_item, _i) => {
                return {
                    emoji: itemData[_item.type]?.emoji || EMOJI_WHITEB,
                    label: `${_item.getDisplayName()} (${_item.getWeight(true)})`,
                    description: `$${_item.getWorth(true)}`,
                    value: `${_i}`,
                };
            }).splice(0, 24);
            selectMenuOptions.push({
                emoji: EMOJI_CROSS,
                label: "Close",
                value: "end",
            });
            const selectMenuActionRow: MessageActionRow = getSelectMenuActionRow(selectMenuOptions, "select");

            return {
                embeds: [
                    new MessageEmbed()
                        .setThumbnail('https://i.imgur.com/40Unw4T.png')
                        .setTitle('Inventory')
                        .setFooter(`${authorUserData.money}`, coinURL)
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
                    description: `($10) Randomly chip off 20% weight (${roundToDecimalPlace(_i.weight * 0.2)}${MEW}).`,
                    value: "chip",
                },
                {
                    emoji: '💉',
                    label: "Extract",
                    description: `($50) Extract 20% weight into a new item (${roundToDecimalPlace(_i.weight * 0.2)}${MEW}).`,
                    value: "extract",
                },
                {
                    emoji: EMOJI_CROSS,
                    label: "Close",
                    value: "end",
                },
            ];
            const actionRow: MessageActionRow = getSelectMenuActionRow(selectMenuOptions, "manage");

            _i.materialInfo.sort((_1, _2) => _2.occupation - _1.occupation);

            return {
                embeds: [
                    new MessageEmbed()
                        .setDescription(_i.materialInfo.map(_mI => _i.getMaterialInfoString(_mI)).join("\n"))
                        .setThumbnail('https://i.imgur.com/SCT19EA.png')
                        .setTitle(`${_i.getDisplayName()} ${roundToDecimalPlace(_i.getWeight())}${MEW}`)
                        .setFooter(`${authorUserData.money}`, coinURL)
                ],
                components: [actionRow],
            }
        }
        const selectingItem = async (_itr: SelectMenuInteraction) => {
            try {
                const action: string = _itr.values[0];
                switch (action) {
                    case "end":
                        await saveUserData(authorUserData);
                        invMessage.delete()
                            .catch(_err => console.error);
                        break;

                    default:
                        const index: number = parseInt(_itr.values[0]);
                        itemSelected = authorUserData.inventory[index];
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
                        authorUserData.money += itemSelected.getWorth();
                        arrayRemoveItemArray(authorUserData.inventory, itemSelected);
                        await _itr.update(returnSelectItemsMessage());
                        break;
                    case "chip":
                        const roll_chip = uniformRandom(Number.EPSILON, (itemSelected.weight / itemSelected.maxWeight));
                        itemSelected.chip(roll_chip, 0.2);
                        await _itr.update(returnItemsActionMessage(itemSelected));
                        break;
                    case "extract":
                        const roll_extract = uniformRandom(Number.EPSILON, (itemSelected.weight / itemSelected.maxWeight));
                        const extracted: Item = itemSelected.extract(roll_extract, 0.2);
                        authorUserData.inventory.push(extracted);
                        await _itr.update(returnItemsActionMessage(extracted));
                        break;
                    case "end":
                        await saveUserData(authorUserData);
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
            const interactionEvent: InteractionEvent = new InteractionEvent(author, invMessage, 'inventory');
            InteractionEventManager.getInstance().registerInteraction(author, interactionEvent);
            setUpInteractionCollect(invMessage, async _itr => {
                if (_itr.isSelectMenu()) {
                    clearTimeout(timeout);
                    timeout = getTimeout();
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
        let itemSelected: Item;
        let timeout = getTimeout();
        const invMessage: Message = await message.reply(returnSelectItemsMessage());

        listen();
    }
} as CommandModule;