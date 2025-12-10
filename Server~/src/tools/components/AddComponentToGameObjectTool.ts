import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const AddComponentToGameObjectArgsSchema = z.object({
  gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (e.g., "Canvas" or "Canvas/Panel")'),
  gameObjectName: z.string().optional().describe('Name of the GameObject to find'),
  instanceId: z.number().optional().describe('Instance ID of the GameObject'),
  componentType: z.string().describe('Type of component to add (e.g., "Rigidbody", "BoxCollider", "SettingsMenuManager")'),
  selectAfterAdd: z.boolean().default(true).describe('Whether to select the GameObject in hierarchy after adding component')
}).refine(data => data.gameObjectPath || data.gameObjectName || data.instanceId, {
  message: "At least one of gameObjectPath, gameObjectName, or instanceId must be provided"
});

@Tool({ 
  name: 'add_component_to_gameobject', 
  description: 'Add a component to a GameObject and optionally select it in the hierarchy', 
  category: 'components', 
  version: '1.0.0' 
})
@Tags(['unity', 'component', 'gameobject', 'inspector'])
@Examples([
  {
    description: 'Add Rigidbody component to a GameObject',
    args: {
      gameObjectPath: 'Player',
      componentType: 'Rigidbody'
    }
  },
  {
    description: 'Add custom script component to Canvas',
    args: {
      gameObjectPath: 'Canvas',
      componentType: 'SettingsMenuManager',
      selectAfterAdd: true
    }
  },
  {
    description: 'Add BoxCollider by GameObject name',
    args: {
      gameObjectName: 'Cube',
      componentType: 'BoxCollider'
    }
  }
])
export class AddComponentToGameObjectTool extends BaseTool {
  get name() { return 'add_component_to_gameobject'; }
  get description() { 
    return 'Add a component to a GameObject in the Unity Editor. Supports Undo/Redo. Based on Unity Official API: GameObject.AddComponent and Undo.AddComponent'; 
  }
  get inputSchema() { return AddComponentToGameObjectArgsSchema; }
  get category() { return 'components'; }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { gameObjectName, gameObjectPath, componentType, selected } = result;
    
    let message = `✅ Success! Added ${componentType} component to GameObject '${gameObjectName}'\n`;
    message += `📍 Path: ${gameObjectPath}\n`;
    
    if (selected) {
      message += `🎯 GameObject is now selected in the hierarchy\n`;
      message += `💡 You can see the component in the Inspector panel\n`;
    }
    
    message += `\n↩️  Tip: You can undo this action with Ctrl+Z (Cmd+Z on Mac)`;
    
    return {
      content: [{
        type: 'text',
        text: message
      }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\n💡 Tips:\n';
      helpText += '  • Make sure the GameObject exists in the current scene\n';
      helpText += '  • Use the correct hierarchy path (e.g., "Canvas" or "Canvas/Panel")\n';
      helpText += '  • Check if the GameObject is active in the hierarchy';
    } else if (errorMessage.includes('already has')) {
      helpText = '\n\n💡 Tip: This component type doesn\'t allow multiple instances on the same GameObject';
    } else if (errorMessage.includes('Component type') && errorMessage.includes('not found')) {
      helpText = '\n\n💡 Tips:\n';
      helpText += '  • Make sure the component type name is correct\n';
      helpText += '  • For Unity built-in components, use names like: Rigidbody, BoxCollider, AudioSource\n';
      helpText += '  • For custom scripts, use the exact class name\n';
      helpText += '  • Make sure custom scripts have been compiled successfully';
    }
    
    return {
      content: [{ type: 'text', text: `❌ Error: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

