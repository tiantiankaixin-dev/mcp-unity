import { Logger } from './logger.js';
/**
 * Tracks resource access and tool usage to enforce hierarchical workflow
 */
export declare class UsageTracker {
    private static instance;
    private resourceAccess;
    private resourceAccessTimestamps;
    private toolUsage;
    private sessionStartTime;
    private lastActivityTime;
    private firstWorkflowWarningShown;
    private logger?;
    private static readonly SESSION_TIMEOUT_MS;
    private static readonly RESOURCE_VALIDITY_MS;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(logger?: Logger): UsageTracker;
    /**
     * Reset the tracker (useful for new conversations)
     */
    static reset(): void;
    /**
     * Check if session has timed out and reset if needed
     */
    private checkAndResetIfTimeout;
    /**
     * Record that a resource was accessed
     */
    recordResourceAccess(resourceUri: string): void;
    /**
     * Record that a tool was used
     */
    recordToolUsage(toolName: string): void;
    /**
     * Check if the hierarchical workflow was followed
     * Returns { allowed: boolean, warning?: string }
     */
    checkHierarchicalWorkflow(toolName: string): {
        allowed: boolean;
        warning?: string;
    };
    /**
     * Get statistics about current session
     */
    getStatistics(): {
        sessionDuration: number;
        resourcesAccessed: number;
        resourceList: string[];
        toolsUsed: number;
        totalToolCalls: number;
        toolUsageBreakdown: {
            [k: string]: number;
        };
        hierarchicalWorkflowFollowed: boolean;
    };
    /**
     * Check if session start prompt was accessed
     */
    hasAccessedSessionStart(): boolean;
    /**
     * Record prompt access
     */
    recordPromptAccess(promptName: string): void;
    /**
     * Suggest a category based on the tool name
     */
    private suggestCategoryForTool;
}
