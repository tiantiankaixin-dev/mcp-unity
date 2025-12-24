import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_panel tool
 */
const CreateUIPanelToolArgsSchema = z.object({
  panelName: z.string().optional().default('Panel').describe('Name for the Panel GameObject. Default: "Panel"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  width: z.number().optional().default(400).describe('Width of the panel. Default: 400'),
  height: z.number().optional().default(300).describe('Height of the panel. Default: 300'),
  color: z.array(z.number()).length(4).optional().default([1, 1, 1, 1]).describe('Color as RGBA [r,g,b,a] (0-1). Default: [1,1,1,1]')
});

/**
 * CreateUIPanel Tool
 * Creates a UI Panel
 */
@Tool({
  name: 'create_ui_panel',
  description: 'Creates a UI Panel',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'panel'])
export class CreateUIPanelTool extends BaseTool {
  get name() {
    return 'create_ui_panel';
  }

  get description() {
    return 'Creates a UI Panel';
  }

  get inputSchema() {
    return CreateUIPanelToolArgsSchema;
  }

  get category() {
    return 'ui';
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
