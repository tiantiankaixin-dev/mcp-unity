import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_layer tool
 */
const SetLayerToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of GameObject instance IDs to set layer'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Single GameObject instance ID (alternative to instanceIds)'),
  layerName: z
    .string()
    .optional()
    .describe('Name of the layer to set. Example: "Default", "UI", "Water"'),
  layer: z
    .string()
    .optional()
    .describe('Alias for layerName - Name of the layer to set'),
  includeChildren: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to also set the layer for all child GameObjects. Default: false')
}).refine(data => data.instanceIds || data.instanceId, {
  message: 'Either instanceIds or instanceId is required'
}).refine(data => data.layerName || data.layer, {
  message: 'Either layerName or layer is required'
}).transform(data => ({
  instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : []),
  layerName: data.layerName || data.layer || '',
  includeChildren: data.includeChildren
}));

/**
 * SetLayer Tool
 * Sets GameObject layer
 */
@Tool({
  name: 'set_layer',
  description: 'Sets GameObject layer',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'layer'])
export class SetLayerTool extends BaseTool {
  get name() {
    return 'set_layer';
  }

  get description() {
    return 'Sets GameObject layer';
  }

  get inputSchema() {
    return SetLayerToolArgsSchema;
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
