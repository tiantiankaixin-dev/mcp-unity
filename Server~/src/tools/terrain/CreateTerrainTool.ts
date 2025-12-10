import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_terrain tool
 */
const CreateTerrainToolArgsSchema = z.object({
  terrainName: z.string().optional().default('Terrain').describe('Name for the terrain GameObject. Default: "Terrain"'),
  width: z.number().int().optional().default(500).describe('Terrain width. Default: 500'),
  length: z.number().int().optional().default(500).describe('Terrain length. Default: 500'),
  height: z.number().int().optional().default(600).describe('Terrain height. Default: 600'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position. Default: 0'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0')
});

/**
 * CreateTerrain Tool
 * Creates a terrain
 */
@Tool({
  name: 'create_terrain',
  description: 'Creates a terrain',
  category: 'terrain',
  version: '1.0.0'
})
@Tags(['unity', 'terrain', 'landscape'])
export class CreateTerrainTool extends BaseTool {
  get name() {
    return 'create_terrain';
  }

  get description() {
    return 'Creates a terrain';
  }

  get inputSchema() {
    return CreateTerrainToolArgsSchema;
  }

  get category() {
    return 'terrain';
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
