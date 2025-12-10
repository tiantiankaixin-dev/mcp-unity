import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_animation_clip tool
 */
const CreateAnimationClipToolArgsSchema = z.object({
  clipName: z.string().optional().default('NewAnimation').describe('Name for the animation clip. Default: "NewAnimation"'),
  savePath: z.string().optional().default('Assets/Animations').describe('Path to save the clip. Default: "Assets/Animations"'),
  length: z.number().optional().default(1).describe('Length of the animation in seconds. Default: 1'),
  looping: z.boolean().optional().default(true).describe('Whether the animation should loop. Default: true')
});

/**
 * CreateAnimationClip Tool
 * Creates a new animation clip
 */
@Tool({
  name: 'create_animation_clip',
  description: 'Creates a new animation clip',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'clip'])
export class CreateAnimationClipTool extends BaseTool {
  get name() {
    return 'create_animation_clip';
  }

  get description() {
    return 'Creates a new animation clip';
  }

  get inputSchema() {
    return CreateAnimationClipToolArgsSchema;
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
