import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_reflection_probe tool
 */
const CreateReflectionProbeToolArgsSchema = z.object({
  probeName: z.string().optional().default('ReflectionProbe').describe('Name for the reflection probe GameObject. Default: "ReflectionProbe"'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(1).describe('Y position. Default: 1'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0'),
  size: z.number().optional().default(10).describe('Size of the probe volume. Default: 10'),
  resolution: z.number().int().optional().default(128).describe('Cubemap resolution. Default: 128')
});

/**
 * CreateReflectionProbe Tool
 * Creates a Reflection Probe
 */
@Tool({
  name: 'create_reflection_probe',
  description: 'Creates a Reflection Probe',
  category: 'lighting',
  version: '1.0.0'
})
@Tags(['unity', 'lighting', 'reflection'])
export class CreateReflectionProbeTool extends BaseTool {
  get name() {
    return 'create_reflection_probe';
  }

  get description() {
    return 'Creates a Reflection Probe';
  }

  get inputSchema() {
    return CreateReflectionProbeToolArgsSchema;
  }

  get category() {
    return 'lighting';
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
