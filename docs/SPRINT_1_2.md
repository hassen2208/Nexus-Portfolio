# v0.8.2 — Sprint 2 refinement (still In Review)

NEX-007 (Systems Room 01): integrated the supplied `Sala 1.glb` as a physical command bridge at X=-9, Z=-7.58. Systems laboratory continues to use original floor, walls and portal. Removed old rack props to prevent overlap; added approximate furniture collision and new lighting. The model is static and has no authored collider mesh.

NEX-008 (movement): revised camera-relative WASD steering, smooth facing, velocity damping and diagonal normalization; added regression tests. NEX-009 (camera): preserved third-person orbit, zoom and R recenter. NEX-011 (interaction): Systems hologram remains interactive, pending visual occlusion check after mesh import. Real authored Running state now triggers through `runningRef` instead of a minimum-speed threshold.

**Acceptance status:** scripts and asset structure validated; browser/GPU render, npm production build, visual placement and public deployment remain unverified. Do not mark issues Done until those tests pass.

---

# v0.8.0 animation update — review note

**Asset source:** `Meshy_AI_SciFiCharacterRigged_20261116_animated_mixamo_All_animation.glb` (user upload) is now the actual player avatar. It contains 24 skinned joints and two genuine motion cycles: Walking (~1.03 s) and Running (~0.63 s). No separate Idle clip is present; a static neutral rest pose is derived in code from Walking. Previous procedural limb rotation was removed. The camera remains **third person everywhere**, including inside rooms, with orbit and zoom controls. **Status remains In Review pending in-browser and deployment evidence.** The revised asset is ~14.7 MB, so performance optimization is also pending.

---

# Sprint 1 + Sprint 2 — Product Backlog compliance audit (v0.8)

**Rule:** `Done` requires passing acceptance criteria, demonstrated browser operation and evidence. This report distinguishes **implemented in source** from **tested**, and **original HU/HT stories** from **refined NEX stories**. It is not a retrospective claiming completion.

**Current product decision:** Automatic aerial 3D introduction → visible rigged avatar and *third-person* orbit/zoom camera throughout the hub **and laboratories** → 3D world-space holograms. The previous design (first-person inside rooms) was removed at the owner's request. No 2D exploration mode. Camera navigation is via orbit drag, mouse wheel or buttons, R recenter. Data and Projects are environmental previews in Sprint 2; full interactions belong to Sprint 3.

## Sprint 1 — foundation

| Issue | Priority / SP | Source evidence | Current status | Remaining proof |
| --- | --- | --- | --- | --- |
| NEX-001 / HT-01 | Must / 2 | React, Vite, R3F, Drei config; `src/main.jsx` + Canvas | In Review | `npm install`, browser, clean console, `npm run build`, Git repository evidence |
| NEX-002 / experience design | Must / 3 | Journey and room topology documented in README and implementation plan | In Progress | Update prior Figma wireframes and public share link to *third-person everywhere* |
| NEX-003 / avatar prototype | Must / 5 | `Scene.jsx` camera + controls, `Avatar.jsx` skinned GLB | In Review | Browser demonstration: overhead → TPS, correct scale/orientation, no clipping |
| NEX-004 / station content | Must / 2 | `stations.js`, Systems node contract, Data/Projects stubs | In Review | Confirm true project evidence and intended illustrative labels |
| NEX-005 / HT-02 | Should / 2 | Skinned GLB in `public/models`; direct Drei `useGLTF` integration | In Review | Browser visible asset + import acceptance. `gltfjsx` pipeline not completed as original story states |
| NEX-006 / deployment | Must / 2 | Vercel config only | To Do | Real HTTPS Vercel URL, public access, production build |

**Sprint 1 gate:** camera, avatar and world run in browser; public deployment and updated user journey must be attached. Currently not fully met.

## Sprint 2 — navigable world

| Issue | Priority / SP | Source evidence | Current status | Remaining proof |
| --- | --- | --- | --- | --- |
| NEX-007 / HU-02 | Must / 5 | `Complex.jsx`: futuristic bridge, server lab, data vault, mission room, light profiles | In Review | Screenshots showing unique visual identities; original decorative particles omitted |
| NEX-008 / HT-04 refined | Must / 3 | `world-logic.js`: AABB collision, door triggers; `Scene.jsx` camera-relative WASD | In Review | Test physical routes and no wall crossings; old raycast-to-select-station story superseded by physical exploration |
| NEX-009 / HU-06 + HU-08 refined | Must / 5 | `ThirdPersonCamera`: aerial intro, follow, orbit, zoom, R recenter, wall clearance | In Review | Verify persistent visible avatar in all rooms, zoom range, wall clearance, camera transitions |
| NEX-010 / HT-03 + HU-07 refined | Must / 3 | `Holograms.jsx` mesh panels with Drei text; React state `roomId`, `selectedNode` | In Review | Test text readability, no overlaps; original HTML overlays + state-library choice superseded |
| NEX-011 / HU-03 | Must / 3 | Systems 4 clickable architecture nodes, key E | In Review | Verify all 4 changes and correct projection from orbit camera |

**Sprint 2 gate:** physically reachable three rooms, TPS throughout, 3D panels and working Systems hologram on-screen. Currently implemented but not fully verified.

## Original uploaded backlog vs our refinements

| Original issue | Original criterion | Evidence / verdict |
| --- | --- | --- |
| HT-01 (S1) | React/Vite/R3F/Drei running canvas | Source present; build/browser pending |
| HU-01 (S1) | Loading screen with disabled Enter button | **Replaced by user-approved automatic 3D intro**. Not fulfilled literally. |
| HU-02 (S1) | Dark futuristic room, emissive lighting, moving particles | Room and lighting present; particles not included. **Partial as written.** |
| HT-02 (S1) | Blender GLB/GLTF converted into modular JSX via gltfjsx | GLB integration via useGLTF; gltfjsx export not supplied. **Partial as written.** |
| HU-03 (S2) | Systems station shows Go/FastAPI/Docker/PostgreSQL | Four architecture nodes show FastAPI, Docker, PostgreSQL (Go not represented). **Partial as written.** |
| HU-04 (S2) | Data scene with SQL and Power BI representations | Both displayed with prototype chart; no dataset filter. **Conceptually covered.** |
| HU-05 (S2) | Projects shows detailed EcoVision and Alfalfa cases | Both previews exist; **detailed case studies missing**. Partial as written. |
| HT-03 (S2) | Zustand or Context tracks station and HTML overlays | React local state instead; 3D holograms, no HTML overlays. **Superseded by explicit architecture choice.** |

**Important:** Present Sprint Review against the *approved refined backlog*, and show this change log. Do not claim the unmodified original HU/HT list has all passed.

## Acceptance and release evidence still needed

- Install dependencies and pass production build, locally or in CI.
- Capture browser screenshot/video: start overhead, avatar third person, moving + running, orbiting, zooming, entering all three spaces, Systems interactions.
- Test camera line of sight against wall proxies and close zoom against the avatar, at laptop and mobile resolutions.
- Verify visual gait on the actual rig. Two authored animation clips, Walking and Running, are present; visual smoothness, floor contact and transitions still need browser review.
- Update the Figma design to match third person in every room and re-share the public view link.
- Publish the application (GitHub + Vercel). Verify HTTPS, direct loads and asset downloads in incognito.
- Attach evidence to Issues before transitioning status `In Review → Done`.
