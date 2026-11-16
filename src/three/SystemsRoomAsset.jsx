import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// User-provided custom command-bridge model for Systems / Station 01.
// The file is normalized to ~1 unit in each dimension, so scale it to a
// physical-world size and align its feet/base to the walkable floor (Y = 0).
export const SYSTEMS_BRIDGE_POSITION = [-9, 0, -7.58];
export const SYSTEMS_BRIDGE_SCALE = 5.55;
export const SYSTEMS_BRIDGE_URL = '/models/sala-1.glb';

export default function SystemsRoomAsset() {
  const { scene } = useGLTF(SYSTEMS_BRIDGE_URL);
  const { model, offset } = useMemo(() => {
    const model = scene.clone(true); // static mesh, not a skinned character
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const offset = new THREE.Vector3(
      -center.x * SYSTEMS_BRIDGE_SCALE,
      -bounds.min.y * SYSTEMS_BRIDGE_SCALE,
      -center.z * SYSTEMS_BRIDGE_SCALE
    );
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    return { model, offset };
  }, [scene]);

  return (
    <group name="Imported Systems Room - Sala 1" position={SYSTEMS_BRIDGE_POSITION}>
      <group position={offset.toArray()} scale={SYSTEMS_BRIDGE_SCALE}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(SYSTEMS_BRIDGE_URL);
