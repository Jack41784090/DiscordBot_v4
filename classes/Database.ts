import { Class, Settings, Stat, Team, UserData, UserStatus } from "../typedef"
import { User } from "discord.js";

import * as admin from 'firebase-admin'
import * as serviceAccount from '../serviceAccount.json'
import { Canvas, Image } from "canvas";
import { ServiceAccount } from "firebase-admin";
import { drawCircle, drawText, getBaseStat, getCSFromMap, getStat, log, random, startDrawing, stringifyRGBA } from "./Utility";
import { Battle } from "./Battle";
import { BotClient } from "..";

import fs from 'fs';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
})

const database = admin.firestore();

export async function getAnyData(collection: string, doc: string, failureCB?: (dR: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, sS: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>) => void) {
    const docRef = database.collection(collection).doc(doc);
    const snapShot = await docRef.get();

    if (snapShot.exists === false && failureCB !== undefined) {
        failureCB(docRef, snapShot);
    }

    return snapShot.exists?
        snapShot.data():
        null;
}
export async function saveUserData(_userData: UserData) {
    const docRef = database.collection("Users").doc(_userData.party[0]);
    const snapShot = await docRef.get();

    if (snapShot.exists) {
        docRef.update(_userData);
    }
}

export async function getMapFromLocal(mapName: string): Promise<Image | null> {
    const image = new Image();
    const dataURL = fs.readFileSync(`./maps/${mapName}`);

    return await new Promise<Image>((resolve) => {
        image.onload = () => {
            resolve(image);
        }
    })
}

export async function getUserData(id: string): Promise<UserData>;
export async function getUserData(author: User): Promise<UserData> 
export async function getUserData(id_author: string | User): Promise<UserData> {
    const {user, id} = typeof id_author !== 'string' ?
        { user: id_author, id: id_author.id }:
        { user: await BotClient.users.fetch(id_author), id: id_author };

    const data = await getAnyData('Users', id);
    return data ? data as UserData : await createNewUser(user);
}

export async function createNewUser(author: User): Promise<UserData> {
    const defaultData = getDefaultUserData(author);
    const data = await getAnyData('Users', author.id, (dr, ss) => {
        dr.create(defaultData);
    });
    return data ? data as UserData : defaultData;
}

export function getDefaultUserData(author: User) {
    const _classes: Class[] = ["Hercules"];
    return {
        classes: _classes,
        money: 0,
        name: author.username,
        party: [author.id],
        settings: getDefaultSettings(),
        status: "idle" as UserStatus,
        equippedClass: "Hercules" as Class,
    };
}

export function getDefaultSettings(): Settings {
    return {};
}
export function getFileBufferImage(path: string): Promise<Image | null> {
    const image = new Image();
    return new Promise((resolve) => {
        try {
            const dataBuffer = fs.readFileSync(path, 'utf8');
            image.onload = () => {
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
export function getFileImage(path: string): Promise<Image> {
    const image = new Image();
    return new Promise((resolve) => {
        image.onload = () => {
            resolve(image);
        };
        image.src = path;
    });
}
export function getIcon(_stat: Stat): Promise<Canvas>
{
    const threadID = random(0, 10000);
    log(`\t\t\tGetting icon for ${_stat.base.class}(${_stat.index}) (${threadID})`)

    const iconURL = _stat.base.iconURL;
    const image = new Image();
    const requestPromise = new Promise<Canvas>((resolve) => {
        try {
            // take at most 10 seconds to get icon before using default icon    
            const invalidURLTimeout = setTimeout(() => {
                log(`\t\t\t\tFailed. (${threadID})`)
                image.src = "https://cdn.discordapp.com/embed/avatars/0.png";
            }, 10 * 1000);

            // set onLoad after timeout
            image.onload = () => {
                log(`\t\t\t\tSuccess! (${threadID})`)

                clearTimeout(invalidURLTimeout);

                const squaredSize = Math.min(image.width, image.height);
                const { canvas, ctx } = startDrawing(squaredSize, squaredSize);

                ctx.save();

                // draw image
                const halfedImage = image.height / 2;
                const halfedSquare = squaredSize / 2;
                const increasing = Math.abs(halfedImage - halfedSquare);
                ctx.drawImage(image, 0, increasing, squaredSize, squaredSize, 0, 0, squaredSize, squaredSize);

                // crop
                ctx.globalCompositeOperation = 'destination-in';

                ctx.fillStyle = "#000";
                ctx.beginPath();
                ctx.arc(squaredSize * 0.5, squaredSize * 0.5, squaredSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();

                // team color (green/red)
                ctx.globalCompositeOperation = "source-over";

                ctx.lineWidth = 5;
                ctx.strokeStyle = stringifyRGBA({
                    r: 255 * Number(_stat.team === "enemy"),
                    g: 255 * Number(_stat.team === "player"),
                    b: 0,
                    alpha: 1
                });
                drawCircle(ctx, {
                    x: squaredSize / 2,
                    y: squaredSize / 2
                },
                    squaredSize / 2);

                ctx.restore();

                resolve(canvas);
            };

            // getting icon for stat, changes if there is an owner (Discord user ID) attached
            if (_stat.owner) {
                BotClient.users.fetch(_stat.owner).then(u => {
                    image.src = (u.displayAvatarURL() || u.defaultAvatarURL).replace(".webp", ".png");
                })
            }
            else {
                image.src = iconURL;
            }
        }
        catch (error) {
            console.error(error);
            resolve(getIcon(_stat));
        }
    });
    return requestPromise;
}
export function getBufferFromImage(image: Image): Buffer {
    const { canvas, ctx } = startDrawing(image.width, image.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    return canvas.toBuffer();
}

export async function saveBattle(battle: Battle) {
    const dR = database.collection('Battles').doc(battle.author.id);
    const sS = await dR.get();

    if (sS.exists) {
        dR.set({
            coordStat: getCSFromMap(battle.CSMap),
        })
    }
    else {
        dR.create({
            coordStat: getCSFromMap(battle.CSMap),
        });
    }
}