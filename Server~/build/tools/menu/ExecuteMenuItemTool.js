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
import { McpUnityError, ErrorType } from '../../utils/errors.js';
/**
 * Tool for executing Unity Editor menu items
 *
 * Uses Unity's EditorApplication.ExecuteMenuItem API to invoke menu items by path.
 *
 * @see https://docs.unity3d.com/ScriptReference/EditorApplication.ExecuteMenuItem.html
 *
 * @example
 * // Create a cube
 * { menuPath: "GameObject/3D Object/Cube" }
 *
 * @example
 * // Create empty GameObject
 * { menuPath: "GameObject/Create Empty" }
 *
 * @category menu
 */
let ExecuteMenuItemTool = (() => {
    let _classDecorators = [Tool({
            name: 'execute_menu_item',
            description: 'Executes a Unity menu item by path',
            category: 'menu',
            version: '1.0.0'
        }), Tags(['unity', 'editor', 'menu'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var ExecuteMenuItemTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ExecuteMenuItemTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'execute_menu_item';
        }
        get description() {
            return 'Executes a Unity menu item by path';
        }
        get category() {
            return 'menu';
        }
        get inputSchema() {
            return z.object({
                menuPath: z.string().describe('The path to the menu item to execute (e.g. "GameObject/Create Empty")')
            });
        }
        /**
         * Custom execution logic with enhanced error handling
         * Preserves the original behavior from the legacy implementation
         */
        async execute(args) {
            try {
                // Validate arguments
                const validatedArgs = this.inputSchema.parse(args);
                const { menuPath } = validatedArgs;
                this.logger.debug(`Executing menu item: ${menuPath}`);
                // Send request to Unity
                const response = await this.mcpUnity.sendRequest({
                    method: this.name,
                    params: { menuPath }
                });
                // Check if execution was successful
                if (!response.success) {
                    throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || `Failed to execute menu item: ${menuPath}`);
                }
                // Return formatted response
                return {
                    content: [{
                            type: response.type || 'text',
                            text: response.message || `Successfully executed menu item: ${menuPath}`
                        }]
                };
            }
            catch (error) {
                this.logger.error(`Error in ${this.name}:`, error);
                // Preserve error type if it's already a McpUnityError
                if (error instanceof McpUnityError) {
                    throw error;
                }
                return this.formatErrorResponse(error);
            }
        }
    };
    return ExecuteMenuItemTool = _classThis;
})();
export { ExecuteMenuItemTool };
