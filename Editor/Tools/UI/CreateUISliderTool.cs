using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUISliderTool : McpToolBase
    {
        public CreateUISliderTool()
        {
            Name = "create_ui_slider";
            Description = "Create a UI Slider for controlling values like sensitivity, volume, etc.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string sliderName = parameters["sliderName"]?.ToObject<string>() ?? "Slider";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float minValue = parameters["minValue"]?.ToObject<float>() ?? 0f;
                float maxValue = parameters["maxValue"]?.ToObject<float>() ?? 1f;
                float defaultValue = parameters["defaultValue"]?.ToObject<float>() ?? 0.5f;

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

                // 使用Unity的默认Slider创建方法
                GameObject sliderObj = DefaultControls.CreateSlider(new DefaultControls.Resources());
                sliderObj.name = sliderName;
                sliderObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = sliderObj.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);

                Slider slider = sliderObj.GetComponent<Slider>();
                slider.minValue = minValue;
                slider.maxValue = maxValue;
                slider.value = defaultValue;

                Undo.RegisterCreatedObjectUndo(sliderObj, "Create UI Slider");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Slider '{sliderName}'.",
                    ["sliderName"] = sliderName,
                    ["instanceId"] = sliderObj.GetInstanceID(),
                    ["minValue"] = minValue,
                    ["maxValue"] = maxValue,
                    ["defaultValue"] = defaultValue
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUISliderTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

