# DiscordBot_v4

Welcome to my project description for this ambitious project of mine. I spent around a total of three years trying to revamp and perfect my vision, but decided that this would probably lead to never finishing the project. Therefore, I have decided to release it before completion. Here is what the project has to offer:

## Vision
The Discord bot came from a desire to gamify combat situations during group ["roleplays"](https://www.google.com/search?client=opera-gx&q=role+play+definition&sourceid=opera&ie=UTF-8&oe=UTF-8). It took inspiration from the Fire Emblem series, implementing top-down 2D movement and a turn-based battle. The direction of the bot eventually turned into a RPG game, with less of a focus on character-based combat and more of a class-based combat, fighting random monsters, seizing their treasures, and making new weapons out of them.

## Highlights
### Embark on an Adventure
![image](https://user-images.githubusercontent.com/39062670/163757057-f3fdc665-1c4b-401f-b766-667682dca131.png)
After entering the command ";go \[specified location]", the bot will send an embedded Discord text message that allows the user to go in any directions in the randomly-generated dungeon (Dungeons are randomly generated with code in class "Dungeon", static function named "Generate"). When traversing the dungeon, the player and their party could possibly encounter enemies and trigger a battle. 
![image](https://user-images.githubusercontent.com/39062670/163757362-c7ae5e1a-7ee8-49e4-b5b0-eeead6a03f95.png)
The bot, given administrative powers in the Discord server, will then create a text channel, in which the player's control panel will reside.
![image](https://user-images.githubusercontent.com/39062670/163757466-6092ff8d-7ce4-44e2-a16b-a14e53f40ecb.png)

### Combat
The combat system has evolved [over my years of role-playing](https://docs.google.com/document/d/18vgB1IHM3dt2d_LvsGOtGUaINESZtlxuH07klgowGpQ/edit?usp=sharing). A lot of complexities had been removed to encourage a simple-to-learn yet difficult-to-master system. The character stat contains _HP_, _Readiness_, and three major _Tokens_: _Sword_, _Shield_, and _Sprint_. When the player uses an ability that their class has, it will consume one or more of these stats. All offensive abilities will damage the target's HP (which, when reaching 0 or below, kills the target). Readiness determines the order of actions (e.g., Aaron has 15 Readiness and Bob has 10 Readiness. They both try to attack each other. Aaron will attack first). Swords are essential for using most offensive abilities. Shields are used to reduce damage taken when attacked. Sprints allow the player to move more than just once per turn. 

### Path-finding Enemies
Enemies have their unique path-finding AIs depending on their class. Most simply finding the closest path towards the player (A* Algorithm, a modified version of Dijkstra's Algorithm). Some enemies don't have offensive abilities, therefore, they rely on finding the best way to position themselves for their friendly abilities to land on the most allies as possible. 
