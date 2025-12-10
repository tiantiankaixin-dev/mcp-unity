import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";
import { WebSocket } from "ws";

// 模拟 MCP 客户端
async function testProduct() {
  console.log("🔌 正在连接到 MCP Unity 服务器...");
  
  // 创建 WebSocket 传输
  // 注意：我们需要等待服务器完全启动，这里假设服务器在 3000 端口
  const transport = new WebSocketClientTransport(new WebSocket("ws://localhost:3000"));
  
  const client = new Client(
    { name: "ProductTester", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("✅ 连接成功！");

    // 1. 列出工具 (验证服务器基本功能)
    console.log("📋 正在获取工具列表...");
    const tools = await client.listTools();
    console.log(`   发现 ${tools.tools.length} 个工具`);

    // 2. 创建方块 (验证核心业务功能)
    console.log("🎲 正在测试创建方块...");
    const result = await client.callTool({
      name: "unity_create_gameobject",
      arguments: {
        name: "Product_Test_Cube",
        type: "Cube",
        position: { x: 0, y: 2, z: 0 },
        scale: { x: 2, y: 2, z: 2 }
      }
    });

    console.log("✅ 工具调用完成！服务器返回：");
    // 打印结果摘要
    const content = result.content[0].text;
    if (content.includes("Success")) {
        console.log("🎉 测试通过：成功创建了 'Product_Test_Cube'！");
    } else {
        console.log("⚠️  测试警告：返回内容不包含 Success，请检查 Unity Editor 是否连接。");
        console.log("   完整返回: " + content.substring(0, 100) + "...");
    }

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    if (error.message.includes("ECONNREFUSED")) {
        console.log("   原因：服务器可能尚未启动或端口被占用。");
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}

// 等待几秒让服务器就绪
setTimeout(testProduct, 3000);
