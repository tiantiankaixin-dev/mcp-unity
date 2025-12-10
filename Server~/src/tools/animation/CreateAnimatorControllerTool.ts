import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_animator_controller tool
 */
const CreateAnimatorControllerToolArgsSchema = z.object({
  controllerName: z.string().optional().default('NewAnimatorController').describe('Name for the animator controller. Default: "NewAnimatorController"'),
  savePath: z.string().optional().default('Assets/Animations').describe('Path to save the controller. Default: "Assets/Animations"')
});

/**
 * CreateAnimatorController Tool
 * Creates an Animator Controller
 */
@Tool({
  name: 'create_animator_controller',
  description: 'Creates an Animator Controller',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'animator'])
export class CreateAnimatorControllerTool extends BaseTool {
  get name() {
    return 'create_animator_controller';
  }

  get description() {
    return 'Creates an Animator Controller';
  }

  get inputSchema() {
    return CreateAnimatorControllerToolArgsSchema;
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
