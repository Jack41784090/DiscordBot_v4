import { Client, Guild, Message, TextChannel, User } from "discord.js";
import { getUserData, saveUserData } from "../classes/Database";
import { getButtonsActionRow, sendInvitation } from "../classes/Utility";
import { CommandModule, UserData } from "../typedef";

module.exports = {
    commands: ['invite'],
    expectedArgs: '[@mention_a_user]',
    minArgs: 0,
    maxArgs: 1,
    callback: async (author: User, authorUserData: UserData, content: string, channel: TextChannel, guild: Guild, args: Array<string>, message: Message, client: Client) => {
        // find user in mention
        const invitedUser: User | undefined = message.mentions.users.first();

        if (invitedUser && invitedUser.id !== author.id) {
            // get user from firebase
            const invitedUserData: UserData = await getUserData(invitedUser);

            const acceptedInvite = async () => {
                author.send(`${invitedUser.username} accepted your invitation!`)
                    .catch(_e => {
                        channel.send(`<@${author.id}}> your invitation was accepted!`)
                            .catch();
                    })

                // invited user update
                invitedUserData.status = "busy";
                await saveUserData(invitedUserData);

                // leader user update
                authorUserData.party.push(invitedUser.id);
                await saveUserData(authorUserData);
            }
            const rejectedInvite = async () => {
                author.send(`${invitedUser.username} rejected your invitation.`)
                    .catch(_e => {
                        channel.send(`<@${author.id}}> your invitation was rejected.`)
                            .catch();
                    });
            }

            // if user has at least one class, add playerID to party
            if (invitedUserData.status === "idle" && invitedUserData.classes[0] !== undefined) {
                if (invitedUserData.equippedClass == null) {
                    invitedUserData.equippedClass = invitedUserData.classes[0];
                }

                // send invitation
                const invitationAccepted: boolean | null = await sendInvitation(invitedUser, author);

                if (invitationAccepted === true) {
                    acceptedInvite();
                }
                else if (invitationAccepted === false) {
                    rejectedInvite();
                }
                else if (invitationAccepted === null) {
                    const tryTwo = await sendInvitation(invitedUser, author, channel);
                    if (tryTwo === true) {
                        acceptedInvite();
                    }
                    else {
                        rejectedInvite();
                    }
                }
            }
            else if (invitedUserData.status !== "idle") {
                message.reply("Invited user is busy.")
            }
        }
        else {
            message.reply("You did not mention a player. Mention another user to invite them.")
        }
    }
} as CommandModule;