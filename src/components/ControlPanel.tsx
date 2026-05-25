import React from 'react';
import {
  Play,
  Trash2,
  Sliders,
  Paintbrush,
  Sparkles,
  RefreshCw,
  Eraser,
  Grid,
  Weight,
  Flag,
  Target
} from 'lucide-react';
import { AlgorithmType, SpeedType, ToolMode } from '../types';

interface ControlPanelProps {
  selectedAlgo: AlgorithmType;
  onChangeAlgo: (algo: AlgorithmType) => void;
  speed: SpeedType;
  onChangeSpeed: (speed: SpeedType) => void;
  toolMode: ToolMode;
  onChangeToolMode: (mode: ToolMode) => void;
  isRunning: boolean;
  onStartVisualization: () => void;
  onClearGrid: () => void;
  onClearPathsOnly: () => void;
  onGenerateRandomWalls: (density: number) => void;
  onGenerateRecursiveDivision: () => void;
  onGenerateSwampTerrain: () => void;
  wallDensity: number;
  onChangeWallDensity: (density: number) => void;
  allowDiagonal: boolean;
  onChangeAllowDiagonal: (allow: boolean) => void;
  heuristicType: 'manhattan' | 'euclidean' | 'octile';
  onChangeHeuristicType: (type: 'manhattan' | 'euclidean' | 'octile') => void;
}

export default function ControlPanel({
  selectedAlgo,
  onChangeAlgo,
  speed,
  onChangeSpeed,
  toolMode,
  onChangeToolMode,
  isRunning,
  onStartVisualization,
  onClearGrid,
  onClearPathsOnly,
  onGenerateRandomWalls,
  onGenerateRecursiveDivision,
  onGenerateSwampTerrain,
  wallDensity,
  onChangeWallDensity,
  allowDiagonal,
  onChangeAllowDiagonal,
  heuristicType,
  onChangeHeuristicType,
}: ControlPanelProps) {
  return (
    <div className="bg-[#141412] rounded-xl p-6 border border-[#2A2A28] space-y-6" id="control-panel">
      {/* 1. Core Actions */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-widest text-[#666] font-mono flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Vận Hành Mô Phỏng</span>
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Main Play */}
          <button
            onClick={onStartVisualization}
            disabled={isRunning}
            className={`sm:col-span-1 py-3 px-4 rounded font-bold uppercase tracking-[0.2em] text-xs transition-colors ${
              isRunning
                ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800/50'
                : 'bg-[#D4AF37] hover:bg-[#E5C35D] text-black shadow-lg shadow-[#D4AF37]/10 hover:scale-[0.99] active:scale-95'
            }`}
            id="start-visualization-btn"
          >
            <span className="flex items-center justify-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Chạy Mô Phỏng</span>
            </span>
          </button>

          {/* Clear Paths Only */}
          <button
            onClick={onClearPathsOnly}
            disabled={isRunning}
            className="py-3 px-4 rounded text-xs font-medium uppercase tracking-wider bg-[#1A1A18] text-[#888] border border-[#2A2A28] hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
            id="clear-paths-btn"
          >
            <span className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xóa Đồ Thị</span>
            </span>
          </button>

          {/* Reset All */}
          <button
            onClick={onClearGrid}
            disabled={isRunning}
            className="py-3 px-4 rounded text-xs font-medium uppercase tracking-wider bg-[#1A1A18] text-rose-400 border border-[#2A2A28] hover:bg-rose-950/20 hover:border-rose-900 transition-colors disabled:opacity-50"
            id="reset-all-btn"
          >
            <span className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dọn Dẹp Lưới</span>
            </span>
          </button>
        </div>
      </div>

      {/* 2. Algorithm & Speed Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#2A2A28]">
        {/* ALGO SELECT */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#666] font-mono block">
            Thuật Toán Hiện Hành
          </label>
          <select
            value={selectedAlgo}
            onChange={(e) => onChangeAlgo(e.target.value as AlgorithmType)}
            disabled={isRunning}
            className="w-full bg-[#1A1A18] border border-[#D4AF37] rounded p-2.5 text-xs text-[#F2F2F0] font-sans font-medium outline-none focus:ring-1 focus:ring-[#D4AF37] transition-colors disabled:opacity-50"
            id="algo-select"
          >
            <option value="bfs">BFS — Breadth-First Search (Chiều Rộng)</option>
            <option value="dfs">DFS — Depth-First Search (Chiều Sâu)</option>
            <option value="dijkstra">Dijkstra — Tìm đường Trọng số</option>
            <option value="astar">A* Search — Heuristic Tối ưu ★</option>
            <option value="greedy">Greedy Best-First — Tham Lam Nhanh</option>
          </select>
        </div>

        {/* SPEED SELECT */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-[#666] font-mono block">
            Tốc Độ Hoạt Họa
          </label>
          <div className="flex bg-[#1A1A18] border border-[#2A2A28] p-1 rounded-sm text-xs" id="speed-tab-group">
            {(['slow', 'medium', 'fast'] as SpeedType[]).map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                disabled={isRunning}
                className={`flex-1 py-1.5 rounded-sm text-center uppercase tracking-wider text-[10px] font-semibold transition-all ${
                  speed === s
                    ? 'bg-[#252522] text-[#D4AF37] border border-[#2A2A28]'
                    : 'text-[#666] hover:text-[#F2F2F0]'
                } disabled:opacity-50`}
                id={`speed-${s}`}
              >
                {s === 'slow' ? 'Chậm' : s === 'medium' ? 'Vừa' : 'Nhanh'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2b. Diagonal & Heuristic Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2A2A28]/50">
        {/* Toggle Di chuyển Chéo */}
        <div className="flex items-center justify-between bg-[#1A1A18] border border-[#2A2A28] rounded p-3">
          <div>
            <span className="text-[11px] font-bold text-white uppercase tracking-wide block">Đi chéo (8 hướng)</span>
            <span className="text-[9px] text-[#555] font-mono">Hệ số chéo = √2 ≈ 1.41</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={allowDiagonal}
              onChange={(e) => onChangeAllowDiagonal(e.target.checked)}
              disabled={isRunning}
              className="sr-only peer"
              id="diagonal-toggle"
            />
            <div className="w-9 h-5 bg-[#2A2A28] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#888] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]/30 peer-checked:after:bg-[#D4AF37]"></div>
          </label>
        </div>

        {/* Heuristic Selector — chỉ hiện khi chọn A* hoặc Greedy */}
        {(selectedAlgo === 'astar' || selectedAlgo === 'greedy') ? (
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-[#666] font-mono block">
              Hàm Heuristic h(n)
            </label>
            <select
              value={heuristicType}
              onChange={(e) => onChangeHeuristicType(e.target.value as 'manhattan' | 'euclidean' | 'octile')}
              disabled={isRunning}
              className="w-full bg-[#1A1A18] border border-[#2A2A28] rounded p-2.5 text-[11px] text-[#A0A09B] outline-none focus:border-[#D4AF37] transition-colors disabled:opacity-50"
              id="heuristic-select"
            >
              <option value="manhattan">Manhattan — Lưới 4 hướng</option>
              <option value="euclidean">Euclidean — Đường chim bay</option>
              <option value="octile">Octile — Lưới 8 hướng (chéo)</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-[#0D0D0D] border border-dashed border-[#2A2A28] rounded p-3">
            <span className="text-[10px] text-[#444] font-mono text-center">Heuristic chỉ dùng<br/>cho A* và Greedy</span>
          </div>
        )}
      </div>

      {/* 3. Drawing Brushes / Tools */}
      <div className="space-y-3 pt-2 border-t border-[#2A2A28]">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase tracking-widest text-[#666] font-mono flex items-center gap-1.5">
            <Paintbrush className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cọ Vẽ Địa Hình & Điểm Nút</span>
          </h4>
          <span className="text-[9px] text-[#555] font-mono select-none">Nhắp chuột & rê vẽ trên lưới</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="brushes-container">
          {/* Start Brush */}
          <button
            onClick={() => onChangeToolMode('start')}
            disabled={isRunning}
            className={`px-3 py-2.5 rounded border text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              toolMode === 'start'
                ? 'bg-[#1A1A18] text-[#D4AF37] border-[#D4AF37]'
                : 'bg-[#1A1A18] text-[#888] border-[#2A2A28] hover:text-white hover:border-[#444]'
            } disabled:opacity-50`}
            id="brush-start-btn"
          >
            <Flag className="w-3.5 h-3.5 shrink-0" />
            <span>Bắt đầu</span>
          </button>

          {/* End Brush */}
          <button
            onClick={() => onChangeToolMode('end')}
            disabled={isRunning}
            className={`px-3 py-2.5 rounded border text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              toolMode === 'end'
                ? 'bg-[#1A1A18] text-white border-white'
                : 'bg-[#1A1A18] text-[#888] border-[#2A2A28] hover:text-white hover:border-[#444]'
            } disabled:opacity-50`}
            id="brush-end-btn"
          >
            <Target className="w-3.5 h-3.5 shrink-0" />
            <span>Đích</span>
          </button>

          {/* Wall Brush */}
          <button
            onClick={() => onChangeToolMode('wall')}
            disabled={isRunning}
            className={`px-3 py-2.5 rounded border text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              toolMode === 'wall'
                ? 'bg-[#2A2A28] text-white border-[#444]'
                : 'bg-[#1A1A18] text-[#888] border-[#2A2A28] hover:text-white hover:border-[#444]'
            } disabled:opacity-50`}
            id="brush-wall-btn"
          >
            <Grid className="w-3.5 h-3.5 shrink-0" />
            <span>Tường</span>
          </button>

          {/* Weight Terrain Brush */}
          <button
            onClick={() => onChangeToolMode('weight')}
            disabled={isRunning}
            className={`px-3 py-2.5 rounded border text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              toolMode === 'weight'
                ? 'bg-[#3D2C1E] text-[#D4AF37] border-[#5C4533]'
                : 'bg-[#1A1A18] text-[#888] border-[#2A2A28] hover:text-white hover:border-[#444]'
            } disabled:opacity-50`}
            title="Đầm lầy / Ao nước di chuyển với hệ số lớn"
            id="brush-weight-btn"
          >
            <Weight className="w-3.5 h-3.5 shrink-0" />
            <span>Ao nước</span>
          </button>

          {/* Eraser */}
          <button
            onClick={() => onChangeToolMode('eraser')}
            disabled={isRunning}
            className={`col-span-2 sm:col-span-1 px-3 py-2.5 rounded border text-[11px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              toolMode === 'eraser'
                ? 'bg-[#252522] text-[#888] border-purple-900/60'
                : 'bg-[#1A1A18] text-[#888] border-[#2A2A28] hover:text-white hover:border-[#444]'
            } disabled:opacity-50`}
            id="brush-eraser-btn"
          >
            <Eraser className="w-3.5 h-3.5 shrink-0" />
            <span>Cọ Tẩy</span>
          </button>
        </div>
      </div>

      {/* 4. Automated Generation */}
      <div className="space-y-3 pt-2 border-t border-[#2A2A28]">
        <h4 className="text-[10px] uppercase tracking-widest text-[#666] font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Kiến Tạo Mê Cung Tự Động</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Recursive Division Walls */}
          <button
            onClick={onGenerateRecursiveDivision}
            disabled={isRunning}
            className="py-2.5 px-3 bg-[#1A1A18] border border-[#2A2A28] text-[10px] uppercase tracking-wider text-[#A0A09B] hover:text-[#F2F2F0] hover:bg-[#252522] transition-colors disabled:opacity-50"
            id="gen-recursive-maze-btn"
          >
            <span>Dạng ô hồi quy</span>
          </button>

          {/* Organic Swamp-Terrain Rivers */}
          <button
            onClick={onGenerateSwampTerrain}
            disabled={isRunning}
            className="py-2.5 px-3 bg-[#1A1A18] border border-[#2A2A28] text-[10px] uppercase tracking-wider text-[#A0A09B] hover:text-[#F2F2F0] hover:bg-[#252522] transition-colors disabled:opacity-50 font-medium"
            title="Sông sâu và lầy bồi có hệ số trọng số di chuyển cao"
            id="gen-swamp-terrain-btn"
          >
            <span>Đất lầy có trọng số</span>
          </button>

          {/* Random Walls Noise */}
          <button
            onClick={() => onGenerateRandomWalls(wallDensity)}
            disabled={isRunning}
            className="py-2.5 px-3 bg-[#1A1A18] border border-[#2A2A28] text-[10px] uppercase tracking-wider text-[#A0A09B] hover:text-[#F2F2F0] hover:bg-[#252522] transition-colors disabled:opacity-50"
            id="gen-random-walls-btn"
          >
            <span>Mảng đá rải rác ({Math.round(wallDensity * 100)}%)</span>
          </button>
        </div>

        {/* Wall Density slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] text-[#888] font-mono">
            <span>Tham số mật độ ngẫu nhiên:</span>
            <span className="text-[#D4AF37]">{Math.round(wallDensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.40"
            step="0.05"
            value={wallDensity}
            onChange={(e) => onChangeWallDensity(parseFloat(e.target.value))}
            disabled={isRunning}
            className="w-full h-1 bg-[#2A2A28] rounded-lg appearance-none cursor-pointer accent-[#D4AF37] disabled:opacity-50"
            id="wall-density-slider"
          />
        </div>
      </div>
    </div>
  );
}
