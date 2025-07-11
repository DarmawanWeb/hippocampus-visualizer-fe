// app/dashboard/viewer/components/niivue-viewer.tsx - FIXED VERSION
'use client';

import { Niivue } from '@niivue/niivue';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

// Define proper types and interfaces
interface Volume {
  url?: string;
  file?: File;
  opacity?: number;
  colormap?: string;
}

interface ExtendedVolume {
  cal_min: number;
  cal_max: number;
  global_min: number;
  global_max: number;
  colormap: string;
  originalCalMin?: number;
  originalCalMax?: number;
  originalGlobalMin?: number;
  originalGlobalMax?: number;
}

// Type for accessing Niivue methods safely
interface NiivueInstance {
  volumes?: (ExtendedVolume | Volume)[];
  meshes?: unknown[];
  opts?: {
    dragMode?: number;
  };
  setOpacity?: (index: number, opacity: number) => void;
  updateGLVolume?: () => void;
  drawScene?: () => void;
  setColormap?: (index: number, colormap: string) => void;
  loadVolumes?: (volumes: Volume[]) => Promise<void>;
  dispose?: () => void;
  attachToCanvas?: (canvas: HTMLCanvasElement) => void;
}

interface NiiVueViewerProps {
  imageUrl?: string;
  imageFile?: File | null;
  overlayUrl?: string;
  overlayFile?: File | null;
  onError?: (error: string) => void;
  onLoading?: (loading: boolean) => void;
  overlayOpacity?: number;
  showOverlay?: boolean;
  brightness?: number;
  contrast?: number;
  colormap?: string;
  activeTool?: 'pan' | 'zoom' | 'comment' | null;
  className?: string;
}

const NiiVueViewer: React.FC<NiiVueViewerProps> = ({
  imageUrl,
  imageFile,
  overlayUrl,
  overlayFile,
  onError,
  onLoading,
  overlayOpacity = 0.7,
  showOverlay = true,
  brightness = 50,
  contrast = 50,
  colormap = 'gray',
  activeTool = null,
  className = 'w-full h-full',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nvRef = useRef<(Niivue & NiivueInstance) | null>(null);
  const mountedRef = useRef(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [internalOverlayOpacity, setInternalOverlayOpacity] = useState([
    overlayOpacity,
  ]);
  const [internalShowOverlay, setInternalShowOverlay] = useState(showOverlay);

  // Store previous values to prevent unnecessary updates
  const prevControlsRef = useRef({ brightness, contrast, colormap });
  const prevOverlayRef = useRef({ overlayFile, overlayUrl });

  // Apply image controls function
  const applyImageControls = useCallback(
    (brightVal: number, contrastVal: number, colormapVal: string) => {
      if (!nvRef.current || !isInitialized) return;

      try {
        const nv = nvRef.current;
        if (!nv?.volumes || nv.volumes.length === 0) return;

        const vol = nv.volumes[0] as ExtendedVolume;

        // Store original values only once
        if (typeof vol.originalCalMin === 'undefined') {
          vol.originalCalMin = vol.cal_min;
          vol.originalCalMax = vol.cal_max;
          vol.originalGlobalMin = vol.global_min;
          vol.originalGlobalMax = vol.global_max;
        }

        // Apply brightness/contrast - with proper type checking
        if (
          vol.originalCalMin !== undefined &&
          vol.originalCalMax !== undefined
        ) {
          const originalRange = vol.originalCalMax - vol.originalCalMin;
          const brightnessOffset = (brightVal - 50) / 50;
          const center = (vol.originalCalMin + vol.originalCalMax) / 2;
          const newCenter = center + brightnessOffset * originalRange * 0.5;
          const contrastFactor = contrastVal / 50;
          const newWidth = originalRange * contrastFactor;

          vol.cal_min = newCenter - newWidth / 2;
          vol.cal_max = newCenter + newWidth / 2;

          // Ensure bounds
          if (
            vol.originalGlobalMin !== undefined &&
            vol.originalGlobalMax !== undefined
          ) {
            vol.cal_min = Math.max(vol.cal_min, vol.originalGlobalMin);
            vol.cal_max = Math.min(vol.cal_max, vol.originalGlobalMax);
          }
        }

        // Apply colormap
        if (vol.colormap !== colormapVal) {
          vol.colormap = colormapVal;
          try {
            if (nv.setColormap) nv.setColormap(0, colormapVal);
          } catch (e) {
            // console.warn('Failed to set colormap:', e);
          }
        }

        // Force update
        if (nv.updateGLVolume) nv.updateGLVolume();
        if (nv.drawScene) nv.drawScene();
      } catch (error) {
        // console.warn('Error applying image controls:', error);
      }
    },
    [isInitialized],
  );

  // Handle overlay opacity updates
  const updateOverlayOpacity = useCallback((opacity: number) => {
    if (!nvRef.current) return;

    const nv = nvRef.current;
    if (nv.volumes && nv.volumes.length > 1) {
      try {
        if (nv.setOpacity) nv.setOpacity(1, opacity);
        if (nv.updateGLVolume) nv.updateGLVolume();
      } catch (error) {
        // console.warn('Error updating overlay opacity:', error);
      }
    }
  }, []);

  // Initialize viewer effect
  useEffect(() => {
    const initializeViewer = async () => {
      const hasImage = imageUrl || imageFile;
      if (!hasImage || !canvasRef.current || !mountedRef.current) return;

      try {
        onLoading?.(true);

        // Cleanup existing viewer
        if (nvRef.current) {
          try {
            if (nvRef.current.dispose) nvRef.current.dispose();
          } catch (error) {
            // console.warn('Error disposing viewer:', error);
          }
          nvRef.current = null;
          setIsInitialized(false);
        }

        const nv = new Niivue({
          show3Dcrosshair: true,
          backColor: [0.1, 0.1, 0.1, 1],
          crosshairColor: [1, 0, 0, 1],
          multiplanarPadPixels: 8,
          multiplanarForceRender: true,
          multiplanarLayout: 2,
          isColorbar: true,
          textHeight: 0.04,
          colorbarHeight: 0.04,
          crosshairWidth: 1,
          dragMode: 1,
        });

        nv.attachToCanvas(canvasRef.current);

        // Build volume list
        const volumeList: Volume[] = [];

        // Base image
        if (imageFile) {
          volumeList.push({ file: imageFile });
        } else if (imageUrl) {
          volumeList.push({ url: imageUrl });
        }

        // Add overlay if exists
        if (overlayFile || overlayUrl) {
          const overlayOpacityValue = internalShowOverlay
            ? internalOverlayOpacity[0]
            : 0;

          if (overlayFile) {
            volumeList.push({
              file: overlayFile,
              opacity: overlayOpacityValue,
              colormap: 'warm',
            });
          } else if (overlayUrl) {
            volumeList.push({
              url: overlayUrl,
              opacity: overlayOpacityValue,
              colormap: 'warm',
            });
          }
        }

        if (volumeList.length === 0) {
          throw new Error('No image to load');
        }

        // Load volumes - cast to any to access loadVolumes method
        await (nv as Niivue & NiivueInstance).loadVolumes(volumeList);

        if (!mountedRef.current) return;

        // Store reference with type intersection
        nvRef.current = nv as Niivue & NiivueInstance;
        setIsInitialized(true);
        onLoading?.(false);
      } catch (err) {
        if (mountedRef.current) {
          if (nvRef.current) {
            try {
              if (nvRef.current.dispose) nvRef.current.dispose();
            } catch (error) {
              // console.warn('Error disposing viewer on error:', error);
            }
            nvRef.current = null;
            setIsInitialized(false);
          }
          onError?.(
            err instanceof Error ? err.message : 'Failed to load image',
          );
          onLoading?.(false);
        }
      }
    };

    initializeViewer();
    prevOverlayRef.current = { overlayFile, overlayUrl };
  }, [
    imageUrl,
    imageFile,
    overlayUrl,
    overlayFile,
    internalOverlayOpacity,
    internalShowOverlay,
    onError,
    onLoading,
  ]);

  // Update drag mode when tool changes
  useEffect(() => {
    if (nvRef.current && isInitialized) {
      try {
        const dragMode =
          activeTool === 'pan' ? 1 : activeTool === 'zoom' ? 3 : 1;
        if (nvRef.current.opts) {
          nvRef.current.opts.dragMode = dragMode;
        }
      } catch (error) {
        // console.warn('Error setting drag mode:', error);
      }
    }
  }, [activeTool, isInitialized]);

  // Apply image controls when values change
  useEffect(() => {
    if (isInitialized && nvRef.current) {
      const prev = prevControlsRef.current;

      if (
        prev.brightness !== brightness ||
        prev.contrast !== contrast ||
        prev.colormap !== colormap
      ) {
        applyImageControls(brightness, contrast, colormap);
        prevControlsRef.current = { brightness, contrast, colormap };
      }
    }
  }, [brightness, contrast, colormap, isInitialized, applyImageControls]);

  // Sync external overlay props
  useEffect(() => {
    if (overlayOpacity !== internalOverlayOpacity[0]) {
      setInternalOverlayOpacity([overlayOpacity]);
      if (isInitialized && internalShowOverlay) {
        updateOverlayOpacity(overlayOpacity);
      }
    }
  }, [
    overlayOpacity,
    isInitialized,
    internalShowOverlay,
    updateOverlayOpacity,
    internalOverlayOpacity,
  ]);

  useEffect(() => {
    if (showOverlay !== internalShowOverlay) {
      setInternalShowOverlay(showOverlay);
      if (isInitialized) {
        updateOverlayOpacity(showOverlay ? internalOverlayOpacity[0] : 0);
      }
    }
  }, [
    showOverlay,
    isInitialized,
    internalOverlayOpacity,
    updateOverlayOpacity,
    internalShowOverlay,
  ]);

  // Handle internal opacity changes
  useEffect(() => {
    if (isInitialized && internalShowOverlay) {
      updateOverlayOpacity(internalOverlayOpacity[0]);
    }
  }, [
    internalOverlayOpacity,
    isInitialized,
    internalShowOverlay,
    updateOverlayOpacity,
  ]);

  // Hot-swap overlay when overlay changes
  useEffect(() => {
    const updateOverlay = async (
      newOverlayFile?: File | null,
      newOverlayUrl?: string,
    ) => {
      if (!nvRef.current || !isInitialized) return;

      try {
        const nv = nvRef.current;

        // Remove existing overlay
        if (nv.volumes && nv.volumes.length > 1) {
          nv.volumes.splice(1);
          if (nv.meshes) nv.meshes.splice(1);
        }

        // Add new overlay if provided
        if (newOverlayFile || newOverlayUrl) {
          const overlayOpacityValue = internalShowOverlay
            ? internalOverlayOpacity[0]
            : 0;

          const overlayVolume: Volume = {
            opacity: overlayOpacityValue,
            colormap: 'warm',
          };

          if (newOverlayFile) {
            overlayVolume.file = newOverlayFile;
          } else if (newOverlayUrl) {
            overlayVolume.url = newOverlayUrl;
          }

          try {
            // Try to load just the overlay volume
            if (nv.loadVolumes) {
              await nv.loadVolumes([overlayVolume]);
            }
          } catch (e) {
            // If that fails, reload all volumes
            // console.warn(
            //   'Failed to load overlay alone, reloading all volumes:',
            //   e,
            // );
            if (nv.volumes && nv.volumes.length > 0 && nv.loadVolumes) {
              const currentVolumes = [...nv.volumes] as Volume[];
              currentVolumes.push(overlayVolume);
              await nv.loadVolumes(currentVolumes);
            }
          }
        }

        if (nv.updateGLVolume) nv.updateGLVolume();
        if (nv.drawScene) nv.drawScene();
      } catch (error) {
        // console.warn('Error updating overlay:', error);
      }
    };

    const prev = prevOverlayRef.current;
    const overlayChanged =
      prev.overlayFile !== overlayFile || prev.overlayUrl !== overlayUrl;

    if (overlayChanged && isInitialized) {
      updateOverlay(overlayFile, overlayUrl);
      prevOverlayRef.current = { overlayFile, overlayUrl };
    }
  }, [
    overlayFile,
    overlayUrl,
    isInitialized,
    internalShowOverlay,
    internalOverlayOpacity,
  ]);

  // Mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (nvRef.current) {
        try {
          if (nvRef.current.dispose) nvRef.current.dispose();
        } catch (error) {
          // console.warn('Error disposing viewer on unmount:', error);
        }
        nvRef.current = null;
      }
    };
  }, []);

  const hasOverlay = Boolean(overlayUrl || overlayFile);

  return (
    <div className="w-full h-full relative bg-slate-900">
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {!isInitialized && (imageUrl || imageFile) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-20">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading medical image{hasOverlay ? ' with overlay' : ''}...</p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {isInitialized && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded z-20">
          <div>
            B: {brightness}% | C: {contrast}% | {colormap}
          </div>
          <div>Tool: {activeTool || 'none'}</div>
        </div>
      )}
    </div>
  );
};

export default NiiVueViewer;
