import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** GLB 2.0 structural validation without installing npm dependencies. */
export function validateAvatar(path) {
  const raw = readFileSync(path);
  assert.equal(raw.toString('ascii', 0, 4), 'glTF', 'Expected binary glTF GLB');
  assert.equal(raw.readUInt32LE(4), 2, 'Expected glTF 2.0');
  assert.equal(raw.readUInt32LE(8), raw.byteLength, 'Invalid GLB total byte length');
  const jsonSize = raw.readUInt32LE(12);
  assert.equal(raw.toString('ascii', 16, 20), 'JSON', 'Missing GLB JSON chunk');
  const gltf = JSON.parse(raw.toString('utf8', 20, 20 + jsonSize).trim());
  assert.ok(gltf.skins?.length, 'Avatar must contain a skinned rig');
  const joints = gltf.skins[0].joints;
  assert.ok(joints.length >= 20, 'Avatar should contain a complete humanoid rig');
  assert.ok(joints.every(i => gltf.nodes[i]), 'Skin contains invalid joint references');
  const skinnedNodes = gltf.nodes.filter(n => n.skin !== undefined);
  assert.ok(skinnedNodes.length > 0, 'Missing a mesh bound to a skin');
  for (const node of skinnedNodes) {
    const attributes = gltf.meshes[node.mesh]?.primitives?.[0]?.attributes ?? {};
    assert.ok('JOINTS_0' in attributes, 'Mesh lacks joint indices');
    assert.ok('WEIGHTS_0' in attributes, 'Mesh lacks joint weights');
    assert.equal(gltf.accessors[attributes.JOINTS_0].count, gltf.accessors[attributes.WEIGHTS_0].count);
  }
  const clips = (gltf.animations || []).map(a => {
    const counts = a.samplers.map(s => gltf.accessors[s.input].count);
    const durations = a.samplers.flatMap(s => gltf.accessors[s.input].max ?? []);
    const paths = new Set(a.channels.map(c => c.target.path));
    const targets = a.channels.map(c => gltf.nodes[c.target.node]?.name);
    assert.ok(targets.every(Boolean), 'Animation references unknown target node');
    assert.ok(paths.has('rotation'), `${a.name} has no joint rotation channels`);
    assert.ok(Math.min(...counts) >= 2, `${a.name} lacks an animated keyframe sequence`);
    return {
      name: a.name, channels: a.channels.length,
      minKeyframes: Math.min(...counts), maxKeyframes: Math.max(...counts),
      durationSeconds: Math.round(1000 * Math.max(...durations)) / 1000
    };
  });
  const walk = clips.find(c => /walk/i.test(c.name));
  const run = clips.find(c => /run|sprint/i.test(c.name));
  assert.ok(walk && run, 'Required authored Walking and Running clips were not found');
  assert.ok(walk.durationSeconds > 0.5 && run.durationSeconds > 0.35, 'Animations are unexpectedly short');
  return { joints: joints.length, skinnedMeshes: skinnedNodes.length, clips, bytes: raw.byteLength };
}

if (process.argv[1]?.endsWith('validate-avatar.mjs')) {
  const results = validateAvatar(new URL('../public/models/hassen-avatar.glb', import.meta.url));
  console.log('PASS Rig, Walking and Running:', JSON.stringify(results, null, 2));
  console.log('NOTE No authored Idle clip; a static rest pose is generated at runtime from Walking.');
}
