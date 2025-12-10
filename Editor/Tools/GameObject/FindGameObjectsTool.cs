using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to find GameObjects in the scene
    /// Based on Unity API: GameObject.Find, FindGameObjectsWithTag, FindObjectsOfType
    /// https://docs.unity3d.com/ScriptReference/GameObject.Find.html
    /// </summary>
    public class FindGameObjectsTool : McpToolBase
    {
        public FindGameObjectsTool()
        {
            Name = "find_gameobjects";
            Description = "Find GameObjects by name, tag, layer, or component type.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string objectName = parameters["objectName"]?.ToObject<string>();
                string tag = parameters["tag"]?.ToObject<string>();
                string layer = parameters["layer"]?.ToObject<string>();
                string componentType = parameters["componentType"]?.ToObject<string>();
                bool includeInactive = parameters["includeInactive"]?.ToObject<bool>() ?? false;
                int maxResults = parameters["maxResults"]?.ToObject<int>() ?? 100;

                List<GameObject> results = new List<GameObject>();

                // Method 1: Find by tag
                if (!string.IsNullOrEmpty(tag))
                {
                    try
                    {
                        GameObject[] taggedObjects = GameObject.FindGameObjectsWithTag(tag);
                        results.AddRange(taggedObjects);
                    }
                    catch { /* Tag might not exist */ }
                }
                // Method 2: Find by name or all objects
                else
                {
                    GameObject[] allObjects = includeInactive 
                        ? UnityEngine.Resources.FindObjectsOfTypeAll<GameObject>() 
                        : UnityEngine.Object.FindObjectsByType<GameObject>(FindObjectsSortMode.None);
                    
                    foreach (GameObject obj in allObjects)
                    {
                        // Skip prefabs and hidden objects
                        if (obj.scene.name == null) continue;
                        
                        bool match = true;

                        // Filter by name
                        if (!string.IsNullOrEmpty(objectName))
                        {
                            match = obj.name.Contains(objectName) || obj.name == objectName;
                        }

                        // Filter by layer
                        if (match && !string.IsNullOrEmpty(layer))
                        {
                            int layerIndex = LayerMask.NameToLayer(layer);
                            match = obj.layer == layerIndex;
                        }

                        // Filter by component
                        if (match && !string.IsNullOrEmpty(componentType))
                        {
                            Type type = GetTypeByName(componentType);
                            match = type != null && obj.GetComponent(type) != null;
                        }

                        if (match)
                        {
                            results.Add(obj);
                            if (results.Count >= maxResults) break;
                        }
                    }
                }

                JArray foundArray = new JArray();
                foreach (GameObject obj in results)
                {
                    if (foundArray.Count >= maxResults) break;
                    
                    foundArray.Add(new JObject
                    {
                        ["name"] = obj.name,
                        ["instanceId"] = obj.GetInstanceID(),
                        ["path"] = GetGameObjectPath(obj),
                        ["tag"] = obj.tag,
                        ["layer"] = LayerMask.LayerToName(obj.layer),
                        ["active"] = obj.activeInHierarchy
                    });
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Found {foundArray.Count} GameObject(s).",
                    ["count"] = foundArray.Count,
                    ["gameObjects"] = foundArray
                };
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

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

        private Type GetTypeByName(string typeName)
        {
            // Try common Unity types first
            Type type = Type.GetType($"UnityEngine.{typeName}, UnityEngine");
            if (type != null) return type;

            type = Type.GetType($"UnityEngine.UI.{typeName}, UnityEngine.UI");
            if (type != null) return type;

            // Search all assemblies
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
            {
                type = assembly.GetType(typeName);
                if (type != null) return type;
            }

            return null;
        }
    }
}
