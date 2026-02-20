import { FormField, Form } from '@/types/form';

export interface TabMessage {
  type: 'FORM_UPDATE' | 'FIELD_UPDATE' | 'FORM_SYNC_REQUEST' | 'FORM_SYNC_RESPONSE' | 'TAB_ACTIVE' | 'TAB_INACTIVE';
  formId: string;
  data?: any;
  timestamp: number;
  tabId: string;
}

export interface TabState {
  formId: string | null;
  isActive: boolean;
  lastActivity: number;
}

export class TabCoordinationService {
  private channel: BroadcastChannel;
  private tabId: string;
  private isActive: boolean = true;
  private currentFormId: string | null = null;
  private messageHandlers = new Map<string, Set<(message: TabMessage) => void>>();

  constructor() {
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.channel = new BroadcastChannel('form_builder_coordination');
    
    this.setupMessageListener();
    this.setupVisibilityHandling();
    this.announceTabState();
  }

  /**
   * Set the currently active form
   */
  setActiveForm(formId: string | null) {
    this.currentFormId = formId;
    this.broadcastMessage({
      type: 'TAB_ACTIVE',
      formId: formId || '',
      data: { activeForm: formId },
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  /**
   * Broadcast form update to other tabs
   */
  broadcastFormUpdate(formId: string, form: Partial<Form>) {
    if (!this.isActive) return;

    this.broadcastMessage({
      type: 'FORM_UPDATE',
      formId,
      data: { form },
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  /**
   * Broadcast field update to other tabs
   */
  broadcastFieldUpdate(formId: string, fieldId: string, field: Partial<FormField>) {
    if (!this.isActive) return;

    this.broadcastMessage({
      type: 'FIELD_UPDATE',
      formId,
      data: { fieldId, field },
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  /**
   * Request form sync from other tabs
   */
  requestFormSync(formId: string): Promise<{ form?: Form; fields?: FormField[] } | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.removeMessageHandler('FORM_SYNC_RESPONSE', responseHandler);
        resolve(null);
      }, 2000);

      const responseHandler = (message: TabMessage) => {
        if (message.formId === formId && message.type === 'FORM_SYNC_RESPONSE') {
          clearTimeout(timeout);
          this.removeMessageHandler('FORM_SYNC_RESPONSE', responseHandler);
          resolve(message.data);
        }
      };

      this.addMessageHandler('FORM_SYNC_RESPONSE', responseHandler);

      this.channel.postMessage({
        type: 'FORM_SYNC_REQUEST',
        formId,
        timestamp: Date.now(),
        tabId: this.tabId
      });
    });
  }

  /**
   * Add message handler for specific message type
   */
  addMessageHandler(type: string, handler: (message: TabMessage) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
  }

  /**
   * Remove message handler
   */
  removeMessageHandler(type: string, handler: (message: TabMessage) => void) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Get current tab ID
   */
  getTabId(): string {
    return this.tabId;
  }

  /**
   * Check if tab is currently active
   */
  isTabActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current active form ID
   */
  getCurrentFormId(): string | null {
    return this.currentFormId;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.broadcastMessage({
      type: 'TAB_INACTIVE',
      formId: this.currentFormId || '',
      timestamp: Date.now(),
      tabId: this.tabId
    });

    this.channel.close();
    this.messageHandlers.clear();
  }

  /**
   * Setup message listener for BroadcastChannel
   */
  private setupMessageListener() {
    this.channel.addEventListener('message', (event) => {
      const message: TabMessage = event.data;
      
      // Ignore messages from this tab
      if (message.tabId === this.tabId) return;

      // Call registered handlers
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => handler(message));
      }
    });
  }

  /**
   * Setup tab visibility and focus handling
   */
  private setupVisibilityHandling() {
    const updateActiveState = () => {
      const newActiveState = !document.hidden && document.hasFocus();
      if (newActiveState !== this.isActive) {
        this.isActive = newActiveState;
        this.announceTabState();
      }
    };

    document.addEventListener('visibilitychange', updateActiveState);
    window.addEventListener('focus', updateActiveState);
    window.addEventListener('blur', updateActiveState);

    // Periodic activity check
    setInterval(() => {
      if (this.isActive) {
        this.announceTabState();
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Announce current tab state to other tabs
   */
  private announceTabState() {
    const messageType = this.isActive ? 'TAB_ACTIVE' : 'TAB_INACTIVE';
    this.broadcastMessage({
      type: messageType,
      formId: this.currentFormId || '',
      data: { 
        activeForm: this.currentFormId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      tabId: this.tabId
    });
  }

  /**
   * Broadcast message to other tabs
   */
  private broadcastMessage(message: TabMessage) {
    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  }
}

// Singleton instance
export const tabCoordinationService = new TabCoordinationService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    tabCoordinationService.cleanup();
  });
}