using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Linq;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Perform code refactoring operations like renaming, extracting methods, organizing usings, and formatting
    /// </summary>
    public class RefactorScriptTool : McpToolBase
    {
        public RefactorScriptTool()
        {
            Name = "refactor_script";
            Description = "Perform code refactoring operations like renaming, extracting methods, organizing usings, and formatting";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string scriptPath = parameters["scriptPath"]?.ToString();
                string operation = parameters["operation"]?.ToString();
                
                if (string.IsNullOrEmpty(scriptPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "scriptPath is required", "validation_error");
                }

                if (!File.Exists(scriptPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Script file not found: {scriptPath}", "not_found");
                }

                string content = File.ReadAllText(scriptPath);
                string newContent = content;
                bool fileRenamed = false;

                switch (operation)
                {
                    case "rename_symbol":
                        string oldName = parameters["oldName"]?.ToString();
                        string newName = parameters["newName"]?.ToString();
                        string symbolType = parameters["symbolType"]?.ToString(); // class, method, field

                        if (string.IsNullOrEmpty(oldName) || string.IsNullOrEmpty(newName))
                        {
                            return McpUnitySocketHandler.CreateErrorResponse(
                                "oldName and newName are required for rename_symbol", "validation_error");
                        }

                        // Simple regex replace - in a real tool this would use Roslyn
                        newContent = Regex.Replace(content, $@"\b{oldName}\b", newName);

                        if (symbolType == "class" && Path.GetFileNameWithoutExtension(scriptPath) == oldName)
                        {
                            // Rename file as well
                            string directory = Path.GetDirectoryName(scriptPath);
                            string newPath = Path.Combine(directory, newName + ".cs");
                            File.WriteAllText(newPath, newContent);
                            File.Delete(scriptPath);
                            scriptPath = newPath;
                            fileRenamed = true;
                        }
                        break;

                    case "organize_usings":
                        // Simplified organize usings
                        var lines = content.Split('\n').ToList();
                        var usings = lines.Where(l => l.Trim().StartsWith("using ") && l.Trim().EndsWith(";")).OrderBy(l => l).ToList();
                        var otherLines = lines.Where(l => !l.Trim().StartsWith("using ") || !l.Trim().EndsWith(";")).ToList();
                        
                        // Remove empty lines at start of otherLines
                        while (otherLines.Count > 0 && string.IsNullOrWhiteSpace(otherLines[0]))
                        {
                            otherLines.RemoveAt(0);
                        }

                        newContent = string.Join("\n", usings) + "\n\n" + string.Join("\n", otherLines);
                        break;

                    case "format_code":
                        // Basic formatting (trim trailing whitespace, ensure file ends with newline)
                        var formatLines = content.Split('\n');
                        for (int i = 0; i < formatLines.Length; i++)
                        {
                            formatLines[i] = formatLines[i].TrimEnd();
                        }
                        newContent = string.Join("\n", formatLines);
                        if (!newContent.EndsWith("\n")) newContent += "\n";
                        break;

                    default:
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Unknown operation: {operation}", "validation_error");
                }

                if (!fileRenamed)
                {
                    File.WriteAllText(scriptPath, newContent);
                }
                
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Refactored script: {operation}",
                    ["scriptPath"] = scriptPath
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"RefactorScriptTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
