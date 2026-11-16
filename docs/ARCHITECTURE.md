# Architecture / v0.8 Third-person NEXUS

The user navigates the entire 3D complex in one **persistent third-person orbit camera**. The old first-person laboratory handoff has been removed. Camera pitch, yaw, avatar position and movement velocity are mutable Three refs read by `useFrame`, while zoom distance is limited React state so keyboard, mouse wheel and HUD buttons agree.

```text
React App
  roomId, selectedNode, zoomDistance, HUD help, touchDirection
   └── Canvas / World
       ├── Keyboard refs
       ├── Movement controller (WASD camera-relative)
       ├── Collision AABBs + room triggers
       ├── ThirdPersonCamera (overhead introduction → orbit/follow + zoom + R)
       ├── Avatar: user rigged GLB + authored Walk/Run + derived Idle rest pose
       └── Complex + Systems/Data/Projects Holograms
```

**Camera:** user orbitYaw begins at 0, pitch=0.28; wheel/button zoom 2.1–9.5; focus point y≈1.27. All rooms share this camera. Geometric wall-clearance proxies avoid obscuring the avatar with solid exterior walls. Basic proxy collision is intentionally not a complete physics engine; visual QA must confirm camera line-of-sight.

**Avatar:** SkeletonUtils.clone preserves skin bindings. The new 24-bone GLB includes authored Walking and Running clips; an AnimationMixer crossfades them against a derived static neutral pose. No authored Idle clip has been supplied.

**Navigation:** keyboard/touch input always camera-relative, independent of room. AABB step-check along X/Z, region lookup by position, update React room state only when changing region. Room traversal never switches to first person.

**Content:** Systems 4 clickable diagram nodes and E cycling; Data and Projects are room prototypes for Sprint 2, not full sprint 3 implementations. World-space holograms via transparent meshes and Drei Text. No backend, physics library or heavy state manager until evidence justifies it.


## v0.8 animation acceptance update

The new GLB contains authored `Walking` and `Running` loops on a 24-joint Mixamo skeleton. `Avatar.jsx` uses an `AnimationMixer` and blends the two clips with a generated *static Idle pose*. Old procedural joint oscillations must not be applied on top of the authored clips. Validate stand → walk → run → walk → stand in a real browser, with third-person orbit and zoom active. No production sign-off until floor contact, facing orientation, frame rate and foot-sliding have been checked.
