import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_skybox tool
 */
const CreateSkyboxToolArgsSchema = z.object({
  skyboxType: z.string().optional().default('procedural').describe('Type of skybox. Options: "procedural", "6sided", "cubemap", "panoramic". Default: "procedural"'),
  color: z.array(z.number()).length(4).optional().default([1, 1, 1, 1]).describe('Color as RGBA [r,g,b,a] (0-1). Default: [1,1,1,1]')
});

/**
 * CreateSkybox Tool
 * Creates a skybox material
 */
@Tool({
  name: 'create_skybox',
  description: 'Creates a skybox material',
  category: 'material',
  version: '1.0.0'
})
@Tags(['unity', 'material', 'skybox'])
export class CreateSkyboxTool extends BaseTool {
  get name() {
    return 'create_skybox';
  }

  get description() {
    return 'Creates a skybox material';
  }

  get inputSchema() {
    return CreateSkyboxToolArgsSchema;
  }

  get category() {
    return 'material';
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
