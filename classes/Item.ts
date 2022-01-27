import { ItemType, Material, MaterialGrade, MaterialQualityInfo, MaterialSpawnQualityInfo } from "../typedef";
import materialData from "../data/materialData.json";
import itemData from "../data/itemData.json";
import { arrayGetLargestInArray, formalise, getGradeTag, getItemType, log, random, roundToDecimalPlace } from "./Utility";

export class Item {
    name: string;
    type: ItemType = 'torch';
    materialInfo: Array<MaterialQualityInfo>;
    weight: number;
    maxWeight: number;

    constructor(_elements: Array<MaterialQualityInfo | MaterialSpawnQualityInfo>, _maxWeight: number, _name: string) {
        const newElements: Array<MaterialQualityInfo> = [];

        this.maxWeight = _maxWeight;
        this.weight = 0;

        // log(`Creating new item... ${_name}`)
        let highestOccupyingMaterial: MaterialQualityInfo | null = null;
        for (let i = 0; i < _elements.length; i++) {
            const element = _elements[i];
            const name = element.materialName;
            let grade: MaterialGrade, occupation;

            // is deviation
            if ('gradeDeviation' in element) {
                const { gradeDeviation, occupationDeviation } = element;
                grade = random(gradeDeviation.min, gradeDeviation.max);
                occupation = random(occupationDeviation.min + 0.000001, occupationDeviation.max + 0.000001);
            }
            // standard info
            else {
                grade = element.grade;
                occupation = element.occupation;
            }

            // clamp weight
            this.weight += _maxWeight * occupation;
            if (this.weight > _maxWeight) {
                const diff = this.weight - _maxWeight;
                this.weight = _maxWeight;
                occupation -= diff;
            }
            // log(`\tweight: ${this.weight}`);

            // group same materials / add new material
            const existing: MaterialQualityInfo =
            newElements.find(_mI => _mI.grade === grade && _mI.materialName === name)|| {
                materialName: name,
                grade: grade,
                occupation: 0,
                new: true,
            };
            if (occupation > 0) {
                existing.occupation += occupation;
                if (existing.new === true) {
                    newElements.push(existing);
                    existing.new = false;
                }
            }

            if (highestOccupyingMaterial === null || highestOccupyingMaterial!.occupation < existing.occupation) {
                highestOccupyingMaterial = existing;
            }
        }

        this.name = _name;
        this.materialInfo = newElements;
        const _type: ItemType = getItemType(this) || 'flesh';
        this.type = _type
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

    getDisplayName(): string {
        return `${this.name} ${formalise(this.type)}`;
    }

    getWeight(round = false): number {
        return round?
            roundToDecimalPlace(this.weight, 2):
            this.weight;
    }

    getMaterialInfoPrice(_mI: MaterialQualityInfo): number {
        const { occupation, grade, materialName: name } = _mI;
        return this.weight * occupation * materialData[name as Material].ppu * (grade * 0.5 + 1);
    }

    getMostExpensiveMaterialInfo(): MaterialQualityInfo | null {
        return arrayGetLargestInArray(this.materialInfo, _mI => this.getMaterialInfoPrice(_mI)) || null;
    }

    getMostOccupiedMaterialInfo(): MaterialQualityInfo | null {
        return arrayGetLargestInArray(this.materialInfo, _mI => _mI.occupation) || null;
    }

    getMaterialInfoString(_mI: MaterialQualityInfo) {
        const gradeTag = getGradeTag(_mI);
        const foramlisedName = formalise(_mI.materialName);
        const materialPrice = roundToDecimalPlace(this.getMaterialInfoPrice(_mI));
        const materialWeight = roundToDecimalPlace(_mI.occupation * this.weight);

        return `${foramlisedName} (${gradeTag}) $${materialPrice} (${materialWeight}μ)`;
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
            type: this.type,
            materialInfo: this.materialInfo,
            weight: this.weight,
            maxWeight: this.maxWeight,
        };
    }
}