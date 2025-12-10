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
 * Input schema for set_component_reference tool
 */
const SetComponentReferenceToolArgsSchema = z.object({
    targetObjectPath: z.string().describe('Hierarchy path to the target GameObject (e.g., "Canvas/MyButton")'),
    componentName: z.string().describe('Name of the component on the target GameObject (e.g., "Button", "Image")'),
    fieldName: z.string().describe('Name of the field to set. Can use property name (e.g., "targetGraphic") or serialized name (e.g., "m_TargetGraphic"). Auto-converts to m_ prefix if needed.'),
    referenceObjectPath: z.string().describe('Hierarchy path to the GameObject to reference (e.g., "Canvas/MyImage")')
});
/**
 * SetComponentReference Tool
 * Sets a GameObject or Component reference on a component field using Unity's SerializedProperty
 */
let SetComponentReferenceTool = (() => {
    let _classDecorators = [Tool({
            name: 'set_component_reference',
            description: 'Sets a GameObject or Component reference on a component field (e.g., setting menuPanel field to reference another GameObject)',
            category: 'component',
            version: '1.0.0'
        }), Tags(['unity', 'component', 'reference', 'serialization'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var SetComponentReferenceTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SetComponentReferenceTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'set_component_reference';
        }
        get description() {
            return 'Sets a GameObject or Component reference on a component field using Unity\'s SerializedProperty system';
        }
        get inputSchema() {
            return SetComponentReferenceToolArgsSchema;
        }
        get category() {
            return 'component';
        }
        formatSuccessResponse(result) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${result.message || 'Successfully set component reference'}`
                    }]
            };
        }
    };
    return SetComponentReferenceTool = _classThis;
})();
export { SetComponentReferenceTool };
