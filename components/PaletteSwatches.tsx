export function PaletteSwatches({ colors }: { colors: string[] }) {
  return (
    <div className="swatches">
      {colors.map((c, i) => (
        <div 
          key={i} 
          className="swatch" 
          style={{ 
            background: c,
            cursor: 'pointer',
            position: 'relative'
          }} 
          title={`${c} - Click to copy`}
          onClick={() => {
            navigator.clipboard.writeText(c);
            // Optional: Add a brief visual feedback
            const element = document.activeElement as HTMLElement;
            if (element) {
              element.style.transform = 'scale(1.1)';
              setTimeout(() => {
                element.style.transform = 'scale(1)';
              }, 200);
            }
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '1px 4px',
            borderRadius: '3px',
            fontSize: '9px',
            opacity: 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none'
          }}>
            Copy
          </div>
        </div>
      ))}
    </div>
  );
}
