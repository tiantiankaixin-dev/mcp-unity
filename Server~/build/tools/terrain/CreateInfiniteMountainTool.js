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
 * Input schema for create_infinite_mountain tool
 */
const CreateInfiniteMountainToolArgsSchema = z.object({
    terrainName: z.string().optional().default('InfiniteMountain')
        .describe('Name for the terrain manager GameObject. Default: "InfiniteMountain"'),
    chunkSize: z.number().int().optional().default(256)
        .describe('Size of each terrain chunk in units. Default: 256'),
    terrainHeight: z.number().optional().default(300)
        .describe('Maximum height of mountains. Default: 300'),
    viewDistance: z.number().int().optional().default(2)
        .describe('View distance in chunks (how many chunks to load around the viewer). Default: 2'),
    mountainScale: z.number().optional().default(0.005)
        .describe('Scale of main mountain features (smaller = larger mountains). Default: 0.005'),
    detailScale: z.number().optional().default(0.02)
        .describe('Scale of detail noise. Default: 0.02'),
    ridgeIntensity: z.number().optional().default(0.3)
        .describe('Intensity of mountain ridges (0-1). Default: 0.3'),
    seed: z.number().int().optional()
        .describe('Random seed for terrain generation. Random if not specified.'),
    position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
    posX: z.number().optional().default(0)
        .describe('X position of terrain manager. Default: 0'),
    posY: z.number().optional().default(0)
        .describe('Y position of terrain manager. Default: 0'),
    posZ: z.number().optional().default(0)
        .describe('Z position of terrain manager. Default: 0'),
    createViewer: z.boolean().optional().default(true)
        .describe('Whether to create a viewer camera with fly controls. Default: true')
});
/**
 * CreateInfiniteMountain Tool
 * Creates an infinite procedural mountain terrain that generates dynamically as the player moves.
 */
let CreateInfiniteMountainTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_infinite_mountain',
            description: 'Create an infinite procedural mountain terrain that generates dynamically. Features rocky mountain landscapes with realistic textures. Terrain chunks load/unload based on viewer position.',
            category: 'terrain',
            version: '1.0.0'
        }), Tags(['unity', 'terrain', 'mountain', 'procedural', 'infinite', 'landscape', 'generation'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreateInfiniteMountainTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateInfiniteMountainTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'create_infinite_mountain';
        }
        get description() {
            return 'Create an infinite procedural mountain terrain that generates dynamically. Features rocky mountain landscapes with realistic textures. Terrain chunks load/unload based on viewer position.';
        }
        get inputSchema() {
            return CreateInfiniteMountainToolArgsSchema;
        }
        get category() {
            return 'terrain';
        }
        formatSuccessResponse(result) {
            const content = [];
            let message = `✅ ${result.message || 'Infinite mountain terrain created successfully'}`;
            if (result.settings) {
                message += `\n\n📊 Settings:`;
                message += `\n  • Chunk Size: ${result.settings.chunkSize}`;
                message += `\n  • Terrain Height: ${result.settings.terrainHeight}`;
                message += `\n  • View Distance: ${result.settings.viewDistance} chunks`;
                message += `\n  • Mountain Scale: ${result.settings.mountainScale}`;
                message += `\n  • Seed: ${result.settings.seed}`;
            }
            if (result.hint) {
                message += `\n\n💡 ${result.hint}`;
            }
            content.push({
                type: 'text',
                text: message
            });
            return { content };
        }
    };
    return CreateInfiniteMountainTool = _classThis;
})();
export { CreateInfiniteMountainTool };
