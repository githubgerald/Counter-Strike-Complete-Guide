# CS2 Movement Guide: research and evidence notes

**Research checked:** 30 October 2026  
**Purpose:** explain which references support the guide, separate standard CS2 from KZ rules, and flag where a source describes a route without proving a repeatable input recipe.

The website does not show evidence badges. This document records source context so you can decide which demonstrations to add. It is not a claim that every community route has been independently reproduced on the current build.

## 1. How the guide separates movement systems

### Standard CS2 (Vanilla)

The Vanilla chapters describe the standard CS2 movement model used outside modified KZ modes. They cover ground movement, air control, jumps, bhopping, crouch interactions, surf contact, ladders, collision interactions and map-specific routes.

Valve patch notes support statements about changes Valve made to CS2. Community reverse-engineering and recorded routes help explain mechanics that Valve does not document as player-facing features. Those sources should not be treated as interchangeable: a community explanation is not an official Valve specification.

### CS2KZ

The KZ chapters are separate. CS2KZ documentation describes **Vanilla (VNL)** as a mode that aims to preserve standard CS2 movement, while **Classic (CKZ)** uses a different movement ruleset. CKZ bhop speed depends on landing speed and uses a diminishing-return formula; the mode also has concepts such as pre-keep and WAD tech. Do not copy a CKZ technique or jumpstat into a standard CS2 match without checking the mode.

The CS2KZ course tiers describe progression and common course features. They are guidance for map difficulty, not universal distance thresholds. The mapping guide names techniques such as HSW, crouch-jump knowledge, jumpbugs, walking bhop blocks, slide ramps, resurfs, box-tech, danvari and vesq tech. The guide explains their documented context but does not invent a complete input recipe where the documentation only names the technique.

### Legacy KZ / Source references

The GOKZ jumpstats wiki was last modified in March 2022. It defines labels such as LJ, BH, LBH, MBH, WJ, LWJ, LAH, LAJ and JB for that plugin. It also lists values such as distance, block, edge, deviation, strafes, sync, pre-speed, max speed, overlap, dead air, W-release, crouch-release, width, height, airtime and offset.

These terms are useful when reading older KZ material, but they are **plugin-specific historical definitions**. They are not a universal CS2 matchmaking specification. In particular, **CJ** is ambiguous: CS2KZ VNL course descriptions use it for crouch-jump knowledge, while older KZTimer/Source material also uses CJ for Countjump. The guide keeps those meanings separate.

## 2. Valve patch history relevant to movement

| Date | Valve-documented change | Why the guide mentions it |
|---|---|---|
| 30 July 2025 | Fixed movement-button changes being ignored in a high-frame-rate/view-angle case and fixed an air-strafing case that produced higher-than-usual velocity. | Old movement clips may show behaviour that Valve later fixed. |
| 1 August 2025 | Fixed a bhop penalty that continued accumulating while jump was not pressed; the jump-spam clock starts when the input registers. | Explains why older bhop timing assumptions can be wrong. |
| 17 September 2025 | Improved timestep-independence for subtick movement acceleration. | Relevant to acceleration and frame/tick discussions. |
| 4 November 2025 | Fixed an air-acceleration clamp issue while surfing and a case where slowly surfing up a ramp was treated as a jump apex. | Surf behaviour changed after this patch. |
| 21 January 2026 | Landing-time calculation changed to subtick precision. Jumping and landing no longer affect stamina in the default model. Landing-speed penalty became a function of landing time. A jump within `sv_bhop_time_window`, centred on landing and not rejected by `sv_jump_spam_penalty_time`, can count as a successful bhop. `sv_legacy_jump` restores legacy behaviour on private servers. | The guide describes the current landing model and treats old stamina/tick recipes as legacy. |
| 22 January 2026 | Landing vertical velocity began influencing landing-speed penalty. | Vertical speed at touchdown matters to the updated landing model. |
| 4 March 2026 | Valve extended Inferno A-site balcony and adjusted clipping near Second Mid Balcony. | Older Inferno route videos may no longer match current geometry. |
| 24 August 2026 | Valve fixed a case where player speed became too high while moving against walls. | Wall-speed anomalies from earlier clips should not be described as intended current movement. |

These notes establish patch history. They do not prove that a particular community route is repeatable or valid on every server.

## 3. Community research and mechanics that need care

### Bunnyhopping and subtick timing

The **zer0k-z “Bunnyhopping in CS2”** repository is a community reverse-engineering study. It compares a model of CS2 bhop behaviour with automated in-game landings. Its scroll/input interval observations come from that test setup; they are not Valve recommendations or guaranteed values for every keyboard, mouse, frame rate, server or future game build.

The guide therefore explains the landing window and input-spacing problem without prescribing a single magic scroll interval or fixed tick number. Re-test on the current build and server mode.

### Crouchbug and jumpbug

The community reverse-engineering material describes a **crouchbug** as a crouch-release interaction close to the floor: releasing duck changes the player's foot position and can register contact before the ordinary landing path. A **jumpbug** combines that interaction with a jump input in the same input step so the player leaves the floor again.

The explanation is based on community source analysis, not a public Valve mechanic specification. Timing depends on the movement state, fall speed, input processing, frame rate, geometry and build. Do not copy a fixed CS:GO tick recipe into CS2. The guide keeps these concepts separate and describes manual practice rather than macro automation.

### Edgebugs, pixel techniques and collision routes

Edgebugs, pixel surfs, pixel walks, wall contact tricks, head-bumps, vent routes and ladder push-offs rely on precise collision geometry and route setup. A name in a guide or a successful clip does not establish a universal input sequence. Map updates can change the collision mesh while leaving the route name unchanged.

The guide explains the variables to inspect: approach line, speed, contact face, height, crouch state, air control, exit line and landing. To call a specific route reproduced, attach an uncut current-build clip showing the start, inputs and landing. The supplied project currently has placeholders, not proof clips.

### Ropz and Inferno examples

- **Inferno barrel-to-patio jumpbug (July 2026 community thread):** the public Reddit discussion identifies a jumpbug demonstration around the barrel/bicycle area. Comments describe a crouch-jump setup and a highly timed stand-up/uncrouch and jump sequence, but the public thread does not provide a definitive frame-by-frame input overlay or a complete route specification. The guide treats it as a route study, not a reliable competitive technique.
- **Inferno flowerpot 360:** the widely circulated story is a 2023 CS:GO-era attempt, not a confirmed current CS2 route. The guide keeps it as historical context only.
- **Inferno A-short self-boost:** a community Workshop guide describes a balcony-to-cornice-to-roof route made from two jumps. It is separate from the Ropz flowerpot story and should be rechecked against the current map geometry.
- **Inferno balcony/roof and other map routes:** community route guides can provide a route description, but a short written guide may omit the input overlay, exact collision line or repeatability rate. Do not treat an incomplete description as a guaranteed recipe.

### “Kwerks” and “dead-strafe”

“Kwerks” did not appear as a standardised movement term in the sources checked. The guide uses **movement quirks** for small collision, subtick and patch-sensitive behaviours.

“Dead-strafe” appears as an informal community label rather than a standard CS2 or CS2KZ mechanic with a universally agreed definition. The guide preserves the term with that limitation stated.

## 4. Workshop and practice resources

### Movement Hub

The Movement Hub Workshop description lists Free Roam, Time Trial, checkpoints and jumpstats, with optional KZ/surf/bhop-style maps. Steam page variants checked on 30 October 2026 showed conflicting availability/compatibility information, including a removal or incompatibility notice. Check the live Workshop page before relying on it. A compatible CS2 movement map or CS2KZ server is the fallback.

### CS2KZ

Use the CS2KZ website, mode documentation, map browser and mapping guide to check the course's movement mode and rules. A map name alone does not tell you whether it is VNL, CKZ or a legacy server.

### Commands and configuration

The Resources section lists client commands and private-server cvars separately. Commands such as `sv_airaccelerate`, `sv_enablebunnyhopping`, `sv_autobunnyhopping`, `sv_bhop_time_window` and `sv_legacy_jump` depend on server permissions and configuration. They do not give a player control over Premier or official matchmaking servers.

Valve's August 2024 “Side-stepping Skill” update disabled multi-action binds by default and warned against hardware-assisted counter-strafing or movement/shooting automation on official servers. The guide focuses on manual inputs and does not provide automation macros.

## 5. References

### Valve: official CS2 patch notes

- [30 July 2025 — movement input and air-strafe fixes](https://www.counter-strike.net/newsentry/529853754800865283)
- [1 August 2025 — bhop penalty and input clock](https://www.counter-strike.net/newsentry/529853754800866483)
- [17 September 2025 — subtick movement acceleration](https://store.steampowered.com/news/posts/?appids=730&enddate=1759362183&feed=steam_community_announcements)
- [4 November 2025 — surfing fixes](https://www.counter-strike.net/newsentry/578276333072678914)
- [21–22 January 2026 — jump timing, landing and legacy behaviour](https://store.steampowered.com/news/posts/?appids=730&enddate=1773269954&feed=steam_community_announcements)
- [4 March 2026 — Inferno balcony and clipping changes](https://store.steampowered.com/news/posts/?appids=730&enddate=1775776670&feed=steam_announce/1000)
- [24 August 2026 — CS2 update archive](https://www.counter-strike.net/news/CS2?l=english)
- [19 August 2024 — Side-stepping Skill and input automation](https://store.steampowered.com/news/app/730/view/6500469346429600836)

### Current CS2KZ documentation

- [CS2KZ — modes](https://docs.cs2kz.org/systems/modes)
- [CS2KZ — maps and filters](https://docs.cs2kz.org/systems/maps)
- [CS2KZ — mapping guide and course tech progression](https://docs.cs2kz.org/mapping/guide)
- [CS2KZ — getting started](https://cs2kz.org/)

### Community movement research and legacy references

- [zer0k-z — Bunnyhopping in CS2: subtick analysis and automated tests](https://github.com/zer0k-z/cs2-movement-issue-bhop)
- [KZGlobalTeam GOKZ — jumpstats reference](https://github.com/KZGlobalTeam/gokz/wiki/Jumpstats)
- [KZGlobalTeam GOKZ — jumpstat commands](https://github.com/KZGlobalTeam/gokz/blob/master/COMMANDS.md)
- [KZ-Guide — strafing](https://kzguide.gitlab.io/techniques/strafing/)
- [KZ-Guide — bunnyhopping](https://kzguide.gitlab.io/techniques/bunnyhop/)
- [KZ-Guide — ducking](https://kzguide.gitlab.io/techniques/ducking/)

### Workshop maps, routes and community demonstrations

- [Movement Hub Workshop item](https://steamcommunity.com/sharedfiles/filedetails/?id=3355497176)
- [CSDB — Workshop map index](https://csdb.gg/workshop-maps/)
- [Community CS2 jump and route guide (9 March 2025)](https://steamcommunity.com/sharedfiles/filedetails/?id=3441581835)
- [Inferno A-short self-boost guide (November 2024)](https://steamcommunity.com/sharedfiles/filedetails/?id=3357643039)
- [Ropz Inferno barrel jumpbug discussion (July 2026)](https://www.reddit.com/r/GlobalOffensive/comments/1utupsk/ropz_shows_a_jump_bug_on_inferno_and_shares_a/)
- [HLTV — Ropz and the Inferno flowerpot 360 attempt (CS:GO, 2023)](https://www.hltv.org/news/37919/editorial-cs2-wishes-for-the-new-year)

### Commands, map data and rules

- [CS2 Console Commands and ConVars database](https://s2v.app/SchemaExplorer/cs2/convars)
- [Valve command list collation (community-maintained)](https://steamcommunity.com/sharedfiles/filedetails/?id=3325740324)
- [EPIC.LAN — CS2 tournament rules, pixel walks and illegal positioning](https://tournaments.epiclan.co.uk/tournaments/epic44-cs/rules)

---

## 6. What is and is not included in this project

- The website contains **110 editable sections** across Vanilla CS2, CS2KZ and a Vanilla map-route lab.
- Each section has a media placement configured in `content/guide.json`; **the ZIP does not include actual GIF, WebP, MP4 or WebM demonstrations**. Add clips you have recorded or have permission to redistribute.
- The route lab includes community-described examples, but the guide does not claim that every route has been reproduced against the live 30 October 2026 build.
- A literal list of every possible map-specific movement route cannot be proven exhaustive: community route names change, maps update, and many techniques are only documented in local servers or clips. This project aims to be broad and editable while keeping those limits visible.
