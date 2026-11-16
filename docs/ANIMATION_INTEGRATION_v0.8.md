# NEXUS v0.8.0 — Mixamo locomotion implementation

## Uploaded GLB, verified structurally

Source: `Meshy_AI_SciFiCharacterRigged_20261116_animated_mixamo_All_animation.glb`

- 1 skinned mesh, 1 skin, 24 joints with `JOINTS_0` and `WEIGHTS_0`.
- `Walking`: duration ~1.033 sec, 32 samples and 48 channels.
- `Running`: duration ~0.633 sec, 20 samples and 48 channels.
- Both cycles are loopable in structure; Hips translation ends close to its start. Structural periodicity alone does **not** guarantee a seamless visual loop.
- There is **no** separately authored `Idle` clip.
- Original GLB ~14.7 MB, with three 2048px PNG maps. Optimization and runtime performance testing remain open.

## Runtime logic in `src/three/Avatar.jsx`

1. `useGLTF('/models/hassen-avatar.glb')` loads the character and clips.
2. `SkeletonUtils.clone(scene)` retains the skin binding and original bone hierarchy.
3. `THREE.AnimationMixer` plays the supplied Walking and Running actions.
4. A static `Idle - derived static pose` clip interpolates between opposite points of the Walking cycle; this prevents a bind-pose snap but does **not** simulate natural breathing/idle sway.
5. Weight damping (~9/sec) blends among Idle, Walk and Run according to actual control state, while locomotion cycles synchronize their phases when switching directly between Walk and Run.
6. World position and rotation come from the existing third-person player controller. The authored animation updates bones, not the world movement coordinate system.

## Acceptance test (manual browser QA)

| Test | Expected behavior | Status |
|---|---|---|
| Idle on load | Character stands in derived static pose, no T-pose | Pending |
| W for 5 sec | Genuine walking cycle repeats without body twisting | Pending |
| Hold Shift+W | Running animation takes over with a smooth blend | Pending |
| Release Shift but keep W | Running blends back to Walking | Pending |
| Release W | Walking blends to static rest pose without snapping | Pending |
| Turn with A / D | Character turns toward movement, remains attached to floor | Pending |
| Drag camera and wheel zoom | Character continues animating; camera stays behind/around avatar | Pending |
| Enter all 3 rooms | Animation, camera and zoom continue to work | Pending |
| Production build and deployment | No missing asset/animation errors; URL accessible | Pending |

## Backlog traceability

- **NEX-003**: avatar in traversable scene — implementation updated; visual QA pending.
- **NEX-005**: integration of skinned GLB and animation source — structural validation passes, browser integration pending.
- **NEX-008**: traversal and walk/run control — authored clips integrated, browser QA pending.
- **NEX-009**: persistent third-person camera and zoom remain unchanged — browser QA pending.
- **NEX-006**: public deployment is still not complete.

Current statuses: **In Review**, not Done. Automated `npm run check` has passed; the authoring environment was unable to run a production Vite build because it cannot reach `registry.npmjs.org` (`EAI_AGAIN`).
