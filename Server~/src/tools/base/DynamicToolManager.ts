import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { BaseTool } from './BaseTool.js';
import { ToolRegistry, ToolConstructor } from './ToolRegistry.js';

/**
 * Registered tool instance with metadata
 */
interface RegisteredTool {
  instance: BaseTool;
  toolClass: ToolConstructor;
  category: string;
  registeredAt: number;
  lastUsedAt: number;
}

/**
 * Dynamic Tool Manager
 * Manages runtime tool registration and automatic unloading
 */
export class DynamicToolManager {
  private static instance: DynamicToolManager | null = null;
  
  // Map of tool name to registered tool info
  private registeredTools: Map<string, RegisteredTool> = new Map();
  
  // Map of category to tool names in that category
  private categoryTools: Map<string, Set<string>> = new Map();
  
  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  // Configuration
  private readonly TOOL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000; // Check every 1 minute
  
  private constructor(
    private server: McpServer,
    private mcpUnity: McpUnity,
    private logger: Logger
  ) {
    this.startCleanupTimer();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(server: McpServer, mcpUnity: McpUnity, logger: Logger): DynamicToolManager {
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
  async discoverAndUseTool(toolName: string, params: any): Promise<any> {
    this.logger.info(`[Zero-Registration] Direct execution: ${toolName}`);
    
    // Verify tool exists in registry
    const ToolClass = ToolRegistry.getTool(toolName);
    if (!ToolClass) {
      throw new Error(`Tool '${toolName}' not found. Use read_resource('unity://tool-names/{category}') to see available tools.`);
    }
    
    try {
      // Directly send request to Unity without MCP tool registration
      // This bypasses the MCP layer entirely
      const result = await this.mcpUnity.sendRequest({
        method: toolName,
        params: params
      });
      
      this.logger.info(`[Zero-Registration] Tool '${toolName}' executed successfully`);
      
      // Get the tool's category for related tools hint
      const ToolClass = ToolRegistry.getTool(toolName);
      const category = ToolClass ? this.createTempInstance(ToolClass).category : 'unknown';
      
      // Build result with hint for AI to remember to explore more tools
      // 确保result不是undefined或null
      const resultText = result?.message || (result ? JSON.stringify(result, null, 2) : 'Operation completed');
      const hint = `\n\n💡 Tip: Need more tools? Query unity://tool-names/${category} for related tools, or unity://tool-categories for all categories.`;
      
      return {
        content: [{
          type: 'text',
          text: resultText + hint
        }]
      };
    } catch (error: any) {
      this.logger.error(`[Zero-Registration] Tool '${toolName}' execution failed:`, error);
      // 确保正确获取错误消息
      const errorMessage = error?.message || (typeof error === 'string' ? error : JSON.stringify(error) || 'Unknown error');
      return {
        content: [{
          type: 'text',
          text: `❌ Error: ${errorMessage}`
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
  async discoverAndUseToolRaw(toolName: string, params: any): Promise<any> {
    this.logger.info(`[Chain] Raw execution: ${toolName}`);
    
    // Verify tool exists in registry
    const ToolClass = ToolRegistry.getTool(toolName);
    if (!ToolClass) {
      throw new Error(`Tool '${toolName}' not found in registry.`);
    }
    
    // Directly send request to Unity and return raw result
    const result = await this.mcpUnity.sendRequest({
      method: toolName,
      params: params
    });
    
    this.logger.info(`[Chain] Tool '${toolName}' executed, raw result returned`);
    return result;
  }
  
  /**
   * Register all tools in a category
   */
  async registerCategory(category: string): Promise<{
    success: boolean;
    message: string;
    toolsRegistered: string[];
    toolsAlreadyRegistered: string[];
  }> {
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
    
    const newlyRegistered: string[] = [];
    const alreadyRegistered: string[] = [];
    
    for (const ToolClass of toolClasses) {
      // Create temporary instance to get name
      const tempInstance = this.createTempInstance(ToolClass);
      const toolName = tempInstance.name;
      
      // Check if already registered
      if (this.registeredTools.has(toolName)) {
        // Update last used time to prevent unloading
        const existing = this.registeredTools.get(toolName)!;
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
      this.categoryTools.get(category)!.add(toolName);
      
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
  recordToolUsage(toolName: string) {
    const tool = this.registeredTools.get(toolName);
    if (tool) {
      tool.lastUsedAt = Date.now();
      this.logger.debug(`Tool '${toolName}' usage recorded`);
    }
  }
  
  /**
   * Manually unregister a category
   */
  unregisterCategory(category: string): {
    success: boolean;
    message: string;
    toolsUnregistered: string[];
  } {
    const toolNames = this.categoryTools.get(category);
    
    if (!toolNames || toolNames.size === 0) {
      return {
        success: false,
        message: `Category '${category}' not registered`,
        toolsUnregistered: []
      };
    }
    
    const unregistered: string[] = [];
    
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
  private unregisterTool(toolName: string): boolean {
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
  private cleanupExpiredTools() {
    const now = Date.now();
    const expiredTools: string[] = [];
    
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
  private startCleanupTimer() {
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
  private sendToolListChanged() {
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
      toolsByCategory: {} as Record<string, number>,
      toolDetails: [] as Array<{
        name: string;
        category: string;
        idleTimeSeconds: number;
      }>
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
  private createTempInstance(ToolClass: ToolConstructor): BaseTool {
    const mockServer = {} as McpServer;
    const mockMcpUnity = {} as McpUnity;
    const mockLogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {}
    } as unknown as Logger;
    
    return new ToolClass(mockServer, mockMcpUnity, mockLogger);
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
