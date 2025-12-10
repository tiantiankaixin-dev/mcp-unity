# MCP Unity 工具开发指南

> 本文档帮助 AI 快速理解 MCP Unity 架构并正确创建新工具。

## 一、架构概览

```
mcp-unity/
├── Editor/                          # Unity 编辑器扩展 (C#)
│   ├── Tools/                       # 所有工具实现
│   │   ├── McpToolBase.cs           # 工具基类 ⭐
│   │   ├── McpToolAttribute.cs      # 工具属性标记
│   │   ├── GameObject/              # GameObject 类工具
│   │   ├── Component/               # 组件类工具
│   │   ├── Material/                # 材质类工具
│   │   ├── Scene/                   # 场景类工具
│   │   ├── Animation/               # 动画类工具
│   │   ├── Physics/                 # 物理类工具
│   │   ├── Lighting/                # 光照类工具
│   │   ├── UI/                      # UI 类工具
│   │   ├── Prefab/                  # 预制体类工具
│   │   ├── Asset/                   # 资源类工具
│   │   ├── Scripting/               # 脚本类工具
│   │   ├── Build/                   # 构建类工具
│   │   ├── Debug/                   # 调试类工具
│   │   ├── Audio/                   # 音频类工具
│   │   ├── Terrain/                 # 地形类工具
│   │   └── VFX/                     # 特效类工具
│   ├── UnityBridge/                 # WebSocket 通信桥接
│   │   └── McpUnityServer.cs        # 工具自动注册 (反射)
│   └── Utils/                       # 工具类
│       └── McpLogger.cs             # 日志工具
│
└── Server~/                         # Node.js MCP 服务器 (TypeScript)
    └── src/
        └── tools/
            ├── base/
            │   ├── BaseTool.ts      # 工具基类 ⭐
            │   └── ToolDecorators.ts # 装饰器
            ├── gameobject/
            │   ├── index.ts         # 导出文件 ⭐
            │   └── *.ts             # 各工具定义
            └── [其他类别]/
```

## 二、创建新工具的步骤

### 步骤 1: 创建 Unity C# 工具 (Editor/Tools/[Category]/[ToolName]Tool.cs)

```csharp
using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 工具描述
    /// Based on Unity API: [相关 API 链接]
    /// </summary>
    public class MyNewTool : McpToolBase
    {
        public MyNewTool()
        {
            Name = "my_new_tool";  // 工具名称，使用 snake_case
            Description = "工具描述";
            IsAsync = false;  // 大多数工具使用同步
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 1. 获取参数
                string param1 = parameters["param1"]?.ToObject<string>() ?? "default";
                int param2 = parameters["param2"]?.ToObject<int>() ?? 0;
                
                // 2. 执行逻辑
                // ... Unity API 调用 ...
                
                // 3. 支持撤销（可选）
                Undo.RecordObject(target, "My Operation");
                
                // 4. 返回成功结果
                return new JObject
                {
                    ["success"] = true,
                    ["message"] = "操作成功",
                    ["result"] = "返回数据"
                };
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
```

### 步骤 2: 创建 Server TypeScript 定义 (Server~/src/tools/[category]/[ToolName]Tool.ts)

```typescript
import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// 参数定义
const MyNewToolArgsSchema = z.object({
  param1: z.string().optional().default('default').describe('参数1描述'),
  param2: z.number().int().optional().default(0).describe('参数2描述'),
  requiredParam: z.string().describe('必需参数描述')
});

@Tool({
  name: 'my_new_tool',
  description: '工具描述',
  category: 'gameobject',  // 类别名
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'custom'])
export class MyNewTool extends BaseTool {
  get name() { return 'my_new_tool'; }
  get description() { return '工具描述'; }
  get inputSchema() { return MyNewToolArgsSchema; }
  get category() { return 'gameobject'; }

  // 可选：自定义成功响应格式
  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Success'}`
      }]
    };
  }
}
```

### 步骤 3: 更新 index.ts 导出

```typescript
// Server~/src/tools/[category]/index.ts
export * from './MyNewTool.js';
```

### 步骤 4: 编译并重启

```bash
# 编译 TypeScript
cd Server~
npm run build

# 在 Unity 中重启 MCP 服务器
# Tools → MCP Unity → 服务器窗口 → 停止 → 启动
```

## 三、常用代码模式

### 获取 GameObject

```csharp
// 通过 instanceId
GameObject obj = EditorUtility.InstanceIDToObject(instanceId) as GameObject;

// 通过路径
GameObject obj = GameObject.Find("Parent/Child/Target");

// 通过名称搜索
GameObject[] all = Object.FindObjectsOfType<GameObject>();
```

### 获取/添加组件

```csharp
// 获取组件
Rigidbody rb = obj.GetComponent<Rigidbody>();

// 添加组件（支持撤销）
Rigidbody rb = Undo.AddComponent<Rigidbody>(obj);

// 通过类型名获取
Type type = Type.GetType($"UnityEngine.{typeName}, UnityEngine");
Component comp = obj.GetComponent(type);
```

### 修改属性（支持撤销）

```csharp
Undo.RecordObject(obj, "Modify Object");
obj.transform.position = new Vector3(x, y, z);
EditorUtility.SetDirty(obj);
```

### 删除对象（支持撤销）

```csharp
Undo.DestroyObjectImmediate(obj);
```

### 创建资源

```csharp
// 创建材质
Material mat = new Material(Shader.Find("Standard"));
AssetDatabase.CreateAsset(mat, "Assets/Materials/NewMat.mat");
AssetDatabase.SaveAssets();
AssetDatabase.Refresh();
```

### 处理数组参数

```csharp
JArray instanceIdsArray = parameters["instanceIds"] as JArray;
if (instanceIdsArray != null)
{
    foreach (var id in instanceIdsArray)
    {
        int instanceId = id.ToObject<int>();
        // ...
    }
}
```

## 四、命名空间冲突注意

使用完整命名空间避免冲突：
- `UnityEngine.Object` (不是 `Object`)
- `UnityEngine.Resources` (不是 `Resources`)
- `UnityEngine.Debug` (不是 `Debug`)

## 五、参数类型对照

| TypeScript (Zod) | C# 获取方式 |
|------------------|-------------|
| `z.string()` | `parameters["name"]?.ToObject<string>()` |
| `z.number()` | `parameters["name"]?.ToObject<float>()` |
| `z.number().int()` | `parameters["name"]?.ToObject<int>()` |
| `z.boolean()` | `parameters["name"]?.ToObject<bool>()` |
| `z.array(z.number())` | `parameters["name"] as JArray` |
| `z.enum([...])` | `parameters["name"]?.ToObject<string>()` |

## 六、工具自动注册机制

Unity 使用反射自动注册所有继承 `McpToolBase` 的工具：

```csharp
// McpUnityServer.cs
var toolType = typeof(McpToolBase);
var types = AppDomain.CurrentDomain.GetAssemblies()
    .SelectMany(s => s.GetTypes())
    .Where(p => toolType.IsAssignableFrom(p) && !p.IsInterface && !p.IsAbstract);

foreach (var type in types)
{
    McpToolBase toolInstance = (McpToolBase)Activator.CreateInstance(type);
    _tools.Add(toolInstance.Name, toolInstance);
}
```

**无需手动注册**，只需确保：
1. 类继承 `McpToolBase`
2. 有无参构造函数
3. 在 `Tools/` 目录下

## 七、测试新工具

```json
// 使用 discover_and_use_tool
{
  "toolName": "my_new_tool",
  "params": {
    "param1": "value",
    "param2": 123
  }
}

// 批量测试
{
  "tools": [
    {"toolName": "tool1", "params": {...}},
    {"toolName": "tool2", "params_mapping": {"id": "$.0.instanceId"}}
  ]
}
```

## 八、常见错误处理

| 错误 | 原因 | 解决 |
|------|------|------|
| Tool not found | Server 未注册 | 检查 index.ts 导出，重新编译 |
| Parameter missing | 必需参数未提供 | 检查 Zod schema |
| CS0103 命名空间错误 | 命名冲突 | 使用完整命名空间 |
| 工具不生效 | 服务器未重启 | 重启 Unity MCP 服务器 |

---

*最后更新: 2025-12-07*
