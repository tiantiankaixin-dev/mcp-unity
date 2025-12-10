import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for recompiling Unity scripts
 *
 * Triggers a recompilation of all scripts in the Unity project.
 *
 * Unity API: UnityEditor.Compilation.CompilationPipeline, EditorUtility.RequestScriptReload
 * C# Handler: Editor/Tools/RecompileScriptsTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/EditorUtility.RequestScriptReload.html
 * @see https://docs.unity3d.com/ScriptReference/Compilation.CompilationPipeline.html
 *
 * @example
 * // Recompile with logs
 * { returnWithLogs: true, logsLimit: 100 }
 *
 * @example
 * // Recompile without logs
 * { returnWithLogs: false }
 *
 * @category scripting
 */
export declare class RecompileScriptsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        returnWithLogs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        logsLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        returnWithLogs: boolean;
        logsLimit: number;
    }, {
        returnWithLogs?: boolean | undefined;
        logsLimit?: number | undefined;
    }>;
    /**
     * Custom execution logic preserved from legacy implementation
     * Handles script recompilation with optional log retrieval
     */
    protected execute(args: any): Promise<CallToolResult>;
}
