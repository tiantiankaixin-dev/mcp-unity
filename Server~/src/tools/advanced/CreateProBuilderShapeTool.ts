import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_probuilder_shape tool
 */
const CreateProBuilderShapeToolArgsSchema = z.object({
  shapeName: z.string().optional().default('ProBuilderShape').describe('Name for the ProBuilder shape GameObject. Default: "ProBuilderShape"'),
  shapeType: z.string().optional().default('cube').describe('Type of shape: "cube", "sphere", "cylinder", "plane", etc. Default: "cube"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position. Default: 0'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0'),
  size: z.number().optional().default(1).describe('Size of the shape. Default: 1')
});

/**
 * CreateProBuilderShape Tool
 * Creates ProBuilder shape
 */
@Tool({
  name: 'create_probuilder_shape',
  description: 'Creates ProBuilder shape',
  category: 'advanced',
  version: '1.0.0'
})
@Tags(['unity', 'probuilder', 'advanced'])
export class CreateProBuilderShapeTool extends BaseTool {
  get name() {
    return 'create_probuilder_shape';
  }

  get description() {
    return 'Creates ProBuilder shape';
  }

  get inputSchema() {
    return CreateProBuilderShapeToolArgsSchema;
  }

  get category() {
    return 'advanced';
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
