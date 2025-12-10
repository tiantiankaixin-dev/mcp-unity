import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';

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
@Tool({
  name: 'batch_import_assets',
  description: 'Import multiple assets from a folder',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'import', 'batch'])
export class BatchImportAssetsTool extends BaseTool {
  get name(): string {
    return 'batch_import_assets';
  }

  get description(): string {
    return 'Import multiple assets from a folder';
  }

  get category(): string {
    return 'asset';
  }

  get inputSchema() {
    return z.object({
      sourceFolderPath: z.string().describe('Source folder path containing assets to import'),
      targetFolderPath: z.string().optional().default('Assets/Imported').describe('Target folder path in Unity project'),
      filePattern: z.string().optional().default('*.*').describe('File pattern to match (e.g., "*.png", "*.fbx")')
    });
  }

  /**
   * Custom execution logic preserved from legacy implementation
   */
  protected async execute(args: any): Promise<CallToolResult> {
    try {
      // Validate arguments
      const validatedArgs = this.inputSchema.parse(args);

      this.logger.debug(`Executing ${this.name}`, validatedArgs);

      // Send request to Unity
      const response = await this.mcpUnity.sendRequest({
        method: this.name,
        params: validatedArgs
      });

      // Check if execution was successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to import assets');
      }

      // Return formatted response
      return {
        content: [{
          type: 'text',
          text: `✅ ${response.message}`
        }]
      };

    } catch (error: any) {
      this.logger.error(`Error in ${this.name}:`, error);
      return this.formatErrorResponse(error);
    }
  }
}
