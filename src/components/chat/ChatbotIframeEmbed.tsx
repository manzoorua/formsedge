import React, { useEffect, useRef, useState } from 'react';
import { RAGCANVAS_WIDGET_BASE_URL } from '@/lib/constants';
import { MessageCircle } from 'lucide-react';

interface ChatbotIframeEmbedProps {
  widgetId: string;
  initialState?: 'closed' | 'minimized' | 'open';
  mode?: 'app' | 'iframe';
}

export const ChatbotIframeEmbed: React.FC<ChatbotIframeEmbedProps> = ({ 
  widgetId, 
  initialState = 'closed',
  mode = 'app'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOpen, setIsOpen] = useState(initialState === 'open');
  const [isInteractive, setIsInteractive] = useState(initialState === 'open');

  const iframeUrl = mode === 'app'
    ? `${RAGCANVAS_WIDGET_BASE_URL}/widget-app?id=${widgetId}&state=${initialState}`
    : `${RAGCANVAS_WIDGET_BASE_URL}/widget-iframe/${widgetId}?state=${initialState}`;

  const isAppMode = mode === 'app';

  console.info('[Chatbot] Embed mode:', mode, 'url:', iframeUrl);

  // Listen for postMessage events from the widget
  useEffect(() => {
    const allowedOrigin = new URL(RAGCANVAS_WIDGET_BASE_URL).origin;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin) return;
      
      console.log('[Chatbot][Iframe] Message from widget:', event.data);
      
      const data = event.data;
      
      // Enhanced format: { type: 'ragcanvas:state', state: 'open' | 'minimized' | 'closed' }
      if (data?.type === 'ragcanvas:state') {
        if (data.state === 'open') {
          console.log('[Chatbot] Widget opened (enhanced format)');
          setIsOpen(true);
          setIsInteractive(true);
        } else if (data.state === 'minimized' || data.state === 'closed') {
          console.log('[Chatbot] Widget minimized/closed (enhanced format)');
          setIsOpen(false);
          setIsInteractive(false);
        }
      }
      // Fallback: Legacy direct state format
      else if (data?.state === 'open') {
        console.log('[Chatbot] Widget opened');
        setIsOpen(true);
        setIsInteractive(true);
      } else if (data?.state === 'minimized' || data?.state === 'closed') {
        console.log('[Chatbot] Widget minimized/closed');
        setIsOpen(false);
        setIsInteractive(false);
      }
      // Fallback: Boolean flags format
      else if (data?.open === true) {
        console.log('[Chatbot] Widget opened (alt format)');
        setIsOpen(true);
        setIsInteractive(true);
      } else if (data?.minimized === true || data?.closed === true) {
        console.log('[Chatbot] Widget minimized/closed (alt format)');
        setIsOpen(false);
        setIsInteractive(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleProxyClick = () => {
    console.log('[Chatbot][Proxy] Sending toggle command');
    const allowedOrigin = new URL(RAGCANVAS_WIDGET_BASE_URL).origin;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'ragcanvas:command', command: 'toggle' },
      allowedOrigin
    );
    // Fallback: enable interactions after short delay
    setTimeout(() => {
      console.log('[Chatbot][Proxy] Fallback: enabling interactions');
      setIsInteractive(true);
    }, 300);
  };

  console.log('[Chatbot] App mode interactive:', isInteractive);

  return (
    <>
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        style={isAppMode ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 999999,
          border: 'none',
          background: 'transparent',
          pointerEvents: isInteractive ? 'auto' : 'none'
        } : {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '400px',
          height: '600px',
          border: 'none',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
          background: 'transparent'
        }}
        title="RAGcanvas Chat Widget"
        allow={isAppMode ? 'microphone; camera; autoplay; encrypted-media' : 'clipboard-write; microphone'}
        onLoad={() => {
          console.log('[Chatbot] Loaded successfully');
        }}
        onError={() => {
          console.error('[Chatbot] Iframe failed to load', { mode, iframeUrl, widgetId });
        }}
      />
      
      {/* Proxy button for app mode when widget is minimized/closed */}
      {isAppMode && !isInteractive && (
        <button
          type="button"
          onTouchStart={(e) => {
            console.log('[Chatbot][Proxy] Touch event captured on iOS');
            e.preventDefault();
            e.stopPropagation();
            handleProxyClick();
          }}
          onClick={(e) => {
            console.log('[Chatbot][Proxy] Click event captured');
            handleProxyClick();
          }}
          className="fixed bottom-5 right-5 w-16 h-16 rounded-full cursor-pointer"
          style={{ 
            zIndex: 1000000,
            backgroundColor: 'rgba(0,0,0,0.001)',
            border: 'none',
            pointerEvents: 'auto',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            transform: 'translateZ(0)',
            willChange: 'transform',
            contain: 'layout paint'
          }}
          aria-label="Open Chat"
          title="Open Chat"
        >
        </button>
      )}
    </>
  );
};
