import { User, TextChannel, Guild, Message, Client, MessageSelectOptionData, MessageActionRow, MessageEmbed, MessageOptions } from "discord.js";
import { saveUserData } from "../classes/Database";
import { formalise, getNewObject, getSelectMenuActionRow, setUpInteractionCollect } from "../classes/Utility";
import { UserData, CommandModule, EMOJI_CROSS, ItemType, EMOJI_WHITEB, Material } from "../typedef";
import dungeonItemData from "../data/itemData.json";
import { Item } from "../classes/Item";

module.exports = {
    commands: ['shop'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const getTimeout = () => {
            return setTimeout(() => {
                saveUserData(authorUserData);
                shopMessage.delete()
                    .catch(_err => console.error);
            }, 30 * 1000);
        }
        const returnMessage = (): MessageOptions => {
            const selectMenuOptions: MessageSelectOptionData[] = [];
            for (const itemType of Object.keys(dungeonItemData)) {
                const itemName = itemType as ItemType;
                const itemsInInv: Array<Item> = authorUserData.inventory.filter(_i => _i.type === itemName);
                if (dungeonItemData[itemName]?.price > 0) {
                    selectMenuOptions.push({
                        emoji: dungeonItemData[itemName]?.emoji || EMOJI_WHITEB,
                        label: `${formalise(itemName)} x${itemsInInv.length}`,
                        description: `Buy $${dungeonItemData[itemName]?.price}`,
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
                        .setFooter(`${authorUserData.money}`, 'https://i.imgur.com/FWylmwo.jpeg')
                ],
                components: [selectMenuActionRow]
            }
        }
        const listen = () => {
            setUpInteractionCollect(shopMessage, async _itr => {
                if (_itr.isSelectMenu()) {
                    try {
                        clearTimeout(timeout);
                        timeout = getTimeout();

                        const itemBought: ItemType = _itr.values[0] as ItemType;
                        const cost: number | null = dungeonItemData[itemBought]?.price || null;
                        if (_itr.values[0] === 'end') {
                            saveUserData(authorUserData);
                            shopMessage.delete()
                                .catch(_err => console.error);
                        }
                        else if (cost !== null && authorUserData.money - cost >= 0) {
                            const qualifications = getNewObject(dungeonItemData[itemBought].qualification);
                            const requiredMaterials: Array<keyof typeof qualifications> =
                                Object.keys(qualifications) as Array<keyof typeof qualifications>;
                            const vendorItem: Item = new Item(
                                requiredMaterials.map(_mName => {
                                    const minimumMaterialOccupation= qualifications[_mName];
                                    return {
                                        materialName: _mName,
                                        gradeDeviation: {
                                            'min': 0,
                                            'max': 1,
                                        },
                                        occupationDeviation: {
                                            'min': minimumMaterialOccupation,
                                            'max': minimumMaterialOccupation * 1.1,
                                        }
                                    };
                                }),
                                5,
                                itemBought
                            );
                            authorUserData.money -= cost;
                            authorUserData.inventory.push(vendorItem);
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
        let timeout = getTimeout();
        const shopMessage: Message = await message.reply(returnMessage());

        listen();
    }
} as CommandModule;