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
import { DataTool } from '../base/BaseTool.js';
import { Tool } from '../base/ToolDecorators.js';
import { ToolRegistry } from '../base/ToolRegistry.js';
import { zodToReadableSchema } from '../../utils/zodToJsonSchema.js';
let GetToolSchemasTool = (() => {
    let _classDecorators = [Tool({
            name: 'get_tool_schemas',
            description: '📋 Get detailed parameter schemas for tools. Use after get_tool_names to get full definitions.',
            category: 'meta',
            version: '1.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = DataTool;
    var GetToolSchemasTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GetToolSchemasTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'get_tool_schemas'; }
        get description() { return '📋 Get detailed parameter schemas for tools. Use after get_tool_names to get full definitions.'; }
        get inputSchema() {
            return z.object({
                tools: z.array(z.string()).describe('Tool names to get schemas for, e.g., ["create_primitive_object", "update_component"]')
            });
        }
        get category() { return 'meta'; }
        async execute(args) {
            if (!args.tools || args.tools.length === 0) {
                return this.formatSuccessResponse({
                    error: true,
                    message: 'Provide tools array'
                });
            }
            // Build tool name to class map
            const toolMap = new Map();
            for (const cat of ToolRegistry.getCategories()) {
                for (const ToolClass of ToolRegistry.getToolsByCategory(cat)) {
                    try {
                        const instance = new ToolClass(this.server, this.mcpUnity, this.logger);
                        const name = instance.name || instance.getMetadata?.()?.name;
                        if (name)
                            toolMap.set(name, ToolClass);
                    }
                    catch (e) { }
                }
            }
            const results = {};
            const notFound = [];
            for (const toolName of args.tools) {
                const name = toolName.trim();
                const ToolClass = toolMap.get(name);
                if (!ToolClass) {
                    notFound.push(name);
                    continue;
                }
                try {
                    const instance = new ToolClass(this.server, this.mcpUnity, this.logger);
                    let parameters = {};
                    try {
                        const inputSchema = instance.inputSchema;
                        if (inputSchema) {
                            parameters = zodToReadableSchema(inputSchema);
                        }
                    }
                    catch (e) { }
                    results[name] = parameters;
                }
                catch (err) {
                    results[name] = { error: 'Failed to load' };
                }
            }
            const response = {
                _next: "discover_and_use_batch (one call, all tools)",
                schemas: results
            };
            if (notFound.length > 0) {
                response._notFound = notFound;
            }
            return this.formatSuccessResponse(response);
        }
    };
    return GetToolSchemasTool = _classThis;
})();
export { GetToolSchemasTool };
