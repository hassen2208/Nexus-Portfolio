import assert from 'node:assert/strict';
import { resolveLocomotion, smoothFacing, shortestAngle } from '../src/content/locomotion.js';
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<1e-7,`${message}: expected ${b}, received ${a}`);

const forward=resolveLocomotion(0,1,0,0);
near(forward.moveX,0,'W at yaw 0 world X');
near(forward.moveZ,-1,'W at yaw 0 world Z');
near(forward.targetYaw,0,'W faces forward');

const cameraToRight=resolveLocomotion(0,1,Math.PI/2,0);
near(cameraToRight.moveX,-1,'W camera right should move -X');
near(cameraToRight.moveZ,0,'W camera right should not move Z');
near(cameraToRight.targetYaw,Math.PI/2,'body turns toward movement');

const right=resolveLocomotion(1,0,0,0);
near(right.moveX,1,'D must immediately strafe right');
near(right.moveZ,0,'D must not wait for avatar rotation');
near(right.targetYaw,-Math.PI/2,'D body points right');

const back=resolveLocomotion(0,-1,0,0);
near(back.moveX,0,'S x=0');
near(back.moveZ,1,'S moves camera backward');
near(Math.abs(back.targetYaw),Math.PI,'S points backward');

const diag=resolveLocomotion(1,1,0,0);
near(Math.hypot(diag.moveX,diag.moveZ),1,'diagonal normalized');
near(diag.targetYaw,-Math.PI/4,'diagonal yaw');

const idle=resolveLocomotion(0,0,0,1.23);
assert.equal(idle.active,false);near(idle.targetYaw,1.23,'idle preserves orientation');

const gradual=smoothFacing(0,-Math.PI/2,1/60);
assert.ok(gradual<0&&gradual>-.5,'turn should be gentle, not an instant 90 degrees');
assert.ok(Math.abs(shortestAngle(gradual,-Math.PI/2))<Math.PI/2,'turn moves toward heading');
const wrap=smoothFacing(Math.PI-.01,-Math.PI+.01,.1);
assert.ok(Math.abs(shortestAngle(wrap,-Math.PI+.01))<0.02,'smooth shortest arc at +/- pi');
console.log('PASS natural camera-relative locomotion, independent steering, diagonal speed, idle, yaw wrap');
