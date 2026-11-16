import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Avatar from '../three/Avatar.jsx';
import Complex from '../three/Complex.jsx';
import { PLAYER_SPAWN, WALK_SPEED, RUN_SPEED } from '../content/stations.js';
import { isWalkable, detectRoom, cameraClearance } from '../content/world-logic.js';
import { resolveLocomotion, smoothFacing, MOVE_RESPONSE } from '../content/locomotion.js';

/** Keyboard movement stays in refs to avoid a React render every frame. */
function Keyboard({ keys }) {
  useEffect(() => {
    const inputs = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift']);
    function down(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      const key = e.key.toLowerCase();
      if (!inputs.has(key)) return;
      e.preventDefault();
      keys.current.add(key);
    }
    const up = e => keys.current.delete(e.key.toLowerCase());
    const blur = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [keys]);
  return null;
}

/**
 * Third-person camera for EVERY location, including the laboratories.
 * - Drag (mouse/touch) to orbit; mouse wheel or + / - buttons to zoom.
 * - R realigns behind the character's facing direction.
 * - The introductory aerial shot transitions once to the third-person rig.
 * - A cheap 2D wall proxy shortens the boom before it can enter solid walls.
 */
function ThirdPersonCamera({ player, facing, orbitYaw, orbitPitch, zoomDistance, onZoomBy, reducedMotion }) {
  const { camera, gl } = useThree();
  const elapsed = useRef(0);
  const drag = useRef(null);
  const currentGaze = useRef(new THREE.Vector3(0, 1.25, 0));
  const desired = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const currentBoom = useRef(zoomDistance);
  const wasIntro = useRef(true);

  useEffect(() => {
    const canvas = gl.domElement;
    function pointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      canvas.setPointerCapture?.(e.pointerId);
    }
    function pointerMove(e) {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      orbitYaw.current -= dx * 0.0045;
      orbitPitch.current = THREE.MathUtils.clamp(orbitPitch.current + dy * 0.003, 0.04, 0.88);
      d.x = e.clientX;
      d.y = e.clientY;
    }
    function pointerEnd(e) {
      if (drag.current?.id !== e.pointerId) return;
      drag.current = null;
      if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    }
    function wheel(e) {
      e.preventDefault();
      // deltaMode 1 (lines) is less sensitive than pixels on some browsers.
      const amount = e.deltaY * (e.deltaMode === 1 ? 0.025 : 0.004);
      onZoomBy(THREE.MathUtils.clamp(amount, -1.15, 1.15));
    }
    function onKey(e) {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key.toLowerCase() === 'r') orbitYaw.current = facing.current;
    }
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerEnd);
    canvas.addEventListener('pointercancel', pointerEnd);
    canvas.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerEnd);
      canvas.removeEventListener('pointercancel', pointerEnd);
      canvas.removeEventListener('wheel', wheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [gl, orbitYaw, orbitPitch, onZoomBy, facing]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.07);
    elapsed.current += dt;
    const p = player.current;
    const targetPos = target.current.set(p.x, 1.27, p.z);
    currentBoom.current = reducedMotion ? zoomDistance : THREE.MathUtils.damp(currentBoom.current, zoomDistance, 9, dt);
    const boom = currentBoom.current;
    const yaw = orbitYaw.current;
    const pitch = orbitPitch.current;
    const planarDistance = Math.cos(pitch) * boom;
    const bx = p.x + Math.sin(yaw) * planarDistance;
    const bz = p.z + Math.cos(yaw) * planarDistance;
    const clearance = cameraClearance(p.x, p.z, bx, bz);
    const safeDistance = Math.max(1.35, planarDistance * clearance);
    const up = Math.sin(pitch) * boom;
    const followPos = desired.current.set(
      p.x + Math.sin(yaw) * safeDistance,
      1.27 + up * Math.min(1, safeDistance / Math.max(0.01, planarDistance)) + 0.22,
      p.z + Math.cos(yaw) * safeDistance
    );
    if (elapsed.current < 3.2 && !reducedMotion) {
      const t = THREE.MathUtils.smoothstep(elapsed.current, 0.4, 3.2);
      followPos.lerpVectors(new THREE.Vector3(0, 28, 12), followPos, t);
      targetPos.lerpVectors(new THREE.Vector3(0, 0, -4), targetPos, t);
    } else if (wasIntro.current) {
      wasIntro.current = false;
      if (reducedMotion) camera.position.copy(followPos);
    }
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 7.5);
    camera.position.lerp(followPos, k);
    currentGaze.current.lerp(targetPos, k);
    camera.lookAt(currentGaze.current);
  });
  return null;
}

function AvatarLoading({ positionRef }) {
  const marker = useRef();
  useFrame(() => { if (marker.current) { const p = positionRef.current; marker.current.position.set(p.x, 1, p.z); } });
  return <mesh ref={marker}>
    <capsuleGeometry args={[0.35, 1.1, 4, 10]} />
    <meshBasicMaterial color="#719db1" wireframe />
  </mesh>;
}

function World({roomId, onRoomChange, onPositionChange, selectedNode, onSelectNode, reducedMotion, touchDirection, zoomDistance, onZoomBy}) {
  const player = useRef(new THREE.Vector3(...PLAYER_SPAWN));
  const facing = useRef(0);
  const moving = useRef(false);
  const speed = useRef(0);
  const orbitYaw = useRef(0);
  const orbitPitch = useRef(0.28);
  const keys = useRef(new Set());
  const roomRef = useRef(null);
  const sendTime = useRef(0);
  const running = useRef(false);
  const velocity = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    const down = keys.current;
    const p = player.current;
    const horizontal = Number(down.has('d') || down.has('arrowright')) - Number(down.has('a') || down.has('arrowleft')) + touchDirection.x;
    const vertical = Number(down.has('w') || down.has('arrowup')) - Number(down.has('s') || down.has('arrowdown')) - touchDirection.z;
    const dt = Math.min(delta, 0.06);
    // Camera-relative action movement. Movement never waits for rotation.
    const command = resolveLocomotion(horizontal, vertical, orbitYaw.current, facing.current);
    if (command.active) {
      facing.current = smoothFacing(facing.current, command.targetYaw, dt);
    }
    const wantsToRun = command.active && down.has('shift');
    const targetSpeed = command.active ? (wantsToRun ? RUN_SPEED : WALK_SPEED) : 0;
    const targetVX = command.moveX * targetSpeed;
    const targetVZ = command.moveZ * targetSpeed;
    const v = velocity.current;
    v.x = THREE.MathUtils.damp(v.x, targetVX, MOVE_RESPONSE, dt);
    v.z = THREE.MathUtils.damp(v.z, targetVZ, MOVE_RESPONSE, dt);

    // Independent X/Z wall resolution allows the character to slide along walls.
    const beforeX = p.x;
    const beforeZ = p.z;
    const nx = p.x + v.x * dt;
    const nz = p.z + v.z * dt;
    if (isWalkable(nx, p.z)) p.x = nx;
    else v.x = 0;
    if (isWalkable(p.x, nz)) p.z = nz;
    else v.z = 0;

    const displacement = Math.hypot(p.x - beforeX, p.z - beforeZ);
    const actualSpeed = displacement / Math.max(dt, 0.000001);
    speed.current = actualSpeed;
    moving.current = actualSpeed > 0.09;
    // Shift selects the authored run clip immediately when actually moving.
    running.current = moving.current && wantsToRun;
    const room = detectRoom(p.x, p.z);
    if (room !== roomRef.current) {
      roomRef.current = room;
      onRoomChange(room);
    }
    if (clock.elapsedTime - sendTime.current > 0.17) {
      onPositionChange({x: Number(p.x.toFixed(1)), z: Number(p.z.toFixed(1))});
      sendTime.current = clock.elapsedTime;
    }
  });

  return <>
    <ambientLight intensity={0.7} />
    <hemisphereLight args={['#b6c7da', '#101826', 1.4]} />
    <directionalLight position={[10, 17, 8]} intensity={2.2} />
    <Keyboard keys={keys} />
    <Complex selectedNode={selectedNode} onSelectNode={onSelectNode} activeRoom={roomId} />
    <Suspense fallback={<AvatarLoading positionRef={player} />}>
      <Avatar positionRef={player} movingRef={moving} speedRef={speed} runningRef={running} facingRef={facing} />
    </Suspense>
    <ThirdPersonCamera player={player} facing={facing} orbitYaw={orbitYaw} orbitPitch={orbitPitch}
      zoomDistance={zoomDistance} onZoomBy={onZoomBy} reducedMotion={reducedMotion} />
  </>;
}
export default function Scene(props) {
  return <Canvas className="nexus-canvas" dpr={[1, 1.6]}
    camera={{position: [0, 28, 12], fov: 59, near: 0.08, far: 110}}
    gl={{antialias: true, alpha: false, powerPreference: 'high-performance'}}
    fallback={<div className="webgl-error">NEXUS requires WebGL. Please use a compatible browser with hardware acceleration enabled.</div>}>
    <World {...props} />
  </Canvas>;
}
