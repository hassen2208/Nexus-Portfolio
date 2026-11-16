# NEXUS — QA acceptance / Sprints 1–2 v0.8

Manual browser QA is **not yet complete**. Mark actual PASS/FAIL and add evidence only after running. Pure programmatic checks do **not** validate animated 3D rendering.

| ID | Steps / scenario | Expected result | Status |
| --- | --- | --- | --- |
| QA-01 | Open page with no interaction | Actual 3D WebGL world loads immediately, no 2D bypass | Not tested |
| QA-02 | Watch initial 4 seconds | Camera starts overhead then descends smoothly into third-person behind avatar | Not tested |
| QA-03 | Inspect character in hub | Current GLB skinned rig visible, upright, correct size/texture | Not tested |
| QA-04 | Press W,A,S,D and arrows | Avatar walks relative to active camera orientation | Not tested |
| QA-05 | Hold Shift during movement, stop | Authored Running clip blends in; releasing movement returns to derived static idle without snapping | Not tested |
| QA-06 | Drag pointer on 3D canvas in hub | Orbit yaw/pitch changes; avatar remains visible | Not tested |
| QA-07 | Mouse wheel zoom | Smooth zoom in/out with limits (2.1–9.5) | Not tested |
| QA-08 | Use + and − on keyboard | Zoom in/out; no console errors | Not tested |
| QA-09 | Use + and − HUD buttons on desktop and phone | Same zoom effect accessible to touch | Not tested |
| QA-10 | Orbit away from avatar rear then press R | Camera realigns behind the avatar direction | Not tested |
| QA-11 | Walk near rear/perimeter walls while zooming out | Camera boom shortens; no major wall obstruction or camera clipping | Not tested |
| QA-12 | Walk past central console and room walls | Avatar doesn't walk through major collider proxy geometry | Not tested |
| QA-13 | Enter Systems room | Character remains visible in **third person** and 3D hologram is readable | Not tested |
| QA-14 | Click all 4 Systems nodes and press E | Active node/responsibility/stack changes correctly | Not tested |
| QA-15 | Exit Systems, enter Data | Remains third-person; violet Data vault and chart board distinguishable | Not tested |
| QA-16 | Exit Data, enter Projects | Remains third-person; copper mission room and 2 previews distinguishable | Not tested |
| QA-17 | After entering a room, orbit and zoom | Camera stays behind/around character, never first person | Not tested |
| QA-18 | Release movement key near a hologram | Character blends out of authored motion into the derived static rest pose without twisting | Not tested |
| QA-19 | Run, turn quickly, switch directions | Knees, ankles, arms and elbows deform acceptably; no tearing, twisted limbs or sliding | Not tested |
| QA-20 | Resize phone viewport 390×844 | Zoom buttons + touch movement visible and usable | Not tested |
| QA-21 | Enable prefers-reduced-motion | Intro skips/cuts transition smoothly and HUD motion is minimized | Not tested |
| QA-22 | `npm run check` / `npm run build` | Static checks and Vite build pass | Static check only |
| QA-23 | Deploy to Vercel, visit in private browser | Live URL loads scene and model without 404 or WebGL errors | Not tested |

**Release-blocking:** invisible avatar, blank WebGL scene, cannot enter a lab, stuck camera, zoom broken, collision traps, broken Systems interaction, failing production build, or inaccessible public URL.

**Animation limitation:** The new rig has authored Walking and Running cycles, but **no authored Idle animation**. A neutral rest pose is derived from Walking. Attach visual evidence of all transitions before accepting animation quality.


## v0.8 animation acceptance update

The new GLB contains authored `Walking` and `Running` loops on a 24-joint Mixamo skeleton. `Avatar.jsx` uses an `AnimationMixer` and blends the two clips with a generated *static Idle pose*. Old procedural joint oscillations must not be applied on top of the authored clips. Validate stand → walk → run → walk → stand in a real browser, with third-person orbit and zoom active. No production sign-off until floor contact, facing orientation, frame rate and foot-sliding have been checked.

## v0.8.2 — User-requested movement + Sala 1 verification

- [ ] In hub press W, S, A, D individually: free camera-relative movement without tank steering or abrupt 180° rotation.
- [ ] Walk while orbiting camera: input follows camera direction; actor rotates smoothly toward actual movement.
- [ ] Shift + W and Shift + diagonal: visible Running clip and transition from Walking, not T-pose or frozen mesh.
- [ ] Stop movement and release Shift: blends to rest; no moving-in-place in collisions.
- [ ] Zoom in/out, orbit, R recenter: avatar remains in third person throughout room traversal.
- [ ] Enter the left-side Systems portal; inspect the new furnished Sala 1 command bridge visually (scale, lighting and doorway clearance).
- [ ] Confirm central console is physically blocked, but left and right aisles are traversable.
- [ ] View all 4 Systems architecture hologram nodes with mouse and E; ensure the new model does not hide the text.
- [ ] Move to Data and Projects; confirm their existing assets and entrances were not changed.
- [ ] Check GPU performance and network payload (added Sala 1 is ~3.1 MB).
- [ ] Run `npm run build` after npm install; deploy preview and record link in Sprint Review.
