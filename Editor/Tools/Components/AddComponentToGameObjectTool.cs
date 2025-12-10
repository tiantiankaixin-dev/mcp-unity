using System;
using System.Linq;
using McpUnity.Unity;
using McpUnity.Utils;
using UnityEngine;
using UnityEditor;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool for adding components to GameObjects in the Unity Editor
    /// Based on Unity Official API:
    /// - GameObject.AddComponent: https://docs.unity3d.com/ScriptReference/GameObject.AddComponent.html
    /// - Undo.AddComponent: https://docs.unity3d.com/ScriptReference/Undo.AddComponent.html
    /// - Selection.activeGameObject: https://docs.unity3d.com/ScriptReference/Selection-activeGameObject.html
    /// </summary>
    public class AddComponentToGameObjectTool : McpToolBase
    {
        public AddComponentToGameObjectTool()
        {
            Name = "add_component_to_gameobject";
            Description = "Adds a component to a GameObject and optionally selects it in the hierarchy. Supports Undo/Redo.";
            IsAsync = false;
        }
        
        /// <summary>
        /// Execute the AddComponentToGameObject tool with the provided parameters
        /// </summary>
        /// <param name="parameters">Tool parameters as a JObject</param>
        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Extract parameters
                string gameObjectPath = parameters["gameObjectPath"]?.ToObject<string>();
                string gameObjectName = parameters["gameObjectName"]?.ToObject<string>();
                int? instanceId = parameters["instanceId"]?.ToObject<int?>();
                string componentType = parameters["componentType"]?.ToObject<string>();
                bool selectAfterAdd = parameters["selectAfterAdd"]?.ToObject<bool>() ?? true;
                
                // Validate required parameters
                if (string.IsNullOrEmpty(componentType))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Required parameter 'componentType' not provided", 
                        "validation_error"
                    );
                }
                
                if (string.IsNullOrEmpty(gameObjectPath) && string.IsNullOrEmpty(gameObjectName) && !instanceId.HasValue)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Required parameter 'gameObjectPath', 'gameObjectName' or 'instanceId' not provided", 
                        "validation_error"
                    );
                }
                
                // Find the GameObject
                GameObject targetGameObject = null;
                
                if (instanceId.HasValue)
                {
                    targetGameObject = EditorUtility.InstanceIDToObject(instanceId.Value) as GameObject;
                }
                else if (!string.IsNullOrEmpty(gameObjectPath))
                {
                    targetGameObject = GameObject.Find(gameObjectPath);
                }
                else
                {
                    targetGameObject = GameObject.Find(gameObjectName);
                }
                
                if (targetGameObject == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"GameObject not found: {gameObjectPath ?? gameObjectName ?? instanceId.ToString()}", 
                        "not_found"
                    );
                }
                
                // Find the component type
                Type type = FindComponentType(componentType);
                
                if (type == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Component type '{componentType}' not found. Make sure it's a valid Unity or custom component type.", 
                        "validation_error"
                    );
                }
                
                // Check if component already exists (for components that don't allow duplicates)
                if (typeof(Component).IsAssignableFrom(type))
                {
                    Component existingComponent = targetGameObject.GetComponent(type);
                    if (existingComponent != null && !AllowMultipleComponents(type))
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"GameObject '{targetGameObject.name}' already has a {componentType} component and this type doesn't allow multiple instances.", 
                            "validation_error"
                        );
                    }
                }
                
                // Add component with Undo support (Unity Official API)
                Component addedComponent = Undo.AddComponent(targetGameObject, type);
                
                if (addedComponent == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Failed to add component '{componentType}' to GameObject '{targetGameObject.name}'", 
                        "execution_error"
                    );
                }
                
                // Select the GameObject in hierarchy if requested (Unity Official API)
                if (selectAfterAdd)
                {
                    Selection.activeGameObject = targetGameObject;
                    EditorGUIUtility.PingObject(targetGameObject);
                }
                
                McpLogger.LogInfo($"[MCP Unity] Added component '{componentType}' to GameObject '{targetGameObject.name}'");
                
                // Create the response
                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Successfully added {componentType} component to GameObject '{targetGameObject.name}'",
                    ["gameObjectName"] = targetGameObject.name,
                    ["gameObjectPath"] = GetGameObjectPath(targetGameObject),
                    ["componentType"] = componentType,
                    ["instanceId"] = targetGameObject.GetInstanceID(),
                    ["selected"] = selectAfterAdd
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddComponentToGameObjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
        
        /// <summary>
        /// Find component type by name, supporting both full names and short names
        /// </summary>
        private Type FindComponentType(string typeName)
        {
            // Try exact match first
            Type type = Type.GetType(typeName);
            if (type != null) return type;
            
            // Try with UnityEngine namespace
            type = Type.GetType($"UnityEngine.{typeName}");
            if (type != null) return type;
            
            // Try with UnityEngine.UI namespace
            type = Type.GetType($"UnityEngine.UI.{typeName}");
            if (type != null) return type;
            
            // Search in all loaded assemblies
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                type = assembly.GetTypes().FirstOrDefault(t => 
                    t.Name == typeName || 
                    t.FullName == typeName
                );
                if (type != null) return type;
            }
            
            return null;
        }
        
        /// <summary>
        /// Check if a component type allows multiple instances
        /// </summary>
        private bool AllowMultipleComponents(Type type)
        {
            // Check for DisallowMultipleComponent attribute
            var attributes = type.GetCustomAttributes(typeof(DisallowMultipleComponent), true);
            return attributes.Length == 0;
        }
        
        /// <summary>
        /// Get the full hierarchy path of a GameObject
        /// </summary>
        private string GetGameObjectPath(GameObject obj)
        {
            string path = obj.name;
            Transform parent = obj.transform.parent;
            
            while (parent != null)
            {
                path = parent.name + "/" + path;
                parent = parent.parent;
            }
            
            return path;
        }
    }
}

