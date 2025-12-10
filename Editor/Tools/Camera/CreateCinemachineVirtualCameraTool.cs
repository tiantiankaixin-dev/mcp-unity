using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateCinemachineVirtualCameraTool : McpToolBase
    {
        public CreateCinemachineVirtualCameraTool()
        {
            Name = "create_cinemachine_virtual_camera";
            Description = "Create a Cinemachine Virtual Camera (requires Cinemachine package).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string cameraName = parameters["cameraName"]?.ToObject<string>() ?? "VirtualCamera";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 1.5f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? -10f;
                int priority = parameters["priority"]?.ToObject<int>() ?? 10;

                GameObject cameraObj = new GameObject(cameraName);
                cameraObj.transform.position = new Vector3(posX, posY, posZ);

                // 尝试添加Cinemachine Virtual Camera组件
                var virtualCameraType = System.Type.GetType("Cinemachine.CinemachineVirtualCamera, Cinemachine");
                
                if (virtualCameraType != null)
                {
                    var virtualCamera = cameraObj.AddComponent(virtualCameraType);
                    
                    // 使用反射设置Priority属性
                    var priorityProperty = virtualCameraType.GetProperty("Priority");
                    if (priorityProperty != null)
                    {
                        priorityProperty.SetValue(virtualCamera, priority);
                    }

                    Undo.RegisterCreatedObjectUndo(cameraObj, "Create Cinemachine Virtual Camera");

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created Cinemachine Virtual Camera '{cameraName}'.",
                        ["cameraName"] = cameraName,
                        ["instanceId"] = cameraObj.GetInstanceID(),
                        ["priority"] = priority
                    };
                }
                else
                {
                    // 如果没有Cinemachine包，创建一个普通相机
                    Camera camera = cameraObj.AddComponent<Camera>();
                    Undo.RegisterCreatedObjectUndo(cameraObj, "Create Camera Placeholder");

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created standard Camera '{cameraName}'. Note: Cinemachine package not installed.",
                        ["cameraName"] = cameraName,
                        ["instanceId"] = cameraObj.GetInstanceID(),
                        ["warning"] = "Cinemachine package not found. Install it via Package Manager."
                    };
                }
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateCinemachineVirtualCameraTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

