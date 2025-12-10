import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for add_animator tool
 */
const AddAnimatorToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of GameObject instance IDs to add Animator component to'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Single GameObject instance ID (alternative to instanceIds)'),
  controllerPath: z
    .string()
    .optional()
    .describe('Optional path to AnimatorController asset. Example: "Assets/Animations/MyController.controller"')
}).refine(data => data.instanceIds || data.instanceId, {
  message: 'Either instanceIds or instanceId is required'
}).transform(data => ({
  instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : []),
  controllerPath: data.controllerPath
}));

/**
 * AddAnimator Tool
 * Adds Animator component to GameObject
 */
@Tool({
  name: 'add_animator',
  description: 'Adds Animator component to GameObject',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'animator'])
export class AddAnimatorTool extends BaseTool {
  get name() {
    return 'add_animator';
  }

  get description() {
    return 'Adds Animator component to GameObject';
  }

  get inputSchema() {
    return AddAnimatorToolArgsSchema;
  }

  get category() {
    return 'animation';
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
