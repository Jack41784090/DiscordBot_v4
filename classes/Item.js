"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var materialData_json_1 = __importDefault(require("../data/materialData.json"));
var Utility_1 = require("./Utility");
var Item = /** @class */ (function () {
    function Item(_elements, _maxWeight, _name) {
        this.type = 'torch';
        var newElements = [];
        this.maxWeight = _maxWeight;
        this.weight = 0;
        // log(`Creating new item... ${_name}`)
        var highestOccupyingMaterial = null;
        var _loop_1 = function (i) {
            var element = _elements[i];
            var name_1 = element.materialName;
            var grade, occupation = void 0;
            // is deviation
            if ('gradeDeviation' in element) {
                var gradeDeviation = element.gradeDeviation, occupationDeviation = element.occupationDeviation;
                grade = (0, Utility_1.random)(gradeDeviation.min, gradeDeviation.max);
                occupation = (0, Utility_1.random)(occupationDeviation.min + 0.000001, occupationDeviation.max + 0.000001);
            }
            // standard info
            else {
                grade = element.grade;
                occupation = element.occupation;
            }
            // clamp weight
            this_1.weight += _maxWeight * occupation;
            if (this_1.weight > _maxWeight) {
                var diff = this_1.weight - _maxWeight;
                this_1.weight = _maxWeight;
                occupation -= diff;
            }
            // log(`\tweight: ${this.weight}`);
            // group same materials / add new material
            var existing = newElements.find(function (_mI) { return _mI.grade === grade && _mI.materialName === name_1; }) || {
                materialName: name_1,
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
            if (highestOccupyingMaterial === null || highestOccupyingMaterial.occupation < existing.occupation) {
                highestOccupyingMaterial = existing;
            }
        };
        var this_1 = this;
        for (var i = 0; i < _elements.length; i++) {
            _loop_1(i);
        }
        this.name = _name;
        this.materialInfo = newElements;
        var _type = (0, Utility_1.getItemType)(this) || 'flesh';
        this.type = _type;
    }
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
    Item.prototype.getDisplayName = function () {
        return this.name + " " + (0, Utility_1.formalise)(this.type);
    };
    Item.prototype.getWeight = function (round) {
        if (round === void 0) { round = false; }
        return round ?
            (0, Utility_1.roundToDecimalPlace)(this.weight, 2) :
            this.weight;
    };
    Item.prototype.getMaterialInfoPrice = function (_mI) {
        var occupation = _mI.occupation, grade = _mI.grade, name = _mI.materialName;
        return this.weight * occupation * materialData_json_1.default[name].ppu * (grade * 0.5 + 1);
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
        var materialPrice = (0, Utility_1.roundToDecimalPlace)(this.getMaterialInfoPrice(_mI));
        var materialWeight = (0, Utility_1.roundToDecimalPlace)(_mI.occupation * this.weight);
        return foramlisedName + " (" + gradeTag + ") $" + materialPrice + " (" + materialWeight + "\u03BC)";
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
    return Item;
}());
exports.Item = Item;
