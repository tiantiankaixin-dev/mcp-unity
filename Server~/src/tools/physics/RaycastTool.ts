import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const QueryTriggerInteractionSchema = z.enum(['UseGlobal', 'Ignore', 'Collide']);

const RaycastArgsSchema = z.object({
  origin: z.object({ x: z.number(), y: z.number(), z: z.number() }).describe('Ray origin in world coordinates'),
  direction: z.object({ x: z.number(), y: z.number(), z: z.number() }).describe('Ray direction (will be normalized)'),
  maxDistance: z.number().positive().default(Infinity).describe('Maximum distance of the ray'),
  layerMask: z.string().optional().describe('Layer mask to filter colliders (e.g., "Default,Player")'),
  queryTriggerInteraction: QueryTriggerInteractionSchema.default('UseGlobal').describe('Whether to hit trigger colliders'),
  returnAllHits: z.boolean().default(false).describe('Return all hits instead of just the first'),
  drawDebugRay: z.boolean().default(false).describe('Draw debug ray in Scene view'),
  debugRayColor: z.string().default('red').describe('Color of debug ray'),
  debugRayDuration: z.number().default(2).describe('Duration to show debug ray in seconds')
});

@Tool({
  name: 'raycast',
  description: 'Perform raycasting to detect colliders along a ray, useful for line-of-sight, shooting, and ground detection',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'raycast', 'detection', 'collision'])
@Examples([
  {
    description: 'Raycast downward for ground detection',
    args: {
      origin: { x: 0, y: 10, z: 0 },
      direction: { x: 0, y: -1, z: 0 },
      maxDistance: 20,
      drawDebugRay: true
    }
  },
  {
    description: 'Raycast forward from player position',
    args: {
      origin: { x: 0, y: 1, z: 0 },
      direction: { x: 0, y: 0, z: 1 },
      maxDistance: 100,
      layerMask: 'Default,Enemy',
      drawDebugRay: true,
      debugRayColor: 'green'
    }
  }
])
export class RaycastTool extends BaseTool {
  get name() { return 'raycast'; }
  get description() { return 'Perform raycasting to detect colliders along a ray, useful for line-of-sight, shooting, and ground detection'; }
  get inputSchema() { return RaycastArgsSchema; }
  get category() { return 'physics'; }

  protected async beforeExecute(args: any): Promise<void> {
    const dirMagnitude = Math.sqrt(
      args.direction.x * args.direction.x + 
      args.direction.y * args.direction.y + 
      args.direction.z * args.direction.z
    );
    if (dirMagnitude === 0) {
      throw new Error('Direction vector cannot be zero');
    }
    if (args.maxDistance <= 0) {
      throw new Error('Max distance must be positive');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { hit, hits, origin, direction, maxDistance } = result;
    
    if (!hit && (!hits || hits.length === 0)) {
      return {
        content: [{
          type: 'text',
          text: `🔍 Raycast completed - No hits\n📍 Origin: (${origin.x}, ${origin.y}, ${origin.z})\n➡️  Direction: (${direction.x}, ${direction.y}, ${direction.z})\n📏 Max Distance: ${maxDistance}`
        }]
      };
    }

    let output = `✅ Raycast hit detected!\n📍 Origin: (${origin.x}, ${origin.y}, ${origin.z})\n➡️  Direction: (${direction.x}, ${direction.y}, ${direction.z})\n\n`;

    if (hits && hits.length > 0) {
      output += `🎯 Found ${hits.length} hit(s):\n\n`;
      hits.forEach((h: any, index: number) => {
        output += `${index + 1}. ${h.colliderName || 'Unknown'}\n`;
        output += `   • Distance: ${h.distance.toFixed(2)}\n`;
        output += `   • Point: (${h.point.x.toFixed(2)}, ${h.point.y.toFixed(2)}, ${h.point.z.toFixed(2)})\n`;
        if (h.gameObjectPath) output += `   • GameObject: ${h.gameObjectPath}\n`;
        output += '\n';
      });
    } else if (hit) {
      output += `🎯 Hit: ${hit.colliderName || 'Unknown'}\n`;
      output += `📏 Distance: ${hit.distance.toFixed(2)}\n`;
      output += `📍 Point: (${hit.point.x.toFixed(2)}, ${hit.point.y.toFixed(2)}, ${hit.point.z.toFixed(2)})\n`;
      if (hit.gameObjectPath) output += `🎮 GameObject: ${hit.gameObjectPath}\n`;
    }

    return { content: [{ type: 'text', text: output }] };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    if (errorMessage.includes('zero')) {
      helpText = '\n\n💡 Tip: Direction vector cannot be zero. Provide a valid direction.';
    }
    return {
      content: [{ type: 'text', text: `❌ Error performing raycast: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

