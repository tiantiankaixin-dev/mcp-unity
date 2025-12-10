using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class ChangeMaterialColorTool : McpToolBase
    {
        public ChangeMaterialColorTool()
        {
            Name = "change_material_color";
            Description = "Change the color of materials on GameObjects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string colorHex = parameters["color"]?.ToObject<string>() ?? "#FFFFFF";
                string propertyName = parameters["propertyName"]?.ToObject<string>() ?? "_Color";

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (!ColorUtility.TryParseHtmlString(colorHex, out Color color))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Invalid color format: {colorHex}", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray changedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Renderer renderer = obj.GetComponent<Renderer>();
                    if (renderer != null && renderer.sharedMaterial != null)
                    {
                        Material mat = renderer.sharedMaterial;
                        
                        // 创建材质实例以避免修改共享材质
                        Material instanceMat = new Material(mat);
                        
                        if (instanceMat.HasProperty(propertyName))
                        {
                            instanceMat.SetColor(propertyName, color);
                            renderer.sharedMaterial = instanceMat;
                            
                            Undo.RecordObject(renderer, "Change Material Color");
                            EditorUtility.SetDirty(renderer);

                            changedArray.Add(new JObject
                            {
                                ["objectName"] = obj.name,
                                ["color"] = colorHex
                            });
                            count++;
                        }
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Changed material color on {count} GameObject(s).",
                    ["count"] = count,
                    ["color"] = colorHex,
                    ["changedObjects"] = changedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"ChangeMaterialColorTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

