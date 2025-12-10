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
 * Input schema for duplicate_scene tool
 */
const DuplicateSceneToolArgsSchema = z.object({
    sourceScenePath: z
        .string()
        .optional()
        .describe("Full asset path to the source scene (e.g., 'Assets/Scenes/MyScene.unity')"),
    scenePath: z
        .string()
        .optional()
        .describe("Alias for sourceScenePath - Full asset path to the source scene"),
    targetScenePath: z
        .string()
        .optional()
        .describe("Full asset path for the duplicated scene (e.g., 'Assets/Scenes/MyScene_Copy.unity')"),
    newSceneName: z
        .string()
        .optional()
        .describe("Name for the duplicated scene (will be saved in same folder as source)"),
    overwrite: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to overwrite the target scene if it already exists (default: false)')
}).refine(data => data.sourceScenePath || data.scenePath, {
    message: 'Either sourceScenePath or scenePath is required'
}).refine(data => data.targetScenePath || data.newSceneName, {
    message: 'Either targetScenePath or newSceneName is required'
});
// 注意：不使用 transform，直接让 C# 端处理 newSceneName 参数
// C# 端会自动将 newSceneName 转换为 targetScenePath
/**
 * DuplicateScene Tool
 * Duplicates an existing scene
 */
let DuplicateSceneTool = (() => {
    let _classDecorators = [Tool({
            name: 'duplicate_scene',
            description: 'Duplicates an existing scene',
            category: 'scene',
            version: '1.0.0'
        }), Tags(['unity', 'scene', 'duplicate'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var DuplicateSceneTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DuplicateSceneTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'duplicate_scene';
        }
        get description() {
            return 'Duplicates an existing scene';
        }
        get inputSchema() {
            return DuplicateSceneToolArgsSchema;
        }
        get category() {
            return 'scene';
        }
        formatSuccessResponse(result) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${result.message || 'Operation completed successfully'}`
                    }]
            };
        }
    };
    return DuplicateSceneTool = _classThis;
})();
export { DuplicateSceneTool };
