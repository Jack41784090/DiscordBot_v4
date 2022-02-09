import { itemData, materialData } from "../jsons";
import { ItemType, Material, MaterialGrade, MaterialInfo, MaterialSpawnQualityInfo, MEW } from "../typedef";
import { addHPBar, arrayGetLargestInArray, clamp, formalise, getGradeTag, getItemType, getNewObject, arrayGetRandom, uniformRandom, roundToDecimalPlace, normalRandom, debug } from "./Utility";

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

    private name: string;
    private itemType: ItemType = 'torch';
    private materialInfo: Array<MaterialInfo>;
    private weight: number;
    private maxWeight: number;

    constructor(_i: Item);
    constructor(_elements: Array<MaterialInfo | MaterialSpawnQualityInfo>, _maxWeight: number, _name: string);
    constructor(_i_elements: Item | Array<MaterialInfo | MaterialSpawnQualityInfo>, _maxWeight?: number, _name?: string) {
        const elements = _maxWeight === undefined?
            (_i_elements as Item).materialInfo:
            (_i_elements as Array<MaterialInfo | MaterialSpawnQualityInfo>);
        const maxWeight = _maxWeight === undefined?
            (_i_elements as Item).maxWeight:
            _maxWeight;
        const name = _name === undefined?
            (_i_elements as Item).name:
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

            //     range[0] [IIIIIIII] range[1]
            // matr[0] [||||||||] matr[1]
            const condition1 = (range[0] >= materialRange[0] && range[0] < materialRange[1]);
            // range[0] [IIIIIIII] range[1]
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
            const randomMaterial: Material = arrayGetRandom(Object.keys(materialData) as (keyof typeof materialData)[]);
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

    returnObject() {
        return {
            name: this.name,
            type: this.itemType,
            materialInfo: this.materialInfo,
            weight: this.weight,
            maxWeight: this.maxWeight,
        };
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