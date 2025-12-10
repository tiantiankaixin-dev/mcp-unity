import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const SetAnimatorParameterArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred, returned from create_primitive_object etc.)'),
  gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject with Animator component (alternative to instanceId)'),
  parameterName: z.string().describe('Name of the animator parameter'),
  parameterType: z.enum(['Float', 'Int', 'Bool', 'Trigger']).describe('Type of parameter'),
  value: z.union([z.number(), z.boolean()]).optional().describe('Value to set (not needed for Trigger)'),
  createIfNotExists: z.boolean().default(false).describe('Create parameter if it does not exist'),
  defaultValue: z.union([z.number(), z.boolean()]).optional().describe('Default value when creating parameter')
});

@Tool({
  name: 'set_animator_parameter',
  description: 'Set animator parameters (Float, Int, Bool, Trigger) on a GameObject at runtime or in edit mode',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'animator', 'parameter', 'runtime'])
@Examples([
  {
    description: 'Set float parameter (speed)',
    args: {
      gameObjectPath: 'Player',
      parameterName: 'Speed',
      parameterType: 'Float',
      value: 5.5
    }
  },
  {
    description: 'Set bool parameter (is grounded)',
    args: {
      gameObjectPath: 'Player',
      parameterName: 'IsGrounded',
      parameterType: 'Bool',
      value: true
    }
  },
  {
    description: 'Trigger animation (jump)',
    args: {
      gameObjectPath: 'Player',
      parameterName: 'Jump',
      parameterType: 'Trigger'
    }
  },
  {
    description: 'Set int parameter with auto-create',
    args: {
      gameObjectPath: 'Enemy',
      parameterName: 'AttackType',
      parameterType: 'Int',
      value: 2,
      createIfNotExists: true,
      defaultValue: 0
    }
  }
])
export class SetAnimatorParameterTool extends BaseTool {
  get name() { return 'set_animator_parameter'; }
  get description() { return 'Set animator parameters (Float, Int, Bool, Trigger) on a GameObject at runtime or in edit mode'; }
  get inputSchema() { return SetAnimatorParameterArgsSchema; }
  get category() { return 'animation'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
      throw new Error('GameObject path cannot be empty');
    }
    if (!args.parameterName || args.parameterName.trim() === '') {
      throw new Error('Parameter name cannot be empty');
    }
    
    // Validate value based on parameter type
    if (args.parameterType !== 'Trigger' && args.value === undefined) {
      throw new Error(`Value is required for ${args.parameterType} parameter`);
    }
    
    if (args.parameterType === 'Float' && typeof args.value !== 'number') {
      throw new Error('Value must be a number for Float parameter');
    }
    
    if (args.parameterType === 'Int') {
      if (typeof args.value !== 'number') {
        throw new Error('Value must be a number for Int parameter');
      }
      if (!Number.isInteger(args.value)) {
        throw new Error('Value must be an integer for Int parameter');
      }
    }
    
    if (args.parameterType === 'Bool' && typeof args.value !== 'boolean') {
      throw new Error('Value must be a boolean for Bool parameter');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { gameObjectPath, parameterName, parameterType, value, created } = result;
    
    let output = `Success! Set animator parameter\n`;
    output += `GameObject: ${gameObjectPath}\n`;
    output += `Parameter: ${parameterName} (${parameterType})\n`;
    
    if (parameterType === 'Trigger') {
      output += `Action: Triggered\n`;
    } else {
      output += `Value: ${value}\n`;
    }
    
    if (created) {
      output += `Status: Parameter was created\n`;
    }
    
    output += `\nTip: The animator will respond to this parameter change.`;
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('GameObject not found')) {
      helpText = '\n\nTip: Make sure the GameObject exists in the scene hierarchy.';
    } else if (errorMessage.includes('Animator not found')) {
      helpText = '\n\nTip: The GameObject does not have an Animator component.';
    } else if (errorMessage.includes('parameter not found')) {
      helpText = '\n\nTip: The parameter does not exist. Set createIfNotExists to true to create it.';
    } else if (errorMessage.includes('type mismatch')) {
      helpText = '\n\nTip: The parameter exists but has a different type.';
    }
    
    return {
      content: [{ type: 'text', text: `Error setting animator parameter: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

