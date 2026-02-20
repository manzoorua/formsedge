/**
 * FormsEdge Embed SDK
 * Standalone script for embedding forms on external websites
 * This file is auto-generated - do not edit manually
 * 
 * Source: src/embed/formsedge-embed.ts
 * To rebuild: Run `npm run build` or use the build system
 */

(function() {
  'use strict';

  class FormsEdgeEmbedSDK {
    constructor() {
      this.iframes = new Map();
      this.overlays = new Map();
      this.baseUrl = this.getBaseUrl();
      this.init();
    }

    getBaseUrl() {
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

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.scanAndMount());
      } else {
        this.scanAndMount();
      }
      
      window.addEventListener('message', (event) => this.handleMessage(event));
    }

    isReservedParam(name) {
      const RESERVED = new Set(['embed', 'mode', 'org_id', 'theme', 'lang', 'progress', 'hideTitle', 'hideDescription']);
      return RESERVED.has(name);
    }

    parseHiddenParams(hiddenAttr) {
      const result = {};
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

    parseTransitiveParams(transitiveAttr) {
      if (!transitiveAttr) return [];
      return transitiveAttr
        .split(',')
        .map(s => s.trim())
        .filter(key => key && !this.isReservedParam(key));
    }

    scanAndMount() {
      try {
        // Find inline containers
        const inlineContainers = document.querySelectorAll('[data-fe-form]:not([data-fe-mode="popup"]):not([data-fe-mode="slidein"])');
        inlineContainers.forEach((el) => this.mountInline(el));
        
        // Find popup/slidein triggers
        const triggers = document.querySelectorAll('[data-fe-open]');
        triggers.forEach((el) => this.attachTrigger(el));

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

    mountInline(container) {
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

    attachTrigger(trigger) {
      const formId = trigger.getAttribute('data-fe-open');
      const mode = trigger.getAttribute('data-fe-mode') || 'popup';
      const theme = trigger.getAttribute('data-fe-theme') || 'light';
      const lang = trigger.getAttribute('data-fe-lang') || 'en';
      const progress = trigger.getAttribute('data-fe-progress') || 'top';
      const hiddenAttr = trigger.getAttribute('data-fe-hidden') || '';
      const transitiveAttr = trigger.getAttribute('data-fe-transitive-params') || '';
      const popupSize = trigger.getAttribute('data-fe-popup-size');
      const slideDirection = trigger.getAttribute('data-fe-slide-direction');
      
      const tabText = trigger.getAttribute('data-fe-tab-text');
      const icon = trigger.getAttribute('data-fe-icon');
      const iconSize = trigger.getAttribute('data-fe-icon-size');
      const tooltipText = trigger.getAttribute('data-fe-tooltip');
      
      const triggerType = trigger.getAttribute('data-fe-trigger');
      const scrollPercentage = trigger.getAttribute('data-fe-scroll-percentage');
      const delay = trigger.getAttribute('data-fe-delay');
      const preventReopen = trigger.getAttribute('data-fe-prevent-reopen') === 'true';
      const autoLaunch = trigger.getAttribute('data-fe-auto-launch') === 'true';
      const closeDelay = trigger.getAttribute('data-fe-close-delay');
      
      if (!formId) return;
      
      if (mode === 'slidein') {
        this.createSideTab(trigger, formId, {
          mode, theme, lang, progress, popupSize, slideDirection
        }, hiddenAttr, transitiveAttr, tabText, icon, iconSize, tooltipText);
        
        if (autoLaunch) {
          const opts = { trigger: triggerType || 'immediate', scrollPercentage, delay, preventReopen, closeDelay };
          this.initTriggers(formId, { mode, theme, lang, progress, popupSize, slideDirection, ...opts }, hiddenAttr, transitiveAttr);
        }
      } else {
        if (autoLaunch) {
          const opts = { trigger: triggerType || 'immediate', scrollPercentage, delay, preventReopen, closeDelay };
          this.initTriggers(formId, { mode, theme, lang, progress, popupSize, slideDirection, ...opts }, hiddenAttr, transitiveAttr);
        } else {
          trigger.addEventListener('click', (e) => {
            e.preventDefault();
            this.openOverlay(formId, { mode, theme, lang, progress, popupSize, slideDirection }, hiddenAttr, transitiveAttr);
          });
        }
      }
    }

    createIframe(formId, params, hiddenAttr = '', transitiveAttr = '') {
      if (!this.baseUrl) {
        console.error('[FormsEdge] Cannot create iframe: base URL is not set');
        return document.createElement('iframe');
      }
      
      const iframe = document.createElement('iframe');
      iframe.setAttribute('data-fe-form-id', formId);
      
      const urlParams = new URLSearchParams({
        embed: '1',
        mode: params.mode || 'inline',
        theme: params.theme || 'light',
        lang: params.lang || 'en',
      });
      
      if (params.progress) urlParams.set('progress', params.progress);
      
      const hiddenParams = this.parseHiddenParams(hiddenAttr);
      Object.entries(hiddenParams).forEach(([key, value]) => {
        urlParams.set(key, value);
      });
      
      const transitiveKeys = this.parseTransitiveParams(transitiveAttr);
      const currentUrlParams = new URLSearchParams(window.location.search);
      transitiveKeys.forEach((key) => {
        const val = currentUrlParams.get(key);
        if (val !== null) {
          urlParams.set(key, val);
        }
      });
      
      iframe.src = `${this.baseUrl}/f/${formId}?${urlParams.toString()}`;
      iframe.allow = 'geolocation; microphone; camera';
      iframe.loading = 'lazy';
      
      return iframe;
    }

    createSideTab(trigger, formId, params, hiddenAttr, transitiveAttr, tabText, icon, iconSize, tooltipText) {
      const direction = params.slideDirection || 'right';
      const tab = document.createElement('button');
      tab.setAttribute('data-fe-tab', formId);
      tab.setAttribute('aria-label', 'Open form');
      
      if (tooltipText) {
        tab.setAttribute('title', tooltipText);
      }
      
      const iconHTML = icon ? 
        (icon.startsWith('http') ? 
          `<img src="${icon}" alt="" style="width: ${iconSize || 20}px; height: ${iconSize || 20}px; margin-bottom: 8px;" />` : 
          `<i data-lucide="${icon}" style="width: ${iconSize || 20}px; height: ${iconSize || 20}px; margin-bottom: 8px;"></i>`) : 
        '';
      
      tab.innerHTML = iconHTML + (tabText || 'Try me!');
      
      tab.style.cssText = `
        position: fixed;
        ${direction}: -2px;
        top: 50%;
        transform: translateY(-50%) rotate(${direction === 'right' ? '-90deg' : '90deg'});
        transform-origin: ${direction === 'right' ? 'right center' : 'left center'};
        background: ${params.buttonColor || '#8B5CF6'};
        color: white;
        border: none;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        z-index: 999998;
        border-radius: 8px 8px 0 0;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      `;
      
      tab.addEventListener('mouseenter', () => {
        tab.style.transform = `translateY(-50%) translateX(${direction === 'right' ? '-2px' : '2px'}) rotate(${direction === 'right' ? '-90deg' : '90deg'})`;
      });
      
      tab.addEventListener('mouseleave', () => {
        tab.style.transform = `translateY(-50%) rotate(${direction === 'right' ? '-90deg' : '90deg'})`;
      });
      
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.openOverlay(formId, params, hiddenAttr, transitiveAttr);
      });
      
      document.body.appendChild(tab);
      
      trigger.style.display = 'none';
    }

    openOverlay(formId, params, hiddenAttr = '', transitiveAttr = '') {
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
        container.style.cssText = `
          position: fixed;
          bottom: 20px;
          ${direction}: 20px;
          width: 400px;
          max-width: calc(100vw - 40px);
          height: 600px;
          max-height: calc(100vh - 40px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
          animation: ${direction === 'right' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out;
          pointer-events: auto;
        `;
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
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
      });
      
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
      });
      
      closeButton.addEventListener('click', () => this.closeOverlay(formId));
      
      const iframe = this.createIframe(formId, params, hiddenAttr, transitiveAttr);
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      container.appendChild(closeButton);
      container.appendChild(iframe);
      overlay.appendChild(container);
      document.body.appendChild(overlay);
      
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
      
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay && params.mode === 'popup') {
          this.closeOverlay(formId);
        }
      });
      
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          this.closeOverlay(formId);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
      
      this.overlays.set(formId, overlay);
      this.iframes.set(formId, iframe);
    }

    closeOverlay(formId, preventReopen = false) {
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

    initTriggers(formId, options, hiddenAttr, transitiveAttr) {
      if (options.preventReopen && localStorage.getItem(`fe_closed_${formId}`)) {
        return;
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

    initScrollTrigger(formId, options, percentage, hiddenAttr, transitiveAttr) {
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

    initExitIntentTrigger(formId, options, hiddenAttr, transitiveAttr) {
      let triggered = false;
      
      const handleMouseLeave = (e) => {
        if (triggered) return;
        
        if (e.clientY <= 0) {
          triggered = true;
          this.openOverlay(formId, options, hiddenAttr, transitiveAttr);
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
      
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    handleMessage(event) {
      if (!event.data || event.data.source !== 'formsedge-widget') return;
      
      const { type, payload } = event.data;
      
      if (type === 'ready') {
        console.log('[FormsEdge] Form ready:', payload.formId);
      } else if (type === 'resize') {
        const iframe = this.iframes.get(payload.formId);
        if (iframe && iframe.getAttribute('data-fe-autoresize') === 'true') {
          iframe.style.height = payload.height + 'px';
        }
      } else if (type === 'submit') {
        console.log('[FormsEdge] Form submitted:', payload);
        if (this.overlays.has(payload.formId)) {
          const closeDelay = parseInt(event.data.closeDelay) || 0;
          setTimeout(() => {
            this.closeOverlay(payload.formId, true);
          }, closeDelay * 1000);
        }
      }
    }

    open(opts) {
      if (!opts || !opts.formId) {
        console.error('[FormsEdge] open() requires formId');
        return;
      }
      
      this.openOverlay(opts.formId, {
        mode: opts.mode || 'popup',
        theme: opts.theme || 'light',
        lang: opts.lang || 'en',
        progress: opts.progress,
        popupSize: opts.popupSize,
        slideDirection: opts.slideDirection,
      }, '', '');
    }
  }

  // Initialize SDK
  const sdk = new FormsEdgeEmbedSDK();
  
  // Expose public API
  window.FormsEdgeEmbed = {
    open: (opts) => sdk.open(opts),
  };
})();
