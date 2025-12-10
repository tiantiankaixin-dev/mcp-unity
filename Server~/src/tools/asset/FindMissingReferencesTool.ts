import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for find_missing_references tool
 */
const FindMissingReferencesToolArgsSchema = z.object({
  scanProject: z.boolean().optional().default(false).describe('Whether to scan entire project or just current scene. Default: false (current scene only)'),
  includeInactive: z.boolean().optional().default(true).describe('Whether to include inactive GameObjects. Default: true')
});

/**
 * FindMissingReferences Tool
 * Finds missing references
 */
@Tool({
  name: 'find_missing_references',
  description: 'Finds missing references',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'missing', 'references'])
export class FindMissingReferencesTool extends BaseTool {
  get name() {
    return 'find_missing_references';
  }

  get description() {
    return 'Finds missing references';
  }

  get inputSchema() {
    return FindMissingReferencesToolArgsSchema;
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
