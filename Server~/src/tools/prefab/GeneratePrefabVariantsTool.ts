import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for generate_prefab_variants tool
 */
const GeneratePrefabVariantsToolArgsSchema = z.object({
  basePrefabPath: z.string().optional().describe('Path to the base prefab. Example: "Assets/Prefabs/MyPrefab.prefab"'),
  count: z.number().int().optional().default(1).describe('Number of variants to generate. Default: 1'),
  outputFolder: z.string().optional().default('Assets/Prefabs/Variants').describe('Folder to save variants. Default: "Assets/Prefabs/Variants"'),
  namePrefix: z.string().optional().default('Variant_').describe('Prefix for variant names. Default: "Variant_"')
});

/**
 * GeneratePrefabVariants Tool
 * Generates prefab variants
 */
@Tool({
  name: 'generate_prefab_variants',
  description: 'Generates prefab variants',
  category: 'prefab',
  version: '1.0.0'
})
@Tags(['unity', 'prefab', 'variant'])
export class GeneratePrefabVariantsTool extends BaseTool {
  get name() {
    return 'generate_prefab_variants';
  }

  get description() {
    return 'Generates prefab variants';
  }

  get inputSchema() {
    return GeneratePrefabVariantsToolArgsSchema;
  }

  get category() {
    return 'prefab';
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
