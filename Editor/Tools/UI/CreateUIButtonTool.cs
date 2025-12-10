using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;
using TMPro;

namespace McpUnity.Tools
{
    public class CreateUIButtonTool : McpToolBase
    {
        public CreateUIButtonTool()
        {
            Name = "create_ui_button";
            Description = "Create a UI Button with customizable text, position, and size.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string buttonText = parameters["buttonText"]?.ToObject<string>() ?? "Button";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float width = parameters["width"]?.ToObject<float>() ?? 160f;
                float height = parameters["height"]?.ToObject<float>() ?? 30f;
                int parentInstanceId = parameters["parentInstanceId"]?.ToObject<int>() ?? 0;

                // 查找或创建Canvas
                Canvas canvas = null;
                if (parentInstanceId != 0)
                {
                    GameObject parentObj = EditorUtility.InstanceIDToObject(parentInstanceId) as GameObject;
                    if (parentObj != null)
                    {
                        canvas = parentObj.GetComponent<Canvas>();
                    }
                }

                if (canvas == null)
                {
                    canvas = UnityEngine.Object.FindFirstObjectByType<Canvas>();
                }

                if (canvas == null)
                {
                    // 创建新Canvas
                    GameObject canvasObj = new GameObject("Canvas");
                    canvas = canvasObj.AddComponent<Canvas>();
                    canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    canvasObj.AddComponent<CanvasScaler>();
                    canvasObj.AddComponent<GraphicRaycaster>();
                    Undo.RegisterCreatedObjectUndo(canvasObj, "Create Canvas");
                }

                // 创建Button
                GameObject buttonObj = new GameObject(buttonText);
                buttonObj.transform.SetParent(canvas.transform, false);
                
                RectTransform rectTransform = buttonObj.AddComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(width, height);

                Image image = buttonObj.AddComponent<Image>();
                image.color = Color.white;

                Button button = buttonObj.AddComponent<Button>();

                // 创建Text子对象
                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(buttonObj.transform, false);
                
                RectTransform textRect = textObj.AddComponent<RectTransform>();
                textRect.anchorMin = Vector2.zero;
                textRect.anchorMax = Vector2.one;
                textRect.sizeDelta = Vector2.zero;

                // 尝试使用TextMeshPro，如果不可用则使用标准Text
                try
                {
                    TextMeshProUGUI tmpText = textObj.AddComponent<TextMeshProUGUI>();
                    tmpText.text = buttonText;
                    tmpText.alignment = TextAlignmentOptions.Center;
                    tmpText.color = Color.black;
                }
                catch
                {
                    Text text = textObj.AddComponent<Text>();
                    text.text = buttonText;
                    text.alignment = TextAnchor.MiddleCenter;
                    text.color = Color.black;
                    text.font = UnityEngine.Resources.GetBuiltinResource<Font>("Arial.ttf");
                }

                Undo.RegisterCreatedObjectUndo(buttonObj, "Create UI Button");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Button '{buttonText}'.",
                    ["buttonName"] = buttonText,
                    ["instanceId"] = buttonObj.GetInstanceID(),
                    ["position"] = $"({posX}, {posY})",
                    ["size"] = $"({width}, {height})"
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIButtonTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

