using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using UnityEngine.SceneManagement;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 清理空对象工具
    /// 删除场景中没有组件且没有子对象的空GameObject
    /// </summary>
    public class CleanupEmptyGameObjectsTool : McpToolBase
    {
        public CleanupEmptyGameObjectsTool()
        {
            Name = "cleanup_empty_gameobjects";
            Description = "Remove empty GameObjects (no components, no children) from the scene.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                bool includeInactive = parameters["includeInactive"]?.ToObject<bool>() ?? true;
                bool dryRun = parameters["dryRun"]?.ToObject<bool>() ?? false;

                Scene currentScene = SceneManager.GetActiveScene();
                GameObject[] rootObjects = currentScene.GetRootGameObjects();

                List<GameObject> emptyObjects = new List<GameObject>();
                JArray emptyObjectsArray = new JArray();

                foreach (GameObject root in rootObjects)
                {
                    FindEmptyGameObjects(root, emptyObjects, includeInactive);
                }

                if (!dryRun)
                {
                    foreach (GameObject obj in emptyObjects)
                    {
                        emptyObjectsArray.Add(new JObject
                        {
                            ["name"] = obj.name,
                            ["path"] = GetGameObjectPath(obj)
                        });
                        
                        Undo.DestroyObjectImmediate(obj);
                    }
                }
                else
                {
                    foreach (GameObject obj in emptyObjects)
                    {
                        emptyObjectsArray.Add(new JObject
                        {
                            ["name"] = obj.name,
                            ["path"] = GetGameObjectPath(obj)
                        });
                    }
                }

                string message = dryRun 
                    ? $"Found {emptyObjects.Count} empty GameObject(s) (dry run, not deleted)."
                    : $"Deleted {emptyObjects.Count} empty GameObject(s).";

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = message,
                    ["count"] = emptyObjects.Count,
                    ["dryRun"] = dryRun,
                    ["emptyObjects"] = emptyObjectsArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CleanupEmptyGameObjectsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private void FindEmptyGameObjects(GameObject obj, List<GameObject> emptyObjects, bool includeInactive)
        {
            if (!includeInactive && !obj.activeInHierarchy) return;

            // 先递归检查子对象
            List<Transform> children = new List<Transform>();
            foreach (Transform child in obj.transform)
            {
                children.Add(child);
            }

            foreach (Transform child in children)
            {
                FindEmptyGameObjects(child.gameObject, emptyObjects, includeInactive);
            }

            // 检查当前对象是否为空
            if (IsEmptyGameObject(obj))
            {
                emptyObjects.Add(obj);
            }
        }

        private bool IsEmptyGameObject(GameObject obj)
        {
            // 有子对象则不是空的
            if (obj.transform.childCount > 0) return false;

            // 获取所有组件（除了Transform）
            Component[] components = obj.GetComponents<Component>();
            
            // 只有Transform组件才算空对象
            return components.Length == 1 && components[0] is Transform;
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

