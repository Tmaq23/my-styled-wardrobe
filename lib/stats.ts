// Simple in-memory mock for wardrobe analytics. In production replace with DB access.
export interface WardrobeItemRecord {
  id: string;
  name: string;
  category: string;
  wearCount: number;
  purchasePrice: number; // stored in base currency GBP
  purchaseDate: string; // ISO
  isSecondHand: boolean;
}

export interface WearLogRecord { id: string; itemId: string; date: string; }

// Mock storage (would be replaced by a database layer)
const ITEMS: WardrobeItemRecord[] = [
  { id: 'it1', name: 'Navy Blazer', category: 'outerwear', wearCount: 18, purchasePrice: 120, purchaseDate: '2024-02-10', isSecondHand: false },
  { id: 'it2', name: 'White Tee', category: 'top', wearCount: 52, purchasePrice: 18, purchaseDate: '2024-05-01', isSecondHand: true },
  { id: 'it3', name: 'Black Jeans', category: 'bottom', wearCount: 40, purchasePrice: 55, purchaseDate: '2023-11-20', isSecondHand: false },
];

const WEAR_LOGS: WearLogRecord[] = (()=>{
  const logs: WearLogRecord[] = []; let id=0;
  ITEMS.forEach(item=>{ for(let i=0;i<item.wearCount;i++){ const d = new Date(); d.setDate(d.getDate()- (i*7)%180); logs.push({ id: 'log'+(++id), itemId:item.id, date: d.toISOString().slice(0,10) }); }});
  return logs;
})();

export interface WearStatsResult {
  totalItems: number;
  totalWearEvents: number;
  avgCostPerWear: number;
  perItem: Array<{ id:string; name:string; costPerWear:number; wearCount:number; daysOwned:number; wearRate:number; }>; // wearRate = wears / daysOwned * 100
  highestUtilized?: { id:string; name:string; wearRate:number } | undefined;
  newVsPrelovedRatio: { new:number; preLoved:number; preLovedPct:number };
}

export async function getWearStats(): Promise<WearStatsResult> {
  const today = new Date();
  const perItem = ITEMS.map(it => {
    const daysOwned = Math.max(1, Math.round((today.getTime() - new Date(it.purchaseDate).getTime())/86400000));
    const costPerWear = it.wearCount > 0 ? it.purchasePrice / it.wearCount : it.purchasePrice;
    const wearRate = (it.wearCount / daysOwned) * 100; // % of days worn since purchase
    return { id: it.id, name: it.name, costPerWear, wearCount: it.wearCount, daysOwned, wearRate };
  });
  const totalWearEvents = perItem.reduce((s,i)=>s+i.wearCount,0);
  const avgCostPerWear = perItem.length ? perItem.reduce((s,i)=>s+i.costPerWear,0)/perItem.length : 0;
  const highestUtilized = perItem.slice().sort((a,b)=>b.wearRate-a.wearRate)[0];
  const newCount = ITEMS.filter(i=>!i.isSecondHand).length;
  const preCount = ITEMS.filter(i=>i.isSecondHand).length;
  return {
    totalItems: ITEMS.length,
    totalWearEvents,
    avgCostPerWear,
    perItem,
    highestUtilized: highestUtilized ? { id: highestUtilized.id, name: highestUtilized.name, wearRate: highestUtilized.wearRate } : undefined,
    newVsPrelovedRatio: { new: newCount, preLoved: preCount, preLovedPct: newCount+preCount? (preCount/(newCount+preCount))*100:0 }
  };
}

// Helper to append a wear log and update counters
export async function logWear(itemId: string, date = new Date()): Promise<void> {
  const item = ITEMS.find(i=>i.id===itemId); if(!item) return; item.wearCount +=1; WEAR_LOGS.push({ id:'log'+(WEAR_LOGS.length+1), itemId, date: date.toISOString().slice(0,10) });
}
