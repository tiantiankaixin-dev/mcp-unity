import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_wind_zone tool
 */
const CreateWindZoneToolArgsSchema = z.object({
  windZoneName: z.string().optional().default('WindZone').describe('Name for the WindZone GameObject. Default: "WindZone"'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position. Default: 0'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0'),
  mode: z.string().optional().default('directional').describe('Wind mode: "directional" or "spherical". Default: "directional"'),
  windMain: z.number().optional().default(0.5).describe('Main wind strength. Default: 0.5'),
  windTurbulence: z.number().optional().default(0.5).describe('Wind turbulence. Default: 0.5')
});

/**
 * CreateWindZone Tool
 * Creates a Wind Zone
 */
@Tool({
  name: 'create_wind_zone',
  description: 'Creates a Wind Zone',
  category: 'vfx',
  version: '1.0.0'
})
@Tags(['unity', 'vfx', 'wind'])
export class CreateWindZoneTool extends BaseTool {
  get name() {
    return 'create_wind_zone';
  }

  get description() {
    return 'Creates a Wind Zone';
  }

  get inputSchema() {
    return CreateWindZoneToolArgsSchema;
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
