import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { McpUnityError, ErrorType } from '../../utils/errors.js';

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
@Tool({
  name: 'add_package',
  description: 'Adds packages into the Unity Package Manager',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'package', 'package-manager'])
export class AddPackageTool extends BaseTool {
  get name(): string {
    return 'add_package';
  }

  get description(): string {
    return 'Adds packages into the Unity Package Manager';
  }

  get category(): string {
    return 'asset';
  }

  get inputSchema() {
    return z.object({
      source: z.string().describe('The source to use (registry, github, or disk) to add the package'),
      packageName: z.string().optional().describe('The package name to add from Unity registry (e.g. com.unity.textmeshpro)'),
      version: z.string().optional().describe('The version to use for registry packages (optional)'),
      repositoryUrl: z.string().optional().describe('The GitHub repository URL (e.g. https://github.com/username/repo.git)'),
      branch: z.string().optional().describe('The branch to use for GitHub packages (optional)'),
      path: z.string().optional().describe('The path to use (folder path for disk method or subfolder for GitHub)')
    });
  }

  /**
   * Custom execution logic preserved from legacy implementation
   * Validates required parameters based on source type
   */
  protected async execute(args: any): Promise<CallToolResult> {
    try {
      // Validate arguments
      const validatedArgs = this.inputSchema.parse(args);
      const { source, packageName, version, repositoryUrl, branch, path } = validatedArgs;

      // Validate required parameters based on source
      if (source === 'registry' && !packageName) {
        throw new McpUnityError(
          ErrorType.VALIDATION,
          'Required parameter "packageName" not provided for registry source'
        );
      } else if (source === 'github' && !repositoryUrl) {
        throw new McpUnityError(
          ErrorType.VALIDATION,
          'Required parameter "repositoryUrl" not provided for github source'
        );
      } else if (source === 'disk' && !path) {
        throw new McpUnityError(
          ErrorType.VALIDATION,
          'Required parameter "path" not provided for disk source'
        );
      }

      this.logger.debug(`Executing ${this.name}`, { source, packageName, repositoryUrl, path });

      // Send request to Unity
      const response = await this.mcpUnity.sendRequest({
        method: this.name,
        params: validatedArgs
      });

      // Check if execution was successful
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.TOOL_EXECUTION,
          response.message || `Failed to manage package with source: ${source}`
        );
      }

      // Return formatted response with custom type
      return {
        content: [{
          type: response.type || 'text',
          text: response.message
        }]
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
