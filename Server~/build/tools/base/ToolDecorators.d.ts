import { ToolMetadata, ToolConstructor } from './ToolRegistry.js';
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
export declare function Tool(metadata?: Partial<ToolMetadata>): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function Deprecated(reason?: string): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function Tags(tags: string[]): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function Experimental(): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function RequiresUnityVersion(minVersion: string): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function RequiresPackages(packages: string[]): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function Examples(examples: Array<{
    description: string;
    args: any;
}>): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function Async(): <T extends ToolConstructor>(constructor: T) => T;
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
export declare function Author(name: string, email?: string): <T extends ToolConstructor>(constructor: T) => T;
