import { User, TextChannel, Guild, Message, Client, MessageEmbed, MessageSelectOptionData, MessageSelectMenu } from "discord.js";
import { UserData, CommandModule, Class, EMOJI_CROSS, StatMaximus, StatPrimus, WeaponTarget, EMOJI_SHIELD, EMOJI_SWORD, Weapon, EMOJI_STAR } from "../typedef";
import classData from "../data/classData.json";
import { addHPBar, formalise, getNewObject, getSelectMenuActionRow, getStatsEmbed, getWeaponEmbed, setUpInteractionCollect, startDrawing } from "../classes/Utility";
import { getFileImage } from "../classes/Database";
import { Image } from "canvas";

module.exports = {
    commands: ['info'],
    expectedArgs: '[class name]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        // list all classes
        if (args[0] === undefined) {
            const embed = (classChosen: Class) => {
                return getStatsEmbed(classChosen).setTitle(`Enter ";info ${classChosen}" to know more about ${classChosen}.`);
            }
            const selectMenuOptions: MessageSelectOptionData[] = Object.keys(classData).map(_className => {
                return {
                    label: _className,
                    value: _className,
                }
            });
            const actionrow = getSelectMenuActionRow(selectMenuOptions);
            (actionrow.components[0] as MessageSelectMenu).placeholder = "Select a Class"
            const mes = await message.reply({
                embeds: [embed("Hercules")],
                components: [actionrow],
            });
            setUpInteractionCollect(mes, async _itr => {
                if (_itr.isSelectMenu()) {
                    const classChosen = _itr.values[0] as Class;
                    await _itr.update({
                        embeds: [embed(classChosen)],
                        components: [actionrow],
                    })
                }
            }, 10);
        }
        // class does not exist
        else if (classData[args[0] as Class] === undefined) {
            message.react(EMOJI_CROSS)
                .catch(_err => console.log);
        }
        else {
            const className = formalise(args[0]) as Class;
            const classChosen = getNewObject(classData[className]);
            const embed = getStatsEmbed(className);

            // draw thumbnail
            const frameImage: Image = await getFileImage('images/frame.png');
            const characterBaseImage: Image = await getFileImage(classChosen.iconURL);
            const { canvas, ctx } = startDrawing(frameImage.width * 3, frameImage.height * 3);
            ctx.drawImage(characterBaseImage, 20, 20, canvas.width - 40, canvas.height - 40);
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
            ctx.textAlign = "center";
            ctx.font = '90px serif';
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.fillText(classChosen.class, canvas.width / 2, canvas.height * 0.95);
            ctx.strokeText(classChosen.class, canvas.width / 2, canvas.height * 0.95);
            embed.setThumbnail("attachment://thumbnail.png");

            // weapons
            const filter = (_w: any, _i: number) => {
                return {
                    emoji: _w.targetting.target === WeaponTarget.ally ?
                        EMOJI_SHIELD :
                        EMOJI_SWORD,
                    label: _w.Name,
                    value: `${_i}`,
                }
            };
            const arsenal = (classChosen.weapons as Weapon[]).concat((classChosen.autoWeapons as Weapon[]));
            const selectMenuOptions: MessageSelectOptionData[] = arsenal.map(filter);
            selectMenuOptions.push({
                emoji: EMOJI_STAR,
                label: "Stats",
                value: "menu",
            });
            const weaponSelectActionRow = getSelectMenuActionRow(selectMenuOptions);
            const mes = await message.reply({
                embeds: [embed],
                files: [{ attachment: canvas.toBuffer(), name: "thumbnail.png" }],
                components: [weaponSelectActionRow],
            });
            setUpInteractionCollect(mes, async _itr => {
                try {
                    if (_itr.isSelectMenu()) {
                        const weaponIndex = parseInt(_itr.values[0]);
                        const weaponChosen = classChosen.weapons[weaponIndex] as Weapon || classChosen.autoWeapons[weaponIndex % classChosen.weapons.length];
                        if (weaponChosen) {
                            await _itr.update({
                                embeds: [
                                    getWeaponEmbed(weaponChosen)
                                ]
                            });
                        }
                        else {
                            await _itr.update({
                                embeds: [embed],
                                files: [{ attachment: canvas.toBuffer(), name: "thumbnail.png" }],
                                components: [weaponSelectActionRow],
                            });
                        }
                    }
                }
                catch (_err) {
                    console.log(_err);
                }
            }, 10);
        }
    }
} as CommandModule;