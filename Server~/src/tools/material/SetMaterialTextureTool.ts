import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_material_texture tool
 */
const SetMaterialTextureToolArgsSchema = z.object({
  texturePath: z.string().describe('Path to the texture asset. Example: "Assets/Textures/MyTexture.png"'),
  materialPath: z.string().optional().describe('Path to the material asset to modify. Example: "Assets/Materials/MyMaterial.mat"'),
  instanceIds: z.array(z.number().int()).optional().describe('Array of GameObject instance IDs to set texture on their materials'),
  propertyName: z.string().optional().default('_MainTex').describe('Material texture property name. Common values: "_MainTex" (albedo), "_BumpMap" (normal), "_MetallicGlossMap", "_EmissionMap". Default: "_MainTex"')
});

/**
 * SetMaterialTexture Tool
 * Sets a texture on a material or GameObjects' materials
 */
@Tool({
  name: 'set_material_texture',
  description: 'Sets a texture on a material asset or on GameObjects\' materials. Supports main texture, normal map, and other texture properties.',
  category: 'material',
  version: '1.0.0'
})
@Tags(['unity', 'material', 'texture', 'apply'])
export class SetMaterialTextureTool extends BaseTool {
  get name() {
    return 'set_material_texture';
  }

  get description() {
    return 'Sets a texture on a material asset or on GameObjects\' materials. Supports main texture (_MainTex), normal map (_BumpMap), and other texture properties.';
  }

  get inputSchema() {
    return SetMaterialTextureToolArgsSchema;
  }

  get category() {
    return 'material';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Texture applied successfully'}`
      }]
    };
  }
}
