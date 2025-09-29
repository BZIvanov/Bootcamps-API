import { createRequire } from 'node:module';

/**
 * Node.js ESM + CommonJS Interop Helper
 *
 * Some libraries, like `pino-http`, are still published as CommonJS (CJS).
 * In a pure ESM Node.js project with `module: "nodenext"` and strict TypeScript settings,
 * you cannot directly `import` these CJS modules.
 *
 * This utility wraps Node's official `createRequire` function to allow importing
 * CJS modules safely and consistently, without disabling strict TypeScript options
 * or relying on synthetic default imports.
 *
 * Usage:
 *   import { requireCJS } from '@/utils/cjsRequire.js';
 *   const pinoHttp = requireCJS('pino-http');
 */

export const requireCJS = createRequire(import.meta.url);
