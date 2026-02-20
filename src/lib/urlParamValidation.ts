export const RESERVED_URL_PARAMS = new Set([
  'embed',
  'mode',
  'org_id',
  'theme',
  'lang',
  'progress',
  'hideTitle',
  'hideDescription',
]);

export const PARAM_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

export interface FormUrlParamConfig {
  name: string;
  label?: string;
  description?: string;
  include_in_responses?: boolean;
  visible_in_exports?: boolean;
  default_value?: string | null;
  transitive_default?: boolean;
}

export const isReservedParam = (name: string): boolean => {
  return RESERVED_URL_PARAMS.has(name);
};

export const isValidParamName = (name: string): boolean => {
  return PARAM_NAME_REGEX.test(name) && !isReservedParam(name);
};

export const validateUrlParamConfig = (
  config: FormUrlParamConfig[],
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const names = new Set<string>();
  
  config.forEach((param, index) => {
    // Check name is present
    if (!param.name) {
      errors.push(`Parameter ${index + 1}: Name is required`);
      return;
    }
    
    // Check valid format
    if (!isValidParamName(param.name)) {
      if (isReservedParam(param.name)) {
        errors.push(`Parameter "${param.name}": Reserved parameter name`);
      } else {
        errors.push(`Parameter "${param.name}": Invalid format (use only letters, numbers, and underscores)`);
      }
    }
    
    // Check uniqueness
    if (names.has(param.name)) {
      errors.push(`Parameter "${param.name}": Duplicate name`);
    }
    names.add(param.name);
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
