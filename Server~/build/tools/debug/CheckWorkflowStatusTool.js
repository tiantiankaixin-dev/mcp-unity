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
import { Tool, Tags, ServerOnly } from '../base/ToolDecorators.js';
import { UsageTracker } from '../../utils/UsageTracker.js';
/**
 * Tool to check the current workflow status and resource access history
 * Useful for debugging workflow validation issues
 *
 * This is a server-only tool - it does not require Unity connection
 * and executes entirely on the MCP server.
 */
let CheckWorkflowStatusTool = (() => {
    let _classDecorators = [ServerOnly(), Tool({
            name: 'check_workflow_status',
            description: 'Check the current workflow status, resource access history, and tool usage statistics',
            category: 'debug',
            version: '1.0.0'
        }), Tags(['unity', 'debug', 'workflow', 'status'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CheckWorkflowStatusTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CheckWorkflowStatusTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'check_workflow_status';
        }
        get description() {
            return 'Check the current workflow status, resource access history, and tool usage statistics. Useful for debugging workflow validation issues.';
        }
        get category() {
            return 'debug';
        }
        get inputSchema() {
            return z.object({
                includeTimestamps: z.boolean().optional().default(false).describe('Include detailed timestamp information'),
            });
        }
        async execute(args) {
            const tracker = UsageTracker.getInstance(this.logger);
            const stats = tracker.getStatistics();
            const { includeTimestamps } = args;
            // Build a detailed status report
            let report = '📊 Workflow Status Report\n\n';
            report += `**Session Info:**\n`;
            report += `- Duration: ${Math.floor(stats.sessionDuration / 1000)}s\n`;
            report += `- Workflow Followed: ${stats.hierarchicalWorkflowFollowed ? '✅ Yes' : '❌ No'}\n\n`;
            report += `**Resources Accessed (${stats.resourcesAccessed}):**\n`;
            if (stats.resourceList.length > 0) {
                for (const resource of stats.resourceList) {
                    report += `- ${resource}\n`;
                    if (includeTimestamps) {
                        // Note: Would need to expose timestamps from UsageTracker for this
                        report += `  (add timestamp info if needed)\n`;
                    }
                }
            }
            else {
                report += '- None\n';
            }
            report += '\n';
            report += `**Tools Used (${stats.toolsUsed} unique, ${stats.totalToolCalls} total):**\n`;
            if (stats.totalToolCalls > 0) {
                const breakdown = stats.toolUsageBreakdown;
                for (const [tool, count] of Object.entries(breakdown)) {
                    report += `- ${tool}: ${count}x\n`;
                }
            }
            else {
                report += '- None\n';
            }
            report += '\n';
            report += `**Recommendations:**\n`;
            if (!stats.hierarchicalWorkflowFollowed) {
                report += '⚠️ You should access workflow resources before using tools:\n';
                report += '  1. Read \'unity://tool-categories\'\n';
                report += '  2. Read \'unity://tool-names/{category}\' for needed categories\n';
                report += '  3. Then use tools\n';
            }
            else {
                report += '✅ Workflow is being followed correctly!\n';
            }
            return {
                content: [{
                        type: 'text',
                        text: report
                    }]
            };
        }
    };
    return CheckWorkflowStatusTool = _classThis;
})();
export { CheckWorkflowStatusTool };
