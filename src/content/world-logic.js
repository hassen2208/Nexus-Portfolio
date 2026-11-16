import { STATIONS, WORLD_BOUNDS } from './stations.js';

/** Conservative physical collider proxies (cx, cz, width, depth). */
export const STATIC_WALL_COLLIDERS = [
  [-5.9,5.0,.36,9.5],[5.9,5.0,.36,9.5],[0,10.4,12.1,.4],
  [-4.8,-2.3,1.8,.4],[4.8,-2.3,1.8,.4],
  [-9,-10.35,7.9,.37],[-12.72,-7.65,.4,5.8],[-5.28,-7.65,.4,5.8],
  [9,-10.35,7.9,.37],[5.28,-7.65,.4,5.8],[12.72,-7.65,.4,5.8],
  [0,-17.4,8.5,.37],[-4.02,-14.65,.4,5.6],[4.02,-14.65,.4,5.6],
  [0,5.0,3.7,2.0]
];
// Physical proxy for the central bridge workstation in the imported Sala 1.
// Keep a clear route down both sides. The original GLB has no physics mesh.
export const FURNITURE_COLLIDERS = [
  [-9,-6.35,3.3,1.55],
];
export const WALL_COLLIDERS = [...STATIC_WALL_COLLIDERS, ...FURNITURE_COLLIDERS];
export function isWalkable(x,z){
  const radius=0.3;
  if(x<WORLD_BOUNDS.minX+radius||x>WORLD_BOUNDS.maxX-radius||z<WORLD_BOUNDS.minZ+radius||z>WORLD_BOUNDS.maxZ-radius)return false;
  return !WALL_COLLIDERS.some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+radius&&Math.abs(z-cz)<d/2+radius);
}
export function detectRoom(x,z){
  const s=STATIONS.find(st=>Math.abs(x-st.position[0])<(st.id==='data'?3.15:2.95)&&z<st.position[2]+2.58&&z>st.position[2]-2.9);
  return s?.id??null;
}


/**
 * Fraction of the segment from the avatar toward a camera target that remains
 * clear of solid wall proxies. The central console (last collider) is low and
 * intentionally excluded from camera-only clearance.
 * Returns 1 when no wall blocks the view; runs without a physics engine.
 */
export function cameraClearance(ax, az, bx, bz){
  let minFraction=1;
  const dx=bx-ax, dz=bz-az;
  for(const [cx,cz,w,d] of STATIC_WALL_COLLIDERS.slice(0,-1)){
    const hw=w/2+0.18, hd=d/2+0.18;
    const left=cx-hw, right=cx+hw, near=cz-hd, far=cz+hd;
    if(ax>left&&ax<right&&az>near&&az<far)continue;
    let t0=0, t1=1;
    for(const [origin,v,lo,hi] of [[ax,dx,left,right],[az,dz,near,far]]){
      if(Math.abs(v)<1e-8){if(origin<lo||origin>hi){t0=2;break;}continue;}
      const a=(lo-origin)/v,b=(hi-origin)/v;
      t0=Math.max(t0,Math.min(a,b));
      t1=Math.min(t1,Math.max(a,b));
    }
    if(t0<=t1&&t0>=0&&t0<=1)minFraction=Math.min(minFraction,Math.max(0.18,t0-0.035));
  }
  return minFraction;
}
