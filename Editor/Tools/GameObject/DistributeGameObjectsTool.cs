using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class DistributeGameObjectsTool : McpToolBase
    {
        public DistributeGameObjectsTool()
        {
            Name = "distribute_gameobjects";
            Description = "Evenly distribute GameObjects along an axis with specified spacing.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string axis = parameters["axis"]?.ToObject<string>()?.ToUpper() ?? "X";
                float spacing = parameters["spacing"]?.ToObject<float>() ?? 1.0f;
                bool useWorldSpace = parameters["useWorldSpace"]?.ToObject<bool>() ?? true;

                if (instanceIdsArray == null || instanceIdsArray.Count < 2)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 2 GameObjects required.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                if (objects.Count < 2)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Not enough valid GameObjects found.", "validation_error");
                }

                // 按当前位置排序
                objects.Sort((a, b) =>
                {
                    Vector3 posA = useWorldSpace ? a.transform.position : a.transform.localPosition;
                    Vector3 posB = useWorldSpace ? b.transform.position : b.transform.localPosition;
                    float valA = axis == "X" ? posA.x : (axis == "Y" ? posA.y : posA.z);
                    float valB = axis == "X" ? posB.x : (axis == "Y" ? posB.y : posB.z);
                    return valA.CompareTo(valB);
                });

                // 分布对象
                Vector3 startPos = useWorldSpace ? objects[0].transform.position : objects[0].transform.localPosition;
                JArray distributedArray = new JArray();

                for (int i = 0; i < objects.Count; i++)
                {
                    Undo.RecordObject(objects[i].transform, "Distribute GameObjects");
                    
                    Vector3 newPos = startPos;
                    float offset = i * spacing;
                    
                    switch (axis)
                    {
                        case "X": newPos.x += offset; break;
                        case "Y": newPos.y += offset; break;
                        case "Z": newPos.z += offset; break;
                    }

                    if (useWorldSpace)
                        objects[i].transform.position = newPos;
                    else
                        objects[i].transform.localPosition = newPos;

                    EditorUtility.SetDirty(objects[i]);

                    distributedArray.Add(new JObject
                    {
                        ["name"] = objects[i].name,
                        ["position"] = $"({newPos.x:F2}, {newPos.y:F2}, {newPos.z:F2})"
                    });
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Distributed {objects.Count} objects along {axis} axis with {spacing} spacing.",
                    ["count"] = objects.Count,
                    ["distributedObjects"] = distributedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"DistributeGameObjectsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

