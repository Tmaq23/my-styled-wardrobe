'use client';
import useSWR from 'swr';

interface StatsData {
  totalItems: number;
  totalWearEvents: number;
  avgCostPerWear: number;
  perItem: { id:string; name:string; costPerWear:number; wearCount:number; daysOwned:number; wearRate:number; }[];
  highestUtilized?: { id:string; name:string; wearRate:number };
  newVsPrelovedRatio: { new:number; preLoved:number; preLovedPct:number };
}

const fetcher = (url:string)=>fetch(url).then(r=>r.json());

const StatCard = ({ title, value, sub }: { title:string; value:string; sub?:string }) => (
  <div className="stat-card">
    <h4>{title}</h4>
    <div className="stat-value">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

export default function WardrobeStats(){
  const { data, error, isLoading } = useSWR<StatsData>('/api/stats', fetcher, { refreshInterval: 30000 });
  if (error) return <div className="stats-wrapper">Failed to load stats</div>;
  if (!data || isLoading) return <div className="stats-wrapper">Loading wardrobe analytics…</div>;

  return (
    <div className="stats-wrapper">
      <div className="stats-grid">
        <StatCard title="Total Items" value={String(data.totalItems)} />
        <StatCard title="Total Wears" value={String(data.totalWearEvents)} />
        <StatCard title="Avg Cost / Wear" value={`£${data.avgCostPerWear.toFixed(2)}`} />
        <StatCard title="Pre‑Loved %" value={`${data.newVsPrelovedRatio.preLovedPct.toFixed(1)}%`} sub={`${data.newVsPrelovedRatio.preLoved} pre‑loved`} />
        {data.highestUtilized && (
          <StatCard title="Highest Wear Rate" value={`${data.highestUtilized.wearRate.toFixed(1)}%`} sub={data.highestUtilized.name} />
        )}
      </div>
      <div className="stats-table">
        <table>
          <thead>
            <tr>
              <th>Item</th><th>Wear Count</th><th>Days Owned</th><th>Wear Rate %</th><th>Cost / Wear</th>
            </tr>
          </thead>
          <tbody>
            {data.perItem.map((it: StatsData['perItem'][number]) => (
              <tr key={it.id}>
                <td>{it.name}</td>
                <td>{it.wearCount}</td>
                <td>{it.daysOwned}</td>
                <td>{it.wearRate.toFixed(1)}</td>
                <td>£{it.costPerWear.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
