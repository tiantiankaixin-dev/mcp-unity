import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for group_gameobjects tool
 */
const GroupGameObjectsToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .min(1)
    .describe('Array of GameObject instance IDs to group under a parent'),
  groupName: z
    .string()
    .optional()
    .default('Group')
    .describe('Name for the parent group GameObject. Default: "Group"'),
  centerPivot: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to center the pivot at the geometric center of grouped objects. Default: true')
});

/**
 * GroupGameObjects Tool
 * Groups multiple GameObjects under a parent
 */
@Tool({
  name: 'group_gameobjects',
  description: 'Groups multiple GameObjects under a parent',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'group'])
export class GroupGameObjectsTool extends BaseTool {
  get name() {
    return 'group_gameobjects';
  }

  get description() {
    return 'Groups multiple GameObjects under a parent';
  }

  get inputSchema() {
    return GroupGameObjectsToolArgsSchema;
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
