using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class GroupGameObjectsTool : McpToolBase
    {
        public GroupGameObjectsTool()
        {
            Name = "group_gameobjects";
            Description = "Group multiple GameObjects under a new parent GameObject.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string groupName = parameters["groupName"]?.ToObject<string>() ?? "Group";
                bool centerPivot = parameters["centerPivot"]?.ToObject<bool>() ?? true;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                if (objects.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "No valid GameObjects found.", "validation_error");
                }

                // 创建组对象
                GameObject group = new GameObject(groupName);
                Undo.RegisterCreatedObjectUndo(group, "Group GameObjects");

                // 计算中心点
                if (centerPivot && objects.Count > 0)
                {
                    Vector3 center = Vector3.zero;
                    foreach (GameObject obj in objects)
                    {
                        center += obj.transform.position;
                    }
                    center /= objects.Count;
                    group.transform.position = center;
                }
                else if (objects.Count > 0)
                {
                    group.transform.position = objects[0].transform.position;
                }

                // 将对象设为组的子对象
                JArray groupedArray = new JArray();
                foreach (GameObject obj in objects)
                {
                    Undo.SetTransformParent(obj.transform, group.transform, "Group GameObjects");
                    
                    groupedArray.Add(new JObject
                    {
                        ["name"] = obj.name,
                        ["instanceId"] = obj.GetInstanceID()
                    });
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Grouped {objects.Count} GameObject(s) under '{groupName}'.",
                    ["groupName"] = groupName,
                    ["groupInstanceId"] = group.GetInstanceID(),
                    ["count"] = objects.Count,
                    ["groupedObjects"] = groupedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"GroupGameObjectsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

