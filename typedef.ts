import { Client, Guild, GuildMember, Message, TextChannel, User } from "discord.js";
import { Battle } from "./classes/Battle";
import { Room } from "./classes/Room";
import { StatusEffect } from "./classes/StatusEffect";

export type Round = number;
export type Priority = number;
export type StringCoordinate = string;
export type OwnerID = string;

export const COMMAND_CALL = ";"
export const EMOJI_TICK = '✅';
export const EMOJI_CROSS = '❎';

export type RoomDirections = [Room | null, Room | null, Room | null, Room | null];

export const preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
export const deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];

export type Location=
    "farmstead"

export type ActionType = 'Attack' | 'Move'
export type Direction = 'up' | 'down' | 'left' | 'right'
export enum NumericDirection {
    up,
    right,
    down,
    left,
}

export interface RGBA {
    r: number,
    g: number,
    b: number,
    alpha: number,
}

export interface Action {
    round: Round,
    priority: Priority,
    from: Stat,
    affected: Stat,
    readiness: number,
    type: ActionType
    executed: boolean,

    sword: number,
    shield: number,
    sprint: number,
}
export interface AttackAction extends Action {
    weapon: Weapon,
    coordinate: Coordinate,
}
export interface MoveAction extends Action {
    axis: 'x' | 'y',
    magnitude: number,
}

export interface TargetingError {
    reason: string,
    value: number | null,
}
export interface MovingError {
    reason: string,
    value: number | null,
}

export interface MenuOption {
    label: string,
    value: string,
}

export interface Coordinate {
    x: number,
    y: number,
}
export type Vector2 = Coordinate;
export type Vector3 = Coordinate & { z: number };
export interface SimpleStat extends Coordinate {
    class: Class
    team: Team
    botType: BotType
}
export interface BaseStat {
    class: Class | EnemyClass,
    AHP: number,
    Dodge: number,
    Prot: number,
    Spd: number,
    maxMove: number,
    weapons: Array<Weapon>,
    autoWeapons: Array<Weapon>,
    iconURL: string,
    botType: BotType,
}
export interface Stat extends Coordinate {
    base: BaseStat,

    name: string,

    index: number,

    weaponUses: number[],
    actionsAssociatedStrings: { [key: number]: string[] },
    statusEffects: StatusEffect[],
    moved: boolean,

    HP: number,
    readiness: number,

    sword: number,
    shield: number,
    sprint: number,

    owner: string,
    username: string,

    team: Team | null,
    accolades: Accolade,
    buffs: Buffs,
    debuffs: Buffs,
    botType: BotType,

    pvp: boolean
}

export interface Spawner extends Coordinate {
    spawns: Team,
}
export type CoordStat<Type> = { [x: string]: { [y: string]: Type } }
export interface Map {
    coordStat: CoordStat<SimpleStat>,
    spawners: Array<Spawner>,
    width: number,
    height: number,
    groundURL: string,
}
export interface MapData {
    map: Map,
    enemiesInfo: { [key in EnemyClass]: {
        min: number,
        max: number,
    } },
}
export interface DungeonData {
    maxLength: number,
    minLength: number,
    maxRoom: number,
    minRoom: number,
    maxBattle: number,
    minBattle: number,
    width: number,
    height: number,

    start: Coordinate,
}
export interface Treasure {
    
}

export interface Settings {

}
export interface UserData {
    classes: Array<Class>,
    equippedClass: Class,
    money: number,
    name: string,
    party: Array<string>,
    settings: Object,
    status: UserStatus
}
export type UserStatus = "idle" | "busy"; 

export type Team = "block" | "player" | "enemy";

export type Axis = "x" | "y";

export enum BotType {
    naught,
    enemy,
    sentry
}

// weapons
export enum WeaponTarget {
    ally,
    enemy,
}
export type WeaponAOE = "single" | "self" | "circle" | "selfCircle" | "touch" | "line"
export interface Weapon {
    Name: WeaponName,
    Acc: number,
    Damage: Array<number>,
    Spd: number,
    Range: Array<number>,
    Readiness: number,
    sword: number,
    shield: number,
    sprint: number,
    Crit: number,
    lifesteal: number,
    targetting: {
        target: WeaponTarget,
        AOE: WeaponAOE
    },
    CD: number,
    UPT: number,
}
export type WeaponName =
    // universal
    "Reckless"|

    // Hercules
    "Obliterate"|
    "Endure"|
    "Endless Labour"|

    // Mars
    "Vicious Stab"|
    "Decimate"|
    "Unrelenting Fury"
export interface WeaponEffectFunction {
    (_aA: Action, _cR: ClashResult, _bd: Battle): string;
}

// classes
export type Class = "Block" | "Hercules";
export type EnemyClass = "Barbar" | "Barcher";
export type GetBuffOption = 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff';
export interface Buffs {
    AHP: number,
    Damage: number,
    Acc: number,
    Dodge: number,
    Crit: number,
    Prot: number,
    Spd: number,
    lifesteal: number,
}
export type Buff = "AHP" | "Damage" | "Acc" | "Dodge" | "Crit" | "Prot" | "Spd" | "lifesteal";
export interface Accolade {
    kill: number,
    damageDealt: number,
    healingDone: number,
    absorbed: number,
    damageTaken: number,
    dodged: number,
    critNo: number,
    clashNo: number,
    rollAverage: number,
    rollNo: number,
}
export type StatusEffectType =
    "bleed"| // tick damage
    "protected"| // extra health (shield)
    "labouring"| // Hercules unique: add 33% of taken damage to value and increase healing rate
    "fury"| // Mars unique: fury over 0.66 gives a buff to damage and crit
    "DamageUp"| // damage buff
    "lifestealUp"
export interface StatusEffectFunction {
    (_statusEffect: StatusEffect, _action: Action, _bd: Battle): string;
}

export type ClashResultFate = "Miss" | "Hit" | "Crit"

export interface ClashResult {
    damage: number,
    u_damage: number,
    fate: ClashResultFate,
    roll: number,
}

export interface CommandModule {
    commands: string[],
    expectedArgs: string,
    minArgs: number,
    maxArgs: number,
    callback: (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => any,
}

export interface AINode extends Coordinate {
    desC: number,
    disC: number,
    totalC: number
    lastNode: AINode | null,
    nextNode: AINode | null,
}