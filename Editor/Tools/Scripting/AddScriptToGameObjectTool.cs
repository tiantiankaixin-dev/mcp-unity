using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Attach a C# script component to a GameObject in the scene hierarchy
    /// Uses Reflection to find and add the script type
    /// </summary>
    public class AddScriptToGameObjectTool : McpToolBase
    {
        public AddScriptToGameObjectTool()
        {
            Name = "add_script_to_gameobject";
            Description = "Attach a C# script component to a GameObject in the scene hierarchy";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and gameObjectPath
                int? instanceId = parameters["instanceId"]?.ToObject<int?>();
                string gameObjectPath = parameters["gameObjectPath"]?.ToString();
                string scriptPath = parameters["scriptPath"]?.ToString();
                string scriptName = parameters["scriptName"]?.ToString();
                
                if (!instanceId.HasValue && string.IsNullOrEmpty(gameObjectPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Either 'instanceId' or 'gameObjectPath' is required", "validation_error");
                }

                if (string.IsNullOrEmpty(scriptPath) && string.IsNullOrEmpty(scriptName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Either scriptPath or scriptName is required", "validation_error");
                }

                // Try to find the GameObject by instanceId first, then by path
                GameObject obj = null;
                string identifier = "";
                
                if (instanceId.HasValue && instanceId.Value != 0)
                {
                    obj = EditorUtility.InstanceIDToObject(instanceId.Value) as GameObject;
                    identifier = $"instanceId {instanceId.Value}";
                }
                else if (!string.IsNullOrEmpty(gameObjectPath))
                {
                    obj = GameObject.Find(gameObjectPath);
                    identifier = gameObjectPath;
                }
                
                if (obj == null)
                {
                    bool createIfNotExists = parameters["createIfNotExists"]?.ToObject<bool>() ?? false;
                    
                    if (createIfNotExists && !string.IsNullOrEmpty(gameObjectPath))
                    {
                        string parentPath = parameters["parentPath"]?.ToString();
                        Transform parent = null;
                        
                        if (!string.IsNullOrEmpty(parentPath))
                        {
                            GameObject parentObj = GameObject.Find(parentPath);
                            if (parentObj != null) parent = parentObj.transform;
                        }

                        obj = new GameObject(gameObjectPath);
                        if (parent != null) obj.transform.SetParent(parent);
                        Undo.RegisterCreatedObjectUndo(obj, "Create GameObject");
                    }
                    else
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"GameObject not found: {identifier}", "not_found");
                    }
                }

                // Determine script class name
                string className = scriptName;
                if (string.IsNullOrEmpty(className) && !string.IsNullOrEmpty(scriptPath))
                {
                    className = Path.GetFileNameWithoutExtension(scriptPath);
                }

                // Find the type in all assemblies
                Type scriptType = FindType(className);

                if (scriptType == null)
                {
                    // Try adding namespace if provided
                    string namespaceName = parameters["namespace"]?.ToString();
                    if (!string.IsNullOrEmpty(namespaceName))
                    {
                        scriptType = FindType($"{namespaceName}.{className}");
                    }

                    if (scriptType == null)
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Script type '{className}' not found in any assembly. Make sure the script compiles successfully.", "not_found");
                    }
                }

                // Add component
                Component component = Undo.AddComponent(obj, scriptType);
                if (component == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Failed to add component '{className}' to '{obj.name}'", "execution_error");
                }

                // Set initial values if provided
                if (parameters["initialValues"] is JObject initialValues)
                {
                    ApplyInitialValues(component, initialValues);
                }

                EditorUtility.SetDirty(obj);

                McpLogger.LogInfo($"Added script '{className}' to '{obj.name}'");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added script '{className}' to '{obj.name}'",
                    ["gameObject"] = obj.name,
                    ["script"] = className
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddScriptToGameObjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private Type FindType(string typeName)
        {
            foreach (Assembly assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                Type type = assembly.GetType(typeName);
                if (type != null)
                {
                    return type;
                }
            }
            
            // If exact match not found, search all types
            foreach (Assembly assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                foreach (Type type in assembly.GetTypes())
                {
                    if (type.Name == typeName)
                    {
                        return type;
                    }
                }
            }

            return null;
        }

        private void ApplyInitialValues(Component component, JObject values)
        {
            Type type = component.GetType();

            foreach (var prop in values.Properties())
            {
                string name = prop.Name;
                JToken value = prop.Value;

                // Try field first
                FieldInfo field = type.GetField(name, BindingFlags.Public | BindingFlags.Instance);
                if (field != null)
                {
                    try
                    {
                        object typedValue = value.ToObject(field.FieldType);
                        field.SetValue(component, typedValue);
                    }
                    catch (Exception ex)
                    {
                        McpLogger.LogWarning($"Failed to set field '{name}': {ex.Message}");
                    }
                    continue;
                }

                // Try property
                PropertyInfo property = type.GetProperty(name, BindingFlags.Public | BindingFlags.Instance);
                if (property != null && property.CanWrite)
                {
                    try
                    {
                        object typedValue = value.ToObject(property.PropertyType);
                        property.SetValue(component, typedValue);
                    }
                    catch (Exception ex)
                    {
                        McpLogger.LogWarning($"Failed to set property '{name}': {ex.Message}");
                    }
                }
            }
        }
    }
}
