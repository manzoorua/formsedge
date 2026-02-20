/**
 * FormsEdge Embed SDK
 * Standalone vanilla JS script for embedding forms via script tags
 */

interface FormsEdgeWidgetMessage {
  source: 'formsedge-widget';
  type: 'ready' | 'resize' | 'stepChange' | 'submit' | 'close';
  payload: {
    formId: string;
    height?: number;
    pageIndex?: number;
    totalPages?: number;
    pageId?: string;
    responseId?: string;
  };
}

interface EmbedOptions {
  formId: string;
  mode?: 'inline' | 'popup' | 'slidein';
  theme?: 'light' | 'dark' | 'auto';
  lang?: string;
  progress?: string;
  hidden?: Record<string, string>;
  transitiveParams?: string[];
  position?: string;
  width?: string;
  height?: string;
  popupSize?: 'large' | 'medium' | 'small';
  buttonColor?: string;
  buttonFontSize?: number;
  buttonRadius?: number;
  buttonAsText?: boolean;
  slideDirection?: 'left' | 'right';
  tabText?: string;
  icon?: string;
  iconSize?: number;
  tooltipText?: string;
  trigger?: 'immediate' | 'scroll' | 'time' | 'exit';
  scrollPercentage?: number;
  delay?: number;
  preventReopen?: boolean;
  autoLaunch?: boolean;
  closeDelay?: number;
}

class FormsEdgeEmbedSDK {
  private iframes: Map<string, HTMLIFrameElement> = new Map();
  private overlays: Map<string, HTMLDivElement> = new Map();
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.init();
  }
  
  private getBaseUrl(): string {
    // Try to find our own script tag and extract its origin
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && src.includes('formsedge-embed.js')) {
        try {
          const url = new URL(src);
          // Handle file:// protocol or null origin
          if (url.origin === 'null' || url.protocol === 'file:') {
            // Fallback: if window.location.origin is also null/file, use a safe default
            const winOrigin = window.location.origin;
            if (winOrigin && winOrigin !== 'null' && !winOrigin.startsWith('file:')) {
              return winOrigin;
            }
            // Last resort: return empty string to prevent "null/f/..." URLs
            console.warn('[FormsEdge] Cannot determine base URL from file:// context');
            return '';
          }
          return url.origin;
        } catch (e) {
          console.warn('[FormsEdge] Failed to parse script URL:', src);
        }
      }
    }
    
    // Fallback to current origin (for backward compatibility)
    const winOrigin = window.location.origin;
    if (winOrigin && winOrigin !== 'null' && !winOrigin.startsWith('file:')) {
      return winOrigin;
    }
    
    console.warn('[FormsEdge] Base URL could not be determined');
    return '';
  }
  
  private init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.scanAndMount());
    } else {
      this.scanAndMount();
    }
    
    // Listen for postMessage from iframes
    window.addEventListener('message', (event) => this.handleMessage(event));
  }
  
  private isReservedParam(name: string): boolean {
    const RESERVED = new Set(['embed', 'mode', 'org_id', 'theme', 'lang', 'progress', 'hideTitle', 'hideDescription']);
    return RESERVED.has(name);
  }
  
  private parseHiddenParams(hiddenAttr: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!hiddenAttr) return result;
    
    const pairs = hiddenAttr.split(',');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value && !this.isReservedParam(key)) {
        result[key] = value;
      }
    });
    
    return result;
  }
  
  private parseTransitiveParams(transitiveAttr: string): string[] {
    if (!transitiveAttr) return [];
    return transitiveAttr
      .split(',')
      .map(s => s.trim())
      .filter(key => key && !this.isReservedParam(key));
  }
  
  private scanAndMount() {
    try {
      // Find inline containers
      const inlineContainers = document.querySelectorAll('[data-fe-form]:not([data-fe-mode="popup"]):not([data-fe-mode="slidein"])');
      inlineContainers.forEach((el) => this.mountInline(el as HTMLElement));
      
      // Find popup/slidein triggers
      const triggers = document.querySelectorAll('[data-fe-open]');
      triggers.forEach((el) => this.attachTrigger(el as HTMLElement));

      // Diagnose potential host-page pointer-events issues after mounting
      setTimeout(() => {
        const allContainers = document.querySelectorAll('[data-fe-form], [data-fe-open]');
        allContainers.forEach(container => {
          const iframe = container.querySelector('iframe');
          if (iframe) {
            const computedStyle = window.getComputedStyle(iframe);
            const rect = iframe.getBoundingClientRect();
            
            if (computedStyle.pointerEvents !== 'auto' && computedStyle.pointerEvents !== '') {
              console.warn('[FormsEdge] Host page may be blocking iframe interaction:', {
                iframe,
                pointerEvents: computedStyle.pointerEvents,
                message: 'Check your CSS for overlays or pointer-events:none on iframe'
              });
            }
            
            if (rect.height === 0 || rect.width === 0) {
              console.warn('[FormsEdge] iframe has zero dimensions:', {
                iframe,
                width: rect.width,
                height: rect.height,
                message: 'iframe may not be visible to users'
              });
            }
          }
        });
      }, 1000);
    } catch (error) {
      console.error('[FormsEdge] Error scanning DOM:', error);
    }
  }
  
  private mountInline(container: HTMLElement) {
    const formId = container.getAttribute('data-fe-form');
    const mode = container.getAttribute('data-fe-mode') || 'inline';
    const theme = container.getAttribute('data-fe-theme') || 'light';
    const lang = container.getAttribute('data-fe-lang') || 'en';
    const progress = container.getAttribute('data-fe-progress') || 'top';
    const autoresize = container.getAttribute('data-fe-autoresize') === 'true';
    const hiddenAttr = container.getAttribute('data-fe-hidden') || '';
    const transitiveAttr = container.getAttribute('data-fe-transitive-params') || '';
    
    if (!formId) return;
    
    const iframe = this.createIframe(formId, {
      mode,
      theme,
      lang,
      progress,
    }, hiddenAttr, transitiveAttr);
    
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = 'none';
    
    if (autoresize) {
      iframe.setAttribute('data-fe-autoresize', 'true');
    }
    
    container.appendChild(iframe);
    this.iframes.set(formId, iframe);
  }
  
  private attachTrigger(trigger: HTMLElement) {
    const formId = trigger.getAttribute('data-fe-open');
    const mode = trigger.getAttribute('data-fe-mode') || 'popup';
    const theme = trigger.getAttribute('data-fe-theme') || 'light';
    const lang = trigger.getAttribute('data-fe-lang') || 'en';
    const progress = trigger.getAttribute('data-fe-progress') || 'top';
    const hiddenAttr = trigger.getAttribute('data-fe-hidden') || '';
    const transitiveAttr = trigger.getAttribute('data-fe-transitive-params') || '';
    const popupSize = trigger.getAttribute('data-fe-popup-size') as 'large' | 'medium' | 'small' | null;
    const slideDirection = trigger.getAttribute('data-fe-slide-direction') as 'left' | 'right' | null;
    
    // NEW: Icon and tooltip attributes
    const tabText = trigger.getAttribute('data-fe-tab-text');
    const icon = trigger.getAttribute('data-fe-icon');
    const iconSize = trigger.getAttribute('data-fe-icon-size');
    const tooltipText = trigger.getAttribute('data-fe-tooltip');
    
    // Advanced behavior attributes
    const triggerType = trigger.getAttribute('data-fe-trigger') as 'immediate' | 'scroll' | 'time' | 'exit' | null;
    const scrollPercentage = trigger.getAttribute('data-fe-scroll-percentage');
    const delay = trigger.getAttribute('data-fe-delay');
    const preventReopen = trigger.getAttribute('data-fe-prevent-reopen') === 'true';
    const autoLaunch = trigger.getAttribute('data-fe-auto-launch') === 'true';
    const closeDelay = trigger.getAttribute('data-fe-close-delay');
    
    if (!formId) return;
    
    // Add tooltip if specified
    if (tooltipText && !autoLaunch) {
      trigger.setAttribute('title', tooltipText);
    }
    
    const options: any = {
      mode: mode as any,
      theme,
      lang,
      progress,
      popupSize: popupSize || undefined,
      slideDirection: slideDirection || undefined,
      tabText: tabText || undefined,
      icon: icon || undefined,
      iconSize: iconSize ? parseInt(iconSize) : undefined,
      tooltipText: tooltipText || undefined,
      trigger: triggerType || undefined,
      scrollPercentage: scrollPercentage ? parseInt(scrollPercentage) : undefined,
      delay: delay ? parseInt(delay) : undefined,
      preventReopen,
      autoLaunch,
      closeDelay: closeDelay ? parseInt(closeDelay) : undefined,
    };
    
    // If slider mode with side tab, create side tab
    if (mode === 'slidein' && (autoLaunch || tabText)) {
      this.createSideTab(formId, options, hiddenAttr, transitiveAttr, trigger);
      return;
    }
    
    // If auto-launch is enabled, init triggers instead of attaching click listener
    if (autoLaunch && triggerType) {
      this.initTriggers(formId, options, hiddenAttr, transitiveAttr);
    } else {
      // Regular click trigger
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openOverlay(formId, options, hiddenAttr, transitiveAttr);
      });
    }
  }
  
  private createIframe(formId: string, params: Record<string, string>, hiddenAttr: string = '', transitiveAttr: string = ''): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    
    const queryParams = new URLSearchParams({
      embed: '1',
      ...params,
    });
    
    // Add static hidden params
    if (hiddenAttr) {
      const hiddenPairs = this.parseHiddenParams(hiddenAttr);
      Object.entries(hiddenPairs).forEach(([key, value]) => {
        if (!queryParams.has(key)) {
          queryParams.set(key, value);
        }
      });
    }
    
    // Add transitive params from host page URL
    if (transitiveAttr) {
      const transitiveKeys = this.parseTransitiveParams(transitiveAttr);
      const hostSearch = new URLSearchParams(window.location.search);
      
      transitiveKeys.forEach(key => {
        if (!queryParams.has(key)) {
          const value = hostSearch.get(key);
          if (value !== null) {
            queryParams.set(key, value);
          }
        }
      });
    }
    
    iframe.src = `${this.baseUrl}/f/${formId}?${queryParams.toString()}`;
    iframe.setAttribute('data-fe-form-id', formId);
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('loading', 'lazy');
    
    return iframe;
  }
  
  private createSideTab(
    formId: string,
    options: any,
    hiddenAttr: string,
    transitiveAttr: string,
    triggerEl: HTMLElement
  ) {
    const slideDirection = options.slideDirection || 'right';
    const isLeft = slideDirection === 'left';
    const tabText = options.tabText || 'Try me!';
    const theme = options.theme || 'light';
    
    const tab = document.createElement('div');
    tab.setAttribute('data-fe-side-tab', formId);
    tab.style.cssText = `
      position: fixed;
      top: 50%;
      ${isLeft ? 'left: -2px' : 'right: -2px'};
      transform: translateY(-50%) rotate(${isLeft ? '-90deg' : '90deg'});
      transform-origin: ${isLeft ? 'bottom left' : 'bottom right'};
      background: ${theme === 'dark' ? '#1F2937' : '#3B82F6'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 999998;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    `;
    
    if (options.icon) {
      const iconEl = this.renderIcon(options.icon, options.iconSize || 20);
      if (iconEl) tab.appendChild(iconEl);
    }
    
    const textSpan = document.createElement('span');
    textSpan.textContent = tabText;
    tab.appendChild(textSpan);
    
    if (options.tooltipText) {
      tab.setAttribute('title', options.tooltipText);
    }
    
    tab.onmouseenter = () => {
      tab.style.transform = `translateY(-50%) rotate(${isLeft ? '-90deg' : '90deg'}) translateX(${isLeft ? '4px' : '-4px'})`;
    };
    tab.onmouseleave = () => {
      tab.style.transform = `translateY(-50%) rotate(${isLeft ? '-90deg' : '90deg'})`;
    };
    
    tab.onclick = () => {
      this.openOverlay(formId, options, hiddenAttr, transitiveAttr);
      tab.style.display = 'none';
    };
    
    document.body.appendChild(tab);
    
    const checkOverlay = setInterval(() => {
      if (!this.overlays.has(formId)) {
        tab.style.display = 'flex';
        clearInterval(checkOverlay);
      }
    }, 300);
  }
  
  private renderIcon(iconName: string, size: number): HTMLElement | SVGSVGElement | null {
    if (iconName.startsWith('http')) {
      const img = document.createElement('img');
      img.src = iconName;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      img.style.objectFit = 'contain';
      return img;
    }
    
    const iconPaths: Record<string, string> = {
      'MessageCircle': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      'Sparkles': '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
      'Bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
      'Star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      'Heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
      'Zap': '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
      'Gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
      'Mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
      'Phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
      'Send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    };
    
    if (!iconPaths[iconName]) return null;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size.toString());
    svg.setAttribute('height', size.toString());
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.style.flexShrink = '0';
    svg.innerHTML = iconPaths[iconName];
    
    return svg;
  }
  
  private openOverlay(formId: string, params: {
    mode: 'popup' | 'slidein'; 
    theme: string; 
    lang: string;
    progress?: string;
    popupSize?: 'large' | 'medium' | 'small';
    slideDirection?: 'left' | 'right';
  }, hiddenAttr: string = '', transitiveAttr: string = '') {
    // Close existing overlay if any
    if (this.overlays.has(formId)) {
      this.closeOverlay(formId);
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-in-out;
      pointer-events: auto;
    `;
    
    const container = document.createElement('div');
    
    // Popup size mapping
    const sizeMap = {
      large: '896px',
      medium: '672px',
      small: '512px',
    };
    const popupWidth = sizeMap[params.popupSize || 'large'];
    
    if (params.mode === 'popup') {
      container.style.cssText = `
        position: relative;
        width: 90%;
        max-width: ${popupWidth};
        height: 80vh;
        max-height: 800px;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease-out;
        pointer-events: auto;
      `;
    } else if (params.mode === 'slidein') {
      overlay.style.background = 'transparent';
      overlay.style.pointerEvents = 'none';
      const direction = params.slideDirection || 'right';
      if (direction === 'left') {
        container.style.cssText = `
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 400px;
          max-width: calc(100vw - 40px);
          height: 600px;
          max-height: calc(100vh - 40px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
          animation: slideInLeft 0.3s ease-out;
          pointer-events: auto;
        `;
      } else {
        container.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 400px;
          max-width: calc(100vw - 40px);
          height: 600px;
          max-height: calc(100vh - 40px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
          animation: slideInRight 0.3s ease-out;
          pointer-events: auto;
        `;
      }
    }
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close form');
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      z-index: 10;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #333;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
    };
    closeButton.onclick = () => this.closeOverlay(formId);
    
    const iframe = this.createIframe(formId, {
      mode: params.mode,
      theme: params.theme,
      lang: params.lang,
      progress: params.progress || 'top',
    }, hiddenAttr, transitiveAttr);
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    container.appendChild(closeButton);
    container.appendChild(iframe);
    overlay.appendChild(container);
    
    // Add CSS animations
    if (!document.getElementById('fe-embed-styles')) {
      const style = document.createElement('style');
      style.id = 'fe-embed-styles';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(overlay);
    
    // Close on overlay click for popup mode
    if (params.mode === 'popup') {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeOverlay(formId);
        }
      });
    }
    
    // Close on ESC key
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeOverlay(formId);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    this.overlays.set(formId, overlay);
    this.iframes.set(formId, iframe);
  }
  
  private closeOverlay(formId: string, preventReopen: boolean = false) {
    const overlay = this.overlays.get(formId);
    if (overlay) {
      overlay.style.opacity = '0';
      
      if (preventReopen) {
        localStorage.setItem(`fe_closed_${formId}`, 'true');
      }
      
      setTimeout(() => {
        overlay.remove();
        this.overlays.delete(formId);
        this.iframes.delete(formId);
      }, 200);
    }
  }
  
  private initTriggers(formId: string, options: any, hiddenAttr: string, transitiveAttr: string) {
    // Check if already opened and prevent reopen is enabled
    if (options.preventReopen && localStorage.getItem(`fe_closed_${formId}`)) {
      return; // Don't open
    }
    
    switch (options.trigger) {
      case 'immediate':
        this.openOverlay(formId, options, hiddenAttr, transitiveAttr);
        break;
        
      case 'scroll':
        const percentage = options.scrollPercentage || 50;
        this.initScrollTrigger(formId, options, percentage, hiddenAttr, transitiveAttr);
        break;
        
      case 'time':
        const delay = options.delay || 5;
        setTimeout(() => this.openOverlay(formId, options, hiddenAttr, transitiveAttr), delay * 1000);
        break;
        
      case 'exit':
        this.initExitIntentTrigger(formId, options, hiddenAttr, transitiveAttr);
        break;
    }
  }
  
  private initScrollTrigger(formId: string, options: any, percentage: number, hiddenAttr: string, transitiveAttr: string) {
    let triggered = false;
    
    const checkScroll = () => {
      if (triggered) return;
      
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      if (scrolled >= percentage) {
        triggered = true;
        this.openOverlay(formId, options, hiddenAttr, transitiveAttr);
        window.removeEventListener('scroll', checkScroll);
      }
    };
    
    window.addEventListener('scroll', checkScroll);
  }
  
  private initExitIntentTrigger(formId: string, options: any, hiddenAttr: string, transitiveAttr: string) {
    let triggered = false;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return;
      
      // Detect mouse leaving from top of page
      if (e.clientY <= 0) {
        triggered = true;
        this.openOverlay(formId, options, hiddenAttr, transitiveAttr);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
    
    document.addEventListener('mouseleave', handleMouseLeave);
  }
  
  private handleMessage(event: MessageEvent) {
    const data = event.data as FormsEdgeWidgetMessage;
    
    if (!data || data.source !== 'formsedge-widget') return;
    
    const { type, payload } = data;
    const formId = payload.formId;
    const iframe = this.iframes.get(formId);
    
    switch (type) {
      case 'ready':
        console.log('[FormsEdge] Form ready:', formId);
        break;
        
      case 'resize':
        if (iframe && iframe.getAttribute('data-fe-autoresize') === 'true' && payload.height) {
          iframe.style.height = `${payload.height}px`;
        }
        break;
        
      case 'stepChange':
        // Dispatch custom event for external listeners
        document.dispatchEvent(new CustomEvent('formsedge:stepChange', { 
          detail: payload 
        }));
        break;
        
      case 'submit':
        document.dispatchEvent(new CustomEvent('formsedge:submit', { 
          detail: payload 
        }));
        // Handle close with delay if specified
        if (this.overlays.has(formId)) {
          // Try to get closeDelay from trigger element
          const triggers = document.querySelectorAll(`[data-fe-open="${formId}"]`);
          let closeDelay = 2; // default 2 seconds
          let preventReopen = false;
          
          if (triggers.length > 0) {
            const trigger = triggers[0] as HTMLElement;
            const delayAttr = trigger.getAttribute('data-fe-close-delay');
            const preventReopenAttr = trigger.getAttribute('data-fe-prevent-reopen');
            
            if (delayAttr) {
              closeDelay = parseInt(delayAttr);
            }
            if (preventReopenAttr === 'true') {
              preventReopen = true;
            }
          }
          
          setTimeout(() => this.closeOverlay(formId, preventReopen), closeDelay * 1000);
        }
        break;
        
      case 'close':
        // Check if prevent reopen is enabled
        const triggers = document.querySelectorAll(`[data-fe-open="${formId}"]`);
        let preventReopen = false;
        
        if (triggers.length > 0) {
          const trigger = triggers[0] as HTMLElement;
          preventReopen = trigger.getAttribute('data-fe-prevent-reopen') === 'true';
        }
        
        this.closeOverlay(formId, preventReopen);
        break;
    }
  }
  
  // Public API
  public open(opts: EmbedOptions) {
    if (opts.mode === 'inline') {
      console.warn('[FormsEdge] Inline mode cannot be opened programmatically. Use data-fe-form attribute instead.');
      return;
    }
    
    // Build hidden params string from opts.hidden
    const hiddenAttr = opts.hidden 
      ? Object.entries(opts.hidden).map(([k, v]) => `${k}=${v}`).join(',')
      : '';
    
    // Build transitive params string from opts.transitiveParams
    const transitiveAttr = opts.transitiveParams 
      ? opts.transitiveParams.join(',')
      : '';
    
    this.openOverlay(opts.formId, {
      mode: opts.mode || 'popup',
      theme: opts.theme || 'light',
      lang: opts.lang || 'en',
      progress: opts.progress || 'top',
    }, hiddenAttr, transitiveAttr);
  }
}

// Initialize and expose global API
const sdk = new FormsEdgeEmbedSDK();

declare global {
  interface Window {
    FormsEdgeEmbed: {
      open: (opts: EmbedOptions) => void;
    };
  }
}

window.FormsEdgeEmbed = {
  open: (opts) => sdk.open(opts),
};
