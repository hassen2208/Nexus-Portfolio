# NEXUS v0.8.2 — Sala 1 / Systems & Architecture

## Asset and placement
- Source: user-supplied `Sala 1.glb` (custom command bridge, not an avatar).
- Distributed as `public/models/sala-1.glb` (3.06 MiB), preserving material and embedded texture.
- Loaded through Drei `useGLTF` in `src/three/SystemsRoomAsset.jsx`.
- Authoring bounds: approx. X ±0.475, Y -0.409..0.406, Z -0.473..0.475.
- Static model scaled uniformly 5.55×, bottom aligned to Y=0, positioned at X=-9, Z=-7.58 inside the existing Systems room.
- The source is a sculpted command bridge (console, overhead structure, terminals). It does not include a whole collision-ready room; the original NEXUS floor, walls and portal remain in place.
- Removed old server racks and ceiling beams to avoid overlap; added white/cyan light accents and side-floor guidance.
- A coarse physics box at X=-9,Z=-6.35 blocks walking through the center console, with walkable aisles at both sides.

## Locomotion fix
- Keyboard/touch controls are camera-relative, not tank steering.
- Avatar yaw uses shortest-angle exponential smoothing independently of actual velocity.
- Desired velocity is damped to reduce abrupt changes, with separate X and Z collision resolution.
- `runningRef` is driven by pressing Shift while moving, so the actual Mixamo Running clip is selected immediately, without a hardcoded speed threshold.
- Authored clips are preserved; idle remains derived from walking due to no separate Idle in the source.
- Zoom and orbit controls are unchanged. Camera remains in third person in every area.

## Important QA / limitations
- The custom Sala 1 asset is one textured static mesh with no per-object collision geometry. Collision bounds around the console are an approximation; inspect visually and refine with collision meshes if needed.
- Imported bridge ceiling is taller than the surrounding procedural walls, intentionally open-top for the first-person-free third-person camera and aerial intro.
- Review alignment, lighting, hologram occlusion and left/right aisles in the browser.
- Verify actual Walking and Running clip playback with Shift. No new animation clips were added.
- `npm run check`, `npm run build` and manual browser QA are separate from this source integration; only mark work Done after the visual test and deployment.
