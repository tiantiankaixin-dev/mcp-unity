import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for cleanup_empty_gameobjects tool
 */
const CleanupEmptyGameObjectsToolArgsSchema = z.object({
  dryRun: z
    .boolean()
    .optional()
    .describe('If true, only report what would be deleted without actually deleting. Default: false')
});

/**
 * CleanupEmptyGameObjects Tool
 * Removes empty GameObjects from scene
 */
@Tool({
  name: 'cleanup_empty_gameobjects',
  description: 'Removes empty GameObjects from scene',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'cleanup'])
export class CleanupEmptyGameObjectsTool extends BaseTool {
  get name() {
    return 'cleanup_empty_gameobjects';
  }

  get description() {
    return 'Removes empty GameObjects from scene';
  }

  get inputSchema() {
    return CleanupEmptyGameObjectsToolArgsSchema;
  }

  get category() {
    return 'gameobject';
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
