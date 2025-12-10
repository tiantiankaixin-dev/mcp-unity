import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const UpdateScriptArgsSchema = z.object({
  scriptPath: z.string().describe('Path to the script file (e.g., Assets/Scripts/PlayerController.cs)'),
  operation: z.enum(['add_field', 'add_method', 'add_using', 'rename_class', 'add_namespace', 'remove_field', 'remove_method'])
    .describe('Type of update operation'),
  field: z.object({
    name: z.string(),
    type: z.string(),
    isPublic: z.boolean().default(false),
    isSerializeField: z.boolean().default(true),
    defaultValue: z.string().optional()
  }).optional().describe('Field to add (for add_field operation)'),
  method: z.object({
    name: z.string(),
    returnType: z.string().default('void'),
    parameters: z.array(z.object({
      name: z.string(),
      type: z.string()
    })).optional(),
    body: z.string().optional(),
    isPublic: z.boolean().default(true),
    isStatic: z.boolean().default(false)
  }).optional().describe('Method to add (for add_method operation)'),
  usingStatement: z.string().optional().describe('Using statement to add (for add_using operation)'),
  newClassName: z.string().optional().describe('New class name (for rename_class operation)'),
  namespace: z.string().optional().describe('Namespace to add (for add_namespace operation)'),
  targetName: z.string().optional().describe('Name of field/method to remove (for remove operations)')
});

@Tool({
  name: 'update_script',
  description: 'Update existing C# scripts by adding/removing fields, methods, using statements, or renaming classes',
  category: 'scripting',
  version: '1.0.0'
})
@Tags(['unity', 'scripting', 'csharp', 'refactoring', 'code-modification'])
@Examples([
  {
    description: 'Add a field to existing script',
    args: {
      scriptPath: 'Assets/Scripts/PlayerController.cs',
      operation: 'add_field',
      field: {
        name: 'health',
        type: 'int',
        isPublic: false,
        isSerializeField: true,
        defaultValue: '100'
      }
    }
  },
  {
    description: 'Add a method to existing script',
    args: {
      scriptPath: 'Assets/Scripts/PlayerController.cs',
      operation: 'add_method',
      method: {
        name: 'TakeDamage',
        returnType: 'void',
        parameters: [{ name: 'amount', type: 'int' }],
        body: 'health -= amount;',
        isPublic: true
      }
    }
  },
  {
    description: 'Add using statement',
    args: {
      scriptPath: 'Assets/Scripts/PlayerController.cs',
      operation: 'add_using',
      usingStatement: 'UnityEngine.UI'
    }
  },
  {
    description: 'Rename class',
    args: {
      scriptPath: 'Assets/Scripts/Player.cs',
      operation: 'rename_class',
      newClassName: 'PlayerCharacter'
    }
  }
])
export class UpdateScriptTool extends BaseTool {
  get name() { return 'update_script'; }
  get description() { return 'Update existing C# scripts by adding/removing fields, methods, using statements, or renaming classes'; }
  get inputSchema() { return UpdateScriptArgsSchema; }
  get category() { return 'scripting'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.scriptPath || !args.scriptPath.endsWith('.cs')) {
      throw new Error('Script path must end with .cs extension');
    }
    if (!args.scriptPath.startsWith('Assets/')) {
      throw new Error('Script path must start with "Assets/"');
    }

    // Validate operation-specific requirements
    switch (args.operation) {
      case 'add_field':
        if (!args.field) {
          throw new Error('field parameter is required for add_field operation');
        }
        if (!/^[a-z][a-zA-Z0-9]*$/.test(args.field.name)) {
          throw new Error('Field name must start with lowercase letter and contain only alphanumeric characters');
        }
        break;
      case 'add_method':
        if (!args.method) {
          throw new Error('method parameter is required for add_method operation');
        }
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(args.method.name)) {
          throw new Error('Method name must start with uppercase letter and contain only alphanumeric characters');
        }
        break;
      case 'add_using':
        if (!args.usingStatement) {
          throw new Error('usingStatement parameter is required for add_using operation');
        }
        break;
      case 'rename_class':
        if (!args.newClassName) {
          throw new Error('newClassName parameter is required for rename_class operation');
        }
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(args.newClassName)) {
          throw new Error('Class name must start with uppercase letter and contain only alphanumeric characters');
        }
        break;
      case 'add_namespace':
        if (!args.namespace) {
          throw new Error('namespace parameter is required for add_namespace operation');
        }
        break;
      case 'remove_field':
      case 'remove_method':
        if (!args.targetName) {
          throw new Error('targetName parameter is required for remove operations');
        }
        break;
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { scriptPath, operation, modifiedContent } = result;
    let operationText = '';
    
    switch (operation) {
      case 'add_field': operationText = 'Added field'; break;
      case 'add_method': operationText = 'Added method'; break;
      case 'add_using': operationText = 'Added using statement'; break;
      case 'rename_class': operationText = 'Renamed class'; break;
      case 'add_namespace': operationText = 'Added namespace'; break;
      case 'remove_field': operationText = 'Removed field'; break;
      case 'remove_method': operationText = 'Removed method'; break;
    }

    return {
      content: [{
        type: 'text',
        text: `Success! ${operationText}\nScript: ${scriptPath}\n\nTip: Unity will automatically recompile the script.`
      }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\nTip: Make sure the script file exists at the specified path.';
    } else if (errorMessage.includes('already exists')) {
      helpText = '\n\nTip: The field or method you are trying to add already exists in the script.';
    } else if (errorMessage.includes('syntax error')) {
      helpText = '\n\nTip: The modification would create invalid C# syntax. Check your parameters.';
    }
    
    return {
      content: [{ type: 'text', text: `Error updating script: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

