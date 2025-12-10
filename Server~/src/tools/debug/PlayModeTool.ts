import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';

const PlayModeToolArgsSchema = z.object({
  action: z.enum(['enter', 'play', 'start', 'exit', 'stop', 'pause', 'step', 'status'])
    .optional()
    .default('status')
    .describe('Action to perform: "enter/play/start" to enter Play mode, "exit/stop" to exit, "pause" to toggle pause, "step" to step one frame, "status" to get current state')
});

@Tool({
  name: 'play_mode',
  description: 'Control Play mode: enter, exit, pause, step, or get status.',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'play', 'playmode', 'test'])
export class PlayModeTool extends BaseTool {
  get name() { return 'play_mode'; }
  get description() { return 'Control Play mode: enter, exit, pause, step, or get status.'; }
  get inputSchema() { return PlayModeToolArgsSchema; }
  get category() { return 'debug'; }
}
