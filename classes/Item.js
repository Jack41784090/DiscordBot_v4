"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var jsons_1 = require("../jsons");
var typedef_1 = require("../typedef");
var Utility_1 = require("./Utility");
var Item = /** @class */ (function () {
    function Item(_i_elements, _maxWeight, _name) {
        this.itemType = 'torch';
        var elements = _maxWeight === undefined ?
            _i_elements.materialInfo :
            _i_elements;
        var maxWeight = _maxWeight === undefined ?
            _i_elements.maxWeight :
            _maxWeight;
        var name = _name === undefined ?
            _i_elements.name :
            _name;
        var newElements = [];
        this.maxWeight = maxWeight;
        this.weight = 0;
        var _loop_1 = function (i) {
            var element = elements[i];
            var name_1 = element.materialName;
            var grade, occupation = void 0;
            // is deviation
            if ('gradeDeviation' in element) {
                var gradeDeviation = element.gradeDeviation, occupationDeviation = element.occupationDeviation;
                var randomisedGrade = Math.abs(Math.round((0, Utility_1.normalRandom)(gradeDeviation.min, 1)));
                grade = (0, Utility_1.clamp)(randomisedGrade, gradeDeviation.min, gradeDeviation.max);
                occupation = (0, Utility_1.uniformRandom)(occupationDeviation.min + Number.EPSILON, occupationDeviation.max);
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
            this_1.weight += maxWeight * occupation;
            if (this_1.weight > maxWeight) {
                var reducedWeight = this_1.weight - maxWeight;
                // log("Clamping weight...")
                // debug("\tWeight", `${this.weight} => ${_maxWeight}`);
                // debug("\tOccupation", `${occupation} => ${occupation - (reducedWeight / this.maxWeight)}`)
                this_1.weight = maxWeight;
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
        for (var i = 0; i < elements.length; i++) {
            _loop_1(i);
        }
        this.name = name;
        this.materialInfo = newElements;
        // normalise weight => get type
        this.normaliseWeight();
        var _type = (0, Utility_1.getItemType)(this) || 'amalgamation';
        this.itemType = _type;
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
        }), (0, Utility_1.uniformRandom)(min + Number.EPSILON, max), _customName);
        item.fillJunk(min);
        // log(item);
        return item;
    };
    Item.Forge = function (_blade, _guard, _shaft, _type) {
        var bladeWeight = _blade.getWeight();
        var guardWeight = _guard.getWeight();
        var shaftWeight = _shaft.getWeight();
        var totalWeight = bladeWeight + guardWeight + shaftWeight;
        var materials = __spreadArray(__spreadArray(__spreadArray([], __read(_blade.getAllMaterial().map(function (_mi) {
            return (0, Utility_1.getNewObject)(_mi, { occupation: _mi.occupation * (bladeWeight / totalWeight) });
        })), false), __read(_guard.getAllMaterial().map(function (_mi) {
            return (0, Utility_1.getNewObject)(_mi, { occupation: _mi.occupation * (guardWeight / totalWeight) });
        })), false), __read(_shaft.getAllMaterial().map(function (_mi) {
            return (0, Utility_1.getNewObject)(_mi, { occupation: _mi.occupation * (shaftWeight / totalWeight) });
        })), false);
        var item = new Item(materials, totalWeight, _type);
        var get = function (_part, _require) {
            switch (_part) {
                case 'blade':
                    return _blade.getAllMaterial().reduce(function (_tt, _m) {
                        return _tt + _m.occupation * bladeWeight * Math.pow(1.1, _m.grade) * jsons_1.materialData[_m.materialName][_require];
                    }, 0);
                case 'shaft':
                    return _shaft.getAllMaterial().reduce(function (_tt, _m) {
                        return _tt + _m.occupation * shaftWeight * Math.pow(1.1, _m.grade) * jsons_1.materialData[_m.materialName][_require];
                    }, 0);
                case 'guard':
                    return _shaft.getAllMaterial().reduce(function (_tt, _m) {
                        return _tt + _m.occupation * guardWeight * Math.pow(1.1, _m.grade) * jsons_1.materialData[_m.materialName][_require];
                    }, 0);
            }
        };
        var weaponData = jsons_1.forgeWeaponData[_type];
        var fw = {
            weaponType: _type,
            type: weaponData.type,
            range: weaponData.range,
            // (blade: x0.8, shaft: x1.5) * weaponType accScale
            accuracy: 50 + get('blade', 'accuracy') * 0.8 + get('shaft', 'accuracy') * 1.5,
            // (blade: x1.5, shaft: x0.8) * weaponType damageScale
            damageRange: {
                min: _blade.getAllMaterial().reduce(function (_tt, _m) {
                    return _tt + _m.occupation * bladeWeight * Math.pow(1.1, _m.grade) * jsons_1.materialData[_m.materialName].damageRange[0];
                }, 0),
                max: _blade.getAllMaterial().reduce(function (_tt, _m) {
                    return _tt + _m.occupation * bladeWeight * Math.pow(1.1, _m.grade) * jsons_1.materialData[_m.materialName].damageRange[1];
                }, 0),
            },
            // (blade: x1.2, shaft: x1.2) * weaponType criticalHitScale
            criticalHit: 0 + get('blade', 'criticalHit') * 1.2 + get('shaft', 'criticalHit') * 1.2,
            // blade: x1.0
            lifesteal: get('blade', 'lifesteal'),
            // speed
            // totalweight * weaponType speedscaling
            readinessCost: (get('blade', 'speed') + get('guard', 'speed') + get('shaft', 'speed')) *
                jsons_1.forgeWeaponData[_type].spdScale,
            // weight
            // totalweight 
            staminaCost: totalWeight,
        };
        return Object.assign(item, fw);
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
        this.itemType = (0, Utility_1.getItemType)(this) || 'amalgamation';
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
            //     range.min [IIIIIIII] range.max
            // matr[0] [||||||||] matr[1]
            var condition1 = (range[0] >= materialRange[0] && range[0] < materialRange[1]);
            // range.min [IIIIIIII] range.max
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
            var randomOccupation = 10e-5;
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
        return this.name + " " + (0, Utility_1.formalise)(jsons_1.itemData[this.itemType].name);
    };
    Item.prototype.getItemType = function () {
        this.itemType = (0, Utility_1.getItemType)(this) || 'amalgamation';
        return this.itemType;
    };
    Item.prototype.getWeight = function (round) {
        if (round === void 0) { round = false; }
        return round ?
            (0, Utility_1.roundToDecimalPlace)(this.weight, 2) :
            this.weight;
    };
    Item.prototype.getMaxWeight = function () {
        return this.maxWeight;
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
    Item.prototype.getMaterialInfo = function (_mN) {
        return this.materialInfo.find(function (_mI) { return _mI.materialName === _mN; });
    };
    Item.prototype.getAllMaterial = function () {
        return this.materialInfo;
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
            type: this.itemType,
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
