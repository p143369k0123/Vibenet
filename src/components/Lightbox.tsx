import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate
}: LightboxProps) {
  if (images.length === 0 || currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    onNavigate(prevIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    onNavigate(nextIdx);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_linear] select-none"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:opacity-80 p-1.5 bg-black/50 rounded-full transition-opacity z-50 cursor-pointer border border-[#262626]"
      >
        <X size={20} />
      </button>

      <div className="relative w-full max-w-md max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 text-white bg-black/60 hover:bg-black/90 w-10 h-10 rounded-full flex items-center justify-center text-lg z-50 border border-white/10 hover:border-white/30 transition-all cursor-pointer active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <img
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-[#262626] animate-[zoomIn_0.15s_ease-out] select-none"
          src={images[currentIndex]}
          alt="Lightbox expanded view"
        />

        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 text-white bg-black/60 hover:bg-black/90 w-10 h-10 rounded-full flex items-center justify-center text-lg z-50 border border-white/10 hover:border-white/30 transition-all cursor-pointer active:scale-95"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
