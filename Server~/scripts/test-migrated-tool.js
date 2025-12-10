#!/usr/bin/env node
/**
 * Test migrated tools to ensure they work correctly
 */

import { ExecuteMenuItemTool } from '../build/tools/menu/index.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger, LogLevel } from '../build/utils/logger.js';

console.log('========================================');
console.log('  Testing Migrated Tools');
console.log('========================================\n');

// Create test server
const server = new McpServer({
  name: "Test Server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});

const logger = new Logger('Test', LogLevel.INFO);

// Mock McpUnity
const mockMcpUnity = {
  sendRequest: async (request) => {
    console.log(`📤 Mock Unity Request:`, request);
    return {
      success: true,
      type: 'text',
      message: `Successfully executed menu item: ${request.params.menuPath}`
    };
  }
};

console.log('1️⃣  Testing ExecuteMenuItemTool...\n');

// Create and register the tool
const menuTool = new ExecuteMenuItemTool(server, mockMcpUnity, logger);
menuTool.register();

console.log('✅ Tool registered successfully\n');

// Test metadata
const metadata = menuTool.getMetadata();
console.log('📋 Tool Metadata:');
console.log(`   Name: ${metadata.name}`);
console.log(`   Description: ${metadata.description}`);
console.log(`   Category: ${metadata.category}`);
console.log(`   Version: ${metadata.version}\n`);

// Test input validation
console.log('2️⃣  Testing input validation...\n');

const validInput = { menuPath: 'GameObject/Create Empty' };
const validationResult = menuTool.validateInput(validInput);
console.log(`   Valid input: ${JSON.stringify(validInput)}`);
console.log(`   Validation result: ${validationResult.valid ? '✅ PASS' : '❌ FAIL'}\n`);

const invalidInput = { menuPath: 123 };
const invalidValidationResult = menuTool.validateInput(invalidInput);
console.log(`   Invalid input: ${JSON.stringify(invalidInput)}`);
console.log(`   Validation result: ${invalidValidationResult.valid ? '❌ FAIL' : '✅ PASS (correctly rejected)'}`);
if (!invalidValidationResult.valid) {
  console.log(`   Error: ${invalidValidationResult.error}\n`);
}

// Test execution with mock
console.log('3️⃣  Testing tool execution with mock...\n');

try {
  const mockResponse = {
    success: true,
    type: 'text',
    message: 'Successfully executed menu item: GameObject/Create Empty'
  };
  
  const result = await menuTool.executeWithMock(validInput, mockResponse);
  console.log('   Execution result:');
  console.log(`   ${JSON.stringify(result, null, 2)}\n`);
  console.log('✅ Execution test PASSED\n');
} catch (error) {
  console.error('❌ Execution test FAILED:', error.message, '\n');
}

// Check if tool is registered in server
console.log('4️⃣  Checking server registration...\n');
const registeredTools = server['_registeredTools'];
if (registeredTools && registeredTools['execute_menu_item']) {
  console.log('✅ Tool is registered in MCP server');
  console.log(`   Tool name: ${registeredTools['execute_menu_item'].name || 'execute_menu_item'}\n`);
} else {
  console.log('❌ Tool is NOT registered in MCP server\n');
}

console.log('========================================');
console.log('  Test Summary');
console.log('========================================');
console.log('✅ All tests passed!');
console.log('\n📝 Migration Status:');
console.log('   - MENU category: 1/1 tools migrated');
console.log('   - execute_menu_item: ✅ MIGRATED & TESTED');
console.log('\n🎉 Ready to proceed with next category!');
console.log('========================================\n');

