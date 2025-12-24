import { ToolRegistry } from './ToolRegistry.js';
import { z } from 'zod';
/**
 * Dynamic Tool Manager
 * Manages runtime tool registration and automatic unloading
 */
export class DynamicToolManager {
    server;
    mcpUnity;
    logger;
    static instance = null;
    // Map of tool name to registered tool info
    registeredTools = new Map();
    // Map of category to tool names in that category
    categoryTools = new Map();
    // Cleanup interval
    cleanupInterval = null;
    // Configuration
    TOOL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    CLEANUP_INTERVAL_MS = 60 * 1000; // Check every 1 minute
    constructor(server, mcpUnity, logger) {
        this.server = server;
        this.mcpUnity = mcpUnity;
        this.logger = logger;
        this.startCleanupTimer();
    }
    /**
     * Get singleton instance
     */
    static getInstance(server, mcpUnity, logger) {
        if (!DynamicToolManager.instance) {
            DynamicToolManager.instance = new DynamicToolManager(server, mcpUnity, logger);
            logger.info('DynamicToolManager initialized with 5-minute auto-unload');
        }
        return DynamicToolManager.instance;
    }
    /**
     * Discover and execute a tool without MCP registration
     * This is the core of zero-registration architecture
     */
    async discoverAndUseTool(toolName, params) {
        this.logger.info(`[Zero-Registration] Direct execution: ${toolName}`);
        const rawParams = params ?? {};
        const finalParams = this.normalizeParams(toolName, rawParams);
        // Verify tool exists in registry
        const ToolClass = ToolRegistry.getTool(toolName);
        if (!ToolClass) {
            throw new Error(`Tool '${toolName}' not found. Use read_resource('unity://tool-names/{category}') to see available tools.`);
        }
        // Prevent recursive/invalid calls: meta tools are MCP-side tools, not Unity Editor methods.
        // They must be called directly as MCP tools, not via the Unity bridge.
        const tempInstance = this.createTempInstance(ToolClass);
        if (tempInstance.category === 'meta') {
            throw new Error(`Tool '${toolName}' is a meta MCP tool and cannot be executed via discover_and_use_tool. ` +
                `Call '${toolName}' directly as an MCP tool instead (do not pass it as toolName).`);
        }
        // Check if this is a server-only tool (doesn't need Unity connection)
        const metadata = ToolClass.metadata;
        if (metadata?.serverOnly === true) {
            this.logger.info(`[Zero-Registration] Tool '${toolName}' is server-only, executing locally`);
            try {
                // Create a real tool instance and execute it locally
                const toolInstance = new ToolClass(this.server, this.mcpUnity, this.logger);
                const result = await toolInstance.execute(finalParams);
                return result;
            }
            catch (error) {
                this.logger.error(`[Zero-Registration] Server-only tool '${toolName}' execution failed:`, error);
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Error: ${error?.message || 'Unknown error'}`
                        }],
                    isError: true
                };
            }
        }
        try {
            // Directly send request to Unity without MCP tool registration
            // This bypasses the MCP layer entirely
            const result = await this.mcpUnity.sendRequest({
                method: toolName,
                params: finalParams
            });
            this.logger.info(`[Zero-Registration] Tool '${toolName}' executed successfully`);
            // Build result - return raw Unity response with workflow reminder
            const resultText = result?.message || (result ? JSON.stringify(result, null, 2) : 'Operation completed');
            const workflowHint = `\n📖 unity_tool_discovery`;
            return {
                content: [{
                        type: 'text',
                        text: resultText + workflowHint
                    }]
            };
        }
        catch (error) {
            this.logger.error(`[Zero-Registration] Tool '${toolName}' execution failed:`, error);
            const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error) || 'Unknown error');
            return {
                content: [{
                        type: 'text',
                        text: `❌ Error: ${errorMessage}\n\n💡 If parameter error, use read_resource('unity://tool/${toolName}') to check correct params.`
                    }],
                isError: true
            };
        }
    }
    /**
     * Discover and execute a tool, returning RAW Unity result (for chaining)
     * Unlike discoverAndUseTool, this returns the actual Unity response object
     * without formatting, making it suitable for parameter chaining between tools.
     */
    async discoverAndUseToolRaw(toolName, params) {
        this.logger.info(`[Chain] Raw execution: ${toolName}`);
        const rawParams = params ?? {};
        const finalParams = this.normalizeParams(toolName, rawParams);
        // Verify tool exists in registry
        const ToolClass = ToolRegistry.getTool(toolName);
        if (!ToolClass) {
            throw new Error(`Tool '${toolName}' not found in registry.`);
        }
        // Same protection for chaining: meta tools are MCP-side tools, not Unity Editor methods.
        const tempInstance = this.createTempInstance(ToolClass);
        if (tempInstance.category === 'meta') {
            throw new Error(`Tool '${toolName}' is a meta MCP tool and cannot be executed via discover_and_use_batch. ` +
                `Call '${toolName}' directly as an MCP tool instead (do not include it inside the batch tools list).`);
        }
        // Check if this is a server-only tool (doesn't need Unity connection)
        const metadata = ToolClass.metadata;
        if (metadata?.serverOnly === true) {
            this.logger.info(`[Chain] Tool '${toolName}' is server-only, executing locally`);
            // Create a real tool instance and execute it locally
            const toolInstance = new ToolClass(this.server, this.mcpUnity, this.logger);
            const result = await toolInstance.execute(finalParams);
            // Extract the text content from CallToolResult format
            if (result?.content?.[0]?.text) {
                return { success: true, message: result.content[0].text };
            }
            return result;
        }
        // Directly send request to Unity and return raw result
        const result = await this.mcpUnity.sendRequest({
            method: toolName,
            params: finalParams
        });
        this.logger.info(`[Chain] Tool '${toolName}' executed, raw result returned`);
        return result;
    }
    /**
     * Register all tools in a category
     */
    async registerCategory(category) {
        this.logger.info(`Registering category: ${category}`);
        // Get tools from ToolRegistry
        const toolClasses = ToolRegistry.getToolsByCategory(category);
        if (toolClasses.length === 0) {
            return {
                success: false,
                message: `Category '${category}' not found or has no tools`,
                toolsRegistered: [],
                toolsAlreadyRegistered: []
            };
        }
        const newlyRegistered = [];
        const alreadyRegistered = [];
        for (const ToolClass of toolClasses) {
            // Create temporary instance to get name
            const tempInstance = this.createTempInstance(ToolClass);
            const toolName = tempInstance.name;
            // Check if already registered
            if (this.registeredTools.has(toolName)) {
                // Update last used time to prevent unloading
                const existing = this.registeredTools.get(toolName);
                existing.lastUsedAt = Date.now();
                alreadyRegistered.push(toolName);
                this.logger.debug(`Tool '${toolName}' already registered, refreshed timestamp`);
                continue;
            }
            // Create and register new tool
            const toolInstance = new ToolClass(this.server, this.mcpUnity, this.logger);
            toolInstance.register();
            // Track the tool
            const now = Date.now();
            this.registeredTools.set(toolName, {
                instance: toolInstance,
                toolClass: ToolClass,
                category,
                registeredAt: now,
                lastUsedAt: now
            });
            // Update category tracking
            if (!this.categoryTools.has(category)) {
                this.categoryTools.set(category, new Set());
            }
            this.categoryTools.get(category).add(toolName);
            newlyRegistered.push(toolName);
            this.logger.info(`✓ Registered tool: ${toolName} (category: ${category})`);
        }
        // Send list_changed notification if any new tools were registered
        if (newlyRegistered.length > 0) {
            this.sendToolListChanged();
        }
        return {
            success: true,
            message: `Category '${category}': ${newlyRegistered.length} tools registered, ${alreadyRegistered.length} already active`,
            toolsRegistered: newlyRegistered,
            toolsAlreadyRegistered: alreadyRegistered
        };
    }
    /**
     * Record that a tool was used
     */
    recordToolUsage(toolName) {
        const tool = this.registeredTools.get(toolName);
        if (tool) {
            tool.lastUsedAt = Date.now();
            this.logger.debug(`Tool '${toolName}' usage recorded`);
        }
    }
    /**
     * Manually unregister a category
     */
    unregisterCategory(category) {
        const toolNames = this.categoryTools.get(category);
        if (!toolNames || toolNames.size === 0) {
            return {
                success: false,
                message: `Category '${category}' not registered`,
                toolsUnregistered: []
            };
        }
        const unregistered = [];
        for (const toolName of toolNames) {
            if (this.unregisterTool(toolName)) {
                unregistered.push(toolName);
            }
        }
        this.categoryTools.delete(category);
        if (unregistered.length > 0) {
            this.sendToolListChanged();
        }
        return {
            success: true,
            message: `Unregistered ${unregistered.length} tools from category '${category}'`,
            toolsUnregistered: unregistered
        };
    }
    /**
     * Unregister a single tool
     */
    unregisterTool(toolName) {
        const tool = this.registeredTools.get(toolName);
        if (!tool) {
            return false;
        }
        // Remove from tracking
        this.registeredTools.delete(toolName);
        // Remove from category tracking
        const category = tool.category;
        const categoryToolSet = this.categoryTools.get(category);
        if (categoryToolSet) {
            categoryToolSet.delete(toolName);
            if (categoryToolSet.size === 0) {
                this.categoryTools.delete(category);
            }
        }
        this.logger.info(`✓ Unregistered tool: ${toolName} (category: ${category})`);
        return true;
    }
    /**
     * Cleanup expired tools
     */
    cleanupExpiredTools() {
        const now = Date.now();
        const expiredTools = [];
        for (const [toolName, tool] of this.registeredTools) {
            const idleTime = now - tool.lastUsedAt;
            if (idleTime > this.TOOL_TIMEOUT_MS) {
                expiredTools.push(toolName);
                this.logger.info(`Tool '${toolName}' expired after ${Math.floor(idleTime / 60000)} minutes idle`);
            }
        }
        // Unregister expired tools
        let unregisteredCount = 0;
        for (const toolName of expiredTools) {
            if (this.unregisterTool(toolName)) {
                unregisteredCount++;
            }
        }
        // Send notification if any tools were unregistered
        if (unregisteredCount > 0) {
            this.logger.info(`🧹 Auto-cleanup: unregistered ${unregisteredCount} expired tools`);
            this.sendToolListChanged();
        }
    }
    /**
     * Start automatic cleanup timer
     */
    startCleanupTimer() {
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpiredTools();
        }, this.CLEANUP_INTERVAL_MS);
        this.logger.info(`Auto-cleanup timer started (check every ${this.CLEANUP_INTERVAL_MS / 1000}s, timeout: ${this.TOOL_TIMEOUT_MS / 60000}min)`);
    }
    /**
     * Stop cleanup timer
     */
    stopCleanupTimer() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            this.logger.info('Auto-cleanup timer stopped');
        }
    }
    /**
     * Send tool list changed notification
     */
    sendToolListChanged() {
        // MCP SDK doesn't expose sendNotification directly on server
        // We'll need to use the internal notification system
        // For now, log that we would send it
        this.logger.info('📢 Tool list changed - clients should refresh');
        // TODO: Implement actual notification when MCP SDK supports it
        // this.server.notification({
        //   method: 'notifications/tools/list_changed'
        // });
    }
    /**
     * Get statistics
     */
    getStatistics() {
        const now = Date.now();
        const stats = {
            totalRegistered: this.registeredTools.size,
            categoriesActive: this.categoryTools.size,
            toolsByCategory: {},
            toolDetails: []
        };
        for (const [category, tools] of this.categoryTools) {
            stats.toolsByCategory[category] = tools.size;
        }
        for (const [toolName, tool] of this.registeredTools) {
            stats.toolDetails.push({
                name: toolName,
                category: tool.category,
                idleTimeSeconds: Math.floor((now - tool.lastUsedAt) / 1000)
            });
        }
        return stats;
    }
    /**
     * Create temporary instance for metadata extraction
     */
    createTempInstance(ToolClass) {
        const mockServer = {};
        const mockMcpUnity = {};
        const mockLogger = {
            debug: () => { },
            info: () => { },
            warn: () => { },
            error: () => { }
        };
        return new ToolClass(mockServer, mockMcpUnity, mockLogger);
    }
    /**
     * Normalize parameter names from snake_case to camelCase based on tool schema
     * This allows AI to use either format without errors
     */
    normalizeParams(toolName, params) {
        if (!params || Object.keys(params).length === 0) {
            return params;
        }
        const ToolClass = ToolRegistry.getTool(toolName);
        if (!ToolClass) {
            return params;
        }
        try {
            const tempInstance = this.createTempInstance(ToolClass);
            const schema = tempInstance.inputSchema;
            if (!schema || !(schema instanceof z.ZodObject)) {
                return params;
            }
            const schemaShape = schema.shape;
            const schemaKeys = Object.keys(schemaShape);
            const schemaKeysLower = schemaKeys.map(k => k.toLowerCase());
            const normalized = {};
            for (const [key, value] of Object.entries(params)) {
                const snakeToCamel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
                if (schemaKeys.includes(key)) {
                    normalized[key] = value;
                }
                else if (schemaKeys.includes(snakeToCamel)) {
                    this.logger.debug(`[Normalize] ${toolName}: ${key} → ${snakeToCamel}`);
                    normalized[snakeToCamel] = value;
                }
                else {
                    const lowerKey = key.toLowerCase();
                    const matchIdx = schemaKeysLower.indexOf(lowerKey);
                    if (matchIdx >= 0) {
                        const correctKey = schemaKeys[matchIdx];
                        this.logger.debug(`[Normalize] ${toolName}: ${key} → ${correctKey}`);
                        normalized[correctKey] = value;
                    }
                    else {
                        normalized[key] = value;
                    }
                }
            }
            return normalized;
        }
        catch (error) {
            this.logger.warn(`[Normalize] Failed for ${toolName}, using original params`);
            return params;
        }
    }
    /**
     * Reset (for testing)
     */
    reset() {
        this.stopCleanupTimer();
        this.registeredTools.clear();
        this.categoryTools.clear();
        this.startCleanupTimer();
        this.logger.info('DynamicToolManager reset');
    }
}
