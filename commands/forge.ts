import { User, TextChannel, Guild, Message, Client, MessageSelectMenuOptions, MessageSelectOptionData, MessageEmbed, InteractionCollector, Interaction, MessageOptions } from "discord.js";
import { InteractionEvent } from "../classes/InteractionEvent";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { ForgeWeaponItem, Item } from "../classes/Item";
import { arrayRemoveItemArray, formalise, getAbilityEmbed, getForgeWeaponEmbed, getForgeWeaponMinMax, getInventorySelectOptions, getLoadingEmbed, getNewObject, getSelectMenuActionRow, confirmationInteractionCollect, setUpInteractionCollect, Test } from "../classes/Utility";
import { forgeWeaponData, itemData } from "../jsons";
import { UserData, CommandModule, EMOJI_CROSS, MaterialInfo, EMOJI_WHITEB, ForgeWeaponPart, ForgeWeaponType, MEW } from "../typedef";

import { debug, log } from "console";

module.exports = {
    commands: ['forge'],
    expectedArgs: '[weapon/armour]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        // send out the loading embed
        const forgeMes: Message = await channel.send({
            embeds: [getLoadingEmbed()]
        });

        // interaction event
        const iem = InteractionEventManager.getInstance();
        const event = new InteractionEvent(author.id, forgeMes, 'forge');
        const updatedUserData = (await iem.registerInteraction(author.id, event))!;

        // 
        let selectedWeaponType: ForgeWeaponType | null;
        const parts: Array<ForgeWeaponPart> = [
            'blade',
            'guard',
            'shaft',
        ]
        const selectedItems: Array<Item> = [];
        const selectOptionsCache: Map<ForgeWeaponPart, Array<Item>> = new Map <ForgeWeaponPart, Array<Item>>();
        const getForgeMesOptions = (_t: ForgeWeaponPart): MessageOptions => {
            const range = forgeWeaponData[selectedWeaponType!][_t];
            const pickedItems: Array<Item> =
                selectOptionsCache.get(_t)||
                selectOptionsCache.set(_t, updatedUserData.inventory.filter(_i => {
                    const w = _i.getWeight();
                    return range[0] <= w && w <= range[1];
                })).get(_t)!;
            const selectMenuOptions = getInventorySelectOptions(pickedItems.filter(_i => !selectedItems.includes(_i)));
            return {
                embeds: [
                    new MessageEmbed()
                        .setTitle(`Select material for the ${formalise(_t)}`)
                        .setFields(selectedItems.map((_item, _i) => ({
                            name: `${formalise(parts[_i])}: "${_item.getDisplayName()}"`,
                            value: 
                                _item.getAllMaterial()
                                    .filter(_mi => _mi.occupation >= 0.1)
                                    .map(_mi => _item.getMaterialInfoString(_mi))
                                    .join('\n'),
                        })))
                ],
                components: [getSelectMenuActionRow(selectMenuOptions)]
            };
        };
        const listenFor = async (_t: ForgeWeaponPart): Promise<Item | null> => {
            log(`listen for ${_t}`);
            return forgeMes.edit(getForgeMesOptions(_t))
                .then(() => {
                    return new Promise(resolve => {
                        setUpInteractionCollect(forgeMes, async _itr => {
                            if (_itr.isSelectMenu()) {
                                const ans = _itr.values[0];
                                switch (ans) {
                                    case 'refresh':
                                        await _itr.update(getForgeMesOptions(_t));
                                        resolve(listenFor(_t));
                                        break;
                                    case 'end':
                                        event.stop();
                                        resolve(null)
                                        break;
                                    default:
                                        const int = parseInt(ans);
                                        await _itr.update({});
                                        resolve(
                                            Number.isInteger(int) ?
                                                ((selectOptionsCache.get(_t)?.[int]) || null):
                                                null
                                        );
                                        break;
                                }
                            }
                            else {
                                return null;
                            }
                        }, 1);
                    })
                })
        }

        // ask for weapon type
        const weapons: Array<MessageSelectOptionData> = Object.keys(forgeWeaponData).map(_wN => {
            const bladeCost = forgeWeaponData[_wN as ForgeWeaponType].blade;
            const guardCost = forgeWeaponData[_wN as ForgeWeaponType].guard;
            const shaftCost = forgeWeaponData[_wN as ForgeWeaponType].shaft;
            return {
                label: formalise(_wN),
                value: _wN,
                description: `${bladeCost}${MEW}-${guardCost}${MEW}-${shaftCost}${MEW}`
            }
        });
        await forgeMes.edit({
            embeds: [
                new MessageEmbed()
                    .setTitle("Select Weapon")
            ],
            components: [getSelectMenuActionRow(weapons)]
        });
        const weaponTypeColl = async () => {
            return new Promise<ForgeWeaponType | null>(resolve => {
                const itrC = setUpInteractionCollect(forgeMes, async _itr => {
                    if (_itr.user.id !== author.id) {
                        resolve(weaponTypeColl())
                    }
                    else if (_itr.isSelectMenu()) {
                        const selected = _itr.values[0] as ForgeWeaponType;
                        await _itr.update({});
                        resolve(selected);
                    }
                }, 1);
            });
        }
        selectedWeaponType = await weaponTypeColl();
        if (selectedWeaponType === null) {
            return;
        }

        // get blade
        const r1 = await listenFor('blade');
        if (r1 === null) {
            return;
        }
        selectedItems.push(r1);
        // get guard
        const r2 = await listenFor('guard');
        if (r2 === null) {
            return;
        }
        selectedItems.push(r2);
        // get shaft
        const r3 = await listenFor('shaft');
        if (r3 === null) {
            return;
        }
        selectedItems.push(r3);

        // confirm forge weapon
        const forged: ForgeWeaponItem = Item.Forge(r1, r2, r3, selectedWeaponType!);
        const weaponEmbed: MessageEmbed = getForgeWeaponEmbed(forged);
        await forgeMes.edit({
            embeds: [
                new MessageEmbed({
                    description: weaponEmbed.description!,
                    title: `Forge ${formalise(selectedWeaponType)}?`,
                    fields: selectedItems.map((_item, _i) => {
                        return {
                            name:
                                `${formalise(parts[_i])}: "${_item.getDisplayName()}"`,
                            value:
                                _item.getAllMaterial()
                                    .filter(_mi => _mi.occupation >= 0.1)
                                    .map(_mi => _item.getMaterialInfoString(_mi))
                                    .join('\n'),
                        };
                    })
                })
            ]
        });
    
        const answer = await confirmationInteractionCollect(forgeMes);
        // yes, forge!
        if (answer === 1) {
            // remove items from inventory
            selectedItems.forEach(_item => {
                arrayRemoveItemArray(updatedUserData.inventory, _item);
            });

            // add weapon as an item
            updatedUserData.arsenal.push(forged);

            event.stop();

            message.reply({
                embeds: [weaponEmbed]
            })
        }
        else {
            event.stop();
        }
    }
} as CommandModule;