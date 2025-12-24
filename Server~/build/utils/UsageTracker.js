/**
 * Tracks resource access and tool usage to enforce hierarchical workflow
 */
export class UsageTracker {
    static instance = null;
    resourceAccess = new Set();
    resourceAccessTimestamps = new Map(); // Track when resources were accessed
    toolUsage = new Map();
    sessionStartTime = Date.now();
    lastActivityTime = Date.now();
    firstWorkflowWarningShown = false; // Track if we've shown the workflow warning in this session
    logger;
    // Session timeout: 1 minute of inactivity = new session (防止跨会话共享)
    static SESSION_TIMEOUT_MS = 60 * 1000;
    // Resource validity window: resources accessed within this time are considered valid
    // 1 minute window - balance between batch operations and cross-session isolation
    static RESOURCE_VALIDITY_MS = 60 * 1000; // 1 minute
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Get the singleton instance
     */
    static getInstance(logger) {
        if (!UsageTracker.instance) {
            UsageTracker.instance = new UsageTracker(logger);
            if (logger) {
                logger.info('UsageTracker singleton created');
            }
        }
        // Update logger if provided and different
        if (logger && UsageTracker.instance.logger !== logger) {
            UsageTracker.instance.logger = logger;
        }
        // Check for session timeout and auto-reset if needed
        UsageTracker.instance.checkAndResetIfTimeout();
        return UsageTracker.instance;
    }
    /**
     * Reset the tracker (useful for new conversations)
     */
    static reset() {
        if (UsageTracker.instance) {
            UsageTracker.instance.resourceAccess.clear();
            UsageTracker.instance.resourceAccessTimestamps.clear();
            UsageTracker.instance.toolUsage.clear();
            UsageTracker.instance.sessionStartTime = Date.now();
            UsageTracker.instance.lastActivityTime = Date.now();
            UsageTracker.instance.firstWorkflowWarningShown = false;
            UsageTracker.instance.logger?.info('UsageTracker reset for new session');
        }
    }
    /**
     * Check if session has timed out and reset if needed
     */
    checkAndResetIfTimeout() {
        const now = Date.now();
        const inactiveTime = now - this.lastActivityTime;
        if (inactiveTime > UsageTracker.SESSION_TIMEOUT_MS) {
            this.logger?.info(`Session timeout detected (${Math.round(inactiveTime / 1000)}s inactive). Resetting UsageTracker.`);
            this.resourceAccess.clear();
            this.resourceAccessTimestamps.clear();
            this.toolUsage.clear();
            this.sessionStartTime = now;
            this.lastActivityTime = now;
            this.firstWorkflowWarningShown = false;
        }
    }
    /**
     * Record that a resource was accessed
     */
    recordResourceAccess(resourceUri) {
        const now = Date.now();
        this.lastActivityTime = now;
        this.resourceAccess.add(resourceUri);
        this.resourceAccessTimestamps.set(resourceUri, now);
        // Enhanced logging for workflow-critical resources
        if (resourceUri === 'unity://tool-categories' || resourceUri.startsWith('unity://tool-names/') || resourceUri.startsWith('unity://tool/')) {
            this.logger?.info(`✓ Workflow resource accessed: ${resourceUri}`);
        }
        else {
            this.logger?.debug(`Resource accessed: ${resourceUri}`);
        }
    }
    /**
     * Record that a tool was used
     */
    recordToolUsage(toolName) {
        this.lastActivityTime = Date.now();
        const count = this.toolUsage.get(toolName) || 0;
        this.toolUsage.set(toolName, count + 1);
        this.logger?.debug(`Tool used: ${toolName} (${count + 1} times)`);
    }
    /**
     * Check if the hierarchical workflow was followed
     * Returns { allowed: boolean, warning?: string }
     */
    checkHierarchicalWorkflow(toolName) {
        const now = Date.now();
        // ✅ Special handling: meta tools (discover_and_use_batch, discover_and_use_tool) skip workflow check
        // These tools are designed for chained execution and should not be blocked
        const metaTools = ['discover_and_use_batch', 'discover_and_use_tool', 'list_categories', 'get_tool_names', 'get_tool_schemas'];
        if (metaTools.includes(toolName)) {
            this.logger?.debug(`Meta tool '${toolName}' - skipping workflow check`);
            return { allowed: true };
        }
        // Check if tool categories resource was accessed RECENTLY (within validity window)
        const categoriesTimestamp = this.resourceAccessTimestamps.get('unity://tool-categories');
        const hasAccessedCategories = categoriesTimestamp &&
            (now - categoriesTimestamp) < UsageTracker.RESOURCE_VALIDITY_MS;
        // Check if any category resource was accessed RECENTLY
        const hasAccessedCategory = Array.from(this.resourceAccessTimestamps.entries()).some(([uri, timestamp]) => (uri.startsWith('unity://tool-names/') || uri.startsWith('unity://tool/')) &&
            (now - timestamp) < UsageTracker.RESOURCE_VALIDITY_MS);
        // Debug logging for troubleshooting
        if (this.logger) {
            this.logger.debug(`Workflow check for '${toolName}': categories=${hasAccessedCategories}, category=${hasAccessedCategory}`);
            this.logger.debug(`Resources accessed: ${Array.from(this.resourceAccessTimestamps.keys()).join(', ')}`);
            if (categoriesTimestamp) {
                this.logger.debug(`Categories age: ${(now - categoriesTimestamp) / 1000}s`);
            }
        }
        // ✅ Check if ANY resources were EVER accessed in this session (lenient mode)
        // Once resources are accessed, all subsequent calls are allowed
        const hasAccessedAnyWorkflowResource = this.resourceAccess.has('unity://tool-categories') ||
            Array.from(this.resourceAccess).some(uri => uri.startsWith('unity://tool-names/')) ||
            Array.from(this.resourceAccess).some(uri => uri.startsWith('unity://tool/'));
        // ✅ If resources were EVER accessed in this session, allow all subsequent calls
        if (hasAccessedAnyWorkflowResource) {
            // Optional tip if resources are stale (but don't block)
            if (!hasAccessedCategories && !hasAccessedCategory) {
                return {
                    allowed: true,
                    warning: `💡 Tip: Load specific category for better results:\nread_resource('unity://tool-names/{category}')`
                };
            }
            return { allowed: true };
        }
        // If NO workflow resources were EVER accessed, show warning ONLY ONCE per session
        if (!this.firstWorkflowWarningShown) {
            this.firstWorkflowWarningShown = true;
            // Get category suggestion based on tool name
            const categorySuggestion = this.suggestCategoryForTool(toolName);
            return {
                allowed: false, // BLOCK to enforce hierarchical workflow
                warning: `🚫 Load resources first:
read_resource('unity://tool-names/${categorySuggestion}')
Then use discover_and_use_batch for chained execution.`
            };
        }
        else {
            // Still block on subsequent attempts - must load resources at least once
            const categorySuggestion = this.suggestCategoryForTool(toolName);
            this.logger?.warn(`Tool '${toolName}' blocked again - resources still not loaded`);
            return {
                allowed: false,
                warning: `🚫 Still need resources! Load:\nunity://tool-names/${categorySuggestion}`
            };
        }
    }
    /**
     * Get statistics about current session
     */
    getStatistics() {
        return {
            sessionDuration: Date.now() - this.sessionStartTime,
            resourcesAccessed: this.resourceAccess.size,
            resourceList: Array.from(this.resourceAccess),
            toolsUsed: this.toolUsage.size,
            totalToolCalls: Array.from(this.toolUsage.values()).reduce((a, b) => a + b, 0),
            toolUsageBreakdown: Object.fromEntries(this.toolUsage),
            hierarchicalWorkflowFollowed: this.resourceAccess.has('unity://tool-categories') ||
                Array.from(this.resourceAccess).some(uri => uri.startsWith('unity://tool-names/'))
        };
    }
    /**
     * Check if session start prompt was accessed
     */
    hasAccessedSessionStart() {
        // Check if session start prompt was accessed (MCP prompts don't use resources, so we track differently)
        return this.resourceAccess.has('prompt://unity_session_start');
    }
    /**
     * Record prompt access
     */
    recordPromptAccess(promptName) {
        this.resourceAccess.add(`prompt://${promptName}`);
        this.logger?.debug(`Prompt accessed: ${promptName}`);
    }
    /**
     * Suggest a category based on the tool name
     */
    suggestCategoryForTool(toolName) {
        // Tool name patterns to category mapping
        const patterns = [
            [/^create_ui_|^ui_/, 'ui'],
            [/^create_primitive|^create_.*object|^group_|^align_|^distribute_/, 'gameobject'],
            [/^add_rigidbody|^add_collider|^add_force|^add_joint|^configure_rigidbody|^raycast|^overlap/, 'physics'],
            [/^create_material|^apply_material|^change_.*color/, 'material'],
            [/^create_animation|^add_animation|^blend_|^record_animation/, 'animation'],
            [/^create_camera|^cinemachine/, 'camera'],
            [/^create_light|^bake_lighting/, 'lighting'],
            [/^create_audio|^audio/, 'audio'],
            [/^create_scene|^load_scene|^delete_scene|^merge_scene/, 'scene'],
            [/^create_script|^update_script|^validate_script|^refactor_script/, 'scripting'],
            [/^add_component|^update_component|^batch_add/, 'component'],
            [/^create_prefab|^generate_prefab/, 'prefab'],
            [/^import_asset|^batch_import|^find_unused|^optimize/, 'asset'],
            [/^build_|^set_build/, 'build'],
            [/^run_tests|^test_/, 'testing'],
            [/console|^send_console|^get_console/, 'debug'],
        ];
        for (const [pattern, category] of patterns) {
            if (pattern.test(toolName)) {
                return category;
            }
        }
        return 'gameobject'; // Default fallback
    }
}
