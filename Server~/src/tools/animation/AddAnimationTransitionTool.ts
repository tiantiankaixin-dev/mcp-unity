import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const TransitionConditionSchema = z.object({
  parameter: z.string().describe('Parameter name'),
  mode: z.enum(['If', 'IfNot', 'Greater', 'Less', 'Equals', 'NotEqual']).describe('Condition mode'),
  threshold: z.union([z.number(), z.boolean(), z.string()]).optional().describe('Threshold value')
});

const AddAnimationTransitionArgsSchema = z.object({
  animatorControllerPath: z.string().optional().describe('Path to the Animator Controller asset'),
  controllerPath: z.string().optional().describe('Alias for animatorControllerPath'),
  fromState: z.string().optional().describe('Source state name (use "Any State" or "Entry" for special states)'),
  sourceStateName: z.string().optional().describe('Alias for fromState'),
  toState: z.string().optional().describe('Destination state name'),
  destinationStateName: z.string().optional().describe('Alias for toState'),
  layerIndex: z.number().default(0).describe('Layer index (0 = Base Layer)'),
  hasExitTime: z.boolean().default(true).describe('Has exit time'),
  exitTime: z.number().default(0.75).describe('Exit time (0-1)'),
  duration: z.number().default(0.25).describe('Transition duration in seconds'),
  offset: z.number().default(0).describe('Transition offset (0-1)'),
  interruptionSource: z.enum(['None', 'Source', 'Destination', 'SourceThenDestination', 'DestinationThenSource'])
    .default('None').describe('Interruption source'),
  orderedInterruption: z.boolean().default(true).describe('Ordered interruption'),
  canTransitionToSelf: z.boolean().default(false).describe('Can transition to self'),
  conditions: z.array(TransitionConditionSchema).optional().describe('Transition conditions')
}).refine(data => data.animatorControllerPath || data.controllerPath, {
  message: 'Either animatorControllerPath or controllerPath is required'
}).refine(data => data.fromState || data.sourceStateName, {
  message: 'Either fromState or sourceStateName is required'
}).refine(data => data.toState || data.destinationStateName, {
  message: 'Either toState or destinationStateName is required'
}).transform(data => ({
  ...data,
  animatorControllerPath: data.animatorControllerPath || data.controllerPath || '',
  fromState: data.fromState || data.sourceStateName || '',
  toState: data.toState || data.destinationStateName || ''
}));

@Tool({
  name: 'add_animation_transition',
  description: 'Add a transition between animation states in an Animator Controller',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'animator', 'transition', 'state-machine'])
@Examples([
  {
    description: 'Add transition from Idle to Run',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      fromState: 'Idle',
      toState: 'Run',
      hasExitTime: false,
      duration: 0.1,
      conditions: [
        { parameter: 'Speed', mode: 'Greater', threshold: 0.1 }
      ]
    }
  },
  {
    description: 'Add transition with exit time',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      fromState: 'Attack',
      toState: 'Idle',
      hasExitTime: true,
      exitTime: 0.9,
      duration: 0.2
    }
  },
  {
    description: 'Add Any State transition',
    args: {
      animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
      fromState: 'Any State',
      toState: 'Death',
      hasExitTime: false,
      conditions: [
        { parameter: 'IsDead', mode: 'If' }
      ]
    }
  },
  {
    description: 'Add transition with multiple conditions',
    args: {
      animatorControllerPath: 'Assets/Animations/EnemyAnimator.controller',
      fromState: 'Patrol',
      toState: 'Chase',
      hasExitTime: false,
      conditions: [
        { parameter: 'PlayerDetected', mode: 'If' },
        { parameter: 'Health', mode: 'Greater', threshold: 0 }
      ]
    }
  }
])
export class AddAnimationTransitionTool extends BaseTool {
  get name() { return 'add_animation_transition'; }
  get description() { return 'Add a transition between animation states in an Animator Controller'; }
  get inputSchema() { return AddAnimationTransitionArgsSchema; }
  get category() { return 'animation'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.animatorControllerPath || !args.animatorControllerPath.endsWith('.controller')) {
      throw new Error('Animator Controller path must end with .controller extension');
    }
    if (!args.animatorControllerPath.startsWith('Assets/')) {
      throw new Error('Animator Controller path must start with "Assets/"');
    }
    if (!args.fromState || args.fromState.trim() === '') {
      throw new Error('From state cannot be empty');
    }
    if (!args.toState || args.toState.trim() === '') {
      throw new Error('To state cannot be empty');
    }
    if (args.exitTime < 0 || args.exitTime > 1) {
      throw new Error('Exit time must be between 0 and 1');
    }
    if (args.duration < 0) {
      throw new Error('Duration must be non-negative');
    }
    if (args.offset < 0 || args.offset > 1) {
      throw new Error('Offset must be between 0 and 1');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { animatorControllerPath, fromState, toState, conditionsAdded } = result;
    
    let output = `Success! Added animation transition\n`;
    output += `Animator Controller: ${animatorControllerPath}\n`;
    output += `From: ${fromState}\n`;
    output += `To: ${toState}\n`;
    
    if (conditionsAdded && conditionsAdded.length > 0) {
      output += `\nConditions:\n`;
      conditionsAdded.forEach((condition: any, index: number) => {
        output += `  ${index + 1}. ${condition.parameter} ${condition.mode}`;
        if (condition.threshold !== undefined) {
          output += ` ${condition.threshold}`;
        }
        output += '\n';
      });
    }
    
    output += `\nTip: The transition is now active in the Animator Controller.`;
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('state not found')) {
      helpText = '\n\nTip: Make sure both states exist in the Animator Controller.';
    } else if (errorMessage.includes('parameter not found')) {
      helpText = '\n\nTip: The parameter used in conditions does not exist. Add it first.';
    } else if (errorMessage.includes('already exists')) {
      helpText = '\n\nTip: A transition between these states already exists.';
    }
    
    return {
      content: [{ type: 'text', text: `Error adding transition: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

