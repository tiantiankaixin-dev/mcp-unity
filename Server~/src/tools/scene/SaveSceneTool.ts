import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';

const SaveSceneToolArgsSchema = z.object({
  saveAll: z.boolean().optional().default(false).describe('Save all open scenes. Default: false (save active scene only)'),
  savePath: z.string().optional().describe('New path to save scene to (for Save As). Example: "Assets/Scenes/NewScene.unity"')
});

@Tool({
  name: 'save_scene',
  description: 'Save the current scene or all open scenes.',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'save'])
export class SaveSceneTool extends BaseTool {
  get name() { return 'save_scene'; }
  get description() { return 'Save the current scene or all open scenes.'; }
  get inputSchema() { return SaveSceneToolArgsSchema; }
  get category() { return 'scene'; }
}
