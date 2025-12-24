import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for select_gameobject tool
 */
const SelectGameObjectToolArgsSchema = z.object({
  objectPath: z
    .string()
    .optional()
    .describe('Hierarchy path to the GameObject. Example: "Parent/Child/Target"'),
  objectName: z
    .string()
    .optional()
    .describe('Name of the GameObject to select (searches in scene)'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Instance ID of the GameObject to select')
}).refine(data => data.objectPath || data.objectName || data.instanceId !== undefined, {
  message: "Required parameter 'objectPath', 'objectName' or 'instanceId' not provided"
});

/**
 * SelectGameObject Tool
 * Selects a GameObject in the hierarchy
 */
@Tool({
  name: 'select_gameobject',
  description: 'Selects a GameObject in the hierarchy',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'selection'])
export class SelectGameObjectTool extends BaseTool {
  get name() {
    return 'select_gameobject';
  }

  get description() {
    return 'Selects a GameObject in the hierarchy';
  }

  get inputSchema() {
    return SelectGameObjectToolArgsSchema;
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
