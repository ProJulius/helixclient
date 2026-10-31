# Helix module catalog

Synced from [`cosmofn/helix-client`](https://github.com/cosmofn/helix-client) `main`, pinned to commit [`65de2b3`](https://github.com/cosmofn/helix-client/commit/65de2b327f183d1a01b8147807b2ec912ad1dba6). Verified against the fetched GitHub branch on 31 October 2026.

The registered built-in provider constructs **126 modules**. Stable IDs, names, descriptions and categories are extracted from constructor metadata in the Git objects at that exact commit. Category labels come from ModuleCategory. ModuleRegistry registers this provider by default. Client source was read as data and was not executed; this catalog sync does not verify live Minecraft behavior. No Free/Premium module tiers are invented.

## Added since the previous website catalog

| Module | Category | Source |
| --- | --- | --- |
| Double Anchor | Combat | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/combat/DoubleAnchorModule.java) |
| Auto Xbow Cart | Combat | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/combat/AutoXbowCartModule.java) |
| Durability Guard | Misc | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/misc/DurabilityGuardModule.java) |
| Auto Builder | Donut | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/misc/AutoBuilderModule.java) |
| Stash ESP | Base Finding | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/render/StashEspModule.java) |
| Relog Method | Base Finding | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/render/RelogMethodModule.java) |
| Desert Sand Farmer | Donut | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/donutmacros/DesertSandFarmerModule.java) |
| Auto Dig Out Area | Macro | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/donutmacros/AutoDigOutAreaModule.java) |
| Self Destruct | Helix Client | [Constructor](https://github.com/cosmofn/helix-client/blob/65de2b327f183d1a01b8147807b2ec912ad1dba6/net/helix/client/module/impl/client/SelfDestructModule.java) |

## Category counts

| Category | Modules |
| --- | --- |
| Combat | 24 |
| Movement | 18 |
| Render | 17 |
| Visuals | 11 |
| Misc | 16 |
| Helix Client | 8 |
| Donut | 15 |
| Base Finding | 8 |
| Macro | 9 |

The full sync removes 17 entries absent from the current provider: Player Bypass, Player Bypass 2, Home Meta, 3D Hand, Hand Pose, Hand Aura, Skin Change, Prime Chunk Finder, Block Entity Debug, Light Debug, Custom Crosshair, Hit Particles, Particles, Jump Circles, Pharaoh Headdress, 3D Character, Floating Relics. Existing module metadata also follows GitHub, including Auto Base Hunter (Soon), Auto Relog and Netherite Finder. Showcase examples reference registered modules only.

The earlier preview-menu exclusions remain in place. CS Knife is registered and searchable in the full catalog, but hidden from the preview menu as requested. The other five excluded preview modules are no longer registered upstream. The preview therefore contains 125 entries. Layout, equal column heights, branding, pricing, SellAuth links, Discord authentication and upload behavior are unchanged.
