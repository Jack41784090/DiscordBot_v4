import { ItemType, Material, MaterialGrade, MaterialQualityInfo, MaterialSpawnQualityInfo } from "../typedef";
import materialData from "../data/materialData.json";
import itemData from "../data/itemData.json";
import { arrayGetLargestInArray, random } from "./Utility";

export class Item {
    name: string;
    type: ItemType = 'torch';
    materialInfo: Array<MaterialQualityInfo>;
    weight: number;
    constructor(_elements: Array<MaterialQualityInfo | MaterialSpawnQualityInfo>, _maxWeight: number, _name: string) {
        const newElements: Array<MaterialQualityInfo> = [];

        this.weight = 0;        
        for (let i = 0; i < _elements.length; i++) {
            const element = _elements[i];
            const name = element.name;
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

            this.weight += _maxWeight * occupation;
            if (this.weight > _maxWeight) {
                const diff = this.weight - _maxWeight;
                this.weight = _maxWeight;
                occupation -= diff;
            }

            const existing = newElements.find(_mI => _mI.grade === grade && _mI.name === name);
            if (existing) {
                existing.occupation += occupation;
            }
            else if (occupation > 0) {
                newElements.push({
                    name: name,
                    grade: grade,
                    occupation: occupation,
                });
            }
        }

        this.name = _name;
        this.materialInfo = newElements;
    }

    print(): void {
        let realWeight = 0;
        for (let i = 0; i < this.materialInfo.length; i++) {
            const mi = this.materialInfo[i];
            const price = this.getMaterialInfoPrice(mi);
            console.log(
                `${mi.name}: ${mi.occupation * 100}% (${mi.grade}) ($${price})`
            );
            realWeight += this.weight * mi.occupation;
        }
        console.log(`Total price: $${this.getWorth()}`);
        console.log(`Total weight: ${this.weight} (real: ${realWeight})`); 
    }

    getMaterialInfoPrice(_mI: MaterialQualityInfo): number {
        const { occupation, grade, name } = _mI;
        return this.weight * occupation * materialData[name as Material].ppu * (grade * 0.5 + 1);
    }

    getMostExpensiveMaterialInfo(): MaterialQualityInfo | null {
        return arrayGetLargestInArray(this.materialInfo, _mI => this.getMaterialInfoPrice(_mI)) || null;
    }

    getMostOccupiedMaterialInfo(): MaterialQualityInfo | null {
        return arrayGetLargestInArray(this.materialInfo, _mI => _mI.occupation) || null;
    }

    getWorth(): number {
        let totalPrice = 0;
        for (let i = 0; i < this.materialInfo.length; i++) {
            const materialInfo = this.materialInfo[i];
            const price = this.getMaterialInfoPrice(materialInfo);
            totalPrice += price;
        }
        return totalPrice;
    }

    returnObject() {
        return {
            name: this.name,
            type: this.type,
            materialInfo: this.materialInfo,
            weight: this.weight,
        };
    }
}