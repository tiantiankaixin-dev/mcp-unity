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

                    posY = parameters["posY"]?.ToObject<float>() ?? 1f;

                    posZ = parameters["posZ"]?.ToObject<float>() ?? -10f;

                }
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

