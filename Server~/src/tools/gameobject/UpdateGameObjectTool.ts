import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for update_gameobject tool
 */
const UpdateGameObjectToolArgsSchema = z.object({
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Instance ID of the GameObject to update'),
  objectPath: z
    .string()
    .optional()
    .describe('Hierarchy path to the GameObject. Example: "Parent/Child/Target"'),
  gameObjectData: z
    .object({
      name: z.string().optional().describe('New name for the GameObject'),
      tag: z.string().optional().describe('New tag for the GameObject'),
      layer: z.number().int().optional().describe('New layer index for the GameObject'),
      isActiveSelf: z.boolean().optional().describe('New active state for the GameObject'),
      isStatic: z.boolean().optional().describe('New static flag for the GameObject')
    })
    .describe('GameObject properties to update')
});

/**
 * UpdateGameObject Tool
 * Updates GameObject properties
 */
@Tool({
  name: 'update_gameobject',
  description: 'Updates GameObject metadata (name/tag/layer/active/static). NOT for Transform - use update_component instead.',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'update'])
export class UpdateGameObjectTool extends BaseTool {
  get name() {
    return 'update_gameobject';
  }

  get description() {
    return 'Updates GameObject metadata (name/tag/layer/active/static). NOT for Transform - use update_component instead.';
  }

  get inputSchema() {
    return UpdateGameObjectToolArgsSchema;
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
