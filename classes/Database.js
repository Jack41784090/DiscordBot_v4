"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.saveBattle = exports.getBufferFromImage = exports.getIcon = exports.getFileImage = exports.getFileBufferImage = exports.getDefaultSettings = exports.getDefaultUserData = exports.createNewUser = exports.getUserData = exports.getMapFromLocal = exports.getAnyData = void 0;
var typedef_1 = require("../typedef");
var admin = __importStar(require("firebase-admin"));
var serviceAccount = __importStar(require("../serviceAccount.json"));
var canvas_1 = require("canvas");
var Utility_1 = require("./Utility");
var __1 = require("..");
var fs_1 = __importDefault(require("fs"));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
var database = admin.firestore();
function getAnyData(collection, doc, failureCB) {
    return __awaiter(this, void 0, void 0, function () {
        var docRef, snapShot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    docRef = database.collection(collection).doc(doc);
                    return [4 /*yield*/, docRef.get()];
                case 1:
                    snapShot = _a.sent();
                    if (snapShot.exists) {
                        return [2 /*return*/, snapShot.data()];
                    }
                    else {
                        if (failureCB)
                            failureCB(docRef, snapShot);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAnyData = getAnyData;
function getMapFromLocal(mapName) {
    return __awaiter(this, void 0, void 0, function () {
        var image, dataURL;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    image = new canvas_1.Image();
                    dataURL = fs_1.default.readFileSync("./maps/" + mapName);
                    return [4 /*yield*/, new Promise(function (resolve) {
                            image.onload = function () {
                                resolve(image);
                            };
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getMapFromLocal = getMapFromLocal;
function getUserData(id_author) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, user, id, _b, data, _c;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!(typeof id_author !== 'string')) return [3 /*break*/, 1];
                    _b = { user: id_author, id: id_author.id };
                    return [3 /*break*/, 3];
                case 1:
                    _d = {};
                    return [4 /*yield*/, __1.BotClient.users.fetch(id_author)];
                case 2:
                    _b = (_d.user = _e.sent(), _d.id = id_author, _d);
                    _e.label = 3;
                case 3:
                    _a = _b, user = _a.user, id = _a.id;
                    return [4 /*yield*/, getAnyData('Users', id)];
                case 4:
                    data = _e.sent();
                    if (!data) return [3 /*break*/, 5];
                    _c = data;
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, createNewUser(user)];
                case 6:
                    _c = _e.sent();
                    _e.label = 7;
                case 7: return [2 /*return*/, _c];
            }
        });
    });
}
exports.getUserData = getUserData;
function createNewUser(author) {
    return __awaiter(this, void 0, void 0, function () {
        var defaultData, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultData = getDefaultUserData(author);
                    return [4 /*yield*/, getAnyData('Users', author.id, function (dr, ss) {
                            dr.create(defaultData);
                        })];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data ? data : defaultData];
            }
        });
    });
}
exports.createNewUser = createNewUser;
function getDefaultUserData(author) {
    var _classes = [typedef_1.Class.Hercules];
    return {
        classes: _classes,
        money: 0,
        name: author.username,
        party: [author.id],
        settings: getDefaultSettings(),
        status: typedef_1.UserStatus.idle,
        equippedClass: typedef_1.Class.Hercules,
    };
}
exports.getDefaultUserData = getDefaultUserData;
function getDefaultSettings() {
    return {};
}
exports.getDefaultSettings = getDefaultSettings;
function getFileBufferImage(path) {
    var image = new canvas_1.Image();
    return new Promise(function (resolve) {
        try {
            var dataBuffer = fs_1.default.readFileSync(path, 'utf8');
            image.onload = function () {
                resolve(image);
            };
            image.src = dataBuffer;
        }
        catch (err) {
            console.log(err);
            resolve(null);
        }
    });
}
exports.getFileBufferImage = getFileBufferImage;
function getFileImage(path) {
    var image = new canvas_1.Image();
    return new Promise(function (resolve) {
        image.onload = function () {
            resolve(image);
        };
        image.src = path;
    });
}
exports.getFileImage = getFileImage;
function getIcon(stat) {
    var imageURL = stat.base.iconURL;
    var image = new canvas_1.Image();
    return new Promise(function (resolve) {
        image.onload = function () {
            resolve(image);
        };
        image.src = imageURL;
    });
}
exports.getIcon = getIcon;
function getBufferFromImage(image) {
    var _a = (0, Utility_1.startDrawing)(image.width, image.height), canvas = _a.canvas, ctx = _a.ctx;
    ctx.drawImage(image, 0, 0, image.width, image.height);
    return canvas.toBuffer();
}
exports.getBufferFromImage = getBufferFromImage;
function saveBattle(battle) {
    return __awaiter(this, void 0, void 0, function () {
        var dR, sS;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dR = database.collection('Battles').doc(battle.author.id);
                    return [4 /*yield*/, dR.get()];
                case 1:
                    sS = _a.sent();
                    if (sS.exists) {
                        dR.set({
                            coordStat: (0, Utility_1.getCSFromMap)(battle.CSMap),
                        });
                    }
                    else {
                        dR.create({
                            coordStat: (0, Utility_1.getCSFromMap)(battle.CSMap),
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.saveBattle = saveBattle;
