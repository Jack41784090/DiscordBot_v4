import { universalWeaponsData } from "../jsons";
import { Action, AIFunction, AllTeams, BotType, Coordinate, MoveAction, NumericDirection, Stat, Team, VirtualStat, Ability, AbilityAOE, AbilityTargetting, ForgeWeaponObject, AttackAction } from "../typedef";
import { Battle } from "./Battle";
import { getNewObject, checkWithinDistance, getDistance, getAttackAction, breadthFirstSearch, getCoordString, numericDirectionToDirection, translateDirectionToMagnitudeAxis, average, arrayGetRandom, getForgeWeaponAttackAbility } from "./Utility";

import { debug, log } from "console"

const AIFunctions = new Map<BotType, AIFunction>([
    [
        BotType.approach_attack,
        (_rS: Stat, _bd: Battle) => {
            log("Employing approach_attack AI")
            const virtualStat: VirtualStat = getNewObject(_rS, { virtual: true }) as VirtualStat;

            // target selection: attack closest
            const intendedTargets: Team[] = ["block"];
            if (virtualStat.team) {
                intendedTargets.push(virtualStat.team);
            }
            const selectedTarget = _bd.findEntity_closest(virtualStat, intendedTargets);

            // if found a target
            if (selectedTarget !== null) {
                // 1. select weapon
                const weaponSelected: ForgeWeaponObject =
                    virtualStat.base.arsenal[0] || universalWeaponsData.Unarmed as ForgeWeaponObject;
                const abilitySelected: Ability =
                    virtualStat.base.abilities.find(_a => _a.type === weaponSelected.attackType) || getForgeWeaponAttackAbility(weaponSelected);

                // 2. move to preferred location
                const path: Array<Coordinate> = _bd.startPathFinding(_rS, selectedTarget, "lowest");
                const moveActionArray: Array<MoveAction> = _bd.getMoveActionListFromCoordArray(_rS, path);
                const fullActions: Array<Action> = _bd.normaliseMoveActions(moveActionArray, virtualStat);

                // 3. attack with selected weapon
                const virtualAA: AttackAction = getAttackAction(virtualStat, selectedTarget, weaponSelected, abilitySelected, selectedTarget);
                if (checkWithinDistance(virtualAA, getDistance(virtualStat, selectedTarget))) {
                    const valid = _bd.executeVirtualAttack(virtualAA, virtualStat);
                    if (valid) {
                        fullActions.push(getAttackAction(_rS, selectedTarget, weaponSelected, abilitySelected, selectedTarget));
                    }
                }

                _bd.roundActionsArray.push(...fullActions);
            }
        }
    ],
    [
        BotType.passive_supportive,
        (_rS: Stat, _bd: Battle) => {
            log("Employing passive_supportive AI")
            const virtualStat = getNewObject(_rS);
            const allActions: Action[] = [];
            const weaponSelected: ForgeWeaponObject = virtualStat.base.arsenal[0] || universalWeaponsData.Unarmed as ForgeWeaponObject;
            const ability: Ability | null = arrayGetRandom(virtualStat.base.abilities.filter(_w => _w.targetting.target === AbilityTargetting.ally));
            if (ability === null) return;

            // execute ally-targetting ability
            const AOE: AbilityAOE = ability.targetting.AOE;
            switch(AOE) {
                case 'selfCircle':
                    // move to best place
                    const blastRange = ability.range?.max || weaponSelected.range.radius;
                    const movesAvailable = 1 + virtualStat.sprint; debug("movesAvailable", movesAvailable);
                    const domain = _bd.findEntities_radius(virtualStat, movesAvailable + blastRange, false);

                    let mostOccupants = 0;
                    let optimalLocation: Coordinate = { x: virtualStat.x, y: virtualStat.y };

                    const coordMap: Map<string, Coordinate> = new Map<string, Coordinate>();

                    // breadth search out to find an empty space that can hit the most allies
                    breadthFirstSearch(
                        { x: virtualStat.x, y: virtualStat.y } as Coordinate,
                        _c => {
                            const result = [];
                            for (let i = 0; i < 4; i++) {
                                // new coordinate
                                const newCoord = { x: _c.x, y: _c.y };
                                const numDir = i as NumericDirection;
                                const magAxis = translateDirectionToMagnitudeAxis(numDir);
                                newCoord[magAxis.axis] += magAxis.magnitude;

                                // save coord obj ref for exploredRoom.include in breadthSearch to function
                                const coordString = getCoordString(newCoord);
                                const coord =
                                    coordMap.get(coordString)||
                                    newCoord;
                                coordMap.set(coordString, coord);

                                // space occupied?
                                //  null: empty-space-coord;
                                result.push(_bd.CSMap.get(coordString) || !_bd.checkWithinWorld(coord) ?
                                    null:
                                    coord
                                );
                            }
                            return result;
                        },
                        (_q, _c) => {
                            // debug(`@${_c.x},${_c.y} distance`, getDistance(_c, _rS));
                            return getDistance(_c, virtualStat) < movesAvailable;
                        },
                        (_c) => {
                            const affected = _bd.findEntities_radius(_c, blastRange, false, AllTeams.filter(_t => _t !== virtualStat.team), domain);
                            // debug(`@${_c.x},${_c.y}`, affected.length)
                            if (affected.length > mostOccupants) {
                                optimalLocation = _c;
                                mostOccupants = affected.length;
                            }
                            return false;
                        }
                    );
                    debug("optimalLocation", optimalLocation);

                    const pathToBuffing = _bd.startPathFinding(virtualStat, optimalLocation, "lowest");
                    allActions.push(..._bd.normaliseMoveActions(_bd.getMoveActionListFromCoordArray(virtualStat, pathToBuffing), virtualStat));
                    break;
                case 'touch':
                    
                    break;
            }

            // run away from danger if possible
            if (!virtualStat.moved || (virtualStat.sprint > 0)) {
                const coordMap: Map<string, Coordinate> = new Map<string, Coordinate>();
                const reachableEnemiesCoordinates: Coordinate[] = breadthFirstSearch(
                    { x: virtualStat.x, y: virtualStat.y } as Coordinate,
                    _c => {
                        const result = [];
                        for (let i = 0; i < 4; i++) {
                            // new coordinate
                            const newCoord = { x: _c.x, y: _c.y };
                            const numDir = i as NumericDirection;
                            const magAxis = translateDirectionToMagnitudeAxis(numDir);
                            newCoord[magAxis.axis] += magAxis.magnitude;

                            // save coord obj ref for exploredRoom.include in breadthSearch to function
                            const coordString = getCoordString(newCoord);
                            const coord =
                                coordMap.get(coordString) ||
                                newCoord;
                            coordMap.set(coordString, coord);

                            result.push(_bd.checkWithinWorld(coord) ?
                                coord:
                                null
                            );
                        }
                        log(result)
                        return result;
                    },
                    (_q, _c) => {
                        debug(`ra: @${_c.x},${_c.y} distance`, getDistance(_c, virtualStat));
                        return getDistance(_c, virtualStat) < 3;
                    },
                    (_c) => {
                        const character: Stat | null = _bd.CSMap.get(getCoordString(_c)) || null;
                        return character !== null && character.team !== 'block' && character.team !== virtualStat.team;
                    }
                );
                if (reachableEnemiesCoordinates.length > 0) {
                    const runAwayFromCoord: Coordinate = {
                        x: average(...reachableEnemiesCoordinates.map(_c => _c.x)),
                        y: average(...reachableEnemiesCoordinates.map(_c => _c.y)),
                    };
                    debug("run away from", runAwayFromCoord);
                    const path: Array<Coordinate> = _bd.startPathFinding(virtualStat, runAwayFromCoord, "highest", average(_bd.width, _bd.height));
                    const actions: Array<MoveAction> = _bd.getMoveActionListFromCoordArray(virtualStat, path);
                    const escapingActions: Array<MoveAction> = _bd.normaliseMoveActions(actions, virtualStat);
                    allActions.push(...escapingActions);
                }
            }

            _bd.roundActionsArray.push(...allActions);
        }
    ]
]);

export class AI {
    stat: Stat;
    type: BotType;
    battleData: Battle

    constructor(_stat: Stat, _bT: BotType, _bd: Battle) {
        this.stat = _stat;
        this.type = _bT;
        this.battleData = _bd;
    }

    activate() {
        const fnc = AIFunctions.get(this.type);
        if (fnc) {
            fnc(this.stat, this.battleData);
        }
    }
}