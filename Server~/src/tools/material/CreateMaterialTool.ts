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
  color: z.string().optional().default('#FFFFFF').describe('Material color in hex format. Example: "#FF0000". Default: "#FFFFFF"')
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
