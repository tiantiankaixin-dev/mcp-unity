#!/usr/bin/env ts-node
/**
 * Tool Generator Script
 * Automatically generates TypeScript and C# files for new MCP tools
 *
 * Usage:
 *   npm run generate-tool -- --name create_script --category scripting --description "Create a new C# script"
 */

import * as fs from 'fs';
import * as path from 'path';
import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
program
  .name('generate-tool')
  .description('Generate a new MCP tool with TypeScript and C# implementations')
  .requiredOption('-n, --name <name>', 'Tool name in snake_case (e.g., create_script)')
  .requiredOption('-c, --category <category>', 'Tool category (e.g., scripting, physics, animation)')
  .option('-d, --description <description>', 'Tool description', 'TODO: Add description')
  .option('--version <version>', 'Tool version', '1.0.0')
  .option('--tags <tags>', 'Comma-separated tags', '')
  .option('--async', 'Mark tool as async (long-running)', false)
  .option('--experimental', 'Mark tool as experimental', false)
  .parse();

const options = program.opts();

// Validate tool name
if (!/^[a-z][a-z0-9_]*$/.test(options.name)) {
  console.error('❌ Error: Tool name must be in snake_case (e.g., create_script)');
  process.exit(1);
}

// Helper functions
function toPascalCase(str: string): string {
  return str.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join('');
}

function toTitleCase(str: string): string {
  return str.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Generate TypeScript tool file
function generateTypeScriptTool() {
  const className = toPascalCase(options.name) + 'Tool';
  const schemaName = className + 'ArgsSchema';
  
  const decorators: string[] = [];
  
  // Add @Tool decorator
  decorators.push(`@Tool({
  name: '${options.name}',
  description: '${options.description}',
  category: '${options.category}',
  version: '${options.version}'
})`);

  // Add optional decorators
  if (options.tags) {
    const tags = options.tags.split(',').map((t: string) => `'${t.trim()}'`).join(', ');
    decorators.push(`@Tags([${tags}])`);
  }

  if (options.async) {
    decorators.push('@Async()');
  }

  if (options.experimental) {
    decorators.push('@Experimental()');
  }

  const content = `import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool${options.tags ? ', Tags' : ''}${options.async ? ', Async' : ''}${options.experimental ? ', Experimental' : ''} } from '../base/ToolDecorators.js';

/**
 * Input schema for ${options.name} tool
 */
const ${schemaName} = z.object({
  // TODO: Define input parameters
  // Example:
  // name: z.string().describe('The name of the object'),
  // position: z.object({
  //   x: z.number(),
  //   y: z.number(),
  //   z: z.number()
  // }).optional().describe('Position in 3D space')
});

/**
 * ${toTitleCase(options.name)} Tool
 * ${options.description}
 */
${decorators.join('\n')}
export class ${className} extends BaseTool {
  get name() {
    return '${options.name}';
  }

  get description() {
    return '${options.description}';
  }

  get inputSchema() {
    return ${schemaName};
  }

  get category() {
    return '${options.category}';
  }

  get version() {
    return '${options.version}';
  }

  // Optional: Override hooks for custom behavior
  
  // protected async beforeExecute(args: any): Promise<void> {
  //   // Add pre-execution logic here
  // }

  // protected async afterExecute(args: any, result: any): Promise<void> {
  //   // Add post-execution logic here
  // }

  // protected formatSuccessResponse(result: any): CallToolResult {
  //   // Customize success response formatting
  //   return super.formatSuccessResponse(result);
  // }
}
`;

  const categoryDir = path.join(__dirname, '../src/tools', options.category);
  const filePath = path.join(categoryDir, `${className}.ts`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`✓ Created directory: ${categoryDir}`);
  }

  // Write file
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created TypeScript tool: ${filePath}`);

  // Update category index.ts
  updateCategoryIndex(options.category, className);
}

// Generate C# tool file
function generateCSharpTool() {
  const className = toPascalCase(options.name) + 'Tool';
  const namespace = `McpUnity.Tools.${toPascalCase(options.category)}`;

  const content = `using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace ${namespace}
{
    /// <summary>
    /// ${toTitleCase(options.name)} Tool
    /// ${options.description}
    /// </summary>
    [McpTool("${options.name}", "${options.description}")]
    public class ${className} : McpToolBase
    {
        public ${className}()
        {
            Name = "${options.name}";
            Description = "${options.description}";
            IsAsync = ${options.async ? 'true' : 'false'};
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // TODO: Parse parameters
                // Example:
                // string name = parameters["name"]?.ToObject<string>();
                // if (string.IsNullOrEmpty(name))
                // {
                //     return McpUnitySocketHandler.CreateErrorResponse("Name is required", "invalid_params");
                // }

                // TODO: Implement tool logic here
                
                // Example success response:
                return new JObject
                {
                    ["success"] = true,
                    ["message"] = "Operation completed successfully"
                    // Add additional data as needed
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"${className} error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
`;

  const categoryDir = path.join(__dirname, '../../Editor/Tools', toPascalCase(options.category));
  const filePath = path.join(categoryDir, `${className}.cs`);

  // Create directory if it doesn't exist
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`✓ Created directory: ${categoryDir}`);
  }

  // Write file
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created C# tool: ${filePath}`);
}

// Update category index.ts to export the new tool
function updateCategoryIndex(category: string, className: string) {
  const indexPath = path.join(__dirname, '../src/tools', category, 'index.ts');
  
  let content = '';
  if (fs.existsSync(indexPath)) {
    content = fs.readFileSync(indexPath, 'utf-8');
  } else {
    content = `/**
 * ${toTitleCase(category)} Tools
 * Tools for ${category} operations in Unity
 */

`;
  }

  // Add export statement if not already present
  const exportStatement = `export * from './${className}.js';\n`;
  if (!content.includes(exportStatement)) {
    content += exportStatement;
    fs.writeFileSync(indexPath, content);
    console.log(`✓ Updated category index: ${indexPath}`);
  }
}

// Generate README for the category
function generateCategoryReadme(category: string) {
  const readmePath = path.join(__dirname, '../src/tools', category, 'README.md');
  
  if (fs.existsSync(readmePath)) {
    return; // Don't overwrite existing README
  }

  const content = `# ${toTitleCase(category)} Tools

Tools for ${category} operations in Unity.

## Available Tools

- \`${options.name}\` - ${options.description}

## Adding New Tools

To add a new ${category} tool:

\`\`\`bash
npm run generate-tool -- --name your_tool_name --category ${category} --description "Your tool description"
\`\`\`

## Development

1. Implement the TypeScript tool in \`${options.category}/YourToolName.ts\`
2. Implement the C# tool in \`Editor/Tools/${toPascalCase(category)}/YourToolName.cs\`
3. Test the tool with your MCP client
4. Update this README with tool documentation
`;

  fs.writeFileSync(readmePath, content);
  console.log(`✓ Created category README: ${readmePath}`);
}

// Main execution
console.log('\n🔧 Generating MCP Unity Tool...\n');
console.log(`Tool Name: ${options.name}`);
console.log(`Category: ${options.category}`);
console.log(`Description: ${options.description}`);
console.log(`Version: ${options.version}`);
if (options.tags) console.log(`Tags: ${options.tags}`);
if (options.async) console.log(`Async: Yes`);
if (options.experimental) console.log(`Experimental: Yes`);
console.log('');

try {
  generateTypeScriptTool();
  generateCSharpTool();
  generateCategoryReadme(options.category);

  console.log('\n✅ Tool generated successfully!\n');
  console.log('Next steps:');
  console.log(`1. Implement the tool logic in both TypeScript and C# files`);
  console.log(`2. Define the input schema in the TypeScript file`);
  console.log(`3. Run 'npm run build' to compile`);
  console.log(`4. Test the tool with your MCP client`);
  console.log(`5. Update the category README with detailed documentation\n`);
} catch (error: any) {
  console.error('\n❌ Error generating tool:', error.message);
  process.exit(1);
}

