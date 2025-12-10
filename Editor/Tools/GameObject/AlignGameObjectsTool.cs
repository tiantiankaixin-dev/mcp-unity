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
    /// 对齐GameObject工具
    /// 将多个对象按指定轴对齐
    /// </summary>
    public class AlignGameObjectsTool : McpToolBase
    {
        public AlignGameObjectsTool()
        {
            Name = "align_gameobjects";
            Description = "Align multiple GameObjects along a specified axis (X, Y, or Z).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string axis = parameters["axis"]?.ToObject<string>()?.ToUpper() ?? "Y";
                string alignMode = parameters["alignMode"]?.ToObject<string>()?.ToLower() ?? "min";

                if (instanceIdsArray == null || instanceIdsArray.Count < 2)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 2 GameObjects required for alignment.", "validation_error");
                }

                if (axis != "X" && axis != "Y" && axis != "Z")
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'axis' must be 'X', 'Y', or 'Z'.", "validation_error");
                }

                if (alignMode != "min" && alignMode != "max" && alignMode != "center" && alignMode != "average")
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'alignMode' must be 'min', 'max', 'center', or 'average'.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    int instanceId = id.ToObject<int>();
                    GameObject obj = EditorUtility.InstanceIDToObject(instanceId) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                if (objects.Count < 2)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Could not find enough valid GameObjects.", "validation_error");
                }

                // 计算对齐位置
                float alignPosition = CalculateAlignPosition(objects, axis, alignMode);

                // 对齐对象
                JArray alignedArray = new JArray();
                foreach (GameObject obj in objects)
                {
                    Undo.RecordObject(obj.transform, "Align GameObjects");
                    
                    Vector3 pos = obj.transform.position;
                    Vector3 oldPos = pos;
                    
                    switch (axis)
                    {
                        case "X": pos.x = alignPosition; break;
                        case "Y": pos.y = alignPosition; break;
                        case "Z": pos.z = alignPosition; break;
                    }
                    
                    obj.transform.position = pos;
                    EditorUtility.SetDirty(obj);

                    alignedArray.Add(new JObject
                    {
                        ["name"] = obj.name,
                        ["instanceId"] = obj.GetInstanceID(),
                        ["oldPosition"] = $"({oldPos.x:F2}, {oldPos.y:F2}, {oldPos.z:F2})",
                        ["newPosition"] = $"({pos.x:F2}, {pos.y:F2}, {pos.z:F2})"
                    });
                }

                return new JObject
                {
                    ["success"] = true,
                    ["type"] = "text",
                    ["message"] = $"Aligned {objects.Count} GameObject(s) along {axis} axis ({alignMode}).",
                    ["count"] = objects.Count,
                    ["axis"] = axis,
                    ["alignMode"] = alignMode,
                    ["alignPosition"] = alignPosition,
                    ["alignedObjects"] = alignedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AlignGameObjectsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private float CalculateAlignPosition(List<GameObject> objects, string axis, string alignMode)
        {
            List<float> positions = new List<float>();
            
            foreach (GameObject obj in objects)
            {
                float pos = 0;
                switch (axis)
                {
                    case "X": pos = obj.transform.position.x; break;
                    case "Y": pos = obj.transform.position.y; break;
                    case "Z": pos = obj.transform.position.z; break;
                }
                positions.Add(pos);
            }

            switch (alignMode)
            {
                case "min":
                    float min = float.MaxValue;
                    foreach (float p in positions) if (p < min) min = p;
                    return min;
                    
                case "max":
                    float max = float.MinValue;
                    foreach (float p in positions) if (p > max) max = p;
                    return max;
                    
                case "center":
                    float minC = float.MaxValue, maxC = float.MinValue;
                    foreach (float p in positions)
                    {
                        if (p < minC) minC = p;
                        if (p > maxC) maxC = p;
                    }
                    return (minC + maxC) / 2f;
                    
                case "average":
                    float sum = 0;
                    foreach (float p in positions) sum += p;
                    return sum / positions.Count;
                    
                default:
                    return 0;
            }
        }
    }
}

