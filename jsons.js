"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeWeaponData = exports.interactionEventData = exports.universalWeaponsData = exports.universalAbilitiesData = exports.materialData = exports.enemiesData = exports.dungeonData = exports.classData = exports.areasData = exports.itemData = void 0;
var itemData_json_1 = __importDefault(require("./data/itemData.json"));
exports.itemData = itemData_json_1.default;
var areasData_json_1 = __importDefault(require("./data/areasData.json"));
exports.areasData = areasData_json_1.default;
var classData_json_1 = __importDefault(require("./data/classData.json"));
exports.classData = classData_json_1.default;
var dungeonData_json_1 = __importDefault(require("./data/dungeonData.json"));
exports.dungeonData = dungeonData_json_1.default;
var enemiesData_json_1 = __importDefault(require("./data/enemiesData.json"));
exports.enemiesData = enemiesData_json_1.default;
var materialData_json_1 = __importDefault(require("./data/materialData.json"));
exports.materialData = materialData_json_1.default;
var universalAbilitiesData_json_1 = __importDefault(require("./data/universalAbilitiesData.json"));
exports.universalAbilitiesData = universalAbilitiesData_json_1.default;
var universalWeaponData_json_1 = __importDefault(require("./data/universalWeaponData.json"));
exports.universalWeaponsData = universalWeaponData_json_1.default;
var interactionEventData_json_1 = __importDefault(require("./data/interactionEventData.json"));
exports.interactionEventData = interactionEventData_json_1.default;
var forgeWeaponData_json_1 = __importDefault(require("./data/forgeWeaponData.json"));
exports.forgeWeaponData = forgeWeaponData_json_1.default;
// const readJSON = (path: string) => {
//     const { minify, parse } = JSON;
//     return new Promise<unknown>((resolve, reject) => {
//         fs.readFile(require.resolve(path), (_err, _buffer) => {
//             if (_err) {
//                 console.log(_err);
//                 reject(_err);
//             }
//             else {
//                 resolve(parse(minify(_buffer.toString())));
//             }
//         });
//     });
// }
// export 
// const _ = [
//     "itemData",
//     "areasData",
//     "classData",
//     "dungeonData",
//     "enemiesData",
//     "materialData",
//     "universalAbilitiesData",
//     "universalWeaponsData",
//     "interactionEventData",
//     "forgeWeaponData",
// ]
// module.exports = _.map(_fileName => {
//     return readJSON(`./data/${_fileName}.json`)
//         .then()
// });
