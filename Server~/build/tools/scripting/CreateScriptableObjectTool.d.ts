import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for creating ScriptableObject assets
 *
 * Creates a new ScriptableObject asset for data storage in Unity.
 *
 * Unity API: UnityEngine.ScriptableObject, UnityEditor.AssetDatabase
 * C# Handler: Editor/Tools/CreateScriptableObjectTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/ScriptableObject.html
 * @see https://docs.unity3d.com/ScriptReference/AssetDatabase.html
 *
 * @example
 * // Create with default settings
 * { assetName: "MyData" }
 *
 * @example
 * // Create with custom type and path
 * { assetName: "GameConfig", savePath: "Assets/Data", typeName: "MyGame.GameConfigData" }
 *
 * @category scripting
 */
export declare class CreateScriptableObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        assetName: z.ZodOptional<z.ZodString>;
        savePath: z.ZodOptional<z.ZodString>;
        typeName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        typeName?: string | undefined;
        savePath?: string | undefined;
        assetName?: string | undefined;
    }, {
        typeName?: string | undefined;
        savePath?: string | undefined;
        assetName?: string | undefined;
    }>;
    /**
     * Execution logic for creating ScriptableObject assets
     */
    protected execute(args: any): Promise<CallToolResult>;
}
