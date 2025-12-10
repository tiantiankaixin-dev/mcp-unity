import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { UsageTracker } from '../../utils/UsageTracker.js';
/**
 * Tool to check the current workflow status and resource access history
 * Useful for debugging workflow validation issues
 */
export class CheckWorkflowStatusTool extends BaseTool {
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
}
