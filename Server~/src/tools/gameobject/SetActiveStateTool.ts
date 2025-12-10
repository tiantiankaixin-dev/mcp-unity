import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_active_state tool
 */
const SetActiveStateToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of GameObject instance IDs to set active state'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Single GameObject instance ID (alternative to instanceIds)'),
  active: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to activate (true) or deactivate (false) the GameObjects. Default: true')
}).refine(data => data.instanceIds || data.instanceId, {
  message: 'Either instanceIds or instanceId is required'
}).transform(data => ({
  instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : []),
  active: data.active
}));

/**
 * SetActiveState Tool
 * Sets GameObject active/inactive state
 */
@Tool({
  name: 'set_active_state',
  description: 'Sets GameObject active/inactive state',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'active'])
export class SetActiveStateTool extends BaseTool {
  get name() {
    return 'set_active_state';
  }

  get description() {
    return 'Sets GameObject active/inactive state';
  }

  get inputSchema() {
    return SetActiveStateToolArgsSchema;
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
