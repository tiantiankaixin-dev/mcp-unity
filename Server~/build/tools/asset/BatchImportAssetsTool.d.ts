import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for batch importing assets from a folder
 *
 * Uses Unity's AssetDatabase.ImportAsset API to import multiple files.
 *
 * Unity API: UnityEditor.AssetDatabase.ImportAsset
 * C# Handler: Editor/Tools/BatchImportAssetsTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/AssetDatabase.ImportAsset.html
 *
 * @example
 * // Import all PNG files
 * { sourceFolderPath: "C:/MyAssets", filePattern: "*.png" }
 *
 * @example
 * // Import all files to specific folder
 * { sourceFolderPath: "C:/MyAssets", targetFolderPath: "Assets/Textures" }
 *
 * @category asset
 */
export declare class BatchImportAssetsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        sourceFolderPath: z.ZodString;
        targetFolderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        filePattern: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        sourceFolderPath: string;
        targetFolderPath: string;
        filePattern: string;
    }, {
        sourceFolderPath: string;
        targetFolderPath?: string | undefined;
        filePattern?: string | undefined;
    }>;
    /**
     * Custom execution logic preserved from legacy implementation
     */
    protected execute(args: any): Promise<CallToolResult>;
}
