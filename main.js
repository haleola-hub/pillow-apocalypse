// =============================================================================
// PILLOW APOCALYPSE — by Austin (age 9)
// Slice 2: 6 boss tiers (Dorm → California King), inventory carries over,
//          crafting hotkeys Q E R T (and 1 2 3 4 also work)
//
// HOW TO TWEAK THE GAME:
//   - Change CONFIG values to make the game easier/harder
//   - Edit BOSS_TIERS to change boss stats / order
//   - Edit RECIPES to change what crafting needs
// =============================================================================

const CONFIG = {
  WORLD_WIDTH: 1000,
  WORLD_HEIGHT: 700,

  PLAYER_SPEED: 220,
  PLAYER_HP: 5,
  PLAYER_INVULN_SEC: 1.0,

  // Punch (default attack)
  PUNCH_RANGE: 70,
  PUNCH_DAMAGE: 1,
  PUNCH_COOLDOWN: 0.28,

  // Sword auto-replaces punch when crafted
  SWORD_RANGE: 105,
  SWORD_DAMAGE: 2,

  // Bow shoots arrows with F (only if crafted)
  BOW_COOLDOWN: 0.40,
  ARROW_SPEED: 700,
  ARROW_DAMAGE: 1,
  ARROW_LIFE: 1.6,

  // Shield: chance to fully block a hit
  SHIELD_BLOCK_CHANCE: 0.40,

  // Wings: passive movement boost + immunity to non-boss damage
  WINGS_SPEED_MULT: 1.6,

  PILLOW_SPEED: 70,
  PILLOW_HP: 1,
  PILLOW_DAMAGE: 1,
  PILLOW_SPAWN_SEC: 1.2,
  PILLOWS_TO_BOSS: 10,

  // Drop chances per pillow kill (first feather is guaranteed)
  BONUS_FEATHER_CHANCE: 0.50,
  HEART_DROP_CHANCE:    0.30,
  STRING_DROP_CHANCE:   0.35,
};

// All 6 boss tiers — stats scale up
const BOSS_TIERS = [
  { name: "Dorm Bed",        hp: 6,  speed: 55, damage: 2, size: [150, 95],  emojiSize: 48,
    drops: { wood: 1, feathers: 5 } },
  { name: "Twin Bed",        hp: 9,  speed: 58, damage: 2, size: [180, 115], emojiSize: 56,
    drops: { wood: 2, feathers: 5 } },
  { name: "Full Bed",        hp: 13, speed: 60, damage: 3, size: [215, 135], emojiSize: 64,
    drops: { wood: 2, feathers: 7, string: 1 } },
  { name: "Queen Bed",       hp: 18, speed: 62, damage: 3, size: [255, 160], emojiSize: 72,
    drops: { wood: 3, feathers: 8, string: 2 } },
  { name: "King Bed",        hp: 24, speed: 65, damage: 4, size: [295, 185], emojiSize: 84,
    drops: { wood: 3, feathers: 10, string: 2 } },
  { name: "California King", hp: 32, speed: 68, damage: 4, size: [330, 210], emojiSize: 96,
    drops: { wood: 4, feathers: 12, string: 3 } },
];

// Materials enemies drop and pickup behavior
const ITEMS = {
  feather: { glyph: "🪶", color: [250, 250, 250], stat: "feathers" },
  heart:   { glyph: "❤", color: [255, 80, 100],  heal: true        },
  string:  { glyph: "🧵", color: [230, 200, 160], stat: "string"   },
  wood:    { glyph: "🪵", color: [160, 110, 70],  stat: "wood"     },
};

// Crafting recipes — Austin's spec
const RECIPES = {
  wings: {
    label: "Wings",
    glyph: "🪽",
    cost: { feathers: 10 },
    flag: "hasWings",
    desc: "Fly 60% faster + pillows can't touch you",
  },
  sword: {
    label: "Sword",
    glyph: "⚔️",
    cost: { feathers: 10, wood: 1 },
    flag: "hasSword",
    desc: "Bigger swing, double damage",
  },
  shield: {
    label: "Shield",
    glyph: "🛡️",
    cost: { wood: 3 },
    flag: "hasShield",
    desc: "40% chance to block any hit",
  },
  bow: {
    label: "Bow & Arrow",
    glyph: "🏹",
    cost: { feathers: 1, string: 1, wood: 2 },
    flag: "hasBow",
    desc: "Press F to shoot arrows",
  },
};

// Hotkey -> recipe (each recipe gets a letter AND a number, for reliability)
const CRAFT_KEYS = {
  wings:  { letter: "q", digit: "1" },
  sword:  { letter: "e", digit: "2" },
  shield: { letter: "r", digit: "3" },
  bow:    { letter: "t", digit: "4" },
};

// =============================================================================
// INIT
// =============================================================================
kaboom({
  width: CONFIG.WORLD_WIDTH,
  height: CONFIG.WORLD_HEIGHT,
  background: [55, 60, 75],
  letterbox: true,
  global: true,
  crisp: true,
});

function formatCost(cost) {
  return Object.entries(cost)
    .map(([stat, qty]) => qty + " " + ITEMS[stat === "feathers" ? "feather" : stat].glyph)
    .join("  ");
}

function emptyInventory() {
  return {
    feathers: 0, wood: 0, string: 0,
    hasWings: false, hasSword: false, hasShield: false, hasBow: false,
  };
}

// =============================================================================
// TITLE SCENE
// =============================================================================
scene("title", () => {
  // Decorative pillow stack across the top
  for (let i = 0; i < 6; i++) {
    add([
      rect(120 + i * 20, 28, { radius: 14 }),
      pos(width() / 2, 50 + i * 30),
      anchor("center"),
      color(245 - i * 8, 245 - i * 8, 250 - i * 4),
      outline(2, rgb(170, 170, 190)),
      opacity(0.35),
    ]);
  }

  // Title
  add([
    text("PILLOW APOCALYPSE", { size: 60 }),
    pos(width() / 2, 270),
    anchor("center"),
    color(255, 180, 100),
    outline(3, rgb(90, 40, 20)),
  ]);
  add([
    text("Survive. Gather. Craft. Beat all 6 bosses.", { size: 22 }),
    pos(width() / 2, 320),
    anchor("center"),
    color(220, 220, 220),
  ]);

  // Controls panel
  const panelY = 480;
  const panelW = 720;
  const panelH = 230;
  add([
    rect(panelW, panelH, { radius: 14 }),
    pos(width() / 2, panelY),
    anchor("center"),
    color(25, 28, 38),
    outline(2, rgb(90, 90, 120)),
    opacity(0.92),
  ]);
  add([
    text("CONTROLS", { size: 22 }),
    pos(width() / 2, panelY - panelH / 2 + 24),
    anchor("center"),
    color(255, 200, 100),
  ]);

  // Two columns of key bindings
  const colLeftKeyX  = width() / 2 - 200;
  const colLeftLblX  = width() / 2 - 175;
  const colRightKeyX = width() / 2 + 60;
  const colRightLblX = width() / 2 + 85;
  const rowsTop = panelY - 60;
  const rowH    = 28;

  const leftRows = [
    ["WASD / Arrows", "Move"],
    ["SPACE",          "Attack (punch / sword)"],
    ["F",              "Shoot bow"],
    ["P",              "Pause"],
  ];
  const rightRows = [
    ["Q",  "Craft 🪽 Wings"],
    ["E",  "Craft ⚔️ Sword"],
    ["R",  "Craft 🛡️ Shield"],
    ["T",  "Craft 🏹 Bow"],
  ];

  for (let i = 0; i < leftRows.length; i++) {
    add([
      text(leftRows[i][0], { size: 16 }),
      pos(colLeftKeyX, rowsTop + i * rowH),
      anchor("right"),
      color(255, 230, 130),
    ]);
    add([
      text(leftRows[i][1], { size: 16 }),
      pos(colLeftLblX, rowsTop + i * rowH),
      anchor("left"),
      color(220, 220, 220),
    ]);
  }
  for (let i = 0; i < rightRows.length; i++) {
    add([
      text(rightRows[i][0], { size: 16 }),
      pos(colRightKeyX, rowsTop + i * rowH),
      anchor("right"),
      color(255, 230, 130),
    ]);
    add([
      text(rightRows[i][1], { size: 16 }),
      pos(colRightLblX, rowsTop + i * rowH),
      anchor("left"),
      color(220, 220, 220),
    ]);
  }

  add([
    text("Press SPACE to start", { size: 28 }),
    pos(width() / 2, 635),
    anchor("center"),
    color(255, 255, 100),
  ]);
  add([
    text("a game by Austin", { size: 16 }),
    pos(width() / 2, height() - 22),
    anchor("center"),
    color(140, 140, 160),
  ]);

  onKeyPress("space", () => go("game", { level: 1, inventory: emptyInventory() }));
});

// =============================================================================
// GAME SCENE — handles ALL levels (1 through 6)
// =============================================================================
scene("game", ({ level = 1, inventory = null } = {}) => {
  const inv = inventory || emptyInventory();
  const tier = BOSS_TIERS[Math.min(level - 1, BOSS_TIERS.length - 1)];

  const state = {
    level,
    pillowsKilled: 0,
    feathers: inv.feathers,
    wood: inv.wood,
    string: inv.string,
    hasWings: inv.hasWings,
    hasSword: inv.hasSword,
    hasShield: inv.hasShield,
    hasBow: inv.hasBow,
    bossSpawned: false,
    bossDead: false,
    paused: false,
    player: null,
    facing: vec2(1, 0),
    punchCooldown: 0,
    bowCooldown: 0,
    invulnTimer: 0,
  };

  // ---- Buildings ----
  const buildings = [
    [120, 110, 140, 130, [220, 200, 230]],
    [740, 110, 140, 130, [200, 220, 230]],
    [120, 460, 140, 130, [230, 215, 200]],
    [740, 460, 140, 130, [210, 230, 215]],
    [430, 70, 140, 70, [230, 200, 215]],
    [430, 560, 140, 70, [215, 220, 235]],
  ];
  for (const [x, y, w, h, [r, g, b]] of buildings) {
    add([
      rect(w, h, { radius: 16 }),
      pos(x, y),
      color(r, g, b),
      outline(3, rgb(120, 100, 130)),
    ]);
  }

  // ---- Level intro splash ----
  add([
    text("LEVEL " + level, { size: 64 }),
    pos(width() / 2, height() / 2 - 30),
    anchor("center"),
    color(255, 255, 120),
    outline(3, rgb(80, 50, 0)),
    lifespan(1.6, { fade: 1.0 }),
  ]);
  add([
    text("Boss: " + tier.name, { size: 26 }),
    pos(width() / 2, height() / 2 + 30),
    anchor("center"),
    color(220, 220, 220),
    lifespan(1.6, { fade: 1.0 }),
  ]);

  // ---- PLAYER ----
  const player = add([
    rect(36, 36, { radius: 6 }),
    pos(width() / 2, height() / 2),
    anchor("center"),
    color(80, 160, 255),
    outline(3, rgb(20, 60, 140)),
    area(),
    health(CONFIG.PLAYER_HP),
    "player",
    { maxHp: CONFIG.PLAYER_HP },
  ]);
  state.player = player;
  player.add([text("😠", { size: 22 }), anchor("center")]);
  // Carry-over wings indicator
  if (state.hasWings) {
    player.add([text("🪽", { size: 22 }), anchor("center"), pos(0, -28)]);
  }

  // ---- MOVEMENT ----
  const moveKeys = [
    { keys: ["a", "left"], dir: vec2(-1, 0) },
    { keys: ["d", "right"], dir: vec2(1, 0) },
    { keys: ["w", "up"], dir: vec2(0, -1) },
    { keys: ["s", "down"], dir: vec2(0, 1) },
  ];

  onUpdate(() => {
    if (state.paused) return;
    let moveDir = vec2(0, 0);
    for (const { keys, dir } of moveKeys) {
      for (const k of keys) if (isKeyDown(k)) moveDir = moveDir.add(dir);
    }
    if (moveDir.x !== 0 || moveDir.y !== 0) {
      moveDir = moveDir.unit();
      state.facing = moveDir;
      const speed = state.hasWings
        ? CONFIG.PLAYER_SPEED * CONFIG.WINGS_SPEED_MULT
        : CONFIG.PLAYER_SPEED;
      player.move(moveDir.scale(speed));
    }
    player.pos.x = Math.max(20, Math.min(width() - 20, player.pos.x));
    player.pos.y = Math.max(20, Math.min(height() - 20, player.pos.y));

    if (state.punchCooldown > 0) state.punchCooldown -= dt();
    if (state.bowCooldown > 0) state.bowCooldown -= dt();
    if (state.invulnTimer > 0) state.invulnTimer -= dt();
  });

  // ---- ATTACK (SPACE) — punch, or sword swing if crafted ----
  onKeyPress("space", () => {
    if (state.paused) return;

    // After boss death, SPACE advances to the next level (or final win)
    if (state.bossDead) {
      const carry = {
        feathers: state.feathers, wood: state.wood, string: state.string,
        hasWings: state.hasWings, hasSword: state.hasSword,
        hasShield: state.hasShield, hasBow: state.hasBow,
      };
      if (state.level >= BOSS_TIERS.length) {
        go("win", carry);
      } else {
        go("game", { level: state.level + 1, inventory: carry });
      }
      return;
    }

    if (state.punchCooldown > 0) return;
    state.punchCooldown = CONFIG.PUNCH_COOLDOWN;

    const range = state.hasSword ? CONFIG.SWORD_RANGE : CONFIG.PUNCH_RANGE;
    const damage = state.hasSword ? CONFIG.SWORD_DAMAGE : CONFIG.PUNCH_DAMAGE;
    const punchPos = player.pos.add(state.facing.scale(40));

    add([
      circle(state.hasSword ? 44 : 30),
      pos(punchPos),
      anchor("center"),
      color(...(state.hasSword ? [220, 235, 250] : [255, 255, 200])),
      opacity(0.85),
      lifespan(0.18, { fade: 0.12 }),
    ]);

    get("pillow").forEach((pillow) => {
      if (pillow.pos.dist(punchPos) < range) damageEnemy(pillow, damage);
    });
    get("boss").forEach((boss) => {
      if (boss.pos.dist(punchPos) < range + 30) damageEnemy(boss, damage);
    });
  });

  // ---- BOW (F) ----
  onKeyPress("f", () => {
    if (state.paused) return;
    if (state.bossDead) return;
    if (!state.hasBow) {
      showFloating(player.pos.add(vec2(0, -40)), "Need a 🏹 Bow!", rgb(255, 150, 150));
      return;
    }
    if (state.bowCooldown > 0) return;
    state.bowCooldown = CONFIG.BOW_COOLDOWN;

    const dir = state.facing.unit();
    const angleDeg = Math.atan2(dir.y, dir.x) * 180 / Math.PI;
    const arrow = add([
      rect(24, 5, { radius: 2 }),
      pos(player.pos.add(dir.scale(28))),
      anchor("center"),
      rotate(angleDeg),
      color(160, 110, 70),
      outline(1, rgb(60, 40, 20)),
      area(),
      move(dir, CONFIG.ARROW_SPEED),
      lifespan(CONFIG.ARROW_LIFE),
      "arrow",
    ]);
    arrow.onCollide("enemy", (e) => {
      damageEnemy(e, CONFIG.ARROW_DAMAGE);
      destroy(arrow);
    });
  });

  // ---- CRAFTING (letter + digit alternative) ----
  for (const [name, hotkeys] of Object.entries(CRAFT_KEYS)) {
    const handler = () => {
      if (state.paused) return;
      tryCraft(name);
    };
    onKeyPress(hotkeys.letter, handler);
    onKeyPress(hotkeys.digit, handler);
  }

  function tryCraft(name) {
    const recipe = RECIPES[name];
    if (state[recipe.flag]) {
      showFloating(player.pos.add(vec2(0, -40)),
        "Already have " + recipe.glyph, rgb(180, 180, 180));
      return;
    }
    for (const [stat, qty] of Object.entries(recipe.cost)) {
      if (state[stat] < qty) {
        showFloating(player.pos.add(vec2(0, -40)),
          "Need: " + formatCost(recipe.cost), rgb(255, 150, 150));
        return;
      }
    }
    for (const [stat, qty] of Object.entries(recipe.cost)) {
      state[stat] -= qty;
    }
    state[recipe.flag] = true;
    onCrafted(name);
  }

  function onCrafted(name) {
    const recipe = RECIPES[name];
    add([
      text(recipe.glyph + "  " + recipe.label.toUpperCase() + " CRAFTED!", { size: 34 }),
      pos(width() / 2, height() / 2 - 40),
      anchor("center"),
      color(255, 255, 120),
      outline(3, rgb(80, 50, 0)),
      lifespan(2.0, { fade: 1.2 }),
    ]);
    add([
      text(recipe.desc, { size: 22 }),
      pos(width() / 2, height() / 2 + 5),
      anchor("center"),
      color(220, 220, 220),
      lifespan(2.0, { fade: 1.2 }),
    ]);
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      add([
        circle(5),
        pos(player.pos),
        color(255, 255, 200),
        opacity(1),
        move(vec2(Math.cos(angle), Math.sin(angle)), 200),
        lifespan(0.7, { fade: 0.5 }),
      ]);
    }
    if (name === "wings") {
      player.add([text("🪽", { size: 22 }), anchor("center"), pos(0, -28)]);
    }
  }

  // ---- ENEMY SPAWNING ----
  loop(CONFIG.PILLOW_SPAWN_SEC, () => {
    if (state.paused) return;
    if (state.bossSpawned) return;
    if (state.pillowsKilled >= CONFIG.PILLOWS_TO_BOSS) return;
    spawnPillow();
  });
  spawnPillow();
  spawnPillow();

  function spawnPillow() {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * width(); y = -20; }
    else if (edge === 1) { x = width() + 20; y = Math.random() * height(); }
    else if (edge === 2) { x = Math.random() * width(); y = height() + 20; }
    else { x = -20; y = Math.random() * height(); }

    add([
      rect(32, 24, { radius: 8 }),
      pos(x, y),
      anchor("center"),
      color(248, 248, 252),
      outline(2, rgb(180, 180, 190)),
      area(),
      health(CONFIG.PILLOW_HP),
      "pillow",
      "enemy",
      { speed: CONFIG.PILLOW_SPEED },
    ]);
  }

  onUpdate("enemy", (e) => {
    if (state.paused) return;
    if (!player.exists()) return;
    const dir = player.pos.sub(e.pos).unit();
    e.move(dir.scale(e.speed));
  });

  // ---- ENEMY HITS PLAYER ----
  player.onCollide("enemy", (e) => {
    if (state.invulnTimer > 0) return;
    if (state.hasWings && !e.is("boss")) return;

    if (state.hasShield && Math.random() < CONFIG.SHIELD_BLOCK_CHANCE) {
      showFloating(player.pos.add(vec2(0, -40)), "🛡️ BLOCKED!", rgb(120, 200, 255));
      state.invulnTimer = CONFIG.PLAYER_INVULN_SEC * 0.5;
      return;
    }

    const dmg = e.is("boss") ? tier.damage : CONFIG.PILLOW_DAMAGE;
    player.hurt(dmg);
    state.invulnTimer = CONFIG.PLAYER_INVULN_SEC;
    player.color = rgb(255, 100, 100);
    wait(0.18, () => { if (player.exists()) player.color = rgb(80, 160, 255); });
    if (player.hp() <= 0) {
      go("gameover", {
        level: state.level,
        feathers: state.feathers, wood: state.wood, string: state.string,
      });
    }
  });

  // ---- ITEM PICKUP ----
  player.onCollide("item", (item) => {
    const def = ITEMS[item.itemKey];
    if (def.heal) {
      if (player.hp() < player.maxHp) player.heal(1);
    } else if (def.stat) {
      state[def.stat] += 1;
    }
    destroy(item);
  });

  // ---- DAMAGE & DEATH ----
  function damageEnemy(e, amount) {
    if (e.invuln) return;
    e.hurt(amount);
    if (e.is("boss")) {
      e.invuln = true;
      e.color = rgb(255, 130, 130);
      wait(0.18, () => {
        if (e.exists()) {
          e.color = rgb(...e.baseColor);
          e.invuln = false;
        }
      });
      if (e.hp() <= 0) onBossDeath(e);
    } else if (e.hp() <= 0) {
      onPillowDeath(e);
    }
  }

  function onPillowDeath(pillow) {
    poof(pillow.pos);
    dropPillowLoot(pillow.pos);
    destroy(pillow);
    state.pillowsKilled++;
    if (state.pillowsKilled >= CONFIG.PILLOWS_TO_BOSS && !state.bossSpawned) {
      get("pillow").forEach(destroy);
      spawnBoss();
    }
  }

  function onBossDeath(boss) {
    poof(boss.pos, 40);
    const bossPos = boss.pos.clone();
    destroy(boss);

    // Auto-credit boss loot
    let lootText = "LOOT  ";
    for (const [stat, qty] of Object.entries(tier.drops)) {
      state[stat] += qty;
      const itemKey = stat === "feathers" ? "feather" : stat;
      lootText += "+" + qty + " " + ITEMS[itemKey].glyph + "  ";
    }

    add([
      text(lootText.trim(), { size: 32 }),
      pos(bossPos),
      anchor("center"),
      color(255, 230, 100),
      outline(3, rgb(80, 50, 0)),
      move(vec2(0, -1), 50),
      lifespan(3.5, { fade: 2.0 }),
    ]);

    state.bossDead = true;
  }

  function poof(p, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 90 + Math.random() * 70;
      add([
        circle(4 + Math.random() * 4),
        pos(p),
        color(255, 255, 255),
        opacity(0.95),
        move(vec2(Math.cos(angle), Math.sin(angle)), speed),
        lifespan(0.45, { fade: 0.3 }),
      ]);
    }
  }

  function dropPillowLoot(p) {
    spawnPickup(p, "feather");
    if (Math.random() < CONFIG.BONUS_FEATHER_CHANCE) {
      spawnPickup(p.add(vec2(28, 14)), "feather");
    }
    if (Math.random() < CONFIG.HEART_DROP_CHANCE) {
      spawnPickup(p.add(vec2(22, 0)), "heart");
    }
    if (Math.random() < CONFIG.STRING_DROP_CHANCE) {
      spawnPickup(p.add(vec2(-22, 0)), "string");
    }
  }

  function spawnPickup(p, key) {
    const def = ITEMS[key];
    const pickup = add([
      circle(11),
      pos(p),
      anchor("center"),
      color(...def.color),
      outline(2, rgb(40, 40, 50)),
      area(),
      "item",
      { itemKey: key },
    ]);
    pickup.add([text(def.glyph, { size: 14 }), anchor("center")]);
  }

  function showFloating(p, msg, col) {
    add([
      text(msg, { size: 18 }),
      pos(p),
      anchor("center"),
      color(col),
      outline(2, rgb(0, 0, 0)),
      move(vec2(0, -1), 40),
      lifespan(1.0, { fade: 0.6 }),
    ]);
  }

  function spawnBoss() {
    state.bossSpawned = true;
    add([
      text("THE " + tier.name.toUpperCase() + " APPROACHES", { size: 36 }),
      pos(width() / 2, height() / 2),
      anchor("center"),
      color(255, 90, 90),
      outline(3, rgb(60, 0, 0)),
      lifespan(2.0, { fade: 1.0 }),
    ]);
    wait(1.6, () => {
      // Color darkens slightly per tier
      const baseColor = [
        Math.max(80, 180 - state.level * 12),
        Math.max(60, 130 - state.level * 9),
        Math.max(40, 90 - state.level * 7),
      ];
      const boss = add([
        rect(tier.size[0], tier.size[1], { radius: 14 }),
        pos(width() / 2, -tier.size[1] / 2),
        anchor("center"),
        color(...baseColor),
        outline(4, rgb(60, 30, 20)),
        area(),
        health(tier.hp),
        "boss",
        "enemy",
        { speed: tier.speed, invuln: false, maxHp: tier.hp, baseColor },
      ]);
      boss.add([text("🛏️", { size: tier.emojiSize }), anchor("center")]);
    });
  }

  // ---- PAUSE ----
  onKeyPress("p", () => {
    state.paused = !state.paused;
    if (state.paused) {
      add([
        text("PAUSED\n(press P to resume)", { size: 40, align: "center" }),
        pos(width() / 2, height() / 2),
        anchor("center"),
        color(255, 255, 100),
        "pauseLabel",
      ]);
    } else {
      get("pauseLabel").forEach(destroy);
    }
  });

  // ---- HUD ----
  onDraw(() => {
    // HP hearts (top-left)
    for (let i = 0; i < player.maxHp; i++) {
      drawText({
        text: i < player.hp() ? "❤️" : "🖤",
        size: 28,
        pos: vec2(20 + i * 36, 20),
      });
    }

    // Resources (top-right)
    drawText({
      text: "🪶 " + state.feathers + "   🪵 " + state.wood + "   🧵 " + state.string,
      size: 22,
      pos: vec2(width() - 20, 20),
      anchor: "topright",
      color: rgb(255, 255, 255),
    });

    // Equipped row (under resources)
    let eq = "";
    if (state.hasWings)  eq += "🪽 ";
    if (state.hasSword)  eq += "⚔️ ";
    if (state.hasShield) eq += "🛡️ ";
    if (state.hasBow)    eq += "🏹 ";
    if (eq) {
      drawText({
        text: "Equipped: " + eq.trim(),
        size: 20,
        pos: vec2(width() - 20, 56),
        anchor: "topright",
        color: rgb(255, 230, 130),
      });
    }

    // Center HUD
    if (state.bossDead) {
      const isFinal = state.level >= BOSS_TIERS.length;
      drawText({
        text: isFinal
          ? "FINAL VICTORY! Press SPACE"
          : "LEVEL " + state.level + " CLEARED — SPACE for Level " + (state.level + 1),
        size: 22, pos: vec2(width()/2, 20), anchor: "top", color: rgb(120, 255, 130),
      });
      drawText({
        text: "(Craft now while you can — Q E R T)",
        size: 16, pos: vec2(width()/2, 50), anchor: "top", color: rgb(180, 220, 180),
      });
    } else if (state.bossSpawned) {
      const boss = get("boss")[0];
      if (boss) {
        drawText({
          text: tier.name.toUpperCase() + "   HP: " + boss.hp() + " / " + boss.maxHp,
          size: 24, pos: vec2(width()/2, 25), anchor: "top", color: rgb(255, 100, 100),
        });
      }
    } else {
      drawText({
        text: "LVL " + state.level + " — Pillows: " + state.pillowsKilled + " / " + CONFIG.PILLOWS_TO_BOSS,
        size: 22, pos: vec2(width()/2, 25), anchor: "top", color: rgb(255, 255, 255),
      });
    }

    // Crafting hint bar (bottom)
    drawRect({
      width: width(),
      height: 60,
      pos: vec2(0, height() - 60),
      color: rgb(20, 22, 30),
      opacity: 0.85,
    });
    let x = 12;
    for (const [name, hotkeys] of Object.entries(CRAFT_KEYS)) {
      const recipe = RECIPES[name];
      const has = state[recipe.flag];
      const can = !has &&
        Object.entries(recipe.cost).every(([s, q]) => state[s] >= q);
      const labelTxt = "[" + hotkeys.letter.toUpperCase() + "] " + recipe.glyph + " " + formatCost(recipe.cost);
      drawText({
        text: has ? "✓ " + recipe.glyph + " " + recipe.label : labelTxt,
        size: 17,
        pos: vec2(x, height() - 40),
        color: has ? rgb(150, 220, 150) : (can ? rgb(255, 255, 120) : rgb(140, 140, 160)),
      });
      x += 240;
    }
    drawText({
      text: state.hasBow ? "[F] Shoot 🏹" : "[F] Shoot (need bow)",
      size: 17,
      pos: vec2(width() - 12, height() - 40),
      anchor: "topright",
      color: state.hasBow ? rgb(255, 220, 120) : rgb(120, 120, 140),
    });
  });
});

// =============================================================================
// GAMEOVER
// =============================================================================
scene("gameover", ({ level = 1, feathers = 0, wood = 0, string = 0 } = {}) => {
  add([
    text("YOU GOT SMOTHERED", { size: 56 }),
    pos(width() / 2, height() / 2 - 100),
    anchor("center"),
    color(255, 90, 90),
  ]);
  add([
    text("Made it to Level " + level, { size: 26 }),
    pos(width() / 2, height() / 2 - 30),
    anchor("center"),
    color(220, 220, 220),
  ]);
  add([
    text("🪶 " + feathers + "   🪵 " + wood + "   🧵 " + string, { size: 26 }),
    pos(width() / 2, height() / 2 + 20),
    anchor("center"),
    color(255, 255, 255),
  ]);
  add([
    text("Press SPACE to retry from Level 1", { size: 22 }),
    pos(width() / 2, height() / 2 + 110),
    anchor("center"),
    color(255, 255, 100),
  ]);
  onKeyPress("space", () => go("game", { level: 1, inventory: emptyInventory() }));
});

// =============================================================================
// FINAL WIN (after California King)
// =============================================================================
scene("win", ({ feathers = 0, wood = 0, string = 0,
  hasWings = false, hasSword = false, hasShield = false, hasBow = false } = {}) => {
  // Celebratory pillow shower
  for (let i = 0; i < 30; i++) {
    add([
      rect(32, 24, { radius: 8 }),
      pos(Math.random() * width(), -50 - Math.random() * 200),
      anchor("center"),
      color(248, 248, 252),
      outline(2, rgb(180, 180, 190)),
      move(vec2(0, 1), 60 + Math.random() * 80),
      rotate(Math.random() * 360),
      opacity(0.6),
      lifespan(8, { fade: 6 }),
    ]);
  }

  add([
    text("PILLOW APOCALYPSE", { size: 44 }),
    pos(width() / 2, height() / 2 - 200),
    anchor("center"),
    color(255, 200, 100),
  ]);
  add([
    text("DEFEATED!", { size: 80 }),
    pos(width() / 2, height() / 2 - 110),
    anchor("center"),
    color(120, 255, 140),
  ]);
  add([
    text("You toppled all 6 beds.\nThe city sleeps in peace.", { size: 22, align: "center" }),
    pos(width() / 2, height() / 2 - 10),
    anchor("center"),
    color(220, 220, 220),
  ]);
  add([
    text("🪶 " + feathers + "   🪵 " + wood + "   🧵 " + string, { size: 26 }),
    pos(width() / 2, height() / 2 + 70),
    anchor("center"),
    color(220, 220, 220),
  ]);
  let eq = "";
  if (hasWings)  eq += "🪽 ";
  if (hasSword)  eq += "⚔️ ";
  if (hasShield) eq += "🛡️ ";
  if (hasBow)    eq += "🏹 ";
  if (eq) {
    add([
      text("Crafted: " + eq.trim(), { size: 24 }),
      pos(width() / 2, height() / 2 + 110),
      anchor("center"),
      color(255, 230, 120),
    ]);
  }
  add([
    text("Press SPACE for New Game+\n(everything resets — try to do it faster)", {
      size: 22, align: "center",
    }),
    pos(width() / 2, height() / 2 + 190),
    anchor("center"),
    color(255, 255, 100),
  ]);
  onKeyPress("space", () => go("game", { level: 1, inventory: emptyInventory() }));
});

go("title");
