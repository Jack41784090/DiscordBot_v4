import { ItemType, Material, MaterialQualityInfo, MaterialSpawnQualityInfo } from "../typedef";
import materialData from "../data/materialData.json";
import itemData from "../data/itemData.json";
import { arrayGetLargestInArray, random } from "./Utility";

export class Item {
    type: ItemType = 'torch';
    materialInfo: Array<MaterialQualityInfo>;
    weight: number;
    constructor(_elements: Array<MaterialQualityInfo | MaterialSpawnQualityInfo>, _weight: number) {
        const newElements: Array<MaterialQualityInfo> = [];
        for (let i = 0; i < _elements.length; i++) {
            const element = _elements[i];
            // is deviation
            if ('gradeDeviation' in element) {
                const qualityInfo: MaterialQualityInfo = {
                    name: element.name,
                    grade: random(element.gradeDeviation.min, element.gradeDeviation.max),
                    occupation: random(element.occupationDeviation.min, element.occupationDeviation.max),
                }
                newElements.push(qualityInfo);
            }
            else {
                newElements.push(element);
            }
        }

        this.materialInfo = newElements;
        this.weight = _weight;
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
            type: this.type,
            materialInfo: this.materialInfo,
            weight: this.weight,
        };
    }
}