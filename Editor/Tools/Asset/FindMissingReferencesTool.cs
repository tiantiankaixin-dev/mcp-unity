using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 查找丢失引用工具
    /// 扫描场景中所有GameObject和组件，查找丢失的引用
    /// </summary>
    public class FindMissingReferencesTool : McpToolBase
    {
        public FindMissingReferencesTool()
        {
            Name = "find_missing_references";
            Description = "Find all missing references in the current scene or entire project.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 参数
                bool scanProject = parameters["scanProject"]?.ToObject<bool>() ?? false;
                bool includeInactive = parameters["includeInactive"]?.ToObject<bool>() ?? true;

                JArray missingRefsArray = new JArray();
                int totalMissingCount = 0;

                if (scanProject)
                {
                    // 扫描整个项目的所有场景
                    string[] scenePaths = AssetDatabase.FindAssets("t:Scene");
                    
                    foreach (string sceneGuid in scenePaths)
                    {
                        string scenePath = AssetDatabase.GUIDToAssetPath(sceneGuid);
                        Scene scene = EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Single);
                        
                        var sceneRefs = ScanScene(scene, includeInactive);
                        totalMissingCount += sceneRefs.Count;
                        
                        if (sceneRefs.Count > 0)
                        {
                            missingRefsArray.Add(new JObject
                            {
                                ["scenePath"] = scenePath,
                                ["sceneName"] = scene.name,
                                ["missingCount"] = sceneRefs.Count,
                                ["references"] = JArray.FromObject(sceneRefs)
                            });
                        }
                    }
                }
                else
                {
                    // 只扫描当前场景
                    Scene currentScene = SceneManager.GetActiveScene();
                    var sceneRefs = ScanScene(currentScene, includeInactive);
                    totalMissingCount = sceneRefs.Count;
                    
                    if (sceneRefs.Count > 0)
                    {
                        missingRefsArray.Add(new JObject
                        {
                            ["scenePath"] = currentScene.path,
                            ["sceneName"] = currentScene.name,
                            ["missingCount"] = sceneRefs.Count,
                            ["references"] = JArray.FromObject(sceneRefs)
                        });
                    }
                }

                string message = totalMissingCount > 0 
                    ? $"Found {totalMissingCount} missing reference(s)." 
                    : "No missing references found.";

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = message,
                    ["totalMissingCount"] = totalMissingCount,
                    ["scenes"] = missingRefsArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"FindMissingReferencesTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private List<JObject> ScanScene(Scene scene, bool includeInactive)
        {
            List<JObject> missingRefs = new List<JObject>();
            GameObject[] rootObjects = scene.GetRootGameObjects();

            foreach (GameObject root in rootObjects)
            {
                ScanGameObject(root, missingRefs, includeInactive);
            }

            return missingRefs;
        }

        private void ScanGameObject(GameObject obj, List<JObject> missingRefs, bool includeInactive)
        {
            if (!includeInactive && !obj.activeInHierarchy) return;

            Component[] components = obj.GetComponents<Component>();
            foreach (Component comp in components)
            {
                if (comp == null)
                {
                    missingRefs.Add(new JObject
                    {
                        ["objectPath"] = GetGameObjectPath(obj),
                        ["objectName"] = obj.name,
                        ["componentType"] = "Missing Component",
                        ["propertyName"] = "Component"
                    });
                    continue;
                }

                SerializedObject so = new SerializedObject(comp);
                SerializedProperty sp = so.GetIterator();

                while (sp.NextVisible(true))
                {
                    if (sp.propertyType == SerializedPropertyType.ObjectReference)
                    {
                        if (sp.objectReferenceValue == null && sp.objectReferenceInstanceIDValue != 0)
                        {
                            missingRefs.Add(new JObject
                            {
                                ["objectPath"] = GetGameObjectPath(obj),
                                ["objectName"] = obj.name,
                                ["componentType"] = comp.GetType().Name,
                                ["propertyName"] = sp.name
                            });
                        }
                    }
                }
            }

            foreach (Transform child in obj.transform)
            {
                ScanGameObject(child.gameObject, missingRefs, includeInactive);
            }
        }

        private string GetGameObjectPath(GameObject obj)
        {
            string path = "/" + obj.name;
            while (obj.transform.parent != null)
            {
                obj = obj.transform.parent.gameObject;
                path = "/" + obj.name + path;
            }
            return path;
        }
    }
}

