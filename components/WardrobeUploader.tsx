'use client';
import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';

interface OutfitItem {
  id: string;
  image: string;
  name: string;
  category: 'top' | 'bottom' | 'dress' | 'outerwear' | 'accessory';
  color: string;
  style: string;
  pattern: string;
  season: string;
}

interface OutfitIdea {
  id: string;
  name: string;
  description: string;
  mainItems: OutfitItem[];
  tags: string[];
  confidence: number;
  occasion: string;
  season: string;
}

export default function WardrobeUploader({ onChange }: { onChange: (files: File[]) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isCreatingOutfits, setIsCreatingOutfits] = useState(false);
  const [outfitIdeas, setOutfitIdeas] = useState<OutfitIdea[]>([]);
  const [activeFilters, setActiveFilters] = useState<{occasion: string | null; season: string | null; countOnly:boolean}>({ occasion: null, season: null, countOnly:false });
  const [expandedOutfits, setExpandedOutfits] = useState<Set<string>>(new Set());
  const [shareCopied, setShareCopied] = useState(false);
  const [isSharedImport, setIsSharedImport] = useState(false);
  const [wardrobeOutfitsGenerated, setWardrobeOutfitsGenerated] = useState(0);
  const [wardrobeOutfitsLimit, setWardrobeOutfitsLimit] = useState(1);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Fetch wardrobe generation count on mount
  const fetchWardrobeCount = async () => {
    try {
      const response = await fetch('/api/user/wardrobe-count');
      if (response.ok) {
        const data = await response.json();
        setWardrobeOutfitsGenerated(data.wardrobeOutfitsGenerated);
        setWardrobeOutfitsLimit(data.wardrobeOutfitsLimit);
      }
    } catch (error) {
      console.error('Error fetching wardrobe count:', error);
    }
  };

  useEffect(() => {
    fetchWardrobeCount();
  }, []);

  // Load persisted filters & expanded state
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('wardrobeFilters');
      if (savedFilters) {
        const p = JSON.parse(savedFilters);
        if (p && typeof p === 'object') {
          setActiveFilters(f => ({ ...f, occasion: p.occasion || null, season: p.season || null }));
        }
      }
      const savedExpanded = localStorage.getItem('wardrobeExpanded');
      if (savedExpanded) {
        const arr: string[] = JSON.parse(savedExpanded);
        if (Array.isArray(arr)) setExpandedOutfits(new Set(arr));
      }
    } catch {/* ignore */}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('wardrobeFilters', JSON.stringify({ occasion: activeFilters.occasion, season: activeFilters.season })); } catch {}
  }, [activeFilters]);
  useEffect(() => {
    try { localStorage.setItem('wardrobeExpanded', JSON.stringify(Array.from(expandedOutfits))); } catch {}
  }, [expandedOutfits]);
  // One-time decode of shared outfits from hash (#outfits=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (outfitIdeas.length) return; // don't overwrite existing
    const hash = window.location.hash || '';
    const prefix = '#outfits=';
    if (!hash.startsWith(prefix)) return;
    const encoded = hash.slice(prefix.length);
    try {
      // Reverse the encoding used in share link
      const json = decodeURIComponent(escape(atob(encoded)));
      const minimal = JSON.parse(json);
      if (Array.isArray(minimal)) {
        const reconstructed: OutfitIdea[] = minimal.map((o: any, idx: number) => {
          const items: OutfitItem[] = (o.items || []).map((it: any, i: number) => ({
            id: it.id || `shared_item_${idx}_${i}`,
            image: '/icons/palette.svg', // placeholder since images cannot be shared via link
            name: it.name || 'Shared Item',
            category: it.c || 'top',
            color: it.col || 'black',
            style: it.s || 'casual',
            pattern: 'solid',
            season: o.season || 'all-season'
          }));
          // Basic confidence heuristic on import
          const baseConf = 75 + Math.min(10, items.length * 5);
          return {
            id: o.id || `shared_outfit_${idx}`,
            name: o.name || 'Shared Outfit',
            description: 'Imported outfit from shared link (images replaced with placeholders). Upload your own items to regenerate visuals.',
            mainItems: items,
            tags: o.tags || [],
            confidence: baseConf,
            occasion: o.occasion || 'Everyday',
            season: o.season || 'all-season'
          } as OutfitIdea;
        }).filter((oi: OutfitIdea) => oi.mainItems.length >= 2);
        if (reconstructed.length) {
          setOutfitIdeas(reconstructed.slice(0,6));
          setIsSharedImport(true);
        }
      }
    } catch (e) {
      console.warn('Failed to decode shared outfits', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.slice(0, 12); // Limit to 12 files
    setFiles(validFiles);
    onChange(validFiles);
    
    // Check if user has exceeded their limit
    if (wardrobeOutfitsGenerated >= wardrobeOutfitsLimit) {
      setShowUpgradePrompt(true);
      return;
    }
    
    // Generate outfit ideas when files are uploaded
    if (validFiles.length > 0) {
      await generateAIOutfitIdeas(validFiles);
    }
  };

  const removeFile = async (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange(newFiles);
    
    // Regenerate outfit ideas
    if (newFiles.length > 0) {
      await generateAIOutfitIdeas(newFiles);
    } else {
      setOutfitIdeas([]);
    }
  };

  // AI-powered outfit generation using advanced fashion analysis
  const generateAIOutfitIdeas = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;

    setIsCreatingOutfits(true);

    try {
      // First, analyze each uploaded image with AI
      const analyzedItems = await Promise.all(
        uploadedFiles.map(async (file, index) => {
          // Create FormData to send image to AI analysis
          const formData = new FormData();
          formData.append('image', file);
          
          try {
            // Send to AI analysis endpoint (american spelling). Fallback to british spelling alias if needed.
            let response = await fetch('/api/analyze-wardrobe', { method: 'POST', body: formData });
            if (!response.ok) {
              try { // fallback attempt
                response = await fetch('/api/analyse-wardrobe', { method: 'POST', body: formData });
              } catch {}
            }
            if (response.ok) {
              const aiAnalysis = await response.json();
              return {
                id: `item_${index}`,
                image: URL.createObjectURL(file),
                name: `${aiAnalysis.color ? aiAnalysis.color.charAt(0).toUpperCase() + aiAnalysis.color.slice(1) : 'Black'} ${aiAnalysis.category ? aiAnalysis.category.charAt(0).toUpperCase() + aiAnalysis.category.slice(1) : 'Top'}`,
                category: aiAnalysis.category || 'top',
                color: aiAnalysis.color || 'black',
                style: aiAnalysis.style || 'casual',
                pattern: aiAnalysis.pattern || 'solid',
                season: aiAnalysis.season || 'all-season',
                confidence: aiAnalysis.confidence || 85
              };
            } else {
              // Fallback to simulated analysis if AI fails
              console.warn(`AI analysis failed for item ${index}, using fallback`);
              return generateFallbackAnalysis(file, index);
            }
          } catch (error) {
            console.error(`Error analyzing item ${index}:`, error);
            // Fallback to simulated analysis
            return generateFallbackAnalysis(file, index);
          }
        })
      );

      // Build initial outfit ideas using existing semantic generators
      const initial: OutfitIdea[] = [];
      initial.push(
        ...generateWorkOutfits(analyzedItems),
        ...generateCasualOutfits(analyzedItems),
        ...generateEveningOutfits(analyzedItems),
        ...generateSmartCasualOutfits(analyzedItems),
        ...generateSeasonalOutfits(analyzedItems)
      );

      // Enforce that each outfit is a combination (>=2 distinct uploaded items)
  const curated = ensureValidCombinations(analyzedItems, initial, 6);
      setOutfitIdeas(curated);

      // Increment the usage counter after successful generation
      try {
        const response = await fetch('/api/user/increment-wardrobe', {
          method: 'POST'
        });
        if (response.ok) {
          const data = await response.json();
          setWardrobeOutfitsGenerated(data.wardrobeOutfitsGenerated || wardrobeOutfitsGenerated + 1);
        }
      } catch (error) {
        console.error('Error incrementing wardrobe count:', error);
      }
    } catch (error) {
      console.error('Error generating outfit ideas:', error);
      // Fallback to basic outfit generation
      generateFallbackOutfits(uploadedFiles);
    } finally {
      setIsCreatingOutfits(false);
    }
  };

  // Fallback analysis when AI is not available
  const generateFallbackAnalysis = (file: File, index: number) => {
    const fileHash = file.name.length + file.size + file.lastModified;
    
    const categories = ['top', 'bottom', 'dress', 'outerwear', 'accessory'];
    const category = categories[fileHash % categories.length];
    
    const colorMap: { [key: number]: string } = {
      0: 'black', 1: 'white', 2: 'navy', 3: 'beige', 4: 'pink', 
      5: 'blue', 6: 'green', 7: 'brown', 8: 'red', 9: 'purple',
      10: 'gray', 11: 'cream', 12: 'olive', 13: 'burgundy', 14: 'coral'
    };
    const color = colorMap[fileHash % Object.keys(colorMap).length] || 'black';
    
    const styleMap: { [key: number]: string } = {
      0: 'casual', 1: 'formal', 2: 'elegant', 3: 'sporty', 4: 'vintage',
      5: 'modern', 6: 'bohemian', 7: 'minimalist', 8: 'romantic', 9: 'edgy'
    };
    const style = styleMap[fileHash % Object.keys(styleMap).length] || 'casual';
    
    const patternMap: { [key: number]: string } = {
      0: 'solid', 1: 'striped', 2: 'floral', 3: 'geometric', 4: 'polka dot',
      5: 'plaid', 6: 'animal print', 7: 'abstract', 8: 'tie-dye', 9: 'embroidery'
    };
    const pattern = patternMap[fileHash % Object.keys(patternMap).length] || 'solid';
    
    const seasonMap: { [key: number]: string } = {
      0: 'spring', 1: 'summer', 2: 'autumn', 3: 'winter', 4: 'all-season'
    };
    const season = seasonMap[fileHash % Object.keys(seasonMap).length] || 'all-season';
    
    // Generate descriptive names based on category, color, and style
    const descriptiveNames = {
      top: {
        casual: ['Casual Tee', 'Relaxed Blouse', 'Comfortable Top', 'Easy Shirt'],
        formal: ['Professional Blouse', 'Business Shirt', 'Office Top', 'Formal Shirt'],
        elegant: ['Elegant Blouse', 'Sophisticated Top', 'Refined Shirt', 'Classy Top'],
        sporty: ['Athletic Top', 'Sport Shirt', 'Active Tee', 'Fitness Top'],
        vintage: ['Vintage Blouse', 'Retro Shirt', 'Classic Top', 'Heritage Shirt']
      },
      bottom: {
        casual: ['Casual Pants', 'Relaxed Trousers', 'Comfortable Bottoms', 'Easy Leggings'],
        formal: ['Professional Pants', 'Business Trousers', 'Office Bottoms', 'Formal Slacks'],
        elegant: ['Elegant Pants', 'Sophisticated Trousers', 'Refined Bottoms', 'Classy Slacks'],
        sporty: ['Athletic Pants', 'Sport Trousers', 'Active Bottoms', 'Fitness Leggings'],
        vintage: ['Vintage Pants', 'Retro Trousers', 'Classic Bottoms', 'Heritage Slacks']
      },
      dress: {
        casual: ['Casual Dress', 'Relaxed Gown', 'Comfortable Dress', 'Easy Frock'],
        formal: ['Professional Dress', 'Business Gown', 'Office Dress', 'Formal Frock'],
        elegant: ['Elegant Dress', 'Sophisticated Gown', 'Refined Dress', 'Classy Frock'],
        sporty: ['Athletic Dress', 'Sport Gown', 'Active Dress', 'Fitness Frock'],
        vintage: ['Vintage Dress', 'Retro Gown', 'Classic Dress', 'Heritage Frock']
      },
      outerwear: {
        casual: ['Casual Jacket', 'Relaxed Coat', 'Comfortable Blazer', 'Easy Cardigan'],
        formal: ['Professional Jacket', 'Business Coat', 'Office Blazer', 'Formal Cardigan'],
        elegant: ['Elegant Jacket', 'Sophisticated Coat', 'Refined Blazer', 'Classy Cardigan'],
        sporty: ['Athletic Jacket', 'Sport Coat', 'Active Blazer', 'Fitness Cardigan'],
        vintage: ['Vintage Jacket', 'Retro Coat', 'Classic Blazer', 'Heritage Cardigan']
      }
    };
    
    const nameOptions = descriptiveNames[category as keyof typeof descriptiveNames]?.[style as keyof typeof descriptiveNames.top] || ['Clothing Item'];
    const nameIndex = fileHash % nameOptions.length;
    const descriptiveName = nameOptions[nameIndex];
    
    return {
      id: `item_${index}`,
      image: URL.createObjectURL(file),
      name: `${color.charAt(0).toUpperCase() + color.slice(1)} ${descriptiveName}`,
      category: category as 'top' | 'bottom' | 'dress' | 'outerwear' | 'accessory',
      color,
      style,
      pattern,
      season,
      confidence: 75 + Math.random() * 20
    };
  };

  // Fallback outfit generation
  const generateFallbackOutfits = (uploadedFiles: File[]) => {
    const analyzedItems = uploadedFiles.map((file, index) => generateFallbackAnalysis(file, index));
    const initial: OutfitIdea[] = [
      ...generateWorkOutfits(analyzedItems),
      ...generateCasualOutfits(analyzedItems),
      ...generateEveningOutfits(analyzedItems),
      ...generateSmartCasualOutfits(analyzedItems),
      ...generateSeasonalOutfits(analyzedItems)
    ];
  setOutfitIdeas(ensureValidCombinations(analyzedItems, initial, 6));
  };

  // Generate professional work outfits
  const generateWorkOutfits = (items: OutfitItem[]): OutfitIdea[] => {
    const outfits: OutfitIdea[] = [];
    const tops = items.filter(item => item.category === 'top');
    const bottoms = items.filter(item => item.category === 'bottom');
    const outerwear = items.filter(item => item.category === 'outerwear');
    
    if (tops.length > 0 && bottoms.length > 0) {
      for (let i = 0; i < Math.min(tops.length, bottoms.length, 3); i++) {
        const top = tops[i];
        const bottom = bottoms[i % bottoms.length];
        
        if (top && bottom) {
          // Check if this is a good work combination
          if (isWorkAppropriate(top, bottom)) {
            const jacket = outerwear.find(j => isCompatibleWithOutfit(j, [top, bottom]));
            
            const outfitItems = jacket ? [top, bottom, jacket] : [top, bottom];
            const outfitName = jacket ? 'Professional Layered Look' : 'Work-Ready Ensemble';
            
            outfits.push({
              id: `work_${i}`,
              name: outfitName,
              description: `A professional ${top.style} ${top.category} in ${top.color} paired with ${bottom.color} ${bottom.category}. ${jacket ? `Layered with a ${jacket.style} ${jacket.category} for added sophistication.` : ''}`,
              mainItems: outfitItems,
              tags: ['Professional', 'Work-Ready', 'Sophisticated'],
              confidence: 88 + Math.random() * 12,
              occasion: 'Work',
              season: getDominantSeason(outfitItems)
            });
          }
        }
      }
    }
    
    return outfits;
  };

  // Generate casual weekend outfits
  const generateCasualOutfits = (items: OutfitItem[]): OutfitIdea[] => {
    const outfits: OutfitIdea[] = [];
    const tops = items.filter(item => item.category === 'top' && isCasualStyle(item));
    const bottoms = items.filter(item => item.category === 'bottom' && isCasualStyle(item));
    
    if (tops.length > 0 && bottoms.length > 0) {
      for (let i = 0; i < Math.min(tops.length, bottoms.length, 3); i++) {
        const top = tops[i];
        const bottom = bottoms[i % bottoms.length];
        
        if (top && bottom) {
          if (isColorCompatible(top.color, bottom.color)) {
            outfits.push({
              id: `casual_${i}`,
              name: 'Weekend Casual Look',
              description: `A relaxed ${top.style} ${top.category} in ${top.color} with ${bottom.color} ${bottom.category}. Perfect for weekend activities and casual outings.`,
              mainItems: [top, bottom],
              tags: ['Casual', 'Weekend', 'Comfortable'],
              confidence: 85 + Math.random() * 15,
              occasion: 'Weekend',
              season: getDominantSeason([top, bottom])
            });
          }
        }
      }
    }
    
    return outfits;
  };

  // Generate elegant evening outfits
  const generateEveningOutfits = (items: OutfitItem[]): OutfitIdea[] => {
    const outfits: OutfitIdea[] = [];
    const dresses = items.filter(item => item.category === 'dress' && isElegantStyle(item));
    const accessories = items.filter(item => item.category === 'accessory');
    
    dresses.forEach((dress, index) => {
      const matchingAccessories = accessories.filter(acc => 
        isColorCompatible(dress.color, acc.color) || acc.color === 'black' || acc.color === 'white'
      );
      
      const outfitItems = [dress, ...matchingAccessories.slice(0, 2)];
      
      outfits.push({
        id: `evening_${index}`,
        name: `${dress.style.charAt(0).toUpperCase() + dress.style.slice(1)} Evening Look`,
        description: `A stunning ${dress.style} dress in ${dress.color}. ${matchingAccessories.length > 0 ? `Accented with complementary accessories for a complete evening ensemble.` : 'Perfect for special occasions and evening events.'}`,
        mainItems: outfitItems,
        tags: ['Elegant', 'Evening', 'Special Occasion'],
        confidence: 92 + Math.random() * 8,
        occasion: 'Evening',
        season: dress.season
      });
    });
    
    return outfits;
  };

  // Generate smart casual outfits
  const generateSmartCasualOutfits = (items: OutfitItem[]): OutfitIdea[] => {
    const outfits: OutfitIdea[] = [];
    const tops = items.filter(item => item.category === 'top');
    const bottoms = items.filter(item => item.category === 'bottom');
    
    if (tops.length > 0 && bottoms.length > 0) {
      for (let i = 0; i < Math.min(tops.length, bottoms.length, 2); i++) {
        const top = tops[i];
        const bottom = bottoms[i % bottoms.length];
        
        // Smart casual combines different styles
        if (top && bottom) {
          if (top.style !== bottom.style && isColorCompatible(top.color, bottom.color)) {
            outfits.push({
              id: `smart_casual_${i}`,
              name: 'Smart Casual Ensemble',
              description: `A sophisticated blend of ${top.style} and ${bottom.style} styles. The ${top.color} ${top.category} paired with ${bottom.color} ${bottom.category} creates a versatile look suitable for various occasions.`,
              mainItems: [top, bottom],
              tags: ['Smart Casual', 'Versatile', 'Sophisticated'],
              confidence: 87 + Math.random() * 13,
              occasion: 'Smart Casual',
              season: getDominantSeason([top, bottom])
            });
          }
        }
      }
    }
    
    return outfits;
  };

  // Generate seasonal outfits
  const generateSeasonalOutfits = (items: OutfitItem[]): OutfitIdea[] => {
    const outfits: OutfitIdea[] = [];
    const seasonalGroups: { [key: string]: OutfitItem[] } = {};
    
    // Group items by season
    items.forEach(item => {
      if (!seasonalGroups[item.season]) {
        seasonalGroups[item.season] = [];
      }
      if (!seasonalGroups[item.season]) {
        seasonalGroups[item.season] = [];
      }
      const seasonArr = seasonalGroups[item.season]!;
      seasonArr.push(item);
    });
    
    // Create seasonal monochromatic looks
    Object.entries(seasonalGroups).forEach(([season, seasonItems]) => {
      if (seasonItems && seasonItems.length >= 2) {
        const colorGroups: { [key: string]: OutfitItem[] } = {};
        
        // Group by color within season
        seasonItems.forEach(item => {
          if (item && item.color) {
            if (!colorGroups[item.color]) {
              colorGroups[item.color] = [];
            }
            if (!colorGroups[item.color]) {
              colorGroups[item.color] = [];
            }
            const colArr = colorGroups[item.color]!;
            colArr.push(item);
          }
        });
        
        // Create monochromatic seasonal outfits
        Object.entries(colorGroups).forEach(([color, colorItems]) => {
          if (colorItems && colorItems.length >= 2) {
            const top = colorItems.find(item => item && item.category === 'top');
            const bottom = colorItems.find(item => item && item.category === 'bottom');
            
            if (top && bottom) {
              outfits.push({
                id: `seasonal_${season}_${color}`,
                name: `${season.charAt(0).toUpperCase() + season.slice(1)} ${color.charAt(0).toUpperCase() + color.slice(1)} Look`,
                description: `A cohesive ${season} ensemble in ${color}. The ${top.category} and ${bottom.category} create a harmonious seasonal appearance perfect for ${season} weather.`,
                mainItems: [top, bottom],
                tags: ['Seasonal', 'Monochromatic', 'Cohesive'],
                confidence: 90 + Math.random() * 10,
                occasion: 'Seasonal',
                season: season
              });
            }
          }
        });
      }
    });
    
    return outfits;
  };

  // Generate additional outfits to reach the target number
  const generateAdditionalOutfits = (items: OutfitItem[], count: number): OutfitIdea[] => {
    const outfits: OutfitIdea[] = [];
    
    // Create mixed style combinations
    const tops = items.filter(item => item.category === 'top');
    const bottoms = items.filter(item => item.category === 'bottom');
    const dresses = items.filter(item => item.category === 'dress');
    
    for (let i = 0; i < count && i < Math.max(tops.length, bottoms.length, dresses.length); i++) {
      if (tops.length > 0 && bottoms.length > 0) {
        const top = tops[i % tops.length];
        const bottom = bottoms[i % bottoms.length];
        
        if (top && bottom) {
          outfits.push({
            id: `additional_${i}`,
            name: 'Mixed Style Ensemble',
            description: `A versatile combination of ${top.style} ${top.category} in ${top.color} with ${bottom.style} ${bottom.category} in ${bottom.color}.`,
            mainItems: [top, bottom],
            tags: ['Versatile', 'Mixed Style', 'Everyday'],
            confidence: 80 + Math.random() * 15,
            occasion: 'Everyday',
            season: getDominantSeason([top, bottom])
          });
        }
      } else if (dresses.length > 0) {
        const dress = dresses[i % dresses.length];
        if (dress) {
          outfits.push({
            id: `additional_dress_${i}`,
            name: `${dress.style.charAt(0).toUpperCase() + dress.style.slice(1)} Dress Look`,
            description: `A beautiful ${dress.style} dress in ${dress.color} perfect for various occasions.`,
            mainItems: [dress],
            tags: ['Dress', dress.style.charAt(0).toUpperCase() + dress.style.slice(1), 'Versatile'],
            confidence: 85 + Math.random() * 10,
            occasion: 'Various',
            season: dress.season
          });
        }
      }
    }
    
    return outfits;
  };

  // Ensure outfits are multi-item combinations; supplement with generated pairings/triples & score for quality
  const ensureValidCombinations = (items: OutfitItem[], existing: OutfitIdea[], target: number): OutfitIdea[] => {
    if (items.length < 2) return []; // cannot create combinations from <2 items

    // Filter to outfits with at least 2 distinct items & dedupe by item id set
    const unique = new Map<string, OutfitIdea>();
    existing.forEach(o => {
      const ids = o.mainItems.map(i => i.id).filter(Boolean);
      if (ids.length < 2) return; // skip single-item
      const key = ids.sort().join('_');
      if (!unique.has(key)) unique.set(key, { ...o, confidence: normalizeConfidence(o) });
    });

    // Helper collections
    const tops = items.filter(i => i.category === 'top');
    const bottoms = items.filter(i => i.category === 'bottom');
    const outerwear = items.filter(i => i.category === 'outerwear');
    const dresses = items.filter(i => i.category === 'dress');
    const accessories = items.filter(i => i.category === 'accessory');

    const pushCombo = (combo: OutfitItem[], meta: Partial<OutfitIdea>) => {
      const key = combo.map(i => i.id).sort().join('_');
      if (combo.length < 2 || unique.has(key)) return;
      if (!isStructuredCombination(combo)) return; // reject illogical mixes
      unique.set(key, {
        id: meta.id || `combo_${unique.size}`,
        name: meta.name || buildDefaultName(combo),
        description: meta.description || buildDescription(combo),
        mainItems: combo,
        tags: meta.tags || buildTags(combo),
        confidence: meta.confidence || averageConfidence(combo),
        occasion: meta.occasion || inferOccasion(combo),
        season: meta.season || getDominantSeason(combo)
      });
    };

    // 1. Top + Bottom (+ optional outerwear)
    tops.forEach(t => {
      bottoms.forEach(b => {
        if (isColorCompatible(t.color, b.color)) {
          const base = [t, b];
          pushCombo(base, { tags: ['Top & Bottom', 'Coordinated'] });
          // with outerwear
          outerwear.forEach(o => {
            if (isCompatibleWithOutfit(o, base)) {
              pushCombo([t, b, o], { tags: ['Layered', 'Versatile'], name: 'Layered Look' });
            }
          });
          // with accessory
          accessories.slice(0,2).forEach(a => {
            if (isCompatibleWithOutfit(a, base)) {
              pushCombo([t, b, a], { tags: ['Accessorized'], name: 'Styled Ensemble' });
            }
          });
        }
      });
    });

    // 2. Dress + Outerwear / Accessory combos
    dresses.forEach(d => {
      outerwear.forEach(o => {
        if (isCompatibleWithOutfit(o, [d])) {
          pushCombo([d, o], { tags: ['Dress', 'Layered'], occasion: 'Evening' });
        }
      });
      accessories.forEach(a => {
        if (isCompatibleWithOutfit(a, [d])) {
          pushCombo([d, a], { tags: ['Dress', 'Accessory'], occasion: 'Special' });
        }
      });
      // Dress + Outerwear + Accessory
      outerwear.forEach(o => {
        accessories.forEach(a => {
          if (isCompatibleWithOutfit(o, [d]) && isCompatibleWithOutfit(a, [d, o])) {
            pushCombo([d, o, a], { tags: ['Dress', 'Layered', 'Accessory'], occasion: 'Event' });
          }
        });
      });
    });

    // 3. Structured fallback generation if we still have capacity
    if (unique.size < target) {
      // Dress centric combos
      dresses.forEach(d => {
        if (unique.size >= target) return;
        accessories.slice(0,2).forEach(a => { if (unique.size < target) pushCombo([d,a], {}); });
        outerwear.slice(0,2).forEach(o => { if (unique.size < target) pushCombo([d,o], {}); });
        if (outerwear[0] && accessories[0] && unique.size < target) pushCombo([d, outerwear[0], accessories[0]], {});
      });
      // Top+Bottom combos with single accessory/outerwear
      tops.forEach(t => {
        bottoms.forEach(b => {
          if (unique.size >= target) return;
          if (!isColorCompatible(t.color, b.color)) return;
          pushCombo([t,b], {});
          if (outerwear[0] && unique.size < target) pushCombo([t,b,outerwear[0]], {});
          if (accessories[0] && unique.size < target) pushCombo([t,b,accessories[0]], {});
        });
      });
    }

  // Score each outfit for quality (color harmony, style synergy, diversity, season alignment)
  const scored = Array.from(unique.values()).map(o => ({ outfit: o, score: outfitScore(o) }));
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0, target).map(s => ({ ...s.outfit, confidence: Math.min(99, Math.round(s.score)) }));
  };

  const averageConfidence = (combo: OutfitItem[]): number => {
    return Math.min(99, (combo.reduce((s,i) => s + (i as any).confidence || 80, 0) / combo.length) + Math.random()*5);
  };

  const normalizeConfidence = (o: OutfitIdea): number => {
    if (o.mainItems.length < 2) return o.confidence * 0.8; // penalize singletons (will be filtered anyway)
    return Math.min(99, o.confidence);
  };

  // Color family mapping for palette naming
  const colorFamily = (c: string): string => {
    const neutrals = ['black','white','gray','cream','beige','navy'];
    const warm = ['red','pink','burgundy','coral'];
    const earthy = ['brown','olive'];
    const cool = ['blue','green','purple'];
    if (neutrals.includes(c)) return 'neutral';
    if (warm.includes(c)) return 'warm';
    if (earthy.includes(c)) return 'earthy';
    if (cool.includes(c)) return 'cool';
    return 'accent';
  };

  const buildDefaultName = (items: OutfitItem[]): string => {
    const hasDress = items.some(i=>i.category==='dress');
    const top = items.find(i=>i.category==='top');
    const bottom = items.find(i=>i.category==='bottom');
    const dress = items.find(i=>i.category==='dress');
    const outer = items.find(i=>i.category==='outerwear');
    const primary = dress || top || items[0];
    const style = primary ? primary.style.charAt(0).toUpperCase()+primary.style.slice(1) : 'Styled';
    if (hasDress && primary) {
      return `${primary.color.charAt(0).toUpperCase()+primary.color.slice(1)} ${style} Dress${outer? ' Layered Look':''}`;
    }
    if (top && bottom) {
      return `${style} ${top.color.charAt(0).toUpperCase()+top.color.slice(1)} & ${bottom.color.charAt(0).toUpperCase()+bottom.color.slice(1)} Set${outer? ' with Layer':' Look'}`;
    }
    // Fallback
    const cats = items.map(i => i.category).filter((v,i,a)=>a.indexOf(v)===i).join(' + ');
    return `${cats.charAt(0).toUpperCase() + cats.slice(1)} Look`;
  };

  const buildTags = (items: OutfitItem[]): string[] => {
    const tags = new Set<string>();
    items.forEach(i => tags.add(i.style.charAt(0).toUpperCase() + i.style.slice(1)));
    if (items.length === 3) tags.add('Layered');
    return Array.from(tags).slice(0,5);
  };

  const buildDescription = (items: OutfitItem[]): string => {
    const hasDress = items.some(i=>i.category==='dress');
    const top = items.find(i=>i.category==='top');
    const bottom = items.find(i=>i.category==='bottom');
    const dress = items.find(i=>i.category==='dress');
    const outer = items.find(i=>i.category==='outerwear');
    const accessory = items.find(i=>i.category==='accessory');
    const styleFreq: Record<string, number> = {};
    items.forEach(i=>{ styleFreq[i.style]=(styleFreq[i.style]||0)+1; });
    const dominantStyle = Object.entries(styleFreq).sort((a,b)=>b[1]-a[1])[0]?.[0] || items[0]?.style || 'casual';
    const paletteFamilies = Array.from(new Set(items.map(i=>colorFamily(i.color))));
    const palettePhrase = paletteFamilies.length===1 ? `${paletteFamilies[0]} palette` : `${paletteFamilies.slice(0,-1).join(', ')} + ${paletteFamilies.slice(-1)} palette`;
    const colorList = items.map(i=>i.color).filter((v,i,a)=>a.indexOf(v)===i).map(c=>c.charAt(0).toUpperCase()+c.slice(1)).join(', ');

    let firstLine = '';
    if (hasDress && dress) {
      firstLine = `${dress.color.charAt(0).toUpperCase()+dress.color.slice(1)} ${dress.style} dress`;
      if (outer) firstLine += ` layered with a ${outer.color} ${outer.category}`;
      if (accessory) firstLine += ` and finished with a ${accessory.color} accessory`;
    } else if (top && bottom) {
      firstLine = `${top.color} ${top.style} ${top.category} paired with ${bottom.color} ${bottom.style} ${bottom.category}`;
      if (outer) firstLine += `, plus a ${outer.color} ${outer.category} for layering`;
      if (accessory) firstLine += ` and a ${accessory.color} accent`;
    } else {
      firstLine = items.map(i=>`${i.color} ${i.category}`).join(' + ');
    }
    firstLine = firstLine.charAt(0).toUpperCase()+firstLine.slice(1) + '.';

    const styleLine = `Unified ${dominantStyle} vibe keeps the look coherent.`;
    const paletteLine = `Colors (${colorList}) form a ${palettePhrase}.`;
    return `${firstLine} ${paletteLine} ${styleLine}`;
  };

  // Validate structural logic of combos
  const isStructuredCombination = (combo: OutfitItem[]): boolean => {
    const counts: Record<string, number> = {};
    combo.forEach(i=>{ counts[i.category]=(counts[i.category]||0)+1; });
    const hasDress = !!counts['dress'];
    const hasTop = !!counts['top'];
    const hasBottom = !!counts['bottom'];
    const hasOuter = !!counts['outerwear'];
    if (hasDress) {
  if (hasTop || hasBottom) return false; // no mixing dress with top/bottom set
  if ((counts['dress']||0)>1) return false;
  if ((counts['outerwear']||0)>1) return false;
  if ((counts['accessory']||0)>1) return false;
      if (combo.length < 2 || combo.length > 3) return false;
    } else {
      if (!(hasTop && hasBottom)) return false; // require both
  if ((counts['outerwear']||0)>1) return false;
  if ((counts['accessory']||0)>1) return false;
      if (combo.length < 2 || combo.length > 4) return false;
      if (hasOuter && !(hasTop && hasBottom)) return false;
    }
    // Basic palette sanity: limit distinct raw colors to 4
    const distinctColors = new Set(combo.map(i=>i.color));
    if (distinctColors.size > 4) return false;
    return true;
  };

  // Heuristic scoring to simulate AI quality judgment
  const outfitScore = (outfit: OutfitIdea): number => {
    const items = outfit.mainItems;
    let score = averageConfidence(items); // base from item confidences
    // Category diversity
    const categories = new Set(items.map(i => i.category));
    score += (categories.size - 1) * 5;
    // Style synergy (most common style weight)
    const styleCounts: Record<string, number> = {};
    items.forEach(i => { styleCounts[i.style] = (styleCounts[i.style] || 0) + 1; });
    const maxStyleFreq = Math.max(...Object.values(styleCounts));
    score += maxStyleFreq * 4;
    // Color harmony pair bonuses
    for (let i=0;i<items.length;i++) {
      for (let j=i+1;j<items.length;j++) {
        const a = items[i];
        const b = items[j];
        if (a && b && isColorCompatible(a.color, b.color)) score += 3;
      }
    }
    // Penalize duplicate categories (unless purposeful layering like outerwear)
    if (categories.size === 1 && !items.some(i=>i.category==='outerwear')) score -= 10;
    // Season coherence
    const domSeason = getDominantSeason(items);
    if (items.every(i => i.season === domSeason || i.season === 'all-season')) score += 6;
    // Adjust for size (triplets slightly favored)
    if (items.length === 3) score += 4; else if (items.length >3) score -= (items.length-3)*2; // discourage clutter
    return score;
  };

  const inferOccasion = (items: OutfitItem[]): string => {
    if (items.some(i => ['formal','elegant'].includes(i.style))) return 'Work';
    if (items.some(i => i.category === 'dress')) return 'Evening';
    if (items.some(i => i.style === 'sporty')) return 'Casual';
    return 'Everyday';
  };

  // Helper functions
  const isWorkAppropriate = (top: OutfitItem, bottom: OutfitItem): boolean => {
    const workStyles = ['formal', 'elegant', 'minimalist'];
    const workColors = ['black', 'navy', 'gray', 'beige', 'white'];
    
    return (workStyles.includes(top.style) || workStyles.includes(bottom.style)) &&
           (workColors.includes(top.color) || workColors.includes(bottom.color));
  };

  const isCasualStyle = (item: OutfitItem): boolean => {
    return ['casual', 'sporty', 'bohemian'].includes(item.style);
  };

  const isElegantStyle = (item: OutfitItem): boolean => {
    return ['elegant', 'romantic', 'formal'].includes(item.style);
  };

  const isColorCompatible = (color1: string, color2: string): boolean => {
    const colorWheel = {
      black: ['white', 'red', 'pink', 'blue', 'green', 'purple', 'beige', 'gray', 'cream'],
      white: ['black', 'navy', 'brown', 'red', 'pink', 'blue', 'green', 'purple', 'gray', 'cream'],
      navy: ['white', 'beige', 'pink', 'red', 'yellow', 'cream', 'gray'],
      beige: ['black', 'navy', 'brown', 'green', 'blue', 'cream', 'gray'],
      pink: ['black', 'white', 'navy', 'beige', 'brown', 'gray', 'cream'],
      blue: ['white', 'beige', 'brown', 'pink', 'red', 'gray', 'cream'],
      green: ['white', 'beige', 'brown', 'pink', 'gray', 'cream'],
      brown: ['white', 'beige', 'pink', 'blue', 'green', 'cream', 'gray'],
      red: ['black', 'white', 'navy', 'beige', 'blue', 'gray', 'cream'],
      purple: ['white', 'beige', 'pink', 'green', 'gray', 'cream'],
      gray: ['black', 'white', 'navy', 'beige', 'pink', 'blue', 'green', 'brown', 'red', 'purple', 'cream'],
      cream: ['black', 'navy', 'brown', 'green', 'blue', 'gray'],
      olive: ['white', 'beige', 'brown', 'cream', 'gray'],
      burgundy: ['white', 'beige', 'cream', 'gray'],
      coral: ['white', 'navy', 'beige', 'gray', 'cream']
    };

    return colorWheel[color1 as keyof typeof colorWheel]?.includes(color2) || 
           colorWheel[color2 as keyof typeof colorWheel]?.includes(color1) ||
           color1 === color2; // Monochromatic is always compatible
  };

  const isCompatibleWithOutfit = (item: OutfitItem, outfitItems: OutfitItem[]): boolean => {
    return outfitItems.some(outfitItem => isColorCompatible(item.color, outfitItem.color));
  };

  const getDominantSeason = (items: OutfitItem[]): string => {
    const seasonCounts: { [key: string]: number } = {};
    items.forEach(item => {
      const key = item?.season || 'unknown';
      seasonCounts[key] = (seasonCounts[key] || 0) + 1;
    });
    const entries = Object.entries(seasonCounts);
    if (entries.length === 0) return 'unknown';
    const top = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
    return top[0];
  };

  const handleCreateOutfits = async () => {
    // Check if user has exceeded their limit
    if (wardrobeOutfitsGenerated >= wardrobeOutfitsLimit) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsCreatingOutfits(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      await generateAIOutfitIdeas(files);
    } catch (error) {
      console.error('Error creating outfits:', error);
    } finally {
      setIsCreatingOutfits(false);
    }
  };

  const toggleFilter = (type: 'occasion'|'season', value: string) => {
    setActiveFilters(prev => ({ ...prev, [type]: prev[type] === value ? null : value }));
  };

  const filteredOutfits = outfitIdeas.filter(o => {
    if (activeFilters.occasion && o.occasion !== activeFilters.occasion) return false;
    if (activeFilters.season && o.season !== activeFilters.season) return false;
    return true;
  });
  const totalItemsAcrossFiltered = filteredOutfits.reduce((a,o)=>a+o.mainItems.length,0);

  const toggleExpanded = (id: string) => {
    setExpandedOutfits(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedOutfits(new Set(filteredOutfits.map(o => o.id)));
  const collapseAll = () => setExpandedOutfits(new Set());

  const handleExport = () => {
    try {
      const data = JSON.stringify({ generatedAt: new Date().toISOString(), outfits: outfitIdeas }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wardrobe-outfits.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed', e); }
  };

  const handleCopyShare = async () => {
    try {
      const minimal = outfitIdeas.map(o => ({ id:o.id, name:o.name, tags:o.tags, occasion:o.occasion, season:o.season, items:o.mainItems.map(i=>({ id:i.id, name:i.name, c:i.category, col:i.color, s:i.style })) }));
      const json = JSON.stringify(minimal);
      const encoded = btoa(unescape(encodeURIComponent(json)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#outfits=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true); setTimeout(()=>setShareCopied(false), 2000);
    } catch(e) { console.error('Share copy failed', e); }
  };

  // Drawer component (height animation with measurement for smoother UX)
  const ExpandableDrawer: React.FC<{ open: boolean; id: string; children: React.ReactNode }> = ({ open, id, children }) => {
    const ref = useRef<HTMLDivElement|null>(null);
    useLayoutEffect(()=>{
      const el = ref.current; if(!el) return;
      if(open){
        const h = el.scrollHeight; el.style.setProperty('--drawer-height', h+'px');
      }
    }, [open, children]);
    return <div id={id} ref={ref} className={`outfit-items-drawer ${open ? 'open' : ''}`}>{children}</div>;
  };

  // Close / accessibility key handlers
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if(e.key === 'Escape' && expandedOutfits.size){ collapseAll(); }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [expandedOutfits]);

  return (
    <div className="wardrobe-ideas-section">
      <div className="section-header">
  <h2><span className="icon-inline"><Image src="/icons/palette.svg" alt="Wardrobe ideas" width={28} height={28} /></span>Wardrobe Ideas</h2>
        <p className="section-description">
          Upload your clothing items to see AI-generated outfit combinations
        </p>
      </div>

      {/* Free Trial Banner */}
      {wardrobeOutfitsLimit < 999 && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}>
          <div>
            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
              {wardrobeOutfitsGenerated >= wardrobeOutfitsLimit ? (
                '🎁 Free Trial Used'
              ) : (
                `🎁 Free Trial: ${wardrobeOutfitsLimit - wardrobeOutfitsGenerated} AI Outfit Generation${wardrobeOutfitsLimit - wardrobeOutfitsGenerated !== 1 ? 's' : ''} Remaining`
              )}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {wardrobeOutfitsGenerated >= wardrobeOutfitsLimit ? (
                'Upgrade to unlock unlimited AI outfit combinations and premium features!'
              ) : (
                'Upload your clothing items to get AI-generated outfit combinations for free!'
              )}
            </div>
          </div>
          {wardrobeOutfitsGenerated >= wardrobeOutfitsLimit && (
            <a
              href="/pricing"
              style={{
                background: 'white',
                color: '#667eea',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s',
                marginLeft: '1rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Upgrade Now
            </a>
          )}
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }} onClick={() => setShowUpgradePrompt(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
              You've Used Your Free AI Outfit Generation!
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              You've already used your complimentary AI-generated outfit combination. Upgrade to unlock unlimited AI wardrobe analysis and premium styling features!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                Maybe Later
              </button>
              <a
                href="/pricing"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: '600',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="upload-section">
        <label htmlFor="wardrobe-upload" className="upload-label">
          Upload Your Clothing Items (Up to 12)
        </label>
        <input
          ref={fileInputRef}
          id="wardrobe-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="file-input"
        />
        <p className="upload-tip">
          Upload photos of your existing clothes to get personalized outfit suggestions
        </p>
      </div>

      {files.length > 0 && (
        <div className="wardrobe-items" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Your Items ({files.length}/12)</h3>
          <div 
            className="items-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1rem',
              width: '100%'
            }}
          >
            {files.map((file, index) => {
              const objectUrl = URL.createObjectURL(file);
              return (
              <div 
                key={index} 
                className="item-container"
                style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <Image
                  src={objectUrl}
                  alt={`wardrobe-${index}`}
                  className="item-image"
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                <button
                  onClick={() => removeFile(index)}
                  className="remove-item-btn"
                  aria-label="Remove item"
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.9)',
                    color: 'white',
                    border: 'none',
                    fontSize: '1.5rem',
                    lineHeight: '1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    fontWeight: '400'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(220, 38, 38, 1)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ×
                </button>
              </div>
            );})}
          </div>

          {/* Generate Button - Placed prominently after items */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleCreateOutfits}
              disabled={isCreatingOutfits}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                background: isCreatingOutfits 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: isCreatingOutfits ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
              onMouseEnter={(e) => {
                if (!isCreatingOutfits) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCreatingOutfits) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)';
                }
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>✨</span>
              {isCreatingOutfits ? 'Creating Outfits...' : (outfitIdeas.length > 0 ? 'Generate More Outfit Ideas' : 'Generate Outfit Ideas')}
            </button>
          </div>
        </div>
      )}

      {outfitIdeas.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          {isSharedImport && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              color: '#6366f1',
              fontSize: '0.875rem'
            }}>
              Imported shared outfit ideas. Images are placeholders; upload items to generate fresh AI visuals.
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                marginBottom: '0.5rem',
                color: '#1f2937'
              }}>
                ✨ Your Outfit Moodboard
              </h3>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.95rem' 
              }}>
                {filteredOutfits.length} outfit combination{filteredOutfits.length !== 1 ? 's' : ''} • {totalItemsAcrossFiltered} items
              </p>
            </div>
          </div>

          {/* Moodboard Style Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {filteredOutfits.map((outfit) => {
              const isOpen = expandedOutfits.has(outfit.id);
              return (
                <div 
                  key={outfit.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Moodboard Image Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: outfit.mainItems.length === 1 ? '1fr' : 
                                       outfit.mainItems.length === 2 ? 'repeat(2, 1fr)' :
                                       outfit.mainItems.length === 3 ? 'repeat(3, 1fr)' :
                                       'repeat(2, 1fr)',
                    gap: '2px',
                    background: '#f3f4f6',
                    minHeight: '240px',
                    maxHeight: '300px',
                    overflow: 'hidden'
                  }}>
                    {outfit.mainItems.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id}
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: outfit.mainItems.length <= 2 ? '240px' : '140px',
                          gridColumn: outfit.mainItems.length === 3 && idx === 0 ? 'span 3' : 'auto'
                        }}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>

                  {/* Outfit Details Overlay */}
                  <div style={{
                    padding: '1.25rem',
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), white)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <h4 style={{
                        fontSize: '1.15rem',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {outfit.name}
                      </h4>
                      <span style={{
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {outfit.occasion === 'Work' ? '💼' : 
                         outfit.occasion === 'Evening' ? '🌙' : 
                         outfit.occasion === 'Weekend' ? '☀️' : '👔'}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      lineHeight: '1.5',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {outfit.description}
                    </p>

                    {/* Tags */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      {outfit.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta Info */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.8rem',
                      color: '#9ca3af',
                      marginBottom: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid #f3f4f6'
                    }}>
                      <span>📅 {outfit.season}</span>
                      <span>👗 {outfit.mainItems.length} items</span>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => toggleExpanded(outfit.id)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: isOpen 
                          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                          : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        color: isOpen ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        if (!isOpen) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isOpen) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)';
                        }
                      }}
                    >
                      <span>{isOpen ? '▲' : '▼'}</span>
                      {isOpen ? 'Hide Details' : 'View All Items'}
                    </button>

                    {/* Expandable Item Details */}
                    {isOpen && (
                      <div style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <div style={{
                          display: 'grid',
                          gap: '0.75rem'
                        }}>
                          {outfit.mainItems.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{
                                position: 'relative',
                                width: '50px',
                                height: '65px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                flexShrink: 0
                              }}>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  unoptimized
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  marginBottom: '0.25rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {item.name}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280'
                                }}>
                                  {item.category} • {item.color}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Screen for Outfit Generation */}
      {isCreatingOutfits && (
        <div className="outfit-generation-loader">
          <div className="loader-content">
            <div className="ai-icon"><img src="/icons/palette.svg" alt="Palette loading" width={40} height={40} /></div>
            <h3>AI is Creating Your Outfit Ideas!</h3>
            <div className="loader-steps">
              <div className="step active">
                <span className="step-icon"><img src="/icons/search.svg" alt="Analyzing" width={20} height={20} /></span>
                <span>Analyzing your clothing items...</span>
              </div>
              <div className="step">
                <span className="step-icon"><img src="/icons/target.svg" alt="Color matching" width={20} height={20} /></span>
                <span>Finding color combinations...</span>
              </div>
              <div className="step">
                <span className="step-icon"><img src="/icons/sparkles.svg" alt="Creating outfits" width={20} height={20} /></span>
                <span>Creating stylish outfits...</span>
              </div>
              <div className="step">
                <span className="step-icon"><img src="/icons/celebration.svg" alt="Almost ready" width={20} height={20} /></span>
                <span>Almost ready!</span>
              </div>
            </div>
            <p className="loader-description">
              Our AI is analyzing your wardrobe and creating personalized outfit combinations based on color theory, style compatibility, and fashion principles.
            </p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
