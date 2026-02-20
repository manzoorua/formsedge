import { FormField } from '../../../types/form';

export interface FieldPosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutConfig {
  columns: number;
  gridGap: 'sm' | 'md' | 'lg';
  responsive: boolean;
}

export class LayoutEngine {
  private config: LayoutConfig;
  private positionCache = new Map<string, FieldPosition[]>();
  private classCache = new Map<string, string>();
  
  constructor(config: LayoutConfig) {
    this.config = config;
  }
  
  /**
   * Calculate positions for all fields based on their width settings
   */
  calculateFieldPositions(fields: FormField[]): FieldPosition[] {
    // Create cache key from field IDs and widths
    const cacheKey = fields.map(f => `${f.id}:${f.width || 'full'}`).join(',') + `:${this.config.columns}`;
    
    if (this.positionCache.has(cacheKey)) {
      return this.positionCache.get(cacheKey)!;
    }
    
    const positions: FieldPosition[] = [];
    let currentRow = 0;
    let currentColumn = 0;
    
    for (const field of fields) {
      const fieldWidth = this.getFieldWidthInColumns(field.width);
      
      // Check if field fits in current row
      if (currentColumn + fieldWidth > this.config.columns) {
        // Move to next row
        currentRow++;
        currentColumn = 0;
      }
      
      positions.push({
        id: field.id,
        x: currentColumn,
        y: currentRow,
        width: fieldWidth,
        height: 1, // All fields take 1 row height
      });
      
      currentColumn += fieldWidth;
      
      // If we've filled the row, move to next row
      if (currentColumn >= this.config.columns) {
        currentRow++;
        currentColumn = 0;
      }
    }
    
    // Cache the result
    this.positionCache.set(cacheKey, positions);
    return positions;
  }
  
  /**
   * Generate CSS Grid classes based on field positions
   */
  generateGridClasses(position: FieldPosition): string {
    const cacheKey = `${position.width}:${this.config.columns}`;
    
    if (this.classCache.has(cacheKey)) {
      return this.classCache.get(cacheKey)!;
    }
    
    // Use col-span-full for full width fields to ensure they take the complete width
    const result = position.width >= this.config.columns 
      ? 'col-span-full' 
      : `col-span-${position.width}`;
      
    this.classCache.set(cacheKey, result);
    return result;
  }
  
  /**
   * Get CSS classes for the container grid
   */
  getContainerClasses(): string {
    const gapClass = this.getGapClass();
    const columnsClass = `grid-cols-${this.config.columns}`;
    const responsiveClass = this.config.responsive ? 'max-md:grid-cols-1' : '';
    
    return `grid ${columnsClass} ${gapClass} ${responsiveClass}`.trim();
  }
  
  private getFieldWidthInColumns(width?: string): number {
    switch (width) {
      case 'quarter':
        return Math.max(1, Math.floor(this.config.columns / 4));
      case 'half':
        return Math.max(1, Math.floor(this.config.columns / 2));
      case 'full':
      default:
        return this.config.columns;
    }
  }
  
  private getGapClass(): string {
    switch (this.config.gridGap) {
      case 'sm':
        return 'gap-2';
      case 'md':
        return 'gap-4';
      case 'lg':
        return 'gap-6';
      default:
        return 'gap-3';
    }
  }
  
  /**
   * Update layout configuration
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };
    // Clear caches when config changes
    this.positionCache.clear();
    this.classCache.clear();
  }
}