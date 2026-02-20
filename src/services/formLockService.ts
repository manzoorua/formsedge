import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface FormLock {
  id: string;
  form_id: string;
  user_id: string;
  instance_id: string;
  locked_at: string;
  expires_at: string;
  metadata: Record<string, any>;
}

export class FormLockService {
  private instanceId: string;
  private lockRefreshInterval: NodeJS.Timeout | null = null;
  private activeLocks = new Set<string>();

  constructor() {
    this.instanceId = uuidv4();
  }

  /**
   * Acquire an exclusive edit lock for a form
   */
  async acquireLock(formId: string): Promise<{ success: boolean; lock?: FormLock; conflictingLock?: FormLock }> {
    try {
      // First, clean up expired locks
      await this.cleanupExpiredLocks(formId);

      // Check for existing active locks
      const { data: existingLocks, error: checkError } = await supabase
        .from('form_edit_locks')
        .select('*')
        .eq('form_id', formId)
        .gt('expires_at', new Date().toISOString());

      if (checkError) {
        console.error('Error checking existing locks:', checkError);
        return { success: false };
      }

      // If there's an existing lock from another instance, return conflict
      const conflictingLock = existingLocks?.find(lock => 
        lock.instance_id !== this.instanceId
      );

      if (conflictingLock) {
        return { 
          success: false, 
          conflictingLock: conflictingLock as FormLock 
        };
      }

      // Try to create a new lock
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const { data: newLock, error: insertError } = await supabase
        .from('form_edit_locks')
        .insert({
          form_id: formId,
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          instance_id: this.instanceId,
          expires_at: expiresAt.toISOString(),
          metadata: { acquired_at: new Date().toISOString() }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating lock:', insertError);
        return { success: false };
      }

      this.activeLocks.add(formId);
      this.startLockRefresh(formId);

      return { 
        success: true, 
        lock: newLock as FormLock 
      };
    } catch (error) {
      console.error('Error acquiring lock:', error);
      return { success: false };
    }
  }

  /**
   * Release a form edit lock
   */
  async releaseLock(formId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('form_edit_locks')
        .delete()
        .eq('form_id', formId)
        .eq('instance_id', this.instanceId);

      if (error) {
        console.error('Error releasing lock:', error);
        return false;
      }

      this.activeLocks.delete(formId);
      this.stopLockRefresh();

      return true;
    } catch (error) {
      console.error('Error releasing lock:', error);
      return false;
    }
  }

  /**
   * Refresh lock expiry to maintain active editing session
   */
  async refreshLock(formId: string): Promise<boolean> {
    try {
      const newExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      
      const { error } = await supabase
        .from('form_edit_locks')
        .update({ 
          expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('form_id', formId)
        .eq('instance_id', this.instanceId);

      if (error) {
        console.error('Error refreshing lock:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error refreshing lock:', error);
      return false;
    }
  }

  /**
   * Check if form is currently locked by another instance
   */
  async isFormLocked(formId: string): Promise<{ locked: boolean; lockInfo?: FormLock }> {
    try {
      await this.cleanupExpiredLocks(formId);

      const { data: locks, error } = await supabase
        .from('form_edit_locks')
        .select('*')
        .eq('form_id', formId)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error('Error checking lock status:', error);
        return { locked: false };
      }

      const activeLock = locks?.find(lock => lock.instance_id !== this.instanceId);
      
      return {
        locked: !!activeLock,
        lockInfo: activeLock as FormLock
      };
    } catch (error) {
      console.error('Error checking lock status:', error);
      return { locked: false };
    }
  }

  /**
   * Start periodic lock refresh for active editing
   */
  private startLockRefresh(formId: string) {
    if (this.lockRefreshInterval) {
      clearInterval(this.lockRefreshInterval);
    }

    this.lockRefreshInterval = setInterval(async () => {
      if (this.activeLocks.has(formId)) {
        const success = await this.refreshLock(formId);
        if (!success) {
          console.warn('Failed to refresh lock for form:', formId);
          this.activeLocks.delete(formId);
        }
      }
    }, 2 * 60 * 1000); // Refresh every 2 minutes
  }

  /**
   * Stop lock refresh timer
   */
  private stopLockRefresh() {
    if (this.lockRefreshInterval) {
      clearInterval(this.lockRefreshInterval);
      this.lockRefreshInterval = null;
    }
  }

  /**
   * Clean up expired locks for a form
   */
  private async cleanupExpiredLocks(formId: string) {
    try {
      await supabase
        .from('form_edit_locks')
        .delete()
        .eq('form_id', formId)
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Error cleaning up expired locks:', error);
    }
  }

  /**
   * Clean up all locks for this instance on window unload
   */
  async cleanup() {
    try {
      await supabase
        .from('form_edit_locks')
        .delete()
        .eq('instance_id', this.instanceId);
      
      this.stopLockRefresh();
      this.activeLocks.clear();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Get instance ID for debugging
   */
  getInstanceId(): string {
    return this.instanceId;
  }
}

// Singleton instance
export const formLockService = new FormLockService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    formLockService.cleanup();
  });
}