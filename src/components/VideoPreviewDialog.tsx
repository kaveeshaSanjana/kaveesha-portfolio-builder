import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface VideoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
}

const VideoPreviewDialog = ({ open, onOpenChange, url, title }: VideoPreviewDialogProps) => {
  const getEmbedUrl = (url: string): string | null => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`;
    }

    // Google Drive URL patterns
    if (url.includes('drive.google.com')) {
      const driveFileIdRegexA = /\/file\/d\/([^\/]+)/;
      const driveFileIdRegexB = /[?&]id=([^&]+)/; // alternative share format
      const driveMatch = url.match(driveFileIdRegexA) || url.match(driveFileIdRegexB);
      if (driveMatch) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
      // Already a preview URL
      if (url.includes('/preview')) {
        return url;
      }
    }

    return null;
  };

  const embedUrl = useMemo(() => getEmbedUrl(url), [url]);
  const [loaded, setLoaded] = useState(false);
  const [fallback, setFallback] = useState(false);

  const isGoogleDrive = embedUrl?.includes('drive.google.com') || false;
  const isYouTube = embedUrl?.includes('youtube') || false;

  // Fallback if iframe doesn't load (common when provider blocks embedding)
  useEffect(() => {
    setLoaded(false);
    setFallback(false);
    if (!embedUrl) return;
    const t = window.setTimeout(() => {
      if (!loaded) setFallback(true);
    }, 2500);
    return () => window.clearTimeout(t);
  }, [embedUrl, open]);

  const shouldUseIframe = !!embedUrl && !fallback;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleSelectStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-full p-0" 
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{title || 'Video Preview'}</span>
          </DialogTitle>
        </DialogHeader>
        <div 
          className="p-6 pt-4" 
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
        >
          {shouldUseIframe ? (
            <div 
              className="relative w-full select-none" 
              style={{ paddingBottom: '56.25%', userSelect: 'none', pointerEvents: 'none' }}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
            >
              <iframe
                src={embedUrl!}
                className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setLoaded(true)}
                allowFullScreen
                style={{ border: 'none' }}
              />
              {/* Security overlay to prevent interactions */}
              <div 
                className="absolute inset-0 z-10"
                onContextMenu={handleContextMenu}
                onDragStart={handleDragStart}
                style={{ 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  pointerEvents: 'none'
                }}
              />
            </div>
          ) : embedUrl ? (
            <div 
              className="relative w-full select-none" 
              style={{ paddingBottom: '56.25%', userSelect: 'none' }}
              onContextMenu={handleContextMenu}
              onDragStart={handleDragStart}
            >
              <iframe
                src={embedUrl!}
                title={title || 'Video Preview'}
                className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setLoaded(true)}
                allowFullScreen
                style={{ border: 'none' }}
              />
              {!loaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/40 border-top-primary" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Unable to preview this video format
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPreviewDialog;
