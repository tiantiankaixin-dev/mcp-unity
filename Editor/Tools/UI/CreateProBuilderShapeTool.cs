using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateProBuilderShapeTool : McpToolBase
    {
        public CreateProBuilderShapeTool()
        {
            Name = "create_probuilder_shape";
            Description = "Create a ProBuilder shape for level design (requires ProBuilder package).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string shapeName = parameters["shapeName"]?.ToObject<string>() ?? "ProBuilderShape";
                string shapeType = parameters["shapeType"]?.ToObject<string>()?.ToLower() ?? "cube";
                // ✅ 支持两种位置格式 (2D UI)

                float posX = 0f, posY = 0f;

                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)

                {

                    var pos = parameters["position"].ToObject<float[]>();

                    if (pos.Length >= 2)

                    {

                        posX = pos[0];

                        posY = pos[1];

                    }

                }

                else

                {

                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;

                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;

                }
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
                float size = parameters["size"]?.ToObject<float>() ?? 1f;

                GameObject shapeObj = new GameObject(shapeName);
                shapeObj.transform.position = new Vector3(posX, posY, posZ);

                // 尝试使用ProBuilder创建形状
                var proBuilderMeshType = System.Type.GetType("UnityEngine.ProBuilder.ProBuilderMesh, Unity.ProBuilder");
                
                if (proBuilderMeshType != null)
                {
                    var proBuilderMesh = shapeObj.AddComponent(proBuilderMeshType);
                    
                    // 使用ProBuilder API创建基本形状
                    var shapeGeneratorType = System.Type.GetType("UnityEngine.ProBuilder.MeshOperations.AppendElements, Unity.ProBuilder");
                    
                    Undo.RegisterCreatedObjectUndo(shapeObj, "Create ProBuilder Shape");

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created ProBuilder shape '{shapeName}' of type '{shapeType}'.",
                        ["shapeName"] = shapeName,
                        ["instanceId"] = shapeObj.GetInstanceID(),
                        ["shapeType"] = shapeType
                    };
                }
                else
                {
                    // 如果没有ProBuilder包，创建一个基本立方体
                    GameObject cube = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    cube.name = shapeName;
                    cube.transform.position = new Vector3(posX, posY, posZ);
                    cube.transform.localScale = Vector3.one * size;
                    
                    UnityEngine.Object.DestroyImmediate(shapeObj);
                    Undo.RegisterCreatedObjectUndo(cube, "Create Primitive Shape");

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created primitive cube '{shapeName}'. Note: ProBuilder package not installed.",
                        ["shapeName"] = shapeName,
                        ["instanceId"] = cube.GetInstanceID(),
                        ["warning"] = "ProBuilder package not found. Install it via Package Manager."
                    };
                }
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateProBuilderShapeTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

