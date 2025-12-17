using System;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEditor;
using UnityEditor.SceneManagement;
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
                // 先静默保存所有已修改的场景，避免弹出保存对话框
                for (int i = 0; i < SceneManager.sceneCount; i++)
                {
                    var scene = SceneManager.GetSceneAt(i);
                    if (scene.isDirty && !string.IsNullOrEmpty(scene.path))
                    {
                        EditorSceneManager.SaveScene(scene);
                    }
                }
                
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
                    // Collect error messages from build report
                    var errorMessages = new System.Text.StringBuilder();
                    errorMessages.AppendLine($"Build failed with result: {summary.result}");
                    errorMessages.AppendLine($"Total errors: {summary.totalErrors}, Warnings: {summary.totalWarnings}");
                    
                    int errorCount = 0;
                    foreach (var step in report.steps)
                    {
                        foreach (var message in step.messages)
                        {
                            if (message.type == LogType.Error || message.type == LogType.Exception)
                            {
                                errorMessages.AppendLine($"- {message.content}");
                                errorCount++;
                                if (errorCount >= 10) break; // Limit to 10 errors
                            }
                        }
                        if (errorCount >= 10) break;
                    }
                    
                    return McpUnitySocketHandler.CreateErrorResponse(errorMessages.ToString(), "build_error");
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
            var enabledScenes = new System.Collections.Generic.List<string>();
            foreach (var scene in UnityEditor.EditorBuildSettings.scenes)
            {
                // 只添加启用的场景，且路径不为空
                if (scene.enabled && !string.IsNullOrEmpty(scene.path))
                {
                    enabledScenes.Add(scene.path);
                }
            }
            
            // 如果没有启用的场景，返回当前活动场景
            if (enabledScenes.Count == 0)
            {
                var activeScene = SceneManager.GetActiveScene();
                if (!string.IsNullOrEmpty(activeScene.path))
                {
                    enabledScenes.Add(activeScene.path);
                }
            }
            
            return enabledScenes.ToArray();
        }
    }
}

