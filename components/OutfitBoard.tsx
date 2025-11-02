'use client';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

type Item = { image: string, title?: string };

export default function OutfitBoard({ items, title, bg='#efe8df' }:{ items: Item[], title?: string, bg?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  async function exportPng() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { backgroundColor: bg, scale: 2 });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'outfit-board'}.png`;
    a.click();
  }

  return (
    <div>
      <div ref={ref} style={{
        background: bg, padding: 16, borderRadius: 16,
        display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12
      }}>
        {items.map((it, i) => (
          <div key={i} style={{ background:'white', borderRadius:12, padding:8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.image} alt={it.title || `item-${i}`} style={{width:'100%', aspectRatio:'1/1', objectFit:'contain'}}/>
          </div>
        ))}
      </div>
      <button className="button" style={{marginTop:12}} onClick={exportPng}>Export board</button>
    </div>
  );
}
