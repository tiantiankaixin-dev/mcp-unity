import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const QueryTriggerInteractionSchema = z.enum(['UseGlobal', 'Ignore', 'Collide']);

const OverlapSphereArgsSchema = z.object({
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }).describe('Center of the sphere in world coordinates'),
  radius: z.number().positive().describe('Radius of the sphere'),
  layerMask: z.string().optional().describe('Layer mask to filter colliders (e.g., "Default,Player")'),
  queryTriggerInteraction: QueryTriggerInteractionSchema.default('UseGlobal').describe('Whether to detect trigger colliders'),
  includeDetails: z.boolean().default(true).describe('Include detailed information about each collider'),
  drawDebugSphere: z.boolean().default(false).describe('Draw debug sphere in Scene view'),
  debugSphereColor: z.string().default('yellow').describe('Color of debug sphere'),
  debugSphereDuration: z.number().default(2).describe('Duration to show debug sphere in seconds')
});

@Tool({
  name: 'overlap_sphere',
  description: 'Detect all colliders touching or inside a sphere, useful for explosion damage, area detection, and proximity checks',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'overlap', 'detection', 'area', 'proximity'])
@Examples([
  {
    description: 'Detect objects in explosion radius',
    args: {
      position: { x: 0, y: 0, z: 0 },
      radius: 10,
      drawDebugSphere: true,
      debugSphereColor: 'red'
    }
  },
  {
    description: 'Find enemies near player',
    args: {
      position: { x: 0, y: 1, z: 0 },
      radius: 15,
      layerMask: 'Enemy',
      includeDetails: true
    }
  },
  {
    description: 'Detect pickups in area',
    args: {
      position: { x: 5, y: 0, z: 5 },
      radius: 3,
      layerMask: 'Pickup',
      queryTriggerInteraction: 'Collide',
      drawDebugSphere: true
    }
  }
])
export class OverlapSphereTool extends BaseTool {
  get name() { return 'overlap_sphere'; }
  get description() { return 'Detect all colliders touching or inside a sphere, useful for explosion damage, area detection, and proximity checks'; }
  get inputSchema() { return OverlapSphereArgsSchema; }
  get category() { return 'physics'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (args.radius <= 0) {
      throw new Error('Radius must be positive');
    }
    if (args.radius > 1000) {
      this.logger.warn('Very large radius may impact performance');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { colliders, position, radius } = result;
    
    if (!colliders || colliders.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `🔍 Overlap sphere completed - No colliders found\n📍 Position: (${position.x}, ${position.y}, ${position.z})\n⭕ Radius: ${radius}\n\n💡 Tip: Try increasing the radius or adjusting the layer mask.`
        }]
      };
    }

    let output = `✅ Found ${colliders.length} collider(s) in sphere\n📍 Position: (${position.x}, ${position.y}, ${position.z})\n⭕ Radius: ${radius}\n\n`;
    output += `🎯 Detected colliders:\n\n`;
    
    colliders.forEach((collider: any, index: number) => {
      output += `${index + 1}. ${collider.name || 'Unknown'}\n`;
      if (collider.gameObjectPath) output += `   • GameObject: ${collider.gameObjectPath}\n`;
      if (collider.type) output += `   • Type: ${collider.type}\n`;
      if (collider.isTrigger !== undefined) output += `   • Is Trigger: ${collider.isTrigger}\n`;
      if (collider.distance !== undefined) output += `   • Distance from center: ${collider.distance.toFixed(2)}\n`;
      output += '\n';
    });

    output += '💡 Tip: Use this for explosion damage, area effects, or proximity detection.';
    return { content: [{ type: 'text', text: output }] };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    if (errorMessage.includes('radius')) {
      helpText = '\n\n💡 Tip: Radius must be a positive number.';
    } else if (errorMessage.includes('performance')) {
      helpText = '\n\n💡 Tip: Very large overlap spheres may impact performance. Consider using a smaller radius or layer masks.';
    }
    return {
      content: [{ type: 'text', text: `❌ Error detecting colliders: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

