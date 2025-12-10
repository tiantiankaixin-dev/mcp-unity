/**
 * MCP Prompts Index
 * 
 * Prompts guide AI assistants on how to use Unity MCP tools effectively.
 * Order matters - prompts are presented in registration order.
 */

export { registerSessionStartPrompt } from './sessionStartPrompt.js';
export { registerToolDiscoveryPrompt } from './toolDiscoveryPrompt.js';
export { registerGameObjectHandlingPrompt } from './gameobjectHandlingPrompt.js';

/**
 * Prompt Priority:
 * 1. unity_session_start (HIGHEST PRIORITY) - MUST READ at conversation start
 * 2. unity_tool_discovery (CRITICAL) - Teaches hierarchical tool discovery
 * 3. gameobject_handling_strategy - GameObject workflow guidance
 */
