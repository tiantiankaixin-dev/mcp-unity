import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const RefactorScriptArgsSchema = z.object({
  scriptPath: z.string().describe('Path to the script file to refactor'),
  operation: z.enum([
    'rename_symbol',
    'extract_method',
    'inline_variable',
    'move_to_namespace',
    'organize_usings',
    'format_code',
    'remove_unused_usings',
    'add_regions',
    'convert_to_property'
  ]).describe('Type of refactoring operation'),
  
  // For rename_symbol
  oldName: z.string().optional().describe('Current name of the symbol to rename'),
  newName: z.string().optional().describe('New name for the symbol'),
  symbolType: z.enum(['field', 'method', 'class', 'variable']).optional().describe('Type of symbol to rename'),
  
  // For extract_method
  startLine: z.number().optional().describe('Start line of code to extract'),
  endLine: z.number().optional().describe('End line of code to extract'),
  methodName: z.string().optional().describe('Name for the extracted method'),
  
  // For move_to_namespace
  targetNamespace: z.string().optional().describe('Target namespace to move the class to'),
  
  // For convert_to_property
  fieldName: z.string().optional().describe('Field name to convert to property'),
  propertyAccessors: z.enum(['get', 'set', 'get_set']).optional().describe('Property accessors to generate'),
  
  // General options
  updateReferences: z.boolean().default(true).describe('Update all references when renaming'),
  createBackup: z.boolean().default(true).describe('Create backup before refactoring')
});

@Tool({
  name: 'refactor_script',
  description: 'Perform code refactoring operations like renaming, extracting methods, organizing usings, and formatting',
  category: 'scripting',
  version: '1.0.0'
})
@Tags(['unity', 'scripting', 'refactoring', 'code-quality', 'cleanup'])
@Examples([
  {
    description: 'Rename a method',
    args: {
      scriptPath: 'Assets/Scripts/PlayerController.cs',
      operation: 'rename_symbol',
      oldName: 'UpdatePlayer',
      newName: 'UpdatePlayerMovement',
      symbolType: 'method',
      updateReferences: true
    }
  },
  {
    description: 'Extract method from code block',
    args: {
      scriptPath: 'Assets/Scripts/GameManager.cs',
      operation: 'extract_method',
      startLine: 45,
      endLine: 60,
      methodName: 'InitializeGameState'
    }
  },
  {
    description: 'Organize and remove unused usings',
    args: {
      scriptPath: 'Assets/Scripts/EnemyAI.cs',
      operation: 'organize_usings'
    }
  },
  {
    description: 'Format code',
    args: {
      scriptPath: 'Assets/Scripts/Utilities.cs',
      operation: 'format_code'
    }
  },
  {
    description: 'Move class to namespace',
    args: {
      scriptPath: 'Assets/Scripts/Player.cs',
      operation: 'move_to_namespace',
      targetNamespace: 'Game.Characters'
    }
  },
  {
    description: 'Convert field to property',
    args: {
      scriptPath: 'Assets/Scripts/Health.cs',
      operation: 'convert_to_property',
      fieldName: 'currentHealth',
      propertyAccessors: 'get_set'
    }
  }
])
export class RefactorScriptTool extends BaseTool {
  get name() { return 'refactor_script'; }
  get description() { return 'Perform code refactoring operations like renaming, extracting methods, organizing usings, and formatting'; }
  get inputSchema() { return RefactorScriptArgsSchema; }
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
      case 'rename_symbol':
        if (!args.oldName || !args.newName) {
          throw new Error('oldName and newName are required for rename_symbol operation');
        }
        if (!args.symbolType) {
          throw new Error('symbolType is required for rename_symbol operation');
        }
        if (!/^[A-Za-z][a-zA-Z0-9]*$/.test(args.newName)) {
          throw new Error('New name must start with a letter and contain only alphanumeric characters');
        }
        break;
        
      case 'extract_method':
        if (args.startLine === undefined || args.endLine === undefined) {
          throw new Error('startLine and endLine are required for extract_method operation');
        }
        if (!args.methodName) {
          throw new Error('methodName is required for extract_method operation');
        }
        if (args.startLine > args.endLine) {
          throw new Error('startLine must be less than or equal to endLine');
        }
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(args.methodName)) {
          throw new Error('Method name must start with uppercase letter and contain only alphanumeric characters');
        }
        break;
        
      case 'move_to_namespace':
        if (!args.targetNamespace) {
          throw new Error('targetNamespace is required for move_to_namespace operation');
        }
        if (!/^[A-Z][a-zA-Z0-9.]*$/.test(args.targetNamespace)) {
          throw new Error('Namespace must start with uppercase letter and contain only alphanumeric characters and dots');
        }
        break;
        
      case 'convert_to_property':
        if (!args.fieldName) {
          throw new Error('fieldName is required for convert_to_property operation');
        }
        break;
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { 
      scriptPath, 
      operation, 
      changesApplied = [],
      referencesUpdated = 0,
      backupPath,
      statistics 
    } = result;

    let operationText = '';
    switch (operation) {
      case 'rename_symbol': operationText = 'Renamed symbol'; break;
      case 'extract_method': operationText = 'Extracted method'; break;
      case 'inline_variable': operationText = 'Inlined variable'; break;
      case 'move_to_namespace': operationText = 'Moved to namespace'; break;
      case 'organize_usings': operationText = 'Organized using statements'; break;
      case 'format_code': operationText = 'Formatted code'; break;
      case 'remove_unused_usings': operationText = 'Removed unused usings'; break;
      case 'add_regions': operationText = 'Added regions'; break;
      case 'convert_to_property': operationText = 'Converted to property'; break;
    }

    let output = `Success! ${operationText}\n`;
    output += `Script: ${scriptPath}\n`;

    if (changesApplied.length > 0) {
      output += `\nChanges applied:\n`;
      changesApplied.forEach((change: string, index: number) => {
        output += `  ${index + 1}. ${change}\n`;
      });
    }

    if (referencesUpdated > 0) {
      output += `\nReferences updated: ${referencesUpdated}\n`;
    }

    if (backupPath) {
      output += `\nBackup created: ${backupPath}\n`;
    }

    if (statistics) {
      output += `\nStatistics:\n`;
      if (statistics.linesChanged) output += `  • Lines changed: ${statistics.linesChanged}\n`;
      if (statistics.filesAffected) output += `  • Files affected: ${statistics.filesAffected}\n`;
    }

    output += `\nTip: Unity will automatically recompile the script.`;

    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\nTip: Make sure the script file exists at the specified path.';
    } else if (errorMessage.includes('symbol not found')) {
      helpText = '\n\nTip: The symbol you are trying to rename does not exist in the script.';
    } else if (errorMessage.includes('invalid range')) {
      helpText = '\n\nTip: The line range specified for extraction is invalid.';
    } else if (errorMessage.includes('would create conflict')) {
      helpText = '\n\nTip: The refactoring would create a naming conflict. Choose a different name.';
    } else if (errorMessage.includes('syntax error')) {
      helpText = '\n\nTip: The script has syntax errors. Fix them before refactoring.';
    }
    
    return {
      content: [{ type: 'text', text: `Error refactoring script: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

