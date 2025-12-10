using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUIInputFieldTool : McpToolBase
    {
        public CreateUIInputFieldTool()
        {
            Name = "create_ui_input_field";
            Description = "Create a UI Input Field for text input.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string inputFieldName = parameters["inputFieldName"]?.ToObject<string>() ?? "InputField";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float width = parameters["width"]?.ToObject<float>() ?? 200f;
                float height = parameters["height"]?.ToObject<float>() ?? 30f;
                string placeholder = parameters["placeholder"]?.ToObject<string>() ?? "Enter text...";

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

                // 使用DefaultControls创建InputField
                GameObject inputFieldObj = DefaultControls.CreateInputField(new DefaultControls.Resources());
                inputFieldObj.name = inputFieldName;
                inputFieldObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = inputFieldObj.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(width, height);

                InputField inputField = inputFieldObj.GetComponent<InputField>();
                
                // 设置占位符文本
                Text placeholderText = inputFieldObj.transform.Find("Placeholder")?.GetComponent<Text>();
                if (placeholderText != null)
                {
                    placeholderText.text = placeholder;
                }

                Undo.RegisterCreatedObjectUndo(inputFieldObj, "Create UI Input Field");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Input Field '{inputFieldName}'.",
                    ["inputFieldName"] = inputFieldName,
                    ["instanceId"] = inputFieldObj.GetInstanceID(),
                    ["size"] = $"({width}, {height})"
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIInputFieldTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

