import { BaseStat, Class, defaultAvatarURL, GetIconOptions, OwnerID, Settings, Stat, UserData, } from "../typedef"
import { User } from "discord.js";

import * as admin from 'firebase-admin'
import * as serviceAccount from '../serviceAccount.json'
import { Canvas, Image } from "canvas";
import { ServiceAccount } from "firebase-admin";
import { drawCircle, getCSFromMap, getNewObject, log, uniformRandom, startDrawing, stringifyRGBA } from "./Utility";
import { Battle } from "./Battle";
import { BotClient } from "..";

import fs from 'fs';
import { ImgurClient } from 'imgur';
import { Item } from "./Item";

// firebase login
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
})
const database = admin.firestore();

// imgur login
const imgurClient = new ImgurClient({
    clientId: 'fb524134f2cc257',
    clientSecret: 'd3db322bb9fd8a6bd7407d6337611fcca1e31310',
});

export async function getAnyData(collection: string, doc: string, failureCB?: (dR: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>, sS: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>) => void) {
    const docRef = database.collection(collection).doc(doc);
    const snapShot = await docRef.get();

    if (snapShot.exists === false && failureCB !== undefined) {
        failureCB(docRef, snapShot);
    }

    return snapShot.exists?
        snapShot.data()!:
        null;
}
export async function saveUserData(_userData: UserData) {
    log("Saving");
    const document = database.collection("Users").doc(_userData.party[0]);
    const snapshotData = await document.get();

    if (snapshotData.exists) {
        const defaultUserData = getDefaultUserData();
        const mod = getNewObject(_userData, {
            inventory: _userData?.inventory.map(_i => _i.returnObject()) || []
        });
        document.update(getNewObject(defaultUserData, mod));
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

    const fetched: FirebaseFirestore.DocumentData | null = await getAnyData('Users', id);
    const defaultData: UserData = getDefaultUserData(user);
    const data: UserData = getNewObject(defaultData, fetched) as UserData;
    data.inventory = data.inventory.map(_i => {
        return new Item(_i.materialInfo, _i.maxWeight, _i.name)
    });

    if (fetched === null) {
        await createNewUser(user);
    }

    return data;
}

export async function createNewUser(author: User): Promise<UserData> {
    const defaultData = getDefaultUserData(author);
    const data = await getAnyData('Users', author.id, (dr, ss) => {
        dr.create(defaultData);
    });

    return data?
        data as UserData:
        defaultData;
}
export async function setUserWelfare(_user: User | OwnerID, _welfare: number): Promise<boolean> {
    const id = (_user as User).client ?
        (_user as User).id :
        _user as OwnerID;
    const document = database.collection("Users").doc(id);
    const snapshotData = await document.get();

    if (snapshotData.exists) {
        await document.update({
            welfare: _welfare
        });
    }

    return snapshotData.exists;
}
export async function getUserWelfare(_user: User | OwnerID): Promise<number | null> {
    const id = (_user as User).client?
        (_user as User).id:
        _user as OwnerID;
    const document = database.collection("Users").doc(id);
    const snapshotData = await document.get();

    let data: UserData | null = null;
    if (snapshotData.exists) {
        data = (snapshotData.data() as UserData);
        if (data.welfare === undefined) {
            await document.update(getNewObject(data, { welfare: 1 }));
            data.welfare = 1;
        }
    }
    return snapshotData.exists?
        data!.welfare:
        null;
}

export function getDefaultUserData(_user?: User) {
    const { username, id } = _user || {
        username: "",
        id: "",
    };
    const classes: Class[] = ["Fighter"];
    return {
        classes: classes,
        money: 0,
        name: username,
        party: [id],
        settings: getDefaultSettings(),
        equippedClass: "Fighter" as Class,
        welfare: 1,
        inventory: [],
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
        const timeoutError = setTimeout(() => {
            image.src = "C:/Users/Jack/Documents/Jack's Workshop/Coding/DiscordBot_v4/images/black.jpg";
        }, 10 * 1000);

        image.onload = () => {
            clearTimeout(timeoutError);
            resolve(image);
        };
        image.src = path;
    });
}
export function getIconCanvas(_stat: Stat, _drawOptions: GetIconOptions = {
    crop: true,
    frame: true,
}): Promise<Canvas>
{
    const threadID = uniformRandom(0, 10000);
    log(`\t\t\tGetting icon for ${_stat.base.class}(${_stat.index}) (${threadID})`)

    const iconURL = _stat.base.iconURL;
    const image = new Image();
    return new Promise<Canvas>((resolve) => {
        try {
            // take at most 10 seconds to get icon before using default icon    
            const invalidURLTimeout = setTimeout(() => {
                log(`\t\t\t\tFailed. (${threadID})`)
                image.src = defaultAvatarURL;
            }, 10 * 1000);

            // set onLoad after timeout
            image.onload = () => {
                if (image.src !== defaultAvatarURL) {
                    log(`\t\t\t\tSuccess! (${threadID})`)
                }

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
                if (_drawOptions.crop) {
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.fillStyle = "#000";
                    ctx.beginPath();
                    ctx.arc(squaredSize * 0.5, squaredSize * 0.5, squaredSize * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.closePath();
                }

                // black arc
                if (_drawOptions.frame) {
                    ctx.globalCompositeOperation = "source-over";
                    ctx.lineWidth = 10;
                    ctx.strokeStyle = stringifyRGBA({
                        r: 0,
                        g: 0,
                        b: 0,
                        alpha: 1
                    });
                    drawCircle(
                        ctx,
                        {
                            x: squaredSize / 2,
                            y: squaredSize / 2,
                        },
                        squaredSize / 2,
                    )
                }

                ctx.restore();

                resolve(canvas);
            };

            // getting icon for stat, changes if there is an owner (Discord user ID) attached
            if (_stat.owner) {
                BotClient.users.fetch(_stat.owner).then(u => {
                    image.src = (u.displayAvatarURL() || u.defaultAvatarURL).replace(/\.webp$/g, ".png");
                })
            }
            else {
                image.src = iconURL;
            }
            // image.src = iconURL;
        }
        catch (error) {
            console.error(error);
            resolve(getIconCanvas(_stat, _drawOptions));
        }
    });
}
export async function getIconImgurLink(_stat: Stat): Promise<null | string> {
    const ssData = await getAnyData('Imgur', _stat.base.class);

    return ssData?.url || await (async () => {
        const imageCanvas = await getIconCanvas(_stat, {});
        const uploaded = await imgurClient.upload({
            image: imageCanvas.toBuffer(),
            type: 'stream',
        })
        if (uploaded.success) {
            database.collection("Imgur").doc(_stat.base.class).set({
                url: uploaded.data.link
            });
            return uploaded.data.link;
        }
        else {
            console.error(`Catastrophic failure: getIconImgurLink upload failure.`);
            return null;
        }
    })();
}
export function getBufferFromImage(image: Image): Buffer {
    const { canvas, ctx } = startDrawing(image.width, image.height);
    ctx.drawImage(image, 0, 0, image.width, image.height);
    return canvas.toBuffer();
}

export async function saveBattle(battle: Battle) {
    const dR = database.collection('Battles').doc(battle.author.id);
    const sS = await dR.get();
    const CS = getCSFromMap(battle.CSMap)

    if (sS.exists) {
        dR.set({
            coordStat: CS,
        })
    }
    else {
        dR.create({
            coordStat: CS,
        });
    }
}