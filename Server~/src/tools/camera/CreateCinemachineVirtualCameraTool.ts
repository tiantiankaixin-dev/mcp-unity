import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_cinemachine_virtual_camera tool
 */
const CreateCinemachineVirtualCameraToolArgsSchema = z.object({
  cameraName: z.string().optional().default('VirtualCamera').describe('Name for the virtual camera GameObject. Default: "VirtualCamera"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(1.5).describe('Y position. Default: 1.5'),
  posZ: z.number().optional().default(-10).describe('Z position. Default: -10'),
  priority: z.number().int().optional().default(10).describe('Camera priority. Default: 10')
});

/**
 * CreateCinemachineVirtualCamera Tool
 * Creates a Cinemachine Virtual Camera
 */
@Tool({
  name: 'create_cinemachine_virtual_camera',
  description: 'Creates a Cinemachine Virtual Camera',
  category: 'camera',
  version: '1.0.0'
})
@Tags(['unity', 'camera', 'cinemachine'])
export class CreateCinemachineVirtualCameraTool extends BaseTool {
  get name() {
    return 'create_cinemachine_virtual_camera';
  }

  get description() {
    return 'Creates a Cinemachine Virtual Camera';
  }

  get inputSchema() {
    return CreateCinemachineVirtualCameraToolArgsSchema;
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
