"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var typedef_1 = require("../typedef");
var classData_json_1 = __importDefault(require("../data/classData.json"));
var Utility_1 = require("../classes/Utility");
var Database_1 = require("../classes/Database");
module.exports = {
    commands: ['info'],
    expectedArgs: '[class name]',
    minArgs: 0,
    maxArgs: 1,
    callback: function (author, authorUserData, content, channel, guild, args, message, client) { return __awaiter(void 0, void 0, void 0, function () {
        var embed_1, selectMenuOptions, actionrow_1, mes, className, classChosen_1, embed_2, frameImage, characterBaseImage, _a, canvas_1, ctx, filter, arsenal, selectMenuOptions, weaponSelectActionRow_1, mes;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(args[0] === undefined)) return [3 /*break*/, 2];
                    embed_1 = function (classChosen) {
                        return (0, Utility_1.getStatsEmbed)(classChosen).setTitle("Enter \";info " + classChosen + "\" to know more about " + classChosen + ".");
                    };
                    selectMenuOptions = Object.keys(classData_json_1.default).map(function (_className) {
                        return {
                            label: _className,
                            value: _className,
                        };
                    });
                    actionrow_1 = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions);
                    actionrow_1.components[0].placeholder = "Select a Class";
                    return [4 /*yield*/, message.reply({
                            embeds: [embed_1("Hercules")],
                            components: [actionrow_1],
                        })];
                case 1:
                    mes = _b.sent();
                    (0, Utility_1.setUpInteractionCollect)(mes, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                        var classChosen;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!_itr.isSelectMenu()) return [3 /*break*/, 2];
                                    classChosen = _itr.values[0];
                                    return [4 /*yield*/, _itr.update({
                                            embeds: [embed_1(classChosen)],
                                            components: [actionrow_1],
                                        })];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); }, 10);
                    return [3 /*break*/, 7];
                case 2:
                    if (!(classData_json_1.default[args[0]] === undefined)) return [3 /*break*/, 3];
                    message.react(typedef_1.EMOJI_CROSS)
                        .catch(function (_err) { return console.log; });
                    return [3 /*break*/, 7];
                case 3:
                    className = (0, Utility_1.formalise)(args[0]);
                    classChosen_1 = (0, Utility_1.getNewObject)(classData_json_1.default[className]);
                    embed_2 = (0, Utility_1.getStatsEmbed)(className);
                    return [4 /*yield*/, (0, Database_1.getFileImage)('images/frame.png')];
                case 4:
                    frameImage = _b.sent();
                    return [4 /*yield*/, (0, Database_1.getFileImage)(classChosen_1.iconURL)];
                case 5:
                    characterBaseImage = _b.sent();
                    _a = (0, Utility_1.startDrawing)(frameImage.width * 3, frameImage.height * 3), canvas_1 = _a.canvas, ctx = _a.ctx;
                    ctx.drawImage(characterBaseImage, 20, 20, canvas_1.width - 40, canvas_1.height - 40);
                    ctx.drawImage(frameImage, 0, 0, canvas_1.width, canvas_1.height);
                    ctx.textAlign = "center";
                    ctx.font = '90px serif';
                    ctx.fillStyle = "rgba(255, 255, 255, 1)";
                    ctx.fillText(classChosen_1.class, canvas_1.width / 2, canvas_1.height * 0.95);
                    ctx.strokeText(classChosen_1.class, canvas_1.width / 2, canvas_1.height * 0.95);
                    embed_2.setThumbnail("attachment://thumbnail.png");
                    filter = function (_w, _i) {
                        return {
                            emoji: _w.targetting.target === typedef_1.WeaponTarget.ally ?
                                typedef_1.EMOJI_SHIELD :
                                typedef_1.EMOJI_SWORD,
                            label: _w.Name,
                            value: "" + _i,
                        };
                    };
                    arsenal = classChosen_1.weapons.concat(classChosen_1.autoWeapons);
                    selectMenuOptions = arsenal.map(filter);
                    selectMenuOptions.push({
                        emoji: typedef_1.EMOJI_STAR,
                        label: "Stats",
                        value: "menu",
                    });
                    weaponSelectActionRow_1 = (0, Utility_1.getSelectMenuActionRow)(selectMenuOptions);
                    return [4 /*yield*/, message.reply({
                            embeds: [embed_2],
                            files: [{ attachment: canvas_1.toBuffer(), name: "thumbnail.png" }],
                            components: [weaponSelectActionRow_1],
                        })];
                case 6:
                    mes = _b.sent();
                    (0, Utility_1.setUpInteractionCollect)(mes, function (_itr) { return __awaiter(void 0, void 0, void 0, function () {
                        var weaponIndex, weaponChosen, _err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    if (!_itr.isSelectMenu()) return [3 /*break*/, 4];
                                    weaponIndex = parseInt(_itr.values[0]);
                                    weaponChosen = classChosen_1.weapons[weaponIndex] || classChosen_1.autoWeapons[weaponIndex % classChosen_1.weapons.length];
                                    if (!weaponChosen) return [3 /*break*/, 2];
                                    return [4 /*yield*/, _itr.update({
                                            embeds: [
                                                (0, Utility_1.getWeaponEmbed)(weaponChosen)
                                            ]
                                        })];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, _itr.update({
                                        embeds: [embed_2],
                                        files: [{ attachment: canvas_1.toBuffer(), name: "thumbnail.png" }],
                                        components: [weaponSelectActionRow_1],
                                    })];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [3 /*break*/, 6];
                                case 5:
                                    _err_1 = _a.sent();
                                    console.log(_err_1);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); }, 10);
                    _b.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    }); }
};
