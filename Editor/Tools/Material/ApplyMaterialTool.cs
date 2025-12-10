using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class ApplyMaterialTool : McpToolBase
    {
        public ApplyMaterialTool()
        {
            Name = "apply_material";
            Description = "Apply a material to GameObjects with Renderer components.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string materialPath = parameters["materialPath"]?.ToObject<string>();

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (string.IsNullOrEmpty(materialPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'materialPath' is required.", "validation_error");
                }

                Material material = AssetDatabase.LoadAssetAtPath<Material>(materialPath);
                if (material == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Material not found: {materialPath}", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray appliedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Renderer renderer = obj.GetComponent<Renderer>();
                    if (renderer != null)
                    {
                        Undo.RecordObject(renderer, "Apply Material");
                        renderer.sharedMaterial = material;
                        EditorUtility.SetDirty(renderer);

                        appliedArray.Add(new JObject
                        {
                            ["objectName"] = obj.name,
                            ["materialName"] = material.name
                        });
                        count++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Applied material '{material.name}' to {count} GameObject(s).",
                    ["materialName"] = material.name,
                    ["count"] = count,
                    ["appliedObjects"] = appliedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"ApplyMaterialTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

