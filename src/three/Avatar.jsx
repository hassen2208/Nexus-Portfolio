import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three';

/**
 * NEXUS v0.8.3 — Mixamo locomotion with StrictMode-safe AnimationMixer. The GLB contains:
 *   - Walking (about 1.03 s, 32 samples)
 *   - Running (about 0.63 s, 20 samples)
 *   - 24 skinned joints and NO separate Idle animation.
 *   - Hips horizontal root motion removed; turning is controller-driven only.
 *
 * An unanimated neutral posture is derived from opposite steps in Walking.
 * This avoids a T-pose on stopping. The two authored cycles are blended with
 * that posture by a single AnimationMixer; no procedural limb rotation is
 * applied over the clips. Mixer/actions are created in useEffect, not useMemo,
 * so React StrictMode effect cleanup cannot permanently stop animations.
 */
const AVATAR_URL = '/models/hassen-avatar.glb';
const AVATAR_HEIGHT_METERS = 1.77;
const AVATAR_YAW_OFFSET = Math.PI; // GLB character faces +Z; NEXUS forward is -Z
const BLEND_RATE = 9;
const WALK_PLAYBACK_RATE = 1.1;
const RUN_PLAYBACK_RATE = 1.0;

/** Isolated pose-track creation: average corresponding points half a cycle apart.
 * Quaternion slerp gives a natural midpoint and avoids quaternion sign issues.
 * Exported Walk data is an animation source; this generated pose is NOT a
 * separately authored idle cycle.
 */
function createNeutralIdleClip(walkingClip) {
  const tracks = walkingClip.tracks.map((track) => {
    const interpolant = track.createInterpolant();
    const start = Array.from(interpolant.evaluate(walkingClip.duration * 0.15));
    const opposite = Array.from(interpolant.evaluate(walkingClip.duration * 0.65));
    const isRotation = track.name.endsWith('.quaternion') && start.length === 4;
    let pose;
    if (isRotation) {
      const a = new THREE.Quaternion().fromArray(start).normalize();
      const b = new THREE.Quaternion().fromArray(opposite).normalize();
      pose = a.slerp(b, 0.5).toArray();
    } else {
      pose = start.map((v, i) => 0.5 * (v + opposite[i]));
    }
    return new track.constructor(track.name, [0, 1], [...pose, ...pose]);
  });
  return new THREE.AnimationClip('Idle - derived static pose', 1, tracks);
}

/**
 * Remove lateral root motion authored into the Mixamo Hips position track.
 * World traversal is owned by Scene's collision-aware controller, and allowing
 * the clip to translate the hips on X/Z makes the character visibly sway/slide.
 * Keep its vertical bob and all joint rotations so the original walk/run gait
 * is preserved. Work on a cloned clip; never mutate useGLTF's cached assets.
 */
function makeInPlace(clip, hips) {
  const result = clip.clone();
  if (!hips) return result;
  for (const track of result.tracks) {
    if (!/hips/i.test(track.name) || !track.name.endsWith('.position')) continue;
    for (let index = 0; index < track.values.length; index += 3) {
      track.values[index] = hips.position.x;
      track.values[index + 2] = hips.position.z;
    }
  }
  return result;
}

export default function Avatar({ positionRef, movingRef, speedRef, runningRef, facingRef }) {
  const { scene, animations = [] } = useGLTF(AVATAR_URL);
  const worldRef = useRef(null);
  const blendRef = useRef({ idle: 1, walk: 0, run: 0 });
  const modeRef = useRef('idle');
  const animationRef = useRef(null);

  const prepared = useMemo(() => {
    // SkeletonUtils.clone is essential: scene.clone() may break skinned mesh binding.
    const model = cloneSkeleton(scene);
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = AVATAR_HEIGHT_METERS / Math.max(size.y, 0.00001);
    const offset = new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale);

    // GLTFLoader may sanitize ':' to '_', so locate the hips bone by normalized name.
    let hips = null;
    model.traverse((node) => {
      if (node.isBone && /hips$/i.test(node.name.replace(/[^a-z0-9]/gi, ''))) hips = node;
    });
    const rawWalk = animations.find((clip) => /walk/i.test(clip.name) && clip.duration > 0.3);
    const rawRun = animations.find((clip) => /run|sprint/i.test(clip.name) && clip.duration > 0.3);
    const walkClip = rawWalk ? makeInPlace(rawWalk, hips) : null;
    const runClip = rawRun ? makeInPlace(rawRun, hips) : null;
    const authoredIdle = animations.find((clip) => /idle|breath|rest/i.test(clip.name) && clip.duration > 0.3);

    if (!walkClip) {
      console.warn('[NEXUS Avatar] No Walking clip found; the model will stay in its exported pose.');
      return { model, scale, offset, clips: null };
    }

    const idleClip = authoredIdle || createNeutralIdleClip(walkClip);
    return { model, scale, offset, clips: { idle: idleClip, walk: walkClip, run: runClip } };
  }, [scene, animations]);

  // CRITICAL: React.StrictMode intentionally calls effect setup -> cleanup -> setup
  // in development. A mixer created in render/useMemo and stopped only by cleanup
  // never resumes after that probe. Initialize and start a FRESH mixer every setup.
  useEffect(() => {
    if (!prepared.clips) return;

    const mixer = new THREE.AnimationMixer(prepared.model);
    const actions = {
      idle: mixer.clipAction(prepared.clips.idle),
      walk: mixer.clipAction(prepared.clips.walk),
      run: prepared.clips.run ? mixer.clipAction(prepared.clips.run) : null
    };

    blendRef.current = { idle: 1, walk: 0, run: 0 };
    modeRef.current = 'idle';

    for (const [name, action] of Object.entries(actions)) {
      if (!action) continue;
      action.reset();
      action.enabled = true;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.setEffectiveWeight(name === 'idle' ? 1 : 0);
      action.setEffectiveTimeScale(
        name === 'walk' ? WALK_PLAYBACK_RATE :
        name === 'run' ? RUN_PLAYBACK_RATE : 1
      );
      action.play();
    }

    animationRef.current = { mixer, actions };
    if (import.meta.env.DEV) {
      console.info('[NEXUS Avatar] AnimationMixer ACTIVE:',
        Object.entries(actions).filter(([, action]) => action).map(([name]) => name).join(', '));
    }

    return () => {
      // Clear the ref FIRST so a frame cannot update a disposed mixer.
      if (animationRef.current?.mixer === mixer) animationRef.current = null;
      mixer.stopAllAction();
      mixer.uncacheRoot(prepared.model);
    };
  }, [prepared]);

  useFrame((_, delta) => {
    if (!worldRef.current) return;
    const dt = Math.min(delta, 0.07);
    const { x, z } = positionRef.current;
    worldRef.current.position.set(x, 0, z);
    // The locomotion controller already smooths deliberate turning.
    // Applying a second turn filter here causes a delayed whole-body swivel.
    worldRef.current.rotation.y = facingRef.current + AVATAR_YAW_OFFSET;

    const active = animationRef.current;
    if (!active) return;
    const { mixer, actions } = active;
    const desiredMode = !movingRef.current
      ? 'idle'
      : runningRef.current && actions.run
        ? 'run'
        : 'walk';

    if (desiredMode !== modeRef.current) {
      const from = actions[modeRef.current];
      const to = actions[desiredMode];
      // Keep a consistent phase when switching between walking and running.
      if (from && to && modeRef.current !== 'idle' && desiredMode !== 'idle') {
        const phase = (from.time / from.getClip().duration) % 1;
        to.time = phase * to.getClip().duration;
      }
      modeRef.current = desiredMode;
    }

    for (const [mode, action] of Object.entries(actions)) {
      if (!action) continue;
      const goal = mode === desiredMode ? 1 : 0;
      const nextWeight = THREE.MathUtils.damp(blendRef.current[mode], goal, BLEND_RATE, dt);
      blendRef.current[mode] = nextWeight;
      action.setEffectiveWeight(nextWeight);
    }
    // Explicit idle action prevents the mesh from snapping to its bind/T pose.
    mixer.update(dt);
  });

  return (
    <group ref={worldRef} rotation={[0, AVATAR_YAW_OFFSET, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.016, 0]}>
        <circleGeometry args={[0.37, 24]} />
        <meshBasicMaterial color="#020b14" transparent opacity={0.32} depthWrite={false} />
      </mesh>
      <group position={prepared.offset.toArray()} scale={prepared.scale}>
        <primitive object={prepared.model} />
      </group>
    </group>
  );
}

useGLTF.preload(AVATAR_URL);
