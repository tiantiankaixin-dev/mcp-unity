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
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpUnityError, ErrorType } from '../../utils/errors.js';
/**
 * Tool for recompiling Unity scripts
 *
 * Triggers a recompilation of all scripts in the Unity project.
 *
 * Unity API: UnityEditor.Compilation.CompilationPipeline, EditorUtility.RequestScriptReload
 * C# Handler: Editor/Tools/RecompileScriptsTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/EditorUtility.RequestScriptReload.html
 * @see https://docs.unity3d.com/ScriptReference/Compilation.CompilationPipeline.html
 *
 * @example
 * // Recompile with logs
 * { returnWithLogs: true, logsLimit: 100 }
 *
 * @example
 * // Recompile without logs
 * { returnWithLogs: false }
 *
 * @category scripting
 */
let RecompileScriptsTool = (() => {
    let _classDecorators = [Tool({
            name: 'recompile_scripts',
            description: 'Recompiles all scripts in the Unity project',
            category: 'scripting',
            version: '1.0.0'
        }), Tags(['unity', 'scripting', 'compilation'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var RecompileScriptsTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RecompileScriptsTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'recompile_scripts';
        }
        get description() {
            return 'Recompiles all scripts in the Unity project';
        }
        get category() {
            return 'scripting';
        }
        get inputSchema() {
            return z.object({
                returnWithLogs: z.boolean().optional().default(true).describe('Whether to return compilation logs'),
                logsLimit: z.number().int().min(0).max(1000).optional().default(100).describe('Maximum number of compilation logs to return')
            });
        }
        /**
         * Custom execution logic preserved from legacy implementation
         * Handles script recompilation with optional log retrieval
         */
        async execute(args) {
            try {
                // Validate arguments
                const validatedArgs = this.inputSchema.parse(args);
                // Extract parameters with defaults and validation
                const returnWithLogs = validatedArgs.returnWithLogs ?? true;
                const logsLimit = Math.max(0, Math.min(1000, validatedArgs.logsLimit || 100));
                this.logger.debug(`Executing ${this.name}`, { returnWithLogs, logsLimit });
                // Send request to Unity
                const response = await this.mcpUnity.sendRequest({
                    method: this.name,
                    params: {
                        returnWithLogs,
                        logsLimit
                    }
                });
                // Check if execution was successful
                if (!response.success) {
                    throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || 'Failed to recompile scripts');
                }
                // Return formatted response with compilation logs
                return {
                    content: [
                        {
                            type: 'text',
                            text: response.message
                        },
                        {
                            type: 'text',
                            text: JSON.stringify({
                                logs: response.logs
                            }, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                this.logger.error(`Error in ${this.name}:`, error);
                // Preserve error type if it's already a McpUnityError
                if (error instanceof McpUnityError) {
                    throw error;
                }
                return this.formatErrorResponse(error);
            }
        }
    };
    return RecompileScriptsTool = _classThis;
})();
export { RecompileScriptsTool };
