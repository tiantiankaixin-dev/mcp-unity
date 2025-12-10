var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
const ValidateScriptArgsSchema = z.object({
    scriptPath: z.string().describe('Path to the script file to validate (e.g., Assets/Scripts/PlayerController.cs)'),
    validationLevel: z.enum(['syntax', 'compilation', 'best_practices', 'all']).default('all')
        .describe('Level of validation to perform'),
    checkNamingConventions: z.boolean().default(true).describe('Check C# naming conventions'),
    checkUnityBestPractices: z.boolean().default(true).describe('Check Unity-specific best practices'),
    checkPerformance: z.boolean().default(false).describe('Check for common performance issues'),
    autoFix: z.boolean().default(false).describe('Automatically fix simple issues (formatting, using statements)')
});
let ValidateScriptTool = (() => {
    let _classDecorators = [Tool({
            name: 'validate_script',
            description: 'Validate C# scripts for syntax errors, compilation issues, naming conventions, and Unity best practices',
            category: 'scripting',
            version: '1.0.0'
        }), Tags(['unity', 'scripting', 'validation', 'linting', 'best-practices', 'code-quality']), Examples([
            {
                description: 'Basic syntax and compilation check',
                args: {
                    scriptPath: 'Assets/Scripts/PlayerController.cs',
                    validationLevel: 'compilation'
                }
            },
            {
                description: 'Full validation with best practices',
                args: {
                    scriptPath: 'Assets/Scripts/EnemyAI.cs',
                    validationLevel: 'all',
                    checkNamingConventions: true,
                    checkUnityBestPractices: true
                }
            },
            {
                description: 'Validate with auto-fix',
                args: {
                    scriptPath: 'Assets/Scripts/GameManager.cs',
                    validationLevel: 'all',
                    autoFix: true
                }
            },
            {
                description: 'Performance check',
                args: {
                    scriptPath: 'Assets/Scripts/PerformanceCritical.cs',
                    validationLevel: 'all',
                    checkPerformance: true
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var ValidateScriptTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ValidateScriptTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'validate_script'; }
        get description() { return 'Validate C# scripts for syntax errors, compilation issues, naming conventions, and Unity best practices'; }
        get inputSchema() { return ValidateScriptArgsSchema; }
        get category() { return 'scripting'; }
        async beforeExecute(args) {
            if (!args.scriptPath || !args.scriptPath.endsWith('.cs')) {
                throw new Error('Script path must end with .cs extension');
            }
            if (!args.scriptPath.startsWith('Assets/')) {
                throw new Error('Script path must start with "Assets/"');
            }
        }
        formatSuccessResponse(result) {
            const { scriptPath, isValid, errors = [], warnings = [], suggestions = [], autoFixedIssues = [], statistics } = result;
            let output = '';
            if (isValid && errors.length === 0 && warnings.length === 0) {
                output = `✅ Script validation passed!\n`;
                output += `Script: ${scriptPath}\n`;
                output += `\nNo issues found. The script follows best practices.\n`;
            }
            else {
                output = `📋 Validation Report\n`;
                output += `Script: ${scriptPath}\n`;
                output += `Status: ${isValid ? '✅ Valid' : '❌ Invalid'}\n\n`;
                if (errors.length > 0) {
                    output += `❌ Errors (${errors.length}):\n`;
                    errors.forEach((error, index) => {
                        output += `  ${index + 1}. [Line ${error.line || '?'}] ${error.message}\n`;
                        if (error.code)
                            output += `     Code: ${error.code}\n`;
                    });
                    output += '\n';
                }
                if (warnings.length > 0) {
                    output += `⚠️  Warnings (${warnings.length}):\n`;
                    warnings.forEach((warning, index) => {
                        output += `  ${index + 1}. [Line ${warning.line || '?'}] ${warning.message}\n`;
                    });
                    output += '\n';
                }
                if (suggestions.length > 0) {
                    output += `💡 Suggestions (${suggestions.length}):\n`;
                    suggestions.forEach((suggestion, index) => {
                        output += `  ${index + 1}. ${suggestion.message}\n`;
                        if (suggestion.fix)
                            output += `     Fix: ${suggestion.fix}\n`;
                    });
                    output += '\n';
                }
                if (autoFixedIssues.length > 0) {
                    output += `🔧 Auto-fixed issues (${autoFixedIssues.length}):\n`;
                    autoFixedIssues.forEach((issue, index) => {
                        output += `  ${index + 1}. ${issue}\n`;
                    });
                    output += '\n';
                }
            }
            if (statistics) {
                output += `\n📊 Statistics:\n`;
                if (statistics.lines)
                    output += `  • Lines of code: ${statistics.lines}\n`;
                if (statistics.methods)
                    output += `  • Methods: ${statistics.methods}\n`;
                if (statistics.fields)
                    output += `  • Fields: ${statistics.fields}\n`;
                if (statistics.complexity)
                    output += `  • Cyclomatic complexity: ${statistics.complexity}\n`;
            }
            if (!isValid) {
                output += `\n💡 Tip: Fix the errors above to make the script valid.`;
            }
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\nTip: Make sure the script file exists at the specified path.';
            }
            else if (errorMessage.includes('cannot read')) {
                helpText = '\n\nTip: The script file may be locked or have permission issues.';
            }
            return {
                content: [{ type: 'text', text: `Error validating script: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return ValidateScriptTool = _classThis;
})();
export { ValidateScriptTool };
