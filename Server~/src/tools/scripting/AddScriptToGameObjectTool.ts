import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const AddScriptToGameObjectArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred)'),
  gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
  scriptPath: z.string().optional().describe('Path to the script file (e.g., "Assets/Scripts/PlayerController.cs")'),
  scriptName: z.string().optional().describe('Name of the script class (if different from file name)'),
  namespace: z.string().optional().describe('Namespace of the script class'),
  initialValues: z.record(z.any()).optional().describe('Initial values for public/serialized fields'),
  createIfNotExists: z.boolean().default(false).describe('Create GameObject if it does not exist'),
  parentPath: z.string().optional().describe('Parent path if creating new GameObject')
});

@Tool({
  name: 'add_script_to_gameobject',
  description: 'Attach a C# script component to a GameObject in the scene hierarchy',
  category: 'scripting',
  version: '1.0.0'
})
@Tags(['unity', 'scripting', 'component', 'gameobject', 'attach'])
@Examples([
  {
    description: 'Add script to existing GameObject',
    args: {
      gameObjectPath: 'Player',
      scriptPath: 'Assets/Scripts/PlayerController.cs'
    }
  },
  {
    description: 'Add script with initial values',
    args: {
      gameObjectPath: 'Enemy',
      scriptPath: 'Assets/Scripts/EnemyAI.cs',
      initialValues: {
        health: 100,
        speed: 5.0,
        attackDamage: 10
      }
    }
  },
  {
    description: 'Add script and create GameObject if needed',
    args: {
      gameObjectPath: 'GameManager',
      scriptPath: 'Assets/Scripts/GameManager.cs',
      createIfNotExists: true
    }
  },
  {
    description: 'Add script to nested GameObject',
    args: {
      gameObjectPath: 'Environment/Buildings/House',
      scriptPath: 'Assets/Scripts/InteractableObject.cs',
      initialValues: {
        interactionText: 'Press E to enter'
      }
    }
  }
])
export class AddScriptToGameObjectTool extends BaseTool {
  get name() { return 'add_script_to_gameobject'; }
  get description() { return 'Attach a C# script component to a GameObject in the scene hierarchy'; }
  get inputSchema() { return AddScriptToGameObjectArgsSchema; }
  get category() { return 'scripting'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
      throw new Error('GameObject path cannot be empty');
    }
    if (!args.scriptPath || !args.scriptPath.endsWith('.cs')) {
      throw new Error('Script path must end with .cs extension');
    }
    if (!args.scriptPath.startsWith('Assets/')) {
      throw new Error('Script path must start with "Assets/"');
    }
    if (args.scriptName && !/^[A-Z][a-zA-Z0-9]*$/.test(args.scriptName)) {
      throw new Error('Script name must start with uppercase letter and contain only alphanumeric characters');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { gameObjectPath, scriptName, componentAdded, initialValuesSet } = result;
    
    let output = `Success! Attached script to GameObject\n`;
    output += `GameObject: ${gameObjectPath}\n`;
    output += `Script: ${scriptName}\n`;
    
    if (componentAdded) {
      output += `Status: Component added successfully\n`;
    }
    
    if (initialValuesSet && Object.keys(initialValuesSet).length > 0) {
      output += `\nInitial values set:\n`;
      for (const [key, value] of Object.entries(initialValuesSet)) {
        output += `  • ${key}: ${JSON.stringify(value)}\n`;
      }
    }
    
    output += `\nTip: The script component is now active on the GameObject.`;
    
    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('GameObject not found')) {
      helpText = '\n\nTip: Make sure the GameObject exists in the scene hierarchy, or set createIfNotExists to true.';
    } else if (errorMessage.includes('script not found')) {
      helpText = '\n\nTip: Make sure the script file exists at the specified path and has been compiled by Unity.';
    } else if (errorMessage.includes('already attached')) {
      helpText = '\n\nTip: The script component is already attached to this GameObject.';
    } else if (errorMessage.includes('compilation error')) {
      helpText = '\n\nTip: The script has compilation errors. Fix the errors in the script first.';
    } else if (errorMessage.includes('invalid field')) {
      helpText = '\n\nTip: One or more field names in initialValues do not exist in the script.';
    }
    
    return {
      content: [{ type: 'text', text: `Error attaching script: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

