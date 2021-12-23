import { Class, Settings, Stat, Team, UserData, UserStatus } from "../typedef"
import { User } from "discord.js";

import * as admin from 'firebase-admin'
import * as serviceAccount from '../serviceAccount.json'
import { Canvas, Image } from "canvas";
import { ServiceAccount } from "firebase-admin";
import { getBaseStat, getCSFromMap, getStat, log, startDrawing } from "./Utility";
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

    if (snapShot.exists) {
        return snapShot.data();
    }
    else {
        if (failureCB) failureCB(docRef, snapShot);
        return null;
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
    const _classes: Class[] = [Class.Hercules];
    return {
        classes: _classes,
        money: 0,
        name: author.username,
        party: [author.id],
        settings: getDefaultSettings(),
        status: UserStatus.idle,
        equippedClass: Class.Hercules,
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
export function getIcon(stat: Stat): Promise<Image>
{
    const imageURL = stat.base.iconURL;
    const image = new Image();
    return new Promise((resolve) => {
        image.onload = () => {
            resolve(image);
        };
        image.src = imageURL;
    });
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