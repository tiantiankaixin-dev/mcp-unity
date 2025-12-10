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
 * Input schema for randomize_transform tool
 */
const RandomizeTransformToolArgsSchema = z.object({
    instanceIds: z
        .array(z.number().int())
        .min(1)
        .describe('Array of GameObject instance IDs to randomize'),
    randomizePosition: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to randomize position. Default: false'),
    randomizeRotation: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to randomize rotation. Default: false'),
    randomizeScale: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to randomize scale. Default: false'),
    positionRange: z
        .number()
        .optional()
        .default(5)
        .describe('Range for position randomization (±range). Default: 5'),
    rotationRange: z
        .number()
        .optional()
        .default(360)
        .describe('Range for rotation randomization (0-range degrees). Default: 360'),
    scaleMin: z
        .number()
        .optional()
        .default(0.5)
        .describe('Minimum scale multiplier. Default: 0.5'),
    scaleMax: z
        .number()
        .optional()
        .default(2)
        .describe('Maximum scale multiplier. Default: 2')
});
/**
 * RandomizeTransform Tool
 * Randomizes GameObject transform
 */
let RandomizeTransformTool = (() => {
    let _classDecorators = [Tool({
            name: 'randomize_transform',
            description: 'Randomizes GameObject transform',
            category: 'gameobject',
            version: '1.0.0'
        }), Tags(['unity', 'gameobject', 'transform', 'random'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var RandomizeTransformTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RandomizeTransformTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'randomize_transform';
        }
        get description() {
            return 'Randomizes GameObject transform';
        }
        get inputSchema() {
            return RandomizeTransformToolArgsSchema;
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
    return RandomizeTransformTool = _classThis;
})();
export { RandomizeTransformTool };
