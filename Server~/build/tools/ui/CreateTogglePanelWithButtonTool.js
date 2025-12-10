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
 * Input schema for create_toggle_panel_with_button tool
 */
const CreateTogglePanelWithButtonToolArgsSchema = z.object({
    panelName: z.string().optional().default('TogglePanel').describe('Name for the Panel GameObject. Default: "TogglePanel"'),
    buttonText: z.string().optional().default('Toggle Panel').describe('Text to display on the toggle button. Default: "Toggle Panel"'),
    panelPosX: z.number().optional().default(0).describe('X position of panel in canvas space. Default: 0'),
    panelPosY: z.number().optional().default(0).describe('Y position of panel in canvas space. Default: 0'),
    panelWidth: z.number().optional().default(400).describe('Width of the panel. Default: 400'),
    panelHeight: z.number().optional().default(300).describe('Height of the panel. Default: 300'),
    panelColor: z.string().optional().default('#333333D9').describe('Panel color in hex format with alpha. Default: "#333333D9" (dark gray, 85% opacity)'),
    buttonPosX: z.number().optional().default(0).describe('X position of button in canvas space. Default: 0'),
    buttonPosY: z.number().optional().default(200).describe('Y position of button in canvas space. Default: 200'),
    buttonWidth: z.number().optional().default(160).describe('Width of the button. Default: 160'),
    buttonHeight: z.number().optional().default(40).describe('Height of the button. Default: 40'),
    panelInitiallyActive: z.boolean().optional().default(true).describe('Whether the panel should be initially visible. Default: true')
});
/**
 * CreateTogglePanelWithButton Tool
 * Creates a dark gray semi-transparent panel with a button that toggles its visibility
 */
let CreateTogglePanelWithButtonTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_toggle_panel_with_button',
            description: 'Creates a dark gray semi-transparent panel with a button that toggles its visibility',
            category: 'ui',
            version: '1.0.0'
        }), Tags(['unity', 'ui', 'panel', 'button', 'toggle'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreateTogglePanelWithButtonTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateTogglePanelWithButtonTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'create_toggle_panel_with_button';
        }
        get description() {
            return 'Creates a dark gray semi-transparent panel with a button that toggles its visibility';
        }
        get inputSchema() {
            return CreateTogglePanelWithButtonToolArgsSchema;
        }
        get category() {
            return 'ui';
        }
        formatSuccessResponse(result) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${result.message || 'Operation completed successfully'}\n` +
                            `Panel: ${result.panelName} (ID: ${result.panelInstanceId})\n` +
                            `Button: ${result.buttonText} (ID: ${result.buttonInstanceId})\n` +
                            `Click the button to toggle panel visibility.`
                    }]
            };
        }
    };
    return CreateTogglePanelWithButtonTool = _classThis;
})();
export { CreateTogglePanelWithButtonTool };
