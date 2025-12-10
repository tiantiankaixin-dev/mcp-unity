using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class GenerateLODGroupTool : McpToolBase
    {
        public GenerateLODGroupTool()
        {
            Name = "generate_lod_group";
            Description = "Add LODGroup component to GameObjects for Level of Detail optimization.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                int lodCount = parameters["lodCount"]?.ToObject<int>() ?? 3;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (lodCount < 1 || lodCount > 8)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "LOD count must be between 1 and 8.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray addedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    LODGroup lodGroup = obj.GetComponent<LODGroup>();
                    if (lodGroup == null)
                    {
                        lodGroup = Undo.AddComponent<LODGroup>(obj);
                    }
                    else
                    {
                        Undo.RecordObject(lodGroup, "Modify LODGroup");
                    }

                    // 创建LOD数组
                    LOD[] lods = new LOD[lodCount];
                    Renderer[] renderers = obj.GetComponentsInChildren<Renderer>();

                    for (int i = 0; i < lodCount; i++)
                    {
                        float screenRelativeHeight = 1.0f / (i + 1);
                        lods[i] = new LOD(screenRelativeHeight, renderers);
                    }

                    lodGroup.SetLODs(lods);
                    lodGroup.RecalculateBounds();

                    EditorUtility.SetDirty(obj);

                    addedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["lodCount"] = lodCount
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added LODGroup to {count} GameObject(s) with {lodCount} LOD levels.",
                    ["count"] = count,
                    ["lodCount"] = lodCount,
                    ["lodGroups"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"GenerateLODGroupTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

