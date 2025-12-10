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
import { ParamResolver } from '../../utils/paramResolver.js';
/**
 * Single tool call specification
 * Supports both static params and dynamic params_mapping for chaining
 */
const ToolCallSchema = z.object({
    toolName: z.string().describe('Name of the Unity tool to execute'),
    params: z.record(z.any()).optional().describe('Static parameters for this tool'),
    params_mapping: z.record(z.any()).optional().describe('Dynamic parameters with JSONPath references to previous results. Use $.{index}.fieldName (e.g., $.0.instanceId refers to first tool result)')
});
/**
 * Input schema for discover_and_use_batch
 */
const DiscoverAndUseBatchArgsSchema = z.object({
    tools: z
        .array(ToolCallSchema)
        .min(1)
        .max(20)
        .describe('Array of tools to execute in sequence (max 20). Use params_mapping with $.{index}.field to chain outputs.')
});
/**
 * DiscoverAndUseBatchTool - Execute multiple Unity tools in sequence with parameter chaining
 *
 * **Chained Execution**:
 * Execute multiple Unity tools where later tools can reference outputs from earlier tools.
 * Use `params_mapping` with JSONPath syntax `$.{index}.fieldName` to chain results.
 *
 * **Parameter Chaining**:
 * - `$.0.instanceId` - Get instanceId from first tool's result
 * - `$.1.results[0].path` - Get first path from second tool's results array
 * - Static values can be mixed with mappings in params_mapping
 *
 * **Example - Create red cube with physics**:
 * ```
 * discover_and_use_batch({
 *   tools: [
 *     {
 *       toolName: "create_primitive_object",
 *       params: { primitiveType: "cube", objectName: "Player", posY: 1 }
 *     },
 *     {
 *       toolName: "change_material_color",
 *       params_mapping: {
 *         instanceId: "$.0.instanceId",  // Chain from first tool
 *         colorR: 1.0, colorG: 0, colorB: 0
 *       }
 *     },
 *     {
 *       toolName: "add_rigidbody",
 *       params_mapping: {
 *         instanceId: "$.0.instanceId",  // Chain from first tool
 *         mass: 2.0
 *       }
 *     }
 *   ]
 * })
 * ```
 *
 * **Error Handling**:
 * Stops on first error, returns completed results + error info.
 */
let DiscoverAndUseBatchTool = (() => {
    let _classDecorators = [Tool({
            name: 'discover_and_use_batch',
            description: '🚀 PREFERRED! Execute multiple Unity tools in ONE call. Chain with $.{index}.field. 🔴 MUST READ FIRST: Use read_resource("unity://tool-names/{category}") to get exact tool names before calling. DO NOT guess tool names! 📖 unity_tool_discovery 📖 unity_tool_discovery',
            category: 'meta',
            version: '2.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var DiscoverAndUseBatchTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DiscoverAndUseBatchTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'discover_and_use_batch';
        }
        get description() {
            return '🚀 PREFERRED! Execute multiple Unity tools in ONE call. Chain with $.{index}.field. 🔴 MUST READ FIRST: Use read_resource("unity://tool-names/{category}") to get exact tool names before calling. DO NOT guess tool names! 📖 unity_tool_discovery 📖 unity_tool_discovery';
        }
        get inputSchema() {
            return DiscoverAndUseBatchArgsSchema;
        }
        get category() {
            return 'meta';
        }
        /**
         * Execute multiple tools sequentially with parameter chaining
         */
        async execute(args) {
            const { tools } = args;
            this.logger.info(`[Chain] Starting batch execution: ${tools.length} tools`);
            const manager = DynamicToolManager.getInstance(this.server, this.mcpUnity, this.logger);
            // Store raw results for chaining (indexed by position)
            const rawResults = {};
            const results = [];
            let successCount = 0;
            let failureCount = 0;
            for (let i = 0; i < tools.length; i++) {
                const { toolName, params, params_mapping } = tools[i];
                try {
                    this.logger.info(`[Chain ${i + 1}/${tools.length}] Executing: ${toolName}`);
                    // Resolve parameters: merge static params with mapped params
                    let finalParams = { ...(params || {}) };
                    if (params_mapping) {
                        // Convert numeric index references to match our context format
                        // $.0.field -> context key "0"
                        const mappedParams = ParamResolver.resolve(params_mapping, rawResults);
                        finalParams = { ...finalParams, ...mappedParams };
                        this.logger.debug(`[Chain] Resolved params for ${toolName}:`, finalParams);
                    }
                    // Execute tool and get raw result
                    const rawResult = await manager.discoverAndUseToolRaw(toolName, finalParams);
                    // Store raw result for subsequent tools to reference
                    rawResults[String(i)] = rawResult;
                    results.push({
                        index: i,
                        toolName,
                        success: true,
                        result: rawResult
                    });
                    successCount++;
                    this.logger.info(`[Chain ${i + 1}/${tools.length}] Success: ${toolName}`);
                }
                catch (error) {
                    this.logger.error(`[Chain ${i + 1}/${tools.length}] Failed: ${toolName}`, error);
                    let errorMessage = error?.message || String(error);
                    // Add helpful hints for common errors
                    if (errorMessage.includes('GameObject required') || errorMessage.includes('instanceIds')) {
                        errorMessage += '\n💡 Hint: instanceIds requires ARRAY format: ["$.0.instanceId"] not "$.0.instanceId"';
                    }
                    results.push({
                        index: i,
                        toolName,
                        success: false,
                        error: errorMessage
                    });
                    failureCount++;
                    // Stop on first error
                    this.logger.info(`[Chain] Stopping due to error at step ${i + 1}`);
                    break;
                }
            }
            // Format response
            const statusIcon = failureCount === 0 ? '✅' : '❌';
            const summary = `${statusIcon} Chain execution: ${successCount}/${tools.length} completed`;
            let detailsText = '\n\n**Step Results:**\n';
            for (const result of results) {
                const status = result.success ? '✓' : '✗';
                detailsText += `${result.index + 1}. [${status}] ${result.toolName}`;
                if (result.success) {
                    // Show key fields from result
                    const keyInfo = this.extractKeyInfo(result.result);
                    if (keyInfo) {
                        detailsText += ` → ${keyInfo}`;
                    }
                }
                else {
                    detailsText += ` → ERROR: ${result.error}`;
                }
                detailsText += '\n';
            }
            // Add raw results for transparency
            detailsText += '\n**Raw Results (for chaining reference):**\n```json\n';
            detailsText += JSON.stringify(rawResults, null, 2);
            detailsText += '\n```';
            this.logger.info(`[Chain] Complete: ${successCount}/${tools.length} succeeded`);
            return {
                content: [{
                        type: 'text',
                        text: summary + detailsText
                    }],
                isError: failureCount > 0
            };
        }
        /**
         * Extract key information from result for summary display
         */
        extractKeyInfo(result) {
            if (!result)
                return null;
            const parts = [];
            if (result.instanceId)
                parts.push(`instanceId=${result.instanceId}`);
            if (result.objectName)
                parts.push(`name="${result.objectName}"`);
            if (result.success !== undefined)
                parts.push(result.success ? 'OK' : 'FAIL');
            if (result.message && parts.length === 0)
                parts.push(result.message.substring(0, 50));
            return parts.length > 0 ? parts.join(', ') : null;
        }
    };
    return DiscoverAndUseBatchTool = _classThis;
})();
export { DiscoverAndUseBatchTool };
