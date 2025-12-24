import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_post_process_volume tool
 */
const CreatePostProcessVolumeToolArgsSchema = z.object({
  volumeName: z.string().optional().default('PostProcessVolume').describe('Name for the post-process volume GameObject. Default: "PostProcessVolume"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position. Default: 0'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0'),
  isGlobal: z.boolean().optional().default(true).describe('Whether the volume is global. Default: true')
});

/**
 * CreatePostProcessVolume Tool
 * Creates a Post Process Volume
 */
@Tool({
  name: 'create_post_process_volume',
  description: 'Creates a Post Process Volume',
  category: 'lighting',
  version: '1.0.0'
})
@Tags(['unity', 'lighting', 'postprocess'])
export class CreatePostProcessVolumeTool extends BaseTool {
  get name() {
    return 'create_post_process_volume';
  }

  get description() {
    return 'Creates a Post Process Volume';
  }

  get inputSchema() {
    return CreatePostProcessVolumeToolArgsSchema;
  }

  get category() {
    return 'lighting';
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
