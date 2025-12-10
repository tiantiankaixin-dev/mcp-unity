using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// 自定义工具：批量重命名场景中的 GameObject
    /// 示例：将所有名为 "Cube" 的对象重命名为 "Enemy_1", "Enemy_2", ...
    /// </summary>
    public class BatchRenameGameObjectsTool : McpToolBase
    {
        public BatchRenameGameObjectsTool()
        {
            Name = "batch_rename_gameobjects";
            Description = "Batch rename GameObjects in the scene by pattern. Supports prefix, suffix, and numbering.";
            IsAsync = false; // 同步执行
        }

        /// <summary>
        /// 执行批量重命名
        /// </summary>
        /// <param name="parameters">
        /// 参数：
        /// - instanceIds (int[], optional): GameObject 实例 ID 数组（与 oldNamePattern 二选一）
        /// - oldNamePattern (string, optional): 要匹配的旧名称模式（支持通配符 *）（与 instanceIds 二选一）
        /// - newNamePrefix (string): 新名称前缀
        /// - newNameSuffix (string, optional): 新名称后缀
        /// - startNumber (int, optional): 起始编号，默认 1
        /// - includeChildren (bool, optional): 是否包含子对象，默认 false
        /// </param>
        /// <returns>JObject 包含成功信息和重命名的对象列表</returns>
        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 1. 提取参数
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string oldNamePattern = parameters["oldNamePattern"]?.ToObject<string>();
                string newNamePrefix = parameters["newNamePrefix"]?.ToObject<string>();
                string newNameSuffix = parameters["newNameSuffix"]?.ToObject<string>() ?? "";
                int startNumber = parameters["startNumber"]?.ToObject<int>() ?? 1;
                bool includeChildren = parameters["includeChildren"]?.ToObject<bool>() ?? false;

                // 2. 参数验证 - 需要 instanceIds 或 oldNamePattern 其中之一
                bool hasInstanceIds = instanceIdsArray != null && instanceIdsArray.Count > 0;
                bool hasOldNamePattern = !string.IsNullOrEmpty(oldNamePattern);
                
                if (!hasInstanceIds && !hasOldNamePattern)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Either 'instanceIds' or 'oldNamePattern' parameter is required.",
                        "validation_error"
                    );
                }

                if (string.IsNullOrEmpty(newNamePrefix))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'newNamePrefix' parameter is required.",
                        "validation_error"
                    );
                }

                // 3. 查找匹配的 GameObject
                List<GameObject> matchedObjects;
                if (hasInstanceIds)
                {
                    // 通过 instanceIds 查找对象
                    matchedObjects = new List<GameObject>();
                    foreach (JToken idToken in instanceIdsArray)
                    {
                        int instanceId = idToken.ToObject<int>();
                        GameObject obj = EditorUtility.InstanceIDToObject(instanceId) as GameObject;
                        if (obj != null)
                        {
                            matchedObjects.Add(obj);
                        }
                    }
                }
                else
                {
                    // 通过名称模式查找对象
                    matchedObjects = FindMatchingGameObjects(oldNamePattern, includeChildren);
                }

                if (matchedObjects.Count == 0)
                {
                    string noMatchMessage = hasInstanceIds 
                        ? "No valid GameObjects found for the provided instance IDs."
                        : $"No GameObjects found matching pattern '{oldNamePattern}'.";
                    return new JObject
                    {
                        ["success"] = true,
                        ["type"] = "text",
                        ["message"] = noMatchMessage,
                        ["renamedCount"] = 0,
                        ["renamedObjects"] = new JArray()
                    };
                }

                // 4. 批量重命名
                JArray renamedObjectsArray = new JArray();
                int currentNumber = startNumber;

                foreach (GameObject obj in matchedObjects)
                {
                    // 记录 Undo
                    Undo.RecordObject(obj, "Batch Rename GameObject");

                    string oldName = obj.name;
                    string newName = $"{newNamePrefix}{currentNumber}{newNameSuffix}";
                    
                    obj.name = newName;
                    EditorUtility.SetDirty(obj);

                    // 记录重命名信息
                    renamedObjectsArray.Add(new JObject
                    {
                        ["oldName"] = oldName,
                        ["newName"] = newName,
                        ["instanceId"] = obj.GetInstanceID(),
                        ["path"] = GetGameObjectPath(obj)
                    });

                    currentNumber++;
                }

                // 5. 返回成功结果
                McpLogger.LogInfo($"BatchRenameGameObjectsTool: Successfully renamed {matchedObjects.Count} GameObjects.");

                string successMessage = hasInstanceIds
                    ? $"Successfully renamed {matchedObjects.Count} GameObject(s) to '{newNamePrefix}[number]{newNameSuffix}'."
                    : $"Successfully renamed {matchedObjects.Count} GameObject(s) from pattern '{oldNamePattern}' to '{newNamePrefix}[number]{newNameSuffix}'.";

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = successMessage,
                    ["renamedCount"] = matchedObjects.Count,
                    ["renamedObjects"] = renamedObjectsArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BatchRenameGameObjectsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse(
                    $"Failed to batch rename GameObjects: {ex.Message}",
                    "execution_error"
                );
            }
        }

        /// <summary>
        /// 查找匹配名称模式的 GameObject
        /// </summary>
        private List<GameObject> FindMatchingGameObjects(string pattern, bool includeChildren)
        {
            List<GameObject> matchedObjects = new List<GameObject>();
            
            // 获取场景中所有根对象
            GameObject[] rootObjects = UnityEngine.SceneManagement.SceneManager.GetActiveScene().GetRootGameObjects();

            foreach (GameObject rootObj in rootObjects)
            {
                // 检查根对象
                if (MatchesPattern(rootObj.name, pattern))
                {
                    matchedObjects.Add(rootObj);
                }

                // 如果包含子对象，递归查找
                if (includeChildren)
                {
                    FindMatchingInChildren(rootObj.transform, pattern, matchedObjects);
                }
            }

            return matchedObjects;
        }

        /// <summary>
        /// 递归查找子对象中匹配的 GameObject
        /// </summary>
        private void FindMatchingInChildren(Transform parent, string pattern, List<GameObject> results)
        {
            foreach (Transform child in parent)
            {
                if (MatchesPattern(child.name, pattern))
                {
                    results.Add(child.gameObject);
                }

                // 递归查找子对象的子对象
                FindMatchingInChildren(child, pattern, results);
            }
        }

        /// <summary>
        /// 检查名称是否匹配模式（支持通配符 *）
        /// </summary>
        private bool MatchesPattern(string name, string pattern)
        {
            // 简单的通配符匹配
            if (pattern == "*")
            {
                return true;
            }

            if (pattern.Contains("*"))
            {
                // 将通配符转换为正则表达式
                string regexPattern = "^" + System.Text.RegularExpressions.Regex.Escape(pattern).Replace("\\*", ".*") + "$";
                return System.Text.RegularExpressions.Regex.IsMatch(name, regexPattern);
            }

            // 精确匹配
            return name == pattern;
        }

        /// <summary>
        /// 获取 GameObject 的层级路径
        /// </summary>
        private static string GetGameObjectPath(GameObject obj)
        {
            if (obj == null) return null;
            
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

