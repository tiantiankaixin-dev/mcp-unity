using System;
using McpUnity.Unity;
using McpUnity.Utils;
using UnityEngine;
using UnityEditor;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool for setting GameObject or Component references on component fields using SerializedProperty
    /// This properly handles Unity's serialization system for object references
    /// </summary>
    public class SetComponentReferenceTool : McpToolBase
    {
        public SetComponentReferenceTool()
        {
            Name = "set_component_reference";
            Description = "Sets a GameObject or Component reference on a component field (e.g., setting menuPanel field to reference another GameObject)";
        }
        
        /// <summary>
        /// Execute the SetComponentReference tool
        /// </summary>
        public override JObject Execute(JObject parameters)
        {
            // Extract parameters
            string targetObjectPath = parameters["targetObjectPath"]?.ToObject<string>();
            string componentName = parameters["componentName"]?.ToObject<string>();
            string fieldName = parameters["fieldName"]?.ToObject<string>();
            string referenceObjectPath = parameters["referenceObjectPath"]?.ToObject<string>();
            
            // Validate parameters
            if (string.IsNullOrEmpty(targetObjectPath))
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    "Required parameter 'targetObjectPath' not provided", 
                    "validation_error"
                );
            }
            
            if (string.IsNullOrEmpty(componentName))
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    "Required parameter 'componentName' not provided", 
                    "validation_error"
                );
            }
            
            if (string.IsNullOrEmpty(fieldName))
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    "Required parameter 'fieldName' not provided", 
                    "validation_error"
                );
            }
            
            if (string.IsNullOrEmpty(referenceObjectPath))
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    "Required parameter 'referenceObjectPath' not provided", 
                    "validation_error"
                );
            }
            
            // Find the target GameObject
            GameObject targetObject = FindGameObjectByPath(targetObjectPath);
            if (targetObject == null)
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Target GameObject with path '{targetObjectPath}' not found", 
                    "not_found_error"
                );
            }
            
            // Find the component on target GameObject
            Component component = targetObject.GetComponent(componentName);
            if (component == null)
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Component '{componentName}' not found on GameObject '{targetObject.name}'", 
                    "component_error"
                );
            }
            
            // Find the reference GameObject
            GameObject referenceObject = FindGameObjectByPath(referenceObjectPath);
            if (referenceObject == null)
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Reference GameObject with path '{referenceObjectPath}' not found", 
                    "not_found_error"
                );
            }
            
            // Use SerializedObject to set the reference properly
            SerializedObject serializedObject = new SerializedObject(component);
            SerializedProperty property = serializedObject.FindProperty(fieldName);
            
            // If not found, try with "m_" prefix (Unity's convention for serialized fields)
            if (property == null && !fieldName.StartsWith("m_"))
            {
                string capitalizedName = char.ToUpper(fieldName[0]) + fieldName.Substring(1);
                property = serializedObject.FindProperty("m_" + capitalizedName);
            }
            
            if (property == null)
            {
                // List available fields to help the user
                var availableFields = new System.Collections.Generic.List<string>();
                var iterator = serializedObject.GetIterator();
                if (iterator.NextVisible(true))
                {
                    do
                    {
                        if (iterator.propertyType == SerializedPropertyType.ObjectReference)
                        {
                            availableFields.Add(iterator.name);
                        }
                    } while (iterator.NextVisible(false));
                }
                
                string fieldList = availableFields.Count > 0 
                    ? string.Join(", ", availableFields) 
                    : "none found";
                
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Field '{fieldName}' not found on component '{componentName}'. Available reference fields: {fieldList}", 
                    "field_error"
                );
            }
            
            if (property.propertyType != SerializedPropertyType.ObjectReference)
            {
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Field '{fieldName}' is not an object reference field (type: {property.propertyType})", 
                    "field_type_error"
                );
            }
            
            // Set the reference using SerializedProperty.objectReferenceValue
            Undo.RecordObject(component, $"Set {fieldName} reference");
            property.objectReferenceValue = referenceObject;
            serializedObject.ApplyModifiedProperties();
            
            // Mark as dirty to ensure changes are saved
            EditorUtility.SetDirty(component);
            if (PrefabUtility.IsPartOfAnyPrefab(component))
            {
                PrefabUtility.RecordPrefabInstancePropertyModifications(component);
            }
            
            McpLogger.LogInfo($"[MCP Unity] Set '{fieldName}' on '{componentName}' to reference '{referenceObject.name}'");
            
            // Create success response
            return new JObject
            {
                ["success"] = true,
                ["type"] = "text",
                ["message"] = $"Successfully set '{fieldName}' on component '{componentName}' to reference GameObject '{referenceObject.name}'"
            };
        }
        
        /// <summary>
        /// Find a GameObject by its hierarchy path
        /// </summary>
        private GameObject FindGameObjectByPath(string path)
        {
            // Try direct find first
            GameObject obj = GameObject.Find(path);
            if (obj != null) return obj;
            
            // Split the path by '/'
            string[] pathParts = path.Split('/');
            if (pathParts.Length == 0) return null;
            
            // Search through all root GameObjects in active scene
            GameObject[] rootGameObjects = UnityEngine.SceneManagement.SceneManager.GetActiveScene().GetRootGameObjects();
            
            foreach (GameObject rootObj in rootGameObjects)
            {
                if (rootObj.name == pathParts[0])
                {
                    GameObject current = rootObj;
                    
                    // Traverse down the path
                    for (int i = 1; i < pathParts.Length; i++)
                    {
                        Transform child = current.transform.Find(pathParts[i]);
                        if (child == null) return null;
                        current = child.gameObject;
                    }
                    
                    return current;
                }
            }
            
            return null;
        }
    }
}
