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
    /// Tool to set texture on a material or directly on GameObjects
    /// </summary>
    public class SetMaterialTextureTool : McpToolBase
    {
        public SetMaterialTextureTool()
        {
            Name = "set_material_texture";
            Description = "Set a texture on a material asset or on GameObjects' materials. Supports main texture (_MainTex), normal map (_BumpMap), and other texture properties.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 获取参数
                string texturePath = parameters["texturePath"]?.ToObject<string>();
                string materialPath = parameters["materialPath"]?.ToObject<string>();
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string propertyName = parameters["propertyName"]?.ToObject<string>() ?? "_MainTex";
                
                // 验证贴图路径
                if (string.IsNullOrEmpty(texturePath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'texturePath' is required. Example: 'Assets/Textures/MyTexture.png'", 
                        "validation_error");
                }

                // 加载贴图
                Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>(texturePath);
                if (texture == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Texture not found at path: {texturePath}", 
                        "validation_error");
                }

                JArray appliedArray = new JArray();
                int count = 0;

                // 方式1: 直接设置材质资源的贴图
                if (!string.IsNullOrEmpty(materialPath))
                {
                    Material material = AssetDatabase.LoadAssetAtPath<Material>(materialPath);
                    if (material == null)
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Material not found at path: {materialPath}", 
                            "validation_error");
                    }

                    if (!material.HasProperty(propertyName))
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Material does not have property '{propertyName}'. Common properties: _MainTex, _BumpMap, _MetallicGlossMap, _EmissionMap", 
                            "validation_error");
                    }

                    Undo.RecordObject(material, "Set Material Texture");
                    material.SetTexture(propertyName, texture);
                    EditorUtility.SetDirty(material);
                    AssetDatabase.SaveAssets();

                    appliedArray.Add(new JObject
                    {
                        ["type"] = "material",
                        ["materialName"] = material.name,
                        ["materialPath"] = materialPath,
                        ["textureName"] = texture.name,
                        ["property"] = propertyName
                    });
                    count++;
                }

                // 方式2: 设置 GameObject 上的材质贴图
                if (instanceIdsArray != null && instanceIdsArray.Count > 0)
                {
                    foreach (var id in instanceIdsArray)
                    {
                        GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                        if (obj == null) continue;

                        Renderer renderer = obj.GetComponent<Renderer>();
                        if (renderer == null) continue;

                        // 获取或创建材质实例
                        Material mat = renderer.sharedMaterial;
                        if (mat == null) continue;

                        // 如果是共享材质，创建一个实例
                        if (AssetDatabase.Contains(mat))
                        {
                            // 创建材质实例以避免修改原始资源
                            Material instanceMat = new Material(mat);
                            instanceMat.name = mat.name + "_Instance";
                            renderer.sharedMaterial = instanceMat;
                            mat = instanceMat;
                        }

                        if (!mat.HasProperty(propertyName))
                        {
                            appliedArray.Add(new JObject
                            {
                                ["type"] = "gameobject",
                                ["objectName"] = obj.name,
                                ["error"] = $"Material does not have property '{propertyName}'"
                            });
                            continue;
                        }

                        Undo.RecordObject(mat, "Set Material Texture");
                        mat.SetTexture(propertyName, texture);
                        EditorUtility.SetDirty(renderer);

                        appliedArray.Add(new JObject
                        {
                            ["type"] = "gameobject",
                            ["objectName"] = obj.name,
                            ["materialName"] = mat.name,
                            ["textureName"] = texture.name,
                            ["property"] = propertyName
                        });
                        count++;
                    }
                }

                if (count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "No materials were modified. Provide either 'materialPath' or 'instanceIds'.", 
                        "validation_error");
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set texture '{texture.name}' on {count} material(s) using property '{propertyName}'.",
                    ["textureName"] = texture.name,
                    ["texturePath"] = texturePath,
                    ["propertyName"] = propertyName,
                    ["count"] = count,
                    ["appliedTo"] = appliedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetMaterialTextureTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
