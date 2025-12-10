import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const RecordAnimationArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred)'),
  gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject to record (alternative to instanceId)'),
  animationClipPath: z.string().describe('Path where to save the animation clip'),
  duration: z.number().positive().describe('Duration of recording in seconds'),
  frameRate: z.number().default(60).describe('Recording frame rate (frames per second)'),
  recordChildren: z.boolean().default(true).describe('Record child GameObjects'),
  recordProperties: z.array(z.enum([
    'Position',
    'Rotation',
    'Scale',
    'ActiveState',
    'Material',
    'Color',
    'All'
  ])).default(['Position', 'Rotation', 'Scale']).describe('Properties to record'),
  startImmediately: z.boolean().default(false).describe('Start recording immediately'),
  overwriteExisting: z.boolean().default(false).describe('Overwrite existing animation clip')
});

@Tool({
  name: 'record_animation',
  description: 'Record animation from Transform changes and property modifications over time',
  category: 'animation',
  version: '1.0.0'
})
@Tags(['unity', 'animation', 'recording', 'capture', 'timeline'])
@Examples([
  {
    description: 'Record position and rotation for 5 seconds',
    args: {
      gameObjectPath: 'Player',
      animationClipPath: 'Assets/Animations/PlayerMovement.anim',
      duration: 5,
      recordProperties: ['Position', 'Rotation']
    }
  },
  {
    description: 'Record all properties with children',
    args: {
      gameObjectPath: 'Character',
      animationClipPath: 'Assets/Animations/CharacterAction.anim',
      duration: 3,
      frameRate: 30,
      recordChildren: true,
      recordProperties: ['All']
    }
  },
  {
    description: 'Record scale animation',
    args: {
      gameObjectPath: 'UI/Button',
      animationClipPath: 'Assets/Animations/ButtonPress.anim',
      duration: 0.5,
      frameRate: 60,
      recordProperties: ['Scale'],
      startImmediately: true
    }
  }
])
export class RecordAnimationTool extends BaseTool {
  get name() { return 'record_animation'; }
  get description() { return 'Record animation from Transform changes and property modifications over time'; }
  get inputSchema() { return RecordAnimationArgsSchema; }
  get category() { return 'animation'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
      throw new Error('GameObject path cannot be empty');
    }
    if (!args.animationClipPath || !args.animationClipPath.endsWith('.anim')) {
      throw new Error('Animation clip path must end with .anim extension');
    }
    if (!args.animationClipPath.startsWith('Assets/')) {
      throw new Error('Animation clip path must start with "Assets/"');
    }
    if (args.duration <= 0) {
      throw new Error('Duration must be positive');
    }
    if (args.duration > 300) {
      throw new Error('Duration cannot exceed 300 seconds (5 minutes)');
    }
    if (args.frameRate < 1 || args.frameRate > 120) {
      throw new Error('Frame rate must be between 1 and 120');
    }
    if (!args.recordProperties || args.recordProperties.length === 0) {
      throw new Error('At least one property must be selected for recording');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { 
      gameObjectPath, 
      animationClipPath, 
      duration, 
      framesCaptured, 
      propertiesRecorded,
      recordingStarted,
      recordingComplete 
    } = result;
    
    let output = '';
    
    if (recordingStarted && !recordingComplete) {
      output = `Recording started!\n`;
      output += `GameObject: ${gameObjectPath}\n`;
      output += `Duration: ${duration}s\n`;
      output += `Frame Rate: ${result.frameRate} fps\n`;
      output += `\nStatus: Recording in progress...\n`;
      output += `\nTip: The animation will be saved automatically when recording completes.`;
    } else if (recordingComplete) {
      output = `Success! Animation recorded\n`;
      output += `GameObject: ${gameObjectPath}\n`;
      output += `Animation Clip: ${animationClipPath}\n`;
      output += `Duration: ${duration}s\n`;
      output += `Frames Captured: ${framesCaptured}\n`;
      
      if (propertiesRecorded && propertiesRecorded.length > 0) {
        output += `\nProperties Recorded:\n`;
        propertiesRecorded.forEach((prop: string) => {
          output += `  • ${prop}\n`;
        });
      }
      
      output += `\nTip: You can now use this animation clip in an Animator Controller.`;
    }
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('GameObject not found')) {
      helpText = '\n\nTip: Make sure the GameObject exists in the scene hierarchy.';
    } else if (errorMessage.includes('already recording')) {
      helpText = '\n\nTip: Stop the current recording before starting a new one.';
    } else if (errorMessage.includes('file exists')) {
      helpText = '\n\nTip: Set overwriteExisting to true to replace the existing animation clip.';
    } else if (errorMessage.includes('no changes detected')) {
      helpText = '\n\nTip: The GameObject did not change during recording. Try moving or modifying it.';
    }
    
    return {
      content: [{ type: 'text', text: `Error recording animation: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

