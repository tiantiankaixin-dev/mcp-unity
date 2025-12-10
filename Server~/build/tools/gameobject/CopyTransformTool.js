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
 * Input schema for copy_transform tool
 */
const CopyTransformToolArgsSchema = z.object({
    // Source identification - at least one required
    sourceInstanceId: z
        .number()
        .int()
        .optional()
        .describe('Instance ID of the source GameObject to copy transform from'),
    sourceObjectPath: z
        .string()
        .optional()
        .describe('Hierarchy path to the source GameObject (alternative to sourceInstanceId)'),
    sourceObjectName: z
        .string()
        .optional()
        .describe('Name of the source GameObject to find (alternative to sourceInstanceId)'),
    // Target identification - at least one required
    targetInstanceId: z
        .number()
        .int()
        .optional()
        .describe('Instance ID of the target GameObject to copy transform to'),
    targetObjectPath: z
        .string()
        .optional()
        .describe('Hierarchy path to the target GameObject (alternative to targetInstanceId)'),
    targetObjectName: z
        .string()
        .optional()
        .describe('Name of the target GameObject to find (alternative to targetInstanceId)'),
    targetInstanceIds: z
        .array(z.number().int())
        .optional()
        .describe('Array of target GameObject instance IDs (alternative to targetInstanceId for batch copy)'),
    copyPosition: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to copy position. Default: true'),
    copyRotation: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to copy rotation. Default: true'),
    copyScale: z
        .boolean()
        .optional()
        .default(true)
        .describe('Whether to copy scale. Default: true'),
    useLocal: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to use local space (true) or world space (false). Default: false (world space)')
}).refine(data => data.sourceInstanceId || data.sourceObjectPath || data.sourceObjectName, {
    message: 'Either sourceInstanceId, sourceObjectPath or sourceObjectName is required'
}).refine(data => data.targetInstanceId || data.targetInstanceIds || data.targetObjectPath || data.targetObjectName, {
    message: 'Either targetInstanceId, targetInstanceIds, targetObjectPath or targetObjectName is required'
}).transform(data => ({
    sourceInstanceId: data.sourceInstanceId || 0,
    sourceObjectPath: data.sourceObjectPath,
    sourceObjectName: data.sourceObjectName,
    targetInstanceId: data.targetInstanceId || (data.targetInstanceIds ? data.targetInstanceIds[0] : 0),
    targetObjectPath: data.targetObjectPath,
    targetObjectName: data.targetObjectName,
    targetInstanceIds: data.targetInstanceIds || (data.targetInstanceId ? [data.targetInstanceId] : []),
    copyPosition: data.copyPosition,
    copyRotation: data.copyRotation,
    copyScale: data.copyScale,
    useLocal: data.useLocal
}));
/**
 * CopyTransform Tool
 * Copies transform from one GameObject to another
 */
let CopyTransformTool = (() => {
    let _classDecorators = [Tool({
            name: 'copy_transform',
            description: 'Copies transform from one GameObject to another',
            category: 'gameobject',
            version: '1.0.0'
        }), Tags(['unity', 'gameobject', 'transform', 'copy'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CopyTransformTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CopyTransformTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'copy_transform';
        }
        get description() {
            return 'Copies transform from one GameObject to another';
        }
        get inputSchema() {
            return CopyTransformToolArgsSchema;
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
    return CopyTransformTool = _classThis;
})();
export { CopyTransformTool };
