import { ToolRegistry, ToolMetadata, ToolConstructor } from './ToolRegistry.js';

/**
 * Decorator to automatically register a tool with the ToolRegistry
 * 
 * @example
 * ```typescript
 * @Tool({
 *   name: 'create_script',
 *   description: 'Create a new C# script',
 *   category: 'scripting',
 *   version: '1.0.0'
 * })
 * export class CreateScriptTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Tool(metadata: Partial<ToolMetadata> = {}) {
  return function <T extends ToolConstructor>(constructor: T) {
    // Attach metadata to the constructor
    (constructor as any).metadata = metadata;

    // Register the tool
    ToolRegistry.register(constructor);

    return constructor;
  };
}

/**
 * Decorator to mark a tool as deprecated
 * 
 * @example
 * ```typescript
 * @Deprecated('Use create_script_v2 instead')
 * @Tool({ name: 'create_script', category: 'scripting' })
 * export class CreateScriptTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Deprecated(reason?: string) {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      deprecated: true,
      deprecationReason: reason
    };

    // Removed console.warn to avoid interfering with MCP protocol

    return constructor;
  };
}

/**
 * Decorator to add tags to a tool for categorization and search
 * 
 * @example
 * ```typescript
 * @Tags(['unity', 'scripting', 'csharp'])
 * @Tool({ name: 'create_script', category: 'scripting' })
 * export class CreateScriptTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Tags(tags: string[]) {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      tags: [...(originalMetadata.tags || []), ...tags]
    };

    return constructor;
  };
}

/**
 * Decorator to mark a tool as experimental
 * 
 * @example
 * ```typescript
 * @Experimental()
 * @Tool({ name: 'ai_generate_script', category: 'scripting' })
 * export class AIGenerateScriptTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Experimental() {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      experimental: true,
      tags: [...(originalMetadata.tags || []), 'experimental']
    };

    // Removed console.warn to avoid interfering with MCP protocol

    return constructor;
  };
}

/**
 * Decorator to specify required Unity version
 * 
 * @example
 * ```typescript
 * @RequiresUnityVersion('2021.3')
 * @Tool({ name: 'create_vfx_graph', category: 'vfx' })
 * export class CreateVFXGraphTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function RequiresUnityVersion(minVersion: string) {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      requiredUnityVersion: minVersion
    };

    return constructor;
  };
}

/**
 * Decorator to specify required Unity packages
 * 
 * @example
 * ```typescript
 * @RequiresPackages(['com.unity.cinemachine', 'com.unity.timeline'])
 * @Tool({ name: 'create_cinemachine_camera', category: 'camera' })
 * export class CreateCinemachineCameraTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function RequiresPackages(packages: string[]) {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      requiredPackages: packages
    };

    return constructor;
  };
}

/**
 * Decorator to add examples to a tool
 * 
 * @example
 * ```typescript
 * @Examples([
 *   { description: 'Create a MonoBehaviour script', args: { scriptName: 'PlayerController', scriptType: 'MonoBehaviour' } },
 *   { description: 'Create a ScriptableObject', args: { scriptName: 'GameConfig', scriptType: 'ScriptableObject' } }
 * ])
 * @Tool({ name: 'create_script', category: 'scripting' })
 * export class CreateScriptTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Examples(examples: Array<{ description: string; args: any }>) {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      examples
    };

    return constructor;
  };
}

/**
 * Decorator to mark a tool as async (long-running operation)
 * 
 * @example
 * ```typescript
 * @Async()
 * @Tool({ name: 'build_project', category: 'build' })
 * export class BuildProjectTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Async() {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      async: true,
      tags: [...(originalMetadata.tags || []), 'async']
    };

    return constructor;
  };
}

/**
 * Decorator to specify the author of a tool
 * 
 * @example
 * ```typescript
 * @Author('John Doe', 'john@example.com')
 * @Tool({ name: 'custom_tool', category: 'custom' })
 * export class CustomTool extends BaseTool {
 *   // Implementation...
 * }
 * ```
 */
export function Author(name: string, email?: string) {
  return function <T extends ToolConstructor>(constructor: T) {
    const originalMetadata = (constructor as any).metadata || {};
    (constructor as any).metadata = {
      ...originalMetadata,
      author: { name, email }
    };

    return constructor;
  };
}

