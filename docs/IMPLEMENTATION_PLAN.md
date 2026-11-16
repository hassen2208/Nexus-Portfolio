# NEXUS v0.8 — Implementation and sprint plan

## Approved experience

Open website → automatic 3D overhead introduction → rigged avatar appears in central sci-fi hub → game-style **third-person follow/orbit** throughout ALL rooms → move physically through three differentiated labs → inspect floating holographic UI within 3D world → exit while still in third person.

**No first-person camera mode; no 2D exploration option.** Small HTML HUD controls are allowed because they do not replace the spatial experience.

## Runtime components

1. `App.jsx`: active room, chosen Systems node, zoom distance (2.1–9.5), instructions, touch input.
2. `Scene.jsx`: canvas, camera-relative input, movement, collision, room-region detection, `ThirdPersonCamera` with orbit/zoom/intro/recenter.
3. `Avatar.jsx`: rigged GLB (24 joints), authored Walking and Running cycles, generated static Idle rest pose, smooth mixer crossfades.
4. `Complex.jsx`: futuristic hub, corridors, Systems/Data/Projects differentiated modelled spaces.
5. `Holograms.jsx`: world-space 3D panels, Systems click/E interaction; Data/Projects previews.
6. `world-logic.js`: camera-wall blocking as well as avatar AABB collisions and room detection.

## Work by sprint

**S1 (foundation):** NEX-001 stack, NEX-002 updated journey/wireframes, NEX-003 actual avatar + aerial intro + prototype, NEX-004 content schema, NEX-005 GLB integration, NEX-006 deployment. Code for most foundation exists; updated Figma/public deployment remain missing and QA not complete.

**S2 (world):** NEX-007 distinct spaces, NEX-008 traversal and room detection, NEX-009 persistent third-person camera + zoom, NEX-010 3D holograms, NEX-011 functional Systems board. Source implemented, visual QA not complete.

**S3 (defer):** functional Data filter and chart logic, verified project case studies, authored avatar Idle/Walk/Run as optional enhancement if assets are available.

**S4 (defer):** accessibility alternatives compatible with 3D experience, usability study with ≥3 people, visual polish and performance validation.

## Testing order

1. `npm run check` (rig and pure scene logic).
2. `npm run dev` and inspect initial model orientation/skin.
3. Move and sprint while recording leg/knee/foot deformation.
4. Orbit and zoom, including very close zoom and near walls.
5. Enter all doors; verify holograms are readable in third person and can be selected.
6. `npm run build` and deploy; test from an incognito browser.
7. Attach screenshots, GIF or demo video to each story before calling it Done.


## v0.8 animation acceptance update

The new GLB contains authored `Walking` and `Running` loops on a 24-joint Mixamo skeleton. `Avatar.jsx` uses an `AnimationMixer` and blends the two clips with a generated *static Idle pose*. Old procedural joint oscillations must not be applied on top of the authored clips. Validate stand → walk → run → walk → stand in a real browser, with third-person orbit and zoom active. No production sign-off until floor contact, facing orientation, frame rate and foot-sliding have been checked.
