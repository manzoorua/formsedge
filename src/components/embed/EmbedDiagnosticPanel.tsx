import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Layers, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ElementInfo {
  tagName: string;
  id?: string;
  className?: string;
  zIndex: string;
  pointerEvents: string;
  position: string;
  rect: DOMRect;
  isBlocking: boolean;
  depth: number;
  xpath: string;
}

interface EmbedDiagnosticPanelProps {
  targetSelector?: string;
}

export const EmbedDiagnosticPanel = ({ targetSelector = '.embed-preview-container' }: EmbedDiagnosticPanelProps) => {
  const [elements, setElements] = useState<ElementInfo[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [showOnlyBlocking, setShowOnlyBlocking] = useState(false);
  const [isWaitingForContent, setIsWaitingForContent] = useState(true);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const highlightOverlayRef = useRef<HTMLDivElement | null>(null);
  const rescanTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getXPath = (element: Element): string => {
    if (element.id) return `//*[@id="${element.id}"]`;
    if (element === document.body) return '/html/body';

    let path = '';
    let current: Element | null = element;
    
    while (current && current !== document.body) {
      let index = 1;
      let sibling = current.previousElementSibling;
      
      while (sibling) {
        if (sibling.tagName === current.tagName) index++;
        sibling = sibling.previousElementSibling;
      }
      
      path = `/${current.tagName.toLowerCase()}[${index}]${path}`;
      current = current.parentElement;
    }
    
    return `/html/body${path}`;
  };

  const scanElements = () => {
    setIsScanning(true);
    
    try {
      const targetElement = document.querySelector(targetSelector);
      if (!targetElement) {
        console.warn(`Target element not found: ${targetSelector}`);
        setElements([]);
        return;
      }

      const allElements = targetElement.querySelectorAll('*');
      const elementInfos: ElementInfo[] = [];

      // Also include the container itself
      const containerStyle = window.getComputedStyle(targetElement);
      const containerRect = targetElement.getBoundingClientRect();
      
      elementInfos.push({
        tagName: targetElement.tagName.toLowerCase(),
        id: targetElement.id || undefined,
        className: targetElement.className || undefined,
        zIndex: containerStyle.zIndex,
        pointerEvents: containerStyle.pointerEvents,
        position: containerStyle.position,
        rect: containerRect,
        isBlocking: containerStyle.pointerEvents !== 'none' && 
                   containerStyle.position !== 'static' && 
                   containerStyle.zIndex !== 'auto',
        depth: 0,
        xpath: getXPath(targetElement)
      });

      allElements.forEach((el, index) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        
        // Calculate depth in the DOM tree
        let depth = 0;
        let parent = el.parentElement;
        while (parent && parent !== targetElement) {
          depth++;
          parent = parent.parentElement;
        }

        // Detect potential blocking elements
        const isBlocking = (
          style.pointerEvents === 'auto' && 
          style.position !== 'static' && 
          parseInt(style.zIndex) > 0 &&
          rect.width > 0 &&
          rect.height > 0
        ) || (
          style.pointerEvents === 'auto' &&
          style.position === 'fixed' &&
          rect.width > window.innerWidth * 0.5 &&
          rect.height > window.innerHeight * 0.5
        );

        elementInfos.push({
          tagName: el.tagName.toLowerCase(),
          id: el.id || undefined,
          className: el.className || undefined,
          zIndex: style.zIndex,
          pointerEvents: style.pointerEvents,
          position: style.position,
          rect,
          isBlocking,
          depth,
          xpath: getXPath(el)
        });
      });

      // Sort by z-index (highest first), then by depth
      elementInfos.sort((a, b) => {
        const aZ = a.zIndex === 'auto' ? 0 : parseInt(a.zIndex);
        const bZ = b.zIndex === 'auto' ? 0 : parseInt(b.zIndex);
        if (aZ !== bZ) return bZ - aZ;
        return a.depth - b.depth;
      });

      setElements(elementInfos);
      setIsWaitingForContent(elementInfos.length === 0);
      setLastScanTime(new Date());
      
      // If we found very few elements, we likely scanned during loading
      // Schedule another scan to catch the actual content
      if (elementInfos.length < 10 && !isWaitingForContent) {
        console.log(`Diagnostic: Found only ${elementInfos.length} elements, scheduling retry...`);
        setTimeout(scanElements, 1000);
      }
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const targetElement = document.querySelector(targetSelector);
    
    // Initial scan - wait 2 seconds for form data to load from Supabase
    const initialTimer = setTimeout(scanElements, 2000);
    
    if (!targetElement) {
      return () => clearTimeout(initialTimer);
    }

    // Watch for DOM changes with MutationObserver
    const observer = new MutationObserver((mutations) => {
      // Check if significant changes occurred (nodes added/removed)
      const hasSignificantChange = mutations.some(m => 
        m.addedNodes.length > 0 || m.removedNodes.length > 0
      );
      
      if (hasSignificantChange) {
        // Debounce: clear previous timer and set new one (800ms for React rendering)
        if (rescanTimerRef.current) {
          clearTimeout(rescanTimerRef.current);
        }
        rescanTimerRef.current = setTimeout(scanElements, 800);
      }
    });

    observer.observe(targetElement, {
      childList: true,
      subtree: true,
      attributes: true, // Watch class/style changes to detect React updates
      attributeFilter: ['class', 'style'],
    });

    return () => {
      clearTimeout(initialTimer);
      if (rescanTimerRef.current) {
        clearTimeout(rescanTimerRef.current);
      }
      observer.disconnect();
    };
  }, [targetSelector]);

  const handleMouseEnter = (xpath: string, rect: DOMRect) => {
    setHighlightedElement(xpath);
    
    // Create or update highlight overlay
    if (!highlightOverlayRef.current) {
      const overlay = document.createElement('div');
      overlay.id = 'diagnostic-highlight-overlay';
      overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        border: 2px solid #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
        z-index: 999999;
        transition: all 0.2s ease;
      `;
      document.body.appendChild(overlay);
      highlightOverlayRef.current = overlay;
    }

    const overlay = highlightOverlayRef.current;
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.display = 'block';
  };

  const handleMouseLeave = () => {
    setHighlightedElement(null);
    if (highlightOverlayRef.current) {
      highlightOverlayRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup overlay on unmount
      if (highlightOverlayRef.current) {
        highlightOverlayRef.current.remove();
      }
    };
  }, []);

  const getElementLabel = (el: ElementInfo): string => {
    let label = el.tagName;
    if (el.id) label += `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        label += `.${classes[0]}${classes.length > 1 ? '...' : ''}`;
      }
    }
    return label;
  };

  const filteredElements = showOnlyBlocking 
    ? elements.filter(el => el.isBlocking)
    : elements;

  const blockingCount = elements.filter(el => el.isBlocking).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Element Stack Diagnostic
            </CardTitle>
            <CardDescription>
              Z-index and pointer-events inspector for embed preview
            </CardDescription>
            {lastScanTime && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Last scanned: {lastScanTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyBlocking(!showOnlyBlocking)}
            >
              {showOnlyBlocking ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show All
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Show Blocking
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scanElements}
              disabled={isScanning}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Rescan Now'}
            </Button>
          </div>
        </div>
        {!isScanning && (
          <p className="text-xs text-muted-foreground mt-2">
            Auto-scans every 2 seconds during loading. Click "Rescan Now" if the preview appears but elements aren't detected.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isWaitingForContent && filteredElements.length === 0 && !isScanning && (
          <Alert className="mb-4 border-muted-foreground/20 bg-muted/30">
            <AlertDescription>
              Waiting for preview content to load... This may take a few seconds.
            </AlertDescription>
          </Alert>
        )}
        
        {blockingCount > 0 && (
          <Alert className="mb-4 border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Found {blockingCount} potentially blocking element{blockingCount !== 1 ? 's' : ''} with pointer-events: auto and elevated z-index
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[500px] w-full rounded-md border">
          <div className="p-4 space-y-2">
            {filteredElements.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {showOnlyBlocking 
                  ? 'No blocking elements detected'
                  : 'No elements found. Click Rescan to analyze the preview area.'
                }
              </div>
            ) : (
              filteredElements.map((el, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    el.isBlocking 
                      ? 'border-destructive/50 bg-destructive/5 hover:bg-destructive/10' 
                      : 'border-border hover:bg-muted/50'
                  } ${highlightedElement === el.xpath ? 'ring-2 ring-primary' : ''}`}
                  onMouseEnter={() => handleMouseEnter(el.xpath, el.rect)}
                  onMouseLeave={handleMouseLeave}
                  style={{ marginLeft: `${el.depth * 12}px` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono font-semibold text-foreground">
                          {getElementLabel(el)}
                        </code>
                        {el.isBlocking && (
                          <Badge variant="destructive" className="text-xs">
                            Blocking
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">z-index:</span>{' '}
                          <code className={el.zIndex !== 'auto' && parseInt(el.zIndex) > 0 ? 'text-warning' : ''}>
                            {el.zIndex}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">pointer-events:</span>{' '}
                          <code className={el.pointerEvents === 'auto' ? 'text-destructive' : 'text-success'}>
                            {el.pointerEvents}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">position:</span>{' '}
                          <code>{el.position}</code>
                        </div>
                        <div>
                          <span className="font-medium">size:</span>{' '}
                          <code>
                            {Math.round(el.rect.width)}×{Math.round(el.rect.height)}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs space-y-2">
          <div className="font-medium text-foreground">Legend:</div>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-destructive/50 bg-destructive/5"></div>
              <span>Potentially blocking (pointer-events: auto + elevated z-index)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-border"></div>
              <span>Non-blocking or transparent</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/50">
            <p>
              <strong>Tip:</strong> Hover over elements to highlight them in the preview area.
              Elements with <code className="text-destructive">pointer-events: auto</code> and high z-index may block clicks.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
