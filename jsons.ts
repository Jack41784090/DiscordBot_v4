import itemData from "./data/itemData.json";
import areasData from "./data/areasData.json";
import classData from "./data/classData.json";
import dungeonData from "./data/dungeonData.json";
import enemiesData from "./data/enemiesData.json";
import materialData from "./data/materialData.json";
import universalAbilitiesData from "./data/universalAbilitiesData.json";
import universalWeaponsData from "./data/universalWeaponData.json";
import interactionEventData from './data/interactionEventData.json';
import forgeWeaponData from "./data/forgeWeaponData.json";
// import fs from 'fs'

export {
    itemData,
    areasData,
    classData,
    dungeonData,
    enemiesData,
    materialData,
    universalAbilitiesData,
    universalWeaponsData,
    interactionEventData,
    forgeWeaponData,
}

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