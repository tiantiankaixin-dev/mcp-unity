using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetBuildTargetTool : McpToolBase
    {
        public SetBuildTargetTool()
        {
            Name = "set_build_target";
            Description = "Set the build target platform (Windows, Mac, Linux, Android, iOS, WebGL).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string platform = parameters["platform"]?.ToObject<string>()?.ToLower() ?? "windows";

                BuildTarget buildTarget;
                BuildTargetGroup buildTargetGroup;

                switch (platform)
                {
                    case "windows":
                    case "win":
                    case "win64":
                        buildTarget = BuildTarget.StandaloneWindows64;
                        buildTargetGroup = BuildTargetGroup.Standalone;
                        break;
                    case "mac":
                    case "osx":
                        buildTarget = BuildTarget.StandaloneOSX;
                        buildTargetGroup = BuildTargetGroup.Standalone;
                        break;
                    case "linux":
                        buildTarget = BuildTarget.StandaloneLinux64;
                        buildTargetGroup = BuildTargetGroup.Standalone;
                        break;
                    case "android":
                        buildTarget = BuildTarget.Android;
                        buildTargetGroup = BuildTargetGroup.Android;
                        break;
                    case "ios":
                        buildTarget = BuildTarget.iOS;
                        buildTargetGroup = BuildTargetGroup.iOS;
                        break;
                    case "webgl":
                        buildTarget = BuildTarget.WebGL;
                        buildTargetGroup = BuildTargetGroup.WebGL;
                        break;
                    default:
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Unsupported platform: {platform}", "validation_error");
                }

                EditorUserBuildSettings.SwitchActiveBuildTarget(buildTargetGroup, buildTarget);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Build target set to {buildTarget}.",
                    ["platform"] = platform,
                    ["buildTarget"] = buildTarget.ToString()
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetBuildTargetTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

