// 完整的启动检查脚本
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ToolRegistry } from './build/tools/base/ToolRegistry.js';
import { DynamicToolManager } from './build/tools/base/DynamicToolManager.js';
import { Logger, LogLevel } from './build/utils/logger.js';

console.log('=== MCP服务器启动检查 ===\n');

// 导入所有工具触发装饰器
await import('./build/tools/index.js');

// 检查ToolRegistry状态
console.log('1️⃣ ToolRegistry统计:');
const stats = ToolRegistry.getStatistics();
console.log(`   总工具数: ${stats.totalTools}`);
console.log(`   类别数: ${stats.categories}\n`);

// 检查meta工具
console.log('2️⃣ Meta工具检查:');
const metaTools = ToolRegistry.getToolsByCategory('meta');
console.log(`   找到 ${metaTools.length} 个meta工具:`);
for (const ToolClass of metaTools) {
  const temp = new ToolClass({}, {}, {
    debug: () => {}, info: () => {}, warn: () => {}, error: () => {}
  });
  console.log(`   - ${temp.name}`);
}
console.log('');

// 模拟服务器启动
console.log('3️⃣ 模拟MCP服务器启动:\n');

const server = new McpServer({
  name: "Test MCP Unity Server",
  version: "1.0.0"
}, {
  capabilities: { tools: {} }
});

const logger = new Logger('Test', LogLevel.INFO);

// 初始化DynamicToolManager
console.log('   初始化DynamicToolManager...');
const dynamicManager = DynamicToolManager.getInstance(server, {}, logger);
console.log('   ✓ DynamicToolManager初始化完成\n');

// 注册meta工具
console.log('   注册meta工具:');
let registeredCount = 0;
for (const ToolClass of metaTools) {
  try {
    const tool = new ToolClass(server, {}, logger);
    tool.register();
    registeredCount++;
    console.log(`   ✓ 已注册: ${tool.name}`);
  } catch (error) {
    console.log(`   ✗ 注册失败: ${error.message}`);
  }
}

console.log(`\n4️⃣ 结果总结:`);
console.log(`   ✅ 应该注册的工具数: 2`);
console.log(`   ✅ 实际注册的工具数: ${registeredCount}`);
console.log(`   ✅ 未注册的工具数: ${stats.totalTools - registeredCount}`);

if (registeredCount === 2) {
  console.log('\n🎉 零注册架构配置正确！');
  console.log('💡 MCP客户端应该只看到2个工具。');
} else {
  console.log('\n❌ 有问题！注册的工具数不正确。');
}
