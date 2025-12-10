import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const AddAnimationStateArgsSchema = z.object({
  animatorControllerPath: z.string().optional().describe('Path to the Animator Controller asset'),
  controllerPath: z.string().optional().describe('Alias for animatorControllerPath'),
  stateName: z.string().describe('Name of the animation state'),
  animationClipPath: z.string().optional().describe('Path to the animation clip to use'),
  clipPath: z.string().optional().describe('Alias for animationClipPath'),
  layerIndex: z.number().default(0).describe('Layer index (0 = Base Layer)'),
  position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position in the Animator window'),
  speed: z.number().default(1).describe('Animation playback speed'),
  cycleOffset: z.number().default(0).describe('Cycle offset (0-1)'),
  mirror: z.boolean().default(false).describe('Mirror animation'),
  iKOnFeet: z.boolean().default(false).describe('Enable IK on feet'),
  writeDefaultValues: z.boolean().default(true).describe('Write default values'),
  tag: z.string().optional().describe('State tag'),
  isDefaultState: z.boolean().default(false).describe('Set as default state')
}).refine(data => data.animatorControllerPath || data.controllerPath, {
  message: 'Either animatorControllerPath or controllerPath is required'
}).transform(data => ({
  ...data,
  animatorControllerPath: data.animatorControllerPath || data.controllerPath || '',
  animationClipPath: data.animationClipPath || data.clipPath
}));

@Tool({
  name: 'add_animation_state',
  description: 'Add a new animation state to an Animator Controller',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'animator', 'state-machine'])
@Examples([
  {
    description: 'Add idle animation state',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      stateName: 'Idle',
      animationClipPath: 'Assets/Animations/Idle.anim',
      isDefaultState: true
    }
  },
  {
    description: 'Add running animation with custom speed',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      stateName: 'Run',
      animationClipPath: 'Assets/Animations/Run.anim',
      speed: 1.5,
      position: { x: 300, y: 100 }
    }
  },
  {
    description: 'Add mirrored attack animation',
    args: {
      animatorControllerPath: 'Assets/Animations/EnemyAnimator.controller',
      stateName: 'AttackLeft',
      animationClipPath: 'Assets/Animations/AttackRight.anim',
      mirror: true
    }
  }
])
export class AddAnimationStateTool extends BaseTool {
  get name() { return 'add_animation_state'; }
  get description() { return 'Add a new animation state to an Animator Controller'; }
  get inputSchema() { return AddAnimationStateArgsSchema; }
  get category() { return 'animation'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.animatorControllerPath || !args.animatorControllerPath.endsWith('.controller')) {
      throw new Error('Animator Controller path must end with .controller extension');
    }
    if (!args.animatorControllerPath.startsWith('Assets/')) {
      throw new Error('Animator Controller path must start with "Assets/"');
    }
    if (!args.stateName || args.stateName.trim() === '') {
      throw new Error('State name cannot be empty');
    }
    if (args.animationClipPath && !args.animationClipPath.endsWith('.anim')) {
      throw new Error('Animation clip path must end with .anim extension');
    }
    if (args.speed < 0) {
      throw new Error('Speed must be non-negative');
    }
    if (args.cycleOffset < 0 || args.cycleOffset > 1) {
      throw new Error('Cycle offset must be between 0 and 1');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { animatorControllerPath, stateName, layerName, isDefaultState } = result;
    
    let output = `Success! Added animation state\n`;
    output += `Animator Controller: ${animatorControllerPath}\n`;
    output += `State: ${stateName}\n`;
    output += `Layer: ${layerName || 'Base Layer'}\n`;
    
    if (isDefaultState) {
      output += `Status: Set as default state\n`;
    }
    
    output += `\nTip: You can now add transitions to/from this state.`;
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\nTip: Make sure the Animator Controller exists at the specified path.';
    } else if (errorMessage.includes('already exists')) {
      helpText = '\n\nTip: A state with this name already exists in the layer.';
    } else if (errorMessage.includes('invalid layer')) {
      helpText = '\n\nTip: The layer index is out of range.';
    }
    
    return {
      content: [{ type: 'text', text: `Error adding animation state: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

