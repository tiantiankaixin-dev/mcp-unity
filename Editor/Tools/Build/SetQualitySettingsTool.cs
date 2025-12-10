using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetQualitySettingsTool : McpToolBase
    {
        public SetQualitySettingsTool()
        {
            Name = "set_quality_settings";
            Description = "Set quality level (Low, Medium, High, Ultra) for the project.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string qualityLevel = parameters["qualityLevel"]?.ToObject<string>()?.ToLower() ?? "medium";

                int levelIndex;
                switch (qualityLevel)
                {
                    case "low":
                    case "very low":
                        levelIndex = 0;
                        break;
                    case "medium":
                        levelIndex = 2;
                        break;
                    case "high":
                        levelIndex = 4;
                        break;
                    case "ultra":
                    case "very high":
                        levelIndex = 5;
                        break;
                    default:
                        levelIndex = 2; // Medium
                        break;
                }

                // 确保索引在有效范围内
                if (levelIndex >= QualitySettings.names.Length)
                {
                    levelIndex = QualitySettings.names.Length - 1;
                }

                QualitySettings.SetQualityLevel(levelIndex, true);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Quality level set to '{QualitySettings.names[levelIndex]}'.",
                    ["qualityLevel"] = QualitySettings.names[levelIndex],
                    ["levelIndex"] = levelIndex
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetQualitySettingsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

