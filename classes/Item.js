"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
var materialData_json_1 = __importDefault(require("../data/materialData.json"));
var Utility_1 = require("./Utility");
var Item = /** @class */ (function () {
    function Item(_elements, _weight) {
        this.type = 'torch';
        var newElements = [];
        for (var i = 0; i < _elements.length; i++) {
            var element = _elements[i];
            // is deviation
            if ('gradeDeviation' in element) {
                var qualityInfo = {
                    name: element.name,
                    grade: (0, Utility_1.random)(element.gradeDeviation.min, element.gradeDeviation.max),
                    occupation: (0, Utility_1.random)(element.occupationDeviation.min, element.occupationDeviation.max),
                };
                newElements.push(qualityInfo);
            }
            else {
                newElements.push(element);
            }
        }
        this.materialInfo = newElements;
        this.weight = _weight;
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
            type: this.type,
            materialInfo: this.materialInfo,
            weight: this.weight,
        };
    };
    return Item;
}());
exports.Item = Item;
