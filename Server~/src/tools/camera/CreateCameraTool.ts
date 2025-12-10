import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_camera tool
 */
const CreateCameraToolArgsSchema = z.object({
  cameraName: z.string().optional().default('Camera').describe('Name for the camera GameObject. Default: "Camera"'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(1).describe('Y position. Default: 1'),
  posZ: z.number().optional().default(-10).describe('Z position. Default: -10'),
  fov: z.number().optional().default(60).describe('Field of view in degrees. Default: 60'),
  isMainCamera: z.boolean().optional().default(false).describe('Whether this is the main camera. Default: false')
});

/**
 * CreateCamera Tool
 * Creates a camera
 */
@Tool({
  name: 'create_camera',
  description: 'Creates a camera',
  category: 'camera',
  version: '1.0.0'
})
@Tags(['unity', 'camera'])
export class CreateCameraTool extends BaseTool {
  get name() {
    return 'create_camera';
  }

  get description() {
    return 'Creates a camera';
  }

  get inputSchema() {
    return CreateCameraToolArgsSchema;
  }

  get category() {
    return 'camera';
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
