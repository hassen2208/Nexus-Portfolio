# NEXUS v0.8.3 — Fix for frozen Walking / Running animations

**Fix for the reported issue:** the avatar translated across the world, but arms and legs stayed rigid. In v0.8.2 `AnimationMixer` and its actions were created during `useMemo`, then `useEffect` cleanup stopped them. React `StrictMode` runs an extra setup/cleanup cycle in development; subsequent setup had no logic to restart playback, leaving the model frozen. 

**What was changed:** `src/three/Avatar.jsx` now creates a fresh `AnimationMixer`, registers the `Idle`/`Walking`/`Running` actions, and calls `.play()` inside `useEffect` setup. Cleanup disposes that specific mixer; the second setup creates and starts a new one. The run state continues to be selected by `runningRef` (Shift + movement), and weights are blended smoothly. Hips-bone detection also supports loader-sanitized names.

**What was NOT changed:** camera orbit/zoom, WASD controls, movement speeds, floor contact, collisions, Sala 1, the other labs, holograms or Mixamo GLB. No new character model and no procedural running animation were introduced.

**Local QA:**

```bash
npm install
npm run check
npm run dev
```

Open DevTools console; on startup the animation controller should report:
`[NEXUS Avatar] AnimationMixer ACTIVE: idle, walk, run`.

1. Stay still: avatar holds the generated static rest pose (the GLB has no authored Idle clip).
2. Press W: the actual `Walking` animation moves arms and legs.
3. Hold Shift + W: the actual `Running` animation takes over.
4. Release Shift while walking: returns to `Walking` with a blend.
5. Release W: returns to a standing rest pose.
6. Repeat with the third-person camera rotated and inside Sala 1.
7. Run `npm run build` and verify Vercel deployment separately.

**Evidence status:** GLB animations and source structure can be checked automatically. Rendered animation and production build are **not yet verified in this environment** because npm registry access is unavailable; browser QA is necessary before moving sprint issues to Done.

See `docs/ANIMATION_FIX_v0.8.3.md` for root-cause and code-level explanation.

---

# NEXUS v0.8.2 — Third-person movement + imported Sala 1

**Update from v0.8.1.** Uses the user-supplied `Sala 1.glb` as a detailed sci-fi command bridge *inside* the first laboratory (Systems & Architecture), without replacing the animated Mixamo avatar.

**Controls:** WASD/arrows = camera-relative movement; Shift = Running; mouse drag = orbit camera; wheel or +/- = zoom; R = center camera behind avatar; E = change Systems hologram node.

**Main fixes:** no tank rotation, gradual facing turn independent of velocity, responsive run action selection, retained three rooms and holograms. The floor/entrance are preserved and the imported console has a coarse collider.

Run `npm install`, `npm run check`, `npm run dev`, then `npm run build` before publishing. **Browser QA and production build have not yet been verified.**

See `docs/ROOM_01_IMPORT_v0.8.2.md` for placement details and testing caveats.

---

# NEXUS v0.8.0 — Mixamo Animation Integration (Sprints 1–2)

NEXUS is a 3D exploratory technical portfolio, with an overhead opening shot, a visible avatar in **third-person view throughout the entire complex**, free exploration and zoom/orbit controls. It contains a central hub and three visually differentiated laboratories: The Builder / Systems, The Analyst / Data, and The Operator / Projects. Systems is interactive; Data and Projects are environmental previews for Sprint 3.

## What's new in v0.8.0

- Replaced the previous `hassen-avatar.glb` (rigged but pose-only) with the user-supplied `Meshy_AI_SciFiCharacterRigged_20261116_animated_mixamo_All_animation.glb` saved under `public/models/hassen-avatar.glb`.
- **Real authored animation clips:** `Walking` (approximately 1.033 s / 32 samples) and `Running` (approximately 0.633 s / 20 samples); both use a 24-joint skinned Mixamo rig.
- The new avatar is loaded with `useGLTF`, cloned through `SkeletonUtils.clone`, animated using `THREE.AnimationMixer`, and mixed between rest/walk/run with smoothed weights. The walking and running actions are phase-aligned during direct transitions.
- **Idle is not authored in the supplied GLB.** The application derives a *static rest pose* by averaging opposite points in the supplied walk cycle. This is a placeholder, not an Idle animation.
- Removed procedural limb rotation and bobbing that previously competed with authored walking/running animations.
- The existing third-person camera, mouse orbit, scroll zoom, camera recentering (`R`), navigation controls, room layout and 3D holograms are unchanged.

### Running locally

Requires Node.js >=20.19 or >=22.12.

```bash
npm install
npm run check
npm run dev
# Open the URL printed by Vite, often http://localhost:5173
npm run build
npm run preview
```

**Check is structural, not visual:** `npm run check` verifies room/station configuration, rig, clips, and keyframes without depending on a browser. The development and production builds must still be tested locally. Do not mark backlog issues `Done` until browser QA and deployment evidence exist.

### Controls

| Control | Action |
|---|---|
| WASD / arrows | Move avatar relative to camera |
| Shift + direction | Run, play authored Running clip |
| Release movement | Blend into derived static rest pose |
| Mouse/touch drag on scene | Orbit third-person camera |
| Mouse wheel / `+` / `-` | Zoom to/from character |
| `R` | Recenter camera behind avatar |
| `E` while in Systems | Cycle through architecture hologram nodes |
| Click a Systems node | Inspect node |
| `H` | Toggle help |

### Asset size / optimization

The user's authored GLB is retained without destructive geometry or texture modification to preserve both clips and the skinned rig. It is approximately **14.7 MB** and includes 2048-pixel texture maps. Asset optimization (texture compression/resizing while preserving clips and skeleton) remains a **performance follow-up**, not an accomplished acceptance criterion.

### Evidence required for Sprint 1 and Sprint 2

- Re-run `npm run check` and `npm run build` on a machine with npm dependencies available.
- Visually verify avatar orientation, floor contact, the initial overhead camera, third-person follow in every room and zoom without clipping.
- Confirm the animation state transitions in the browser: stationary (derived pose), WASD (authored Walking), Shift+W (authored Running), release Shift (smooth return to Walking), stop (smooth rest pose). Watch for feet sliding and shape deformation.
- Confirm the three rooms are reachable and Systems holograms are readable and interactive.
- Publish to GitHub/Vercel and attach the URL, video and screenshots to the sprint review.
- Update the prior Figma wireframes to reflect persistent third-person navigation.

For implementation details, Scrum audit and manual testing, see `docs/ANIMATION_INTEGRATION_v0.8.md`, `docs/SPRINT_1_2.md`, `docs/QA_TEST_PLAN.md`, and `docs/IMPLEMENTATION_PLAN.md`.

**Important caveat:** local code and GLB structure do not prove a successful WebGL render. Animation quality is subject to browser/GPU acceptance testing.

## Changelog

- v0.8.2: imported user-supplied Sala 1 bridge into Systems, removed overlapping rack props, added collision proxy, repaired camera-relative locomotion and run state selection.
- v0.8.1: earlier character-relative tank controls, superseded by v0.8.2.
- v0.8.0: rigged avatar with genuine Mixamo Walking / Running clips and derived idle.

**Build status:** npm registry connection from the authoring environment returned EAI_AGAIN, so installation, Vite render and production build must be performed locally. `npm run check` and JavaScript/JSX syntax parsing passed during preparation.
