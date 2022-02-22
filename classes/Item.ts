import { forgeWeaponData, itemData, materialData } from "../jsons";
import { ForgeWeaponObject, ForgeWeaponPart, ForgeWeaponRange, ForgeWeaponType, ItemObject, ItemType, Material, MaterialGrade, MaterialInfo, MaterialSpawnQualityInfo, MEW, DamageRange, AttackRange } from "../typedef";
import { addHPBar, arrayGetLargestInArray, clamp, formalise, getGradeTag, getItemType, getNewObject, arrayGetRandom, uniformRandom, roundToDecimalPlace, normalRandom, getForgeWeaponType } from "./Utility";
import { debug, log } from "console"

export class Item {
    static Generate(_name: ItemType, _customName: string): Item {
        // log(`Generating ${_name}`)
        const qualifications = getNewObject(itemData[_name].qualification);
        const requiredMaterials = qualifications.materials;
        const { min, max } = qualifications.weightDeviation;
        const item = new Item(
            requiredMaterials.map((_m) => {
                return {
                    materialName: _m.materialName as Material,
                    gradeDeviation: _m.gradeDeviation,
                    occupationDeviation: _m.occupationDeviation,
                };
            }),
            uniformRandom(min + Number.EPSILON, max),
            _customName
        );
        item.fillJunk(min);

        // log(item);

        return item;
    }
    static Forge(_blade: Item, _guard: Item, _shaft: Item, _type: ForgeWeaponType): ForgeWeaponItem {
        const bladeWeight: number = _blade.getWeight();
        const guardWeight: number = _guard.getWeight();
        const shaftWeight: number = _shaft.getWeight();
        const totalWeight: number =
            bladeWeight + guardWeight + shaftWeight;
        const materials: Array<MaterialInfo> = [
            ..._blade.getAllMaterial().map(_mi =>
                getNewObject(_mi, { occupation: _mi.occupation * (bladeWeight / totalWeight) })),
            ..._guard.getAllMaterial().map(_mi =>
                getNewObject(_mi, { occupation: _mi.occupation * (guardWeight / totalWeight) })),
            ..._shaft.getAllMaterial().map(_mi =>
                getNewObject(_mi, { occupation: _mi.occupation * (shaftWeight / totalWeight) })),
        ]
        const item: Item = new Item(
            materials,
            totalWeight,
            _type
        );
        const get = (_part: ForgeWeaponPart, _require: Exclude<keyof typeof materialData.boulder, 'damageRange'>): number => {
            switch (_part) {
                case 'blade':
                    return _blade.getAllMaterial().reduce((_tt, _m) => {
                        return _tt + _m.occupation * bladeWeight * Math.pow(1.1, _m.grade) * materialData[_m.materialName][_require];
                    }, 0);
                case 'shaft':
                    return _shaft.getAllMaterial().reduce((_tt, _m) => {
                        return _tt + _m.occupation * shaftWeight * Math.pow(1.1, _m.grade) *  materialData[_m.materialName][_require];
                    }, 0);
                case 'guard':
                    return _shaft.getAllMaterial().reduce((_tt, _m) => {
                        return _tt + _m.occupation * guardWeight * Math.pow(1.1, _m.grade) *  materialData[_m.materialName][_require];
                    }, 0);
            }
        }
        const weaponData = forgeWeaponData[_type];
        const fw: ForgeWeaponObject = {
            weaponType: _type,
            attackType: weaponData.type as ForgeWeaponRange,

            range: weaponData.range,

            // (blade: x0.8, shaft: x1.5) * weaponType accScale
            accuracy: (50 + get('blade', 'accuracy') * 0.8 + get('shaft', 'accuracy') * 1.5) * weaponData.accScale,
            // (blade: x1.5, shaft: x0.8) * weaponType damageScale
            damageRange: {
                min: _blade.getAllMaterial().reduce((_tt, _m) => {
                    return _tt + _m.occupation * bladeWeight * Math.pow(1.1, _m.grade) * materialData[_m.materialName].damageRange[0];
                }, 0) * weaponData.damageScale,
                max: _blade.getAllMaterial().reduce((_tt, _m) => {
                    return _tt + _m.occupation * bladeWeight * Math.pow(1.1, _m.grade) * materialData[_m.materialName].damageRange[1];
                }, 0) * weaponData.damageScale,
            },
            // (blade: x1.2, shaft: x1.2) * weaponType criticalHitScale
            criticalHit: (0 + get('blade', 'criticalHit') * 1.2 + get('shaft', 'criticalHit') * 1.2) * weaponData.critScale,
            // blade: x1.0
            lifesteal: get('blade', 'lifesteal'),

            // speed
            // totalweight * weaponType speedscaling
            readinessCost:
                (get('blade', 'speed') + get('guard', 'speed') + get('shaft', 'speed'))*
                    forgeWeaponData[_type].spdScale,
            // weight
            // totalweight 
            staminaCost:
                totalWeight,
        };

        return new ForgeWeaponItem(fw, item.getAllMaterial(), item.getMaxWeight(), "Forged");
    }
    static Classify(_i_fwi: ItemObject | ForgeWeaponObject) {
        const wt = (_i_fwi as ForgeWeaponItem).weaponType;
        if (wt) {
            const fw = _i_fwi as ForgeWeaponObject & ItemObject;
            return new ForgeWeaponItem(
                fw,
                fw.materialInfo,
                fw.maxWeight,
                fw.name,
            )
        }
        else {
            return new Item(_i_fwi as ItemObject);
        }
    }

    private name: string;
    private itemType: ItemType = 'torch';
    private materialInfo: Array<MaterialInfo>;
    private weight: number;
    private maxWeight: number;

    constructor(_i: ItemObject);
    constructor(_elements: Array<MaterialInfo | MaterialSpawnQualityInfo>, _maxWeight: number, _name: string);
    constructor(_i_elements: ItemObject | Array<MaterialInfo | MaterialSpawnQualityInfo>, _maxWeight?: number, _name?: string) {
        const elements = _maxWeight === undefined?
            (_i_elements as ItemObject).materialInfo:
            (_i_elements as Array<MaterialInfo | MaterialSpawnQualityInfo>);
        const maxWeight = _maxWeight === undefined?
            (_i_elements as ItemObject).maxWeight:
            _maxWeight;
        const name = _name === undefined?
            (_i_elements as ItemObject).name:
            _name;

        const newElements: Array<MaterialInfo> = [];

        this.maxWeight = maxWeight;
        this.weight = 0;

        // log(`Creating new item... "${_name}". Max weight: ${_maxWeight}`)
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const name = element.materialName;
            let grade: MaterialGrade, occupation;

            // is deviation
            if ('gradeDeviation' in element) {
                const { gradeDeviation, occupationDeviation } = element;
                const randomisedGrade: MaterialGrade = Math.abs(Math.round(normalRandom(gradeDeviation.min, 1)));
                grade = clamp(randomisedGrade, gradeDeviation.min, gradeDeviation.max);
                occupation = uniformRandom(occupationDeviation.min + Number.EPSILON, occupationDeviation.max);
                // debug("Grade: Deviating", gradeDeviation);
                // debug("Grade", grade);
                // debug("Occupation: Deviating", occupationDeviation);
                // debug("Occupation", occupation);
            }
            // standard info
            else {
                grade = element.grade;
                occupation = element.occupation;
            }

            // clamp weight
            this.weight += maxWeight * occupation;
            if (this.weight > maxWeight) {
                const reducedWeight = this.weight - maxWeight;

                // log("Clamping weight...")
                // debug("\tWeight", `${this.weight} => ${_maxWeight}`);
                // debug("\tOccupation", `${occupation} => ${occupation - (reducedWeight / this.maxWeight)}`)

                this.weight = maxWeight;
                occupation -= (reducedWeight / this.maxWeight);
            }

            // group same materials / add new material
            const newMaterial: MaterialInfo =
            newElements.find(_mI => _mI.grade === grade && _mI.materialName === name)|| {
                materialName: name,
                grade: grade,
                occupation: 0,
                new: true,
            };
            if (occupation > 0) {
                newMaterial.occupation += occupation;
                // debug("New material", newMaterial);
                if (newMaterial.new === true) {
                    newElements.push(newMaterial);
                    newMaterial.new = false;
                }
            }

            // log(`\tweight: ${this.weight}`);
        }

        this.name = name;
        this.materialInfo = newElements;

        // normalise weight => get type
        this.normaliseWeight();

        const _type: ItemType = getItemType(this) || 'amalgamation';
        this.itemType = _type
    }

    print(): void {
        let realWeight = 0;
        for (let i = 0; i < this.materialInfo.length; i++) {
            const mi = this.materialInfo[i];
            const price = this.getMaterialInfoPrice(mi);
            console.log(
                `${mi.materialName}: ${mi.occupation * 100}% (${mi.grade}) ($${price})`
            );
            realWeight += this.weight * mi.occupation;
        }
        console.log(`Total price: $${this.getWorth()}`);
        console.log(`Total weight: ${this.weight} (real: ${realWeight})`); 
    }

    cleanUp(): void {
        // remove emptied materials from array
        this.materialInfo = this.materialInfo.filter(_mI => _mI.occupation > 0);

        // normalise weight
        this.normaliseWeight();

        // update item type
        this.itemType = getItemType(this) || 'amalgamation';
    }

    chip(_pos: number, _removePercentage: number): void {
        // log("chip in action... @" + `pos: ${_pos},` + ` weight: ${this.weight}`);
        const range: [number, number] = [
            Math.max(0, _pos - (_pos * _removePercentage)),
            Math.min((this.weight / this.maxWeight), _pos + (_pos * _removePercentage))
        ];
        // log("\trange: " + range);

        // burning process
        let matindex: number = 0;
        let pos: number = 0;
        while (pos <= range[1] && matindex < this.materialInfo.length) {
            const burningMaterial: MaterialInfo = this.materialInfo[matindex];
            const materialRange: [number, number] = [
                pos,
                pos + burningMaterial.occupation,
            ]
            pos += this.materialInfo[matindex].occupation;
            matindex++;

            // log(`\t@ ${burningMaterial.materialName}: ${materialRange}`);

            //     range.min [IIIIIIII] range.max
            // matr[0] [||||||||] matr[1]
            const condition1 = (range[0] >= materialRange[0] && range[0] < materialRange[1]);
            // range.min [IIIIIIII] range.max
            //      matr[0] [||||||||] matr[1]
            const condition2 = (range[1] >= materialRange[0] && range[0] < materialRange[1]);
            if (condition1 || condition2) {
                const burnRange0 = Math.max(materialRange[0], range[0]);
                const burnRange1 = Math.min(materialRange[1], range[1]);
                const burningPercentage: number = clamp(burnRange1 - burnRange0, 0, burningMaterial.occupation);
                
                burningMaterial.occupation -= burningPercentage;
                this.weight -= this.maxWeight * burningPercentage;
                // log(`\tBurning off ${burningPercentage * 100}% (${this.maxWeight * burningPercentage}${MEW}) from ${burnRange0} to ${burnRange1}\n\t\t${this.weight}${MEW}`)
            }
        }
    }

    extract(_extractPercentage: number): Item {
        const _pos = uniformRandom(_extractPercentage/2, 1 - (_extractPercentage/2));
        // debug("pos", _pos);
        const extractRange: [number, number] = [
            Math.max(0, _pos - (_extractPercentage/2)),
            Math.min((this.weight / this.maxWeight), _pos + (_extractPercentage/2))
        ];
        // log(extractRange);

        // extracting process
        const extractedMaterials: Array<MaterialInfo> = [];
        let matindex: number = 0;
        let pos: number = 0;
        while (pos <= extractRange[1] && matindex < this.materialInfo.length) {
            const material: MaterialInfo = this.materialInfo[matindex];
            const materialRange: [number, number] = [
                pos,
                pos + material.occupation,
            ]
            pos += this.materialInfo[matindex].occupation;
            matindex++;

            // debug(material.materialName, materialRange);

            const condition1 = (extractRange[0] >= materialRange[0] && extractRange[0] < materialRange[1]);
            const condition2 = (extractRange[1] >= materialRange[0] && extractRange[0] < materialRange[1]);
            if (condition1 || condition2) {
                const matExtract0 = Math.max(materialRange[0], extractRange[0]);
                const matExtract1 = Math.min(materialRange[1], extractRange[1]);
                const occupationRemove: number = clamp(matExtract1 - matExtract0, 0, material.occupation);

                // debug("removing", occupationRemove);
                material.occupation -= occupationRemove;
                this.weight -= this.maxWeight * occupationRemove;

                extractedMaterials.push({
                    materialName: material.materialName,
                    occupation: occupationRemove,
                    grade: material.grade,
                    new: true,
                });
            }
        }

        const extracted: Item = new Item(extractedMaterials, this.maxWeight, "Extracted");
        return extracted;
    }

    junkify(_percentage: number): Item {
        const percentage = clamp(_percentage, 0, 1);
        
        this.chip(uniformRandom(0, 1), percentage);
        this.fillJunk(this.maxWeight);

        this.cleanUp();

        return this;
    }
    fillJunk(_untilWeight: number) {
        while (this.weight < _untilWeight) {
            const randomMaterial: Material = arrayGetRandom(Object.keys(materialData) as (keyof typeof materialData)[])!;
            const randomGrade: MaterialGrade = clamp(Math.abs(Math.round(normalRandom(0, 1))), 0, 10);
            const randomOccupation: number = 10e-5;
            const newMaterialInfo: MaterialInfo = {
                materialName: randomMaterial,
                grade: randomGrade,
                occupation: randomOccupation,
            };

            let existing
            if (existing = this.materialInfo.find(_mI => _mI.materialName === randomMaterial && _mI.grade === randomGrade)) {
                existing.occupation += randomOccupation;
            }
            else {
                this.materialInfo.push(newMaterialInfo);
            }

            this.weight += this.maxWeight * randomOccupation;
        }

        this.normaliseWeight();
    }

    getName(): string {
        return this.name;
    }
    getDisplayName(): string {
        return `${this.name} ${formalise(itemData[this.itemType].name)}`;
    }
    getItemType(): ItemType {
        this.itemType = getItemType(this) || 'amalgamation';
        return this.itemType;
    }
    getWeight(round = false): number {
        return round?
            roundToDecimalPlace(this.weight, 2):
            this.weight;
    }
    getMaxWeight(): number {
        return this.maxWeight;
    }

    getMaterialInfoPrice(_mI: MaterialInfo): number {
        const { occupation, grade, materialName: name } = _mI;
        return this.maxWeight * occupation * materialData[name as Material].ppu * (grade * 0.5 + 1);
    }

    getMostExpensiveMaterialInfo(): MaterialInfo | null {
        return arrayGetLargestInArray(this.materialInfo, _mI => this.getMaterialInfoPrice(_mI)) || null;
    }

    getMostOccupiedMaterialInfo(): MaterialInfo | null {
        return arrayGetLargestInArray(this.materialInfo, _mI => _mI.occupation) || null;
    }

    getMaterialInfoString(_mI: MaterialInfo) {
        const gradeTag = getGradeTag(_mI);
        const foramlisedName = formalise(_mI.materialName);
        const materialPrice = this.getMaterialInfoPrice(_mI);
        const materialWeight = _mI.occupation * this.maxWeight;

        return `${foramlisedName} (${gradeTag}) $${roundToDecimalPlace(materialPrice)}\n\`${addHPBar(this.weight, materialWeight, 20)}\` [${roundToDecimalPlace(materialWeight)}${MEW}] (${roundToDecimalPlace(materialWeight / this.weight * 100)}%)`;
    }
    getMaterialInfo(_mN: Material) {
        return this.materialInfo.find(_mI => _mI.materialName === _mN);
    }
    getAllMaterial(): Array<MaterialInfo> {
        return this.materialInfo;
    }

    getWorth(round = false): number {
        let totalPrice = 0;
        for (let i = 0; i < this.materialInfo.length; i++) {
            const materialInfo = this.materialInfo[i];
            const price = this.getMaterialInfoPrice(materialInfo);
            totalPrice += price;
        }
        return round?
            roundToDecimalPlace(totalPrice, 2):
            totalPrice;
    }

    returnObject(): ItemObject | ForgeWeaponObject {
        return {
            name: this.name,
            type: this.itemType,
            materialInfo: this.materialInfo,
            weight: this.weight,
            maxWeight: this.maxWeight,
        }
    }

    normaliseWeight() {
        this.materialInfo = this.materialInfo.map(_mI => {
            return getNewObject(_mI, {
                occupation: (_mI.occupation * this.maxWeight) / this.weight
            });
        });
        this.maxWeight = this.weight;
    }
}
export class ForgeWeaponItem extends Item {
    weaponType: ForgeWeaponType
    attackType: ForgeWeaponRange
    range: AttackRange
    accuracy: number
    damageRange: DamageRange
    criticalHit: number
    lifesteal: number
    readinessCost: number
    staminaCost: number

    constructor(_fw: ForgeWeaponObject, _elements: Array<MaterialInfo | MaterialSpawnQualityInfo>, _maxWeight: number, _name: string) {
        super(_elements, _maxWeight, _name);
        this.weaponType = _fw.weaponType;
        this.attackType = _fw.attackType;
        this.range = _fw.range;
        this.accuracy = _fw.accuracy;
        this.damageRange = _fw.damageRange;
        this.criticalHit = _fw.criticalHit;
        this.lifesteal = _fw.lifesteal;
        this.readinessCost = _fw.readinessCost;
        this.staminaCost = _fw.staminaCost;
    }

    override returnObject(): ItemObject | (ForgeWeaponObject & ItemObject) {
        return {
            name: this.getName(),
            type: this.getItemType(),
            materialInfo: this.getAllMaterial(),
            weight: this.getWeight(),
            maxWeight: this.getMaxWeight(),

            weaponType: this.weaponType,
            attackType: this.attackType,
            range: this.range,
            accuracy: this.accuracy,
            damageRange: this.damageRange,
            criticalHit: this.criticalHit,
            lifesteal: this.lifesteal,
            readinessCost: this.readinessCost,
            staminaCost: this.staminaCost,
        }
    }
}