'use client';

import React, { useMemo, useState } from 'react';
import { useBlueprintStore, Zone } from '@/store/useBlueprintStore';

interface BlueprintVisualizerProps {
  interactive?: boolean;
  className?: string;
}

export const BlueprintVisualizer: React.FC<BlueprintVisualizerProps> = ({
  interactive = true,
  className = '',
}) => {
  const { gridMatrix, zones, updateCell, activeZoneId, setActiveZoneId } = useBlueprintStore();
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; zoneId: number } | null>(null);

  // Quick lookup dictionary for O(1) zone resolution by zone_id
  const zoneMap = useMemo(() => {
    const map = new Map<number, Zone>();
    zones.forEach((z) => map.set(z.zone_id, z));
    return map;
  }, [zones]);

  const rowCount = gridMatrix.length;
  const colCount = gridMatrix[0]?.length || 0;

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!interactive) return;
    // If a zone is selected, paint it; if clicking cell with same active zone, erase (0)
    const currentVal = gridMatrix[rowIndex][colIndex];
    if (activeZoneId !== null) {
      updateCell(rowIndex, colIndex, currentVal === activeZoneId ? 0 : activeZoneId);
    } else {
      // Toggle cell between 0 and first zone if none active
      updateCell(rowIndex, colIndex, currentVal === 0 ? (zones[0]?.zone_id ?? 1) : 0);
    }
  };

  return (
    <div className={`w-full rounded-2xl bg-surface border border-border p-6 shadow-sm ${className}`}>
      {/* Header & Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
            <h2 className="text-lg font-serif font-semibold text-primary tracking-tight">
              Botanical Blueprint Visualizer
            </h2>
          </div>
          <p className="text-xs text-secondary mt-0.5">
            Dimensions: {rowCount} × {colCount} slots • {zones.length} active botanical zones
          </p>
        </div>

        {/* Status Indicator */}
        <div className="text-xs text-secondary bg-background/60 px-3 py-1.5 rounded-lg border border-border/80 flex items-center gap-2 self-start sm:self-auto">
          <span>Target:</span>
          <span className="font-mono font-medium text-primary">
            {hoveredCell && hoveredCell.zoneId !== 0
              ? `${zoneMap.get(hoveredCell.zoneId)?.name || 'Zone #' + hoveredCell.zoneId} [R${hoveredCell.row + 1}:C${hoveredCell.col + 1}]`
              : hoveredCell
              ? `Slot [R${hoveredCell.row + 1}:C${hoveredCell.col + 1}] — Empty`
              : 'Hover over a slot'}
          </span>
        </div>
      </div>

      {/* Grid Container with Responsive Overflow Wrapper */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div
          className="inline-grid gap-1.5 p-3 rounded-xl bg-background border border-border min-w-full justify-center"
          style={{
            gridTemplateColumns: `repeat(${colCount}, minmax(36px, 1fr))`,
            gridTemplateRows: `repeat(${rowCount}, minmax(36px, 1fr))`,
          }}
        >
          {gridMatrix.map((row, rIdx) =>
            row.map((cellId, cIdx) => {
              const isEmpty = cellId === 0;
              const zone = zoneMap.get(cellId);
              const isSelected = activeZoneId !== null && cellId === activeZoneId;

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx, zoneId: cellId })}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={
                    isEmpty
                      ? `Slot (${rIdx + 1}, ${cIdx + 1}) — Empty`
                      : `${zone?.name || 'Zone ' + cellId} (${rIdx + 1}, ${cIdx + 1})`
                  }
                  className={`
                    relative aspect-square w-full rounded-md transition-all duration-150 flex items-center justify-center
                    border
                    ${isEmpty ? 'bg-transparent border-dashed border-border hover:border-secondary/60 hover:bg-surface/40' : 'shadow-xs border-black/10 dark:border-white/10 hover:scale-[1.03]'}
                    ${isSelected ? 'ring-2 ring-brand-primary ring-offset-2 ring-offset-background' : ''}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary
                  `}
                  style={{
                    backgroundColor: isEmpty ? 'transparent' : zone?.hex_color || 'transparent',
                  }}
                >
                  {/* Subtle slot indicator for non-empty cells */}
                  {!isEmpty && (
                    <span className="text-[10px] font-mono font-medium opacity-80 mix-blend-difference text-white select-none">
                      {cellId}
                    </span>
                  )}

                  {/* Empty slot crosshair marker */}
                  {isEmpty && (
                    <span className="w-1 h-1 rounded-full bg-border group-hover:bg-secondary transition-colors" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Interactive Zone Palette & Legend */}
      <div className="mt-6 pt-5 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider text-secondary">
            Botanical Zone Palette & Legend
          </span>
          {activeZoneId !== null && (
            <button
              onClick={() => setActiveZoneId(null)}
              className="text-xs text-brand-secondary hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {zones.map((zone) => {
            const isActive = activeZoneId === zone.zone_id;
            return (
              <button
                key={zone.zone_id}
                onClick={() => setActiveZoneId(isActive ? null : zone.zone_id)}
                className={`
                  flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all
                  ${isActive ? 'bg-surface border-brand-primary ring-1 ring-brand-primary shadow-xs' : 'bg-surface/60 border-border hover:bg-surface hover:border-secondary/40'}
                `}
              >
                <span
                  className="w-4 h-4 rounded shadow-xs flex-shrink-0 border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: zone.hex_color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-primary truncate">
                    {zone.name || `Zone ${zone.zone_id}`}
                  </div>
                  <div className="text-[10px] font-mono text-secondary truncate">
                    {zone.hex_color}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
