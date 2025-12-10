using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class ReplaceGameObjectsTool : McpToolBase
    {
        public ReplaceGameObjectsTool()
        {
            Name = "replace_gameobjects";
            Description = "Replace GameObjects with a prefab or another GameObject.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string replacementPrefabPath = parameters["replacementPrefabPath"]?.ToObject<string>();
                bool keepTransform = parameters["keepTransform"]?.ToObject<bool>() ?? true;
                bool keepName = parameters["keepName"]?.ToObject<bool>() ?? false;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (string.IsNullOrEmpty(replacementPrefabPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'replacementPrefabPath' is required.", "validation_error");
                }

                GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(replacementPrefabPath);
                if (prefab == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Prefab not found: {replacementPrefabPath}", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray replacedArray = new JArray();
                foreach (GameObject oldObj in objects)
                {
                    Transform parent = oldObj.transform.parent;
                    Vector3 position = oldObj.transform.position;
                    Quaternion rotation = oldObj.transform.rotation;
                    Vector3 scale = oldObj.transform.localScale;
                    string oldName = oldObj.name;
                    int siblingIndex = oldObj.transform.GetSiblingIndex();

                    GameObject newObj = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
                    
                    if (keepTransform)
                    {
                        newObj.transform.position = position;
                        newObj.transform.rotation = rotation;
                        newObj.transform.localScale = scale;
                    }
                    
                    newObj.transform.SetParent(parent);
                    newObj.transform.SetSiblingIndex(siblingIndex);
                    
                    if (keepName)
                    {
                        newObj.name = oldName;
                    }

                    Undo.RegisterCreatedObjectUndo(newObj, "Replace GameObject");
                    Undo.DestroyObjectImmediate(oldObj);

                    replacedArray.Add(new JObject
                    {
                        ["oldName"] = oldName,
                        ["newName"] = newObj.name,
                        ["instanceId"] = newObj.GetInstanceID()
                    });
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Replaced {objects.Count} GameObject(s) with prefab.",
                    ["count"] = objects.Count,
                    ["replacedObjects"] = replacedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"ReplaceGameObjectsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

