using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class RandomizeTransformTool : McpToolBase
    {
        public RandomizeTransformTool()
        {
            Name = "randomize_transform";
            Description = "Randomize position, rotation, or scale of GameObjects within specified ranges.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                bool randomizePosition = parameters["randomizePosition"]?.ToObject<bool>() ?? false;
                bool randomizeRotation = parameters["randomizeRotation"]?.ToObject<bool>() ?? false;
                bool randomizeScale = parameters["randomizeScale"]?.ToObject<bool>() ?? false;
                float positionRange = parameters["positionRange"]?.ToObject<float>() ?? 5f;
                float rotationRange = parameters["rotationRange"]?.ToObject<float>() ?? 360f;
                float scaleMin = parameters["scaleMin"]?.ToObject<float>() ?? 0.5f;
                float scaleMax = parameters["scaleMax"]?.ToObject<float>() ?? 2f;

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

                JArray randomizedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Undo.RecordObject(obj.transform, "Randomize Transform");

                    if (randomizePosition)
                    {
                        Vector3 randomOffset = new Vector3(
                            UnityEngine.Random.Range(-positionRange, positionRange),
                            UnityEngine.Random.Range(-positionRange, positionRange),
                            UnityEngine.Random.Range(-positionRange, positionRange)
                        );
                        obj.transform.position += randomOffset;
                    }

                    if (randomizeRotation)
                    {
                        Vector3 randomRotation = new Vector3(
                            UnityEngine.Random.Range(0, rotationRange),
                            UnityEngine.Random.Range(0, rotationRange),
                            UnityEngine.Random.Range(0, rotationRange)
                        );
                        obj.transform.rotation = Quaternion.Euler(randomRotation);
                    }

                    if (randomizeScale)
                    {
                        float randomScale = UnityEngine.Random.Range(scaleMin, scaleMax);
                        obj.transform.localScale = Vector3.one * randomScale;
                    }

                    EditorUtility.SetDirty(obj);

                    randomizedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["position"] = $"({obj.transform.position.x:F2}, {obj.transform.position.y:F2}, {obj.transform.position.z:F2})"
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Randomized transform on {count} GameObject(s).",
                    ["count"] = count,
                    ["randomizedObjects"] = randomizedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"RandomizeTransformTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

