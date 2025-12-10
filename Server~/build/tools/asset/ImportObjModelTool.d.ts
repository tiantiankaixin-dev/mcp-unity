import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for importing OBJ models and creating prefabs with materials
 *
 * Imports an OBJ model from an external folder, automatically applies textures
 * (diffuse, normal, metallic, roughness), and creates a prefab.
 *
 * Unity API: ModelImporter, AssetDatabase, PrefabUtility
 * C# Handler: Editor/Tools/Asset/ImportObjModelTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/ModelImporter.html
 * @see https://docs.unity3d.com/ScriptReference/PrefabUtility.SaveAsPrefabAsset.html
 *
 * @example
 * // Import robot model with default settings
 * { sourceFolderPath: "C:/Models/Robot" }
 *
 * @example
 * // Import with custom settings
 * {
 *   sourceFolderPath: "C:/Models/Zombie",
 *   targetFolderPath: "Assets/Characters/Zombie",
 *   prefabName: "ZombieEnemy",
 *   scale: 0.01,
 *   createPrefab: true,
 *   addCollider: true
 * }
 *
 * @category asset
 */
export declare class ImportObjModelTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        sourceFolderPath: z.ZodString;
        targetFolderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        prefabName: z.ZodOptional<z.ZodString>;
        scale: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        createPrefab: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        addCollider: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        sourceFolderPath: string;
        targetFolderPath: string;
        scale: number;
        createPrefab: boolean;
        addCollider: boolean;
        prefabName?: string | undefined;
    }, {
        sourceFolderPath: string;
        targetFolderPath?: string | undefined;
        prefabName?: string | undefined;
        scale?: number | undefined;
        createPrefab?: boolean | undefined;
        addCollider?: boolean | undefined;
    }>;
    /**
     * Custom execution logic for OBJ model import
     */
    protected execute(args: any): Promise<CallToolResult>;
}
