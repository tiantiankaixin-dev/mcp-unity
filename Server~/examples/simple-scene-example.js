#!/usr/bin/env node
/**
 * 简单示例：使用 MCP Client SDK 创建游戏场景
 */

import { McpClient } from '../mcp-client-sdk.js';

async function main() {
  const client = new McpClient();
  
  try {
    console.log('🔌 连接到 MCP 服务器...');
    await client.connect();
    console.log('✅ 已连接\n');
    
    console.log('🎮 创建游戏场景...\n');
    
    // 1. 创建地面
    console.log('1. 创建地面...');
    await client.createPrimitiveObject({
      objectName: 'Ground',
      primitiveType: 'plane',
      posX: 0,
      posY: 0,
      posZ: 0
    });
    console.log('   ✅ 完成\n');
    
    // 2. 创建玩家
    console.log('2. 创建玩家...');
    await client.createPrimitiveObject({
      objectName: 'Player',
      primitiveType: 'capsule',
      posX: 0,
      posY: 1,
      posZ: 0
    });
    console.log('   ✅ 完成\n');
    
    // 3. 创建一些障碍物
    console.log('3. 创建障碍物...');
    await client.createPrimitiveObject({
      objectName: 'Obstacle1',
      primitiveType: 'cube',
      posX: 3,
      posY: 0.5,
      posZ: 3
    });
    
    await client.createPrimitiveObject({
      objectName: 'Obstacle2',
      primitiveType: 'sphere',
      posX: -3,
      posY: 0.5,
      posZ: 3
    });
    console.log('   ✅ 完成\n');
    
    // 4. 创建光源
    console.log('4. 创建光源...');
    await client.createLight({
      lightName: 'Sun',
      lightType: 'Directional',
      posX: 0,
      posY: 10,
      posZ: 0
    });
    console.log('   ✅ 完成\n');
    
    // 5. 创建相机
    console.log('5. 创建相机...');
    await client.createCamera({
      cameraName: 'MainCamera',
      posX: 0,
      posY: 5,
      posZ: -10
    });
    console.log('   ✅ 完成\n');
    
    console.log('═══════════════════════════════════════');
    console.log('✅ 游戏场景创建完成！');
    console.log('═══════════════════════════════════════');
    console.log('\n场景包含：');
    console.log('  - 地面 (Plane)');
    console.log('  - 玩家 (Capsule)');
    console.log('  - 2 个障碍物 (Cube & Sphere)');
    console.log('  - 定向光源');
    console.log('  - 相机\n');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    client.disconnect();
  }
}

main();

