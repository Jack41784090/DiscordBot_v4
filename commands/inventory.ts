import { User, TextChannel, Guild, Message, Client, MessageEmbed, MessageSelectMenuOptions, MessageOptions, MessageSelectOptionData, MessageActionRow } from "discord.js";
import { saveUserData } from "../classes/Database";
import { Item } from "../classes/Item";
import { arrayRemoveItemArray, formalise, getGradeTag, getSelectMenuActionRow, log, roundToDecimalPlace, setUpInteractionCollect } from "../classes/Utility";
import { itemData } from "../jsons";
import { UserData, CommandModule, EMOJI_WHITEB, EMOJI_CROSS, coinURL, EMOJI_MONEYBAG } from "../typedef";
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
                    emoji: '🔥',
                    label: "Endothermia",
                    description: `Apply heat to the object and cause a reaction.`,
                    value: "endothermia",
                },
            ];
            const actionRow: MessageActionRow = getSelectMenuActionRow(selectMenuOptions, "manage");

            _i.materialInfo.sort((_1, _2) => _2.occupation - _1.occupation);

            return {
                embeds: [
                    new MessageEmbed()
                        .setDescription(_i.materialInfo.map(_mI => _i.getMaterialInfoString(_mI)).join("\n"))
                        .setThumbnail('https://i.imgur.com/SCT19EA.png')
                        .setTitle(_i.getDisplayName())
                        .setFooter(`${authorUserData.money}`, coinURL)
                ],
                components: [actionRow],
            }
        }
        const listen = () => {
            const interactionEvent: InteractionEvent = new InteractionEvent(author, invMessage, 'inventory');
            InteractionEventManager.getInstance().registerInteraction(author, interactionEvent);
            setUpInteractionCollect(invMessage, async _itr => {
                if (_itr.isSelectMenu()) {
                    try {
                        clearTimeout(timeout);
                        timeout = getTimeout();
                        switch (_itr.customId) {
                            case "select":
                                const index: number = parseInt(_itr.values[0]);
                                itemSelected  = authorUserData.inventory[index];
                                await _itr.update(returnItemsActionMessage(itemSelected));
                                break;

                            case "manage":
                                const action: string = _itr.values[0];
                                switch (action) {
                                    case "sell":
                                        authorUserData.money += itemSelected.getWorth();
                                        arrayRemoveItemArray(authorUserData.inventory, itemSelected);
                                        await _itr.update(returnSelectItemsMessage());
                                        break;
                                }
                                break;
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
        let itemSelected: Item;
        let timeout = getTimeout();
        const invMessage: Message = await message.reply(returnSelectItemsMessage());

        listen();
    }
} as CommandModule;