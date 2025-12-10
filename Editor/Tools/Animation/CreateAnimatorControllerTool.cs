using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateAnimatorControllerTool : McpToolBase
    {
        public CreateAnimatorControllerTool()
        {
            Name = "create_animator_controller";
            Description = "Create a new Animator Controller asset for animation state machines.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string controllerName = parameters["controllerName"]?.ToObject<string>() ?? "NewAnimatorController";
                string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/Animations";

                // 确保保存路径存在 (自动补全 Assets/ 前缀)
                savePath = McpUtils.EnsureFolderExists(savePath);

                AnimatorController controller = AnimatorController.CreateAnimatorControllerAtPath(
                    Path.Combine(savePath, controllerName + ".controller").Replace("\\", "/")
                );

                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Animator Controller '{controllerName}' at '{savePath}'.",
                    ["controllerName"] = controllerName,
                    ["path"] = AssetDatabase.GetAssetPath(controller)
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateAnimatorControllerTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

