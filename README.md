# DiscordBot_v4

Welcome to my project description for this ambitious project of mine. I spent around a total of three years trying to revamp and perfect my vision, but decided that this would probably lead to never finishing the project. Therefore, I have decided to release it before completion. Here is what the project has to offer:

## Vision
The Discord bot came from a desire to gamify combat situations during group ["roleplays"](https://www.google.com/search?client=opera-gx&q=role+play+definition&sourceid=opera&ie=UTF-8&oe=UTF-8). It took inspiration from the Fire Emblem series, implementing top-down 2D movement and a turn-based battle. The direction of the bot eventually turned into a RPG game, with less of a focus on character-based combat and more of a class-based combat, fighting random monsters, seizing their treasures, and making new weapons out of them.

## Highlights
### Embark in a Dungeon-Crawling Experience
![image](https://user-images.githubusercontent.com/39062670/163757057-f3fdc665-1c4b-401f-b766-667682dca131.png)

#### Traversal

After entering the command ";go \[specified location]", the bot will send an embedded Discord text message that allows the user to go in any directions in the randomly-generated dungeon (Dungeons are randomly generated with code in class "Dungeon", static function named "Generate"). When traversing the dungeon, the player and their party could possibly encounter enemies and trigger a battle. 

#### Using Items

In a dark, dank, deep dungeon, there will naturally be monsters and boogeymen. Therefore, what else do you need but a few torches to brighten up the path? Or perhaps a few killerbots to help you scout ahead?
Right now, there are two major items that will prove to be essential to players in the dungeon-crawling experience: 

- Torch: Brighten the path ahead and behind the player to spot enemies.
- Scout: Review the location of the closest enemy.

|When the torch is used, a few blocks of path ahead will be revealed.|
| --- |
| ![image](https://user-images.githubusercontent.com/39062670/164874986-a858d708-3cb4-4af7-b92b-75bdbccf9dbb.png) |
| ![image](https://user-images.githubusercontent.com/39062670/164875654-5d97d19c-894d-4b24-8a89-1697dc8de8b7.png) |

|If there were any enemies, their location would've been revealed as well, represented by the "♠" symbol |
| --- |
| ![image](https://user-images.githubusercontent.com/39062670/164876485-bc7c01ef-34eb-4a93-b181-90fa99dd882c.png) |

| A cleared dungeon |
| --- |
| ![image](https://user-images.githubusercontent.com/39062670/164876786-5624f726-824e-4e9e-80f8-c92bc238bf98.png) |

#### Encountering an enemy

When an enemy is ran into, unexpectedly or not (when the enemy location is revealed, every entity in combat will have a fair start, else, it would be an "ambush", where the enemies will have 3 *Swords*, *Shields*, *Sprints*, full Readiness, to start), the player will enter combat.

| A Normal Encounter |
| --- |
| ![image](https://user-images.githubusercontent.com/39062670/164997858-a56fece0-e4ec-4f88-bd87-ea842e5c9889.png) |

| An Ambush, where the player ran into an enemy without revealing their location |
| --- |
| ![image](https://user-images.githubusercontent.com/39062670/163757362-c7ae5e1a-7ee8-49e4-b5b0-eeead6a03f95.png) |

The bot, given administrative powers in the Discord server, will then create a private text channel named after the Discord user's unique identification number, in which the player's control panel will reside.

| ![image](https://user-images.githubusercontent.com/39062670/164998291-37bb9ed7-6114-4542-ae22-a1406957d598.png)|
| - |
| ![image](https://user-images.githubusercontent.com/39062670/163757466-6092ff8d-7ce4-44e2-a16b-a14e53f40ecb.png)|

### Combat
The combat system has evolved [over my years of role-playing](https://docs.google.com/document/d/18vgB1IHM3dt2d_LvsGOtGUaINESZtlxuH07klgowGpQ/edit?usp=sharing). A lot of complexities had been removed to encourage a simple-to-learn yet difficult-to-master system. The character stat contains _HP_, _Readiness_, and three major _Tokens_: _Sword_, _Shield_, and _Sprint_. When the player uses an ability that their class has, it will consume one or more of these stats. All offensive abilities will damage the target's HP (which, when reaching 0 or below, kills the target). Readiness determines the order of actions (e.g., Aaron has 15 Readiness and Bob has 10 Readiness. They both try to attack each other. Aaron will attack first). Swords are essential for using most offensive abilities. Shields are used to reduce damage taken when attacked. Sprints allow the player to move more than just once per turn. 

#### Various Path-finding Enemies
Enemies have their unique path-finding AIs depending on their class. Most simply **find the closest path towards the player** (A* Algorithm, a modified version of Dijkstra's Algorithm). Some enemies don't have offensive abilities, therefore, they rely on **finding the best way to position themselves for their friendly abilities to land on the most allies as possible**. In a work-in-progress enemy AI (an enemy coded in JavaScript, version 3. Note that the content of this page is version 4, which uses "canvas" API to draw the map instead of lining up Discord custom emojis), four units would try to come together with one assigned as the "captain". The other three would try to surround the one in the middle. Once the captain detects that every other units are in formation, the captain would transform into a stronger monster and killing all of its friends. This was inspired by body-horror movies like "The Thing". Details of the code could be found [here](https://replit.com/@ikech/DISCORDBOTV3HIVEMIND#index.js).

| "Strange Meat" marching together to form a cross. (version 3)         |
| --- |
| ![](https://user-images.githubusercontent.com/39062670/164554688-a15596d6-e360-411f-a662-62560be97b0c.png) |

| The crosses represent perished entities. "The Thing" had just spawned from consuming its former friends. (version 3) |
| --- |
| ![image](https://user-images.githubusercontent.com/39062670/164555730-bb4adf88-f74d-4615-88b7-f89a5519018a.png) |

| "The Thing" attempting to attack our character, using the same ability that consumed its friends. (version 3) |
| --- |
|![image](https://user-images.githubusercontent.com/39062670/164555918-33cb6624-8cf9-4acb-953e-bfca50fe8f24.png)|

#### Canvas-Drawn Attack/Movement Mapping
When attempting to represent the actions of both players and enemies, the bot went through several iterations of representations throughout the years. At the beginning, it was only words, but as the demand of the users grew larger, I opted for a more graphical representation, first using custom Discord emotes (version 3), and then Canvas image (version 4).

| Version 2 (Radar Vision) |
| - |
| ![image](https://user-images.githubusercontent.com/39062670/164882467-07ba288a-dd3a-4f6c-8c1b-bb79242f2f66.png) |

| Version 3 (Graphics using Emojis) |
| - |
| ![image](https://user-images.githubusercontent.com/39062670/164883892-5dc3eadf-3195-4c44-b04c-860d0a23265e.png) |

| Version 4 (Graphics using Canvas API) |
| - |
| ![image](https://user-images.githubusercontent.com/39062670/164877544-365febf3-3ecc-461c-8da9-96a1f45c3c24.png) |

### RPG Elements
#### Looting Monsters
When a monster perishes, a player can walk on top of its tile and pick up its remains. In this game, the "loot" of monsters will not consist of singular items, but a complex compound of materials, randomly generated when the monster perishes. 

##### Rarity

#### Crafting Weapons
