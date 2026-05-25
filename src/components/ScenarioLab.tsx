import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Zap,
  HelpCircle,
  Award,
  Sparkles,
  Play,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import { GridNode, AlgorithmType } from '../types';
import { bfs, dfs, dijkstra, astar, greedyBfs, getNodesInShortestPathOrder } from '../utils/algorithms';


export type ScenarioId = 'case1' | 'case2' | 'case3';

interface ScenarioLabProps {
  currentScenario: ScenarioId | null;
  onSelectScenario: (id: ScenarioId) => void;
  onRunScenario: (id: ScenarioId) => void;
  isRunning: boolean;
}

const NUM_ROWS = 20;
const NUM_COLS = 45;

const getScenarioSetupLocal = (id: ScenarioId) => {
  let start = { row: 10, col: 7 };
  let end = { row: 10, col: 37 };

  if (id === 'case1') {
    start = { row: 10, col: 7 };
    end = { row: 10, col: 37 };
  } else if (id === 'case2') {
    start = { row: 16, col: 22 };
    end = { row: 19, col: 22 };
  } else if (id === 'case3') {
    start = { row: 10, col: 18 };
    end = { row: 10, col: 26 };
  }

  const newGrid: GridNode[][] = [];
  for (let r = 0; r < NUM_ROWS; r++) {
    const currentRow: GridNode[] = [];
    for (let c = 0; c < NUM_COLS; c++) {
      currentRow.push({
        row: r,
        col: c,
        isStart: r === start.row && c === start.col,
        isEnd: r === end.row && c === end.col,
        isWall: false,
        weight: 1,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      });
    }
    newGrid.push(currentRow);
  }

  if (id === 'case1') {
    // Swamp lake setup in the center (rows 4 to 15, cols 17 to 27)
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 17; c <= 27; c++) {
        if (r >= 4 && r <= 15) {
          newGrid[r][c].weight = 10;
        }
      }
    }
  } else if (id === 'case2') {
    // DFS entrapment setup
    for (let c = 10; c <= 35; c++) {
      if (c !== 12) {
        newGrid[17][c].isWall = true;
        newGrid[18][c].isWall = true;
      }
    }
    for (let r = 1; r <= 15; r++) {
      newGrid[r][21].isWall = true;
      newGrid[r][23].isWall = true;
    }
    newGrid[1][22].isWall = true;
  } else if (id === 'case3') {
    // Heavy Swamp Belt in columns 21 to 25 (weight = 10)
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 21; c <= 25; c++) {
        newGrid[r][c].weight = 10;
      }
    }
  }

  return { start, end, newGrid };
};

// Sub-component for small visualizer grids
function CompactGrid({ grid, algoType }: { grid: GridNode[][]; algoType: string }) {
  const cols = grid[0]?.length || 0;
  
  const getNodeClassName = (node: GridNode) => {
    const { isStart, isEnd, isWall, isVisited, isPath, weight } = node;
    if (isStart) return 'bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.9)] z-10 animate-pulse scale-[1.05] rounded-[2px]';
    if (isEnd) return 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-10 scale-[1.05] rounded-[2px]';
    if (isWall) return 'bg-[#2E2E2C] border-transparent';
    if (isPath) return 'bg-[#D4AF37] border-[#FFE27D] scale-[1.1] z-10 shadow-[0_0_8px_rgba(212,175,55,0.8)] rounded-[1.5px] transition-all duration-300';
    if (isVisited) {
      if (algoType.toLowerCase().includes('bfs')) {
        return 'bg-blue-500/25 border border-blue-400/40 shadow-[0_0_4px_rgba(59,130,246,0.2)] scale-[0.95]';
      } else if (algoType.toLowerCase().includes('dfs')) {
        return 'bg-amber-500/25 border border-amber-400/40 shadow-[0_0_4px_rgba(245,158,11,0.2)] scale-[0.95]';
      } else { // dijkstra
        if (weight > 1) {
          return 'bg-[#4B2B64] border border-[#7A3E9F]/40 shadow-[0_0_6px_rgba(122,62,159,0.3)] animate-pulse scale-[0.95]'; // purple-indigo deep sình lầy
        }
        return 'bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_4px_rgba(6,182,212,0.2)] scale-[0.95]';
      }
    }
    if (weight === 5) return 'bg-[#3D2C1E]/70 border border-[#5C4533]/25 rounded-[1.5px]'; // Forest deep amber-brown mud
    if (weight === 10) return 'bg-[#1C2030]/70 border border-[#2B3554]/25 rounded-[1.5px]'; // Beautiful thick swamp blue
    return 'bg-[#0B0B09] border-[#181816]/70';
  };

  return (
    <div className="overflow-x-auto w-full p-2 bg-[#080807] border border-[#1C1C1A] rounded p-1.5 flex justify-center">
      <div 
        className="grid gap-[1px] select-none min-w-[320px] max-w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rIdx) =>
          row.map((node, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`aspect-square w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2 px-[0.1px] rounded-[1px] transition-all duration-300 ${getNodeClassName(node)}`}
              title={node.weight > 1 ? `Hố sình lầy (Hệ số phạt: ${node.weight})` : `Ô [${rIdx}, ${cIdx}]`}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function ScenarioLab({
  currentScenario,
  onSelectScenario,
  onRunScenario,
  isRunning
}: ScenarioLabProps) {
  // Dual-view grid states for side-by-side simulation
  const [leftGrid, setLeftGrid] = useState<GridNode[][] | null>(null);
  const [rightGrid, setRightGrid] = useState<GridNode[][] | null>(null);
  const [isComparisonAnimating, setIsComparisonAnimating] = useState(false);
  const [comparisonStep, setComparisonStep] = useState(0);
  const [animSpeed, setAnimSpeed] = useState<'slow' | 'medium' | 'fast' | 'super'>('medium');

  // Real-time metrics
  const [leftMetrics, setLeftMetrics] = useState<{
    visitedCount: number;
    pathCost: number;
    pathFound: boolean;
    isOptimal: boolean;
    name: string;
    isFinished: boolean;
  } | null>(null);

  const [rightMetrics, setRightMetrics] = useState<{
    visitedCount: number;
    pathCost: number;
    pathFound: boolean;
    isOptimal: boolean;
    name: string;
    isFinished: boolean;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  const scenarios = [
    {
      id: 'case1' as ScenarioId,
      title: 'TÌNH HUỐNG 1 — “Đường Ngắn Không Phải Đường Rẻ”',
      badge: 'Trọng số Địa hình',
      badgeColor: 'text-[#D4AF37] border-[#D4AF37]/35 bg-[#D4AF37]/10',
      description: 'Lưới chứa một đầm lầy sâu (hệ số cản = 10). BFS ưu tiên đi thẳng tuột xuyên qua đầm lầy vì tiết kiệm bước đi, trong khi Dijkstra bình tĩnh rẽ lái đi đường vòng xa để giữ thể lực.',
      objective: 'Chứng minh BFS vô năng khi chống chọi với địa hình dốc/bùn lầy (đồ thị có trọng số), trong khi Dijkstra luôn tối ưu hóa chi phí thực tế.',
      leftAlgo: 'BFS',
      rightAlgo: 'Dijkstra',
      expected: [
        { algo: 'BFS (Bên Trái)', result: 'Lao thẳng tưng xuyên bãi sình nặng', status: 'Mất 11 bước x hệ số cản 10 = Cực kỳ mệt mỏi (Cost cao)' },
        { algo: 'Dijkstra (Mạn Phải)', result: 'Khuất phục cua vòng rìa phẳng phiu', status: 'Duyệt mượt bờ cỏ, Cost thấp nhất tối ưu tuyệt đối!' }
      ],
      insight: 'BFS chỉ đúng trên đồ thị không cấu phân địa hình. Gặp đất dốc cỏ rậm đầm lầy, Dijkstra luôn là vua tìm đường với chi phí thấp nhất.'
    },
    {
      id: 'case2' as ScenarioId,
      title: 'TÌNH HUỐNG 2 — “Cạm Bẫy Ngõ Cụt của DFS”',
      badge: 'Cạm bẫy Hành lang',
      badgeColor: 'text-amber-500 border-amber-500/35 bg-amber-500/10',
      description: 'Hầm ngõ cụt siêu sâu nằm chắn ngang mạn sườn ưu tiên của DFS. Trong khi lối thoát hiểm khẩn cấp nằm kề sát bên xuất phát chỉ 3 ô ở hướng ngược lại.',
      objective: 'Lột trần điểm yếu duyệt sâu bất chấp của DFS, biến nó thành nạn nhân dễ dàng của các cạm bẫy hành lang mồi nhử dài vô hạn.',
      leftAlgo: 'DFS',
      rightAlgo: 'BFS',
      expected: [
        { algo: 'DFS (Bên Trái)', result: 'Hăm hở chui lọt tận đáy sâu ngõ cụt', status: 'Tốn hàng trăm bước thu dọn ngăn xếp trong ngơ ngác' },
        { algo: 'BFS (Mạn Phải)', result: 'Quét vòm đồng tâm kề cận tức khắc', status: 'Ẵm trọn chiến thắng sinh tồn chỉ sau 3 bước duyệt gọn!' }
      ],
      insight: 'DFS ưu tiên vét cạn chiều dọc nhánh. Ở các mê cung chứa nhánh cụt dài và đích nằm sát điểm xuất phát, DFS hoạt động cực tệ hại.'
    },
    {
      id: 'case3' as ScenarioId,
      title: 'TÌNH HUỐNG 3 — “Cạm Bẫy Mồi Nhử Trọng Số (Dijkstra Kém Hiệu Quả)”',
      badge: 'Điểm Yếu Dijkstra',
      badgeColor: 'text-[#E53E3E] border-[#E53E3E]/35 bg-[#E53E3E]/10',
      description: 'Lối đi bên trái cực kỳ rộng mở và phẳng lặng (Cost = 1). Lối đi bên phải dẫn tới đích nhưng bị một đai bùn lầy dày đặc (Cost = 10) chắn ngang. Vì mải mê thám thính vùng cỏ phẳng chi phí rẻ phía sau lưng ngược hướng mục tiêu, Dijkstra sẽ bị lừa thám thính sạch bách mạn trái trước khi lội bùn mạn phải.',
      objective: 'Chỉ ra nhược điểm chí mạng của Dijkstra (Tính tham lam trọng số thấp): Dễ dàng bị mồi nhử bởi vùng cỏ phẳng rộng lớn đi ngược hướng mục tiêu, trong khi BFS tìm thấy lối đi liên thông topo đơn giản cực kỳ nhanh chóng.',
      leftAlgo: 'BFS',
      rightAlgo: 'Dijkstra',
      expected: [
         { algo: 'BFS (Bên Trái)', result: 'Lội thẳng xuyên đai bùn lầy về đích tức khắc', status: 'Chỉ thám thính một số lượng ô cực nhỏ hình kim cương' },
         { algo: 'Dijkstra (Mạn Phải)', result: 'Bị mê hoặc thám thính sạch bách mạn trái', status: 'Duyệt hơn 400 ô vô nghĩa ngược hướng trước khi chịu vượt bùn!' }
      ],
      insight: 'Khi chỉ cần tìm đường khả thi hoặc khi phân bổ trọng số chênh lệch lớn dẫn dụ sai hướng mục tiêu, Dijkstra tốn hàng trăm lượt duyệt thừa thãi vào vùng "mồi nhử giá rẻ" so với BFS.'
    }
  ];

  const selected = scenarios.find(s => s.id === currentScenario);

  // Initialize grids on scenario shift
  useEffect(() => {
    if (currentScenario) {
      const { newGrid } = getScenarioSetupLocal(currentScenario);
      setLeftGrid(newGrid);
      setRightGrid(newGrid);
      setIsComparisonAnimating(false);
      setComparisonStep(0);
      setLeftMetrics(null);
      setRightMetrics(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [currentScenario]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStartComparison = () => {
    if (!currentScenario || isComparisonAnimating) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Smoothly scroll down to side-by-side grids so the user can see them running in real-time
    setTimeout(() => {
      const target = document.getElementById('sxs-grids-board');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    const { start, end, newGrid } = getScenarioSetupLocal(currentScenario);
    
    let leftAlgoType: AlgorithmType = 'bfs';
    let rightAlgoType: AlgorithmType = 'dijkstra';

    if (currentScenario === 'case2') {
      leftAlgoType = 'dfs';
      rightAlgoType = 'bfs';
    }

    // Prepare deep clones for separate calculation
    const leftGridClone = newGrid.map(row => row.map(node => ({ ...node })));
    const rightGridClone = newGrid.map(row => row.map(node => ({ ...node })));

    const leftStartNode = leftGridClone[start.row][start.col];
    const leftEndNode = leftGridClone[end.row][end.col];
    const rightStartNode = rightGridClone[start.row][start.col];
    const rightEndNode = rightGridClone[end.row][end.col];

    // Compute search node sequences
    let visitedLeft: GridNode[] = [];
    if (leftAlgoType === 'bfs') {
      visitedLeft = bfs(leftGridClone, leftStartNode, leftEndNode);
    } else {
      visitedLeft = dfs(leftGridClone, leftStartNode, leftEndNode);
    }

    let visitedRight: GridNode[] = [];
    if (rightAlgoType === 'bfs') {
      visitedRight = bfs(rightGridClone, rightStartNode, rightEndNode);
    } else {
      visitedRight = dijkstra(rightGridClone, rightStartNode, rightEndNode);
    }

    // Trace shortest path results
    const pathLeft = getNodesInShortestPathOrder(leftEndNode);
    const pathLeftFound = pathLeft.length > 0 && pathLeft[0].isStart;
    const pathLeftCost = pathLeftFound 
      ? pathLeft.reduce((acc, curr) => acc + (curr.isStart ? 0 : curr.weight), 0)
      : Infinity;

    const pathRight = getNodesInShortestPathOrder(rightEndNode);
    const pathRightFound = pathRight.length > 0 && pathRight[0].isStart;
    const pathRightCost = pathRightFound 
      ? pathRight.reduce((acc, curr) => acc + (curr.isStart ? 0 : curr.weight), 0)
      : Infinity;

    setIsComparisonAnimating(true);
    setComparisonStep(0);

    let step = 0;
    
    // Fine-tune timing rates & step gaps
    let intervalMs = 28;
    let stepIncr = 1;

    if (animSpeed === 'slow') {
      intervalMs = 65;
      stepIncr = 1;
    } else if (animSpeed === 'medium') {
      intervalMs = 30;
      stepIncr = 1;
    } else if (animSpeed === 'fast') {
      intervalMs = 15;
      stepIncr = 2;
    } else if (animSpeed === 'super') {
      intervalMs = 6;
      stepIncr = 4;
    }

    timerRef.current = setInterval(() => {
      step += stepIncr;
      setComparisonStep(step);

      // --- Left agent update ---
      const nextLeftGrid = newGrid.map(row => row.map(node => ({ ...node })));
      const leftVisitedCount = Math.min(step, visitedLeft.length);
      
      for (let i = 0; i < leftVisitedCount; i++) {
        const node = visitedLeft[i];
        if (!node.isStart && !node.isEnd) {
          nextLeftGrid[node.row][node.col].isVisited = true;
        }
      }

      const leftDoneVisiting = step >= visitedLeft.length;
      let leftPathLimit = 0;
      if (leftDoneVisiting && pathLeftFound) {
        leftPathLimit = Math.min(step - visitedLeft.length, pathLeft.length);
        for (let i = 0; i < leftPathLimit; i++) {
          const pNode = pathLeft[i];
          if (!pNode.isStart && !pNode.isEnd) {
            nextLeftGrid[pNode.row][pNode.col].isPath = true;
          }
        }
      }
      setLeftGrid(nextLeftGrid);

      setLeftMetrics({
        visitedCount: leftVisitedCount,
        pathCost: leftDoneVisiting && leftPathLimit >= pathLeft.length ? pathLeftCost : 0,
        pathFound: pathLeftFound,
        isOptimal: currentScenario === 'case3' && leftAlgoType === 'bfs',
        name: leftAlgoType.toUpperCase(),
        isFinished: leftDoneVisiting && (pathLeftFound ? leftPathLimit >= pathLeft.length : true)
      });

      // --- Right agent update ---
      const nextRightGrid = newGrid.map(row => row.map(node => ({ ...node })));
      const rightVisitedCount = Math.min(step, visitedRight.length);
      
      for (let i = 0; i < rightVisitedCount; i++) {
        const node = visitedRight[i];
        if (!node.isStart && !node.isEnd) {
          nextRightGrid[node.row][node.col].isVisited = true;
        }
      }

      const rightDoneVisiting = step >= visitedRight.length;
      let rightPathLimit = 0;
      if (rightDoneVisiting && pathRightFound) {
        rightPathLimit = Math.min(step - visitedRight.length, pathRight.length);
        for (let i = 0; i < rightPathLimit; i++) {
          const pNode = pathRight[i];
          if (!pNode.isStart && !pNode.isEnd) {
            nextRightGrid[pNode.row][pNode.col].isPath = true;
          }
        }
      }
      setRightGrid(nextRightGrid);

      setRightMetrics({
        visitedCount: rightVisitedCount,
        pathCost: rightDoneVisiting && rightPathLimit >= pathRight.length ? pathRightCost : 0,
        pathFound: pathRightFound,
        isOptimal: rightAlgoType === 'dijkstra' || (currentScenario === 'case2' && rightAlgoType === 'bfs'),
        name: rightAlgoType.toUpperCase(),
        isFinished: rightDoneVisiting && (pathRightFound ? rightPathLimit >= pathRight.length : true)
      });

      // Check exit condition
      const endLimitLeft = visitedLeft.length + (pathLeftFound ? pathLeft.length : 0);
      const endLimitRight = visitedRight.length + (pathRightFound ? pathRight.length : 0);
      const limitAll = Math.max(endLimitLeft, endLimitRight);

      if (step >= limitAll + 5) {
        setIsComparisonAnimating(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }, intervalMs) as unknown as number;
  };

  const handleResetComparison = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsComparisonAnimating(false);
    setComparisonStep(0);
    setLeftMetrics(null);
    setRightMetrics(null);
    if (currentScenario) {
      const { newGrid } = getScenarioSetupLocal(currentScenario);
      setLeftGrid(newGrid);
      setRightGrid(newGrid);
    }
  };

  return (
    <div className="bg-[#141412] rounded-xl p-6 border border-[#2A2A28] flex flex-col h-full shadow-2xl" id="scenario-lab-container">
      <div className="flex items-center gap-2 mb-4 border-b border-[#2A2A28] pb-4 justify-between">
        <div className="flex items-center gap-2.5">
          <Compass className="w-5 h-5 text-[#D4AF37]" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Lab Đối Kháng Kịch Bản</h3>
            <p className="text-[10px] text-[#888] font-mono mt-0.5">Màn hình thí nghiệm song song, trực quan hóa thời gian thực</p>
          </div>
        </div>
        <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded font-mono bg-[#D4AF37]/5">
          LAB VERSION 2.5
        </span>
      </div>

      {/* Grid of case selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {scenarios.map((scen) => (
          <button
            key={scen.id}
            onClick={() => onSelectScenario(scen.id)}
            disabled={isRunning || isComparisonAnimating}
            className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
              currentScenario === scen.id
                ? 'bg-[#1D1A15] border-[#D4AF37]/60 shadow-[0_4px_22px_rgba(212,175,55,0.07)]'
                : 'bg-[#1A1A18] border-[#2A2A28] hover:border-[#444] hover:bg-[#20201E]'
            } disabled:opacity-40`}
            id={`tab-scenario-${scen.id}`}
          >
            <div>
              <span className={`inline-block text-[9px] font-mono font-medium px-2 py-0.5 rounded border mb-2 ${scen.badgeColor}`}>
                {scen.badge}
              </span>
              <h4 className={`text-xs font-bold leading-snug ${currentScenario === scen.id ? 'text-[#D4AF37]' : 'text-slate-300'}`}>
                {scen.id === 'case1' ? 'Case 1: Đi Bừa vs Đi Khôn' : scen.id === 'case2' ? 'Case 2: Cạm bẫy DFS' : 'Case 3: Cạnh Đơn'}
              </h4>
            </div>
            <p className="text-[10px] text-[#777] mt-2 line-clamp-2 leading-relaxed">
              {scen.description}
            </p>
          </button>
        ))}
      </div>

      {/* Detail panel of selected case */}
      {selected ? (
        <div className="bg-[#0D0D0D] border border-[#2A2A28] rounded-lg p-5 space-y-4 flex-1 animate-fade-in" id="scenario-details-block">
          <div className="flex justify-between items-start gap-4 flex-wrap pb-2">
            <div>
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider font-mono">
                {selected.title}
              </h4>
              <p className="text-[11px] text-[#A0A09B] mt-1.5 leading-relaxed">
                {selected.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handleStartComparison}
                disabled={isComparisonAnimating || isRunning}
                className={`px-4 py-2 bg-[#D4AF37] text-black font-bold uppercase tracking-wider text-[10px] rounded hover:bg-[#E5C35D] shadow-lg shadow-[#D4AF37]/10 flex items-center gap-1.5 transition-all ${
                  isComparisonAnimating || isRunning ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
                }`}
                id="run-scenario-simulate-btn"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Chạy Lab Đối Kháng</span>
              </button>

              <button
                onClick={() => onRunScenario(selected.id)}
                disabled={isRunning || isComparisonAnimating}
                className={`px-3 py-2 bg-[#1C1C1A] border border-[#2A2A28] text-[#D4AF37] hover:text-[#FFE27D] font-bold uppercase tracking-wider text-[10px] rounded hover:bg-[#252523] flex items-center gap-1.5 transition-all ${
                  isRunning || isComparisonAnimating ? 'opacity-40 cursor-not-allowed' : 'active:scale-95 cursor-pointer'
                }`}
                title="Đồng bộ bản đồ kịch bản này xuống bãi cát chế độ đơn phía dưới"
              >
                <Zap className="w-3 h-3 text-[#D4AF37]" />
                <span>Nạp bản đồ lớn</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1F1F1E]">
            {/* Objective */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider font-mono text-[#555] block">Mục tiêu kiểm duyệt:</span>
              <p className="text-[10.5px] text-slate-300 leading-relaxed italic pr-2">
                "{selected.objective}"
              </p>
            </div>

            {/* Expected highlights */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider font-mono text-[#555] block">Kết quả dự kiến:</span>
              <div className="space-y-1.5">
                {selected.expected.map((ex, i) => (
                  <div key={i} className="flex gap-2 text-[10px] leading-relaxed bg-[#141412] p-1.5 rounded border border-[#252523]">
                    <strong className={ex.algo.includes('BFS') ? 'text-blue-400' : ex.algo.includes('DFS') ? 'text-amber-500' : 'text-[#D4AF37]'}>
                      {ex.algo}:
                    </strong>
                    <div className="text-[10px]">
                      <span className="text-slate-300">{ex.result} </span>
                      <span className="text-slate-500 text-[9px] italic block font-mono">— {ex.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DUAL SCREEN REAL-TIME LAB WORKBENCH */}
          <div className="border-t border-[#2A2A28] pt-5 mt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-white">Phòng Thí Nghiệm Đối Sánh Song Song</h5>
              </div>

              {/* Lab controls */}
              <div className="flex items-center gap-3">
                {/* Speed buttons */}
                <div className="flex bg-[#141412] p-0.5 rounded border border-[#262624] text-[9px] font-mono">
                  {([
                    { val: 'slow', label: '1x Chậm' },
                    { val: 'medium', label: '2x Vừa' },
                    { val: 'fast', label: '5x Nhanh' },
                    { val: 'super', label: '10x Cực Đại' }
                  ] as const).map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setAnimSpeed(s.val)}
                      disabled={isComparisonAnimating}
                      className={`px-2 py-1 rounded cursor-pointer transition-all ${
                        animSpeed === s.val 
                          ? 'bg-[#D4AF37] text-black font-bold' 
                          : 'text-[#888] hover:text-white hover:bg-[#1E1E1C]'
                      } disabled:opacity-50`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Primary play action */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleStartComparison}
                    disabled={isComparisonAnimating || isRunning}
                    className={`px-3 py-1.5 bg-[#D4AF37] text-black font-bold uppercase tracking-wider text-[10px] rounded hover:bg-[#E5C35D] shadow-md shadow-[#D4AF37]/10 flex items-center gap-1.5 transition-all ${
                      isComparisonAnimating || isRunning ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Lên Đèn Đấu Đối Kháng</span>
                  </button>

                  <button
                    onClick={handleResetComparison}
                    className="p-1.5 bg-[#1C1C1A] border border-[#2B2B29] rounded text-slate-400 hover:text-white hover:bg-[#252523]"
                    title="Đặt lại phòng Thí nghiệm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Live Grids Grid side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="sxs-grids-board">
              {/* LEFT BOARD */}
              <div className="bg-[#0A0A09] border border-[#1E1E1C] rounded-lg p-3.5 space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#1E1E1C] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-300">Nhánh Trái:</span>
                    <strong className="text-xs text-blue-400 font-bold tracking-wider">{selected.leftAlgo}</strong>
                  </div>

                  <div className="text-[9px] font-mono text-slate-400">
                    {leftMetrics?.isFinished ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3" /> HOÀN THÀNH
                      </span>
                    ) : isComparisonAnimating ? (
                      <span className="text-blue-400 animate-pulse">ĐANG DUYỆT ĐỒ THỊ...</span>
                    ) : (
                      <span>CHƯA BẮT ĐẦU</span>
                    )}
                  </div>
                </div>

                {leftGrid ? (
                  <CompactGrid grid={leftGrid} algoType={selected.leftAlgo} />
                ) : (
                  <div className="h-28 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                    Đang thiết lập đỉnh trái...
                  </div>
                )}

                {/* Metrics ribbon */}
                <div className="grid grid-cols-2 gap-2 bg-[#121210] p-2 rounded border border-[#1E1E1D] font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-[#555] block">Ô khảo sát:</span>
                    <span className="text-xs text-blue-400 font-bold">
                      {leftMetrics ? `${leftMetrics.visitedCount} ô` : '0 ô'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#555] block">Tổng chi phí (Cost):</span>
                    <span className={`text-xs font-bold ${leftMetrics?.pathCost ? 'text-[#D4AF37]' : 'text-slate-500'}`}>
                      {leftMetrics?.pathCost === Infinity ? 'Vô hạn' : leftMetrics?.pathCost ? `${leftMetrics.pathCost} lực cản` : 'Chưa chạm'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT BOARD */}
              <div className="bg-[#0A0A09] border border-[#1E1E1C] rounded-lg p-3.5 space-y-3 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[#1E1E1C] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-300">Nhánh Phải:</span>
                    <strong className="text-xs text-emerald-400 font-bold tracking-wider">{selected.rightAlgo}</strong>
                  </div>

                  <div className="text-[9px] font-mono text-slate-400">
                    {rightMetrics?.isFinished ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3" /> HOÀN THÀNH
                      </span>
                    ) : isComparisonAnimating ? (
                      <span className="text-blue-400 animate-pulse">ĐANG DUYỆT ĐỒ THỊ...</span>
                    ) : (
                      <span>CHƯA BẮT ĐẦU</span>
                    )}
                  </div>
                </div>

                {rightGrid ? (
                  <CompactGrid grid={rightGrid} algoType={selected.rightAlgo} />
                ) : (
                  <div className="h-28 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                    Đang thiết lập đỉnh phải...
                  </div>
                )}

                {/* Metrics ribbon */}
                <div className="grid grid-cols-2 gap-2 bg-[#121210] p-2 rounded border border-[#1E1E1D] font-mono">
                  <div>
                    <span className="text-[9px] uppercase text-[#555] block">Ô khảo sát:</span>
                    <span className="text-xs text-emerald-400 font-bold">
                      {rightMetrics ? `${rightMetrics.visitedCount} ô` : '0 ô'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#555] block">Tổng chi phí (Cost):</span>
                    <span className={`text-xs font-bold ${rightMetrics?.pathCost ? 'text-[#D4AF37]' : 'text-slate-500'}`}>
                      {rightMetrics?.pathCost === Infinity ? 'Vô hạn' : rightMetrics?.pathCost ? `${rightMetrics.pathCost} lực cản` : 'Chưa chạm'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Engineer's Logbook explanation */}
            {leftMetrics && leftMetrics.visitedCount > 0 && (
              <div className="mt-4 p-4 border border-[#3A3323]/50 bg-[#17140F] rounded-lg animate-fade-in flex gap-3">
                <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#D4AF37]">Trực quan Phân Tích Thực Địa:</span>
                  <p className="text-[11px] text-[#C1B79E] leading-relaxed">
                    {currentScenario === 'case1' && (
                      <span>
                        Cận cảnh ranh giới: Bạn thấy rõ <strong>BFS (Bên Trái)</strong> đi thẳng tịt qua vùng đầm lầy tím sẫm (hệ sồ cản 10) dẫn đến tốn tới <strong>{leftMetrics.pathCost} điểm lực cản</strong>. Trong khi đó, <strong>Dijkstra (Mạn Phải)</strong> thông minh chịu đi xa hơn về số bước, nhưng rẽ vòng qua mạn phẳng phiu hoàn toàn nên đạt chi phí cực thấp chỉ <strong>{rightMetrics.pathCost || '?'} lực cản</strong>!
                      </span>
                    )}
                    {currentScenario === 'case2' && (
                      <span>
                        Hiệu ứng sập bẫy: Cực kỳ trực quan! <strong>DFS (Bên Trái)</strong> bị thôi miên bởi nhánh dọc bên phải đã đâm sâu ngút ngàn, duyệt sạch hàng loạt ô ngõ cụt vô danh. Trong khi đó, <strong>BFS (Mạn phế)</strong> chỉ cần <strong>{rightMetrics.visitedCount} lần thử</strong> đã ngay lập tức nổ phát súng chạm trán lối thoát kề ngay hông điểm xuất phát!
                      </span>
                    )}
                    {currentScenario === 'case3' && (
                      <span>
                        Sự đánh đổi của lòng tham: <strong>BFS (Bên Trái)</strong> tìm kiếm theo topo thuần túy không quan tâm trọng số, nên đã đi thẳng qua đai bùn lầy dày đặc và chạm đích rất gọn gàng chỉ sau <strong>{leftMetrics.visitedCount} ô thám thính</strong>. Ngược lại, <strong>Dijkstra (Mạn Phải)</strong> quá nhạy cảm với sính lầy cản địa vây trước mắt, nên liên tục ưu tiên phân nhánh ra khu đất phẳng mênh mông bên trái (mồi nhử giá rẻ) dẫu cho nó đi lùi ngược hướng mục tiêu. Kết quả là Dijkstra tốn tới tận <strong>{rightMetrics.visitedCount || '?'} ô thám thính</strong> (quét sạch nửa bản đồ trái) trước khi chịu mò sang đích!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Golden insight box */}
          <div className="p-3 bg-[#1C1A14]/30 border border-[#4A4232]/30 rounded flex gap-2.5 items-start">
            <Award className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] uppercase font-mono text-[#D4AF37] block font-bold">Insight cốt lõi của kỹ sư:</span>
              <p className="text-[10px] text-[#C1B58C] mt-0.5 leading-relaxed font-sans">
                {selected.insight}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#2A2A28] rounded bg-[#0D0D0D]/30 min-h-[160px]" id="scenario-placeholder">
          <HelpCircle className="w-9 h-9 text-[#333] mb-2" />
          <h4 className="text-xs uppercase tracking-wider text-[#666]">Chọn một tình huống khảo cứu</h4>
          <p className="text-[10px] text-[#555] max-w-sm mt-1 leading-relaxed font-mono">
            Nhấp chọn một trong ba kịch bản phía trên để khởi động mô phỏng và đặt sơ đồ phòng Lab phân tích chuyên sâu.
          </p>
        </div>
      )}
    </div>
  );
}
