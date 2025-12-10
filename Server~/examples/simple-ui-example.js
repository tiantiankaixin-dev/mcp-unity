#!/usr/bin/env node
/**
 * 简单示例：使用 MCP Client SDK 创建 UI
 * 
 * 这个示例展示了 AI Agent 应该如何直接调用 MCP 工具
 */

import { McpClient } from '../mcp-client-sdk.js';

async function main() {
  const client = new McpClient();
  
  try {
    console.log('🔌 连接到 MCP 服务器...');
    await client.connect();
    console.log('✅ 已连接\n');
    
    console.log('📋 创建 UI 元素...\n');
    
    // 1. 创建 EventSystem
    console.log('1. 创建 EventSystem...');
    await client.createEventSystem();
    console.log('   ✅ 完成\n');
    
    // 2. 创建面板
    console.log('2. 创建面板...');
    await client.createUIPanel({
      panelName: 'SimplePanel',
      width: 600,
      height: 400,
      color: '#4A4A4AD9'  // 深灰色，85% 不透明
    });
    console.log('   ✅ 完成\n');
    
    // 3. 创建标题文本
    console.log('3. 创建标题...');
    await client.createUIText({
      text: 'Simple UI Example',
      posY: 150,
      fontSize: 28,
      color: '#FFFFFFFF'
    });
    console.log('   ✅ 完成\n');
    
    // 4. 创建按钮
    console.log('4. 创建按钮...');
    await client.createUIButton({
      buttonText: 'Click Me',
      posY: 0,
      width: 150,
      height: 40
    });
    console.log('   ✅ 完成\n');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ UI 创建完成！');
    console.log('═══════════════════════════════════════');
    console.log('\n请在 Unity Editor 中查看结果。\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 提示：请确保 MCP WebSocket 服务器正在运行：');
      console.error('   cd Server~');
      console.error('   node websocket-wrapper.js\n');
    }
  } finally {
    client.disconnect();
  }
}

main();

