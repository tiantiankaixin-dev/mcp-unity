using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using UnityEngine;
using UnityEditor;
using UnityEngine.SceneManagement;
using Newtonsoft.Json.Linq;

namespace McpUnity.Resources
{
    /// <summary>
    /// Resource for retrieving project architecture information
    /// Provides AI with global context about scripts, references, and dependencies
    /// Solves the "blind elephant touching" problem by giving AI the big picture
    /// </summary>
    public class GetProjectArchitectureResource : McpResourceBase
    {
        public GetProjectArchitectureResource()
        {
            Name = "get_project_architecture";
            Description = "Retrieves project architecture including MonoBehaviour scripts, public fields, GameObject references, and component dependencies. Provides AI with global context to avoid breaking project structure.";
            Uri = "unity://project_architecture";
        }

        public override JObject Fetch(JObject parameters)
        {
            try
            {
                JObject architecture = new JObject
                {
                    ["timestamp"] = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                    ["projectName"] = Application.productName,
                    ["unityVersion"] = Application.unityVersion,
                    ["scripts"] = GetAllMonoBehaviourScripts(),
                    ["sceneReferences"] = GetSceneReferences(),
                    ["prefabReferences"] = GetPrefabReferences()
                };

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = "Project architecture retrieved successfully",
                    ["architecture"] = architecture
                };
            }
            catch (Exception ex)
            {
                return new JObject
                {
                    ["success"] = false,
                    ["message"] = $"Failed to retrieve project architecture: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Get all MonoBehaviour scripts with their public fields and methods
        /// </summary>
        private JArray GetAllMonoBehaviourScripts()
        {
            JArray scripts = new JArray();

            var assemblies = AppDomain.CurrentDomain.GetAssemblies();
            foreach (var assembly in assemblies)
            {
                try
                {
                    var types = assembly.GetTypes()
                        .Where(t => t.IsSubclassOf(typeof(MonoBehaviour)) && !t.IsAbstract);

                    foreach (var type in types)
                    {
                        JObject scriptInfo = new JObject
                        {
                            ["name"] = type.Name,
                            ["namespace"] = type.Namespace ?? "Global",
                            ["fullName"] = type.FullName,
                            ["publicFields"] = GetPublicFields(type),
                            ["publicMethods"] = GetPublicMethods(type)
                        };

                        scripts.Add(scriptInfo);
                    }
                }
                catch
                {
                    // Skip assemblies that can't be loaded
                }
            }

            return scripts;
        }

        /// <summary>
        /// Get public fields of a type (including serialized fields)
        /// </summary>
        private JArray GetPublicFields(Type type)
        {
            JArray fields = new JArray();

            var publicFields = type.GetFields(BindingFlags.Public | BindingFlags.Instance)
                .Where(f => !f.IsStatic);

            foreach (var field in publicFields)
            {
                JObject fieldInfo = new JObject
                {
                    ["name"] = field.Name,
                    ["type"] = field.FieldType.Name,
                    ["fullType"] = field.FieldType.FullName,
                    ["isArray"] = field.FieldType.IsArray,
                    ["isList"] = field.FieldType.IsGenericType && 
                                 field.FieldType.GetGenericTypeDefinition() == typeof(List<>)
                };

                fields.Add(fieldInfo);
            }

            return fields;
        }

        /// <summary>
        /// Get public methods of a type
        /// </summary>
        private JArray GetPublicMethods(Type type)
        {
            JArray methods = new JArray();

            var publicMethods = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => !m.IsSpecialName && !m.Name.StartsWith("get_") && !m.Name.StartsWith("set_"));

            foreach (var method in publicMethods.Take(10)) // Limit to 10 methods per class
            {
                JObject methodInfo = new JObject
                {
                    ["name"] = method.Name,
                    ["returnType"] = method.ReturnType.Name,
                    ["parameters"] = new JArray(method.GetParameters().Select(p => 
                        $"{p.ParameterType.Name} {p.Name}"))
                };

                methods.Add(methodInfo);
            }

            return methods;
        }

        /// <summary>
        /// Get GameObject references in loaded scenes
        /// </summary>
        private JArray GetSceneReferences()
        {
            JArray sceneRefs = new JArray();

            int sceneCount = SceneManager.loadedSceneCount;
            for (int i = 0; i < sceneCount; i++)
            {
                Scene scene = SceneManager.GetSceneAt(i);
                GameObject[] rootObjects = scene.GetRootGameObjects();

                foreach (GameObject rootObj in rootObjects)
                {
                    AnalyzeGameObjectReferences(rootObj, sceneRefs);
                }
            }

            return sceneRefs;
        }

        /// <summary>
        /// Analyze GameObject and its components for references
        /// </summary>
        private void AnalyzeGameObjectReferences(GameObject obj, JArray sceneRefs)
        {
            if (obj == null) return;

            MonoBehaviour[] scripts = obj.GetComponents<MonoBehaviour>();
            foreach (MonoBehaviour script in scripts)
            {
                if (script == null) continue;

                Type type = script.GetType();
                var fields = type.GetFields(BindingFlags.Public | BindingFlags.Instance);

                foreach (var field in fields)
                {
                    object value = field.GetValue(script);
                    if (value == null) continue;

                    // Check if field is a GameObject or Component reference
                    if (value is GameObject || value is Component)
                    {
                        JObject refInfo = new JObject
                        {
                            ["gameObject"] = obj.name,
                            ["script"] = type.Name,
                            ["field"] = field.Name,
                            ["fieldType"] = field.FieldType.Name,
                            ["referencedObject"] = value is GameObject go ? go.name : ((Component)value).gameObject.name
                        };

                        sceneRefs.Add(refInfo);
                    }
                }
            }

            // Recursively analyze children
            foreach (Transform child in obj.transform)
            {
                AnalyzeGameObjectReferences(child.gameObject, sceneRefs);
            }
        }

        /// <summary>
        /// Get prefab references in the project
        /// </summary>
        private JArray GetPrefabReferences()
        {
            JArray prefabRefs = new JArray();

            string[] prefabGuids = AssetDatabase.FindAssets("t:Prefab");
            
            // Limit to 50 prefabs to avoid excessive data
            foreach (string guid in prefabGuids.Take(50))
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);

                if (prefab != null)
                {
                    JObject prefabInfo = new JObject
                    {
                        ["name"] = prefab.name,
                        ["path"] = path,
                        ["components"] = new JArray(prefab.GetComponents<Component>()
                            .Where(c => c != null)
                            .Select(c => c.GetType().Name))
                    };

                    prefabRefs.Add(prefabInfo);
                }
            }

            return prefabRefs;
        }
    }
}
