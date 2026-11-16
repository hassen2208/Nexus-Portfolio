# NEXUS v0.8.3 — Frozen avatar animation fix

## Issue and root cause

Reported behavior: WASD moves the whole avatar rigidly, but `Walking` and `Running` are not visible.

In `src/three/Avatar.jsx` v0.8.2:
- `useMemo` constructed `new THREE.AnimationMixer(model)`, created clip actions and called `.play()`.
- `useEffect` returned cleanup that called `mixer.stopAllAction()` and `mixer.uncacheRoot(model)`.
- App `src/main.jsx` uses `<React.StrictMode>`, which runs an extra setup/cleanup cycle in development.
- On the next effect setup the actions were not recreated or restarted. A controller could still translate the top-level group, but there was no active mixer action deforming the skeleton.

This explains why structural GLB validations passed while the visible avatar appeared rigid.

## Fix

- **Prepare only the rig clone and clips** in `useMemo`.
- **Initialize and play the mixer and every action** inside `useEffect` setup.
- On effect cleanup, clear the active ref and stop/dispose that mixer.
- On development StrictMode re-setup, create and play fresh actions against the cloned model.
- Update animation weights each frame against the active mixer ref and call `mixer.update(dt)`.
- Find Mixamo Hips bone using a normalized name check to also support `mixamorig_Hips`.

## Unchanged

`src/components/Scene.jsx`, movement controls, camera, zoom, `Sala 1.glb`, room collision setup, and GLB animation bytes remain unchanged from v0.8.2.

## Acceptance checks

- The browser console logs `AnimationMixer ACTIVE: idle, walk, run` on setup.
- W cycles `Walking` with visible limb movement.
- Shift+W cycles `Running` with visible limb movement.
- Releasing Shift blends back to Walking without freezing.
- Releasing movement transitions to the static derived rest pose.
- The issue does not reappear on a dev hot reload or after mounting with React StrictMode.
- Avatar remains within third-person camera and zoom framing while moving through Sala 1.

**Status:** source repaired, awaiting manual WebGL QA and successful production build.
