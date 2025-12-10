import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for find_unused_assets tool
 */
const FindUnusedAssetsToolArgsSchema = z.object({
  folderPath: z.string().optional().default('Assets').describe('Folder path to scan for unused assets. Default: "Assets"'),
  includeScripts: z.boolean().optional().default(false).describe('Whether to include scripts in the search. Default: false')
});

/**
 * FindUnusedAssets Tool
 * Finds unused assets
 */
@Tool({
  name: 'find_unused_assets',
  description: 'Finds unused assets',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'unused', 'cleanup'])
export class FindUnusedAssetsTool extends BaseTool {
  get name() {
    return 'find_unused_assets';
  }

  get description() {
    return 'Finds unused assets';
  }

  get inputSchema() {
    return FindUnusedAssetsToolArgsSchema;
  }

  get category() {
    return 'asset';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Operation completed successfully'}`
      }]
    };
  }
}
