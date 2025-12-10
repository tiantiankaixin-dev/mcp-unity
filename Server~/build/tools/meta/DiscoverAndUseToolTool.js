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
/**
 * Input schema for discover_and_use_tool
 */
const DiscoverAndUseToolArgsSchema = z.object({
    toolName: z
        .string()
        .describe('Name of the Unity tool to execute. Query available tools via unity://tool-names/{category} resources first.'),
    params: z
        .record(z.any())
        .describe('Parameters to pass to the tool. Schema varies by tool - check resource documentation.')
});
/**
 * DiscoverAndUseTool - Execute Unity tools on-demand without MCP registration
 *
 * **Zero-Registration Architecture**:
 * This is the ONLY tool registered in MCP at startup (along with batch variant).
 * It acts as a proxy to execute any Unity tool without requiring that tool
 * to be registered in the MCP tool list.
 *
 * **How it works**:
 * 1. AI queries resources: unity://tool-names/gameobject
 * 2. AI learns available tools: create_primitive_object, add_rigidbody, etc.
 * 3. AI calls: discover_and_use_tool({ toolName: "create_primitive_object", params: {...} })
 * 4. This tool directly calls Unity Bridge via DynamicToolManager
 * 5. Result returned immediately without MCP tool registration overhead
 *
 * **Token Optimization**:
 * - Traditional: 100 tools registered = ~10,000 tokens/conversation
 * - Zero-registration: 2 tools registered = ~200 tokens/conversation
 * - Savings: 98%
 *
 * **Workflow**:
 * ```
 * // Step 1: Discover available tools
 * read_resource('unity://tool-names/gameobject')
 *
 * // Step 2: Execute tool on-demand
 * discover_and_use_tool({
 *   toolName: "create_primitive_object",
 *   params: { primitiveType: "cube", posX: 0, posY: 1, posZ: 0 }
 * })
 * ```
 */
let DiscoverAndUseToolTool = (() => {
    let _classDecorators = [Tool({
            name: 'discover_and_use_tool',
            description: '⚠️ SINGLE TOOL ONLY! Use discover_and_use_batch for 2+ operations. 🔴 MUST READ FIRST: Use read_resource("unity://tool-names/{category}") to get exact tool names before calling. DO NOT guess tool names! 📖 unity_tool_discovery 📖 unity_tool_discovery',
            category: 'meta',
            version: '1.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var DiscoverAndUseToolTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DiscoverAndUseToolTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'discover_and_use_tool';
        }
        get description() {
            return '⚠️ SINGLE TOOL ONLY! Use discover_and_use_batch for 2+ operations. 🔴 MUST READ FIRST: Use read_resource("unity://tool-names/{category}") to get exact tool names before calling. DO NOT guess tool names! 📖 unity_tool_discovery 📖 unity_tool_discovery';
        }
        get inputSchema() {
            return DiscoverAndUseToolArgsSchema;
        }
        get category() {
            return 'meta';
        }
        /**
         * Execute tool via DynamicToolManager
         */
        async execute(args) {
            const { toolName, params } = args;
            try {
                this.logger.info(`[Zero-Registration] Executing tool: ${toolName}`);
                // Get DynamicToolManager instance
                const manager = DynamicToolManager.getInstance(this.server, this.mcpUnity, this.logger);
                // Execute tool directly without MCP registration
                const result = await manager.discoverAndUseTool(toolName, params);
                this.logger.info(`[Zero-Registration] Tool '${toolName}' executed successfully`);
                // Add batch reminder to successful results
                if (result.content && result.content.length > 0 && result.content[0].type === 'text') {
                    result.content[0].text += '\n\n💡 Tip: Need more tools? Query unity://tool-names/{category} for related tools, or unity://tool-categories for all categories.';
                    result.content[0].text += '\n⚡ For multiple operations, use discover_and_use_batch for better efficiency!';
                }
                return result;
            }
            catch (error) {
                this.logger.error(`[Zero-Registration] Failed to execute '${toolName}':`, error);
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Failed to execute tool '${toolName}': ${error.message}\n\n` +
                                `💡 Tips:\n` +
                                `- Query available tools: read_resource('unity://tool-names/{category}')\n` +
                                `- Check tool name spelling\n` +
                                `- Verify Unity Editor is running and connected`
                        }],
                    isError: true
                };
            }
        }
    };
    return DiscoverAndUseToolTool = _classThis;
})();
export { DiscoverAndUseToolTool };
