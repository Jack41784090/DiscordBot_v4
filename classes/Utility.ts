import { Canvas, Image, NodeCanvasRenderingContext2D } from "canvas";
import { BaseMessageComponent, Interaction, Message, MessageActionRowOptions, MessageActionRow, MessageAttachment, MessageEmbed, MessageOptions, MessageSelectMenu, TextChannel, InteractionCollector, ChannelLogsQueryOptions } from "discord.js";
import { Type } from "typescript";
import { getFileBufferImage, getIcon } from "./Database";
import classData from "../data/classData.json"

import * as fs from "fs";
import { BotClient } from "..";
import { MinHeap } from "./MinHeap";
import { DashAction, Class, SimpleStat, StringCoordinate, Accolade, Buffs, deathQuotes, CoordStat, preludeQuotes, Action, ActionType, AINode, AttackAction, BaseStat, BotType, ClashResult, ClashResultFate, Coordinate, Direction, EnemyClass, Mapdata, MenuOption, MoveAction, PriorityRound, Stat, TargetingError, Team, Weapon, WeaponAOE, WeaponTarget, Vector2, RGBA } from "../typedef";
import { Battle } from "./Battle";

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
    if (sections[0][0] + sections[0][1] === '//') {
        sections[0] = sections[0].substring(2);
    }
    return sections;
}
export function capitalize(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
export function formalize(string: string): string {
    return capitalize(string.toLowerCase());
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
export function average(...nums: Array<number>) {
    let total = 0;
    for (let i = 0; i < nums.length; i++) {
        const n = nums[i];
        total += n;
    }
    return total / nums.length;
}

// get battle stats
export function getAHP(entity: Stat, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
    const AHP = entity.base.AHP;
    const AHPBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.AHP : 0;
    const AHPDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.AHP : 0;
    return (AHP + AHPBuff - AHPDebuff) || 0;
}
export function getDamage(entity: Stat, weapon: Weapon, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): [number, number] {
    const damageRange = weapon.Damage;
    const damageBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Damage : 0;
    const damageDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Damage : 0;
    return [damageRange[0] + damageBuff - damageDebuff, damageRange[1] + damageBuff - damageDebuff]
}
export function getAcc(entity: Stat, weapon: Weapon, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
    const acc = weapon.Acc;
    const accBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Acc : 0;
    const accDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Acc : 0;
    return (acc + accBuff - accDebuff) || 0;
}
export function getDodge(entity: Stat, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
    const dodge = entity.base.Dodge;
    const dodgeBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Dodge : 0;
    const dodgeDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Dodge : 0;
    return (dodge + dodgeBuff - dodgeDebuff) || 0;
}
export function getSpd(entity: Stat, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
    const spd = entity.base.Spd;
    const spdBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Spd : 0;
    const spdDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Spd : 0;
    return (spd + spdBuff - spdDebuff) || 0;
}
export function getCrit(entity: Stat, weapon: Weapon, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
    const crit = weapon.Crit;
    const critBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.Crit : 0;
    const critDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.Crit : 0;
    return (crit + critBuff - critDebuff) || 0;
}
export function getLifesteal(entity: Stat, weapon: Weapon, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
    const ls = weapon.lifesteal;
    const lsBuff = (options === 'WithBuff' || options === 'WithBoth') ? entity.buffs.lifesteal : 0;
    const lsDebuff = (options === 'WithDebuff' || options === 'WithBoth') ? entity.debuffs.lifesteal : 0;
    return (ls + lsBuff - lsDebuff) || 0;
}
export function getProt(entity: Stat, options: 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff' = 'WithBoth'): number {
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

export function flatten(array: Array<Type>) {
    let flat: Type[] = [];

    for (let i = 0; i < array.length; i++) {
        const el = array[i];
        if (Array.isArray(el)) {
            flat = flat.concat(flatten(el));
        }
        else {
            flat.push(el);
        }
    }

    return flat;
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

export function getLargestInArray<Type>(array: Type[]) {
    return array.reduce((la, c) => {
        return la < c ?
            c :
            la;
    }, array[0]);
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

export function roundToDecimalPlace(number: number, decimalPlace: number = 1) {
    decimalPlace = Math.round(decimalPlace);
    const decimal = Math.pow(10, decimalPlace);
    return Math.round((number + Number.EPSILON) * decimal) / decimal;
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

export function returnGridCanvas(height: number = 9, width: number = 9, size: number = 500, groundImage?: Image): Canvas {
    const canvas = new Canvas(width * size, height * size);
    const ctx = canvas.getContext('2d');

    if (groundImage) {
        ctx.drawImage(groundImage, 0, 0, width * size, height * size);
    }
    else {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width * size, height * size);
    }
    
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    for (let i = 1; i < height; i++) {
        ctx.moveTo(0, i * size);
        ctx.lineTo(width * size, i * size);
    }
    for (let i = 1; i < width; i++) {
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, height * size);
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

// export async function DrawTest() {
//     const size = 50;
//     const canvas = returnGridCanvas(9, 9, size);
//     const ctx = canvas.getContext('2d');
//     const stat: Stat = {
//         base: {
//             name: 'test',
//             class: Class.Hercules,
//             AHP: 0,
//             Dodge: 0,
//             Prot: 0,
//             Spd: 0,
//             botType: 0,
//             weapons: [],
//             iconURL: 'https://cdn.discordapp.com/attachments/832702942883872800/877772107298267136/image0.jpg',
//         },
//         index: 0,

//         weaponUses: [],

//         HP: 10,
//         readiness: 50,
//         x: 0,
//         y: 0,

//         owner: '49182350',
//         username: 'w',

//         team: Team.player,
//         accolades: {
//             kill: 0,
//             damageDealt: 0,
//             healingDone: 0,
//             absorbed: 0,
//             damageTaken: 0,
//             dodged: 0,
//             critNo: 0,
//             clashNo: 0,
//             rollAverage: 0,
//             rollNo: 0,
//         },
//         buffs: {
//             AHP: 0,
//             Damage: 0,
//             Acc: 0,
//             Dodge: 0,
//             Crit: 0,
//             Prot: 0,
//             Spd: 0,
//             lifesteal: 0,
//         },
//         debuffs: {
//             AHP: 0,
//             Damage: 0,
//             Acc: 0,
//             Dodge: 0,
//             Crit: 0,
//             Prot: 0,
//             Spd: 0,
//             lifesteal: 0,
//         },
//         botType: BotType.naught,
//     };
//     const X = stat.x;
//     const Y = stat.y;

//     log("Getting file...")
//     const icon = await getFileBufferImage("./maps/battle-262871357455466496.txt");
    
//     if (icon) {
//         log("Drawing file...");
//         ctx.drawImage(icon, 0, 0, canvas.width, canvas.height);
//     }
//     log("Drawing lines...");
//     ctx.beginPath();
//     ctx.strokeStyle = "black";
//     ctx.moveTo(0, 0);
//     ctx.lineTo(125, 125);
//     ctx.stroke();


//     log("Sending file...")
//     const channel = await BotClient.channels.fetch("882231564715560991").then(c => c as TextChannel);
//     const embed = new MessageEmbed()
//         .setImage("attachment://image.png");
//     const message = await channel.send({ embeds: [embed], files: [{ attachment: canvas.toBuffer(), name: "image.png" }] });
//     log("Complete!")

//     console.log(message.embeds[0].image);
// }

export function getMoveAction(stat: Stat, action: string, priority: number, moveMagnitude: number): MoveAction | null;
export function getMoveAction(stat: Stat, magnitude: number, priority: number, axis: "x" | "y"): MoveAction | null;
export function getMoveAction(stat: Stat, args2: string | number, priority: number, args4: number | "x" | "y"): MoveAction | null {
    const movetype: ActionType = "Move";
    const moveAction: MoveAction = {
        executed: false,

        type: movetype,
        from: stat,
        affected: stat,
        readiness: 0,

        sword: 0,
        shield: 0,
        sprint: Number(stat.moved),

        priority: priority,

        axis: 'x',
        magnitude: 0,
    };
    const args2_isAction = typeof args2 === 'string';    // args2: string, args4: number
    const args2_isMagnitude = typeof args2 === 'number'; // args2: number, args4: "x" | "y"
    if (args2_isAction) {
        const action: string = args2 as string;
        const moveMagnitude: number = args4 as number;
        let axis: "x" | "y", magnitude: number;
        switch (action) {
            // move vertically
            case "up":
            case "v":
                magnitude = moveMagnitude;
                axis = 'y';
                break;
            case "down":
                magnitude = -1 * moveMagnitude;
                axis = 'y';
                break;
            // move horizontally
            case "right":
            case "h":
            case "r":
                magnitude = moveMagnitude;
                axis = 'x';
                break;
            case "left":
            case "l":
                magnitude = -1 * moveMagnitude;
                axis = 'x';
                break;
            default:
                return null;
        }
        moveAction.axis = axis;
        moveAction.magnitude = magnitude;
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

export function getAttackAction(attacker: Stat, victim: Stat, weapon: Weapon, coords: Coordinate, priority: number): AttackAction {
    const actionType: ActionType = "Attack";
    const attackAction: AttackAction = {
        executed: false,

        type: actionType,
        from: attacker,
        affected: victim,
        readiness: weapon.Readiness,

        sword: weapon.sword,
        shield: weapon.shield,
        sprint: weapon.sprint,

        priority: priority,

        weapon: weapon,
        coordinate: coords
    };
    return attackAction;
}

export function getDashAction(stat: Stat, _target: Coordinate, priority: number, sprint: number): DashAction {
    const movetype: ActionType = "Dash";
    const magnitude: number = getDistance(stat, _target);
    return {
        executed: false,

        type: movetype,
        from: stat,
        affected: stat,
        readiness: Battle.MOVE_READINESS * Math.abs(magnitude),

        sword: 0,
        shield: 0,
        sprint: sprint,

        priority: priority,

        target: _target,
    };
}

export async function Test() {
    const CSMap = getMapFromCS({
        "0": {
            "7": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 0,
                "y": 7
            },
            "8": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 0,
                "y": 8
            }
        },
        "1": {
            "7": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 1,
                "y": 7
            },
            "8": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 1,
                "y": 8
            }
        },
        "2": {},
        "3": {},
        "4": {},
        "5": {
            "8": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 5,
                "y": 8
            },
            "9": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 5,
                "y": 9
            },
            "10": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 5,
                "y": 10
            }
        },
        "6": {
            "8": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 6,
                "y": 8
            },
            "9": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 6,
                "y": 9
            },
            "10": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 6,
                "y": 10
            }
        },
        "7": {
            "9": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 7,
                "y": 9
            },
            "10": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 7,
                "y": 10
            }
        },
        "8": {
            "9": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 8,
                "y": 9
            },
            "10": {
                "class": Class.Block,
                "team": "block",
                "botType": 1,
                "x": 8,
                "y": 10
            }
        }
    });
    const AINodeMap = new Map<string, AINode>();
    const nodePriorQueue = new MinHeap<AINode>(n => n?.totalC || null);
    for (let x = 0; x < 11; x++) {
        for (let y = 0; y < 11; y++) {
            const coordString = getCoordString({ x: x, y: y });
            if (!CSMap.has(coordString)) {
                const node = getNewNode(x, y, { x: 3, y: 2 }, Number.POSITIVE_INFINITY);
                AINodeMap.set(coordString, node);
                nodePriorQueue.insert(node);
            }
        }
    }

    const results = [];
    let AINode = nodePriorQueue.remove();
    const ax = [1, -1, 0, 0];
    const ay = [0, 0, 1, -1];
    while (AINode) {
        for (let i = 0; i < 4; i++) {
            const coordString = getCoordString({ x: AINode.x + ax[i], y: AINode.y + ay[i] });
            if (AINodeMap.has(coordString)) {
                const node = AINodeMap.get(coordString)!;
                if (node.totalC > AINode.disC + 1 + node.desC) {
                    node.disC = AINode.disC + 1;
                    node.totalC = node.desC + node.disC;
                    node.lastNode = AINode;
                    AINode.nextNode = node;
                }
            }
        }
        results.push(AINode);
        AINode = nodePriorQueue.remove();
    }

    nodePriorQueue.print();
}

export function setUpInteractionCollect(msg: Message, cb: (itr: Interaction) => void, collectCount = 1) {
    const interCollectr = new InteractionCollector(BotClient, { message: msg, max: collectCount });
    interCollectr.on('collect', cb);
    return interCollectr;
}

export function getSelectMenuActionRow(options: { label: string, value: string }[], id: string = 'customId', min: number = 1, max: number = 1) {
    const menu = new MessageSelectMenu({
        customId: id,
        minValues: min,
        maxValues: max,
        options: options,
    });
    const messageActionRow = new MessageActionRow({ components: [menu] });
    return messageActionRow;
}

export async function clearChannel(channel: TextChannel, afterMessage: Message) {
    const options: ChannelLogsQueryOptions = {
        after: afterMessage.id
    };
    await channel.messages.fetch(options)
        .then((messages) => {
            for (const [id, m] of messages) m.delete().catch(() => {
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
// export function getDeepCopyObject<Type extends Object>(obj: Type) {
//     const result: Type = Object.assign({}, obj);
//     if (typeof obj === 'object') {
//         for (const [key, value] of Object.entries(obj)) {
//             if (typeof value === 'object' && !Array.isArray(value) && value) {
//                 const maximumCallExceeded = Object.assign({ ...getDeepCopyObject(value) });
//                 result[key] = maximumCallExceeded;
//             }
//             else {
//                 result[key] = value;
//             }
//         }
//     }
//     return result;
// }

export function getLastElement<Type>(array: Array<Type>): Type {
    if (array.length < 1) return array[0];
    return array[array.length - 1];
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

export function getMapFromCS(coordStat: CoordStat<SimpleStat>): Map<StringCoordinate, Stat> {
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
    map.forEach((v, k) => {
        const {x, y} = { x: k.split(',')[0], y: k.split(',')[1] };
        if (CSreturn[x] === undefined) CSreturn[x] = {};
        CSreturn[x][y] = v;
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

export function getBaseStat(className: Class) {
    return classData[className] as BaseStat;
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
export function getStat(ss: SimpleStat, _owner?: string): Stat;
export function getStat(bss: SimpleStat | BaseStat, _owner: string = ''): Stat {
    const classBSS: (Class | EnemyClass) = bss.class;
    const base: BaseStat = 'team' in bss ?
        getNewObject(classData[bss.class], bss) as BaseStat:
        bss as BaseStat;
    const ss = bss as SimpleStat;

    const endStat: Stat = {
        base: base,
        index: -1,

        name: `${bss.class}`,

        weaponUses: [],

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
        botType: ss.botType || (_owner ? BotType.naught : BotType.enemy),
        accolades: getEmptyAccolade(),
        buffs: getEmptyBuff(),
        debuffs: getEmptyBuff(),

        x: ss.x,
        y: ss.y,
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
    // if action is a free movement action
    if (moveAction.magnitude !== undefined && moveAction.sprint === 0) {
        stat.moved = false;
    }
}

export function HandleTokens(changeToken: { sword?: number, shield?: number, sprint?: number }, changingFunction: ((p:number, type: "sword" | "shield" | "sprint") => void)) {
    if (changeToken.sword !== undefined) changingFunction(changeToken.sword, "sword");
    if (changeToken.shield !== undefined) changingFunction(changeToken.shield, "shield");
    if (changeToken.sprint !== undefined) changingFunction(changeToken.sprint, "sprint");
}

export function getNewNode(_x: number, _y: number, _destination: Coordinate, _distanceTravelled: number = 0): AINode {
    const desC = Math.abs(_x - _destination.x) + Math.abs(_y - _destination.y);
    const totalC = _distanceTravelled + desC;
    const object = {
        x: _x,
        y: _y,
        lastNode: null,
        nextNode: null,
        disC: _distanceTravelled,
        desC: desC,
        totalC: totalC,
    };
    return object;
}