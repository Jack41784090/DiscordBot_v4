import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { Interaction, Message, MessageActionRow, MessageEmbed, MessageOptions, MessageSelectMenu, TextChannel, InteractionCollector, ChannelLogsQueryOptions, User, MessageButton, MessageButtonOptions, MessageSelectOptionData } from "discord.js";

import { BotClient } from "..";
import { Class, SimplePlayerStat, StringCoordinate, Accolade, Buffs, deathQuotes, CoordStat, preludeQuotes, Action, ActionType, AINode, AttackAction, BaseStat, BotType, ClashResult, Coordinate, EnemyClass, MoveAction, Round, Stat, Weapon, WeaponAOE, WeaponTarget, Vector2, RGBA, COMMAND_CALL, GetBuffOption, Buff, StatusEffectType, Direction, Axis, NumericDirection, DungeonData, EMOJI_SWORD, EMOJI_SHIELD, EMOJI_SPRINT, StatMaximus, StatPrimus, MapData, ItemType, LootInfo, MaterialQualityInfo, MaterialGrade, UserData, Material } from "../typedef";
import { Battle } from "./Battle";
import { Item } from "./Item";
import { getUserData, saveUserData } from "./Database";
import { areasData, enemiesData, classData, itemData } from "../jsons";
// import { Dungeon } from "./Dungeon";

export function clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
}

export function normaliseRGBA(rgba: RGBA) {
    // R
    rgba.r = clamp(Math.round(rgba.r), 0, 255);

    // G
    rgba.g = clamp(Math.round(rgba.g), 0, 255);

    // B
    rgba.b = clamp(Math.round(rgba.b), 0, 255);

    // ALPHA
    rgba.alpha = clamp(rgba.alpha, 0, 1);

    return rgba;
}

export function stringifyRGBA(rgba: RGBA) {
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.alpha})`;
}

export function log(...any: any[]): void {
    any.forEach(any => console.log(any));
}

export function debug(tag: String, any: any) {
    console.log(`${tag}: `, any);
}

// string manipulation
export function extractCommands(string: string) : Array<string> {
    const sections = string.split(' ');
    if (sections[0][0] === COMMAND_CALL) {
        sections[0] = sections[0].substring(1);
    }
    return sections;
}
export function capitalize(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
export function formalise(string: string): string {
    return string.split(" ").map(_ss => capitalize(_ss.toLowerCase())).join(" ");
}

// number manipulation
export function random(num1: number, num2: number): number {
    /**
     * num1 == 1, num2 == 3
     *  result == (1, 2) ==> 1
     *  result == (2, 3) ==> 2
     *  result == (3, 4) ==> 3
    **/
    const parametersIntegers = Number.isInteger(num1) && Number.isInteger(num2);
    const random = Math.random(); // [0.0, 1.0]

    const result = Math.min(num1, num2) + ((Math.abs(num1 - num2) + Number(parametersIntegers)) * random);

    return parametersIntegers?
        Math.floor(result):
        result;
}
export function getRandomInArray<Type>(array: Type[]) {
    return array[random(0, array.length - 1)];
}
export function average(...nums: Array<number>) {
    let total = 0;
    for (let i = 0; i < nums.length; i++) {
        const n = nums[i];
        total += n;
    }
    return total / (nums.length || 1);
}

// get battle stats
export function getAHP(entity: Stat, options: GetBuffOption = 'WithBoth'): number {
    const AHP = entity.base.AHP;
    const AHPBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.AHP : 0;
    const AHPDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.AHP : 0;
    return (AHP + AHPBuff - AHPDebuff) || 0;
}
export function getDamage(entity: Stat, weapon: Weapon, options: GetBuffOption = 'WithBoth'): [number, number] {
    const damageRange = weapon.Damage;
    const damageBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Damage : 0;
    const damageDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Damage : 0;
    return [damageRange[0] + damageBuff - damageDebuff, damageRange[1] + damageBuff - damageDebuff]
}
export function getAcc(entity: Stat, weapon: Weapon, options: GetBuffOption = 'WithBoth'): number {
    const acc = weapon.Acc;
    const accBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Acc : 0;
    const accDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Acc : 0;
    return (acc + accBuff - accDebuff) || 0;
}
export function getDodge(entity: Stat, options: GetBuffOption = 'WithBoth'): number {
    const dodge = entity.base.Dodge;
    const dodgeBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Dodge : 0;
    const dodgeDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Dodge : 0;
    return (dodge + dodgeBuff - dodgeDebuff) || 0;
}
export function getSpd(entity: Stat, options: GetBuffOption = 'WithBoth'): number {
    const spd = entity.base.Spd;
    const spdBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Spd : 0;
    const spdDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Spd : 0;
    return (spd + spdBuff - spdDebuff) || 0;
}
export function getCrit(entity: Stat, weapon: Weapon, options: GetBuffOption = 'WithBoth'): number {
    const crit = weapon.Crit;
    const critBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Crit : 0;
    const critDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Crit : 0;
    return (crit + critBuff - critDebuff) || 0;
}
export function getLifesteal(entity: Stat, weapon: Weapon, options: GetBuffOption = 'WithBoth'): number {
    const ls = weapon.lifesteal;
    const lsBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.lifesteal : 0;
    const lsDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.lifesteal : 0;
    return (ls + lsBuff - lsDebuff) || 0;
}
export function getProt(entity: Stat, options: GetBuffOption = 'WithBoth'): number {
    const prot = entity.base.Prot;
    const protBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Prot : 0;
    const protDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Prot : 0;
    return (prot + protBuff - protDebuff) || 0;
}

export function findLongArm(weapons: Array<Weapon>) : Weapon {
    return weapons.reduce((lR, thisWeapon) => {
        if (thisWeapon.Range[1] > lR.Range[1]) return thisWeapon;
        return lR;
    }, weapons[0]);
}

export function findEqualCoordinate(_c: Coordinate, __c: Coordinate) {
    return _c.x === __c.x && _c.y === __c.y;
}

export function getDistance(stat1: Coordinate, stat2: Coordinate): number {
    const xDif = stat1.x - stat2.x;
    const yDif = stat1.y - stat2.y;
    return Math.sqrt((xDif) * (xDif) + (yDif) * (yDif));
}

export function checkWithinDistance(weapon: Weapon, distance: number): boolean {
    const result = weapon.Range[0] <= distance && (weapon.Range[2] || weapon.Range[1]) >= distance;
    return result;
}

export function getCoordsWithinRadius(radius: number, center: Coordinate, inclusive = true) {
    const result: Coordinate[] = [];
    // 1. find the range and domain
    const range = [center.y - radius, center.y + radius];
    const domain = [center.x - radius, center.x + radius];
    for (let x = Math.ceil(domain[0]); x <= Math.floor(domain[1]); x++) {
        const y = Math.sqrt(Math.pow(radius, 2) - Math.pow((x - center.x), 2)) + center.y;
        const ny = -Math.sqrt(Math.pow(radius, 2) - Math.pow((x - center.x), 2)) + center.y;
        if (inclusive) {
            for (let innerY = Math.ceil(ny); innerY <= Math.floor(y); innerY++) {
                result.push({
                    x: x,
                    y: innerY,
                });
            }
        }
        else {
            result.push({
                x: x,
                y: Math.ceil(ny),
            }, {
                x: x,
                y: Math.floor(y),
            });
        }
    }
    for (let y = Math.ceil(range[0]); y <= Math.floor(range[1]); y++) {
        const x = Math.sqrt(Math.pow(radius, 2) - Math.pow((y - center.y), 2)) + center.x;
        const nx = -Math.sqrt(Math.pow(radius, 2) - Math.pow((y - center.y), 2)) + center.x;
        // Utility.log(`y: (${x}, ${y}) and (${nx}, ${y})`);
        if (inclusive) {
            for (let innerX = Math.ceil(nx); innerX <= Math.floor(x); innerX++) {
                result.push({
                    x: innerX,
                    y: y,
                });
            }
        }
        else {
            result.push({
                x: Math.floor(x),
                y: y,
            }, {
                x: Math.ceil(nx),
                y: y,
            });
        }
    }
    return result;
}

export function getBuffStatusEffect(_buff: Buff) {
    return `${_buff}Up` as StatusEffectType;
}

export function newWeapon(origin: Weapon, modifier: {
    Name?: '',
    Acc?: 0,
    Damage?: [number, number];
    Range?: [number, number, number?];
    Readiness?: 0,
    Crit?: 0,
    lifesteal?: 0,
    targetting?: {
        target: WeaponTarget,
        AOE: WeaponAOE
    };
    CD?: 0,
    UPT?: 0,
    uses?: number }): Weapon 
{
    return Object.assign({ ...origin }, modifier);
}

export function roundToDecimalPlace(_number: number, _decimalPlace?: number) {
    const decimalPlace = _decimalPlace === undefined?
        1:
        Math.round(_decimalPlace);
    const decimal = Math.pow(10, decimalPlace);

    if (_decimalPlace === undefined) {
        let value: number;
        for (let i = 0; i < 10; i++) {
            const newDecimal = Math.pow(10, decimalPlace + i);
            value = Math.round((_number + Number.EPSILON) * newDecimal) / newDecimal;
            if (value !== 0) {
                break;
            }
        }
        return value!;
    }
    else {
        return Math.round((_number + Number.EPSILON) * decimal) / decimal;
    }
}

export function addHPBar(maxValue: number, nowValue: number, options: { bar?: string, line?: string } = { bar: '█', line: '|' }) {
    let result = '';
    if (maxValue < 0) maxValue = 0;
    if (nowValue < 0) nowValue = 0;
    if (nowValue > maxValue) nowValue = maxValue;
    let blockCount = Math.round(nowValue / 2);
    let lineCount = Math.round(maxValue / 2) - blockCount;

    if (nowValue <= 0) {
        blockCount = 0;
        lineCount = Math.round(maxValue / 2);
    }

    for (let i = 0; i < blockCount; i++) {
        result += options.bar;
    }
    for (let i = 0; i < lineCount; i++) {
        result += options.line;
    }
    return result;
}

export function startDrawing(width: number, height: number) {
    const canvas = new Canvas(width, height);
    return { 
        canvas: canvas,
        ctx: canvas.getContext('2d'),
    }
}

export function getCanvasCoordsFromBattleCoord(_c: Coordinate, _pixelsPerTile: number, _maxHeight: number, _shiftToMiddle = true) {
    return {
        x: _c.x * _pixelsPerTile + (_pixelsPerTile / 2 * Number(_shiftToMiddle)),
        y: (_maxHeight - _c.y - 1) * _pixelsPerTile + (_pixelsPerTile / 2 * Number(_shiftToMiddle))
    };
}

export function returnGridCanvas(_h: number = 9, _w: number = 9, _gridPixels: number = 500, groundImage?: Image): Canvas {
    const canvas = new Canvas(_w * _gridPixels, _h * _gridPixels);
    const ctx = canvas.getContext('2d');

    if (groundImage) {
        ctx.drawImage(groundImage, 0, 0, _w * _gridPixels, _h * _gridPixels);
    }
    else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, _w * _gridPixels, _h * _gridPixels);
    }
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = _gridPixels / 5;
    ctx.beginPath();
    for (let i = 1; i < _h; i++) {
        ctx.moveTo(0, i * _gridPixels);
        ctx.lineTo(_w * _gridPixels, i * _gridPixels);
    }
    for (let i = 1; i < _w; i++) {
        ctx.moveTo(i * _gridPixels, 0);
        ctx.lineTo(i * _gridPixels, _h * _gridPixels);
    }
    ctx.stroke();

    return canvas;
}

export function counterAxis(axis: 'x' | 'y'): 'x' | 'y' {
    return axis === 'x' ? 'y' : 'x';
}

export function getDirection(axis: 'x' | 'y', moveMagnitude: number) {
    const direction = axis === 'x' ? Math.sign(moveMagnitude) > 0 ? "right" : "left" : Math.sign(moveMagnitude) > 0 ? "up" : "down";
    return direction;
}

export function getMoveAction(_stat: Stat, _direction: Direction, _round: number, moveMagnitude: number): MoveAction;
export function getMoveAction(_stat: Stat, magnitude: number, _round: number, axis: "x" | "y"): MoveAction;
export function getMoveAction(_stat: Stat, args2: string | number, _round: number, args4: number | "x" | "y"): MoveAction {
    const movetype: ActionType = "Move";
    const moveAction: MoveAction = {
        executed: false,

        type: movetype,
        from: _stat,
        affected: _stat,
        readiness: 0,

        sword: 0,
        shield: 0,
        sprint: Number(_stat.moved),

        round: _round,
        priority: 4178,

        axis: 'x',
        magnitude: 0,
    };
    const args2_isAction = typeof args2 === 'string';    // args2: string, args4: number
    const args2_isMagnitude = typeof args2 === 'number'; // args2: number, args4: "x" | "y"
    if (args2_isAction) {
        const action: string = args2 as string;
        const moveMagnitude: number = args4 as number;

        const translated = directionToMagnitudeAxis(action as Direction);

        moveAction.axis = translated.axis;
        moveAction.magnitude = translated.magnitude * moveMagnitude;
    }
    else if (args2_isMagnitude) {
        const moveMagnitude: number = args2 as number;
        const axis: "x" | "y" = args4 as "x" | "y";
        moveAction.readiness = Battle.MOVE_READINESS * Math.abs(moveMagnitude);
        moveAction.axis = axis;
        moveAction.magnitude = moveMagnitude;
    }
    moveAction.readiness = Math.abs(moveAction.magnitude * Battle.MOVE_READINESS);
    return moveAction;
}

export function numericDirectionToDirection(_numericDir: NumericDirection): Direction {
    switch(_numericDir) {
        case NumericDirection.down:
            return "down";
        case NumericDirection.up:
            return "up";
        case NumericDirection.right:
            return "right";
        case NumericDirection.left:
            return "left";
    }
}
export function directionToNumericDirection(_direction: Direction): NumericDirection {
    switch (_direction) {
        case "down":
            return NumericDirection.down;
        case "up":
            return NumericDirection.up;
        case "right":
            return NumericDirection.right;
        case "left":
            return NumericDirection.left;
    }
}

export function replaceCharacterAtIndex(_string: string, _replace: string, _index: number) {
    return _string.substring(0, _index) + _replace + _string.substring(_index+1, _string.length);
}

export function directionToEmoji(_direction: Direction | NumericDirection) {
    const direction: Direction = Number.isInteger(_direction) ?
        numericDirectionToDirection(_direction as NumericDirection) :
        _direction as Direction;

    switch(direction) {
        case "down":
            return "⏬";
        case "up":
            return "⏫";
        case "left":
            return "⬅️";
        case "right":
            return "➡️";
    }
}
export function directionToMagnitudeAxis(_direction: Direction | NumericDirection) {
    let magnitude, axis: Axis;
    if (typeof _direction === 'number') {
        _direction = numericDirectionToDirection(_direction);
    }

    switch (_direction) {
        // move vertically
        case "up":
            magnitude = 1;
            axis = 'y';
            break;
        case "down":
            magnitude = -1;
            axis = 'y';
            break;
        // move horizontally
        case "right":
            magnitude = 1;
            axis = 'x';
            break;
        case "left":
            magnitude = -1;
            axis = 'x';
            break;
        default:
            throw Error("Fatal error at getMoveAction: invalid actionName is invalid.")
    }

    return {
        magnitude: magnitude,
        axis: axis,
    };
}

export function getAttackAction(_attacker: Stat, _victim: Stat, _weapon: Weapon, _coord: Coordinate, _round: Round): AttackAction {
    const actionType: ActionType = "Attack";
    const attackAction: AttackAction = {
        executed: false,

        type: actionType,
        from: _attacker,
        affected: _victim,
        readiness: _weapon.Readiness,

        sword: _weapon.sword,
        shield: _weapon.shield,
        sprint: _weapon.sprint,

        round: _round,
        priority: 4178,

        weapon: _weapon,
        coordinate: _coord
    };
    return attackAction;
}

export async function Test() {
    const userData: UserData = await getUserData("262871357455466496");
    for (const [key, value] of Object.entries(areasData.farmstead_empty.enemiesInfo)) {
        const Eclass = key as EnemyClass;
        const mod = { name: `${Eclass}` };
        const enemyBase: BaseStat = getNewObject(enemiesData[Eclass], mod) as BaseStat;
        const spawnCount = random(value.min, value.max);

        for (let i = 0; i < spawnCount; i++) {
            const enemyEntity: Stat = getStat(enemyBase);

            // randomly spawn in loot
            enemyEntity.base.lootInfo.forEach(_LInfo => {
                // roll for spawn item
                const roll = Math.random();
                if (roll < _LInfo.chance) {
                    // initialise if haven't yet
                    if (enemyEntity.drops === undefined) {
                        enemyEntity.drops = {
                            items: [],
                            money: 0,
                            droppedBy: enemyEntity
                        }
                    }

                    // spawn in item
                    const weight = random(_LInfo.weightDeviation.min + 0.00001, _LInfo.weightDeviation.max + 0.00001);
                    const item: Item = new Item(_LInfo.materials, weight, _LInfo.itemName);
                    userData.inventory.push(item);
                }
            });
        }
    }

    saveUserData(userData);
}

export function findReferenceAngle(_angle: number): number {
    const angle = Math.abs(_angle);
    if (angle <= 90) {
        return angle;
    }
    else if (angle <= 180) {
        return 180 - angle;
    }
    else if (angle <= 270) {
        return angle - 180;
    }
    else if (angle <= 360) {
        return 360 - angle;
    }
    return findReferenceAngle(angle - 360);
}

export function setUpInteractionCollect(msg: Message, cb: (itr: Interaction) => void, collectCount = 1) {
    const interCollectr = new InteractionCollector(BotClient, { message: msg, max: collectCount });
    interCollectr.on('collect', cb);
    return interCollectr;
}

export function getSelectMenuActionRow(options: MessageSelectOptionData[], customID?: string) {
    const menu = new MessageSelectMenu({
        options: options,
        customId: customID || "null",
    });
    const messageActionRow = new MessageActionRow({ components: [menu] });
    return messageActionRow;
}
export function getButtonsActionRow(_btnOptions: MessageButtonOptions[]) {
    const buttons: MessageButton[] = [];
    for (let i = 0; i < _btnOptions.length; i++) {
        const btnOption = _btnOptions[i];
        buttons.push(new MessageButton(btnOption));
    }
    const messageActionRow = new MessageActionRow({
        components: buttons
    })
    return messageActionRow;
}

export async function clearChannel(channel: TextChannel, afterMessage: Message) {
    const options: ChannelLogsQueryOptions = {
        after: afterMessage.id
    };
    await channel.messages.fetch(options)
        .then((messages) => {
            for (const [, m] of messages) m.delete().catch(() => {
                if (m.deletable) m.delete().catch();
            });
        });
}

export async function sendToSandbox(mo: MessageOptions) {
    const channel = await BotClient.channels.fetch("882231564715560991").then(c => c as TextChannel);
    return await channel.send(mo);
}

export function extractActions(action: Action) {
    const aAction = action as AttackAction;
    const mAction = action as MoveAction;
    return { aAction, mAction };
}

export function getConditionalTexts(text: string, condition: boolean): string {
    return condition ?
        text:
        '';
}

export function getWithSign(number: number) {
    return getConditionalTexts("+", number > 0) + getConditionalTexts("-", number < 0) + `${Math.abs(number)}`;
}

export function getActionsTranslate(array: Array<Action>) {
    const translatedArray: string[] = [];
    for (let i = 0; i < array.length; i++) {
        const action = array[i];
        const { aAction, mAction } = extractActions(action);
        
        let string: string = action.type;

        if (action.type === 'Attack') {
            string += ` "${action.affected.base.class}" (${action.affected.index}) with "${aAction.weapon.Name}".`;
        }
        else if (action.type === 'Move') {
            string += ` ${mAction.magnitude} ${getDirection(mAction.axis, mAction.magnitude)}.`
        }

        translatedArray.push(string);
    }

    return translatedArray;
}

export function getLoadingEmbed() {
    const url = "https://cdn.discordapp.com/attachments/571180142500511745/829109314668724234/ajax-loader.gif";
    const loadingEmbed = new MessageEmbed()
        .setAuthor("Wait a while.", url, url)
        .setTitle("Now Loading...");
    return loadingEmbed;
}
export function getWeaponEmbed(_weapon: Weapon) {
    const mWeaponDamage = _weapon.Damage;
    const mWeaponAcc = _weapon.Acc;
    const mWeaponRange = _weapon.Range;
    const mWeaponReadiness = _weapon.Readiness;
    const embed = new MessageEmbed({
        title: _weapon.Name,
        fields: [],
    });

    if (_weapon.desc) {
        embed.description = _weapon.desc;
    }

    // friendly skill: Readiness, Range, Token Requirements
    // aggressive skill: everything
    switch (_weapon.targetting.target) {
        case WeaponTarget.enemy:
            const damageField = {
                name: "Damage",
                value: `${mWeaponDamage[0]} - ${mWeaponDamage[1]}`,
                inline: false,
            };
            const accField = {
                name: "Accuracy",
                value: `${mWeaponAcc}`,
                inline: false,
            };
            const critField = {
                name: "Critical Chance",
                value: `+${_weapon.Crit}%`,
                inline: false,
            };

            embed.fields.push(damageField, accField, critField);
        case WeaponTarget.ally:
            const rangeField = {
                name: "Range",
                value: `${mWeaponRange[0]} - ${mWeaponRange[1]}`,
                inline: false,
            };
            const readinessField = {
                name: "Readiness",
                value: `${mWeaponReadiness}`,
                inline: false,
            }
            const tokensField = {
                name: "Tokens",
                value: `${EMOJI_SWORD.repeat(_weapon.sword)}${EMOJI_SHIELD.repeat(_weapon.shield)}${EMOJI_SPRINT.repeat(_weapon.sprint)}` || "(no token requirement)",
                inline: false,
            }

            embed.fields.push(rangeField, readinessField, tokensField);
            break;
    }

    return embed;
}
export function getStatsEmbed(_class: Class) {
    const embed = new MessageEmbed();
    const classChosen = getNewObject(classData[_class]);
    for (let i = 0; i < Object.keys(StatMaximus).length; i++) {
        const statName: StatPrimus = Object.keys(StatMaximus)[i] as StatPrimus;
        const maxBar = 50;
        const nowBar = classChosen[statName] * (50 / StatMaximus[statName]);
        embed.fields.push({
            name: `${statName} (${classChosen[statName]}/${StatMaximus[statName]})`,
            value: `\`${addHPBar(maxBar, nowBar)}\``,
            inline: false,
        })
    }
    return embed;
}

export function getCompass(focus: Coordinate, other: Coordinate): Vector2 {
    return { x: Math.sign(other.x - focus.x), y: Math.sign(other.y - focus.y) };
}

export function getPyTheorem(a: number, b: number): number {
    return Math.sqrt(a * a + b * b);
}

export function dealWithAccolade(clashResult: ClashResult, attacker: Stat, defender: Stat) {
    const CR_damage = clashResult.damage;
    const CR_u_damage = clashResult.u_damage;
    const CR_fate = clashResult.fate;
    const CR_roll = clashResult.roll;
    const attackerTAcco = attacker.accolades;
    const targetTAcco = defender.accolades;

    if (attacker.botType === BotType.naught) {
        // kill count
        if (defender.HP > 0 && defender.HP - CR_damage <= 0) attackerTAcco.kill++;
        // crit no
        if (CR_fate === 'Crit') attackerTAcco.critNo++;
        // damage dealt
        attackerTAcco.damageDealt += CR_damage;
        if (CR_roll !== null) {
            // roll average
            attackerTAcco.rollAverage = (attackerTAcco.rollAverage * attackerTAcco.clashNo + CR_roll) / (attackerTAcco.clashNo + 1);
            attackerTAcco.clashNo++;
        }
    }

    if (defender.botType === BotType.naught) {
        // damage taken
        targetTAcco.damageTaken += CR_damage;
        // damage absorbed
        targetTAcco.absorbed += CR_u_damage - CR_damage;
        // dodge count
        if (CR_fate === 'Miss') targetTAcco.dodged++;
        // clash count
        if (CR_roll !== null) {
            targetTAcco.clashNo++;
        }
    }
}

export function getNewObject<Type, Type2>(origin: Type, _mod?: Type2): Type & Type2 {
    const mod = (_mod || {}) as Type2;
    return Object.assign({...origin}, mod);
}

export function arrayGetLastElement<Type>(array: Array<Type>): Type {
    if (array.length < 1) return array[0];
    return array[array.length - 1];
}
export function arrayGetLargestInArray<Type>(array: Type[], _getValue: (_item: Type) => number): Type | undefined {
    return array.reduce((la, c) => {
        return _getValue(la) < _getValue(c) ?
            c :
            la;
    }, array[0]);
}
export function arrayRemoveItemArray<Type>(_array: Type[], _item: Type) {
    const index = _array.indexOf(_item);
    if (index !== undefined) {
        _array.splice(index, 1);
    }
    return index !== undefined;
}

export function getWeaponUses(weapon: Weapon, owner: Stat) {
    return owner.weaponUses[getWeaponIndex(weapon, owner)];
}

export function printCSMap(map: Map<string, Stat>) {
    log(`===================================`)
    map.forEach((v, k) => {
        const { x, y } = { x: k.split(',')[0], y: k.split(',')[1] };
        log(`${x}, ${y}     |      ${v.base.class}`);
    });
    log(`===================================`)
}

export function getMapFromCS(coordStat: CoordStat<SimplePlayerStat>): Map<StringCoordinate, Stat> {
    const mapReturn: Map<StringCoordinate, Stat> = new Map<StringCoordinate, Stat>();
    for (const yStat of Object.values(coordStat)) {
        for (const stat of Object.values(yStat)) {
            mapReturn.set(getCoordString(stat), getStat(stat));
        }
    }
    return mapReturn;
}

export function getCSFromMap(map: Map<string, Stat>): CoordStat<Stat> {
    const CSreturn: CoordStat<Stat> = {};
    map.forEach((_stat, _coordString) => {
        const {x, y} = { x: _coordString.split(',')[0], y: _coordString.split(',')[1] };
        if (CSreturn[x] === undefined) {
            CSreturn[x] = {};
        }
        CSreturn[x][y] = _stat;
    });
    return CSreturn;
}

export function getEmptyAccolade(): Accolade {
    return {
        kill: 0,
        damageDealt: 0,
        healingDone: 0,
        absorbed: 0,
        damageTaken: 0,
        dodged: 0,
        critNo: 0,
        clashNo: 0,
        rollAverage: 0,
        rollNo: 0,
    };
}

export function getWeaponIndex(weapon: Weapon, stat: Stat) {
    return stat.base.weapons.indexOf(weapon);
}

export function getBaseClassStat(className: Class) {
    return getNewObject(classData[className]) as BaseStat;
}
export function getBaseEnemyStat(enemyClassName: EnemyClass) {
    return getNewObject(enemiesData[enemyClassName]) as BaseStat;
}

export function getEmptyBuff(): Buffs {
    return {
        AHP: 0,
        Damage: 0,
        Acc: 0,
        Dodge: 0,
        Crit: 0,
        Prot: 0,
        Spd: 0,
        lifesteal: 0,
    };
}

export function getStat(bs: BaseStat, _owner?: string): Stat;
export function getStat(ss: SimplePlayerStat, _owner?: string): Stat;
export function getStat(bss: SimplePlayerStat | BaseStat, _owner: string = ''): Stat {
    const base: BaseStat = 'team' in bss ?
        getNewObject(classData[bss.class], bss) as BaseStat:
        bss as BaseStat;
    const ss = bss as SimplePlayerStat;

    const endStat: Stat = {
        base: base,
        index: -1,

        name: `${bss.class}`,

        weaponUses: [],
        actionsAssociatedStrings: {},
        statusEffects: [],

        HP: base.AHP,
        readiness: 0,
        moved: false,

        sword: 0,
        shield: 0,
        sprint: 0,

        owner: _owner,
        username: _owner,

        team: ss.team === undefined ?
            _owner ?
                "player":
                "enemy":
            ss.team,
        botType: ss.botType || (_owner?
                BotType.naught:
                BotType.approach_attack
        ),
        accolades: getEmptyAccolade(),
        buffs: getEmptyBuff(),
        debuffs: getEmptyBuff(),

        x: ss.x,
        y: ss.y,

        pvp: false,
    };

    for (let i = 0; i < base.weapons.length; i++) {
        endStat.weaponUses.push(0);
    }

    return endStat;
}

export function getCoordString(coord: Coordinate): StringCoordinate {
    return `${coord.x},${coord.y}`;
}

export function getRandomCode(length: number = 5) {
    const codeArray = [];
    for (let i = 0; i < length; i++) {
        codeArray.push(`${random(0, 9)}`);
    }
    return codeArray.join('');
}

export async function dealWithAction(action: Action, attCB: ((aa: AttackAction) => any), movCB: ((ma: MoveAction) => any)) {
    const moveAction = action as MoveAction;
    const attackAction = action as AttackAction;
    if (moveAction.type === 'Move') {
        await movCB(moveAction);
    }
    else if (attackAction.type === 'Attack') {
        await attCB(attackAction);
    }
}
export function printAction(_action: Action) {
    dealWithAction(_action,
        (aA) => {
            log(`${aA.type} || readiness=${aA.readiness} | affected=${aA.affected.index} | from=${aA.from.index} | weapon=${aA.weapon.Name}`)
        },
        (mA) => {
            log(`${mA.type} || readiness=${mA.readiness} | affected=${mA.affected.index} | from=${mA.from.index} | magnitude=${mA.magnitude} | axis=${mA.axis}`)
        }
    );
}

export function getDeathEmbed() {
    return new MessageEmbed()
        .setImage('https://i.ytimg.com/vi/Kr9rIx7MVvg/maxresdefault.jpg')
        .setThumbnail('https://i.imgur.com/iUgLdX2.png2')
        .setTitle(`*"${deathQuotes[random(0, deathQuotes.length - 1)]}"*`)
        .setAuthor(preludeQuotes[random(0, preludeQuotes.length - 1)])
        .setColor("#530000");
}

export function dealWithUndoAction(stat: Stat, action: Action) {
    stat.sword += action.sword;
    stat.shield += action.shield;
    stat.sprint += action.sprint;
    stat.readiness += action.readiness;
    action.executed = false;

    const moveAction: MoveAction = action as MoveAction;
    if (moveAction.magnitude !== undefined) {
        // if action is a free movement action
        if (moveAction.sprint === 0) {
            stat.moved = false;
        }

        // reposition
        stat[moveAction.axis] += moveAction.magnitude * -1;
    }
}

export function HandleTokens(changeToken: { sword?: number, shield?: number, sprint?: number }, changingFunction: ((p:number, type: "sword" | "shield" | "sprint") => void)) {
    if (changeToken.sword !== undefined) {
        changingFunction(changeToken.sword, "sword");
    }
    if (changeToken.shield !== undefined) {
        changingFunction(changeToken.shield, "shield");
    }
    if (changeToken.sprint !== undefined) {
        changingFunction(changeToken.sprint, "sprint");
    }
}

export function getNewNode(_x: number, _y: number, _destination: Coordinate, _distanceTravelled: number = 0): AINode {
    const desC = Math.abs(_x - _destination.x) + Math.abs(_y - _destination.y);
    const totalC = _distanceTravelled + desC;
    const object = {
        x: _x,
        y: _y,
        lastNode: null,
        nextNode: null,
        distanceTravelled: _distanceTravelled,
        distanceToDestination: desC,
        totalCost: totalC,
    };
    return object;
}

export function shortenString(_s: string, _length = 2048) {
    const array = _s.split('');
    while (array.length > _length) {
        array.pop();
    }
    return array.join('');
}

export function drawText(
    _ctx: NodeCanvasRenderingContext2D,
    _text: string,
    _textSize: number,
    _canvasCoord: Coordinate,
    _angle: number = 0
): void {
    // log(`\tDrawing "${_text}" at ${JSON.stringify(_canvasCoord)} (angle: ${_angle})`)
    const textSize = Math.round(_textSize);

    _ctx.save();

    _ctx.font = `${textSize}px Verdana`;
    _ctx.lineWidth = 0.5;
    _ctx.fillStyle = "white"
    _ctx.strokeStyle = "black"
    _ctx.textAlign = "center"

    _ctx.translate(_canvasCoord.x, _canvasCoord.y);

    const referenceAngle = findReferenceAngle(_angle);
    if (referenceAngle < 90) {
        _ctx.rotate(_angle);
    }
    _ctx.fillText(_text, 0, textSize/3);
    _ctx.strokeText(_text, 0, textSize/3);

    _ctx.restore();
}
export function drawCircle(
    _ctx: NodeCanvasRenderingContext2D,
    _canvasCoord: Coordinate,
    _radius: number,
    _stroke = true,
    _percentage = 1
): void {
    _ctx.save();

    _ctx.closePath();

    _ctx.beginPath();
    _ctx.arc(_canvasCoord.x, _canvasCoord.y, _radius, 0, Math.PI * 2 * _percentage);
    if (_stroke) {
        _ctx.stroke();
    }
    else {
        _ctx.fill();
    }
    _ctx.closePath();

    _ctx.restore();
}

export async function sendInvitation(_id: string, _fromID: string, _?: TextChannel): Promise<boolean | null>;
export async function sendInvitation(_user: User, _from: User, _?: TextChannel): Promise<boolean | null>;
export async function sendInvitation(_user_id: User | string, _from: User | string, channel?: TextChannel): Promise<boolean | null> {
    const inviterUser: User | undefined = (_from as User).avatar ?
        _from as User :
        await BotClient.users.fetch(_from as string).then(u => u).catch(() => undefined);

    const user: User | undefined = (_user_id as User).avatar?
        _user_id as User :
        await BotClient.users.fetch(_user_id as string).then(u => u).catch(() => undefined);

    return new Promise<boolean | null>((resolve) => {
        if (user && inviterUser) {
            const buttonOptions: MessageButtonOptions[] = [
                {
                    label: "Accept",
                    style: "SUCCESS",
                    customId: "accept"
                },
                {
                    label: "Decline",
                    style: "DANGER",
                    customId: "decline"
                },
            ];
            const messagePayload: MessageOptions = {
                embeds: [
                    new MessageEmbed({
                        title: "You have been invited!",
                        footer: {
                            text: `...by ${inviterUser?.username}`,
                            iconURL: inviterUser.displayAvatarURL() || inviterUser.defaultAvatarURL,
                            icon_url: inviterUser.displayAvatarURL() || inviterUser.defaultAvatarURL,
                        }
                    })
                ],
                components: [getButtonsActionRow(buttonOptions)],
            }

            user.send(messagePayload)
                .then(_m => {
                    const buttonInteractionCollection = setUpInteractionCollect(_m, async itr => {
                        if (itr.isButton() && itr.user.id === user.id) {
                            clearTimeout(timeOut);
                            const selectedButton = itr.customId;
                            if (selectedButton === "accept") {
                                resolve(true);
                            }
                            else {
                                resolve(false);
                            }

                            _m.delete();
                            await itr.reply({
                                content: selectedButton === "accept" ?
                                    "Accepted.":
                                    "Declined."
                            });
                        }
                    });

                    // timeout: done checking round
                    const timeOut = setTimeout(() => {
                        buttonInteractionCollection.stop();
                        _m.delete();
                        resolve(false);
                    }, 15 * 1000);
                })
                .catch(_e => {
                    log(_e);
                    resolve(null);
                });
        }
    });
}

export function breadthFirstSearch<Type>(
    _startingRoom: Type,
    _extender: (_: Type) => (Type | null)[],
    _pushToQueueCondition: (_q: Type[], _current: Type) => boolean,
    _pushToResultCondition: (_current: Type) => boolean,
) {
    const result: Type[] = [];

    const queue: Type[] = [_startingRoom];
    const exploredRooms: Type[] = [];

    // branch out and seek
    let currentRoom = queue.shift();
    while (currentRoom) {
        const extension = _extender(currentRoom);
        for (let i = 0; i < extension.length; i++) {
            const r = extension[i];
            if (r && !exploredRooms.includes(r)) {
                exploredRooms.push(r);
                if (_pushToQueueCondition(queue, currentRoom)) {
                    queue.push(r);
                }
            }
        }

        if (_pushToResultCondition(currentRoom)) {
            result.push(currentRoom);
        }

        currentRoom = queue.shift();
    }

    return result;
}

export function getGradeTag(_mI: MaterialQualityInfo) {
    switch (_mI.grade) {
        case MaterialGrade.poor:
            return 'Poor'
        case MaterialGrade.common:
            return '𝗖𝗼𝗺𝗺𝗼𝗻';
        case MaterialGrade.good:
            return '𝑮𝒐𝒐𝒅';
        case MaterialGrade.rare:
            return 'ℜ𝔞𝔯𝔢';
        case MaterialGrade.very_rare:
            return '𝖁𝖊𝖗𝖞 𝕽𝖆𝖗𝖊'
        case MaterialGrade.mythical:
            return '𝑴 𝒀 𝑻 𝑯 𝑰 𝑪 𝑨 𝑳'
    }
}

export function getItemType(_i: Item): ItemType | null {
    const { weight } = _i;
    for (const [_itemName, _data] of Object.entries(itemData)) {
        const itemName = _itemName as keyof typeof itemData;
        const data = _data;

        const qualification = data.qualification;
        if (data.qualificationWeight <= weight) {
            let passed: number = 0;
            const qualificationEntries = Object.entries(qualification);
            for (const [_material, _requiredOccupation] of qualificationEntries) {
                const material: Material = _material as Material;
                const mI: MaterialQualityInfo | null =
                    _i.materialInfo.find(_mI => _mI.materialName === material)||
                    null;
                if (mI && mI.occupation >= _requiredOccupation) {
                    passed++;
                }
            }
            if (passed === qualificationEntries.length) {
                return itemName;
            }
        }
    }
    return null;
}