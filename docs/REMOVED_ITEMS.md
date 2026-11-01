# Removed, moved and unconfirmed items

Everything below is still in `content/archive/guide-v1.json`. Nothing was deleted from the project.

## Sections taken off the live site

- `movement-quirks` (Movement quirks and edge cases): Held the invented "kwerks" wording and hedging; nothing sourced.
- `stop-brake` (Releasing movement and braking): Duplicated counter-strafing.
- `alternating-strafes` (Alternating left and right strafes): Duplicated air strafing; contained wrong turning claims.
- `forward-air-movement` (Forward input in the air (W)): Said W in the air is useful; it is not. Replaced by W around jumps.
- `backward-air-movement` (Backward movement and S in the air): Merged into Backwards air control (advanced).
- `air-direction-reversal` (Changing direction and reversing an air path): Duplicated air strafing; contained wrong turning claims.
- `wide-vs-tight-strafes` (Wide and tight air strafes): Duplicated air strafing.
- `backwards-air-control` (Backwards and reverse air control): Merged into Backwards air control (advanced).
- `circle-strafing` (Circle strafing and curved air paths): Repeated air strafing with different words.
- `dead-strafe` (Dead-strafe: a community term for a held strafe): Framed a failure as a technique; to be explained inside Strafe sync in Phase 2.
- `duck-jump-clearance` (Air crouch and landing clearance): Merged into Air crouch.
- `vanilla-gap-jumps` (Long gap jumps in standard CS2): No clear purpose; long jumps now have their own section.
- `jump-crouch` (Jump-crouch and air duck): Merged into Crouch jump and jump crouch.
- `squat-jump` (Squat jump and pre-duck box jumps): Merged into Crouch jump and jump crouch.
- `run-boosts` (Boost routes: overview): Replaced by Run boost.
- `ceiling-head-bump` (Ceiling head-bumps: overview): Replaced by Ceiling bump.
- `jumpbug-vanilla` (Jumpbug: standard CS2 movement technique): Replaced by Jumpbug plus Jumpbug history (Legacy).
- `pixel-surf-detail` (Pixel surf: collision face and repeatability): Merged into the Legacy pixel surf entry.
- `wall-strafe-detail` (Wall strafing: approach and collision line): Merged into the Legacy wall strafing entry.
- `run-boost-technique` (Run boosts: player roles and timing): Merged into Run boost.
- `ceiling-collision` (Ceiling collision: route setup and velocity checks): Merged into Ceiling bump.
- `instant-duck-route` (Instant crouch-jump ups: route breakdown): Merged into Crouch jump and jump crouch.
- `self-boost-routes` (Self-boosts: geometry and route analysis): Merged into Self boosts and the map routes.
- `vent-route-bhop` (Vent bhops: tight-corridor technique): Merged into Vent bhop.
- `crouchbug-vanilla` (Crouchbug: the landing interaction): Merged into Air crouch.
- `ladder-movement` (Ladder movement): Replaced by Climbing ladders.
- `ladder-push-off-route` (Ladder push-offs into bhops): Replaced by Ladder push-off.
- `map-specific-route-drills` (Map-specific routes: balcony, vents and narrow jumps): Duplicated the map routes.

## Moved to Legacy and history

- Mini-jumps, pixel surf, pixel walking, wall strafing, wallbugs, 360 bhop, Inferno flowerpot 360, bhop patch history

## Sentences removed (invented, hedged, or flagged wrong)

- `velocity-momentum` [does not instantly rotate]: Momentum is the movement you carry into the next phase. A camera turn does not instantly rotate the velocity vector. Ground contact, [[ground-acceleration-friction|friction]], air acceleration, crouch state, ramps and collision normals can 
- `ground-acceleration-friction` [do not confuse]: When testing an approach, compare the speed at the same physical point rather than after a different amount of time. Do not confuse maximum speed with useful speed: a high number aimed away from the landing platform is not a good setup.
- `ground-acceleration-friction` [universal]: A [[counter-strafing|counter-strafe]] is a deliberate opposite-direction input used to cancel ground movement. It is a control technique for stopping or setting up a new line, not a universal acceleration trick.
- `ground-acceleration-friction` [do not infer]: Do not infer acceleration from the viewmodel or camera animation alone.
- `ticks-subtick` [universal]: Do not treat “one tick” as a universal answer for CS2 jumpbugs or bhops. Note the build, server rules, framerate range and the actual input sequence when testing a frame-sensitive route.
- `ticks-subtick` [tick recipe]: Do not convert a community millisecond measurement into a universal tick recipe.
- `surfaces-collision` [do not assume]: For reproducible practice, use the same map version and approach angle. Do not assume two visually similar edges have identical collision shapes.
- `common-movement-mistakes` [without instantly rotating]: Keep your camera direction and [[velocity-momentum|velocity]] direction separate. A smooth turn can change your view without instantly rotating the movement you already carry. Use the speed and position display to check what happened rather
- `basic-ground-movement` [does not instantly rotate]: When you rotate your view while moving, your existing [[velocity-momentum|velocity]] does not instantly rotate with it. You can therefore face one way while carrying speed in another direction. This distinction becomes central to [[air-stra
- `ducking-crouch-input` [do not assume]: Do not assume every short crouch tap creates a mini-jump in current CS2. Older Source and CS:GO movement references describe duck-tap and double-duck behaviours, but those exact timings can depend on the build, game mode and server modifica
- `approach-setup` [a clean takeoff from a consistent point]: A route begins before the jump input. Your approach determines the horizontal [[velocity-momentum|velocity]] and direction that you carry into the air. A clean takeoff from a consistent point is easier to improve than a fast run-up that cha
- `diagonal-ground-movement` [do not confuse]: Do not confuse the camera direction with the [[velocity-momentum|velocity]] direction.
- `air-strafing` [release w at takeoff]: Forward input (W) is useful during the approach, but many long-jump drills release W at takeoff so the A/D strafes can shape the air path cleanly. Backward-facing movement and S-input drills need their own practice because view direction an
- `air-strafing` [more strafes do not guarantee]: Every route has a different time budget. A short hop may need one controlled strafe; a long airborne route may need several. More strafes do not guarantee more speed. Each reversal costs time and can send you away from the target.
- `strafe-sync` [universal]: “Dead strafe” appears in community discussion as shorthand for a longer held strafe phase, often described around a jump’s second strafe. It is not a formal CS2 movement mode or a universally defined jump type. Treat it as an input-shaping 
- `edge-jump` [do not confuse]: Do not confuse an edge jump with an [[edgebug|edgebug]] or [[jumpbug-vanilla|jumpbug]].
- `bhop` [universal]: The same research found that movement-key changes close to touchdown can affect whether a hop is classified as perfect, restored or delayed. Complete a left/right strafe transition before landing when possible, then make the next jump input
- `bhop` [use a scroll bind only]: Use a scroll bind only if it gives you repeatable input. It does not guarantee a perfect hop.
- `jump-landing` [do not confuse]: Do not confuse a safe landing with a speed-perfect landing or a successful route transition.
- `mirage-squat-jump-box` [200 milliseconds]: A community guide updated in March 2025 describes a “squat jump” on the corner box of Mirage: crouch first, then press jump within roughly 200 milliseconds while continuing to hold crouch. The guide claims the route can clear slightly highe
- `mirage-squat-jump-box` [universal]: That timing comes from a single map tutorial and is not documented as a universal Valve rule. Start from the exact corner and compare it with a standard crouch-jump. Keep the camera and run-up fixed so you can tell whether the pre-duck timi
- `mirage-squat-jump-box` [do not assume]: Do not assume the 200 ms window transfers to other boxes.
- `nuke-fast-fall` [do not assume]: Do not assume every low ceiling produces a useful fast fall.
- `inferno-ropz-barrel-patio-jumpbug` [do not infer]: Do not infer a full recipe from comments alone.
- `inferno-balcony-route` [do not assume]: Do not assume that a route titled “balcony jump” is the same as the A-short [[self-boosts|self-boost]] from balcony to cornice to roof. They are separate community route descriptions and need separate clips.
- `server-rules` [universal]: “KZ” is a collection of community climbing modes, not one universal movement ruleset. CS2KZ documents two main modes: Vanilla (VNL), which aims to preserve standard CS2 movement while providing quality-of-life tools, and Classic (CKZ), whic
- `server-rules` [do not treat]: GOKZ is a separate plugin with its own historical mode definitions. Its old wiki lists Vanilla, SimpleKZ and KZTimer, including different bhop, [[pre-strafe|prestrafe]] and crouch rules. That page was last modified in March 2022 and describ
- `kz-prekeep` [do not treat]: Do not treat pre-keep as a generic synonym for [[pre-strafe|prestrafe]]. Prestrafe describes the speed and directional setup before takeoff; pre-keep refers to a mode-specific way of retaining or carrying that setup through the route. The s
- `kz-prekeep` [do not assume]: Do not assume every pre-keep trick from older KZ modes still works.
- `kz-wad-tech` [universal]: WAD tech, also called “our father” tech in CS2KZ documentation, is a named Classic-mode technique. The CS2KZ modes page lists it as a mechanic supported in CKZ and not part of the same older SKZ ruleset. The public mode documentation does n
- `kz-jumpbug-angles` [universal]: CS2KZ’s Vanilla tier descriptions mention basic 90° and 180° jumpbugs in harder courses. These labels distinguish routes with different turning demands. They do not create a universal timing recipe for every map.
- `kz-jumpbug-angles` [do not assume]: Do not assume 90° and 180° routes use identical air control.
- `kz-hsw` [do not assume]: The exact input sequence depends on the course and the HSW rules the server expects. Learn the starting orientation first, then practise the direction changes shown by the route. Do not assume a normal W+A or W+D diagonal is enough to repro
- `long-jump` [universal]: Long-jump records and tiers depend on the server’s movement mode and [[reading-jumpstats|jumpstats]] rules. Treat a number from a GOKZ or KZTimer setup as specific to that ruleset, not a universal CS2 distance target.
- `ladderhop-jump` [do not assume]: Do not assume plugin-defined labels are identical across movement modes.
- `kz-walking-bhop` [universal]: Use the route’s map markings or demonstration to identify where walking begins and where the first jump should occur. The mapping guide names the element but does not publish a universal key-by-key recipe.
- `kz-jumpstat-bh` [do not assume]: The same wiki says the preceding LJ must have no offset for a BH classification. These are plugin-specific stat conditions; do not assume the label or offset logic applies identically to every CS2KZ version.
- `kz-jumpstat-weird` [universal]: Do not use the 64-unit condition as a universal CS2 physics rule. It is part of the GOKZ jumpstat description and may differ across plugins.
- `kz-jumpstat-jb` [universal]: That four-tick description belongs to the GOKZ jumpstat system and dates from March 2022. It is not a universal CS2 timing rule. Valve changed the CS2 landing-time and [[kz-jumpstat-bh|bhop]] system in January 2026, and server plugins can a
- `kz-resurf` [universal]: The word describes a route element, not one universal trick. Map geometry defines the approach and target surface. Use the map author’s line or an uncut demonstration instead of assuming every ramp can be resurfed.
- `kz-box-tech` [universal]: Start by learning the collision shape and where the player’s feet need to land. The mapping guide does not define one universal box-tech command sequence, so use the course demonstration for the exact route.
- `kz-danvari-tech` [universal]: CS2KZ’s mapping guide names danvari tech as a niche element that may appear in advanced courses. The documentation establishes the term as part of the KZ route vocabulary, but it does not provide a complete, universally applicable input tut
- `kz-danvari-tech` [do not confuse]: Treat the technique as course-specific until a reliable explanation describes the same mechanic across multiple maps. Do not confuse the name with a generic strafe or a conventional jump.
- `standup-bhop` [tick recipe]: This is not the same as an ordinary [[kz-jumpstat-bh|bhop]], and the timing should not be presented as a universal CS2 tick recipe. Some details in older KZ documentation describe specific Source/CS:GO modes or plugin assumptions.
- `standup-bhop` [do not assume]: Do not assume the old KZ timing is valid in every CS2 build.
- `kz-countjump-legacy` [tick recipe]: Do not copy old tick recipes into standard CS2.
- `kz-ladder-glide` [do not confuse]: Do not confuse a ladder glide with a [[ladder-push-off|ladder push-off]] into a [[kz-jumpstat-bh|bhop]].
- `drop-bhop` [do not assume]: Jumpstat names for drop-bhop variants differ between legacy plugins and current CS2KZ servers. Check the active plugin’s classification and do not assume that a GOKZ field or distance threshold applies to VNL or CKZ.
- `reading-jumpstats` [do not assume]: `Height`, `Airtime` and `Offset` describe the jump’s vertical arc and the difference between start and landing surfaces. For a block jump, ladder jump or [[jumpbug-vanilla|jumpbug]], the plugin may add specialized fields. Do not assume ever
- `mini-jumps` [do not assume]: Do not assume that tapping jump for a shorter time produces a proportionally lower jump. Test the specific surface and movement rules. Keep crouch separate until you understand the normal jump.
- `pixel-surf` [universal]: Pixel surf is not a separate Valve movement mode and there is no universal pixel coordinate or key recipe. One route can depend on a specific mesh seam, while another uses a ramp-like face. Map updates can change it without changing the mov
- `pixel-surf` [do not assume]: Do not assume a visible pixel edge behaves like a surf ramp.
- `wall-strafe` [universal]: KZ mapping documentation lists wallstrafing as a niche route skill in higher difficulty courses. The exact sequence is map- and mode-dependent; the term does not specify one universal A/D and mouse script.
- `wallbug` [do not assume]: Do not assume every wallbug prevents fall damage or preserves speed. Confirm the actual effect with a test drop, HUD and replay. Keep a wallbug demonstration separate from standard [[wall-strafe|wall strafing]] and from edge- or crouch-base
- `wallbug` [universal]: Do not present a wallbug as a universal safe-fall method.

## Claims to confirm in game

- Ladder push-off always sends you straight back from the ladder (your description).
- Silent climb: hold W and look slightly down (your description; tap climbing is patched).
- Vent bhop is a single hop (your description).
- Triple boost: one weak blog says it was removed on 19 May 2026. You say it still works with the third player slipping. Left out until a Valve note is found.
- Crouching late in a drop shortens the fall (your description).
- Jumpbug now only works from certain drop heights (your description).

## Phase 2 and 3 changes

All of these are still in `content/archive/`.

- `speed-readout`: Duplicate of Show your speed.
- `common-movement-mistakes`: Generic advice with no sourced facts.
- `diagonal-ground-movement`: Merged into Moving on the ground.
- `surf-exits`: Unverified; leaving a ramp needs a trusted source.
- `three-sixty-bhop`: Replaced by the History module and the 360 bhop entry.
- `inferno-flowerpot-360`: Replaced by the History module and the 360 bhop entry.
- `bhop-patch-history`: Replaced by the History module and the 360 bhop entry.
- `jumpbug-history`: Moved into the History module.
- `server-rules`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `cs2kz-modes`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `cs2kz-courses-filters`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-prekeep`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-wad-tech`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpbug`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpbug-angles`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `pre-strafe`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-hsw`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `long-jump`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `weirdjump`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `ladderhop-jump`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-walking-bhop`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-lj`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-bh`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-mbh`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-weird`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-lbh-lwj`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-ladder`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-jumpstat-jb`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-advanced-tech-map`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-slide-ramps`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-resurf`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-box-tech`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-danvari-tech`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-vesq-tech`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `standup-bhop`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `instant-duck-jump`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-countjump-legacy`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-ladder-glide`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `standing-longjump`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `drop-bhop`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-directional-longjump`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `reading-jumpstats`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `diagnose-speed-loss`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-strafe-metrics`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-map-tiering`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `kz-route-review`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.
- `movement-drills`: Old KZ text archived; the KZ module was rewritten from GOKZ and CS2KZ sources.

## Written minimally because I could not verify more

- Half-sideways air strafing (W with A or D): standard bhop community naming, not checked in a CS2 source.
- Holding A or D toward a ramp to surf.
- Mini jump, wallbug: only vague community descriptions exist.
- Counter-strafe graph timings are illustrative (about 0.1 s with a tap, about 0.4 s when releasing the key).
- Route texts condense the community guides already in the Sources list.
