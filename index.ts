require('dotenv').config();
import { Client, Intents, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { Battle } from "./classes/Battle.js";
import { getDefaultUserData, getUserData } from "./classes/Database.js";
import { extractCommands, log, Test } from "./classes/Utility.js";
import { CommandModule, COMMAND_CALL } from "./typedef.js";

const commandReferral: { [key: string]: CommandModule } = {};

export const BotClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS] });
async function quickEmbark() {
    const embark: CommandModule = require('./commands/embark.js');
    const Ike = await BotClient.users.fetch("262871357455466496").then(u => u);
    const channel = await BotClient.channels.fetch("900951147391623259").then(c => c as TextChannel);
    const server = await BotClient.guilds.fetch("828827482785579038").then(g => g);
    const message = await channel.send("hi world");
    embark.callback(Ike, getDefaultUserData(Ike), ";go farmstead", channel, server, ["farmstead"], message, BotClient);
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
    // quickEmbark();
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