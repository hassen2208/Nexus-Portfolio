# Sprint Review demo — NEXUS v0.8 / Sprints 1 and 2

**Suggested demonstration (3–4 min)**

1. Open Vercel preview (when published) and show the world renders in 3D immediately, with an aerial introduction and your rigged avatar.
2. Move with WASD, sprint using Shift, stop to show the authored Walking and Running clips blending toward a generated static rest pose.
3. Demonstrate the **third-person camera remaining behind the avatar**: drag to orbit, wheel / buttons / + / − to zoom and R to re-center.
4. Walk around the central console, enter Systems, and demonstrate **third-person camera inside the room**, floating 3D holograms and all four selectable architecture nodes (click and E).
5. Leave Systems and explore the separately lit Data and Projects rooms without switching to first person. Explicitly identify these as previews for Sprint 3.
6. Display GitHub repository, issue board with In Review statuses, acceptance tests and actual deployment URL, if available. Explain what still requires browser proof.

**Honest engineering notes:** Sprints 1 and 2 have substantial source implementation but cannot be called fully Done until build, browser QA, current wireframes and public deployment pass. The old first-person behavior and 2D explore option are intentionally removed by scope refinement. The supplied GLB includes real Walking and Running cycles, but no authored Idle. A static rest pose is generated from Walking; the gait still needs browser verification.


## v0.8 animation acceptance update

The new GLB contains authored `Walking` and `Running` loops on a 24-joint Mixamo skeleton. `Avatar.jsx` uses an `AnimationMixer` and blends the two clips with a generated *static Idle pose*. Old procedural joint oscillations must not be applied on top of the authored clips. Validate stand → walk → run → walk → stand in a real browser, with third-person orbit and zoom active. No production sign-off until floor contact, facing orientation, frame rate and foot-sliding have been checked.
