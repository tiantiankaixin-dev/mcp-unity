import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_light tool
 */
const CreateLightToolArgsSchema = z.object({
  lightType: z.string().optional().default('directional').describe('Type of light: "directional", "point", "spot", "area". Default: "directional"'),
  lightName: z.string().optional().default('Light').describe('Name for the light GameObject. Default: "Light"'),
  intensity: z.number().optional().default(1).describe('Light intensity. Default: 1'),
  color: z.string().optional().default('#FFFFFF').describe('Light color in hex format. Default: "#FFFFFF"'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(3).describe('Y position. Default: 3'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0')
});

/**
 * CreateLight Tool
 * Creates a light source
 */
@Tool({
  name: 'create_light',
  description: 'Creates a light source',
  category: 'lighting',
  version: '1.0.0'
})
@Tags(['unity', 'lighting', 'light'])
export class CreateLightTool extends BaseTool {
  get name() {
    return 'create_light';
  }

  get description() {
    return 'Creates a light source';
  }

  get inputSchema() {
    return CreateLightToolArgsSchema;
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
