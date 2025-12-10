using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class BatchAddComponentTool : McpToolBase
    {
        public BatchAddComponentTool()
        {
            Name = "batch_add_component";
            Description = "Add a component to multiple GameObjects at once.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string componentTypeName = parameters["componentTypeName"]?.ToObject<string>();

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (string.IsNullOrEmpty(componentTypeName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'componentTypeName' is required.", "validation_error");
                }

                Type componentType = ResolveComponentType(componentTypeName);

                if (componentType == null || !typeof(Component).IsAssignableFrom(componentType))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Invalid component type: {componentTypeName}", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray addedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    if (obj.GetComponent(componentType) == null)
                    {
                        Component comp = Undo.AddComponent(obj, componentType);
                        EditorUtility.SetDirty(obj);

                        addedArray.Add(new JObject
                        {
                            ["objectName"] = obj.name,
                            ["componentType"] = componentType.Name
                        });
                        count++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added {componentType.Name} to {count} GameObject(s).",
                    ["componentType"] = componentType.Name,
                    ["count"] = count,
                    ["addedComponents"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BatchAddComponentTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        /// <summary>
        /// 解析组件类型名称，支持多种格式
        /// </summary>
        private Type ResolveComponentType(string typeName)
        {
            if (string.IsNullOrEmpty(typeName))
                return null;

            Type type = null;

            // 1. 首先尝试直接解析（完整程序集限定名）
            type = Type.GetType(typeName);
            if (type != null) return type;

            // 2. 如果已包含 UnityEngine. 前缀，尝试添加程序集信息
            if (typeName.StartsWith("UnityEngine."))
            {
                type = Type.GetType($"{typeName}, UnityEngine");
                if (type != null) return type;
                
                // 也尝试 UnityEngine.CoreModule
                type = Type.GetType($"{typeName}, UnityEngine.CoreModule");
                if (type != null) return type;
                
                // 尝试 UnityEngine.PhysicsModule
                type = Type.GetType($"{typeName}, UnityEngine.PhysicsModule");
                if (type != null) return type;
                
                // 尝试 UnityEngine.AudioModule
                type = Type.GetType($"{typeName}, UnityEngine.AudioModule");
                if (type != null) return type;
                
                // 尝试 UnityEngine.UI (VerticalLayoutGroup, HorizontalLayoutGroup, etc.)
                type = Type.GetType($"{typeName}, UnityEngine.UI");
                if (type != null) return type;
                
                // 尝试 UnityEngine.UIModule
                type = Type.GetType($"{typeName}, UnityEngine.UIModule");
                if (type != null) return type;
            }

            // 3. 不包含命名空间，尝试添加 UnityEngine 前缀
            type = Type.GetType($"UnityEngine.{typeName}, UnityEngine");
            if (type != null) return type;

            type = Type.GetType($"UnityEngine.{typeName}, UnityEngine.CoreModule");
            if (type != null) return type;

            type = Type.GetType($"UnityEngine.{typeName}, UnityEngine.PhysicsModule");
            if (type != null) return type;

            type = Type.GetType($"UnityEngine.{typeName}, UnityEngine.AudioModule");
            if (type != null) return type;
            
            // 尝试 UnityEngine.UI 命名空间 (VerticalLayoutGroup, GridLayoutGroup, etc.)
            type = Type.GetType($"UnityEngine.UI.{typeName}, UnityEngine.UI");
            if (type != null) return type;

            // 4. 遍历所有已加载的程序集查找
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                // 尝试完整类型名
                type = assembly.GetType(typeName);
                if (type != null && typeof(Component).IsAssignableFrom(type))
                    return type;

                // 尝试添加 UnityEngine 前缀
                if (!typeName.Contains("."))
                {
                    type = assembly.GetType($"UnityEngine.{typeName}");
                    if (type != null && typeof(Component).IsAssignableFrom(type))
                        return type;
                    
                    // 尝试 UnityEngine.UI 前缀
                    type = assembly.GetType($"UnityEngine.UI.{typeName}");
                    if (type != null && typeof(Component).IsAssignableFrom(type))
                        return type;
                }
            }

            return null;
        }
    }
}

