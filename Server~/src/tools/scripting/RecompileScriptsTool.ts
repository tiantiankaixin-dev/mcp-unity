import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { McpUnityError, ErrorType } from '../../utils/errors.js';

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
@Tool({
  name: 'recompile_scripts',
  description: 'Recompiles all scripts in the Unity project',
  category: 'scripting',
  version: '1.0.0'
})
@Tags(['unity', 'scripting', 'compilation'])
export class RecompileScriptsTool extends BaseTool {
  get name(): string {
    return 'recompile_scripts';
  }

  get description(): string {
    return 'Recompiles all scripts in the Unity project';
  }

  get category(): string {
    return 'scripting';
  }

  get inputSchema() {
    return z.object({
      returnWithLogs: z.boolean().optional().default(true).describe('Whether to return compilation logs'),
      logsLimit: z.number().int().min(0).max(1000).optional().default(100).describe('Maximum number of compilation logs to return')
    });
  }

  /**
   * Custom execution logic preserved from legacy implementation
   * Handles script recompilation with optional log retrieval
   */
  protected async execute(args: any): Promise<CallToolResult> {
    try {
      // Validate arguments
      const validatedArgs = this.inputSchema.parse(args);
      
      // Extract parameters with defaults and validation
      const returnWithLogs = validatedArgs.returnWithLogs ?? true;
      const logsLimit = Math.max(0, Math.min(1000, validatedArgs.logsLimit || 100));

      this.logger.debug(`Executing ${this.name}`, { returnWithLogs, logsLimit });

      // Send request to Unity
      const response = await this.mcpUnity.sendRequest({
        method: this.name,
        params: {
          returnWithLogs,
          logsLimit
        }
      });

      // Check if execution was successful
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.TOOL_EXECUTION,
          response.message || 'Failed to recompile scripts'
        );
      }

      // Return formatted response with compilation logs
      return {
        content: [
          {
            type: 'text',
            text: response.message
          },
          {
            type: 'text',
            text: JSON.stringify({
              logs: response.logs
            }, null, 2)
          }
        ]
      };

    } catch (error: any) {
      this.logger.error(`Error in ${this.name}:`, error);
      
      // Preserve error type if it's already a McpUnityError
      if (error instanceof McpUnityError) {
        throw error;
      }
      
      return this.formatErrorResponse(error);
    }
  }
}

