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
                string primitiveType = parameters["primitiveType"]?.ToObject<string>()?.ToLower() ?? "cube";
                string objectName = parameters["objectName"]?.ToObject<string>();
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

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

