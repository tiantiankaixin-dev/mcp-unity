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
import { GameObjectCreationTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
/**
 * Input schema for create_ui_button tool
 */
const CreateUIButtonToolArgsSchema = z.object({
    buttonText: z
        .string()
        .optional()
        .default('Button')
        .describe('Text to display on the button. Default: "Button"'),
    position: z.array(z.number()).length(2).optional().describe('Position as [x, y] in canvas space. Fallback to posX/posY if not provided'),
    posX: z
        .number()
        .optional()
        .default(0)
        .describe('X position in canvas space. Default: 0'),
    posY: z
        .number()
        .optional()
        .default(0)
        .describe('Y position in canvas space. Default: 0'),
    width: z
        .number()
        .optional()
        .default(160)
        .describe('Width of the button. Default: 160'),
    height: z
        .number()
        .optional()
        .default(30)
        .describe('Height of the button. Default: 30'),
    parentInstanceId: z
        .number()
        .int()
        .optional()
        .default(0)
        .describe('Instance ID of parent Canvas GameObject. If 0, will find or create Canvas. Default: 0')
});
/**
 * CreateUIButton Tool
 * Creates a UI Button
 */
let CreateUIButtonTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_ui_button',
            description: 'Creates a UI Button',
            category: 'ui',
            version: '1.0.0'
        }), Tags(['unity', 'ui', 'button'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = GameObjectCreationTool;
    var CreateUIButtonTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateUIButtonTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'create_ui_button';
        }
        get description() {
            return 'Creates a UI Button';
        }
        get inputSchema() {
            return CreateUIButtonToolArgsSchema;
        }
        get category() {
            return 'ui';
        }
    };
    return CreateUIButtonTool = _classThis;
})();
export { CreateUIButtonTool };
