import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_infinite_mountain tool
 */
const CreateInfiniteMountainToolArgsSchema = z.object({
  terrainName: z.string().optional().default('InfiniteMountain')
    .describe('Name for the terrain manager GameObject. Default: "InfiniteMountain"'),
  chunkSize: z.number().int().optional().default(256)
    .describe('Size of each terrain chunk in units. Default: 256'),
  terrainHeight: z.number().optional().default(300)
    .describe('Maximum height of mountains. Default: 300'),
  viewDistance: z.number().int().optional().default(2)
    .describe('View distance in chunks (how many chunks to load around the viewer). Default: 2'),
  mountainScale: z.number().optional().default(0.005)
    .describe('Scale of main mountain features (smaller = larger mountains). Default: 0.005'),
  detailScale: z.number().optional().default(0.02)
    .describe('Scale of detail noise. Default: 0.02'),
  ridgeIntensity: z.number().optional().default(0.3)
    .describe('Intensity of mountain ridges (0-1). Default: 0.3'),
  seed: z.number().int().optional()
    .describe('Random seed for terrain generation. Random if not specified.'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0)
    .describe('X position of terrain manager. Default: 0'),
  posY: z.number().optional().default(0)
    .describe('Y position of terrain manager. Default: 0'),
  posZ: z.number().optional().default(0)
    .describe('Z position of terrain manager. Default: 0'),
  createViewer: z.boolean().optional().default(true)
    .describe('Whether to create a viewer camera with fly controls. Default: true')
});

/**
 * CreateInfiniteMountain Tool
 * Creates an infinite procedural mountain terrain that generates dynamically as the player moves.
 */
@Tool({
  name: 'create_infinite_mountain',
  description: 'Create an infinite procedural mountain terrain that generates dynamically. Features rocky mountain landscapes with realistic textures. Terrain chunks load/unload based on viewer position.',
  category: 'terrain',
  version: '1.0.0'
})
@Tags(['unity', 'terrain', 'mountain', 'procedural', 'infinite', 'landscape', 'generation'])
export class CreateInfiniteMountainTool extends BaseTool {
  get name() {
    return 'create_infinite_mountain';
  }

  get description() {
    return 'Create an infinite procedural mountain terrain that generates dynamically. Features rocky mountain landscapes with realistic textures. Terrain chunks load/unload based on viewer position.';
  }

  get inputSchema() {
    return CreateInfiniteMountainToolArgsSchema;
  }

  get category() {
    return 'terrain';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const content: any[] = [];
    
    let message = `✅ ${result.message || 'Infinite mountain terrain created successfully'}`;
    
    if (result.settings) {
      message += `\n\n📊 Settings:`;
      message += `\n  • Chunk Size: ${result.settings.chunkSize}`;
      message += `\n  • Terrain Height: ${result.settings.terrainHeight}`;
      message += `\n  • View Distance: ${result.settings.viewDistance} chunks`;
      message += `\n  • Mountain Scale: ${result.settings.mountainScale}`;
      message += `\n  • Seed: ${result.settings.seed}`;
    }
    
    if (result.hint) {
      message += `\n\n💡 ${result.hint}`;
    }

    content.push({
      type: 'text',
      text: message
    });

    return { content };
  }
}
