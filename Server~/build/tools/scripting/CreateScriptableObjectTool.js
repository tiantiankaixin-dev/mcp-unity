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
/**
 * Tool for creating ScriptableObject assets
 *
 * Creates a new ScriptableObject asset for data storage in Unity.
 *
 * Unity API: UnityEngine.ScriptableObject, UnityEditor.AssetDatabase
 * C# Handler: Editor/Tools/CreateScriptableObjectTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/ScriptableObject.html
 * @see https://docs.unity3d.com/ScriptReference/AssetDatabase.html
 *
 * @example
 * // Create with default settings
 * { assetName: "MyData" }
 *
 * @example
 * // Create with custom type and path
 * { assetName: "GameConfig", savePath: "Assets/Data", typeName: "MyGame.GameConfigData" }
 *
 * @category scripting
 */
let CreateScriptableObjectTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_scriptable_object',
            description: 'Create a ScriptableObject asset for data storage',
            category: 'scripting',
            version: '1.0.0'
        }), Tags(['unity', 'scripting', 'scriptableobject', 'asset'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreateScriptableObjectTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateScriptableObjectTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'create_scriptable_object';
        }
        get description() {
            return 'Create a ScriptableObject asset for data storage';
        }
        get category() {
            return 'scripting';
        }
        get inputSchema() {
            return z.object({
                assetName: z.string().optional().describe('Name for the ScriptableObject asset. Default: "NewScriptableObject"'),
                savePath: z.string().optional().describe('Path to save the asset. Default: "Assets/ScriptableObjects"'),
                typeName: z.string().optional().describe('Fully qualified type name of the ScriptableObject class. Example: "MyNamespace.MyScriptableObject"')
            });
        }
        /**
         * Execution logic for creating ScriptableObject assets
         */
        async execute(args) {
            try {
                // Validate arguments
                const validatedArgs = this.inputSchema.parse(args);
                this.logger.debug(`Executing ${this.name}`, validatedArgs);
                // Send request to Unity
                const response = await this.mcpUnity.sendRequest({
                    method: this.name,
                    params: validatedArgs
                });
                // Check if execution was successful
                if (!response.success) {
                    return {
                        content: [{
                                type: 'text',
                                text: `❌ Error: ${response.message || 'Failed to create ScriptableObject'}`
                            }],
                        isError: true
                    };
                }
                // Return success response
                return {
                    content: [{
                            type: 'text',
                            text: `✅ ${response.message}`
                        }]
                };
            }
            catch (error) {
                this.logger.error(`Error in ${this.name}:`, error);
                return this.formatErrorResponse(error);
            }
        }
    };
    return CreateScriptableObjectTool = _classThis;
})();
export { CreateScriptableObjectTool };
