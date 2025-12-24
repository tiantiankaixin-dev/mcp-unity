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
const CATEGORY_DESCRIPTIONS = {
    'advanced': 'ProBuilder shapes',
    'animation': 'Animations & timeline',
    'asset': 'Asset management',
    'audio': 'Audio sources',
    'build': 'Project building',
    'camera': 'Cameras',
    'component': 'Component operations',
    'components': 'Add components',
    'debug': 'Debugging tools',
    'gameobject': 'GameObject management',
    'lighting': 'Lighting & baking',
    'material': 'Materials & colors',
    'menu': 'Menu execution',
    'meta': 'Meta tools',
    'physics': 'Physics & colliders',
    'prefab': 'Prefabs',
    'scene': 'Scene management',
    'scripting': 'C# scripts',
    'terrain': 'Terrain',
    'testing': 'Testing',
    'ui': 'UI elements',
    'vfx': 'Visual effects'
};
let ListCategoriesTool = (() => {
    let _classDecorators = [Tool({
            name: 'list_categories',
            description: '📋 STEP 1: List all Unity tool categories. Use this first to explore available tools.',
            category: 'meta',
            version: '1.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = DataTool;
    var ListCategoriesTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ListCategoriesTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'list_categories'; }
        get description() { return '📋 STEP 1: List all Unity tool categories. Use this first to explore available tools.'; }
        get inputSchema() { return z.object({}); }
        get category() { return 'meta'; }
        async execute() {
            const categories = ToolRegistry.getCategories();
            const categorySummary = {};
            let totalToolCount = 0;
            for (const cat of categories) {
                const toolClasses = ToolRegistry.getToolsByCategory(cat);
                if (!toolClasses || toolClasses.length === 0)
                    continue;
                categorySummary[cat] = {
                    description: CATEGORY_DESCRIPTIONS[cat] || 'Tools',
                    toolCount: toolClasses.length,
                };
                totalToolCount += toolClasses.length;
            }
            const response = {
                _next: "get_tool_names({category}) - call multiple if needed, then plan before execute",
                totalToolCount,
                categoryCount: Object.keys(categorySummary).length,
                categories: categorySummary,
            };
            return this.formatSuccessResponse(response);
        }
    };
    return ListCategoriesTool = _classThis;
})();
export { ListCategoriesTool };
