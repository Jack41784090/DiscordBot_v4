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
        this.weight = 0;
        var _loop_1 = function (i) {
            var element = _elements[i];
            var name_1 = element.name;
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
            this_1.weight += _maxWeight * occupation;
            if (this_1.weight > _maxWeight) {
                var diff = this_1.weight - _maxWeight;
                this_1.weight = _maxWeight;
                occupation -= diff;
            }
            var existing = newElements.find(function (_mI) { return _mI.grade === grade && _mI.name === name_1; });
            if (existing) {
                existing.occupation += occupation;
            }
            else if (occupation > 0) {
                newElements.push({
                    name: name_1,
                    grade: grade,
                    occupation: occupation,
                });
            }
        };
        var this_1 = this;
        for (var i = 0; i < _elements.length; i++) {
            _loop_1(i);
        }
        this.name = _name;
        this.materialInfo = newElements;
    }
    Item.prototype.print = function () {
        var realWeight = 0;
        for (var i = 0; i < this.materialInfo.length; i++) {
            var mi = this.materialInfo[i];
            var price = this.getMaterialInfoPrice(mi);
            console.log(mi.name + ": " + mi.occupation * 100 + "% (" + mi.grade + ") ($" + price + ")");
            realWeight += this.weight * mi.occupation;
        }
        console.log("Total price: $" + this.getWorth());
        console.log("Total weight: " + this.weight + " (real: " + realWeight + ")");
    };
    Item.prototype.getMaterialInfoPrice = function (_mI) {
        var occupation = _mI.occupation, grade = _mI.grade, name = _mI.name;
        return this.weight * occupation * materialData_json_1.default[name].ppu * (grade * 0.5 + 1);
    };
    Item.prototype.getMostExpensiveMaterialInfo = function () {
        var _this = this;
        return (0, Utility_1.arrayGetLargestInArray)(this.materialInfo, function (_mI) { return _this.getMaterialInfoPrice(_mI); }) || null;
    };
    Item.prototype.getMostOccupiedMaterialInfo = function () {
        return (0, Utility_1.arrayGetLargestInArray)(this.materialInfo, function (_mI) { return _mI.occupation; }) || null;
    };
    Item.prototype.getWorth = function () {
        var totalPrice = 0;
        for (var i = 0; i < this.materialInfo.length; i++) {
            var materialInfo = this.materialInfo[i];
            var price = this.getMaterialInfoPrice(materialInfo);
            totalPrice += price;
        }
        return totalPrice;
    };
    Item.prototype.returnObject = function () {
        return {
            name: this.name,
            type: this.type,
            materialInfo: this.materialInfo,
            weight: this.weight,
        };
    };
    return Item;
}());
exports.Item = Item;
