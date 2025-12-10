using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUIDropdownTool : McpToolBase
    {
        public CreateUIDropdownTool()
        {
            Name = "create_ui_dropdown";
            Description = "Create a UI Dropdown for selection menus.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string dropdownName = parameters["dropdownName"]?.ToObject<string>() ?? "Dropdown";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float width = parameters["width"]?.ToObject<float>() ?? 160f;
                float height = parameters["height"]?.ToObject<float>() ?? 30f;
                JArray optionsArray = parameters["options"] as JArray;

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

                // 使用DefaultControls创建Dropdown
                GameObject dropdownObj = DefaultControls.CreateDropdown(new DefaultControls.Resources());
                dropdownObj.name = dropdownName;
                dropdownObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = dropdownObj.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(width, height);

                Dropdown dropdown = dropdownObj.GetComponent<Dropdown>();
                
                // 设置选项
                if (optionsArray != null && optionsArray.Count > 0)
                {
                    dropdown.options.Clear();
                    foreach (var option in optionsArray)
                    {
                        dropdown.options.Add(new Dropdown.OptionData(option.ToObject<string>()));
                    }
                }

                Undo.RegisterCreatedObjectUndo(dropdownObj, "Create UI Dropdown");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Dropdown '{dropdownName}' with {dropdown.options.Count} options.",
                    ["dropdownName"] = dropdownName,
                    ["instanceId"] = dropdownObj.GetInstanceID(),
                    ["optionCount"] = dropdown.options.Count
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIDropdownTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

