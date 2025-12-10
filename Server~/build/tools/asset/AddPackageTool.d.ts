import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for adding packages to Unity Package Manager
 *
 * Supports three sources: registry, github, and disk.
 *
 * Unity API: UnityEditor.PackageManager.Client.Add
 * C# Handler: Editor/Tools/AddPackageTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/PackageManager.Client.Add.html
 *
 * @example
 * // Add from Unity Registry
 * { source: "registry", packageName: "com.unity.textmeshpro", version: "3.0.6" }
 *
 * @example
 * // Add from GitHub
 * { source: "github", repositoryUrl: "https://github.com/username/repo.git", branch: "main" }
 *
 * @example
 * // Add from disk
 * { source: "disk", path: "C:/MyPackages/com.mycompany.mypackage" }
 *
 * @category asset
 */
export declare class AddPackageTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        source: z.ZodString;
        packageName: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        repositoryUrl: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        path: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        path?: string | undefined;
        version?: string | undefined;
        packageName?: string | undefined;
        repositoryUrl?: string | undefined;
        branch?: string | undefined;
    }, {
        source: string;
        path?: string | undefined;
        version?: string | undefined;
        packageName?: string | undefined;
        repositoryUrl?: string | undefined;
        branch?: string | undefined;
    }>;
    /**
     * Custom execution logic preserved from legacy implementation
     * Validates required parameters based on source type
     */
    protected execute(args: any): Promise<CallToolResult>;
}
