require('dotenv').config();
import { Client, Intents, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { Battle } from "./classes/Battle.js";
import { getDefaultUserData, getUserData } from "./classes/Database.js";
import { extractCommands, getNewObject, log, Test } from "./classes/Utility.js";
import { CommandModule, COMMAND_CALL, MapData } from "./typedef.js";

import areasData from "./data/areasData.json";

const commandReferral: { [key: string]: CommandModule } = {};

export const BotClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] });
async function quickEmbark() {
    const Ike = await BotClient.users.fetch("262871357455466496");
    const mes = await (await BotClient.channels.fetch("926372977539424296") as TextChannel).send("Stuff");
    Battle.Start(getNewObject(areasData.farmstead_empty) as MapData, Ike, mes, ["262871357455466496"], BotClient, false);
}

function importCommands() {
    const readCommands = (dir: string) => {
        const commandsPath = path.join(__dirname, dir);
        const files = fs.readdirSync(commandsPath);

        for (const file of files) {
            const isDirectory = (fs.lstatSync(path.join(__dirname, dir, file))).isDirectory();
            if (isDirectory) {
                readCommands(path.join(dir, file));
            }
            else {
                console.log("Requiring " + path.join(__dirname, dir, file));
                const option = require(path.join(__dirname, dir, file));
                option.commands.forEach((alias: string) => {
                    commandReferral[alias] = option;
                });
            }
        }
    };
    readCommands('commands');
}

BotClient.on('ready', async () => {
    BotClient.setMaxListeners(15);
    console.log("Ready.");
    importCommands();
    quickEmbark();
    // Test();
});

BotClient.on('messageCreate', async m => {
    const { author, content, channel, member, guild } = m;

    if (author.bot === true) return;

    if (content[0] === COMMAND_CALL) {
        const firebaseAuthor = await getUserData(author);
        const sections = extractCommands(content); log(sections)
        const command = sections[0]; sections.shift();
        if (commandReferral[command]) {
            commandReferral[command].callback(author, firebaseAuthor, content, channel as TextChannel, guild!, sections, m, BotClient);
        }
    }
});

BotClient.login(process.env.TOKEN);