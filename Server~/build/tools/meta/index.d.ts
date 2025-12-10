/**
 * Meta Tools - Zero-Registration Architecture
 *
 * These tools implement the zero-registration pattern where:
 * - Only meta tools are registered in MCP at startup
 * - Other tools are discovered and executed on-demand
 * - Token consumption: ~100-200 tokens (vs 10,000+ traditional)
 *
 * Tools:
 * - discover_and_use_tool: Execute single Unity tool on-demand
 * - discover_and_use_batch: Execute multiple Unity tools with parameter chaining
 */
export * from './DiscoverAndUseToolTool.js';
export * from './DiscoverAndUseBatchTool.js';
