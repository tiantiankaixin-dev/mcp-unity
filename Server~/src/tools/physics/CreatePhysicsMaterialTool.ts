import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const PhysicMaterialCombineSchema = z.enum(['Average', 'Minimum', 'Maximum', 'Multiply']);

const CreatePhysicsMaterialArgsSchema = z.object({
  materialName: z.string().describe('Name of the physics material'),
  savePath: z.string().default('Assets/Physics').describe('Path where the material will be saved'),
  dynamicFriction: z.number().min(0).max(1).default(0.6).describe('Dynamic friction coefficient (0-1)'),
  staticFriction: z.number().min(0).max(1).default(0.6).describe('Static friction coefficient (0-1)'),
  frictionCombine: PhysicMaterialCombineSchema.default('Average').describe('How friction is combined'),
  bounciness: z.number().min(0).max(1).default(0).describe('Bounciness/restitution coefficient (0-1)'),
  bounceCombine: PhysicMaterialCombineSchema.default('Average').describe('How bounciness is combined')
});

@Tool({
  name: 'create_physics_material',
  description: 'Create a new PhysicMaterial asset with friction and bounciness properties',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'material', 'friction', 'bounciness'])
@Examples([
  {
    description: 'Create a bouncy material',
    args: {
      materialName: 'Bouncy',
      savePath: 'Assets/Physics',
      bounciness: 0.9,
      dynamicFriction: 0.3,
      staticFriction: 0.3,
      bounceCombine: 'Maximum'
    }
  },
  {
    description: 'Create an icy (slippery) material',
    args: {
      materialName: 'Ice',
      savePath: 'Assets/Physics',
      dynamicFriction: 0.05,
      staticFriction: 0.05,
      bounciness: 0.1,
      frictionCombine: 'Minimum'
    }
  },
  {
    description: 'Create a rubber material',
    args: {
      materialName: 'Rubber',
      dynamicFriction: 0.8,
      staticFriction: 0.9,
      bounciness: 0.7
    }
  }
])
export class CreatePhysicsMaterialTool extends BaseTool {
  get name() { return 'create_physics_material'; }
  get description() { return 'Create a new PhysicMaterial asset with friction and bounciness properties'; }
  get inputSchema() { return CreatePhysicsMaterialArgsSchema; }
  get category() { return 'physics'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(args.materialName)) {
      throw new Error('Material name must start with an uppercase letter and contain only alphanumeric characters');
    }
    if (!args.savePath.startsWith('Assets/')) {
      throw new Error('Save path must start with "Assets/"');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { materialPath, materialName, properties } = result;
    let propertiesText = '';
    if (properties) {
      propertiesText = '\n\n📝 Properties:\n';
      propertiesText += `  • Dynamic Friction: ${properties.dynamicFriction}\n`;
      propertiesText += `  • Static Friction: ${properties.staticFriction}\n`;
      propertiesText += `  • Bounciness: ${properties.bounciness}\n`;
      propertiesText += `  • Friction Combine: ${properties.frictionCombine}\n`;
      propertiesText += `  • Bounce Combine: ${properties.bounceCombine}\n`;
    }
    return {
      content: [{
        type: 'text',
        text: `✅ Successfully created PhysicMaterial: ${materialName}\n📁 Location: ${materialPath}${propertiesText}\n\n💡 Tip: Apply this material to colliders to change their physical properties.`
      }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    if (errorMessage.includes('already exists')) {
      helpText = '\n\n💡 Tip: Choose a different name or delete the existing material first.';
    } else if (errorMessage.includes('invalid path')) {
      helpText = '\n\n💡 Tip: Make sure the path starts with "Assets/" and the directory exists.';
    }
    return {
      content: [{ type: 'text', text: `❌ Error creating PhysicMaterial: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

