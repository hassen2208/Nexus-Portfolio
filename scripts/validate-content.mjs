import assert from 'node:assert/strict';
import {existsSync, statSync} from 'node:fs';
import {STATIONS,SYSTEM_NODES,PLAYER_SPAWN,WORLD_BOUNDS} from '../src/content/stations.js';
import {isWalkable, detectRoom, cameraClearance} from '../src/content/world-logic.js';
assert.equal(STATIONS.length,3,'MVP comprises 3 rooms');
assert.equal(new Set(STATIONS.map(s=>s.id)).size,3,'Room identifiers are unique');
assert.deepEqual(STATIONS.map(s=>s.id),['systems','data','projects'],'Room IDs and physical lab order match');
assert.ok(STATIONS.every(s=>s.position.length===3&&s.position.every(Number.isFinite)),'Room positions are 3D');
assert.ok(STATIONS.every(s=>s.position[0]>WORLD_BOUNDS.minX&&s.position[0]<WORLD_BOUNDS.maxX&&s.position[2]>WORLD_BOUNDS.minZ&&s.position[2]<WORLD_BOUNDS.maxZ));
assert.ok(Array.isArray(PLAYER_SPAWN)&&PLAYER_SPAWN.length===3&&PLAYER_SPAWN.every(Number.isFinite),'Player spawn valid');
assert.equal(SYSTEM_NODES.length,4,'Systems hologram requires four selectable nodes');
assert.equal(cameraClearance(-2.4,4.5,-2.4,6.5),1,'Clear camera boom should retain full distance');
assert.ok(cameraClearance(-2.4,8.5,-2.4,14)<1,'Camera should shorten boom against rear wall');
assert.ok(cameraClearance(0,-8,0,-10)<=1,'Camera clearance is normalized');
assert.ok(SYSTEM_NODES.every(n=>n.id&&n.label&&n.responsibility&&n.technologies?.length));
assert.ok(isWalkable(PLAYER_SPAWN[0],PLAYER_SPAWN[2]),'Spawn must not clip a wall or console');
assert.equal(detectRoom(PLAYER_SPAWN[0],PLAYER_SPAWN[2]),null,'Start in third-person hub');
for(const s of STATIONS){
  const x=s.position[0],z=s.position[2];
  // Systems contains the imported central command desk, so validate a side aisle.
  const enterX = s.id === 'systems' ? x-2 : x;
  assert.ok(isWalkable(enterX,z+1.6),'Station '+s.id+' accessible interior must be open');
  assert.equal(detectRoom(enterX,z+1.6),s.id,'Entering '+s.id+' should update active room');
  assert.equal(detectRoom(x,z+3.1),null,'Exiting '+s.id+' should update active room');
}
const avatar=new URL('../public/models/hassen-avatar.glb',import.meta.url);
assert.ok(existsSync(avatar),'Custom avatar GLB missing');
assert.ok(statSync(avatar).size<20_000_000,'Custom avatar GLB is over 20MB; verify optimized delivery before release');
if (statSync(avatar).size >= 7_000_000) console.warn('PERFORMANCE WARNING: avatar GLB exceeds the 7MB initial asset budget. Optimization is pending (Sprint 4).');
const header=Buffer.alloc(12);const {openSync,readSync,closeSync}=await import('node:fs');const fd=openSync(avatar,'r');readSync(fd,header,0,12,0);closeSync(fd);
assert.equal(header.toString('ascii',0,4),'glTF','GLB binary header invalid');
assert.equal(header.readUInt32LE(4),2,'GLB should be glTF version 2');
assert.equal(header.readUInt32LE(8),statSync(avatar).size,'GLB header length mismatch');
console.log('OK: 3 world locations, 4 architecture nodes, spawn bounds and user avatar GLB.');
