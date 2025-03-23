import React, { useState, useEffect } from 'react';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, lazyload, responsive, placeholder } from '@cloudinary/react';
import { fill, scale } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { Download, X, ZoomIn } from 'lucide-react';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dpu6nakpg'
  }
});

export const OptimizedCloudinaryImage = ({
  publicId,
  alt,
  className = '',
  maxWidth = 800,
  maxHeight = 600,
  onError = () => {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Handle touch events for swipe to close
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > 50;
    
    if (isSwipe) {
      setIsModalOpen(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Error handler
  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError(publicId);
  };

  // Create optimized image transformations
  const getOptimizedImage = (width, height, isThumb = false) => {
    if (!publicId) return null;
    
    let transformation = cld
      .image(publicId)
      .format('auto')
      .quality(auto());

    if (isThumb) {
      transformation = transformation
        .resize(fill().width(width).height(height))
        .delivery(quality(60));
    } else {
      transformation = transformation
        .resize(scale().width(width).height(height))
        .delivery(quality(80));
    }

    return transformation;
  };

  // Generate different sizes for responsive images
  const thumbnailImage = getOptimizedImage(300, 300, true);
  const fullImage = getOptimizedImage(maxWidth, maxHeight);

  if (!publicId || hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(fullImage.toURL());
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${alt || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Handle keyboard events for modal and accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="group relative">
        <div 
          className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300
            shadow-sm hover:shadow-md ${className}`}
          onClick={() => setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setIsModalOpen(true)}
          aria-label={`View larger image: ${alt}`}
        >
          {/* Loading placeholder */}
          <div 
            className={`absolute inset-0 bg-gray-200 animate-pulse rounded-lg transition-opacity duration-300
              ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {/* Thumbnail image */}
          <AdvancedImage
            cldImg={thumbnailImage}
            plugins={[lazyload(), responsive(), placeholder()]}
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
            className={`w-full h-full object-cover transition-opacity duration-300 rounded-lg
              ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            alt={alt}
          />

          {/* Hover overlay with zoom icon */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 
            transition-all duration-200 rounded-lg">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 
              transition-opacity duration-200">
              <button
                onClick={handleDownload}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  transition-transform duration-200 hover:scale-110"
                title="Download image"
                aria-label="Download image"
              >
                <Download className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for enlarged view */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90
            backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsModalOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative max-w-7xl max-h-[90vh] mx-4 p-2">
            <AdvancedImage
              cldImg={fullImage}
              plugins={[responsive()]}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              alt={alt}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100
                  transition-colors duration-200"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close image view"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <button
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100
                  transition-colors duration-200"
                onClick={handleDownload}
                aria-label="Download image"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Mobile swipe indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
              text-white text-sm opacity-70 md:hidden">
              Swipe up to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};