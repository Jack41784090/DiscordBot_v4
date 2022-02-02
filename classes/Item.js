"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var jsons_1 = require("../jsons");
var typedef_1 = require("../typedef");
var Utility_1 = require("./Utility");
var Item = /** @class */ (function () {
    function Item(_elements, _maxWeight, _name) {
        this.type = 'torch';
        var newElements = [];
        this.maxWeight = _maxWeight;
        this.weight = 0;
        var _loop_1 = function (i) {
            var element = _elements[i];
            var name_1 = element.materialName;
            var grade, occupation = void 0;
            // is deviation
            if ('gradeDeviation' in element) {
                var gradeDeviation = element.gradeDeviation, occupationDeviation = element.occupationDeviation;
                var randomisedGrade = Math.abs(Math.round((0, Utility_1.normalRandom)(gradeDeviation.min, 1)));
                grade = (0, Utility_1.clamp)(randomisedGrade, gradeDeviation.min, gradeDeviation.max);
                occupation = (0, Utility_1.uniformRandom)(occupationDeviation.min + 0.000001, occupationDeviation.max + 0.000001);
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
            this_1.weight += _maxWeight * occupation;
            if (this_1.weight > _maxWeight) {
                var reducedWeight = this_1.weight - _maxWeight;
                // log("Clamping weight...")
                // debug("\tWeight", `${this.weight} => ${_maxWeight}`);
                // debug("\tOccupation", `${occupation} => ${occupation - (reducedWeight / this.maxWeight)}`)
                this_1.weight = _maxWeight;
                occupation -= (reducedWeight / this_1.maxWeight);
            }
            // group same materials / add new material
            var newMaterial = newElements.find(function (_mI) { return _mI.grade === grade && _mI.materialName === name_1; }) || {
                materialName: name_1,
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
        };
        var this_1 = this;
        // log(`Creating new item... "${_name}". Max weight: ${_maxWeight}`)
        for (var i = 0; i < _elements.length; i++) {
            _loop_1(i);
        }
        this.name = _name;
        this.materialInfo = newElements;
        // normalise weight => get type
        this.normaliseWeight();
        var _type = (0, Utility_1.getItemType)(this) || 'amalgamation';
        this.type = _type;
    }
    Item.Generate = function (_name, _customName) {
        // log(`Generating ${_name}`)
        var qualifications = (0, Utility_1.getNewObject)(jsons_1.itemData[_name].qualification);
        var requiredMaterials = qualifications.materials;
        var _a = qualifications.weightDeviation, min = _a.min, max = _a.max;
        var item = new Item(requiredMaterials.map(function (_m) {
            return {
                materialName: _m.materialName,
                gradeDeviation: _m.gradeDeviation,
                occupationDeviation: _m.occupationDeviation,
            };
        }), (0, Utility_1.uniformRandom)(min + 0.0000000001, max), _customName);
        item.fillJunk(min);
        // log(item);
        return item;
    };
    Item.prototype.print = function () {
        var realWeight = 0;
        for (var i = 0; i < this.materialInfo.length; i++) {
            var mi = this.materialInfo[i];
            var price = this.getMaterialInfoPrice(mi);
            console.log(mi.materialName + ": " + mi.occupation * 100 + "% (" + mi.grade + ") ($" + price + ")");
            realWeight += this.weight * mi.occupation;
        }
        console.log("Total price: $" + this.getWorth());
        console.log("Total weight: " + this.weight + " (real: " + realWeight + ")");
    };
    Item.prototype.cleanUp = function () {
        // remove emptied materials from array
        this.materialInfo = this.materialInfo.filter(function (_mI) { return _mI.occupation > 0; });
        // normalise weight
        this.normaliseWeight();
        // update item type
        this.type = (0, Utility_1.getItemType)(this) || 'amalgamation';
    };
    Item.prototype.chip = function (_pos, _removePercentage) {
        // log("chip in action... @" + `pos: ${_pos},` + ` weight: ${this.weight}`);
        var range = [
            Math.max(0, _pos - (_pos * _removePercentage)),
            Math.min((this.weight / this.maxWeight), _pos + (_pos * _removePercentage))
        ];
        // log("\trange: " + range);
        // burning process
        var matindex = 0;
        var pos = 0;
        while (pos <= range[1] && matindex < this.materialInfo.length) {
            var burningMaterial = this.materialInfo[matindex];
            var materialRange = [
                pos,
                pos + burningMaterial.occupation,
            ];
            pos += this.materialInfo[matindex].occupation;
            matindex++;
            // log(`\t@ ${burningMaterial.materialName}: ${materialRange}`);
            //     range[0] [IIIIIIII] range[1]
            // matr[0] [||||||||] matr[1]
            var condition1 = (range[0] >= materialRange[0] && range[0] < materialRange[1]);
            // range[0] [IIIIIIII] range[1]
            //      matr[0] [||||||||] matr[1]
            var condition2 = (range[1] >= materialRange[0] && range[0] < materialRange[1]);
            if (condition1 || condition2) {
                var burnRange0 = Math.max(materialRange[0], range[0]);
                var burnRange1 = Math.min(materialRange[1], range[1]);
                var burningPercentage = (0, Utility_1.clamp)(burnRange1 - burnRange0, 0, burningMaterial.occupation);
                burningMaterial.occupation -= burningPercentage;
                this.weight -= this.maxWeight * burningPercentage;
                // log(`\tBurning off ${burningPercentage * 100}% (${this.maxWeight * burningPercentage}${MEW}) from ${burnRange0} to ${burnRange1}\n\t\t${this.weight}${MEW}`)
            }
        }
    };
    Item.prototype.extract = function (_extractPercentage) {
        var _pos = (0, Utility_1.uniformRandom)(_extractPercentage / 2, 1 - (_extractPercentage / 2));
        // debug("pos", _pos);
        var extractRange = [
            Math.max(0, _pos - (_extractPercentage / 2)),
            Math.min((this.weight / this.maxWeight), _pos + (_extractPercentage / 2))
        ];
        // log(extractRange);
        // extracting process
        var extractedMaterials = [];
        var matindex = 0;
        var pos = 0;
        while (pos <= extractRange[1] && matindex < this.materialInfo.length) {
            var material = this.materialInfo[matindex];
            var materialRange = [
                pos,
                pos + material.occupation,
            ];
            pos += this.materialInfo[matindex].occupation;
            matindex++;
            // debug(material.materialName, materialRange);
            var condition1 = (extractRange[0] >= materialRange[0] && extractRange[0] < materialRange[1]);
            var condition2 = (extractRange[1] >= materialRange[0] && extractRange[0] < materialRange[1]);
            if (condition1 || condition2) {
                var matExtract0 = Math.max(materialRange[0], extractRange[0]);
                var matExtract1 = Math.min(materialRange[1], extractRange[1]);
                var occupationRemove = (0, Utility_1.clamp)(matExtract1 - matExtract0, 0, material.occupation);
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
        var extracted = new Item(extractedMaterials, this.maxWeight, "Extracted");
        return extracted;
    };
    Item.prototype.junkify = function (_percentage) {
        var percentage = (0, Utility_1.clamp)(_percentage, 0, 1);
        this.chip((0, Utility_1.uniformRandom)(0, 1), percentage);
        this.fillJunk(this.maxWeight);
        this.cleanUp();
        return this;
    };
    Item.prototype.fillJunk = function (_untilWeight) {
        var _loop_2 = function () {
            var randomMaterial = (0, Utility_1.arrayGetRandom)(Object.keys(jsons_1.materialData));
            var randomGrade = (0, Utility_1.clamp)(Math.abs(Math.round((0, Utility_1.normalRandom)(0, 1))), 0, 10);
            var randomOccupation = (0, Utility_1.uniformRandom)(0, 0.0005);
            var newMaterialInfo = {
                materialName: randomMaterial,
                grade: randomGrade,
                occupation: randomOccupation,
            };
            var existing = void 0;
            if (existing = this_2.materialInfo.find(function (_mI) { return _mI.materialName === randomMaterial && _mI.grade === randomGrade; })) {
                existing.occupation += randomOccupation;
            }
            else {
                this_2.materialInfo.push(newMaterialInfo);
            }
            this_2.weight += this_2.maxWeight * randomOccupation;
        };
        var this_2 = this;
        while (this.weight < _untilWeight) {
            _loop_2();
        }
        this.normaliseWeight();
    };
    Item.prototype.getDisplayName = function () {
        return this.name + " " + (0, Utility_1.formalise)(jsons_1.itemData[this.type].name);
    };
    Item.prototype.getWeight = function (round) {
        if (round === void 0) { round = false; }
        return round ?
            (0, Utility_1.roundToDecimalPlace)(this.weight, 2) :
            this.weight;
    };
    Item.prototype.getMaterialInfoPrice = function (_mI) {
        var occupation = _mI.occupation, grade = _mI.grade, name = _mI.materialName;
        return this.maxWeight * occupation * jsons_1.materialData[name].ppu * (grade * 0.5 + 1);
    };
    Item.prototype.getMostExpensiveMaterialInfo = function () {
        var _this = this;
        return (0, Utility_1.arrayGetLargestInArray)(this.materialInfo, function (_mI) { return _this.getMaterialInfoPrice(_mI); }) || null;
    };
    Item.prototype.getMostOccupiedMaterialInfo = function () {
        return (0, Utility_1.arrayGetLargestInArray)(this.materialInfo, function (_mI) { return _mI.occupation; }) || null;
    };
    Item.prototype.getMaterialInfoString = function (_mI) {
        var gradeTag = (0, Utility_1.getGradeTag)(_mI);
        var foramlisedName = (0, Utility_1.formalise)(_mI.materialName);
        var materialPrice = this.getMaterialInfoPrice(_mI);
        var materialWeight = _mI.occupation * this.maxWeight;
        return foramlisedName + " (" + gradeTag + ") $" + (0, Utility_1.roundToDecimalPlace)(materialPrice) + "\n`" + (0, Utility_1.addHPBar)(this.weight, materialWeight, 20) + "` [" + (0, Utility_1.roundToDecimalPlace)(materialWeight) + typedef_1.MEW + "] (" + (0, Utility_1.roundToDecimalPlace)(materialWeight / this.weight * 100) + "%)";
    };
    Item.prototype.getWorth = function (round) {
        if (round === void 0) { round = false; }
        var totalPrice = 0;
        for (var i = 0; i < this.materialInfo.length; i++) {
            var materialInfo = this.materialInfo[i];
            var price = this.getMaterialInfoPrice(materialInfo);
            totalPrice += price;
        }
        return round ?
            (0, Utility_1.roundToDecimalPlace)(totalPrice, 2) :
            totalPrice;
    };
    Item.prototype.returnObject = function () {
        return {
            name: this.name,
            type: this.type,
            materialInfo: this.materialInfo,
            weight: this.weight,
            maxWeight: this.maxWeight,
        };
    };
    Item.prototype.normaliseWeight = function () {
        var _this = this;
        this.materialInfo = this.materialInfo.map(function (_mI) {
            return (0, Utility_1.getNewObject)(_mI, {
                occupation: (_mI.occupation * _this.maxWeight) / _this.weight
            });
        });
        this.maxWeight = this.weight;
    };
    return Item;
}());
exports.Item = Item;
