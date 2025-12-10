using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to remove a component from a GameObject
    /// Based on Unity API: Undo.DestroyObjectImmediate
    /// https://docs.unity3d.com/ScriptReference/Undo.DestroyObjectImmediate.html
    /// </summary>
    public class RemoveComponentTool : McpToolBase
    {
        public RemoveComponentTool()
        {
            Name = "remove_component";
            Description = "Remove a component from a GameObject. Supports Undo/Redo.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                int? instanceId = parameters["instanceId"]?.ToObject<int>();
                string objectPath = parameters["objectPath"]?.ToObject<string>();
                string componentType = parameters["componentType"]?.ToObject<string>();
                bool removeAll = parameters["removeAll"]?.ToObject<bool>() ?? false;

                if (string.IsNullOrEmpty(componentType))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'componentType' is required. Example: 'Rigidbody', 'BoxCollider'.",
                        "validation_error");
                }

                // Cannot remove Transform
                if (componentType.Equals("Transform", StringComparison.OrdinalIgnoreCase))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Cannot remove Transform component. It is required by all GameObjects.",
                        "validation_error");
                }

                GameObject target = null;

                if (instanceId.HasValue)
                {
                    target = EditorUtility.InstanceIDToObject(instanceId.Value) as GameObject;
                }
                else if (!string.IsNullOrEmpty(objectPath))
                {
                    target = GameObject.Find(objectPath);
                }

                if (target == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "GameObject not found. Provide valid 'instanceId' or 'objectPath'.",
                        "validation_error");
                }

                Type type = GetTypeByName(componentType);
                if (type == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Component type '{componentType}' not found.",
                        "validation_error");
                }

                Component[] components = target.GetComponents(type);
                if (components.Length == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"No '{componentType}' component found on '{target.name}'.",
                        "validation_error");
                }

                JArray removedArray = new JArray();
                int removeCount = removeAll ? components.Length : 1;

                for (int i = 0; i < removeCount; i++)
                {
                    Component comp = components[i];
                    string compName = comp.GetType().Name;
                    
                    Undo.DestroyObjectImmediate(comp);
                    
                    removedArray.Add(new JObject
                    {
                        ["type"] = compName,
                        ["gameObject"] = target.name
                    });
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Removed {removedArray.Count} '{componentType}' component(s) from '{target.name}'.",
                    ["gameObjectName"] = target.name,
                    ["count"] = removedArray.Count,
                    ["removedComponents"] = removedArray
                };
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private Type GetTypeByName(string typeName)
        {
            Type type = Type.GetType($"UnityEngine.{typeName}, UnityEngine");
            if (type != null) return type;

            type = Type.GetType($"UnityEngine.UI.{typeName}, UnityEngine.UI");
            if (type != null) return type;

            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                type = assembly.GetType(typeName);
                if (type != null) return type;
            }

            return null;
        }
    }
}
