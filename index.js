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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotClient = void 0;
require('dotenv').config();
var discord_js_1 = require("discord.js");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var Battle_js_1 = require("./classes/Battle.js");
var Database_js_1 = require("./classes/Database.js");
var Utility_js_1 = require("./classes/Utility.js");
var typedef_js_1 = require("./typedef.js");
var areasData_json_1 = __importDefault(require("./data/areasData.json"));
var commandReferral = {};
exports.BotClient = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES, discord_js_1.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] });
function quickEmbark() {
    return __awaiter(this, void 0, void 0, function () {
        var Ike, mes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.BotClient.users.fetch("262871357455466496")];
                case 1:
                    Ike = _a.sent();
                    return [4 /*yield*/, exports.BotClient.channels.fetch("926372977539424296")];
                case 2: return [4 /*yield*/, (_a.sent()).send("Stuff")];
                case 3:
                    mes = _a.sent();
                    Battle_js_1.Battle.Start((0, Utility_js_1.getNewObject)(areasData_json_1.default.farmstead_empty), Ike, mes, ["262871357455466496"], exports.BotClient, false);
                    return [2 /*return*/];
            }
        });
    });
}
function importCommands() {
    var readCommands = function (dir) {
        var e_1, _a;
        var commandsPath = path.join(__dirname, dir);
        var files = fs.readdirSync(commandsPath);
        var _loop_1 = function (file) {
            var isDirectory = (fs.lstatSync(path.join(__dirname, dir, file))).isDirectory();
            if (isDirectory) {
                readCommands(path.join(dir, file));
            }
            else {
                console.log("Requiring " + path.join(__dirname, dir, file));
                var option_1 = require(path.join(__dirname, dir, file));
                option_1.commands.forEach(function (alias) {
                    commandReferral[alias] = option_1;
                });
            }
        };
        try {
            for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                var file = files_1_1.value;
                _loop_1(file);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    readCommands('commands');
}
exports.BotClient.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        exports.BotClient.setMaxListeners(15);
        console.log("Ready.");
        importCommands();
        // quickEmbark();
        (0, Utility_js_1.Test)();
        return [2 /*return*/];
    });
}); });
exports.BotClient.on('messageCreate', function (m) { return __awaiter(void 0, void 0, void 0, function () {
    var author, content, channel, member, guild, firebaseAuthor, sections, command;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                author = m.author, content = m.content, channel = m.channel, member = m.member, guild = m.guild;
                if (author.bot === true)
                    return [2 /*return*/];
                if (!(content[0] === typedef_js_1.COMMAND_CALL)) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, Database_js_1.getUserData)(author)];
            case 1:
                firebaseAuthor = _a.sent();
                sections = (0, Utility_js_1.extractCommands)(content);
                (0, Utility_js_1.log)(sections);
                command = sections[0];
                sections.shift();
                if (commandReferral[command]) {
                    commandReferral[command].callback(author, firebaseAuthor, content, channel, guild, sections, m, exports.BotClient);
                }
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
exports.BotClient.login(process.env.TOKEN);
