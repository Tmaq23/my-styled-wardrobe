type P = {
  id: string;
  title: string;
  brand?: string;
  price?: number;
  currency?: string;
  image?: string;
  url: string;
  tags?: string[];
  color?: string;
};

export function OutfitCard({ product }: { product: P }) {
  return (
    <a 
      className="card card-pad" 
      href={product.url} 
      target="_blank" 
      rel="noreferrer"
      style={{
        textDecoration: 'none',
        transition: 'var(--apple-transition)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={product.image || 'https://via.placeholder.com/600x800?text=Product'}
          alt={product.title}
          style={{ 
            width: '100%', 
            aspectRatio: '3/4', 
            objectFit: 'cover', 
            borderRadius: '8px',
            transition: 'var(--apple-transition)'
          }} 
        />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 122, 255, 0.9)',
          color: 'white',
          padding: '3px 6px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          View
        </div>
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        fontWeight: '600',
        fontSize: '14px',
        color: 'var(--apple-text)',
        lineHeight: '1.3'
      }}>
        {product.title}
      </div>
      
      <div style={{ 
        color: 'var(--apple-text-secondary)', 
        fontSize: '12px',
        marginTop: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{ fontWeight: '500' }}>
          {product.brand || 'Brand'}
        </span>
        <span>•</span>
        <span style={{ 
          fontWeight: '600',
          color: 'var(--apple-accent)'
        }}>
          {product.currency || '£'}{product.price || 0}
        </span>
      </div>
      
      {product.tags && product.tags.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          flexWrap: 'wrap', 
          marginTop: '8px' 
        }}>
          {product.tags.slice(0, 3).map((t) => (
            <span 
              key={t} 
              style={{
                background: 'rgba(0, 122, 255, 0.1)',
                color: 'var(--apple-accent)',
                padding: '3px 6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
