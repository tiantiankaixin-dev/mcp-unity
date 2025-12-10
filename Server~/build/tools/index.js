/**
 * MCP Unity Tools Index
 * Automatically exports all tools from all categories
 *
 * To add a new category:
 * 1. Create a new directory under src/tools/
 * 2. Add an index.ts file in that directory
 * 3. Export all tools from that index.ts
 * 4. Add an export statement here
 */
// Base classes and utilities
export * from './base/BaseTool.js';
export * from './base/ToolRegistry.js';
export * from './base/ToolDecorators.js';
// Tool categories (alphabetically ordered)
export * from './advanced/index.js';
export * from './animation/index.js';
export * from './asset/index.js';
export * from './audio/index.js';
export * from './build/index.js';
export * from './camera/index.js';
export * from './component/index.js';
export * from './components/index.js';
export * from './debug/index.js';
export * from './gameobject/index.js';
export * from './lighting/index.js';
export * from './material/index.js';
export * from './menu/index.js';
export * from './meta/index.js';
export * from './physics/index.js';
export * from './prefab/index.js';
export * from './scene/index.js';
export * from './scripting/index.js';
export * from './terrain/index.js';
export * from './testing/index.js';
export * from './ui/index.js';
export * from './vfx/index.js';
