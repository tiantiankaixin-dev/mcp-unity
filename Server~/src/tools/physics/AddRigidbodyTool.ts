import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for add_rigidbody tool
 */
const AddRigidbodyToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to add Rigidbody to'),
  mass: z.number().optional().default(1).describe('Mass of the rigidbody. Default: 1'),
  drag: z.number().optional().default(0).describe('Drag coefficient. Default: 0'),
  useGravity: z.boolean().optional().default(true).describe('Whether to use gravity. Default: true'),
  isKinematic: z.boolean().optional().default(false).describe('Whether the rigidbody is kinematic. Default: false')
});

/**
 * AddRigidbody Tool
 * Adds Rigidbody component to GameObject
 */
@Tool({
  name: 'add_rigidbody',
  description: 'Adds Rigidbody component to GameObject',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'rigidbody'])
export class AddRigidbodyTool extends BaseTool {
  get name() {
    return 'add_rigidbody';
  }

  get description() {
    return 'Adds Rigidbody component to GameObject';
  }

  get inputSchema() {
    return AddRigidbodyToolArgsSchema;
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
