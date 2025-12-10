using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetPlayerSettingsTool : McpToolBase
    {
        public SetPlayerSettingsTool()
        {
            Name = "set_player_settings";
            Description = "Set Player Settings like company name, product name, version, etc.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string companyName = parameters["companyName"]?.ToObject<string>();
                string productName = parameters["productName"]?.ToObject<string>();
                string version = parameters["version"]?.ToObject<string>();
                int defaultScreenWidth = parameters["defaultScreenWidth"]?.ToObject<int>() ?? 0;
                int defaultScreenHeight = parameters["defaultScreenHeight"]?.ToObject<int>() ?? 0;
                bool fullscreen = parameters["fullscreen"]?.ToObject<bool>() ?? true;

                JObject changedSettings = new JObject();

                if (!string.IsNullOrEmpty(companyName))
                {
                    PlayerSettings.companyName = companyName;
                    changedSettings["companyName"] = companyName;
                }

                if (!string.IsNullOrEmpty(productName))
                {
                    PlayerSettings.productName = productName;
                    changedSettings["productName"] = productName;
                }

                if (!string.IsNullOrEmpty(version))
                {
                    PlayerSettings.bundleVersion = version;
                    changedSettings["version"] = version;
                }

                if (defaultScreenWidth > 0)
                {
                    PlayerSettings.defaultScreenWidth = defaultScreenWidth;
                    changedSettings["defaultScreenWidth"] = defaultScreenWidth;
                }

                if (defaultScreenHeight > 0)
                {
                    PlayerSettings.defaultScreenHeight = defaultScreenHeight;
                    changedSettings["defaultScreenHeight"] = defaultScreenHeight;
                }

                PlayerSettings.fullScreenMode = fullscreen ? FullScreenMode.FullScreenWindow : FullScreenMode.Windowed;
                changedSettings["fullscreen"] = fullscreen;

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = "Player Settings updated successfully.",
                    ["changedSettings"] = changedSettings
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetPlayerSettingsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

