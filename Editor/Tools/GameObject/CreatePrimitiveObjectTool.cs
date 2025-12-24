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
            Description = "Create primitive 3D objects (Cube, Sphere, Cylinder, Plane, etc.).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                var primitiveTypeToken = parameters["primitiveType"] ?? parameters["primitive_type"];
                string primitiveType = primitiveTypeToken?.ToObject<string>()?.ToLower() ?? "cube";

                var objectNameToken = parameters["objectName"] ?? parameters["object_name"];
                string objectName = objectNameToken?.ToObject<string>();

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
                    case "cube":
                        type = PrimitiveType.Cube;
                        break;
                    case "sphere":
                        type = PrimitiveType.Sphere;
                        break;
                    case "cylinder":
                        type = PrimitiveType.Cylinder;
                        break;
                    case "plane":
                        type = PrimitiveType.Plane;
                        break;
                    case "capsule":
                        type = PrimitiveType.Capsule;
                        break;
                    case "quad":
                        type = PrimitiveType.Quad;
                        break;
                    default:
                        type = PrimitiveType.Cube;
                        break;
                }

                GameObject obj = GameObject.CreatePrimitive(type);
                
                if (!string.IsNullOrEmpty(objectName))
                {
                    obj.name = objectName;
                }

                obj.transform.position = new Vector3(posX, posY, posZ);

                Undo.RegisterCreatedObjectUndo(obj, "Create Primitive Object");

                // 返回精简后的关键信息，便于上层统一处理
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

