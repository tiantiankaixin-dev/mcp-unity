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
 * Input schema for set_layer tool
 */
const SetLayerToolArgsSchema = z.object({
    instanceIds: z
        .array(z.number().int())
        .optional()
        .describe('Array of GameObject instance IDs to set layer'),
    instanceId: z
        .number()
        .int()
        .optional()
        .describe('Single GameObject instance ID (alternative to instanceIds)'),
    layerName: z
        .string()
        .optional()
        .describe('Name of the layer to set. Example: "Default", "UI", "Water"'),
    layer: z
        .string()
        .optional()
        .describe('Alias for layerName - Name of the layer to set'),
    includeChildren: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to also set the layer for all child GameObjects. Default: false')
}).refine(data => data.instanceIds || data.instanceId, {
    message: 'Either instanceIds or instanceId is required'
}).refine(data => data.layerName || data.layer, {
    message: 'Either layerName or layer is required'
}).transform(data => ({
    instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : []),
    layerName: data.layerName || data.layer || '',
    includeChildren: data.includeChildren
}));
/**
 * SetLayer Tool
 * Sets GameObject layer
 */
let SetLayerTool = (() => {
    let _classDecorators = [Tool({
            name: 'set_layer',
            description: 'Sets GameObject layer',
            category: 'gameobject',
            version: '1.0.0'
        }), Tags(['unity', 'gameobject', 'layer'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var SetLayerTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SetLayerTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'set_layer';
        }
        get description() {
            return 'Sets GameObject layer';
        }
        get inputSchema() {
            return SetLayerToolArgsSchema;
        }
        get category() {
            return 'gameobject';
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
    return SetLayerTool = _classThis;
})();
export { SetLayerTool };
