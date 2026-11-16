# NEXUS v0.8.1 — locomotion refinement

## Reported issue
When pressing W to move forward, the entire avatar unexpectedly rotates and the movement feels unnatural.

## Source investigation
- `src/components/Scene.jsx` in v0.8 recomputed `facing.current` every frame using `orbitYaw.current`, even for a forward-only W command. Therefore rotating the camera also rotated the player when moving forward.
- The GLB's `headfront` node is offset on its local positive Z axis, while the application's walking direction is negative Z. Model yaw alignment is corrected by π radians so the camera begins behind its back.
- The supplied Walking and Running clips contain `Hips.translation` channels with horizontal displacement. Keeping their X/Z alongside the application's own world movement introduces visible sidestepping and instability. Removing horizontal root motion at runtime preserves arm/leg animation and vertical hip bounce.

## Change summary
- New `src/content/locomotion.js` isolates input resolution and capped turning.
- W advances along the current **character** heading regardless of the orbit angle; S walks backward without flipping the model.
- A/D and diagonal input steer toward a new heading at a fixed maximum rate (5.2 rad/s).
- Acceleration and deceleration are damped instead of stepping instantly from zero to maximum speed.
- Avatar's world yaw follows the already-smoothed controller heading; double interpolation removed.
- Model front corrected using a static +π yaw offset; real Mixamo clips remain in place.
- Hips horizontal root translation is neutralized on **copies** of the clips only.

## Acceptance checklist (manual)
1. On load, the camera shows the avatar's **back**, not its face.
2. Press W for 10 seconds; the avatar advances without turning away from its current heading.
3. Drag the camera sideways and hold W; the avatar continues forward, rather than spinning to camera heading.
4. Press S; the avatar moves backward without turning 180 degrees.
5. A/D and W+A/W+D produce intentional, smooth direction changes, not repeated spins.
6. Hold Shift+W; Running plays without lateral root-motion drift.
7. Stop and resume multiple times; walk / idle / run transitions continue working.
8. Orbit, mouse-wheel zoom, R recenter, collisions and all rooms remain functional.

## Scrum tracking
Refinement of NEX-008 (avatar controls and locomotion), NEX-009 (camera / control separation) and NEX-005 (animation integration); keep them **In Review** pending visual QA.
