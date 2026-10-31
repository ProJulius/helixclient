// Module metadata synced from cosmofn/helix-client at 65de2b327f183d1a01b8147807b2ec912ad1dba6.
window.HELIX_CONFIG = {
  "brand": {
    "name": "helixclient",
    "title": "Helix Client",
    "tagline": "Your game. Your advantage.",
    "footer": "A new perspective on your game.",
    "year": 2026,
    "colors": {
      "bg": "#18151c",
      "surface": "#252129",
      "border": "#39313d",
      "text": "#f1eaf1",
      "muted": "#aba0ad",
      "accent": "#f4add4",
      "accent2": "#e68fba"
    },
    "fonts": {
      "heading": "'DM Serif Display', Georgia, serif",
      "body": "'DM Sans', system-ui, sans-serif",
      "mono": "'Cascadia Code', Consolas, monospace"
    },
    "radius": "8px",
    "logo": "/helix-logo.png"
  },
  "product": {
    "moduleCount": 126,
    "moduleSuffix": "",
    "minecraft": "1.21.11",
    "version": "Release pending",
    "operatingSystems": [
      "Windows",
      "macOS",
      "Linux"
    ],
    "supportedOSConfirmed": false,
    "catalogIsPreview": false
  },
  "links": {
    "discord": "https://discord.gg/9EmjevPykx",
    "oauth": "/api/discord/login",
    "checkout": "https://helix-client.mysellauth.com/",
    "basicDownload": null,
    "premiumDownload": null,
    "submitSetup": null,
    "reviews": "https://helix-client.mysellauth.com/feedback"
  },
  "pricing": {
    "lifetimeEUR": 12.99,
    "dailyCents": 15,
    "monthlyIsExample": false,
    "daysInMonth": 30,
    "defaultDays": 30,
    "minimumDays": 1,
    "maximumDays": 365,
    "dayStep": 1,
    "defaultBilling": "lifetime"
  },
  "DEV_SAMPLE_DATA": false,
  "REVIEWS": [],
  "sampleReviews": [
    {
      "name": "Design preview",
      "date": "2026-10-01",
      "rating": 5,
      "text": "SAMPLE — An illustrative review for layout testing only."
    }
  ],
  "discord": {
    "apiBase": "/api/discord"
  },
  "releases": [],
  "categories": [
    {
      "id": "Combat",
      "icon": "crosshair",
      "subtitle": "Combat tools.",
      "summary": "Aim, timing and combat controls."
    },
    {
      "id": "Movement",
      "icon": "zap",
      "subtitle": "Move your way.",
      "summary": "Flight, movement and vehicle controls."
    },
    {
      "id": "Render",
      "icon": "eye",
      "subtitle": "A clearer view.",
      "summary": "World rendering, overlays and camera tools."
    },
    {
      "id": "Visuals",
      "icon": "sparkles",
      "subtitle": "Make it yours.",
      "summary": "Particles, animation, atmosphere and cosmetics."
    },
    {
      "id": "Misc",
      "icon": "sliders",
      "subtitle": "Everyday tools.",
      "summary": "Useful controls for your everyday sessions."
    },
    {
      "id": "Helix Client",
      "icon": "layout",
      "subtitle": "Your essentials.",
      "summary": "HUD, radar, maps, hotkeys and performance."
    },
    {
      "id": "Donut",
      "icon": "cube",
      "subtitle": "Donut tools.",
      "summary": "Server-specific helpers and utility modules."
    },
    {
      "id": "Base Finding",
      "icon": "search",
      "subtitle": "Find your next discovery.",
      "summary": "Scanning, storage and exploration tools."
    },
    {
      "id": "Macro",
      "icon": "keyboard",
      "subtitle": "Your routines.",
      "summary": "Auction, order, selling and teleport macros."
    }
  ],
  "modules": [
    {
      "id": "aim-assist",
      "name": "Aim Assist",
      "category": "Combat",
      "description": "Eases your crosshair onto the nearest enemy player while you move the mouse."
    },
    {
      "id": "anchor-macro",
      "name": "Anchor Macro",
      "category": "Combat",
      "description": "Press the bound key to instantly place, charge and detonate a respawn anchor."
    },
    {
      "id": "double-anchor",
      "name": "Double Anchor",
      "category": "Combat",
      "description": "Press the key to place, charge and air-place a second anchor for two explosions."
    },
    {
      "id": "safe-anchor",
      "name": "Safe Anchor",
      "category": "Combat",
      "description": "Silently places a blast-proof block between you and a respawn anchor so you take no damage."
    },
    {
      "id": "auto-xbow-cart",
      "name": "Auto Xbow Cart",
      "category": "Combat",
      "description": "Press the key to lay a rail and TNT minecart, then look at the block in front to light the cart and at the cart to shoot it."
    },
    {
      "id": "anchor-aura",
      "name": "Anchor Aura",
      "category": "Combat",
      "description": "Places, charges and detonates respawn anchors on nearby enemies."
    },
    {
      "id": "auto-crystal",
      "name": "Auto Crystal",
      "category": "Combat",
      "description": "Spams crystal breaks and placements while you hold left-click."
    },
    {
      "id": "crystal-aura",
      "name": "Crystal Aura",
      "category": "Combat",
      "description": "Places and breaks end crystals for the most damage."
    },
    {
      "id": "auto-city",
      "name": "Auto City",
      "category": "Combat",
      "description": "Mines a surround block of the best enemy in a hole, then turns off so Crystal Aura can blow through it."
    },
    {
      "id": "triggerbot",
      "name": "Triggerbot",
      "category": "Combat",
      "description": "Hits the entity under the crosshair once the swing is charged, with a reaction delay."
    },
    {
      "id": "kill-aura",
      "name": "Kill Aura",
      "category": "Combat",
      "description": "Silently tracks and attacks nearby targets within five blocks."
    },
    {
      "id": "shield-breaker",
      "name": "Shield Breaker",
      "category": "Combat",
      "description": "Swaps to an axe for any hit into a raised shield. Auto also makes the hit."
    },
    {
      "id": "mace",
      "name": "Mace",
      "category": "Combat",
      "description": "Swaps to the strongest mace for smash hits, with an optional smash assist."
    },
    {
      "id": "auto-mace",
      "name": "Auto Mace",
      "category": "Combat",
      "description": "Swaps to a mace and silently smashes nearby targets while falling."
    },
    {
      "id": "hovertotem",
      "name": "Hover Totem",
      "category": "Combat",
      "description": "Swaps a hovered totem from any open container into the offhand or selected hotbar slot."
    },
    {
      "id": "fastxp",
      "name": "FastXP",
      "category": "Combat",
      "description": "Throws experience bottles faster while use is held."
    },
    {
      "id": "autototem",
      "name": "Auto Totem",
      "category": "Combat",
      "description": "Fills an empty offhand with a totem without opening the inventory; Double Hand also keeps one in the main hand while in danger."
    },
    {
      "id": "autoinvtotem",
      "name": "Auto Inventory Totem",
      "category": "Combat",
      "description": "Refills the offhand totem after a pop through the inventory or a hotbar swap; Double Hand also keeps one in the main hand while in danger."
    },
    {
      "id": "w-tap-recode",
      "name": "W Tap",
      "category": "Combat",
      "description": "Resets your sprint right after a sprint hit so the next hit knocks back too."
    },
    {
      "id": "crystal-optimizer",
      "name": "Crystal Optimizer",
      "category": "Combat",
      "description": "Removes crystals client-side as soon as your hit breaks them."
    },
    {
      "id": "friend-guard",
      "name": "Friend Guard",
      "category": "Combat",
      "description": "Stops you from hitting players on your friends list."
    },
    {
      "id": "spear-swap",
      "name": "Spear Swap",
      "category": "Combat",
      "description": "Swaps to your Lunge spear and lunges. Reach Poke stabs with a spear past sword reach."
    },
    {
      "id": "jump-reset",
      "name": "Jump Reset",
      "category": "Combat",
      "description": "Jumps the tick knockback lands to take less of it."
    },
    {
      "id": "key-throw",
      "name": "Key Throw",
      "category": "Combat",
      "description": "Throws a pearl with a key, then selects your wind charges."
    },
    {
      "id": "legit-auto-tool",
      "name": "Legit Auto Tool",
      "category": "Misc",
      "description": "Auto tool that only switches hotbar slots like a player."
    },
    {
      "id": "durability-guard",
      "name": "Durability Guard",
      "category": "Misc",
      "description": "Blocks tool use at or below your remaining-durability threshold."
    },
    {
      "id": "auto-clicker",
      "name": "Auto Clicker",
      "category": "Misc",
      "description": "Clicks the left and/or right mouse button at a randomised, human CPS."
    },
    {
      "id": "fast-use",
      "name": "Fast Use",
      "category": "Misc",
      "description": "Places blocks and uses items faster while use is held."
    },
    {
      "id": "auto-eat",
      "name": "Auto Eat",
      "category": "Misc",
      "description": "Eats hotbar or offhand food once hunger or health drops too low."
    },
    {
      "id": "auto-replenish",
      "name": "Auto Replenish",
      "category": "Misc",
      "description": "Refills a hotbar or offhand slot from the main inventory once it runs low."
    },
    {
      "id": "auto-reconnect",
      "name": "Auto Reconnect",
      "category": "Misc",
      "description": "Reconnects to the last server after an unexpected disconnect."
    },
    {
      "id": "auto-base-hunter",
      "name": "Auto Base Hunter (Soon)",
      "category": "Base Finding",
      "description": "RTPs and mines to Y=-58, scoring underground regions for real bases."
    },
    {
      "id": "anti-vanish",
      "name": "Anti Vanish",
      "category": "Donut",
      "description": "Detects vanished players."
    },
    {
      "id": "player-detection",
      "name": "Player Detection",
      "category": "Donut",
      "description": "Detects when players are in the world."
    },
    {
      "id": "auto-relog",
      "name": "Auto Relog",
      "category": "Donut",
      "description": "Relogs when a real base is found below Y 10. Turns on Sus Chunk Finder tuned for base hunting."
    },
    {
      "id": "anti-trap",
      "name": "Anti Trap",
      "category": "Donut",
      "description": "Allows you to escape from armor stands and chest minecarts."
    },
    {
      "id": "air-stuck",
      "name": "Air Stuck",
      "category": "Donut",
      "description": "Freezes you in place, even mid-air."
    },
    {
      "id": "spawner-protect",
      "name": "Spawner Protect",
      "category": "Donut",
      "description": "Protects spawners on block updates; player arrivals only send webhook notifications."
    },
    {
      "id": "staff-list",
      "name": "Staff List",
      "category": "Donut",
      "description": "Lists online DonutSMP staff."
    },
    {
      "id": "netherite-finder",
      "name": "Netherite Finder",
      "category": "Donut",
      "description": "Outlines Nether chunks that may hide ancient debris."
    },
    {
      "id": "auto-builder",
      "name": "Auto Builder",
      "category": "Donut",
      "description": "Rebuilds a Sponge .schem block by block with reach, rotation and material checks."
    },
    {
      "id": "render-distance-toggle",
      "name": "Render Distance Toggle",
      "category": "Base Finding",
      "description": "Reloads chunks when you go below a Y level."
    },
    {
      "id": "trident-util",
      "name": "Trident Util",
      "category": "Donut",
      "description": "Use tridents out of water and charge them faster."
    },
    {
      "id": "quantum",
      "name": "Quantum & Render",
      "category": "Base Finding",
      "description": "Finds player activity in resent chunks and marks the area around it."
    },
    {
      "id": "donut-nofall",
      "name": "Donut NoFall",
      "category": "Donut",
      "description": "Take no fall damage on DonutSMP."
    },
    {
      "id": "speed-mine",
      "name": "Donut Speed Mine",
      "category": "Donut",
      "description": "Finishes breaking blocks before the full break time."
    },
    {
      "id": "amethyst-bypass",
      "name": "Amethyst Bypass",
      "category": "Base Finding",
      "description": "Shows amethyst geodes hidden by anti-xray."
    },
    {
      "id": "freecam",
      "name": "Freecam",
      "category": "Misc",
      "description": "Detached camera."
    },
    {
      "id": "spam",
      "name": "Spam",
      "category": "Misc",
      "description": "Spams specified messages in chat."
    },
    {
      "id": "coord-snapper",
      "name": "Coord Snapper",
      "category": "Misc",
      "description": "Copies the coordinates you look at or stand on with one key."
    },
    {
      "id": "chat-macro",
      "name": "Chat Macro",
      "category": "Misc",
      "description": "Sends chat messages or commands with a key press."
    },
    {
      "id": "name-protect",
      "name": "Name Protect",
      "category": "Misc",
      "description": "Shows aliases instead of player names on your screen."
    },
    {
      "id": "no-inv-leak",
      "name": "No Inv Leak",
      "category": "Misc",
      "description": "Hides your items on screen for screen shares. Stream Only keeps them visible to you alone."
    },
    {
      "id": "fake-stats",
      "name": "Fake Stats",
      "category": "Donut",
      "description": "Shows your own name and stats on the sidebar and tab list. Blank stats get scrambled."
    },
    {
      "id": "weather-notifier",
      "name": "Weather Notifier",
      "category": "Misc",
      "description": "Shows an advancement-style toast when it starts raining."
    },
    {
      "id": "block-notifier",
      "name": "Block Notifier",
      "category": "Misc",
      "description": "Shows a toast with the block and its coordinates when one of your chosen blocks shows up."
    },
    {
      "id": "fly",
      "name": "Fly",
      "category": "Movement",
      "description": "Lets you fly."
    },
    {
      "id": "auto-walk",
      "name": "Auto Walk",
      "category": "Movement",
      "description": "Automatically walks forward."
    },
    {
      "id": "auto-jump",
      "name": "Auto Jump",
      "category": "Movement",
      "description": "Automatically jumps."
    },
    {
      "id": "click-tp",
      "name": "Click TP",
      "category": "Movement",
      "description": "Teleports you to the block you click on."
    },
    {
      "id": "boat-fly",
      "name": "Boat Fly",
      "category": "Movement",
      "description": "Transforms your boat (or any ridden vehicle) into a plane."
    },
    {
      "id": "boat-noclip",
      "name": "Boat Noclip",
      "category": "Movement",
      "description": "Fly your boat through blocks and entities."
    },
    {
      "id": "elytra-fly",
      "name": "Elytra Fly",
      "category": "Movement",
      "description": "Gives you more control over your elytra."
    },
    {
      "id": "elytra-swap",
      "name": "Elytra Swap",
      "category": "Movement",
      "description": "Swaps between your chestplate and elytra with one key."
    },
    {
      "id": "clutch",
      "name": "Clutch",
      "category": "Movement",
      "description": "Places a water bucket under you when a fall would hurt."
    },
    {
      "id": "entity-control",
      "name": "Entity Control",
      "category": "Movement",
      "description": "Lets you control rideable entities without a saddle."
    },
    {
      "id": "entity-speed",
      "name": "Entity Speed",
      "category": "Movement",
      "description": "Makes you go faster horizontally when riding entities."
    },
    {
      "id": "jesus",
      "name": "Jesus",
      "category": "Movement",
      "description": "Walk on liquids and powder snow like Jesus."
    },
    {
      "id": "sneak",
      "name": "Sneak",
      "category": "Movement",
      "description": "Sneaks for you."
    },
    {
      "id": "speed",
      "name": "Speed",
      "category": "Movement",
      "description": "Modifies your movement speed when moving on the ground."
    },
    {
      "id": "spider",
      "name": "Spider",
      "category": "Movement",
      "description": "Allows you to climb walls like a spider."
    },
    {
      "id": "sprint",
      "name": "Sprint",
      "category": "Movement",
      "description": "Keeps you sprinting while you move forward, like vanilla Toggle Sprint."
    },
    {
      "id": "no-jump-delay",
      "name": "No Jump Delay",
      "category": "Movement",
      "description": "Removes the delay between jumps."
    },
    {
      "id": "trident-boost",
      "name": "Trident Boost",
      "category": "Movement",
      "description": "Boosts you when using riptide with a trident."
    },
    {
      "id": "slow-swing",
      "name": "Slow Swing",
      "category": "Misc",
      "description": "Control hand swing animation speed."
    },
    {
      "id": "swing-animation",
      "name": "Swing Animation",
      "category": "Visuals",
      "description": "Changes your first-person swing animation."
    },
    {
      "id": "weapon-inspect",
      "name": "CS Knife",
      "category": "Visuals",
      "description": "Knife skins for your sword and CS-style inspects with a key of your choice (F by default); hold the key to keep the knife spinning."
    },
    {
      "id": "spawner-notifier",
      "name": "Spawner Notifier",
      "category": "Donut",
      "description": "Scans chunks for mob spawners and highlights them."
    },
    {
      "id": "sus-chunk-finder",
      "name": "Sus Chunk Finder",
      "category": "Base Finding",
      "description": "Finds chunks with signs of player activity from fully grown amethyst."
    },
    {
      "id": "stash-esp",
      "name": "Stash ESP",
      "category": "Base Finding",
      "description": "Draws boxes and tracers to clusters of storage, redstone and valuable blocks."
    },
    {
      "id": "relog-method",
      "name": "Relog Method",
      "category": "Base Finding",
      "description": "Disconnects only when a real base is found below Y 10. Turns on Sus Chunk Finder tuned for base hunting."
    },
    {
      "id": "chunk-scanner",
      "name": "Chunk Scanner",
      "category": "Base Finding",
      "description": "Marks suspicious chunks with signs of player activity."
    },
    {
      "id": "fullbright",
      "name": "Fullbright",
      "category": "Render",
      "description": "Brighten dark areas by overriding the client lightmap gamma."
    },
    {
      "id": "esp",
      "name": "ESP",
      "category": "Render",
      "description": "Highlights players, hostile and passive mobs with outlines, boxes and tracers."
    },
    {
      "id": "glow-esp",
      "name": "Glow ESP",
      "category": "Render",
      "description": "Outlines entities through walls with a glow."
    },
    {
      "id": "nametags",
      "name": "Nametags",
      "category": "Render",
      "description": "Player nametags with held items, armour, health, ping and distance."
    },
    {
      "id": "spawner-nametags",
      "name": "Spawner Nametags",
      "category": "Render",
      "description": "Shows each spawner's mob and activation range over the block."
    },
    {
      "id": "block-esp",
      "name": "Block ESP",
      "category": "Render",
      "description": "Highlights chosen blocks; touching blocks merge into one shape."
    },
    {
      "id": "block-overlay",
      "name": "Block Overlay",
      "category": "Visuals",
      "description": "A smooth, animated outline and fill on the block you look at."
    },
    {
      "id": "storage-esp",
      "name": "Storage ESP",
      "category": "Render",
      "description": "Highlights storage blocks and spawners with per-type colours."
    },
    {
      "id": "freelook",
      "name": "Freelook",
      "category": "Render",
      "description": "Turns the camera and the player separately."
    },
    {
      "id": "hole-esp",
      "name": "Hole ESP",
      "category": "Render",
      "description": "Highlights holes, tunnels, and staircases."
    },
    {
      "id": "pearl-trajectory",
      "name": "Pearl Trajectory",
      "category": "Render",
      "description": "Predicts where a held pearl lands and previews the flight of thrown pearls."
    },
    {
      "id": "trajectories",
      "name": "Trajectories",
      "category": "Render",
      "description": "Shows where your projectiles will land."
    },
    {
      "id": "item-esp",
      "name": "Item ESP",
      "category": "Render",
      "description": "Highlights selected dropped items with model outlines and tracers."
    },
    {
      "id": "xray",
      "name": "Xray",
      "category": "Render",
      "description": "Hide or fade everything but a block whitelist to see ores through terrain."
    },
    {
      "id": "no-render",
      "name": "No Render",
      "category": "Render",
      "description": "Hide selected overlays, screen effects and entity renders."
    },
    {
      "id": "custom-fov",
      "name": "Custom Fov",
      "category": "Visuals",
      "description": "Changes your field of view (FOV)."
    },
    {
      "id": "zoom",
      "name": "Zoom",
      "category": "Visuals",
      "description": "Hold a key to zoom in. Assign one in the module settings."
    },
    {
      "id": "custom-glint",
      "name": "Custom Glint",
      "category": "Visuals",
      "description": "Recolours the enchantment glint and changes its speed and pattern size."
    },
    {
      "id": "target-esp",
      "name": "Target ESP",
      "category": "Visuals",
      "description": "Draws an Egyptian mark on your combat target."
    },
    {
      "id": "totem-spirit",
      "name": "Totem Spirit",
      "category": "Visuals",
      "description": "A glowing ghost rises when a player pops a totem."
    },
    {
      "id": "motion-blur",
      "name": "Motion Blur",
      "category": "Visuals",
      "description": "Adds motion blur when you turn."
    },
    {
      "id": "atmosphere",
      "name": "Atmosphere",
      "category": "Visuals",
      "description": "A custom sky with stars and an aurora."
    },
    {
      "id": "color-grading",
      "name": "Color Grading",
      "category": "Visuals",
      "description": "Adds color, contrast and a vignette to the world."
    },
    {
      "id": "time-changer",
      "name": "Time Changer",
      "category": "Render",
      "description": "Makes you able to set a custom time."
    },
    {
      "id": "low-health-warning",
      "name": "Low Health Warning",
      "category": "Render",
      "description": "Flashes the screen edges when your health is low."
    },
    {
      "id": "hud",
      "name": "HUD",
      "category": "Helix Client",
      "description": "Module list, coordinates and status overlays."
    },
    {
      "id": "spotify-hud",
      "name": "Spotify HUD",
      "category": "Helix Client",
      "description": "Shows what Spotify is playing, with synced lyrics and optional media keys."
    },
    {
      "id": "region-map",
      "name": "Region Map",
      "category": "Helix Client",
      "description": "DonutSMP region map with directional indicator."
    },
    {
      "id": "radar",
      "name": "Radar",
      "category": "Helix Client",
      "description": "A round radar of the players around you."
    },
    {
      "id": "hotkeys",
      "name": "Hotkeys",
      "category": "Helix Client",
      "description": "Lists the modules you have bound to a key, and their keys."
    },
    {
      "id": "tracers",
      "name": "Tracers",
      "category": "Render",
      "description": "Displays tracer lines to specified entities."
    },
    {
      "id": "performance",
      "name": "Performance",
      "category": "Helix Client",
      "description": "Reduces background work and image memory while keeping effects and features. Disable to compare FPS."
    },
    {
      "id": "discord-presence",
      "name": "Discord Presence",
      "category": "Helix Client",
      "description": "Shows Helix Client and the server you are on in your Discord status."
    },
    {
      "id": "auto-tpahere",
      "name": "Tpahere Kill Bot",
      "category": "Macro",
      "description": "Sends tpahere requests to online players one by one, pauses when someone arrives and fights them. Servers can detect this."
    },
    {
      "id": "order-ah-seller",
      "name": "Order AH Trader",
      "category": "Macro",
      "description": "Sells an item on the Auction House, undercuts other sellers and restocks through orders."
    },
    {
      "id": "ah-sell",
      "name": "AH Sell",
      "category": "Macro",
      "description": "Lists up to 9 items from your inventory on the Auction House at your price or the cheapest price."
    },
    {
      "id": "auto-sell",
      "name": "Auto Sell",
      "category": "Macro",
      "description": "Keeps the /sell menu open and keeps selling everything that is not on your Never Sell list."
    },
    {
      "id": "desert-sand-farmer",
      "name": "Desert Sand Farmer",
      "category": "Donut",
      "description": "Mines the sand around you with your best shovel and sells it when the inventory fills up."
    },
    {
      "id": "auto-dig-out-area",
      "name": "Auto Dig Out Area",
      "category": "Macro",
      "description": "Mines a rotated cuboid with a normal or 3x3 pickaxe."
    },
    {
      "id": "tp-macro",
      "name": "Tp Macro",
      "category": "Macro",
      "description": "Sends /tpa or /tpahere to one player on a timer."
    },
    {
      "id": "order-dropper",
      "name": "Order Dropper",
      "category": "Macro",
      "description": "Opens one of your orders, collects it and drops the chosen number of pages, then turns off."
    },
    {
      "id": "panic-pay",
      "name": "Panic Pay",
      "category": "Macro",
      "description": "Sells your whole inventory and armor with /sell, then pays all your money to one player."
    },
    {
      "id": "ah-sniper",
      "name": "AH Sniper",
      "category": "Macro",
      "description": "Refreshes the AH and instantly buys your item below your price, with optional auto selling."
    },
    {
      "id": "self-destruct",
      "name": "Self Destruct",
      "category": "Helix Client",
      "description": "Closes the ClickGUI and turns every module and the HUD off. Your configuration comes back on the next launch."
    }
  ],
  "faq": [
    [
      "What is Helix Client?",
      "Helix is a customizable Minecraft client with 126 modules across nine categories, including Combat, Movement, Render, Visuals and Macro."
    ],
    [
      "How do I get Helix?",
      "Purchase a license through our SellAuth store. Open the dashboard, log in with Discord, enter your license, download the injector, then inject and play."
    ],
    [
      "Which Minecraft version is supported?",
      "This preview targets Minecraft 1.21.11. A published release will list its exact game version and loader requirements. Always match the release to your installation."
    ],
    [
      "Why do I need Discord?",
      "Discord connects your account to your Helix dashboard. Sign-in requests your basic profile only, without access to your messages or email."
    ],
    [
      "How do licenses work?",
      "Purchase your license through SellAuth and enter it in the dashboard to follow the Helix setup process. Your access lasts for the term of the license you purchased."
    ],
    [
      "Where do I pay?",
      "All purchases and payments are handled on our SellAuth store. Unlock Premium takes you directly to the store."
    ],
    [
      "Can I use Helix on every server?",
      "Each server sets its own rules. Check those rules and only enable modules that are allowed where you play. A client feature does not override server policy."
    ],
    [
      "Can I move my setup to another computer?",
      "The planned profile tools are designed to help you keep your preferences together. Cloud sync is not connected here; published release notes will explain supported transfer options."
    ],
    [
      "How do I install Helix?",
      "Go to the dashboard, log in with Discord, enter your license and download the injector. Open the injector, inject Helix and play."
    ],
    [
      "Where can I find purchase information?",
      "See the product information and purchase terms shown on our SellAuth store before buying your license."
    ]
  ],
  "showcases": [
    {
      "id": "clean",
      "name": "The essentials.",
      "type": "Minimal",
      "theme": "mint",
      "description": "A quiet HUD. A clear perspective.",
      "modules": [
        "HUD",
        "Hotkeys",
        "Radar"
      ]
    },
    {
      "id": "explore",
      "name": "A wider world.",
      "type": "Exploration",
      "theme": "sunset",
      "description": "A little direction for your next adventure.",
      "modules": [
        "Zoom",
        "Region Map",
        "Freelook"
      ]
    },
    {
      "id": "focus",
      "name": "Find your focus.",
      "type": "Minimal",
      "theme": "blue",
      "description": "Just the information you want in view.",
      "modules": [
        "HUD",
        "Performance",
        "No Render"
      ]
    },
    {
      "id": "night",
      "name": "After hours.",
      "type": "Creative",
      "theme": "violet",
      "description": "Make a little room for your imagination.",
      "modules": [
        "Time Changer",
        "HUD",
        "Atmosphere"
      ]
    },
    {
      "id": "warm",
      "name": "Golden moments.",
      "type": "Exploration",
      "theme": "amber",
      "description": "A warmer view of the world.",
      "modules": [
        "Color Grading",
        "Freelook",
        "Zoom"
      ]
    },
    {
      "id": "studio",
      "name": "Your next canvas.",
      "type": "Creative",
      "theme": "rose",
      "description": "Give every detail a place.",
      "modules": [
        "HUD",
        "Custom Glint",
        "Totem Spirit"
      ]
    }
  ],
  "legal": {
    "warning": "TO BE REVIEWED BY OWNER",
    "terms": {
      "title": "Terms of service.",
      "sections": [
        [
          "About this website",
          "This website introduces Helix Client, connects your Discord account and provides injector downloads. License purchases and payments take place on our external SellAuth store."
        ],
        [
          "The service",
          "Describe the client editions, delivery process, compatibility requirements, account conditions and support commitments."
        ],
        [
          "Responsible use",
          "Users must follow the rules of the servers they join. Define acceptable use, account handling, license scope and applicable limitations."
        ],
        [
          "Seller and contact",
          "Add the legal business name, registered address, support contact, business registration details where required, and governing terms."
        ]
      ]
    },
    "privacy": {
      "title": "Privacy policy.",
      "sections": [
        [
          "Your account and preferences",
          "Display preferences and module toggle choices are saved in your browser. If you connect Discord, Helix receives your Discord ID, username and display name using the identify permission. It does not request your email, messages or server list. OAuth tokens are used for the identity check and are not stored."
        ],
        [
          "Sign-in cookies",
          "A Secure, HttpOnly, SameSite cookie keeps you signed in for up to seven days. A temporary authorization cookie expires after ten minutes and is cleared after the sign-in attempt. Signing out clears the session cookie. The hosting provider may process request data under its own policies."
        ],
        [
          "Community counts",
          "The website reads approximate public member and online counts from the configured Discord invite. Those numbers are cached briefly to reduce requests. If the hosting server cannot retrieve them, your browser contacts the official Discord API directly, which lets Discord receive your IP address and normal request information. No individual community member list is retrieved."
        ],
        [
          "Owner review required",
          "The owner must supply controller and contact details, the applicable processing basis, retention and rights information before treating this draft as a final privacy policy."
        ],
        [
          "Browser storage",
          "Helix display preferences are saved only in this browser. You can clear them using Reset local preferences below. Use Sign out to end your account session."
        ],
        [
          "Purchases on SellAuth",
          "Unlock Premium and review links take you to our external SellAuth store. Payment details are entered there, rather than on this website."
        ],
        [
          "Injector uploads",
          "Only the configured Discord administrator can upload or replace the injector. Uploaded release files and release information are stored on the hosting service."
        ]
      ]
    },
    "cancellation": {
      "title": "Cancellation & withdrawal.",
      "sections": [
        [
          "Purchases through SellAuth",
          "License purchases and payments take place on our SellAuth store. Review the purchase information and terms shown there before completing your order."
        ],
        [
          "Purchase support",
          "For help with a license purchase, use the support options provided by our store or contact us through Discord."
        ]
      ]
    }
  },
  "copy": {
    "referenceLayout": {
      "heroBefore": "The Best",
      "heroEmphasis": "Client",
      "heroAfter": "there is.",
      "lead": "A customizable Minecraft client built around the way you play. 126 modules. Your setup. Your rules.",
      "heroButton": "Get Helix",
      "secondaryButton": "Join Discord",
      "featureTitle": "One menu for",
      "featureEmphasis": "your playstyle.",
      "featureLead": "126 modules across nine categories. Combat, movement, rendering, visuals, macros and more.",
      "specialLabel": "Uniquely yours",
      "special": [
        "Custom HUD",
        "126 modules",
        "Personal themes"
      ],
      "marquee": [
        "HUD",
        "Zoom",
        "Auto Crystal",
        "126 modules",
        "Combat",
        "Movement",
        "Render",
        "Visuals",
        "Macro",
        "Minecraft 1.21.11",
        "License access",
        "Connected with Discord"
      ],
      "pricingLead": "Start with Helix Basic for free, or unlock Premium through our SellAuth store.",
      "monthlyName": "Helix Premium · 30 days",
      "lifetimeName": "Helix Premium · Lifetime",
      "basicName": "Helix Basic",
      "buy": [
        "Open the dashboard.",
        "Log in with Discord.",
        "Enter your license.",
        "Download the injector.",
        "Inject & play."
      ],
      "buyNote": "Buy your license through our SellAuth store, then open the dashboard and connect Discord. Enter your license, download the injector, inject and play.",
      "footerLinks": [
        "Discord",
        "Showcases",
        "Pricing"
      ],
      "showcaseTitle": "Helix modules,",
      "showcaseAccent": "in your hands.",
      "showcaseLead": "Your client, from a different perspective.",
      "showcaseEnd": "Less friction. More Minecraft.",
      "themeLabel": "SITE COLOUR",
      "themeReset": "Back to Pink"
    },
    "heroEyebrow": "A NEW PERSPECTIVE ON YOUR GAME",
    "heroTitle": "The Best Client",
    "heroAccent": "there is.",
    "heroLead": "A customizable Minecraft client built around the way you play.",
    "heroHighlight": "126 modules. Your setup. Your rules.",
    "heroNote": "License access · Connected with Discord",
    "conceptEyebrow": "YOUR SETUP. YOUR RULES.",
    "conceptLabel": "INTERFACE CONCEPT",
    "conceptOverline": "MAKE IT YOURS",
    "conceptTitle": "Visual modules",
    "conceptSubtitle": "A little less default. A little more you.",
    "statement": "Less friction.",
    "statementAccent": "More Minecraft.",
    "marquee": [
      "A modular experience",
      "Made to be yours",
      "Connected with Discord",
      "Free & Premium editions"
    ],
    "featuresEyebrow": "ONE CLIENT. YOUR ENTIRE PLAYSTYLE.",
    "featuresTitle": "So many possibilities.",
    "featuresAccent": "One place.",
    "featuresLead": "126 modules across nine categories. Combat, movement, rendering, visuals, macros and more.",
    "whyEyebrow": "BUILT AROUND YOU",
    "whyTitle": "Why choose",
    "whyAccent": "Helix?",
    "benefits": [
      {
        "icon": "zap",
        "title": "High Performance",
        "text": "Less getting in the way. More getting into the game. Fine-tune your experience to fit the way you play."
      },
      {
        "icon": "shield",
        "title": "Stable and Secure",
        "text": "Your account. Your access. Discord-linked identity and protected downloads keep everything connected."
      },
      {
        "icon": "sliders",
        "title": "High Modification",
        "text": "Your layout. Your colors. Your rules. Shape the details until your client feels unmistakably yours."
      }
    ],
    "howEyebrow": "FROM DOWNLOAD TO IN-GAME",
    "howTitle": "Less setup.",
    "howAccent": "More play.",
    "steps": [
      {
        "title": "Open the dashboard.",
        "text": ""
      },
      {
        "title": "Log in with Discord.",
        "text": ""
      },
      {
        "title": "Enter your license.",
        "text": ""
      },
      {
        "title": "Download the injector.",
        "text": ""
      },
      {
        "title": "Inject & play.",
        "text": ""
      }
    ],
    "reviewEyebrow": "FROM THE COMMUNITY",
    "reviewTitle": "What players",
    "reviewAccent": "say.",
    "reviewEmpty": "Helix, in their words.",
    "reviewEmptyText": "See what players are saying on our SellAuth feedback page.",
    "pricingEyebrow": "A PLAN FOR YOUR PLAYSTYLE",
    "pricingTitle": "Your client.",
    "pricingAccent": "Your access.",
    "pricingLead": "Start with Helix Basic for free, or unlock Premium through our SellAuth store.",
    "basic": {
      "name": "HELIX BASIC",
      "lead": "Free forever. No license required.",
      "term": "/ forever",
      "features": [
        "Open the dashboard",
        "Log in with Discord",
        "Download the injector",
        "Inject and play"
      ],
      "cta": "Download for free"
    },
    "premium": {
      "name": "HELIX PREMIUM",
      "lead": "A little more. A lot of possibility.",
      "features": [
        "Helix module access",
        "Custom HUD and visual settings",
        "Discord-connected dashboard"
      ],
      "lifetimeFeature": "Lifetime Premium entitlement",
      "monthlyFeature": "Premium access for your selected term",
      "cta": "Unlock Premium",
      "note": "License purchases are handled on SellAuth."
    },
    "buySteps": [
      "Open the dashboard.",
      "Log in with Discord.",
      "Enter your license.",
      "Download the injector.",
      "Inject & play."
    ],
    "communityEyebrow": "BETTER, TOGETHER",
    "communityTitle": "Find your",
    "communityAccent": "people.",
    "communityLead": "Updates, ideas, and a place to share your setup.",
    "communityCard": "Good games. Better company.",
    "communityCardText": "A space for your questions, your ideas, and your next favorite setup.",
    "catalogEyebrow": "YOUR CLIENT. PIECE BY PIECE.",
    "catalogTitle": "Find your",
    "catalogAccent": "advantage.",
    "catalogLead": "Explore the Helix modules. Search, filter, and find what fits your playstyle.",
    "catalogNotice": "126 modules across nine categories.",
    "downloadsTitle": "Your next",
    "downloadsAccent": "adventure.",
    "downloadsLead": "Download the Helix injector and get straight into your game.",
    "downloadSteps": [
      "Open the dashboard and log in with Discord.",
      "Enter your license.",
      "Download the injector.",
      "Open the injector and inject Helix.",
      "Play with your setup."
    ],
    "dashboardTitle": "Your game.",
    "dashboardAccent": "All together.",
    "dashboardLead": "Your Discord account, injector and Helix setup.",
    "faqEyebrow": "A LITTLE CLARITY",
    "faqTitle": "Good questions.",
    "faqAccent": "Clear answers.",
    "faqLead": "The essentials, before you drop in.",
    "showcaseEyebrow": "A LITTLE INSPIRATION",
    "showcaseTitle": "Same client.",
    "showcaseAccent": "Entirely you.",
    "showcaseLead": "A few ways to make room for your playstyle.",
    "showcaseNotice": "Design concepts · These are original interface studies, not submitted player screenshots.",
    "footerWatermark": "PLAY YOUR WAY",
    "disclaimer": "Not affiliated with Mojang or Microsoft.",
    "nav": {
      "en": {
        "home": "Home",
        "modules": "Modules",
        "pricing": "Pricing",
        "downloads": "Downloads",
        "faq": "FAQ",
        "dashboard": "Dashboard",
        "get": "Get Helix"
      },
      "de": {
        "home": "Start",
        "modules": "Module",
        "pricing": "Preise",
        "downloads": "Downloads",
        "faq": "FAQ",
        "dashboard": "Dashboard",
        "get": "Helix holen"
      }
    },
    "ui": {
      "en": {
        "download": "Download free",
        "explore": "Explore modules",
        "join": "Join the community",
        "search": "Search modules…",
        "dashboard": "Open your dashboard",
        "review": "See all reviews",
        "showcases": "Explore showcases",
        "close": "Close",
        "all": "All modules",
        "languageNote": "English selected."
      },
      "de": {
        "download": "Kostenlos herunterladen",
        "explore": "Module entdecken",
        "join": "Community beitreten",
        "search": "Module suchen…",
        "dashboard": "Dashboard öffnen",
        "review": "Alle Bewertungen ansehen",
        "showcases": "Setups entdecken",
        "close": "Schließen",
        "all": "Alle Module",
        "languageNote": "Deutsch für Navigation und Aktionen aktiv. Produkttexte sind derzeit auf Englisch."
      }
    },
    "notices": {
      "discord": "The Discord invite is not configured yet. Check back for the community launch.",
      "oauth": "Discord sign-in is temporarily unavailable. Please try again shortly.",
      "checkout": "The Helix store could not be opened. Please try again.",
      "submit": "Setup submissions will open when the community connection is ready.",
      "storage": "Your browser could not save preferences. Your current choices still work for this visit."
    }
  }
};
