#!/usr/bin/env node
/**
 * Group legacy tools by category for careful migration
 */

import { readFileSync, writeFileSync } from 'fs';

const ANALYSIS_FILE = './scripts/legacy-tools-analysis.json';

console.log('========================================');
console.log('  Legacy Tools - Category Grouping');
console.log('========================================\n');

// Load analysis
const analysis = JSON.parse(readFileSync(ANALYSIS_FILE, 'utf-8'));
const legacyTools = analysis.tools.filter(t => !t.isBaseTool);

// Better category inference
function inferCategory(tool) {
  const name = tool.toolName || '';
  const fileName = tool.fileName || '';
  
  // Physics
  if (name.includes('rigidbody') || name.includes('collider') || name.includes('physics') || 
      name.includes('navmesh') || name.includes('nav_mesh') || name.includes('raycast') || 
      name.includes('overlap') || name.includes('joint') || name.includes('force')) {
    return 'physics';
  }
  
  // Animation
  if (name.includes('animation') || name.includes('animator') || name.includes('timeline') ||
      name.includes('blend') || name.includes('record')) {
    return 'animation';
  }
  
  // UI
  if (name.includes('ui_') || name.includes('create_ui') || fileName.includes('UI')) {
    return 'ui';
  }
  
  // Scene
  if (name.includes('scene') || name.includes('load_scene') || name.includes('create_scene')) {
    return 'scene';
  }
  
  // GameObject
  if (name.includes('gameobject') || name.includes('game_object') || name.includes('select_') ||
      name.includes('group_') || name.includes('align_') || name.includes('distribute_') ||
      name.includes('replace_') || name.includes('duplicate_') || name.includes('copy_transform')) {
    return 'gameobject';
  }
  
  // Material
  if (name.includes('material') || name.includes('shader') || name.includes('texture') ||
      name.includes('skybox')) {
    return 'material';
  }
  
  // Scripting
  if (name.includes('script') || name.includes('recompile') || name.includes('validate_script')) {
    return 'scripting';
  }
  
  // Optimization
  if (name.includes('optimize') || name.includes('cleanup') || name.includes('unused') ||
      name.includes('missing') || name.includes('lod') || name.includes('lightmap')) {
    return 'optimization';
  }
  
  // Build
  if (name.includes('build') || name.includes('package') || name.includes('player_settings') ||
      name.includes('quality_settings')) {
    return 'build';
  }
  
  // Lighting
  if (name.includes('light') || name.includes('bake_lighting') || name.includes('reflection_probe')) {
    return 'lighting';
  }
  
  // Prefab
  if (name.includes('prefab')) {
    return 'prefab';
  }
  
  // Asset
  if (name.includes('asset') || name.includes('import')) {
    return 'asset';
  }
  
  // Testing
  if (name.includes('test')) {
    return 'testing';
  }
  
  // Console/Debug
  if (name.includes('console') || name.includes('log')) {
    return 'debug';
  }
  
  // Menu
  if (name.includes('menu')) {
    return 'menu';
  }
  
  return 'general';
}

// Re-categorize all tools
legacyTools.forEach(tool => {
  tool.category = inferCategory(tool);
});

// Group by category
const byCategory = {};
legacyTools.forEach(tool => {
  const category = tool.category;
  if (!byCategory[category]) {
    byCategory[category] = [];
  }
  byCategory[category].push(tool);
});

// Sort categories by tool count
const sortedCategories = Object.entries(byCategory)
  .sort((a, b) => b[1].length - a[1].length);

console.log('📊 Legacy Tools by Category:\n');
sortedCategories.forEach(([category, tools]) => {
  console.log(`\n📁 ${category.toUpperCase()} (${tools.length} tools)`);
  console.log('─'.repeat(50));
  tools.forEach((tool, i) => {
    console.log(`  ${i + 1}. ${tool.toolName || 'unknown'}`);
    console.log(`     File: ${tool.fileName}`);
  });
});

console.log('\n========================================');
console.log('📋 Migration Plan Summary:');
console.log('========================================\n');

sortedCategories.forEach(([category, tools], index) => {
  console.log(`Phase ${index + 1}: ${category.toUpperCase()} - ${tools.length} tools`);
});

console.log('\n💡 Recommendation:');
console.log('   Start with the smallest category to test the process');
console.log('   Then move to larger categories\n');

// Save grouped data
const groupedData = {
  timestamp: new Date().toISOString(),
  totalLegacyTools: legacyTools.length,
  categories: sortedCategories.map(([category, tools]) => ({
    name: category,
    count: tools.length,
    tools: tools.map(t => ({
      name: t.toolName,
      fileName: t.fileName,
      filePath: t.filePath,
      description: t.description
    }))
  }))
};

writeFileSync('./scripts/migration-plan.json', JSON.stringify(groupedData, null, 2));
console.log('✅ Migration plan saved to: ./scripts/migration-plan.json\n');

console.log('========================================');

