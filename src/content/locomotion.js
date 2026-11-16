/**
 * Third-person action-style movement for NEXUS.
 * Input uses camera-facing space; steering/visual orientation is independent
 * from the movement vector. Facing yaw 0 points along world -Z.
 */
export const MOVE_RESPONSE = 10;
export const TURN_RESPONSE = 11;

export function shortestAngle(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

/** Returns world-space horizontal direction and requested avatar yaw. */
export function resolveLocomotion(horizontal, vertical, cameraYaw, avatarYaw) {
  const magnitude = Math.hypot(horizontal, vertical);
  if (magnitude < 0.01) {
    return { active: false, moveX: 0, moveZ: 0, targetYaw: avatarYaw };
  }
  const h = horizontal / magnitude;
  const v = vertical / magnitude;
  const moveX = h * Math.cos(cameraYaw) - v * Math.sin(cameraYaw);
  const moveZ = -h * Math.sin(cameraYaw) - v * Math.cos(cameraYaw);
  return {
    active: true,
    moveX,
    moveZ,
    targetYaw: Math.atan2(-moveX, -moveZ)
  };
}

/** Exponential shortest-arc yaw response; stable across variable frame times. */
export function smoothFacing(current, target, delta, response = TURN_RESPONSE) {
  const fraction = 1 - Math.exp(-response * Math.max(0, delta));
  return current + shortestAngle(current, target) * fraction;
}
