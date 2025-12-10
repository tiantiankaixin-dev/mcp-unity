using System;
using System.IO;
using System.Text;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateScriptTool : McpToolBase
    {
        public CreateScriptTool()
        {
            Name = "create_script";
            Description = "Create a new C# script with specified template (MonoBehaviour, ScriptableObject, Editor, Interface, Struct, Class).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string scriptName = parameters["scriptName"]?.ToObject<string>();
                string scriptContent = parameters["scriptContent"]?.ToObject<string>();
                string scriptType = parameters["scriptType"]?.ToObject<string>() ?? "MonoBehaviour";
                string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/Scripts";
                string namespaceName = parameters["namespace"]?.ToObject<string>();
                JArray methodsArray = parameters["methods"] as JArray;
                JArray fieldsArray = parameters["fields"] as JArray;
                JArray usingsArray = parameters["usings"] as JArray;

                if (string.IsNullOrEmpty(scriptName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "scriptName is required.", "validation_error");
                }

                // 确保保存路径存在
                if (!AssetDatabase.IsValidFolder(savePath))
                {
                    string[] folders = savePath.Split('/');
                    string currentPath = folders[0];
                    for (int i = 1; i < folders.Length; i++)
                    {
                        string newPath = currentPath + "/" + folders[i];
                        if (!AssetDatabase.IsValidFolder(newPath))
                        {
                            AssetDatabase.CreateFolder(currentPath, folders[i]);
                        }
                        currentPath = newPath;
                    }
                }

                string fullPath = Path.Combine(savePath, scriptName + ".cs").Replace("\\", "/");

                // 检查文件是否已存在
                if (File.Exists(fullPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Script '{scriptName}' already exists at '{fullPath}'.", "validation_error");
                }

                // 如果提供了scriptContent，直接使用；否则生成脚本内容
                string finalScriptContent;
                if (!string.IsNullOrEmpty(scriptContent))
                {
                    finalScriptContent = scriptContent;
                    McpLogger.LogInfo("Using provided script content");
                }
                else
                {
                    finalScriptContent = GenerateScriptContent(
                        scriptName, scriptType, namespaceName,
                        methodsArray, fieldsArray, usingsArray);
                    McpLogger.LogInfo("Generated script content from template");
                }

                // 写入文件
                File.WriteAllText(fullPath, finalScriptContent, Encoding.UTF8);
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created script '{scriptName}' at '{fullPath}'.",
                    ["scriptName"] = scriptName,
                    ["scriptType"] = scriptType,
                    ["path"] = fullPath,
                    ["usedCustomContent"] = !string.IsNullOrEmpty(scriptContent)
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateScriptTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private string GenerateScriptContent(
            string scriptName, 
            string scriptType, 
            string namespaceName,
            JArray methodsArray, 
            JArray fieldsArray,
            JArray usingsArray)
        {
            StringBuilder sb = new StringBuilder();

            // Using statements
            sb.AppendLine("using System;");
            sb.AppendLine("using System.Collections;");
            sb.AppendLine("using System.Collections.Generic;");
            sb.AppendLine("using UnityEngine;");

            if (scriptType == "Editor")
            {
                sb.AppendLine("using UnityEditor;");
            }

            // Additional usings
            if (usingsArray != null && usingsArray.Count > 0)
            {
                foreach (var usingItem in usingsArray)
                {
                    string usingNamespace = usingItem.ToObject<string>();
                    if (!string.IsNullOrEmpty(usingNamespace))
                    {
                        sb.AppendLine($"using {usingNamespace};");
                    }
                }
            }

            sb.AppendLine();

            // Namespace
            int indentLevel = 0;
            if (!string.IsNullOrEmpty(namespaceName))
            {
                sb.AppendLine($"namespace {namespaceName}");
                sb.AppendLine("{");
                indentLevel = 1;
            }

            // Class/Interface/Struct declaration
            string indent = new string(' ', indentLevel * 4);
            string bodyIndent = new string(' ', (indentLevel + 1) * 4);

            switch (scriptType.ToLower())
            {
                case "monobehaviour":
                    sb.AppendLine($"{indent}public class {scriptName} : MonoBehaviour");
                    sb.AppendLine($"{indent}{{");
                    GenerateFields(sb, fieldsArray, bodyIndent);
                    GenerateMonoBehaviourMethods(sb, methodsArray, bodyIndent);
                    sb.AppendLine($"{indent}}}");
                    break;

                case "scriptableobject":
                    sb.AppendLine($"{indent}[CreateAssetMenu(fileName = \"{scriptName}\", menuName = \"ScriptableObjects/{scriptName}\")]");
                    sb.AppendLine($"{indent}public class {scriptName} : ScriptableObject");
                    sb.AppendLine($"{indent}{{");
                    GenerateFields(sb, fieldsArray, bodyIndent);
                    GenerateMethods(sb, methodsArray, bodyIndent);
                    sb.AppendLine($"{indent}}}");
                    break;

                case "editor":
                    sb.AppendLine($"{indent}[CustomEditor(typeof({scriptName.Replace("Editor", "")}))]");
                    sb.AppendLine($"{indent}public class {scriptName} : Editor");
                    sb.AppendLine($"{indent}{{");
                    sb.AppendLine($"{bodyIndent}public override void OnInspectorGUI()");
                    sb.AppendLine($"{bodyIndent}{{");
                    sb.AppendLine($"{bodyIndent}    DrawDefaultInspector();");
                    sb.AppendLine($"{bodyIndent}}}");
                    GenerateMethods(sb, methodsArray, bodyIndent);
                    sb.AppendLine($"{indent}}}");
                    break;

                case "interface":
                    sb.AppendLine($"{indent}public interface {scriptName}");
                    sb.AppendLine($"{indent}{{");
                    GenerateInterfaceMethods(sb, methodsArray, bodyIndent);
                    sb.AppendLine($"{indent}}}");
                    break;

                case "struct":
                    sb.AppendLine($"{indent}[System.Serializable]");
                    sb.AppendLine($"{indent}public struct {scriptName}");
                    sb.AppendLine($"{indent}{{");
                    GenerateFields(sb, fieldsArray, bodyIndent);
                    GenerateMethods(sb, methodsArray, bodyIndent);
                    sb.AppendLine($"{indent}}}");
                    break;

                case "class":
                default:
                    sb.AppendLine($"{indent}public class {scriptName}");
                    sb.AppendLine($"{indent}{{");
                    GenerateFields(sb, fieldsArray, bodyIndent);
                    GenerateMethods(sb, methodsArray, bodyIndent);
                    sb.AppendLine($"{indent}}}");
                    break;
            }

            // Close namespace
            if (!string.IsNullOrEmpty(namespaceName))
            {
                sb.AppendLine("}");
            }

            return sb.ToString();
        }

        private void GenerateFields(StringBuilder sb, JArray fieldsArray, string indent)
        {
            if (fieldsArray == null || fieldsArray.Count == 0) return;

            foreach (var fieldItem in fieldsArray)
            {
                JObject field = fieldItem as JObject;
                if (field == null) continue;

                string fieldName = field["name"]?.ToObject<string>();
                string fieldType = field["type"]?.ToObject<string>() ?? "int";
                bool isPublic = field["isPublic"]?.ToObject<bool>() ?? false;
                bool isSerializeField = field["isSerializeField"]?.ToObject<bool>() ?? false;
                string defaultValue = field["defaultValue"]?.ToObject<string>();

                if (string.IsNullOrEmpty(fieldName)) continue;

                if (isSerializeField && !isPublic)
                {
                    sb.AppendLine($"{indent}[SerializeField]");
                }

                string accessModifier = isPublic ? "public" : "private";
                string valueAssignment = string.IsNullOrEmpty(defaultValue) ? "" : $" = {defaultValue}";
                
                sb.AppendLine($"{indent}{accessModifier} {fieldType} {fieldName}{valueAssignment};");
            }

            if (fieldsArray.Count > 0)
            {
                sb.AppendLine();
            }
        }

        private void GenerateMonoBehaviourMethods(StringBuilder sb, JArray methodsArray, string indent)
        {
            // 默认添加 Start 和 Update 方法
            sb.AppendLine($"{indent}private void Start()");
            sb.AppendLine($"{indent}{{");
            sb.AppendLine($"{indent}    // TODO: Implement Start logic");
            sb.AppendLine($"{indent}}}");
            sb.AppendLine();

            sb.AppendLine($"{indent}private void Update()");
            sb.AppendLine($"{indent}{{");
            sb.AppendLine($"{indent}    // TODO: Implement Update logic");
            sb.AppendLine($"{indent}}}");

            if (methodsArray != null && methodsArray.Count > 0)
            {
                sb.AppendLine();
                GenerateMethods(sb, methodsArray, indent);
            }
        }

        private void GenerateMethods(StringBuilder sb, JArray methodsArray, string indent)
        {
            if (methodsArray == null || methodsArray.Count == 0) return;

            foreach (var methodItem in methodsArray)
            {
                JObject method = methodItem as JObject;
                if (method == null) continue;

                string methodName = method["name"]?.ToObject<string>();
                string returnType = method["returnType"]?.ToObject<string>() ?? "void";
                JArray parametersArray = method["parameters"] as JArray;

                if (string.IsNullOrEmpty(methodName)) continue;

                sb.AppendLine();
                string parameters = GenerateParameters(parametersArray);
                sb.AppendLine($"{indent}public {returnType} {methodName}({parameters})");
                sb.AppendLine($"{indent}{{");
                
                if (returnType != "void")
                {
                    sb.AppendLine($"{indent}    // TODO: Implement {methodName}");
                    sb.AppendLine($"{indent}    throw new System.NotImplementedException();");
                }
                else
                {
                    sb.AppendLine($"{indent}    // TODO: Implement {methodName}");
                }
                
                sb.AppendLine($"{indent}}}");
            }
        }

        private void GenerateInterfaceMethods(StringBuilder sb, JArray methodsArray, string indent)
        {
            if (methodsArray == null || methodsArray.Count == 0) return;

            foreach (var methodItem in methodsArray)
            {
                JObject method = methodItem as JObject;
                if (method == null) continue;

                string methodName = method["name"]?.ToObject<string>();
                string returnType = method["returnType"]?.ToObject<string>() ?? "void";
                JArray parametersArray = method["parameters"] as JArray;

                if (string.IsNullOrEmpty(methodName)) continue;

                string parameters = GenerateParameters(parametersArray);
                sb.AppendLine($"{indent}{returnType} {methodName}({parameters});");
            }
        }

        private string GenerateParameters(JArray parametersArray)
        {
            if (parametersArray == null || parametersArray.Count == 0) return "";

            StringBuilder paramSb = new StringBuilder();
            for (int i = 0; i < parametersArray.Count; i++)
            {
                JObject param = parametersArray[i] as JObject;
                if (param == null) continue;

                string paramType = param["type"]?.ToObject<string>() ?? "object";
                string paramName = param["name"]?.ToObject<string>() ?? $"param{i}";

                if (i > 0) paramSb.Append(", ");
                paramSb.Append($"{paramType} {paramName}");
            }

            return paramSb.ToString();
        }
    }
}

