import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { Interaction, Message, MessageActionRow, MessageEmbed, MessageOptions, MessageSelectMenu, TextChannel, InteractionCollector, ChannelLogsQueryOptions, User, MessageButton, MessageButtonOptions, MessageSelectOptionData, ButtonInteraction } from "discord.js";

import { debug, log } from "console"

import { BotClient } from "..";
import { Class, SimplePlayerStat, StringCoordinate, Accolade, Buffs, deathQuotes, CoordStat, preludeQuotes, Action, ActionType, AINode, AttackAction, BaseStat, BotType, ClashResult, Coordinate, EnemyClass, MoveAction, Stat, Ability, AbilityAOE, AbilityTargetting, Vector2, RGBA, COMMAND_CALL, GetBuffOption, Buff, StatusEffectType, Direction, Axis, NumericDirection, EMOJI_SWORD, EMOJI_SHIELD, EMOJI_SPRINT, StatMaximus, StatPrimus, ItemType, MaterialInfo, MaterialGrade, Material, LootAction, EMOJI_CROSS, EMOJI_WHITEB, ForgeWeaponPart, EMOJI_TICK, ForgeWeaponObject, DamageRange, EMOJI_MONEYBAG, ForgeWeaponType, AttackRange } from "../typedef";
import { Battle } from "./Battle";
import { Item } from "./Item";
import { enemiesData, classData, itemData, universalAbilitiesData, forgeWeaponData, universalWeaponsData } from "../jsons";
import { getEquippedForgeWeapon, getUserData, saveUserData } from "./Database";
import { InteractionEvent } from "./InteractionEvent";

// RGBA
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
export function uniformRandom(num1: number, num2: number): number {
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
export function average(...nums: Array<number>) {
    let total = 0;
    for (let i = 0; i < nums.length; i++) {
        const n = nums[i];
        total += n;
    }
    return total / (nums.length || 1);
}
export function normalRandom(_mean: number, _standardDeviation: number): number {
    // Box Muller Transform
    let u, v;
    while (!u || !v) {
        u = Math.random();
        v = Math.random();
    }
    const x_N0_1 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    return _mean + _standardDeviation * x_N0_1;
}
export function clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
}

// get battle stats: when attacked
export function getAHP(_attacker: Stat, _options: GetBuffOption = 'WithBoth'): number {
    const maxHP = _attacker.base.maxHP;
    const AHPBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.maxHP : 0;
    const AHPDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.maxHP : 0;
    return (maxHP + AHPBuff - AHPDebuff) || 0;
}
export function getDodge(_attacker: Stat, _options: GetBuffOption = 'WithBoth'): number {
    const dodge = _attacker.base.dodge;
    const dodgeBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.dodge : 0;
    const dodgeDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.dodge : 0;
    return (dodge + dodgeBuff - dodgeDebuff) || 0;
}
export function getProt(_defender: Stat, options: GetBuffOption = 'WithBoth'): number {
    const equippedWeapon = _defender.equipped;
    const prot = _defender.base.protection;
    const protBuff = (options === 'WithBuff' || options === 'WithBoth') ? _defender.buffs.protection : 0;
    const protDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? _defender.debuffs.protection : 0;
    return (prot + protBuff - protDebuff) || 0;
}
// get battle stats: when attacking
export function getDamage(_attacker: Stat, _ability: Ability, _options: GetBuffOption = 'WithBoth'): DamageRange {
    const _fw = _attacker.equipped;
    const damageRange = _fw.damageRange;
    const damageBuff: number =
        (_options === 'WithBuff' || _options === 'WithBoth')?
            _attacker.buffs.damageRange : 0;
    const damageDebuff: number =
        (_options === 'WithDebuff' || _options === 'WithBoth')?
            _attacker.debuffs.damageRange : 0;
    const abilityScaling: number = _ability.damageScale;

    return {
        min: (damageRange.min * abilityScaling) + _ability.bonus.damage + damageBuff - damageDebuff,
        max: (damageRange.max * abilityScaling) + _ability.bonus.damage + damageBuff - damageDebuff,
    }
}
export function getAcc(_attacker: Stat, _ability: Ability, options: GetBuffOption = 'WithBoth'): number {
    const _fw = _attacker.equipped;
    const acc = _fw.accuracy;
    const accBuff = (options === 'WithBuff' || options === 'WithBoth') ? _attacker.buffs.accuracy : 0;
    const accDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? _attacker.debuffs.accuracy : 0;
    return (acc + _ability.bonus.accuracy + accBuff - accDebuff) || 0;
}
export function getExecutionSpeed(_attacker: Stat, _ability: { speedScale: number }, _options: GetBuffOption = 'WithBoth'): number {
    const spd = _attacker.base.speed;
    const spdBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.speed : 0;
    const spdDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.speed : 0;
    return (_attacker.readiness + spd + spdBuff - spdDebuff) * _ability.speedScale || 0;
}
export function getCrit(_attacker: Stat, _ability: Ability, _options: GetBuffOption = 'WithBoth'): number {
    const weapon = _attacker.equipped;
    const crit = weapon.criticalHit;
    const critBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.criticalHit : 0;
    const critDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.criticalHit : 0;
    return (crit + critBuff + _ability.bonus.criticalHit - critDebuff) || 0;
}
export function getLifesteal(_attacker: Stat, _ability: Ability, _options: GetBuffOption = 'WithBoth'): number {
    const weapon = _attacker.equipped;
    const ls = weapon.lifesteal;
    const lsBuff = (_options === 'WithBuff' || _options === 'WithBoth') ? _attacker.buffs.lifesteal : 0;
    const lsDebuff = (_options === 'WithDebuff' || _options === 'WithBoth') ? _attacker.debuffs.lifesteal : 0;
    return (ls + _ability.bonus.lifesteal + lsBuff - lsDebuff) || 0;
}

export function getLongArm(_stat: Stat): Ability | null {
    const abilities: Array<Ability> = _stat.base.abilities;
    const equippedWeaponRange: AttackRange = _stat.equipped.range;
    return abilities.reduce((_longArm, _a) => {
        // return longArm when...
        //  _a is null type but does not have a range               (_a invalid)
        //  longArm is not null and _a range is inferior to longArm (longArm superior)
        if (
            (_a.type === 'null' && !_a.range) ||
            _longArm !== null &&
                ((_longArm.range?.max || equippedWeaponRange.max) >= (_a.range?.max || equippedWeaponRange.max))
        ) {
            return _longArm;
        }
        // return _a when...
        // longArm is null and _a has valid range                   (_a valid)
        //  _a is null type and innate range is superior to longArm (_a superior (null innate))
        //  _a is specified type and range is superior to longArm   (_a superior (specified weapon/innate))
        else if (
            (_longArm === null && (_a.type !== 'null' || _a.range)) ||
            _longArm &&
            (_a.type === 'null' && _a.range &&
                _a.range.max > (_longArm.range?.max || equippedWeaponRange.max) ||
            _a.type !== 'null' &&
                (_a.range?.max || equippedWeaponRange.max) > (_longArm.range?.max || equippedWeaponRange.max))
        ) {
            return _a;
        }
        else {
            return null;
        }
    }, null as Ability | null);
}

export function findEqualCoordinate(_c: Coordinate, __c: Coordinate) {
    return _c.x === __c.x && _c.y === __c.y;
}

export function getDistance(stat1: Coordinate, stat2: Coordinate): number {
    const xDif = stat1.x - stat2.x;
    const yDif = stat1.y - stat2.y;
    return Math.sqrt((xDif) * (xDif) + (yDif) * (yDif));
}
export function getAttackRangeFromAA(_aA: AttackAction) {
    return _aA.weapon?.range || _aA.ability.range || null;
}

export function checkWithinDistance(_aA: AttackAction, distance: number): boolean {
    const hasWeapon: boolean = _aA.weapon !== null;
    const abilityRange = _aA.ability?.range;

    const range =
        hasWeapon && !abilityRange?
            _aA.weapon!.range:
            abilityRange;

    const result = range?
        range.min <= distance && (range.radius || range.max) >= distance:
        false;

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

export function newWeapon(origin: Ability, modifier: {
    abilityName?: '',
    accuracy?: 0,
    damageRange?: [number, number];
    range?: [number, number, number?];
    readinessCost?: 0,
    criticalHit?: 0,
    lifesteal?: 0,
    targetting?: {
        target: AbilityTargetting,
        AOE: AbilityAOE
    };
    cooldown?: 0,
    UPT?: 0,
    uses?: number }): Ability 
{
    return Object.assign({ ...origin }, modifier);
}

export function roundToDecimalPlace(_number: number, _decimalPlace?: number) {
    if (_number === 0) return 0;

    const decimalPlace = _decimalPlace === undefined?
        1:
        Math.round(_decimalPlace);
    const decimal = Math.pow(10, decimalPlace);

    if (_decimalPlace === undefined) {
        let value: number;
        for (let i = 0; i < 25; i++) {
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

export function addHPBar(_maxValue: number, _nowValue: number, _maxBarProportion = Math.round(_maxValue)) {
    const bar = '█';
    const line = '|';

    if (_maxValue < 0) _maxValue = 0;
    if (_nowValue < 0) _nowValue = 0;
    if (_nowValue > _maxValue) _nowValue = _maxValue;

    const maxValue =
        _maxValue * (_maxBarProportion / _maxValue);
    const nowValue =
        _nowValue * (_maxBarProportion / _maxValue);

    const blockCount =
        nowValue <= 0?
            0:
            Math.round(nowValue);
    const lineCount = Math.round(maxValue) - blockCount;

    // debug("_maxBarProportion", _maxBarProportion);
    // debug("_maxValue", _maxValue);
    // debug("_nowValue", _nowValue);
    // debug("maxValue", maxValue);
    // debug("nowValue", nowValue);
    // debug("blockCount", blockCount);
    // debug("lineCount", lineCount);

    let result = '';
    for (let i = 0; i < blockCount; i++) {
        result += bar;
    }
    for (let i = 0; i < lineCount; i++) {
        result += line;
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
    ctx.lineWidth = _gridPixels / 50;
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
        attacker: _stat,
        target: _stat,
        readinessCost: 0,

        sword: 0,
        shield: 0,
        sprint: Number(_stat.moved),

        priority: getExecutionSpeed(_stat, { speedScale: 1 }),

        axis: 'x',
        magnitude: 0,
    };
    const args2_isAction = typeof args2 === 'string';    // args2: string, args4: number
    const args2_isMagnitude = typeof args2 === 'number'; // args2: number, args4: "x" | "y"
    if (args2_isAction) {
        const action: string = args2 as string;
        const moveMagnitude: number = args4 as number;

        const translated = translateDirectionToMagnitudeAxis(action as Direction);

        moveAction.axis = translated.axis;
        moveAction.magnitude = translated.magnitude * moveMagnitude;
    }
    else if (args2_isMagnitude) {
        const moveMagnitude: number = args2 as number;
        const axis: "x" | "y" = args4 as "x" | "y";
        moveAction.readinessCost = Battle.MOVE_READINESS * Math.abs(moveMagnitude);
        moveAction.axis = axis;
        moveAction.magnitude = moveMagnitude;
    }
    moveAction.readinessCost = Math.abs(moveAction.magnitude * Battle.MOVE_READINESS);
    return moveAction;
}

export function getLootAction(_stat: Stat, _c: Coordinate): LootAction {
    return {
        x: _c.x,
        y: _c.y,
        priority: getExecutionSpeed(_stat, { speedScale: 1 }),
        attacker: _stat,
        target: _stat,
        readinessCost: 0,
        type: 'Loot',
        executed: false,
        sword: 0,
        shield: 0,
        sprint: 0,
    }
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

// translation functions
export function translateDirectionToEmoji(_direction: Direction | NumericDirection) {
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
export function translateDirectionToMagnitudeAxis(_direction: Direction | NumericDirection) {
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
export function translateClashToCommentary(_aA: AttackAction): string {
    let returnString = '';
    if (_aA.clashResult) {
        const { attacker, target, ability } = _aA;
        const { fate, damage, u_damage } = _aA.clashResult;

        // weapon effect string
        returnString += _aA.abilityEffectString || '';

        // main chunk
        switch (ability.targetting.target) {
            case AbilityTargetting.enemy:
                const accDodge = (getAcc(attacker, ability) - getDodge(target));
                const hitRate =
                    accDodge < 100 ?
                        roundToDecimalPlace(accDodge) :
                        100;
                const critRate =
                    roundToDecimalPlace(accDodge * 0.1 + getCrit(attacker, ability));
                returnString +=
                    `__**${ability.abilityName}**__ ${hitRate}% [${critRate}%]\n**${fate}!** -**${roundToDecimalPlace(damage)}** (${roundToDecimalPlace(u_damage)})`
                if (target.HP > 0 && target.HP - damage <= 0) {
                    returnString += "\n__**KILLING BLOW!**__";
                }
                break;

            case AbilityTargetting.ally:
                if (attacker.index === target.index) {
                    returnString +=
                        `**${attacker.base.class}** (${attacker.index}) Activates __*${ability.abilityName}*__`;
                }
                else {
                    returnString +=
                        `**${attacker.base.class}** (${attacker.index}) 🛡️ **${target.base.class}** (${target.index})
                    __*${ability.abilityName}*__`;
                }
                break;
        }

        // healing
        // ...
    }

    return returnString;
}
export function translateActionToCommentary(_action: Action) {
    const { aAction, mAction } = extractActions(_action);

    let string: string = `[🌬️${_action.priority}] `;
    const { attacker, target, ability } = aAction;
    switch (_action.type) {
        case 'Attack':
            string +=
                `${EMOJI_SWORD} ${attacker.base.class} (${attacker.index}) uses __${ability.abilityName}__ on ${target.base.class} (${target.index}).`;
            string += "\n" + translateClashToCommentary(aAction);
            break;

        case 'Move':
            string +=
                `${EMOJI_SPRINT} ${attacker.base.class} (${attacker.index}) moves ${getDirection(mAction.axis, mAction.magnitude)}.`
            break;

        case 'Loot':
            string +=
                `${EMOJI_MONEYBAG} ${attacker.base.class} (${attacker.index}) loots.`
            break;
    }

    return string;
}
export function translateRGBAToStringRGBA(rgba: RGBA) {
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.alpha})`;
}

export function getAttackAction(_attacker: Stat, _victim: Stat, _weapon: ForgeWeaponObject | null, _ability: Ability, _coord: Coordinate): AttackAction {
    const actionType: ActionType = "Attack";
    const attackAction: AttackAction = {
        executed: false,

        type: actionType,
        attacker: _attacker,
        target: _victim,
        readinessCost: _ability.readinessCost,

        sword: _ability.sword,
        shield: _ability.shield,
        sprint: _ability.sprint,

        priority: getExecutionSpeed(_attacker, _ability),

        weapon: _weapon,
        ability: _ability,
        coordinate: _coord
    };
    return attackAction;
}

export async function Test() {
    // const testEvent = new InteractionEvent("", )
}

export function getPromiseStatus(p: Promise<unknown>): Promise<'pending' | 'fulfilled' | 'rejected'> {
    const t = {};
    return Promise.race([p, t])
        .then(v =>
            (v === t)?
                "pending":
                "fulfilled",
            () => "rejected"
        );
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
    const interCollector = new InteractionCollector(BotClient, { message: msg, max: collectCount });
    interCollector.on('collect', cb);
    return interCollector;
}
export async function confirmationInteractionCollect(
    _editMsg: Message,
    _yesCB: (_itr: ButtonInteraction) => void = async _itr => await _itr.update({}),
    _noCB: (_itr: ButtonInteraction) => void = async _itr => await _itr.update({}),
    _timeout = 120 * 1000
): Promise<number> {
    const collector: InteractionCollector<Interaction> =
        new InteractionCollector(BotClient, { message: _editMsg, max: 1, time: _timeout });
    await _editMsg.edit({
        embeds: _editMsg.embeds,
        components: [getButtonsActionRow([
            {
                emoji: EMOJI_TICK,
                label: "Yes",
                style: "SUCCESS",
                customId: "yes"
            },
            {
                emoji: EMOJI_CROSS,
                label: "No",
                style: "DANGER",
                customId: "no"
            }
        ])],
    });

    return new Promise((resolve) => {
        let answer = -1;
        collector.on('collect', async _itr => {
            if (_itr.isButton()) {
                const selected = _itr.customId;
                switch (selected) {
                    case 'yes':
                        answer = 1;
                        await _itr.update({});
                        break;

                    case 'no':
                        answer = 0;
                        await _itr.update({});
                        break;
                }
            }
        });

        collector.on('end', () => {
            resolve(answer);
        });
    })
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
    const lAction = action as LootAction;
    return { aAction, mAction, lAction };
}

export function getConditionalTexts(text: string, condition: boolean): string {
    return condition ?
        text:
        '';
}

export function getWithSign(number: number) {
    return getConditionalTexts("+", number > 0) + getConditionalTexts("-", number < 0) + `${Math.abs(number)}`;
}

// getting embeds
export function getLoadingEmbed() {
    const url = "https://cdn.discordapp.com/attachments/571180142500511745/829109314668724234/ajax-loader.gif";
    const loadingEmbed = new MessageEmbed()
        .setAuthor("Wait a while.", url, url)
        .setTitle("Now Loading...");
    return loadingEmbed;
}
export function getForgeWeaponEmbed(_fw: ForgeWeaponObject) {
    const embed = new MessageEmbed({
        title: formalise(_fw.weaponType),
        description:
`
**__Range__**:
‎\t**__Minimum__**: ${_fw.range.min}
‎\t**__Max__**: ${_fw.range.max}
‎\t**__Radius__**: ${_fw.range.radius}
**__Damage Range__**: [${_fw.damageRange.min}] ~ [${_fw.damageRange.max}]
**__Accuracy__**: [${_fw.accuracy}]
**__Lifesteal__**: [${_fw.lifesteal * 100}]%
**__Bonus Critical Chance__**: +[${_fw.criticalHit}]
**__Readiness Cost__**: [${_fw.readinessCost}]
**__Stamina Cost__**: [${_fw.staminaCost}]
`
    })

    return embed;
}
export function getAbilityEmbed(_ability: Ability) {
    const { damageScale, staminaScale, readinessCost, speedScale, range } = _ability
    const embed = new MessageEmbed({
        title: _ability.abilityName,
        fields: [],
    });

    if (_ability.desc) {
        embed.description = _ability.desc;
    }

    // friendly skill: readinessCost, range, Token Requirements
    // aggressive skill: everything
    switch (_ability.targetting.target) {
        case AbilityTargetting.enemy:
            const damageField = {
                name: "Damage Scaling",
                value: `x${damageScale* 100}%`,
                inline: false,
            };
            const staminaCostField = {
                name: "Stamina Cost Scaling",
                value: `x${staminaScale}`,
                inline: false,
            };
            const speedField = {
                name: "Speed Scaling",
                value: `x${speedScale}`,
                inline: false,
            };

            embed.fields.push(damageField, staminaCostField, speedField);
        case AbilityTargetting.ally:
            const rangeField = {
                name: "range",
                value: 
                range?
                    `${range!.min} - ${range!.max}`:
                    "( *Weapon Dependent* )",
                inline: false,
            };
            const readinessField = {
                name: "readinessCost",
                value: `${readinessCost}`,
                inline: false,
            }
            const tokensField = {
                name: "Tokens",
                value: `${EMOJI_SWORD.repeat(_ability.sword)}${EMOJI_SHIELD.repeat(_ability.shield)}${EMOJI_SPRINT.repeat(_ability.sprint)}` || "(no token requirement)",
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
        embed.fields.push({
            name: `${statName} (${classChosen[statName]}/${StatMaximus[statName]})`,
            value: `\`${addHPBar(StatMaximus[statName], classChosen[statName], 20)}\``,
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
        if (CR_fate === "CRIT") attackerTAcco.critNo++;
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
export function arrayGetSmallestInArray<Type>(array: Type[], _getValue: (_item: Type) => number): Type | undefined {
    return array.reduce((smallest, c) => {
        return _getValue(smallest) > _getValue(c) ?
            c :
            smallest;
    }, array[0]);
}
export function arrayRemoveItemArray<Type>(_array: Type[], _item: Type) {
    const index = _array.indexOf(_item);
    if (index !== undefined) {
        _array.splice(index, 1);
    }
    return index !== undefined;
}
export function arrayGetRandom<Type>(array: Type[]): Type | null {
    return array[uniformRandom(0, array.length - 1)] === undefined?
        null:
        array[uniformRandom(0, array.length - 1)];
}

export function getWeaponUses(ability: Ability, owner: Stat) {
    return owner.weaponUses[getAbilityIndex(ability, owner)];
}

export function printCSMap(map: Map<string, Stat>) {
    log(`===================================`)
    map.forEach((v, k) => {
        const { x, y } = { x: k.split(',')[0], y: k.split(',')[1] };
        log(`${x}, ${y}     |      ${v.base.class}`);
    });
    log(`===================================`)
}

export async function getMapFromCS(coordStat: CoordStat<SimplePlayerStat>): Promise<Map<StringCoordinate, Stat>> {
    const mapReturn: Map<StringCoordinate, Stat> = new Map<StringCoordinate, Stat>();
    for (const yStat of Object.values(coordStat)) {
        for (const stat of Object.values(yStat)) {
            mapReturn.set(getCoordString(stat), await getStat(stat));
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

export function getAbilityIndex(ability: Ability, stat: Stat) {
    return stat.base.abilities.indexOf(ability);
}

export function getBaseClassStat(className: Class) {
    return getNewObject(classData[className]) as BaseStat;
}
export function getBaseEnemyStat(enemyClassName: EnemyClass) {
    return getNewObject(enemiesData[enemyClassName]) as BaseStat;
}

export function getEmptyBuff(): Buffs {
    return {
        maxHP: 0,
        damageRange: 0,
        accuracy: 0,
        dodge: 0,
        criticalHit: 0,
        protection: 0,
        speed: 0,
        lifesteal: 0,
    };
}

export async function getStat(_class: Class): Promise<Stat>;
export async function getStat(bs: BaseStat, _owner?: string): Promise<Stat>;
export async function getStat(ss: SimplePlayerStat, _owner?: string): Promise<Stat>;
export async function getStat(_arg0: Class | SimplePlayerStat | BaseStat, _owner: string = ''): Promise<Stat> {
    const { base, ss } = (() => {
        let _b: BaseStat, _s: SimplePlayerStat;
        if (typeof _arg0 === 'string') {
            const _c = _arg0 as Class;
            _b = getBaseClassStat(_c);
            _s = {
                class: _c,
                team: classData[_c]?
                    'player':
                    'enemy',
                botType: BotType.naught,
                x: 0,
                y: 0,
            };
        }
        else {
            _b = 'team' in _arg0 ?
                getNewObject(classData[_arg0.class], _arg0) as BaseStat :
                _arg0 as BaseStat;
            _s = _arg0 as SimplePlayerStat;
        }
        return {
            base: _b,
            ss: _s,
        };
    })();

    // add universal weapons
    for (let i = 0; i < Object.keys(universalAbilitiesData).length; i++) {
        const universalWeaponName: keyof typeof universalAbilitiesData = Object.keys(universalAbilitiesData)[i] as keyof typeof universalAbilitiesData;
        const uniWeapon: Ability = getNewObject(universalAbilitiesData[universalWeaponName] as Ability);
        base.abilities.push(uniWeapon);
    }

    // extract arsenal from firebase
    if (_owner) {
        base.arsenal = await getEquippedForgeWeapon(_owner);
    }

    // add normal attacks for arsenal weapons
    for (let i = 0; i < base.arsenal.length; i++) {
        const fw = base.arsenal[i];
        base.abilities.push(getForgeWeaponAttackAbility(fw));
    }

    // weapon uses init
    const weaponUses: number[] = [];
    for (let i = 0; i < base.abilities.length; i++) {
        weaponUses.push(0);
    }

    return {
        base: base,
        index: -1,

        equipped: base.arsenal[0] || getNewObject(universalWeaponsData.Unarmed) as ForgeWeaponObject,

        name: `${base.class}`,

        weaponUses: weaponUses,
        statusEffects: [],

        HP: base.maxHP,
        stamina: base.maxStamina,
        readiness: 0,
        moved: false,

        sword: 0,
        shield: 0,
        sprint: 0,

        owner: _owner,
        username: _owner,

        team: ss.team === undefined ?
            _owner ?
                "player" :
                "enemy" :
            ss.team,
        botType: ss.botType || (_owner ?
            BotType.naught :
            BotType.approach_attack
        ),
        accolades: getEmptyAccolade(),
        buffs: getEmptyBuff(),
        debuffs: getEmptyBuff(),

        x: ss.x,
        y: ss.y,

        pvp: false,
    };;
}

export function getCoordString(coord: Coordinate): StringCoordinate {
    return `${coord.x},${coord.y}`;
}
export function getCoord(_coordString: string): Coordinate | null {
    const c = _coordString.split(",");
    if (c.length === 2) {
        return {
            x: parseInt(c[0]),
            y: parseInt(c[1]),
        }
    }
    else {
        return null;
    }
}

export function getRandomCode(length: number = 5) {
    const codeArray = [];
    for (let i = 0; i < length; i++) {
        codeArray.push(`${uniformRandom(0, 9)}`);
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
            log(`${aA.type} || readiness=${aA.readinessCost} | affected=${aA.target.index} | from=${aA.attacker.index} | ability=${aA.ability.abilityName}`)
        },
        (mA) => {
            log(`${mA.type} || readiness=${mA.readinessCost} | affected=${mA.target.index} | from=${mA.attacker.index} | magnitude=${mA.magnitude} | axis=${mA.axis}`)
        }
    );
}

export function getDeathEmbed() {
    return new MessageEmbed()
        .setImage('https://i.ytimg.com/vi/Kr9rIx7MVvg/maxresdefault.jpg')
        .setThumbnail('https://i.imgur.com/iUgLdX2.png2')
        .setTitle(`*"${deathQuotes[uniformRandom(0, deathQuotes.length - 1)]}"*`)
        .setAuthor(preludeQuotes[uniformRandom(0, preludeQuotes.length - 1)])
        .setColor("#530000");
}

export function handleTokens(changeToken: { sword?: number, shield?: number, sprint?: number }, changingFunction: ((p:number, type: "sword" | "shield" | "sprint") => void)) {
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

export function getGradeTag(_mI: MaterialInfo) {
    switch (_mI.grade) {
        case MaterialGrade.poor:
            return 'Poor'
        case MaterialGrade.common:
            return 'Common';
        case MaterialGrade.good:
            return '𝑮𝒐𝒐𝒅';
        case MaterialGrade.rare:
            return '𝐑𝐚𝐫𝐞';
        case MaterialGrade.very_rare:
            return '𝔙𝔢𝔯𝔶 ℜ𝔞𝔯𝔢'
        case MaterialGrade.very_very_rare:
            return '𝔙𝔢𝔯𝔶 𝔙𝔢𝔯𝔶 ℜ𝔞𝔯𝔢'
        case MaterialGrade.unique:
            return '𝔘𝔫𝔦𝔮𝔲𝔢'
        case MaterialGrade.epic:
            return '𝕰𝖕𝖎𝖈'
        case MaterialGrade.mythical:
            return '𝕸𝖞𝖙𝖍𝖎𝖈𝖆𝖑'
        case MaterialGrade.legendary:
            return '𝕃𝕖𝕘𝕖𝕟𝕕𝕒𝕣𝕪'
        case MaterialGrade.god:
            return '𝔾 𝕠 𝕕'
    }
}

/** Includes the first 23 items of the inventory. First button "refresh", last button "end" */
export function getInventorySelectOptions(_inv: Array<Item>): Array<MessageSelectOptionData> {
    return [{
        emoji: '🔄',
        label: "Refresh",
        description: "Update your inventory",
        value: "refresh"
    }].concat(_inv.map((_item, _i) => {
        return {
            emoji: itemData[_item.getItemType()]?.emoji || EMOJI_WHITEB,
            label: `${_item.getDisplayName()} (${_item.getWeight(true)})`,
            description: `$${_item.getWorth(true)}`,
            value: `${_i}`,
        };
    }).splice(0, 23)).concat([{
        emoji: EMOJI_CROSS,
        label: "Quit",
        description: "",
        value: "end",
    }]);
}
export function getItemType(_i: Item): ItemType | null {
    // log(`Get item type for: ${_i.name}`)
    const weight= _i.getWeight();
    for (const [_itemName, _data] of Object.entries(itemData)) {
        // debug("Qualifying for", _itemName);
        const itemName = _itemName as keyof typeof itemData;
        const data = _data;

        const qualification = data.qualification;

        /** weight qualification */
        const { min, max } = qualification.weightDeviation;
        if (min <= weight && max >= weight) {

            /** materials qualification */
            let passed: number = 0;
            for (const _materialInfo of qualification.materials) {
                const material: Material = _materialInfo.materialName as Material;
                const mI: MaterialInfo | null =
                    _i.getMaterialInfo(material)||
                    null;
                // debug("\t\tTesting for", {
                //     name: mI?.materialName,
                //     occupation: mI?.occupation,
                // });
                const { min, max } = _materialInfo.occupationDeviation;
                if (mI && mI.occupation >= min && mI.occupation <= max) {
                    // log("\t\tQualified!");
                    passed++;
                }
            }

            if (passed === qualification.materials.length) {
                // log("\tPassed!\n===================");
                return itemName;
            }
        }
    }
    return null;
}
export function getForgeWeaponType(_bladeWeight: number, _guardWeight: number, _shaftWeight: number) {
    let type: ForgeWeaponType | null = null;
    
    const array = Object.keys(forgeWeaponData);
    for (let i = 0; i < array.length; i++) {
        const fwn = array[i] as ForgeWeaponType;
        const data = forgeWeaponData[fwn];

        if ((data.blade[0] <= _bladeWeight && _bladeWeight <= data.blade[1]) &&
            (data.guard[0] <= _guardWeight && _guardWeight <= data.guard[1]) &&
            (data.shaft[0] <= _shaftWeight && _shaftWeight <= data.shaft[1])) {
            type = fwn;
            break;
        }
    }

    return type;
}

export function getForgeWeaponMinMax(_t: ForgeWeaponPart): {
    min: number,
    max: number,
} {
    const entries = Object.entries(forgeWeaponData);
    const min = arrayGetSmallestInArray(entries, (_e) => {
        return _e[1][_t][0];
    })
    const max = arrayGetLargestInArray(entries, (_e) => {
        return _e[1][_t][1];
    })

    return {
        min: min![1][_t][0],
        max: max![1][_t][1],
    }
}

export function getForgeWeaponAttackAbility(_fw: ForgeWeaponObject): Ability {
    return {
        type: 'melee',

        abilityName: "Attack",
        
        sword: 0,
        shield: 0,
        sprint: 0,
        readinessCost: _fw.readinessCost,
        staminaCost: 0,

        speedScale: 1,
        damageScale: 1,
        staminaScale: 1,
        
        cooldown: 0,
        UPT: 10,
        desc: null,

        targetting: {
            target: AbilityTargetting.enemy,
            AOE: 'single',
        },

        bonus: {
            damage: 0,
            accuracy: 0,
            lifesteal: 0,
            criticalHit: 0,
        }
    }
}