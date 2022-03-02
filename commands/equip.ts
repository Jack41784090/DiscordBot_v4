import { User, TextChannel, Guild, Message, Client, MessageSelectMenuOptions, MessageSelectOptionData, MessageEmbed } from "discord.js";
import { InteractionEvent } from "../classes/InteractionEvent";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { ForgeWeaponItem } from "../classes/Item";
import { arrayRemoveItemArray, getForgeWeaponEmbed, getInventorySelectOptions, getLoadingEmbed, getSelectMenuActionRow, setUpInteractionCollect } from "../classes/Utility";
import { UserData, CommandModule, EMOJI_CROSS, MaterialInfo, EMOJI_WHITEB, ForgeWeaponObject } from "../typedef";

import { log, debug } from "console"

module.exports = {
    commands: ['equip'],
    expectedArgs: '',
    minArgs: 0,
    maxArgs: 0,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const iem = InteractionEventManager.getInstance();
        const equipMes = await message.reply({
            embeds: [getLoadingEmbed()]
        });
        const event = new InteractionEvent(author.id, equipMes, 'equip')
        const updatedUserData = (await iem.registerInteraction(author.id, event, authorUserData))!;

        const getComponents = () => {
            const inventorySelectMenu =
                getInventorySelectOptions(updatedUserData.arsenal
                    .filter(_fwI => !updatedUserData.equippedWeapon.includes(_fwI)));
            return {
                embeds: [
                    new MessageEmbed({
                        title: "Equipments",
                        fields: updatedUserData.equippedWeapon.map(_fw => {
                            const _ = getForgeWeaponEmbed(_fw);
                            return {
                                name: _.title!,
                                value: _.description!,
                                inline: true,
                            }
                        })
                    }).setThumbnail("https://i.imgur.com/1rBk4xI.png")
                ],
                components: [getSelectMenuActionRow(inventorySelectMenu)]
            };
        }

        equipMes.edit(getComponents())
        
        const collect = () => {
            setUpInteractionCollect(equipMes, async _itr => {
                if (_itr.isSelectMenu()) {
                    const selectedIndexArsenal: number = parseInt(_itr.values[0]);
                    const weaponSelected: ForgeWeaponItem = updatedUserData.arsenal[selectedIndexArsenal];

                    if (weaponSelected) {
                        if (updatedUserData.equippedWeapon.length >= 2) {
                            const replacing: ForgeWeaponObject | null =
                                updatedUserData.equippedWeapon
                                    .find(_fw => _fw.attackType === weaponSelected.attackType) || null;
                            if (replacing) {
                                arrayRemoveItemArray(updatedUserData.equippedWeapon, replacing);
                            }
                        }
                        if (updatedUserData.equippedWeapon.length < 2) {
                            updatedUserData.equippedWeapon.push(weaponSelected);
                            await _itr.update(getComponents());
                        }
                        collect();
                    }
                    else {
                        switch (_itr.values[0]) {
                            case 'refresh':
                                await _itr.update(getComponents());
                                collect();
                                break;

                            case 'end':
                                event.stop();
                                break;
                        }
                    }
                }
            }, 1);
        };
        
        collect();
    }
} as CommandModule;