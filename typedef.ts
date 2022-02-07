import { Client, Guild, Message, TextChannel, User } from "discord.js";
import { Battle } from "./classes/Battle";
import { Item } from "./classes/Item";
import { Room } from "./classes/Room";
import { StatusEffect } from "./classes/StatusEffect";
import { areasData, classData, dungeonData, enemiesData, itemData, materialData, interactionEventData } from "./jsons";

export type Round = number;
export type Priority = number;
export type StringCoordinate = string;
export type OwnerID = string;

export const COMMAND_CALL = ";"

// EMOJIS
export const EMOJI_TICK = '✅';
export const EMOJI_CROSS = '❎';
export const EMOJI_STAR = '🌠';
export const EMOJI_WHITEB = '⬜';
export const EMOJI_BLACKB = '⬛';
export const EMOJI_BROWNB = '🟫';
export const EMOJI_SHIELD = '🛡️';
export const EMOJI_SWORD = '🗡️';
export const EMOJI_SPRINT = '👢'
export const EMOJI_MONEYBAG = '💰';
export const MEW = 'μ';

// DUNGEON
export type RoomDirections = [Room | null, Room | null, Room | null, Room | null];
export interface DungeonData {
    name: string,

    maxLength: number,
    minLength: number,
    maxRoom: number,
    minRoom: number,
    maxBattle: number,
    minBattle: number,
    width: number,
    height: number,

    encounterMaps: MapName[],
    eliteMaps: MapName[],

    start: Coordinate,
}
export type DungeonBlockCode =
    "00" |
    "03" |
    "06" |
    "09" |
    "30" |
    "33" |
    "36" |
    "39" |
    "60" |
    "63" |
    "66" |
    "69" |
    "90" |
    "93" |
    "96" |
    "99"
export type DungeonDisplayMode =
    "pc" |
    "mobile"
export interface DungeonTreasure {
}

// RANDOM STRINGS
export const preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
export const deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];

// LINKS
export const coinURL = 'https://i.imgur.com/NK84zBg.png';
export const defaultAvatarURL = "https://cdn.discordapp.com/embed/avatars/0.png";

// BATTLES
export type Location= keyof typeof dungeonData;
export interface Spawner extends Coordinate {
    spawns: Team,
}
export type CoordStat<Type> = { [x: string]: { [y: string]: Type } }
export interface Map {
    coordStat: CoordStat<SimplePlayerStat>,
    spawners: Array<Spawner>,
    width: number,
    height: number,
    groundURL?: string,
}
export type MapName = keyof typeof areasData;
export interface MapData {
    map: Map,
    enemiesInfo: { [key in EnemyClass]: {
        min: number,
        max: number,
    } },
}

// STATISTICAL
export const StatMaximus = {
    AHP: 100,
    Dodge: 50,
    Prot: 1,
    Spd: 10,
}
export type StatPrimus = keyof typeof StatMaximus;
export interface SimplePlayerStat extends Coordinate {
    class: Class,
    team: Team,
    botType: BotType,
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
    lootInfo: Array<LootInfo>,
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

    pvp: boolean,

    drops?: Loot,
}
export interface VirtualStat extends Stat {
    virtual: true,
}

// ACTIONS
export type ActionType = 'Attack' | 'Move'
export type Direction = 'up' | 'down' | 'left' | 'right'
export enum NumericDirection {
    up,
    right,
    down,
    left,
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

// CANVAS
export interface RGBA {
    r: number,
    g: number,
    b: number,
    alpha: number,
}

// ERRORS
export interface TargetingError {
    reason: string,
    value: number | null,
}
export interface MovingError {
    reason: string,
    value: number | null,
}

// X Y
export interface Coordinate {
    x: number,
    y: number,
}
export type Vector2 = Coordinate;
export type Vector3 = Coordinate & { z: number };

// ITEMS
export type ItemType = keyof typeof itemData
export enum MaterialGrade {
    poor,
    common,
    good,
    rare,
    very_rare,
    very_very_rare,
    unique,
    epic,
    mythical,
    legendary,
    god
}
export type Material = keyof typeof materialData;
export interface MaterialSpawnQualityInfo {
    materialName: Material,
    occupationDeviation: QualityDeviation,
    gradeDeviation: QualityDeviation,
}
export interface MaterialQualityInfo {
    materialName: Material,
    occupation: number,
    grade: MaterialGrade,
    new?: boolean,
}
export interface Loot {
    money: number,
    items: Array<Item>,
    droppedBy: Stat,
}
export interface LootInfo {
    itemName: string,
    chance: number,
    materials: Array<MaterialSpawnQualityInfo>,
    weightDeviation: QualityDeviation,
}
export interface QualityDeviation {
    min: number,
    max: number,
}

export interface StartBattleOptions {
    ambush: Team | null,
}

export interface Settings {

}
export interface UserData {
    classes: Array<Class>,
    equippedClass: Class,
    money: number,
    name: string,
    party: Array<string>,
    settings: Settings,
    welfare: number,
    inventory: Array<Item>,
}

export type Team = "block" | "player" | "enemy";
export const AllTeams: Team[] = [
    'block',
    'player',
    'enemy',
]

export type Axis = "x" | "y";

export enum BotType {
    naught,
    approach_attack,
    passive_supportive
}
export interface AIFunction {
    (_s: Stat, _bd: Battle): void;
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
    desc: string | null,
}
export type UniversalWeaponName =
    "Reckless"
export type WeaponName =
    // Fighter
    "Passive: Endless Labour" |
    "Obliterate"|
    "Endure"|
    "Blind Charge"|

    // Executioner
    "Passive: Unrelenting Fury" |
    "Vicious Stab"|
    "Decimate"|

    // Diana
    "Hunt"|
    "Wild Hunt"|

    // Jupiter
    "Slay"|
    "Attack-Order" |
    "Defence-Order" |
    "Manoeuvre-Order"|

    // Victoria
    "Slice"|
    "Angelic Blessings"
export interface WeaponEffectFunction {
    (_aA: Action, _cR: ClashResult, _bd: Battle): string;
}
export interface PossibleAttackInfo {
    attacker: Stat,
    target: Stat,
    weapon: Weapon,
}

// classes
export type Class = keyof typeof classData;
export type EnemyClass = keyof typeof enemiesData;
export type GetBuffOption = 'Base' | 'WithBoth' | 'WithBuff' | 'WithDebuff';
export interface GetIconOptions {
    crop?: boolean,
    frame?: boolean,
    healthArc?: boolean,
}
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
export type Buff = keyof Buffs;
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
    "labouring"| // Fighter unique: add 33% of taken damage to value and increase healing rate
    "fury"| // Executioner unique: fury over 0.66 gives a buff to damage and crit
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
    distanceToDestination: number,
    distanceTravelled: number,
    totalCost: number
    lastNode: AINode | null,
    nextNode: AINode | null,
}

export type PathFindMethod = "lowest" | "highest";

export type InteractionEventType = keyof typeof interactionEventData;
export interface InteractionEventOptions {
    battle?: Battle
}