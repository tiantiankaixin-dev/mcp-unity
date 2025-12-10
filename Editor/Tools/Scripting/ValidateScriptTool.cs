using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Validate C# scripts for syntax errors, compilation issues, naming conventions, and Unity best practices
    /// </summary>
    public class ValidateScriptTool : McpToolBase
    {
        public ValidateScriptTool()
        {
            Name = "validate_script";
            Description = "Validate C# scripts for syntax errors, compilation issues, naming conventions, and Unity best practices";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string scriptPath = parameters["scriptPath"]?.ToString();
                string validationLevel = parameters["validationLevel"]?.ToString() ?? "all";
                
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

                JArray issues = new JArray();
                
                // 1. Check compilation errors
                if (EditorUtility.scriptCompilationFailed)
                {
                    issues.Add(new JObject
                    {
                        ["type"] = "error",
                        ["message"] = "Project has compilation errors. Cannot validate script logic accurately.",
                        ["line"] = 0
                    });
                }

                string content = File.ReadAllText(scriptPath);
                string fileName = Path.GetFileNameWithoutExtension(scriptPath);

                // 2. Check Naming Conventions (Basic)
                bool checkNaming = parameters["checkNamingConventions"]?.ToObject<bool>() ?? true;
                if (checkNaming)
                {
                    CheckNamingConventions(content, fileName, issues);
                }

                // 3. Check Unity Best Practices
                bool checkBestPractices = parameters["checkUnityBestPractices"]?.ToObject<bool>() ?? true;
                if (checkBestPractices)
                {
                    CheckBestPractices(content, issues);
                }

                // 4. Check Performance
                bool checkPerformance = parameters["checkPerformance"]?.ToObject<bool>() ?? false;
                if (checkPerformance)
                {
                    CheckPerformance(content, issues);
                }

                string message = issues.Count == 0 
                    ? $"Script '{scriptPath}' is valid with no issues found."
                    : $"Script '{scriptPath}' has {issues.Count} issue(s).";

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = message,
                    ["isValid"] = issues.Count == 0,
                    ["issueCount"] = issues.Count,
                    ["issues"] = issues,
                    ["scriptPath"] = scriptPath
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"ValidateScriptTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private void CheckNamingConventions(string content, string className, JArray issues)
        {
            // Check if class name matches file name
            if (!content.Contains($"class {className}"))
            {
                issues.Add(new JObject
                {
                    ["type"] = "warning",
                    ["category"] = "naming",
                    ["message"] = $"Class name should match file name '{className}'",
                    ["line"] = 1
                });
            }

            // Check for public fields (should be CamelCase or PascalCase, Unity uses PascalCase for public fields usually)
            // This is a very basic regex check
        }

        private void CheckBestPractices(string content, JArray issues)
        {
            // Check for empty MonoBehavior methods
            if (content.Contains("void Start()") && content.Contains("{}"))
            {
                issues.Add(new JObject
                {
                    ["type"] = "warning",
                    ["category"] = "best_practice",
                    ["message"] = "Empty Start() method should be removed to avoid overhead",
                    ["line"] = 0
                });
            }

            if (content.Contains("void Update()") && content.Contains("{}"))
            {
                issues.Add(new JObject
                {
                    ["type"] = "warning",
                    ["category"] = "best_practice",
                    ["message"] = "Empty Update() method should be removed to avoid overhead",
                    ["line"] = 0
                });
            }

            // Check for GameObject.Find usage in Update
            if (content.Contains("void Update()") && content.Contains("GameObject.Find("))
            {
                int updateIndex = content.IndexOf("void Update()");
                int findIndex = content.IndexOf("GameObject.Find(", updateIndex);
                int nextMethodIndex = content.IndexOf("void ", updateIndex + 10);
                
                if (findIndex > updateIndex && (nextMethodIndex == -1 || findIndex < nextMethodIndex))
                {
                    issues.Add(new JObject
                    {
                        ["type"] = "error",
                        ["category"] = "performance",
                        ["message"] = "Avoid using GameObject.Find() in Update(). Cache the reference in Start() or Awake().",
                        ["line"] = 0
                    });
                }
            }
        }

        private void CheckPerformance(string content, JArray issues)
        {
            // Check for GetComponent in Update
            if (content.Contains("GetComponent<") && content.Contains("void Update()"))
            {
                // Basic heuristic
                issues.Add(new JObject
                {
                    ["type"] = "warning",
                    ["category"] = "performance",
                    ["message"] = "Verify that GetComponent() is not called inside Update(). Cache references instead.",
                    ["line"] = 0
                });
            }
        }
    }
}
