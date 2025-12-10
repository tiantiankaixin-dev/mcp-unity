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
 * Input schema for duplicate_gameobject tool
 * Based on Unity API: Object.Instantiate
 * https://docs.unity3d.com/ScriptReference/Object.Instantiate.html
 */
const DuplicateGameObjectToolArgsSchema = z.object({
    instanceId: z.number().int().optional().describe('Instance ID of the GameObject to duplicate'),
    instanceIds: z.array(z.number().int()).optional().describe('Array of GameObject instance IDs to duplicate'),
    objectPath: z.string().optional().describe('Hierarchy path to the GameObject to duplicate'),
    count: z.number().int().min(1).max(100).optional().default(1).describe('Number of duplicates to create. Default: 1'),
    keepParent: z.boolean().optional().default(true).describe('Whether to keep the same parent. Default: true'),
    offsetX: z.number().optional().default(1).describe('X offset between duplicates. Default: 1'),
    offsetY: z.number().optional().default(0).describe('Y offset between duplicates. Default: 0'),
    offsetZ: z.number().optional().default(0).describe('Z offset between duplicates. Default: 0')
});
/**
 * DuplicateGameObject Tool
 * Duplicates/clones GameObjects in the scene
 */
let DuplicateGameObjectTool = (() => {
    let _classDecorators = [Tool({
            name: 'duplicate_gameobject',
            description: 'Duplicate/clone GameObjects in the scene. Supports Undo/Redo.',
            category: 'gameobject',
            version: '1.0.0'
        }), Tags(['unity', 'gameobject', 'duplicate', 'clone', 'copy'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var DuplicateGameObjectTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DuplicateGameObjectTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'duplicate_gameobject';
        }
        get description() {
            return 'Duplicate/clone GameObjects in the scene. Supports Undo/Redo.';
        }
        get inputSchema() {
            return DuplicateGameObjectToolArgsSchema;
        }
        get category() {
            return 'gameobject';
        }
        formatSuccessResponse(result) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${result.message || 'GameObjects duplicated successfully'}`
                    }]
            };
        }
    };
    return DuplicateGameObjectTool = _classThis;
})();
export { DuplicateGameObjectTool };
