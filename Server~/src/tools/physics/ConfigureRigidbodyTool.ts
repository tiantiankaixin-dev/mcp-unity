import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const RigidbodyConstraintsSchema = z.enum([
  'None', 'FreezePositionX', 'FreezePositionY', 'FreezePositionZ',
  'FreezeRotationX', 'FreezeRotationY', 'FreezeRotationZ',
  'FreezePosition', 'FreezeRotation', 'FreezeAll'
]);

const CollisionDetectionModeSchema = z.enum([
  'Discrete', 'Continuous', 'ContinuousDynamic', 'ContinuousSpeculative'
]);

const ConfigureRigidbodyArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred, returned from create_primitive_object etc.)'),
  gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
  mass: z.number().positive().optional().describe('Mass in kilograms'),
  drag: z.number().min(0).optional().describe('Drag coefficient'),
  angularDrag: z.number().min(0).optional().describe('Angular drag coefficient'),
  useGravity: z.boolean().optional().describe('Use gravity'),
  isKinematic: z.boolean().optional().describe('Is kinematic'),
  centerOfMass: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  constraints: z.array(RigidbodyConstraintsSchema).optional(),
  collisionDetectionMode: CollisionDetectionModeSchema.optional(),
  interpolation: z.enum(['None', 'Interpolate', 'Extrapolate']).optional(),
  maxAngularVelocity: z.number().positive().optional(),
  sleepThreshold: z.number().min(0).optional()
}).refine(data => data.instanceId !== undefined || data.gameObjectPath, {
  message: "Either 'instanceId' or 'gameObjectPath' is required"
});

@Tool({
  name: 'configure_rigidbody',
  description: 'Configure detailed Rigidbody properties including mass, drag, constraints, and collision detection',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'rigidbody', 'configuration'])
@Examples([
  {
    description: 'Configure basic rigidbody properties',
    args: {
      gameObjectPath: 'Player',
      mass: 75,
      drag: 0.5,
      useGravity: true
    }
  },
  {
    description: 'Create kinematic rigidbody with constraints',
    args: {
      gameObjectPath: 'Door',
      isKinematic: false,
      constraints: ['FreezePositionX', 'FreezePositionZ'],
      collisionDetectionMode: 'Continuous'
    }
  }
])
export class ConfigureRigidbodyTool extends BaseTool {
  get name() { return 'configure_rigidbody'; }
  get description() { return 'Configure detailed Rigidbody properties including mass, drag, constraints, and collision detection'; }
  get inputSchema() { return ConfigureRigidbodyArgsSchema; }
  get category() { return 'physics'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
      throw new Error('GameObject path cannot be empty');
    }
    if (args.mass !== undefined && args.mass <= 0) {
      throw new Error('Mass must be greater than 0');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { gameObjectPath, configuredProperties } = result;
    let propertiesText = '';
    if (configuredProperties && Object.keys(configuredProperties).length > 0) {
      propertiesText = '\n\n📝 Configured properties:\n';
      for (const [key, value] of Object.entries(configuredProperties)) {
        propertiesText += `  • ${key}: ${JSON.stringify(value)}\n`;
      }
    }
    return {
      content: [{
        type: 'text',
        text: `✅ Successfully configured Rigidbody\n🎮 GameObject: ${gameObjectPath}${propertiesText}\n\n💡 Tip: The physics simulation will use these settings in Play mode.`
      }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    if (errorMessage.includes('not found')) {
      helpText = '\n\n💡 Tip: Make sure the GameObject exists in the scene hierarchy.';
    } else if (errorMessage.includes('no Rigidbody')) {
      helpText = '\n\n💡 Tip: Add a Rigidbody component first using add_rigidbody tool.';
    }
    return {
      content: [{ type: 'text', text: `❌ Error configuring Rigidbody: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

