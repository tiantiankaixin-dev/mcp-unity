import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_material tool
 */
const CreateMaterialToolArgsSchema = z.object({
  materialName: z.string().optional().default('NewMaterial').describe('Name for the new material. Default: "NewMaterial"'),
  savePath: z.string().optional().default('Assets/Materials').describe('Path to save the material. Default: "Assets/Materials"'),
  shaderName: z.string().optional().default('Standard').describe('Shader name. Examples: "Standard", "Unlit/Color". Default: "Standard"'),
  color: z.array(z.number()).length(4).optional().default([1, 1, 1, 1]).describe('Material color as RGBA array [r, g, b, a] with values 0-1. Default: [1, 1, 1, 1] (white)'),
  metallic: z.number().min(0).max(1).optional().default(0).describe('Metallic value (0-1). Default: 0'),
  smoothness: z.number().min(0).max(1).optional().default(0.5).describe('Smoothness value (0-1). Default: 0.5')
});

/**
 * CreateMaterial Tool
 * Creates a new material
 */
@Tool({
  name: 'create_material',
  description: 'Creates a new material',
  category: 'material',
  version: '1.0.0'
})
@Tags(['unity', 'material', 'creation'])
export class CreateMaterialTool extends BaseTool {
  get name() {
    return 'create_material';
  }

  get description() {
    return 'Creates a new material';
  }

  get inputSchema() {
    return CreateMaterialToolArgsSchema;
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
