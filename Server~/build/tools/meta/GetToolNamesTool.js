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
let GetToolNamesTool = (() => {
    let _classDecorators = [Tool({
            name: 'get_tool_names',
            description: '📋 STEP 2: Get tool names and descriptions. Supports multiple categories in one call. 📖 unity_tool_discovery',
            category: 'meta',
            version: '1.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = DataTool;
    var GetToolNamesTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            GetToolNamesTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'get_tool_names'; }
        get description() { return '📋 STEP 2: Get tool names and descriptions. Supports multiple categories in one call. 📖 unity_tool_discovery'; }
        get inputSchema() {
            return z.object({
                category: z.string().optional().describe('Single category name'),
                categories: z.array(z.string()).optional().describe('Multiple categories array, e.g., ["gameobject", "component", "material"]')
            });
        }
        get category() { return 'meta'; }
        async execute(args) {
            const allCategories = ToolRegistry.getCategories();
            // Support both single category and multiple categories
            let requestedCategories = [];
            if (args.categories && args.categories.length > 0) {
                requestedCategories = args.categories;
            }
            else if (args.category) {
                requestedCategories = [args.category.trim()];
            }
            else {
                return this.formatSuccessResponse({
                    error: true,
                    message: 'Provide category or categories',
                    availableCategories: allCategories
                });
            }
            const results = {};
            const invalidCategories = [];
            for (const category of requestedCategories) {
                const cat = category.trim();
                if (!allCategories.includes(cat)) {
                    invalidCategories.push(cat);
                    continue;
                }
                const toolClasses = ToolRegistry.getToolsByCategory(cat);
                results[cat] = toolClasses.map((ToolClass) => {
                    try {
                        const instance = new ToolClass(this.server, this.mcpUnity, this.logger);
                        const metadata = instance.getMetadata?.() || {};
                        return {
                            name: metadata.name || instance.name || 'unknown',
                            desc: metadata.description || instance.description || ''
                        };
                    }
                    catch (err) {
                        return { name: 'unknown', desc: '' };
                    }
                });
            }
            const response = {
                _next: "get_tool_schemas([tools]) or discover_and_use_batch",
                ...results
            };
            if (invalidCategories.length > 0) {
                response._invalid = invalidCategories;
            }
            return this.formatSuccessResponse(response);
        }
    };
    return GetToolNamesTool = _classThis;
})();
export { GetToolNamesTool };
