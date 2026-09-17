import { create } from 'zustand';

export interface Zone {
  zone_id: number;
  name?: string;
  hex_color: string;
}

interface BlueprintState {
  gridMatrix: number[][];
  zones: Zone[];
  activeZoneId: number | null;
  setGridMatrix: (matrix: number[][]) => void;
  setZones: (zones: Zone[]) => void;
  updateCell: (rowIndex: number, colIndex: number, zoneId: number) => void;
  setActiveZoneId: (id: number | null) => void;
  clearGrid: () => void;
}

export const useBlueprintStore = create<BlueprintState>((set) => ({
  // Default sample matrix: 8x12 grid layout representing architectural / garden zones
  gridMatrix: [
    [1, 1, 1, 0, 0, 2, 2, 2, 0, 3, 3, 3],
    [1, 1, 1, 0, 0, 2, 2, 2, 0, 3, 3, 3],
    [1, 1, 1, 0, 0, 2, 2, 2, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 4, 4, 4, 0, 5, 5, 0, 6, 6, 6, 6],
    [4, 4, 4, 4, 0, 5, 5, 0, 6, 6, 6, 6],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8],
  ],
  zones: [
    { zone_id: 1, name: 'Conservatory & Palms', hex_color: '#5B6C43' },
    { zone_id: 2, name: 'Medicinal Herbarium', hex_color: '#A68B5B' },
    { zone_id: 3, name: 'Orchid Terrarium', hex_color: '#8A9A65' },
    { zone_id: 4, name: 'Arboretum Nursery', hex_color: '#435334' },
    { zone_id: 5, name: 'Central Fountain Courtyard', hex_color: '#7F9370' },
    { zone_id: 6, name: 'Perennial Borders', hex_color: '#C2A676' },
    { zone_id: 7, name: 'Alpine Rock Garden', hex_color: '#657754' },
    { zone_id: 8, name: 'Fern & Moss Ravine', hex_color: '#3B492B' },
  ],
  activeZoneId: null,
  setGridMatrix: (matrix) => set({ gridMatrix: matrix }),
  setZones: (zones) => set({ zones }),
  setActiveZoneId: (id) => set({ activeZoneId: id }),
  updateCell: (rowIndex, colIndex, zoneId) =>
    set((state) => {
      const next = state.gridMatrix.map((row, r) =>
        r === rowIndex ? row.map((cell, c) => (c === colIndex ? zoneId : cell)) : row
      );
      return { gridMatrix: next };
    }),
  clearGrid: () =>
    set((state) => ({
      gridMatrix: state.gridMatrix.map((row) => row.map(() => 0)),
    })),
}));
