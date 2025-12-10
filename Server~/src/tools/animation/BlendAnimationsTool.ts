import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const BlendTreeChildSchema = z.object({
  animationClipPath: z.string().describe('Path to animation clip'),
  threshold: z.number().optional().describe('Threshold value for 1D blend tree'),
  position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position for 2D blend tree'),
  timeScale: z.number().default(1).describe('Time scale multiplier'),
  mirror: z.boolean().default(false).describe('Mirror animation')
});

const BlendAnimationsArgsSchema = z.object({
  animatorControllerPath: z.string().describe('Path to the Animator Controller asset'),
  blendTreeName: z.string().describe('Name of the blend tree state'),
  blendType: z.enum(['1D', '2D_Simple_Directional', '2D_Freeform_Directional', '2D_Freeform_Cartesian', 'Direct'])
    .describe('Type of blend tree'),
  layerIndex: z.number().default(0).describe('Layer index (0 = Base Layer)'),
  parameter: z.string().optional().describe('Blend parameter name (for 1D blend tree)'),
  parameterX: z.string().optional().describe('X-axis parameter name (for 2D blend tree)'),
  parameterY: z.string().optional().describe('Y-axis parameter name (for 2D blend tree)'),
  children: z.array(BlendTreeChildSchema).describe('Animation clips to blend'),
  position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position in Animator window'),
  isDefaultState: z.boolean().default(false).describe('Set as default state')
});

@Tool({
  name: 'blend_animations',
  description: 'Create blend trees for smooth animation blending based on parameters',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'blend-tree', 'animator', 'blending'])
@Examples([
  {
    description: 'Create 1D blend tree for movement speed',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      blendTreeName: 'Movement',
      blendType: '1D',
      parameter: 'Speed',
      children: [
        { animationClipPath: 'Assets/Animations/Idle.anim', threshold: 0 },
        { animationClipPath: 'Assets/Animations/Walk.anim', threshold: 2 },
        { animationClipPath: 'Assets/Animations/Run.anim', threshold: 5 },
        { animationClipPath: 'Assets/Animations/Sprint.anim', threshold: 8 }
      ]
    }
  },
  {
    description: 'Create 2D directional blend tree for strafing',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      blendTreeName: 'Strafe',
      blendType: '2D_Simple_Directional',
      parameterX: 'Horizontal',
      parameterY: 'Vertical',
      children: [
        { animationClipPath: 'Assets/Animations/WalkForward.anim', position: { x: 0, y: 1 } },
        { animationClipPath: 'Assets/Animations/WalkBack.anim', position: { x: 0, y: -1 } },
        { animationClipPath: 'Assets/Animations/WalkLeft.anim', position: { x: -1, y: 0 } },
        { animationClipPath: 'Assets/Animations/WalkRight.anim', position: { x: 1, y: 0 } }
      ]
    }
  },
  {
    description: 'Create 2D freeform blend tree for aiming',
    args: {
      animatorControllerPath: 'Assets/Animations/ShooterAnimator.controller',
      blendTreeName: 'Aim',
      blendType: '2D_Freeform_Cartesian',
      parameterX: 'AimHorizontal',
      parameterY: 'AimVertical',
      children: [
        { animationClipPath: 'Assets/Animations/AimCenter.anim', position: { x: 0, y: 0 } },
        { animationClipPath: 'Assets/Animations/AimUp.anim', position: { x: 0, y: 1 } },
        { animationClipPath: 'Assets/Animations/AimDown.anim', position: { x: 0, y: -1 } },
        { animationClipPath: 'Assets/Animations/AimLeft.anim', position: { x: -1, y: 0 } },
        { animationClipPath: 'Assets/Animations/AimRight.anim', position: { x: 1, y: 0 } }
      ]
    }
  },
  {
    description: 'Create direct blend tree for layered animations',
    args: {
      animatorControllerPath: 'Assets/Animations/CharacterAnimator.controller',
      blendTreeName: 'UpperBodyActions',
      blendType: 'Direct',
      children: [
        { animationClipPath: 'Assets/Animations/Wave.anim' },
        { animationClipPath: 'Assets/Animations/Point.anim' },
        { animationClipPath: 'Assets/Animations/Salute.anim' }
      ]
    }
  }
])
export class BlendAnimationsTool extends BaseTool {
  get name() { return 'blend_animations'; }
  get description() { return 'Create blend trees for smooth animation blending based on parameters'; }
  get inputSchema() { return BlendAnimationsArgsSchema; }
  get category() { return 'animation'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.animatorControllerPath || !args.animatorControllerPath.endsWith('.controller')) {
      throw new Error('Animator Controller path must end with .controller extension');
    }
    if (!args.animatorControllerPath.startsWith('Assets/')) {
      throw new Error('Animator Controller path must start with "Assets/"');
    }
    if (!args.blendTreeName || args.blendTreeName.trim() === '') {
      throw new Error('Blend tree name cannot be empty');
    }
    if (!args.children || args.children.length < 2) {
      throw new Error('At least 2 animation clips are required for blending');
    }
    
    // Validate parameters based on blend type
    if (args.blendType === '1D') {
      if (!args.parameter) {
        throw new Error('parameter is required for 1D blend tree');
      }
      // Validate thresholds are provided
      if (args.children.some((child: any) => child.threshold === undefined)) {
        throw new Error('All children must have threshold values for 1D blend tree');
      }
    } else if (args.blendType.startsWith('2D')) {
      if (!args.parameterX || !args.parameterY) {
        throw new Error('parameterX and parameterY are required for 2D blend tree');
      }
      // Validate positions are provided
      if (args.children.some((child: any) => !child.position)) {
        throw new Error('All children must have position values for 2D blend tree');
      }
    }
    
    // Validate animation clip paths
    for (const child of args.children) {
      if (!child.animationClipPath.endsWith('.anim')) {
        throw new Error(`Invalid animation clip path: ${child.animationClipPath}`);
      }
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { 
      animatorControllerPath, 
      blendTreeName, 
      blendType, 
      childrenAdded,
      parametersUsed 
    } = result;
    
    let output = `Success! Created blend tree\n`;
    output += `Animator Controller: ${animatorControllerPath}\n`;
    output += `Blend Tree: ${blendTreeName}\n`;
    output += `Type: ${blendType}\n`;
    output += `Children: ${childrenAdded} animations\n`;
    
    if (parametersUsed && parametersUsed.length > 0) {
      output += `\nParameters:\n`;
      parametersUsed.forEach((param: string) => {
        output += `  • ${param}\n`;
      });
    }
    
    output += `\nTip: Adjust the blend parameter values to see smooth transitions between animations.`;
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\nTip: Make sure the Animator Controller and all animation clips exist.';
    } else if (errorMessage.includes('parameter')) {
      helpText = '\n\nTip: Make sure the blend parameters exist in the Animator Controller.';
    } else if (errorMessage.includes('already exists')) {
      helpText = '\n\nTip: A blend tree with this name already exists in the layer.';
    } else if (errorMessage.includes('threshold')) {
      helpText = '\n\nTip: For 1D blend trees, all children must have threshold values.';
    } else if (errorMessage.includes('position')) {
      helpText = '\n\nTip: For 2D blend trees, all children must have position values.';
    }
    
    return {
      content: [{ type: 'text', text: `Error creating blend tree: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

