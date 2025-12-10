import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_audio_source tool
 */
const CreateAudioSourceToolArgsSchema = z.object({
  targetInstanceId: z.number().int().optional().default(0).describe('Instance ID of target GameObject. If 0, creates new GameObject. Default: 0'),
  audioClipPath: z.string().optional().describe('Optional path to AudioClip asset. Example: "Assets/Audio/MySound.wav"'),
  volume: z.number().optional().default(1).describe('Volume level (0-1). Default: 1'),
  loop: z.boolean().optional().default(false).describe('Whether audio should loop. Default: false'),
  playOnAwake: z.boolean().optional().default(true).describe('Whether to play on awake. Default: true')
});

/**
 * CreateAudioSource Tool
 * Creates an Audio Source
 */
@Tool({
  name: 'create_audio_source',
  description: 'Creates an Audio Source',
  category: 'audio',
  version: '1.0.0'
})
@Tags(['unity', 'audio', 'sound'])
export class CreateAudioSourceTool extends BaseTool {
  get name() {
    return 'create_audio_source';
  }

  get description() {
    return 'Creates an Audio Source';
  }

  get inputSchema() {
    return CreateAudioSourceToolArgsSchema;
  }

  get category() {
    return 'audio';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Operation completed successfully'}`
      }]
    };
  }
}
