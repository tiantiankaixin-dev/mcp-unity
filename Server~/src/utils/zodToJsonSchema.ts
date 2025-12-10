/**
 * Common alias keywords that indicate a field is an alternative name
 */
const ALIAS_KEYWORDS = ['alias', 'alternative', 'Alias', 'Alternative'];

/**
 * Known alias mappings - maps alias parameter names to their primary parameter names
 * This helps filter out aliases from the documentation
 * 
 * IMPORTANT: When adding a new tool, if you define parameter aliases using
 * .transform() in Zod schema, add the alias->primary mapping here to prevent
 * the alias from appearing in the documentation.
 * 
 * NOTE: Only add mappings that are ALWAYS aliases. If a parameter name is
 * primary in one tool but an alias in another, rely on the description-based
 * filtering instead (ALIAS_KEYWORDS check).
 */
const KNOWN_ALIASES: Record<string, string> = {
  // Animation - only aliases that are ALWAYS aliases across all tools
  // NOTE: 'controllerPath' is NOT an alias - it's the primary param in AddAnimatorTool
  // In AddAnimationStateTool/AddAnimationTransitionTool, description contains "Alias" keyword
  'clipPath': 'animationClipPath',
  'sourceStateName': 'fromState',
  'destinationStateName': 'toState',
  // NOTE: 'componentType' is NOT an alias - it's the primary param in AddComponentToGameObjectTool
  // NOTE: 'scenePath' is NOT an alias - it's the primary param in LoadSceneTool, DeleteSceneTool
  // Scene - only truly global aliases
  'destinationPath': 'targetScenePath',
  'basePath': 'folderPath',
};

/**
 * Recursively extract the shape from a Zod schema
 * Handles ZodObject, ZodEffects (refine/transform), and other wrapper types
 */
function getSchemaShape(schema: any): any {
  if (!schema || !schema._def) {
    return null;
  }

  // Direct ZodObject
  if (schema.shape) {
    return schema.shape;
  }

  const typeName = schema._def.typeName;

  // ZodEffects (from .refine(), .transform(), .superRefine())
  if (typeName === 'ZodEffects') {
    const innerSchema = schema._def.schema;
    if (innerSchema) {
      return getSchemaShape(innerSchema);
    }
  }

  // ZodPipeline
  if (typeName === 'ZodPipeline') {
    const inSchema = schema._def.in;
    if (inSchema) {
      return getSchemaShape(inSchema);
    }
  }

  // Try _def.schema.shape directly
  if (schema._def.schema?.shape) {
    return schema._def.schema.shape;
  }

  // Try innerType for wrapped types
  if (schema._def.innerType) {
    return getSchemaShape(schema._def.innerType);
  }

  return null;
}

/**
 * Converts Zod schema to readable JSON schema description
 * Simplified version for resource display
 * Filters out alias parameters to show only primary parameter names
 */
export function zodToReadableSchema(zodSchema: any): any {
  if (!zodSchema || typeof zodSchema !== 'object') {
    return {};
  }

  // Get the shape from ZodObject - handle various Zod wrapper types
  const shape = getSchemaShape(zodSchema);
  if (!shape) {
    return {};
  }

  const result: any = {};

  for (const [key, value] of Object.entries(shape)) {
    // Skip known alias parameters - only show primary parameter names
    if (KNOWN_ALIASES[key]) {
      continue;
    }

    const field: any = value as any;
    
    // Check if description contains "Alias" - skip these fields
    const description = getDescription(field);
    if (description && ALIAS_KEYWORDS.some(keyword => description.includes(keyword))) {
      continue;
    }

    const fieldInfo: any = {
      type: getZodType(field),
      required: !isOptional(field)
    };

    // Get description
    if (description) {
      fieldInfo.description = description;
    }

    // Get default value
    const defaultValue = getDefaultValue(field);
    if (defaultValue !== undefined) {
      fieldInfo.default = defaultValue;
      fieldInfo.required = false;
    }

    result[key] = fieldInfo;
  }

  return result;
}

function getZodType(field: any): string {
  if (!field || !field._def) return 'unknown';

  const typeName = field._def.typeName;
  
  // Handle wrapped types (Optional, Default, etc.)
  if (typeName === 'ZodOptional' || typeName === 'ZodDefault') {
    const innerType = field._def.innerType;
    if (innerType) {
      return getZodType(innerType);
    }
  }

  // Handle array
  if (typeName === 'ZodArray') {
    const elementType = field._def.type;
    return `${getZodType(elementType)}[]`;
  }

  // Map Zod types to simple names
  const typeMap: any = {
    'ZodString': 'string',
    'ZodNumber': 'number',
    'ZodBoolean': 'boolean',
    'ZodObject': 'object',
    'ZodArray': 'array'
  };

  return typeMap[typeName] || typeName.replace('Zod', '').toLowerCase();
}

function isOptional(field: any): boolean {
  if (!field || !field._def) return false;
  return field._def.typeName === 'ZodOptional' || field._def.typeName === 'ZodDefault';
}

function getDescription(field: any): string | undefined {
  if (!field || !field._def) return undefined;

  // Direct description
  if (field._def.description) {
    return field._def.description;
  }

  // Description in wrapped type
  if (field._def.innerType) {
    return getDescription(field._def.innerType);
  }

  return undefined;
}

function getDefaultValue(field: any): any {
  if (!field || !field._def) return undefined;

  if (field._def.typeName === 'ZodDefault') {
    const defaultFn = field._def.defaultValue;
    if (typeof defaultFn === 'function') {
      try {
        return defaultFn();
      } catch {
        return undefined;
      }
    }
    return defaultFn;
  }

  return undefined;
}
