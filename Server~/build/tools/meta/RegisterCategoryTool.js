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
import { Tool } from '../base/ToolDecorators.js';
import { DynamicToolManager } from '../base/DynamicToolManager.js';
import { ToolRegistry } from '../base/ToolRegistry.js';
const RegisterCategoryToolArgsSchema = z.object({
    category: z
        .string()
        .describe('Category name to register (e.g., gameobject, material, component). After registration, tools can be called directly without discover_and_use_tool.')
});
/**
 * RegisterCategoryTool - Register all tools in a category to MCP
 *
 * After registration, AI can call tools directly (e.g., create_primitive_object)
 * instead of using discover_and_use_tool({ toolName, params }).
 */
let RegisterCategoryTool = (() => {
    let _classDecorators = [Tool({
            name: 'register_category',
            description: 'Register tools in a category to MCP. After this, call tools directly (no discover_and_use_tool needed). Use for complex tasks.',
            category: 'meta',
            version: '1.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var RegisterCategoryTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            RegisterCategoryTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'register_category'; }
        get description() { return 'Register tools in a category to MCP. After this, call tools directly (no discover_and_use_tool needed). Use for complex tasks.'; }
        get inputSchema() { return RegisterCategoryToolArgsSchema; }
        get category() { return 'meta'; }
        async execute(args) {
            const { category } = args;
            // Validate category exists
            const allCategories = ToolRegistry.getCategories();
            if (!allCategories.includes(category)) {
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Category '${category}' not found.\n\nAvailable categories: ${allCategories.join(', ')}`
                        }],
                    isError: true
                };
            }
            try {
                const manager = DynamicToolManager.getInstance(this.server, this.mcpUnity, this.logger);
                const result = await manager.registerCategory(category);
                if (!result.success) {
                    return {
                        content: [{
                                type: 'text',
                                text: `❌ ${result.message}`
                            }],
                        isError: true
                    };
                }
                // Build response with registered tool names
                let responseText = `✅ ${result.message}\n\n`;
                if (result.toolsRegistered.length > 0) {
                    responseText += `**Newly registered tools (call directly):**\n`;
                    for (const tool of result.toolsRegistered) {
                        responseText += `• ${tool}\n`;
                    }
                }
                if (result.toolsAlreadyRegistered.length > 0) {
                    responseText += `\n**Already registered:**\n`;
                    for (const tool of result.toolsAlreadyRegistered) {
                        responseText += `• ${tool}\n`;
                    }
                }
                responseText += `\n💡 Now call these tools directly, e.g.: create_primitive_object({ primitiveType: "sphere" })`;
                return {
                    content: [{
                            type: 'text',
                            text: responseText
                        }]
                };
            }
            catch (error) {
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Error: ${error?.message || String(error)}`
                        }],
                    isError: true
                };
            }
        }
    };
    return RegisterCategoryTool = _classThis;
})();
export { RegisterCategoryTool };
