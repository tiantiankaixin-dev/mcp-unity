using System;
using System.IO;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Update existing C# scripts by adding/removing fields, methods, using statements, or renaming classes
    /// Note: This is a basic implementation. Full refactoring requires Roslyn integration.
    /// Unity API: File system operations
    /// </summary>
    public class UpdateScriptTool : McpToolBase
    {
        public UpdateScriptTool()
        {
            Name = "update_script";
            Description = "Update existing C# scripts by adding/removing fields, methods, using statements, or renaming classes";
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

                if (string.IsNullOrEmpty(operation))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "operation is required (add_field, add_method, add_using, rename_class, etc.)", "validation_error");
                }

                // Support relative paths starting with Assets/
                string fullPath = scriptPath;
                if (scriptPath.StartsWith("Assets/") || scriptPath.StartsWith("Assets\\"))
                {
                    fullPath = Path.Combine(Application.dataPath.Replace("/Assets", ""), scriptPath.Replace("/", Path.DirectorySeparatorChar.ToString()));
                }

                if (!File.Exists(fullPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Script file not found: {scriptPath}. Full path checked: {fullPath}", "not_found");
                }

                string content = File.ReadAllText(fullPath);
                string newContent = content;

                switch (operation)
                {
                    case "add_field":
                        newContent = AddField(content, parameters);
                        break;

                    case "add_method":
                        newContent = AddMethod(content, parameters);
                        break;

                    case "add_using":
                        newContent = AddUsing(content, parameters);
                        break;

                    case "rename_class":
                        newContent = RenameClass(content, scriptPath, parameters);
                        break;

                    case "add_namespace":
                        newContent = AddNamespace(content, parameters);
                        break;

                    case "remove_field":
                        newContent = RemoveField(content, parameters);
                        break;

                    case "remove_method":
                        newContent = RemoveMethod(content, parameters);
                        break;

                    default:
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Unknown operation: {operation}", "validation_error");
                }

                bool wasModified = content != newContent;
                
                if (wasModified)
                {
                    File.WriteAllText(fullPath, newContent);
                    AssetDatabase.Refresh();
                    McpLogger.LogInfo($"Updated script: {scriptPath} (operation: {operation})");
                }
                else
                {
                    McpLogger.LogInfo($"Script unchanged: {scriptPath} (operation: {operation}, skipped - already exists or no change needed)");
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = wasModified ? "Script updated successfully" : "Script unchanged (item already exists or no change needed)",
                    ["scriptPath"] = scriptPath,
                    ["operation"] = operation,
                    ["modified"] = wasModified
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"UpdateScriptTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private string AddField(string content, JObject parameters)
        {
            var field = parameters["field"];
            if (field == null) return content;

            string fieldName = field["name"]?.ToString();
            string fieldType = field["type"]?.ToString();
            string access = field["access"]?.ToString() ?? "public";
            string defaultValue = field["defaultValue"]?.ToString();

            if (string.IsNullOrEmpty(fieldName))
            {
                throw new ArgumentException("Field name is required");
            }

            // Check if field already exists (prevents CS0102 duplicate definition error)
            string fieldPattern = $@"\b{Regex.Escape(fieldName)}\s*[;=]";
            if (Regex.IsMatch(content, fieldPattern))
            {
                McpLogger.LogWarning($"Field '{fieldName}' already exists in script, skipping add_field");
                return content; // Field already exists, don't add duplicate
            }

            string fieldDeclaration = $"    {access} {fieldType} {fieldName}";
            if (!string.IsNullOrEmpty(defaultValue))
            {
                fieldDeclaration += $" = {defaultValue}";
            }
            fieldDeclaration += ";";

            // Insert after class declaration
            int classIndex = content.IndexOf("{", content.IndexOf("class "));
            if (classIndex > 0)
            {
                content = content.Insert(classIndex + 1, "\n" + fieldDeclaration + "\n");
            }

            return content;
        }

        private string AddMethod(string content, JObject parameters)
        {
            var method = parameters["method"];
            if (method == null) return content;

            string methodName = method["name"]?.ToString();
            string returnType = method["returnType"]?.ToString() ?? "void";
            string access = method["access"]?.ToString() ?? "public";
            string body = method["body"]?.ToString() ?? "        // TODO: Implement method";

            if (string.IsNullOrEmpty(methodName))
            {
                throw new ArgumentException("Method name is required");
            }

            // Check if method already exists (prevents duplicate method error)
            string methodPattern = $@"\b{Regex.Escape(methodName)}\s*\(";
            if (Regex.IsMatch(content, methodPattern))
            {
                McpLogger.LogWarning($"Method '{methodName}' already exists in script, skipping add_method");
                return content; // Method already exists, don't add duplicate
            }

            string methodDeclaration = $"    {access} {returnType} {methodName}()\n    {{\n{body}\n    }}\n";

            // Insert before last closing brace
            int lastBrace = content.LastIndexOf("}");
            if (lastBrace > 0)
            {
                content = content.Insert(lastBrace, "\n" + methodDeclaration);
            }

            return content;
        }

        private string AddUsing(string content, JObject parameters)
        {
            string usingStatement = parameters["usingStatement"]?.ToString();
            if (string.IsNullOrEmpty(usingStatement)) return content;

            // Check if using already exists
            if (content.Contains($"using {usingStatement};"))
            {
                return content;
            }

            // Add after other using statements
            int lastUsing = content.LastIndexOf("using ");
            if (lastUsing > 0)
            {
                int lineEnd = content.IndexOf("\n", lastUsing);
                if (lineEnd > 0)
                {
                    content = content.Insert(lineEnd + 1, $"using {usingStatement};\n");
                }
            }
            else
            {
                // Add at the beginning
                content = $"using {usingStatement};\n" + content;
            }

            return content;
        }

        private string RenameClass(string content, string scriptPath, JObject parameters)
        {
            string newClassName = parameters["newClassName"]?.ToString();
            if (string.IsNullOrEmpty(newClassName)) return content;

            // Find current class name
            Match match = Regex.Match(content, @"class\s+(\w+)");
            if (match.Success)
            {
                string oldClassName = match.Groups[1].Value;
                content = content.Replace($"class {oldClassName}", $"class {newClassName}");

                // Rename file
                string directory = Path.GetDirectoryName(scriptPath);
                string newPath = Path.Combine(directory, newClassName + ".cs");
                if (File.Exists(scriptPath) && scriptPath != newPath)
                {
                    File.Move(scriptPath, newPath);
                }
            }

            return content;
        }

        private string AddNamespace(string content, JObject parameters)
        {
            string namespaceName = parameters["namespace"]?.ToString();
            if (string.IsNullOrEmpty(namespaceName)) return content;

            // Wrap content in namespace
            if (!content.Contains($"namespace {namespaceName}"))
            {
                // Find where to start namespace (after usings)
                int insertIndex = 0;
                int lastUsing = content.LastIndexOf("using ");
                if (lastUsing > 0)
                {
                    insertIndex = content.IndexOf("\n", lastUsing) + 1;
                }

                content = content.Insert(insertIndex, $"\nnamespace {namespaceName}\n{{\n");
                content += "\n}";
            }

            return content;
        }

        private string RemoveField(string content, JObject parameters)
        {
            string targetName = parameters["targetName"]?.ToString();
            if (string.IsNullOrEmpty(targetName)) return content;

            // Simple removal - find and remove the line
            string pattern = $@".*{targetName}.*;";
            content = Regex.Replace(content, pattern, "");

            return content;
        }

        private string RemoveMethod(string content, JObject parameters)
        {
            string targetName = parameters["targetName"]?.ToString();
            if (string.IsNullOrEmpty(targetName)) return content;

            // Find method and remove it (basic implementation)
            string pattern = $@"\s*\w+\s+\w+\s+{targetName}\([^)]*\)\s*\{{[^}}]*\}}";
            content = Regex.Replace(content, pattern, "", RegexOptions.Singleline);

            return content;
        }
    }
}
