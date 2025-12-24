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
 * Input schema for create_ui_dropdown tool
 */
const CreateUIDropdownToolArgsSchema = z.object({
    dropdownName: z.string().optional().default('Dropdown').describe('Name for the Dropdown GameObject. Default: "Dropdown"'),
    position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
    posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
    posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
    width: z.number().optional().default(160).describe('Width of the dropdown. Default: 160'),
    height: z.number().optional().default(30).describe('Height of the dropdown. Default: 30'),
    options: z.array(z.string()).optional().describe('Array of dropdown options. Example: ["Option 1", "Option 2", "Option 3"]')
});
/**
 * CreateUIDropdown Tool
 * Creates a UI Dropdown
 */
let CreateUIDropdownTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_ui_dropdown',
            description: 'Creates a UI Dropdown',
            category: 'ui',
            version: '1.0.0'
        }), Tags(['unity', 'ui', 'dropdown'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreateUIDropdownTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateUIDropdownTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'create_ui_dropdown';
        }
        get description() {
            return 'Creates a UI Dropdown';
        }
        get inputSchema() {
            return CreateUIDropdownToolArgsSchema;
        }
        get category() {
            return 'ui';
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
    return CreateUIDropdownTool = _classThis;
})();
export { CreateUIDropdownTool };
