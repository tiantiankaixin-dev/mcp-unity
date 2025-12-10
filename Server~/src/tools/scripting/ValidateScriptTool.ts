import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const ValidateScriptArgsSchema = z.object({
  scriptPath: z.string().describe('Path to the script file to validate (e.g., Assets/Scripts/PlayerController.cs)'),
  validationLevel: z.enum(['syntax', 'compilation', 'best_practices', 'all']).default('all')
    .describe('Level of validation to perform'),
  checkNamingConventions: z.boolean().default(true).describe('Check C# naming conventions'),
  checkUnityBestPractices: z.boolean().default(true).describe('Check Unity-specific best practices'),
  checkPerformance: z.boolean().default(false).describe('Check for common performance issues'),
  autoFix: z.boolean().default(false).describe('Automatically fix simple issues (formatting, using statements)')
});

@Tool({
  name: 'validate_script',
  description: 'Validate C# scripts for syntax errors, compilation issues, naming conventions, and Unity best practices',
  category: 'scripting',
  version: '1.0.0'
})
@Tags(['unity', 'scripting', 'validation', 'linting', 'best-practices', 'code-quality'])
@Examples([
  {
    description: 'Basic syntax and compilation check',
    args: {
      scriptPath: 'Assets/Scripts/PlayerController.cs',
      validationLevel: 'compilation'
    }
  },
  {
    description: 'Full validation with best practices',
    args: {
      scriptPath: 'Assets/Scripts/EnemyAI.cs',
      validationLevel: 'all',
      checkNamingConventions: true,
      checkUnityBestPractices: true
    }
  },
  {
    description: 'Validate with auto-fix',
    args: {
      scriptPath: 'Assets/Scripts/GameManager.cs',
      validationLevel: 'all',
      autoFix: true
    }
  },
  {
    description: 'Performance check',
    args: {
      scriptPath: 'Assets/Scripts/PerformanceCritical.cs',
      validationLevel: 'all',
      checkPerformance: true
    }
  }
])
export class ValidateScriptTool extends BaseTool {
  get name() { return 'validate_script'; }
  get description() { return 'Validate C# scripts for syntax errors, compilation issues, naming conventions, and Unity best practices'; }
  get inputSchema() { return ValidateScriptArgsSchema; }
  get category() { return 'scripting'; }

  protected async beforeExecute(args: any): Promise<void> {
    if (!args.scriptPath || !args.scriptPath.endsWith('.cs')) {
      throw new Error('Script path must end with .cs extension');
    }
    if (!args.scriptPath.startsWith('Assets/')) {
      throw new Error('Script path must start with "Assets/"');
    }
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    const { 
      scriptPath, 
      isValid, 
      errors = [], 
      warnings = [], 
      suggestions = [],
      autoFixedIssues = [],
      statistics 
    } = result;

    let output = '';

    if (isValid && errors.length === 0 && warnings.length === 0) {
      output = `✅ Script validation passed!\n`;
      output += `Script: ${scriptPath}\n`;
      output += `\nNo issues found. The script follows best practices.\n`;
    } else {
      output = `📋 Validation Report\n`;
      output += `Script: ${scriptPath}\n`;
      output += `Status: ${isValid ? '✅ Valid' : '❌ Invalid'}\n\n`;

      if (errors.length > 0) {
        output += `❌ Errors (${errors.length}):\n`;
        errors.forEach((error: any, index: number) => {
          output += `  ${index + 1}. [Line ${error.line || '?'}] ${error.message}\n`;
          if (error.code) output += `     Code: ${error.code}\n`;
        });
        output += '\n';
      }

      if (warnings.length > 0) {
        output += `⚠️  Warnings (${warnings.length}):\n`;
        warnings.forEach((warning: any, index: number) => {
          output += `  ${index + 1}. [Line ${warning.line || '?'}] ${warning.message}\n`;
        });
        output += '\n';
      }

      if (suggestions.length > 0) {
        output += `💡 Suggestions (${suggestions.length}):\n`;
        suggestions.forEach((suggestion: any, index: number) => {
          output += `  ${index + 1}. ${suggestion.message}\n`;
          if (suggestion.fix) output += `     Fix: ${suggestion.fix}\n`;
        });
        output += '\n';
      }

      if (autoFixedIssues.length > 0) {
        output += `🔧 Auto-fixed issues (${autoFixedIssues.length}):\n`;
        autoFixedIssues.forEach((issue: any, index: number) => {
          output += `  ${index + 1}. ${issue}\n`;
        });
        output += '\n';
      }
    }

    if (statistics) {
      output += `\n📊 Statistics:\n`;
      if (statistics.lines) output += `  • Lines of code: ${statistics.lines}\n`;
      if (statistics.methods) output += `  • Methods: ${statistics.methods}\n`;
      if (statistics.fields) output += `  • Fields: ${statistics.fields}\n`;
      if (statistics.complexity) output += `  • Cyclomatic complexity: ${statistics.complexity}\n`;
    }

    if (!isValid) {
      output += `\n💡 Tip: Fix the errors above to make the script valid.`;
    }

    return {
      content: [{ type: 'text', text: output }]
    };
  }

  protected formatErrorResponse(error: any): CallToolResult {
    const errorMessage = error.message || 'Unknown error occurred';
    let helpText = '';
    
    if (errorMessage.includes('not found')) {
      helpText = '\n\nTip: Make sure the script file exists at the specified path.';
    } else if (errorMessage.includes('cannot read')) {
      helpText = '\n\nTip: The script file may be locked or have permission issues.';
    }
    
    return {
      content: [{ type: 'text', text: `Error validating script: ${errorMessage}${helpText}` }],
      isError: true
    };
  }
}

