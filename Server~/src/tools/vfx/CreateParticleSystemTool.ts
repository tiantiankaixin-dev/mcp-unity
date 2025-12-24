import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_particle_system tool
 */
const CreateParticleSystemToolArgsSchema = z.object({
  particleName: z.string().optional().default('ParticleSystem').describe('Name for the particle system GameObject. Default: "ParticleSystem"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position. Default: 0'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0'),
  playOnAwake: z.boolean().optional().default(true).describe('Whether to play on awake. Default: true'),
  looping: z.boolean().optional().default(true).describe('Whether the particle system loops. Default: true')
});

/**
 * CreateParticleSystem Tool
 * Creates a Particle System
 */
@Tool({
  name: 'create_particle_system',
  description: 'Creates a Particle System',
  category: 'vfx',
  version: '1.0.0'
})
@Tags(['unity', 'vfx', 'particles'])
export class CreateParticleSystemTool extends BaseTool {
  get name() {
    return 'create_particle_system';
  }

  get description() {
    return 'Creates a Particle System';
  }

  get inputSchema() {
    return CreateParticleSystemToolArgsSchema;
  }

  get category() {
    return 'vfx';
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
