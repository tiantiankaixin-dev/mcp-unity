using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUIToggleTool : McpToolBase
    {
        public CreateUIToggleTool()
        {
            Name = "create_ui_toggle";
            Description = "Create a UI Toggle/Checkbox for boolean options.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string toggleName = parameters["toggleName"]?.ToObject<string>() ?? "Toggle";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                string labelText = parameters["labelText"]?.ToObject<string>() ?? "Toggle";
                bool isOn = parameters["isOn"]?.ToObject<bool>() ?? false;

                Canvas canvas = UnityEngine.Object.FindFirstObjectByType<Canvas>();
                if (canvas == null)
                {
                    GameObject canvasObj = new GameObject("Canvas");
                    canvas = canvasObj.AddComponent<Canvas>();
                    canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    canvasObj.AddComponent<CanvasScaler>();
                    canvasObj.AddComponent<GraphicRaycaster>();
                    Undo.RegisterCreatedObjectUndo(canvasObj, "Create Canvas");
                }

                // 使用DefaultControls创建Toggle
                GameObject toggleObj = DefaultControls.CreateToggle(new DefaultControls.Resources());
                toggleObj.name = toggleName;
                toggleObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = toggleObj.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);

                Toggle toggle = toggleObj.GetComponent<Toggle>();
                toggle.isOn = isOn;

                // 设置标签文本
                Text label = toggleObj.GetComponentInChildren<Text>();
                if (label != null)
                {
                    label.text = labelText;
                }

                Undo.RegisterCreatedObjectUndo(toggleObj, "Create UI Toggle");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Toggle '{toggleName}'.",
                    ["toggleName"] = toggleName,
                    ["instanceId"] = toggleObj.GetInstanceID(),
                    ["isOn"] = isOn,
                    ["labelText"] = labelText
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIToggleTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

