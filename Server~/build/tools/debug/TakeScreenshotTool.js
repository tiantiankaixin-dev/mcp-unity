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
const TakeScreenshotToolArgsSchema = z.object({
    source: z.enum(['scene', 'game']).optional().default('scene').describe('Source: "scene" for Scene View, "game" for Game View (requires Play mode). Default: "scene"'),
    width: z.number().int().min(100).max(4096).optional().default(800).describe('Screenshot width. Default: 800'),
    height: z.number().int().min(100).max(4096).optional().default(600).describe('Screenshot height. Default: 600'),
    saveToFile: z.boolean().optional().default(true).describe('Save to file for AI to read. Default: true'),
    folder: z.string().optional().default('Assets/Screenshots').describe('Folder to save screenshot'),
    filename: z.string().optional().describe('Filename. Auto-generated if not provided.')
});
let TakeScreenshotTool = (() => {
    let _classDecorators = [Tool({
            name: 'take_screenshot',
            description: 'Take a screenshot and return as image for AI to view.',
            category: 'debug',
            version: '1.0.0'
        }), Tags(['unity', 'debug', 'screenshot', 'capture', 'image', 'view'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var TakeScreenshotTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TakeScreenshotTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'take_screenshot'; }
        get description() { return 'Take a screenshot from Scene View or Game View and return as image data for AI to view.'; }
        get inputSchema() { return TakeScreenshotToolArgsSchema; }
        get category() { return 'debug'; }
        formatSuccessResponse(result) {
            const content = [];
            // Add text message with path info for AI to read the file
            let message = `✅ ${result.message || 'Screenshot captured'} (${result.width}x${result.height})`;
            if (result.absolutePath) {
                message += `\n📁 File: ${result.absolutePath}`;
                message += `\n💡 Use read_file tool to view the screenshot.`;
            }
            content.push({
                type: 'text',
                text: message
            });
            // Add image if base64 data is available (when not saved to file)
            if (result.imageBase64) {
                content.push({
                    type: 'image',
                    data: result.imageBase64,
                    mimeType: result.mimeType || 'image/png'
                });
            }
            return { content };
        }
    };
    return TakeScreenshotTool = _classThis;
})();
export { TakeScreenshotTool };
