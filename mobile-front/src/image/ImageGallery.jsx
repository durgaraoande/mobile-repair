import React, { useState } from 'react';
import { Download, X, Image as ImageIcon } from 'lucide-react';

// ImageGallery component
export const CloudinaryImageGallery = ({ images, title }) => {
  if (!images?.length) return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <p className="text-gray-500">No images available</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {images.map((publicId, index) => (
          <CloudinaryImage
            key={index}
            publicId={publicId}
            alt={`Image ${index + 1}`}
            className="aspect-square h-auto w-full"
          />
        ))}
      </div>
    </div>
  );
};

// Individual image component with error handling and fallback
const CloudinaryImage = ({
  publicId,
  alt,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Create direct Cloudinary URLs
  const cloudName = 'dpu6nakpg';
  
  // Using direct URL format instead of the SDK
  const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_300,h_300/${publicId}`;
  const fullImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_fit,w_1200,h_800/${publicId}`;

  if (!publicId || hasError) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  const handleImageError = () => {
    setHasError(true);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(fullImageUrl);
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

  return (
    <>
      <div className="relative group">
        {/* Placeholder that shows until image is loaded */}
        <div 
          className={`bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer ${className} ${isLoaded ? 'hidden' : 'block'}`}
          onClick={() => setIsModalOpen(true)}
        >
          <ImageIcon className="w-10 h-10 text-gray-400" />
        </div>
        
        {/* Actual image container */}
        <div 
          className={`rounded-lg overflow-hidden cursor-pointer ${isLoaded ? 'block' : 'hidden'}`}
          onClick={() => setIsModalOpen(true)}
        >
          <img 
            src={thumbnailUrl}
            alt={alt}
            className="w-full h-full object-cover rounded-lg"
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
          />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 rounded-lg">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-white font-bold">View</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            {/* Loading spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <img
              src={fullImageUrl}
              alt={alt}
              className="max-w-full max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
              onLoad={(e) => {
                // Hide spinner when image loads
                const parent = e.target.parentNode;
                if (parent && parent.firstChild) {
                  parent.firstChild.style.display = 'none';
                }
              }}
            />
            
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                aria-label="Close image view"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                aria-label="Download image"
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};