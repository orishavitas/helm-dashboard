/**
 * Singleton map of session id → AbortController.
 * Shared between the stream route (writes) and the stop route (reads/aborts).
 * Works correctly on the local Node.js runtime where all routes share a process.
 *
 * Uses globalThis so the singleton survives HMR module reloads in dev.
 */

const g = globalThis as { __helmAgentControllers?: Map<string, AbortController> };
g.__helmAgentControllers ??= new Map<string, AbortController>();
const controllers = g.__helmAgentControllers;

export function registerController(sessionId: string, controller: AbortController): void {
  controllers.set(sessionId, controller);
}

export function abortSession(sessionId: string): boolean {
  const controller = controllers.get(sessionId);
  if (!controller) {
    return false;
  }
  controller.abort();
  return true;
}

export function unregisterController(sessionId: string): void {
  controllers.delete(sessionId);
}

export function hasController(sessionId: string): boolean {
  return controllers.has(sessionId);
}
