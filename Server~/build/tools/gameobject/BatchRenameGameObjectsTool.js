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
 * Input schema for batch_rename_gameobjects tool
 */
const BatchRenameGameObjectsToolArgsSchema = z.object({
    // Option 1: Use instanceIds directly
    instanceIds: z
        .array(z.number().int())
        .optional()
        .describe('Array of GameObject instance IDs to rename'),
    instanceId: z
        .number()
        .int()
        .optional()
        .describe('Single GameObject instance ID to rename'),
    // Option 2: Use name pattern matching
    oldNamePattern: z
        .string()
        .optional()
        .describe('The name pattern to match (supports wildcard *). Example: "Cube" or "Enemy_*"'),
    // New name configuration
    newNamePrefix: z
        .string()
        .optional()
        .describe('The prefix for the new names. Example: "Player_"'),
    baseName: z
        .string()
        .optional()
        .describe('Alias for newNamePrefix - Base name for the renamed objects'),
    newNamePattern: z
        .string()
        .optional()
        .describe('Alias for newNamePrefix - New name pattern for objects'),
    newNameSuffix: z
        .string()
        .optional()
        .describe('Optional suffix for the new names. Example: "_Prefab"'),
    startNumber: z
        .number()
        .int()
        .optional()
        .default(1)
        .describe('Starting number for sequential naming. Default: 1'),
    startIndex: z
        .number()
        .int()
        .optional()
        .describe('Alias for startNumber - Starting index for naming'),
    includeChildren: z
        .boolean()
        .optional()
        .default(false)
        .describe('Whether to include child GameObjects in the search. Default: false')
}).refine(data => data.instanceIds || data.instanceId || data.oldNamePattern, {
    message: 'Either instanceIds, instanceId, or oldNamePattern is required'
}).refine(data => data.newNamePrefix || data.baseName || data.newNamePattern, {
    message: 'Either newNamePrefix, baseName, or newNamePattern is required'
}).transform(data => ({
    instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : undefined),
    oldNamePattern: data.oldNamePattern, // Don't set default, let C# handle the logic
    newNamePrefix: data.newNamePrefix || data.baseName || data.newNamePattern || '',
    newNameSuffix: data.newNameSuffix,
    startNumber: data.startNumber ?? data.startIndex ?? 1,
    includeChildren: data.includeChildren
}));
/**
 * BatchRenameGameObjects Tool
 * Batch renames GameObjects
 */
let BatchRenameGameObjectsTool = (() => {
    let _classDecorators = [Tool({
            name: 'batch_rename_gameobjects',
            description: 'Batch renames GameObjects',
            category: 'gameobject',
            version: '1.0.0'
        }), Tags(['unity', 'gameobject', 'rename', 'batch'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var BatchRenameGameObjectsTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BatchRenameGameObjectsTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'batch_rename_gameobjects';
        }
        get description() {
            return 'Batch renames GameObjects';
        }
        get inputSchema() {
            return BatchRenameGameObjectsToolArgsSchema;
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
    return BatchRenameGameObjectsTool = _classThis;
})();
export { BatchRenameGameObjectsTool };
