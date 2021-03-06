import { User, TextChannel, Guild, Message, Client, MessageEmbed, MessageSelectOptionData, MessageSelectMenu, MessageOptions } from "discord.js";
import { UserData, CommandModule, Class, EMOJI_CROSS, StatMaximus, StatPrimus, AbilityTargetting, EMOJI_SHIELD, EMOJI_SWORD, Ability, EMOJI_STAR, defaultAvatarURL } from "../typedef";
import { addHPBar, formalise, getBaseClassStat, getLoadingEmbed, getNewObject, getSelectMenuActionRow, getStat, getStatsEmbed, getAbilityEmbed, setUpInteractionCollect, startDrawing } from "../classes/Utility";
import { getFileImage, getIconCanvas, getIconImgurLink } from "../classes/Database";
import { Image } from "canvas";
import { InteractionEventManager } from "../classes/InteractionEventManager";
import { InteractionEvent } from "../classes/InteractionEvent";
import { classData } from "../jsons";

import { debug, log } from "console"

module.exports = {
    commands: ['info'],
    expectedArgs: '[class name]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        const mes: Message = await message.reply({
            embeds: [getLoadingEmbed()]
        });

        const iem: InteractionEventManager = InteractionEventManager.getInstance();
        const event: InteractionEvent = new InteractionEvent(author.id, mes, 'info');
        await iem.registerInteraction(author.id, event, authorUserData);

        const iconCache: Map<Class, string> = new Map<Class, string>();
        const getClassIconLink = async (className: Class) => {
            return iconCache.get(className)||
                iconCache.set(className, await getIconImgurLink(await getStat(className)) || defaultAvatarURL).get(className)!
        }
        const getClassEmbed = async (className: Class): Promise<MessageOptions> => {
            return {
                embeds: [
                    getStatsEmbed(className)
                        .setThumbnail(await getClassIconLink(className))
                ],
            };
        }

        // list all classes
        if (args[0] === undefined) {
            const selectMenuOptions: MessageSelectOptionData[] = Object.keys(classData)
                .map(_className => ({
                    label: _className,
                    value: _className,
                }));
            const actionrow = getSelectMenuActionRow(selectMenuOptions);
            const selectMenu = actionrow.components[0] as MessageSelectMenu;
            selectMenu.placeholder = "Select a Class";
            await mes.edit(Object.assign(await getClassEmbed('Fighter'), {
                components: [actionrow]
            }));
            
            const collect = () => {
                setUpInteractionCollect(mes, async _itr => {
                    try {
                        if (_itr.isSelectMenu()) {
                            const classChosen = _itr.values[0] as Class;
                            await _itr.update(Object.assign(await getClassEmbed(classChosen), {
                                components: [actionrow]
                            }));
                            collect();
                        }
                    }
                    catch (_err) {
                        console.error(_err);
                        event.stop();
                    }
                }, 1);
            };
            collect();
        }
        // class does not exist
        else if (classData[args[0] as Class] === undefined) {
            message.react(EMOJI_CROSS)
                .catch(_err => console.log);
            event.stop();
        }
        else {
            const className = formalise(args[0]) as Class;
            const classChosen = getNewObject(classData[className]);

            // weapons
            const arsenal = (classChosen.abilities as Ability[]).concat((classChosen.autoWeapons as Ability[]));
            const selectMenuOptions: MessageSelectOptionData[]=
                arsenal.map((_w: any, _i: number) => {
                    return {
                        emoji: _w.targetting.target === AbilityTargetting.ally ?
                            EMOJI_SHIELD :
                            EMOJI_SWORD,
                        label: _w.abilityName,
                        value: `${_i}`,
                    }
                }).concat([{
                    emoji: EMOJI_STAR,
                    label: "Stats",
                    value: "menu",
                }]);

            const weaponSelectActionRow = getSelectMenuActionRow(selectMenuOptions);
            await mes.edit(Object.assign(await getClassEmbed(className), {
                components: [weaponSelectActionRow],
            }));

            const collect = () => {
                setUpInteractionCollect(mes, async _itr => {
                    try {
                        if (_itr.isSelectMenu()) {
                            const weaponIndex = parseInt(_itr.values[0]);
                            const weaponChosen =
                                classChosen.abilities[weaponIndex] as Ability ||
                                classChosen.autoWeapons[weaponIndex % classChosen.abilities.length];
                            if (weaponChosen) {
                                await _itr.update({
                                    embeds: [getAbilityEmbed(weaponChosen)]
                                });
                            }
                            else {
                                await _itr.update(Object.assign(await getClassEmbed(className), {
                                    components: [weaponSelectActionRow],
                                }));
                            }
                            collect();
                        }
                    }
                    catch (_err) {
                        console.log(_err);
                        event.stop();
                    }
                }, 1);
            }; collect();
        }
    }
} as CommandModule;