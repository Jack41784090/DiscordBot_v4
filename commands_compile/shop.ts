import { User, TextChannel, Guild, Message, Client, MessageSelectOptionData, MessageActionRow, MessageEmbed, MessageOptions } from "discord.js";
import { saveUserData } from "../classes/Database";
import { formalize, getSelectMenuActionRow, setUpInteractionCollect } from "../classes/Utility";
import { UserData, CommandModule, DungeonItemInfoChart, EMOJI_CROSS, DungeonItemType, DungeonItem, EMOJI_WHITEB } from "../typedef";

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
            const selectMenuOptions: MessageSelectOptionData[] = Array.from(DungeonItemInfoChart.keys()).map((_itemName) => {
                const itemName = _itemName as DungeonItemType;
                const itemInInv: DungeonItem | undefined = authorUserData.inventory.find(_i => _i.type === itemName);
                return {
                    emoji: DungeonItemInfoChart.get(itemName)?.emoji || EMOJI_WHITEB,
                    label: `${formalize(itemName)} x${itemInInv?.uses || 0}`,
                    description: `Buy $${DungeonItemInfoChart.get(itemName)?.prize}`,
                    value: itemName,
                }
            })
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
                        const itemBought = _itr.values[0] as DungeonItemType;
                        const cost = DungeonItemInfoChart.get(itemBought)?.prize;
                        if (_itr.values[0] === 'end') {
                            saveUserData(authorUserData);
                            shopMessage.delete()
                                .catch(_err => console.error);
                        }
                        else if (cost !== undefined && authorUserData.money - cost >= 0) {
                            const itemInInv: DungeonItem | undefined = authorUserData.inventory.find(_i => _i.type === itemBought);
                            authorUserData.money -= cost;
                            if (itemInInv) {
                                itemInInv.uses++;
                            }
                            else {
                                authorUserData.inventory.push({
                                    type: itemBought,
                                    uses: 1
                                });
                            }
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