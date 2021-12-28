import { Client, Guild, GuildMember, Message, TextChannel, User } from "discord.js";

export type PriorityRound = number;
export type StringCoordinate = string;
export type OwnerID = string;

export const preludeQuotes = ["Life slips away...", "You've breathed your last...", "Misfortune comes...", "You release your grip...", "You yearn for rest...", "The cold embrace..."];
export const deathQuotes = ["Survival is a tenuous proposition in this sprawling tomb.", "More blood soaks the soil, feeding the evil therein.", "Another life wasted in the pursuit of glory and gold.", "This is no place for the weak, or the foolhardy.", "More dust, more ashes, more disappointment.", "Driven into the mud and bit the dust.", "Another pawn falls, in the grand scheme of things."];

export type ActionType = 'Attack' | 'Move'
export type Direction = 'up' | 'down' | 'left' | 'right'

export interface RGBA {
    r: number,
    g: number,
    b: number,
    alpha: number,
}

export interface Action {
    priority: number,
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
export interface DashAction extends Action {
    target: Coordinate,
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
    iconURL: string,
    portraitURL: string,
    botType: BotType,
}
export interface Stat extends Coordinate {
    base: BaseStat,

    name: string,

    index: number,

    weaponUses: number[],
    moved: boolean,

    HP: number,
    readiness: number,

    sword: number,
    shield: number,
    sprint: number,

    owner: string,
    username: string,

    team: Team,
    accolades: Accolade,
    buffs: Buffs,
    debuffs: Buffs,
    botType: BotType,
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
export interface Mapdata {
    map: Map,
    enemiesInfo: { [key in EnemyClass]: {
        min: number,
        max: number,
    } },
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
export enum UserStatus {
    idle,
    inBattle,
    choosingClass
}

export type Team = "block" | "player" | "enemy";

export enum BotType {
    naught,
    enemy,
    sentry
}

export enum WeaponTarget {
    ally,
    enemy,
}
export type WeaponAOE = "single" | "self" | "circle" | "selfCircle" | "touch" | "line"
export interface Weapon {
    Name: string,
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

export enum Class {
    Block = "Block",
    Hercules = "Hercules",
}
export enum EnemyClass {
    Barbar = "Barbar",
    Barcher = "Barcher",
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
    callback: (author: User, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => any,
}

export interface AINode extends Coordinate {
    desC: number,
    disC: number,
    totalC: number
    lastNode: AINode | null,
    nextNode: AINode | null,
}