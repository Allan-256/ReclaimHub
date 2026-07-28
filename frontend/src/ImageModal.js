import React from 'react';

function ImageModal({ imageUrl, alt, onClose }) {
  if (!imageUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        cursor: 'pointer',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt || 'Item image'}
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-10px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.25)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.15)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>

        {/* Instructions */}
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          Click anywhere to close
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
