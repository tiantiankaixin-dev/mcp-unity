import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for add_asset_to_scene tool
 */
const AddAssetToSceneToolArgsSchema = z.object({
  assetPath: z.string().optional().describe('Path to the asset to instantiate. Example: "Assets/Prefabs/MyPrefab.prefab"'),
  guid: z.string().optional().describe('GUID of the asset to instantiate (alternative to assetPath)'),
  position: z.object({
    x: z.number().optional().default(0),
    y: z.number().optional().default(0),
    z: z.number().optional().default(0)
  }).optional().describe('Position to place the instantiated object. Default: (0, 0, 0)')
});

/**
 * AddAssetToScene Tool
 * Adds asset to scene
 */
@Tool({
  name: 'add_asset_to_scene',
  description: 'Adds asset to scene',
  category: 'prefab',
  version: '1.0.0'
})
@Tags(['unity', 'prefab', 'scene'])
export class AddAssetToSceneTool extends BaseTool {
  get name() {
    return 'add_asset_to_scene';
  }

  get description() {
    return 'Adds asset to scene';
  }

  get inputSchema() {
    return AddAssetToSceneToolArgsSchema;
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
