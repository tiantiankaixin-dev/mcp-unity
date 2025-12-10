using System;
using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class BuildProjectTool : McpToolBase
    {
        public BuildProjectTool()
        {
            Name = "build_project";
            Description = "Build the Unity project for specified platform.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string buildPath = parameters["buildPath"]?.ToObject<string>() ?? "Builds/Game";
                string buildTarget = parameters["buildTarget"]?.ToObject<string>()?.ToLower() ?? "windows";
                bool developmentBuild = parameters["developmentBuild"]?.ToObject<bool>() ?? false;

                BuildTarget target;
                switch (buildTarget)
                {
                    case "windows":
                    case "win":
                    case "win64":
                        target = BuildTarget.StandaloneWindows64;
                        if (!buildPath.EndsWith(".exe"))
                        {
                            buildPath += "/Game.exe";
                        }
                        break;
                    case "mac":
                    case "osx":
                        target = BuildTarget.StandaloneOSX;
                        break;
                    case "linux":
                        target = BuildTarget.StandaloneLinux64;
                        break;
                    case "android":
                        target = BuildTarget.Android;
                        if (!buildPath.EndsWith(".apk"))
                        {
                            buildPath += "/Game.apk";
                        }
                        break;
                    case "ios":
                        target = BuildTarget.iOS;
                        break;
                    case "webgl":
                        target = BuildTarget.WebGL;
                        break;
                    default:
                        target = BuildTarget.StandaloneWindows64;
                        break;
                }

                BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
                buildPlayerOptions.scenes = GetScenePaths();
                buildPlayerOptions.locationPathName = buildPath;
                buildPlayerOptions.target = target;
                buildPlayerOptions.options = developmentBuild ? BuildOptions.Development : BuildOptions.None;

                BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
                BuildSummary summary = report.summary;

                if (summary.result == BuildResult.Succeeded)
                {
                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Build succeeded! Size: {summary.totalSize} bytes, Time: {summary.totalTime.TotalSeconds:F2}s",
                        ["buildPath"] = buildPath,
                        ["buildTarget"] = target.ToString(),
                        ["totalSize"] = summary.totalSize,
                        ["totalTime"] = summary.totalTime.TotalSeconds
                    };
                }
                else
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Build failed with result: {summary.result}", "build_error");
                }
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BuildProjectTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private string[] GetScenePaths()
        {
            string[] scenes = new string[UnityEditor.EditorBuildSettings.scenes.Length];
            for (int i = 0; i < scenes.Length; i++)
            {
                scenes[i] = UnityEditor.EditorBuildSettings.scenes[i].path;
            }
            return scenes;
        }
    }
}

