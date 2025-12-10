import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for update_component tool
 */
const UpdateComponentToolArgsSchema = z.object({
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Instance ID of the GameObject. Either instanceId or objectPath must be provided'),
  objectPath: z
    .string()
    .optional()
    .describe('Hierarchy path to the GameObject. Either instanceId or objectPath must be provided'),
  componentName: z
    .string()
    .describe('Name of the component type to update. Examples: "Transform", "Rigidbody", "BoxCollider"'),
  componentData: z
    .record(z.any())
    .describe('Object containing component properties to update. Example: {"mass": 10, "useGravity": true}')
});

/**
 * UpdateComponent Tool
 * Updates component properties
 */
@Tool({
  name: 'update_component',
  description: 'Updates component properties',
  category: 'component',
  version: '1.0.0'
})
@Tags(['unity', 'component', 'update'])
export class UpdateComponentTool extends BaseTool {
  get name() {
    return 'update_component';
  }

  get description() {
    return 'Updates component properties';
  }

  get inputSchema() {
    return UpdateComponentToolArgsSchema;
  }

  get category() {
    return 'component';
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
