import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for add_collider tool
 */
const AddColliderToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to add colliders to'),
  colliderType: z.string().optional().default('box').describe('Type of collider: "box", "sphere", "capsule", "mesh". Default: "box"'),
  isTrigger: z.boolean().optional().default(false).describe('Whether the collider is a trigger. Default: false')
});

/**
 * AddCollider Tool
 * Adds Collider component to GameObject
 */
@Tool({
  name: 'add_collider',
  description: 'Adds Collider component to GameObject',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'collider'])
export class AddColliderTool extends BaseTool {
  get name() {
    return 'add_collider';
  }

  get description() {
    return 'Adds Collider component to GameObject';
  }

  get inputSchema() {
    return AddColliderToolArgsSchema;
  }

  get category() {
    return 'physics';
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
