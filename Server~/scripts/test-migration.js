#!/usr/bin/env node
/**
 * Test migration on a single tool
 */

import { readFileSync, writeFileSync } from 'fs';

const TEST_TOOL = './src/tools/findMissingReferencesTool.ts';

console.log('Testing migration on:', TEST_TOOL);
console.log('========================================\n');

const originalContent = readFileSync(TEST_TOOL, 'utf-8');

// Extract tool name
const toolNameMatch = originalContent.match(/const toolName = ['"]([^'"]+)['"]/);
const toolName = toolNameMatch ? toolNameMatch[1] : 'unknown';

// Extract description
const descMatch = originalContent.match(/server\.tool\([^,]+,\s*['"]([^'"]+)['"]/);
const description = descMatch ? descMatch[1] : 'Tool description';

// Extract schema
const schemaMatch = originalContent.match(/const (\w+ArgsSchema) = (z\.object\(\{[\s\S]*?\}\)(?:\.[^;]+)?);/);
const schemaDefinition = schemaMatch ? schemaMatch[2] : 'z.object({})';

// Generate class name
const className = toolName
  .split('_')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('') + 'Tool';

// Infer category
let category = 'general';
if (toolName.includes('script')) category = 'scripting';
else if (toolName.includes('scene')) category = 'scene';
else if (toolName.includes('gameobject')) category = 'gameobject';
else if (toolName.includes('ui_')) category = 'ui';
else if (toolName.includes('material')) category = 'material';
else if (toolName.includes('optimize')) category = 'optimization';
else if (toolName.includes('build')) category = 'build';

console.log('Extracted information:');
console.log('  Tool name:', toolName);
console.log('  Class name:', className);
console.log('  Description:', description);
console.log('  Category:', category);
console.log('  Schema:', schemaDefinition.substring(0, 50) + '...');
console.log('');

// Generate new content
const newContent = `import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from './base/BaseTool.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../unity/mcpUnity.js';
import { Logger } from '../utils/logger.js';

/**
 * ${description}
 * 
 * @category ${category}
 */
export class ${className} extends BaseTool {
  get name(): string {
    return '${toolName}';
  }

  get description(): string {
    return '${description}';
  }

  get category(): string {
    return '${category}';
  }

  get inputSchema() {
    return ${schemaDefinition};
  }
}
`;

console.log('Generated code:');
console.log('========================================');
console.log(newContent);
console.log('========================================\n');

// Save to test file
const testOutput = './src/tools/TEST_MIGRATED.ts';
writeFileSync(testOutput, newContent);
console.log(`✅ Test output saved to: ${testOutput}`);
console.log('\nYou can review this file before running full migration.');

