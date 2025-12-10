import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_tag tool
 */
const SetTagToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of GameObject instance IDs to set tag'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Single GameObject instance ID (alternative to instanceIds)'),
  tagName: z
    .string()
    .optional()
    .describe('Name of the tag to set. Example: "Player", "Enemy", "Untagged"'),
  tag: z
    .string()
    .optional()
    .describe('Alias for tagName - Name of the tag to set')
}).refine(data => data.instanceIds || data.instanceId, {
  message: 'Either instanceIds or instanceId is required'
}).refine(data => data.tagName || data.tag, {
  message: 'Either tagName or tag is required'
}).transform(data => ({
  instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : []),
  tagName: data.tagName || data.tag || ''
}));

/**
 * SetTag Tool
 * Sets GameObject tag
 */
@Tool({
  name: 'set_tag',
  description: 'Sets GameObject tag',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'tag'])
export class SetTagTool extends BaseTool {
  get name() {
    return 'set_tag';
  }

  get description() {
    return 'Sets GameObject tag';
  }

  get inputSchema() {
    return SetTagToolArgsSchema;
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
