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
    public class CreateTogglePanelWithButtonTool : McpToolBase
    {
        public CreateTogglePanelWithButtonTool()
        {
            Name = "create_toggle_panel_with_button";
            Description = "Creates a dark gray semi-transparent panel with a button that toggles its visibility.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Parse parameters
                string panelName = parameters["panelName"]?.ToObject<string>() ?? "TogglePanel";
                string buttonText = parameters["buttonText"]?.ToObject<string>() ?? "Toggle Panel";
                float panelPosX = parameters["panelPosX"]?.ToObject<float>() ?? 0f;
                float panelPosY = parameters["panelPosY"]?.ToObject<float>() ?? 0f;
                float panelWidth = parameters["panelWidth"]?.ToObject<float>() ?? 400f;
                float panelHeight = parameters["panelHeight"]?.ToObject<float>() ?? 300f;
                string panelColorHex = parameters["panelColor"]?.ToObject<string>() ?? "#333333D9";
                float buttonPosX = parameters["buttonPosX"]?.ToObject<float>() ?? 0f;
                float buttonPosY = parameters["buttonPosY"]?.ToObject<float>() ?? 200f;
                float buttonWidth = parameters["buttonWidth"]?.ToObject<float>() ?? 160f;
                float buttonHeight = parameters["buttonHeight"]?.ToObject<float>() ?? 40f;
                bool panelInitiallyActive = parameters["panelInitiallyActive"]?.ToObject<bool>() ?? true;

                // Find or create Canvas
                Canvas canvas = UnityEngine.Object.FindFirstObjectByType<Canvas>();
                if (canvas == null)
                {
                    GameObject canvasObj = new GameObject("Canvas");
                    canvas = canvasObj.AddComponent<Canvas>();
                    canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    canvasObj.AddComponent<CanvasScaler>();
                    canvasObj.AddComponent<GraphicRaycaster>();
                    
                    // Ensure EventSystem exists
                    if (UnityEngine.Object.FindFirstObjectByType<UnityEngine.EventSystems.EventSystem>() == null)
                    {
                        GameObject eventSystemObj = new GameObject("EventSystem");
                        eventSystemObj.AddComponent<UnityEngine.EventSystems.EventSystem>();
                        eventSystemObj.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();
                        Undo.RegisterCreatedObjectUndo(eventSystemObj, "Create EventSystem");
                    }
                    
                    Undo.RegisterCreatedObjectUndo(canvasObj, "Create Canvas");
                }

                // Create Panel
                GameObject panelObj = new GameObject(panelName);
                panelObj.transform.SetParent(canvas.transform, false);

                RectTransform panelRect = panelObj.AddComponent<RectTransform>();
                panelRect.anchoredPosition = new Vector2(panelPosX, panelPosY);
                panelRect.sizeDelta = new Vector2(panelWidth, panelHeight);

                Image panelImage = panelObj.AddComponent<Image>();
                
                // Parse panel color (default to dark gray with 85% opacity)
                if (ColorUtility.TryParseHtmlString(panelColorHex, out Color panelColor))
                {
                    panelImage.color = panelColor;
                }
                else
                {
                    panelImage.color = new Color(0.2f, 0.2f, 0.2f, 0.85f); // Dark gray, 85% opacity
                }

                // Set initial active state
                panelObj.SetActive(panelInitiallyActive);

                Undo.RegisterCreatedObjectUndo(panelObj, "Create Toggle Panel");

                // Create Button
                GameObject buttonObj = new GameObject(buttonText);
                buttonObj.transform.SetParent(canvas.transform, false);
                
                RectTransform buttonRect = buttonObj.AddComponent<RectTransform>();
                buttonRect.anchoredPosition = new Vector2(buttonPosX, buttonPosY);
                buttonRect.sizeDelta = new Vector2(buttonWidth, buttonHeight);

                Image buttonImage = buttonObj.AddComponent<Image>();
                buttonImage.color = Color.white;

                Button button = buttonObj.AddComponent<Button>();

                // Wire button to toggle panel
                button.onClick.AddListener(() => {
                    panelObj.SetActive(!panelObj.activeSelf);
                });

                // Create Text child for button
                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(buttonObj.transform, false);
                
                RectTransform textRect = textObj.AddComponent<RectTransform>();
                textRect.anchorMin = Vector2.zero;
                textRect.anchorMax = Vector2.one;
                textRect.sizeDelta = Vector2.zero;

                // Try to use TextMeshPro, fallback to standard Text
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

                Undo.RegisterCreatedObjectUndo(buttonObj, "Create Toggle Button");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created toggle panel '{panelName}' with button '{buttonText}'.",
                    ["panelName"] = panelName,
                    ["panelInstanceId"] = panelObj.GetInstanceID(),
                    ["buttonText"] = buttonText,
                    ["buttonInstanceId"] = buttonObj.GetInstanceID(),
                    ["panelPosition"] = $"({panelPosX}, {panelPosY})",
                    ["panelSize"] = $"({panelWidth}, {panelHeight})",
                    ["buttonPosition"] = $"({buttonPosX}, {buttonPosY})",
                    ["buttonSize"] = $"({buttonWidth}, {buttonHeight})",
                    ["panelInitiallyActive"] = panelInitiallyActive
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateTogglePanelWithButtonTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

