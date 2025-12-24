// ============================================================================
// 示例：CreatePrimitiveObjectTool.cs 完整修改
// ============================================================================

using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreatePrimitiveObjectTool : McpToolBase
    {
        public CreatePrimitiveObjectTool()
        {
            Name = "create_primitive_object";
            Description = "Create primitive 3D objects (Cube, Sphere, Cylinder, Plane, etc.). Supports both array and separate parameters.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string primitiveType = parameters["primitiveType"]?.ToObject<string>()?.ToLower() ?? "cube";
                string objectName = parameters["objectName"]?.ToObject<string>();
                
                // ✅ 支持两种位置格式
                float posX = 0f, posY = 0f, posZ = 0f;
                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)
                {
                    // 数组格式: position: [x, y, z]
                    var pos = parameters["position"].ToObject<float[]>();
                    if (pos.Length >= 3)
                    {
                        posX = pos[0];
                        posY = pos[1];
                        posZ = pos[2];
                    }
                }
                else
                {
                    // 分离格式: posX, posY, posZ
                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                    posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
                }

                PrimitiveType type;
                switch (primitiveType)
                {
                    case "cube": type = PrimitiveType.Cube; break;
                    case "sphere": type = PrimitiveType.Sphere; break;
                    case "cylinder": type = PrimitiveType.Cylinder; break;
                    case "plane": type = PrimitiveType.Plane; break;
                    case "capsule": type = PrimitiveType.Capsule; break;
                    case "quad": type = PrimitiveType.Quad; break;
                    default: type = PrimitiveType.Cube; break;
                }

                GameObject obj = GameObject.CreatePrimitive(type);
                
                if (!string.IsNullOrEmpty(objectName))
                {
                    obj.name = objectName;
                }

                obj.transform.position = new Vector3(posX, posY, posZ);

                Undo.RegisterCreatedObjectUndo(obj, "Create Primitive Object");

                return new JObject
                {
                    ["success"] = true,
                    ["objectName"] = obj.name,
                    ["primitiveType"] = primitiveType,
                    ["instanceId"] = obj.GetInstanceID(),
                    ["position"] = new JObject
                    {
                        ["x"] = posX,
                        ["y"] = posY,
                        ["z"] = posZ
                    }
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreatePrimitiveObjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

// ============================================================================
// 示例：CreateMaterialTool.cs 颜色参数修改
// ============================================================================

public override JObject Execute(JObject parameters)
{
    try
    {
        string materialName = parameters["materialName"]?.ToObject<string>() ?? "NewMaterial";
        string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/Materials";
        string shaderName = parameters["shaderName"]?.ToObject<string>() ?? "Standard";
        
        // ✅ 支持两种颜色格式
        Color color = Color.white;
        if (parameters["color"] != null)
        {
            var colorToken = parameters["color"];
            if (colorToken.Type == JTokenType.Array)
            {
                // 数组格式: color: [r, g, b, a] (0-1 范围)
                var rgba = colorToken.ToObject<float[]>();
                if (rgba.Length >= 3)
                {
                    color = new Color(
                        rgba[0], 
                        rgba[1], 
                        rgba[2], 
                        rgba.Length > 3 ? rgba[3] : 1f
                    );
                }
            }
            else if (colorToken.Type == JTokenType.String)
            {
                // 字符串格式: color: "#FF0000"
                string colorHex = colorToken.ToObject<string>();
                if (!ColorUtility.TryParseHtmlString(colorHex, out color))
                {
                    color = Color.white;
                }
            }
        }

        savePath = McpUtils.EnsureFolderExists(savePath);

        Shader shader = Shader.Find(shaderName);
        if (shader == null)
        {
            shader = Shader.Find("Standard");
        }

        Material material = new Material(shader);
        material.name = materialName;

        if (material.HasProperty("_Color"))
        {
            material.SetColor("_Color", color);
        }

        string fullPath = Path.Combine(savePath, materialName + ".mat").Replace("\\", "/");
        AssetDatabase.CreateAsset(material, fullPath);
        AssetDatabase.SaveAssets();
        AssetDatabase.Refresh();

        return new JObject
        {
            ["success"] = true,
            ["message"] = $"Created Material '{materialName}' at '{fullPath}'.",
            ["materialName"] = materialName,
            ["path"] = fullPath,
            ["shaderName"] = shaderName
        };
    }
    catch (Exception ex)
    {
        McpLogger.LogError($"CreateMaterialTool error: {ex.Message}");
        return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
    }
}

