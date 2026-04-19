# Pillow Apocalypse

A video game by **Austin** (age 9). Built with Claude Code.

## How to Play

**Double-click `index.html`** — the game opens in your web browser.

(Needs an internet connection the first time, to download the game framework from a CDN.)

## Controls

| Action | Keys |
|---|---|
| Move | **WASD** or **Arrow Keys** |
| Punch | **SPACE** |
| Pause | **P** |

## The Story

A **pillow apocalypse** has hit the city. Every building is made of pillows. Couch pillows swarm at you from every direction. Punch them to make them poof — they drop hearts (heal) and coins (score).

Defeat **10 pillows** to summon the **Dorm Bed boss**. Beat the Dorm Bed to clear Level 1.

## What's Coming Next

This is **Slice 1** — the first playable version. Future slices:

- **Slice 2:** All 6 boss levels (Twin → Full → Queen → King → California King) + Austin's custom items
- **Slice 3:** Real pillow art instead of plain shapes
- **Slice 4:** Crafting — pick up parts, build swords and other weapons
- **Slice 5:** Sound effects and music
- **Slice 6:** Public link to share with friends
- **Slice 7:** Austin learns to edit the code himself

## Files

- `index.html` — opens the game
- `main.js` — all the game code

### For Austin: easy things to change

Open `main.js` in any text editor. At the very top is a `CONFIG` block. Try changing:

- `PLAYER_SPEED: 220` → make it `400` to run super fast
- `PLAYER_HP: 5` → make it `10` to be tougher
- `PILLOWS_TO_BOSS: 10` → make it `3` to fight the boss sooner
- `BOSS_HP: 6` → make it `2` to defeat the boss faster

Save and refresh the browser to see the change.
