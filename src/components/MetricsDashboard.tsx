import React from 'react';
import { BarChart3, Zap, CopyCheck, BrainCircuit, Activity, RotateCcw, AlertTriangle } from 'lucide-react';
import { AlgorithmMetrics, AlgorithmType } from '../types';

interface MetricsDashboardProps {
  metricsList: AlgorithmMetrics[];
  onTriggerCompare: () => void;
  isRunningAll: boolean;
  onClearMetrics: () => void;
}

export default function MetricsDashboard({
  metricsList,
  onTriggerCompare,
  isRunningAll,
  onClearMetrics
}: MetricsDashboardProps) {
  // Find extreme metrics to point out recommendations in summary
  const validMetrics = metricsList.filter(m => m.pathFound);
  
  const fastestAlgo = [...validMetrics].sort((a, b) => a.executionTime - b.executionTime)[0];
  const lowestVisitedAlgo = [...validMetrics].sort((a, b) => a.visitedCount - b.visitedCount)[0];
  const lowestCostAlgo = [...validMetrics].sort((a, b) => a.pathCost - b.pathCost)[0];

  // Maximum values for normalization in charts
  const maxVisited = Math.max(...metricsList.map(m => m.visitedCount), 1);
  const maxCost = Math.max(...metricsList.map(m => m.pathCost), 1);

  const formatTime = (time: number) => {
    if (time === 0) return '0.00 ms';
    if (time < 0.1) return `${(time * 1000).toFixed(0)} μs`;
    return `${time.toFixed(2)} ms`;
  };

  const getAlgoColor = (id: AlgorithmType) => {
    switch (id) {
      case 'bfs': return 'from-[#888] to-[#CDAF37]';
      case 'dfs': return 'from-[#555] to-slate-400';
      case 'dijkstra': return 'from-[#D4AF37] to-[#E5C35D]';
      case 'astar': return 'from-emerald-700 to-emerald-400';
      case 'greedy': return 'from-amber-700 to-amber-400';
    }
  };

  const getAlgoTextColor = (id: AlgorithmType) => {
    switch (id) {
      case 'bfs': return 'text-slate-300';
      case 'dfs': return 'text-[#888]';
      case 'dijkstra': return 'text-[#D4AF37]';
      case 'astar': return 'text-emerald-400';
      case 'greedy': return 'text-amber-400';
    }
  };

  return (
    <div className="bg-[#141412] rounded-xl p-6 border border-[#2A2A28] flex flex-col h-full shadow-2xl" id="metrics-dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A28] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">So Sánh Thực Nghiệm</h3>
            <p className="text-[10px] text-[#666] font-mono mt-0.5">Phân tích động trên bản đồ hiện thời</p>
          </div>
        </div>

        <div className="flex gap-2">
          {metricsList.length > 0 && (
            <button
              onClick={onClearMetrics}
              className="p-2 rounded bg-[#1A1A18] border border-[#2A2A28] text-[#666] hover:text-white transition-colors text-[10px] flex items-center gap-1.5"
              title="Xóa dữ liệu"
              id="clear-metrics-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase">Xóa bảng</span>
            </button>
          )}

          <button
            onClick={onTriggerCompare}
            disabled={isRunningAll}
            className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              isRunningAll
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-[#D4AF37] text-black hover:bg-[#E5C35D] shadow-lg shadow-[#D4AF37]/10 active:scale-95'
            }`}
            id="trigger-compare-btn"
          >
            <Zap className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-bounce' : ''}`} />
            <span>{isRunningAll ? 'Đang so sánh...' : 'Đối chiếu tất cả'}</span>
          </button>
        </div>
      </div>

      {metricsList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#2A2A28] rounded bg-[#0D0D0D]/30 min-h-[220px]">
          <BrainCircuit className="w-10 h-10 text-[#444] mb-3 animate-pulse" />
          <h4 className="text-xs uppercase tracking-wider text-[#888]">Chưa có số liệu phân tích</h4>
          <p className="text-[10px] text-[#555] max-w-sm mt-1.5 leading-relaxed font-mono">
            Khởi tạo khảo nghiệm bằng nút <span className="text-[#D4AF37]">"Đối chiếu tất cả"</span> để phân tích BFS, DFS và Dijkstra song song trên lưới hiện tại.
          </p>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {/* Summary highlight widgets */}
          {validMetrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded bg-[#1A1A18] border border-[#2A2A28] flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/10 rounded text-[#D4AF37]">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-[#666] block">TỐC ĐỘ CAO NHẤT</span>
                  <span className={`text-[11px] font-bold ${getAlgoTextColor(fastestAlgo.algorithmId)}`}>
                    {fastestAlgo.name.split(' ')[0]} ({formatTime(fastestAlgo.executionTime)})
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#1A1A18] border border-[#2A2A28] flex items-center gap-3">
                <div className="p-2 bg-slate-300/10 rounded text-slate-300">
                  <CopyCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-[#666] block">HẠN CHẾ DUYỆT ĐỈNH</span>
                  <span className={`text-[11px] font-bold ${getAlgoTextColor(lowestVisitedAlgo.algorithmId)}`}>
                    {lowestVisitedAlgo.name.split(' ')[0]} ({lowestVisitedAlgo.visitedCount} ô)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#1A1A18] border border-[#2A2A28] flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded text-[#D4AF37]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-[#666] block">ĐƯỜNG TỐI ƯU CHI PHÍ</span>
                  <span className={`text-[11px] font-semibold ${getAlgoTextColor(lowestCostAlgo.algorithmId)}`}>
                    {lowestCostAlgo.name.split(' ')[0]} (Cost: {lowestCostAlgo.pathCost})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Graphical Bars Comparison */}
          <div className="space-y-4">
            {/* Chart 1: Explored Nodes */}
            <div className="bg-[#0D0D0D] p-4 rounded border border-[#2A2A28]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888] block mb-3 font-mono">
                Số đỉnh/ô đã khảo sát (Biên độ duyệt đồ thị)
              </span>
              <div className="space-y-3">
                {metricsList.map(item => {
                  const percent = Math.max((item.visitedCount / maxVisited) * 100, 3);
                  return (
                    <div key={item.algorithmId} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-300 font-semibold">{item.name.replace("Thuật toán", "")}</span>
                        <span className="text-[#666]">{item.visitedCount} ô</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1A1A18] rounded-full overflow-hidden border border-[#2A2A28]/80">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getAlgoColor(item.algorithmId)} transition-all duration-1000`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Cost of Path found */}
            <div className="bg-[#0D0D0D] p-4 rounded border border-[#2A2A28]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#888] block mb-3 font-mono">
                Khái toán tổng lực cản/độ dài của đường đi tìm thấy
              </span>
              <div className="space-y-3">
                {metricsList.map(item => {
                  if (!item.pathFound) {
                    return (
                      <div key={item.algorithmId} className="flex justify-between items-center text-[11px] font-mono py-1">
                        <span className="text-slate-300 font-semibold">{item.name.replace("Thuật toán", "")}</span>
                        <span className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Không có lối thoát
                        </span>
                      </div>
                    );
                  }
                  const percent = Math.max((item.pathCost / maxCost) * 100, 4);
                  return (
                    <div key={item.algorithmId} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-300 font-semibold">{item.name.replace("Thuật toán", "")}</span>
                        <span className="text-[#888]">
                          Lực cản: <strong className="text-[#D4AF37]">{item.pathCost}</strong> ({item.pathLength} bước)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#1A1A18] rounded-full overflow-hidden border border-[#2A2A28]/80">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${getAlgoColor(item.algorithmId)} transition-all duration-1000`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabular data details */}
          <div className="overflow-x-auto rounded border border-[#2A2A28]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1A18] text-[#666] font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Hạt Nhân</th>
                  <th className="py-2 px-3">Thời Gian</th>
                  <th className="py-2 px-3">Số Ô Duyệt</th>
                  <th className="py-2 px-3">Lực Cản</th>
                  <th className="py-2 px-3">Tối Ưu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A28] font-mono bg-[#0D0D0D]/40">
                {metricsList.map(item => (
                  <tr key={item.algorithmId} className="hover:bg-[#1A1A18]/50 transition-colors">
                    <td className={`py-2 px-3 font-semibold ${getAlgoTextColor(item.algorithmId)}`}>
                      {item.name.replace("Thuật toán ", "").split(' ')[0]}
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      {item.pathFound ? formatTime(item.executionTime) : 'Vô nghiệm'}
                    </td>
                    <td className="py-2 px-3 text-[#888]">
                      {item.visitedCount} ô
                    </td>
                    <td className="py-2 px-3 text-[#D4AF37] font-bold">
                      {item.pathFound ? item.pathCost : '∞'}
                    </td>
                    <td className="py-2 px-3">
                      {item.pathFound ? (
                        item.isOptimal ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/10">
                            YES
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-[#888] border border-slate-700/30">
                            NO
                          </span>
                        )
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-950/20 text-rose-400 border border-rose-950/40">
                          FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
