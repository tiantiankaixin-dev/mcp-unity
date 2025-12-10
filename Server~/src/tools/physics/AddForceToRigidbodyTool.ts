import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const ForceModeSchema = z.enum(['Force', 'Acceleration', 'Impulse', 'VelocityChange']);

const AddForceToRigidbodyArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred, returned from create_primitive_object etc.)'),
  gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
  force: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).describe('Force vector in world coordinates'),
  forceMode: ForceModeSchema.default('Force').describe('Type of force to apply'),
  forceType: z.enum(['Force', 'RelativeForce', 'Torque', 'RelativeTorque']).default('Force')
    .describe('Whether to apply force, relative force, torque, or relative torque'),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number()
  }).optional().describe('Position in world coordinates (for ForceAtPosition)'),
  wakeUp: z.boolean().default(true).describe('Wake up the rigidbody if sleeping')
});

@Tool({
  name: 'add_force_to_rigidbody',
  description: 'Apply force, acceleration, impulse, or torque to a Rigidbody for physics-based movement',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'rigidbody', 'force', 'impulse', 'torque'])
@Examples([
  {
    description: 'Apply upward force for jumping',
    args: {
      gameObjectPath: 'Player',
      force: { x: 0, y: 500, z: 0 },
      forceMode: 'Impulse'
    }
  },
  {
    description: 'Apply continuous forward force',
    args: {
      gameObjectPath: 'Car',
      force: { x: 0, y: 0, z: 1000 },
      forceMode: 'Force',
      forceType: 'RelativeForce'
    }
  },
  {
    description: 'Apply torque for rotation',
    args: {
      gameObjectPath: 'Wheel',
      force: { x: 0, y: 100, z: 0 },
      forceMode: 'Force',
      forceType: 'Torque'
    }
  }
])
export class AddForceToRigidbodyTool extends BaseTool {
  get name() { return 'add_force_to_rigidbody'; }
  get description() { return 'Apply force, acceleration, impulse, or torque to a Rigidbody for physics-based movement'; }
  get inputSchema() { return AddForceToRigidbodyArgsSchema; }
  get category() { return 'physics'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
      throw new Error('GameObject path cannot be empty');
    }
    const forceMagnitude = Math.sqrt(
      args.force.x * args.force.x + 
      args.force.y * args.force.y + 
      args.force.z * args.force.z
    );
    if (forceMagnitude === 0) {
      this.logger.warn('Force magnitude is zero, no effect will be applied');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { gameObjectPath, forceApplied, forceMode, forceType } = result;
    let forceModeDescription = '';
    switch (forceMode) {
      case 'Force': forceModeDescription = 'continuous force (considers mass and time)'; break;
      case 'Acceleration': forceModeDescription = 'continuous acceleration (ignores mass)'; break;
      case 'Impulse': forceModeDescription = 'instant impulse (considers mass)'; break;
      case 'VelocityChange': forceModeDescription = 'instant velocity change (ignores mass)'; break;
    }
    return {
      content: [{
        type: 'text',
        text: `✅ Successfully applied ${forceType} to Rigidbody\n🎮 GameObject: ${gameObjectPath}\n⚡ Force: (${forceApplied.x}, ${forceApplied.y}, ${forceApplied.z})\n📊 Mode: ${forceMode} (${forceModeDescription})\n\n💡 Tip: Use FixedUpdate for consistent physics-based forces.`
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
    } else if (errorMessage.includes('kinematic')) {
      helpText = '\n\n💡 Tip: Cannot apply forces to kinematic Rigidbodies. Set isKinematic to false.';
    }
    return {
      content: [{ type: 'text', text: `❌ Error applying force: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

