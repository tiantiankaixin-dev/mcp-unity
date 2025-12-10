using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateCameraTool : McpToolBase
    {
        public CreateCameraTool()
        {
            Name = "create_camera";
            Description = "Create a Camera in the scene with custom settings.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string cameraName = parameters["cameraName"]?.ToObject<string>() ?? "Camera";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 1f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? -10f;
                float fov = parameters["fov"]?.ToObject<float>() ?? 60f;
                bool isMainCamera = parameters["isMainCamera"]?.ToObject<bool>() ?? false;

                GameObject cameraObj = new GameObject(cameraName);
                Camera camera = cameraObj.AddComponent<Camera>();

                camera.fieldOfView = fov;
                cameraObj.transform.position = new Vector3(posX, posY, posZ);

                if (isMainCamera)
                {
                    cameraObj.tag = "MainCamera";
                    
                    // 移除其他主摄像机的标签
                    Camera[] existingCameras = UnityEngine.Object.FindObjectsByType<Camera>(FindObjectsSortMode.None);
                    foreach (Camera cam in existingCameras)
                    {
                        if (cam != camera && cam.CompareTag("MainCamera"))
                        {
                            cam.tag = "Untagged";
                        }
                    }
                }

                // 添加AudioListener（如果是主摄像机）
                if (isMainCamera)
                {
                    cameraObj.AddComponent<AudioListener>();
                }

                Undo.RegisterCreatedObjectUndo(cameraObj, "Create Camera");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Camera '{cameraName}'.",
                    ["cameraName"] = cameraName,
                    ["instanceId"] = cameraObj.GetInstanceID(),
                    ["fov"] = fov,
                    ["isMainCamera"] = isMainCamera
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateCameraTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

