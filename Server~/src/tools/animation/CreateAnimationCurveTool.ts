import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const KeyframeSchema = z.object({
  time: z.number().describe('Time in seconds'),
  value: z.number().describe('Value at this time'),
  inTangent: z.number().optional().describe('In tangent (slope)'),
  outTangent: z.number().optional().describe('Out tangent (slope)'),
  weightedMode: z.enum(['None', 'In', 'Out', 'Both']).optional().describe('Weighted mode')
});

const CreateAnimationCurveArgsSchema = z.object({
  animationClipPath: z.string().describe('Path to the animation clip'),
  propertyPath: z.string().describe('Property path (e.g., "m_LocalPosition.x")'),
  targetType: z.string().describe('Target component type (e.g., "Transform", "Renderer")'),
  keyframes: z.array(KeyframeSchema).describe('Array of keyframes'),
  preWrapMode: z.enum(['Once', 'Loop', 'PingPong', 'ClampForever']).default('ClampForever')
    .describe('Behavior before first keyframe'),
  postWrapMode: z.enum(['Once', 'Loop', 'PingPong', 'ClampForever']).default('ClampForever')
    .describe('Behavior after last keyframe'),
  createIfNotExists: z.boolean().default(false).describe('Create animation clip if it does not exist')
});

@Tool({
  name: 'create_animation_curve',
  description: 'Create and edit animation curves with keyframes for animating properties',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'curve', 'keyframe', 'timeline'])
@Examples([
  {
    description: 'Animate position X with linear movement',
    args: {
      animationClipPath: 'Assets/Animations/MoveRight.anim',
      propertyPath: 'm_LocalPosition.x',
      targetType: 'Transform',
      keyframes: [
        { time: 0, value: 0 },
        { time: 1, value: 5 },
        { time: 2, value: 10 }
      ]
    }
  },
  {
    description: 'Animate scale with ease in/out',
    args: {
      animationClipPath: 'Assets/Animations/Pulse.anim',
      propertyPath: 'm_LocalScale.x',
      targetType: 'Transform',
      keyframes: [
        { time: 0, value: 1, outTangent: 0 },
        { time: 0.5, value: 1.5, inTangent: 2, outTangent: -2 },
        { time: 1, value: 1, inTangent: 0 }
      ],
      postWrapMode: 'Loop'
    }
  },
  {
    description: 'Animate material color alpha',
    args: {
      animationClipPath: 'Assets/Animations/FadeOut.anim',
      propertyPath: 'material._Color.a',
      targetType: 'Renderer',
      keyframes: [
        { time: 0, value: 1 },
        { time: 1, value: 0 }
      ]
    }
  },
  {
    description: 'Create bouncing animation',
    args: {
      animationClipPath: 'Assets/Animations/Bounce.anim',
      propertyPath: 'm_LocalPosition.y',
      targetType: 'Transform',
      keyframes: [
        { time: 0, value: 0 },
        { time: 0.3, value: 2, outTangent: 0 },
        { time: 0.6, value: 0 },
        { time: 0.8, value: 1, outTangent: 0 },
        { time: 1, value: 0 }
      ],
      postWrapMode: 'Loop'
    }
  }
])
export class CreateAnimationCurveTool extends BaseTool {
  get name() { return 'create_animation_curve'; }
  get description() { return 'Create and edit animation curves with keyframes for animating properties'; }
  get inputSchema() { return CreateAnimationCurveArgsSchema; }
  get category() { return 'animation'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.animationClipPath || !args.animationClipPath.endsWith('.anim')) {
      throw new Error('Animation clip path must end with .anim extension');
    }
    if (!args.animationClipPath.startsWith('Assets/')) {
      throw new Error('Animation clip path must start with "Assets/"');
    }
    if (!args.propertyPath || args.propertyPath.trim() === '') {
      throw new Error('Property path cannot be empty');
    }
    if (!args.targetType || args.targetType.trim() === '') {
      throw new Error('Target type cannot be empty');
    }
    if (!args.keyframes || args.keyframes.length < 2) {
      throw new Error('At least 2 keyframes are required to create a curve');
    }
    
    // Validate keyframes are in chronological order
    for (let i = 1; i < args.keyframes.length; i++) {
      if (args.keyframes[i].time <= args.keyframes[i - 1].time) {
        throw new Error('Keyframes must be in chronological order (increasing time)');
      }
    }
    
    // Validate time values are non-negative
    if (args.keyframes.some((kf: any) => kf.time < 0)) {
      throw new Error('Keyframe time values must be non-negative');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { animationClipPath, propertyPath, keyframesAdded, duration } = result;
    
    let output = `Success! Created animation curve\n`;
    output += `Animation Clip: ${animationClipPath}\n`;
    output += `Property: ${propertyPath}\n`;
    output += `Keyframes: ${keyframesAdded}\n`;
    output += `Duration: ${duration.toFixed(2)}s\n`;
    
    output += `\nTip: You can preview the animation in the Animation window.`;
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\nTip: Set createClipIfNotExists to true to create the animation clip.';
    } else if (errorMessage.includes('invalid property')) {
      helpText = '\n\nTip: Make sure the property path is valid for the target type.';
    } else if (errorMessage.includes('chronological order')) {
      helpText = '\n\nTip: Keyframes must be sorted by time in ascending order.';
    }
    
    return {
      content: [{ type: 'text', text: `Error creating animation curve: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

