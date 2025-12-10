import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_timeline tool
 */
const CreateTimelineToolArgsSchema = z.object({
  timelineName: z.string().optional().default('NewTimeline').describe('Name for the timeline asset. Default: "NewTimeline"'),
  savePath: z.string().optional().default('Assets/Timelines').describe('Path to save the timeline. Default: "Assets/Timelines"'),
  createDirector: z.boolean().optional().default(true).describe('Whether to create a PlayableDirector GameObject. Default: true')
});

/**
 * CreateTimeline Tool
 * Creates a Timeline asset
 */
@Tool({
  name: 'create_timeline',
  description: 'Creates a Timeline asset',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'timeline'])
export class CreateTimelineTool extends BaseTool {
  get name() {
    return 'create_timeline';
  }

  get description() {
    return 'Creates a Timeline asset';
  }

  get inputSchema() {
    return CreateTimelineToolArgsSchema;
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
