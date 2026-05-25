import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Legend from './components/Legend';
import AlgorithmInfo from './components/AlgorithmInfo';
import MetricsDashboard from './components/MetricsDashboard';
import ControlPanel from './components/ControlPanel';
import GridRenderer from './components/GridRenderer';
import ScenarioLab, { ScenarioId } from './components/ScenarioLab';

import { GridNode, AlgorithmType, SpeedType, ToolMode, AlgorithmMetrics, HeuristicType } from './types';
import { bfs, dfs, dijkstra, astar, greedyBfs, getNodesInShortestPathOrder } from './utils/algorithms';
import { generateRandomWalls, generateRecursiveDivision, generateSwampTerrain } from './utils/maze';

const NUM_ROWS = 20;
const NUM_COLS = 45;

const DEFAULT_START = { row: 9, col: 6 };
const DEFAULT_END = { row: 9, col: 38 };

export default function App() {
  // Coordinates of starting and target nodes
  const [startCoords, setStartCoords] = useState(DEFAULT_START);
  const [endCoords, setEndCoords] = useState(DEFAULT_END);

  const [grid, setGrid] = useState<GridNode[][]>([]);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('bfs');
  const [speed, setSpeed] = useState<SpeedType>('medium');
  const [toolMode, setToolMode] = useState<ToolMode>('wall');
  const [wallDensity, setWallDensity] = useState(0.25);
  const [currentScenario, setCurrentScenario] = useState<ScenarioId | null>(null);
  const [allowDiagonal, setAllowDiagonal] = useState(false);
  const [heuristicType, setHeuristicType] = useState<HeuristicType>('manhattan');
  
  // App status states
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [metricsList, setMetricsList] = useState<AlgorithmMetrics[]>([]);

  // Mouse gestures drawing tracking
  const [isMousePressed, setIsMousePressed] = useState(false);
  const [draggingNode, setDraggingNode] = useState<'start' | 'end' | null>(null);

  // References to handle visual cancellation on cleanups
  const timeoutIdsRef = useRef<number[]>([]);

  // Initialize empty grid on startup
  useEffect(() => {
    resetGrid();
    return () => clearAllTimeouts();
  }, []);

  const clearAllTimeouts = () => {
    timeoutIdsRef.current.forEach(id => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  // Create initial flat node state
  const createNode = (row: number, col: number, start = startCoords, end = endCoords): GridNode => {
    return {
      row,
      col,
      isStart: row === start.row && col === start.col,
      isEnd: row === end.row && col === end.col,
      isWall: false,
      weight: 1,
      isVisited: false,
      isPath: false,
      distance: Infinity,
      previousNode: null,
    };
  };

  // Generate blank canvas
  const resetGrid = (start = startCoords, end = endCoords) => {
    clearAllTimeouts();
    setIsRunning(false);
    
    const initialGrid: GridNode[][] = [];
    for (let r = 0; r < NUM_ROWS; r++) {
      const currentRow: GridNode[] = [];
      for (let c = 0; c < NUM_COLS; c++) {
        currentRow.push(createNode(r, c, start, end));
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
  };

  // Standard Clear Paths (keep walls/weights intact, wipe visited & path animations)
  const clearPathsAndVisitations = (currentGrid: GridNode[][]): GridNode[][] => {
    return currentGrid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      }))
    );
  };

  const handleClearPathsOnly = () => {
    if (isRunning) return;
    clearAllTimeouts();
    setGrid(prev => clearPathsAndVisitations(prev));
  };

  // Clear metric records
  const handleClearMetrics = () => {
    setMetricsList([]);
  };

  // Handle core brush drawings/coordinates relocation
  const handleNodeInteraction = (row: number, col: number, isClick: boolean) => {
    if (isRunning) return;

    const clickedNode = grid[row][col];

    // Pick dragging target if start/end flags are grabbed
    if (isClick) {
      if (clickedNode.isStart) {
        setDraggingNode('start');
        return;
      }
      if (clickedNode.isEnd) {
        setDraggingNode('end');
        return;
      }
      setIsMousePressed(true);
    }

    // relocation via drag/enter
    if (draggingNode === 'start') {
      if (clickedNode.isEnd) return; // avoid stacking on end node
      setStartCoords({ row, col });
      updateStartNode(row, col);
      return;
    }

    if (draggingNode === 'end') {
      if (clickedNode.isStart) return; // avoid stacking on start node
      setEndCoords({ row, col });
      updateEndNode(row, col);
      return;
    }

    // Brush paint tools mapping
    if (isMousePressed || isClick) {
      if (clickedNode.isStart || clickedNode.isEnd) return;

      setGrid(prev => {
        const newGrid = prev.map(r => r.map(n => ({ ...n })));
        const target = newGrid[row][col];

        switch (toolMode) {
          case 'start':
            // Move start node click brush
            if (target.isEnd) break;
            newGrid[startCoords.row][startCoords.col].isStart = false;
            target.isStart = true;
            target.isWall = false;
            target.weight = 1;
            setStartCoords({ row, col });
            break;

          case 'end':
            // Move end node click brush
            if (target.isStart) break;
            newGrid[endCoords.row][endCoords.col].isEnd = false;
            target.isEnd = true;
            target.isWall = false;
            target.weight = 1;
            setEndCoords({ row, col });
            break;

          case 'wall':
            target.isWall = true;
            target.weight = 1;
            break;

          case 'weight':
            // Set weight. Default mud weight = 5, or deep water wave alternates = 10
            target.isWall = false;
            target.weight = target.weight === 5 ? 10 : 5;
            break;

          case 'eraser':
            target.isWall = false;
            target.weight = 1;
            break;
        }

        return newGrid;
      });
    }
  };

  // Helper to visually slide start node
  const updateStartNode = (r: number, c: number) => {
    setGrid(prev =>
      prev.map((row, rIdx) =>
        row.map((node, cIdx) => ({
          ...node,
          isStart: rIdx === r && cIdx === c,
          // Clear any colliding walls
          isWall: (rIdx === r && cIdx === c) ? false : node.isWall,
          weight: (rIdx === r && cIdx === c) ? 1 : node.weight,
        }))
      )
    );
  };

  // Helper to visually slide end node
  const updateEndNode = (r: number, c: number) => {
    setGrid(prev =>
      prev.map((row, rIdx) =>
        row.map((node, cIdx) => ({
          ...node,
          isEnd: rIdx === r && cIdx === c,
          // Clear any colliding walls
          isWall: (rIdx === r && cIdx === c) ? false : node.isWall,
          weight: (rIdx === r && cIdx === c) ? 1 : node.weight,
        }))
      )
    );
  };

  // Mouse gestures mouse release
  const handleMouseUp = () => {
    setIsMousePressed(false);
    setDraggingNode(null);
  };

  // Run selected search algorithm with stagger animation
  const startAlgorithmVisualization = () => {
    if (isRunning) return;
    clearAllTimeouts();

    // 1. Wipe old paths cleanly
    const cleanedGrid = clearPathsAndVisitations(grid);
    setGrid(cleanedGrid);
    setIsRunning(true);

    // 2. Clone references for mathematical search execution
    const gridForSearch = cleanedGrid.map(row => row.map(node => ({ ...node })));
    const startNode = gridForSearch[startCoords.row][startCoords.col];
    const endNode = gridForSearch[endCoords.row][endCoords.col];

    const startTime = performance.now();
    let visitedOrdered: GridNode[] = [];

    if (selectedAlgo === 'bfs') {
      visitedOrdered = bfs(gridForSearch, startNode, endNode, allowDiagonal);
    } else if (selectedAlgo === 'dfs') {
      visitedOrdered = dfs(gridForSearch, startNode, endNode, allowDiagonal);
    } else if (selectedAlgo === 'dijkstra') {
      visitedOrdered = dijkstra(gridForSearch, startNode, endNode, allowDiagonal);
    } else if (selectedAlgo === 'astar') {
      visitedOrdered = astar(gridForSearch, startNode, endNode, allowDiagonal, heuristicType);
    } else if (selectedAlgo === 'greedy') {
      visitedOrdered = greedyBfs(gridForSearch, startNode, endNode, allowDiagonal, heuristicType);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const finalPathNode = gridForSearch[endCoords.row][endCoords.col];
    const shortestPath = getNodesInShortestPathOrder(finalPathNode);
    const pathFound = shortestPath.length > 0 && shortestPath[0].isStart;

    // Save metrics details upon completion
    const visitedCount = visitedOrdered.length;
    const pathLength = pathFound ? shortestPath.length : 0;
    
    // Sum weights of paths
    const pathCost = pathFound 
      ? shortestPath.reduce((acc, curr) => acc + (curr.isStart ? 0 : curr.weight), 0)
      : Infinity;

    // Play visual step progression
    animateSearchProcess(visitedOrdered, shortestPath, pathFound, {
      duration,
      visitedCount,
      pathLength,
      pathCost,
      pathFound
    });
  };

  // Stagger visited animation updates
  const animateSearchProcess = (
    visitedNodes: GridNode[],
    shortestPath: GridNode[],
    pathFound: boolean,
    metrics: {
      duration: number;
      visitedCount: number;
      pathLength: number;
      pathCost: number;
      pathFound: boolean;
    }
  ) => {
    let tickDelay = 15;
    let stepChunk = 1;

    if (speed === 'slow') {
      tickDelay = 35;
      stepChunk = 1;
    } else if (speed === 'medium') {
      tickDelay = 15;
      stepChunk = 1;
    } else if (speed === 'fast') {
      tickDelay = 5;
      stepChunk = 3; // Render 3 nodes at a time for fast response
    }

    let currentIndex = 0;

    const animateStep = () => {
      if (currentIndex >= visitedNodes.length) {
        if (pathFound) {
          animateShortestPath(shortestPath, metrics);
        } else {
          setIsRunning(false);
          updateMetricsList(selectedAlgo, metrics);
        }
        return;
      }

      // Group steps for fast visual speed
      const limit = Math.min(currentIndex + stepChunk, visitedNodes.length);
      const updatedNodes: { r: number; c: number }[] = [];

      for (let i = currentIndex; i < limit; i++) {
        const node = visitedNodes[i];
        if (!node.isStart && !node.isEnd) {
          updatedNodes.push({ r: node.row, rIdx: node.row, c: node.col } as any);
        }
      }

      setGrid(prev => {
        const nextGrid = prev.map(row => row.map(cell => ({ ...cell })));
        for (const item of updatedNodes) {
          nextGrid[item.r][(item as any).c].isVisited = true;
        }
        return nextGrid;
      });

      currentIndex = limit;
      const tid = window.setTimeout(animateStep, tickDelay);
      timeoutIdsRef.current.push(tid);
    };

    animateStep();
  };

  // Visually draw finalized quickest path
  const animateShortestPath = (
    shortestPath: GridNode[],
    metrics: {
      duration: number;
      visitedCount: number;
      pathLength: number;
      pathCost: number;
      pathFound: boolean;
    }
  ) => {
    let currentIdx = 0;

    const animatePathStep = () => {
      if (currentIdx >= shortestPath.length) {
        setIsRunning(false);
        updateMetricsList(selectedAlgo, metrics);
        return;
      }

      const node = shortestPath[currentIdx];
      
      setGrid(prev => {
        const nextGrid = prev.map(row => row.map(cell => ({ ...cell })));
        nextGrid[node.row][node.col].isPath = true;
        return nextGrid;
      });

      currentIdx++;
      const tid = window.setTimeout(animatePathStep, 25);
      timeoutIdsRef.current.push(tid);
    };

    animatePathStep();
  };

  // Append or overwrite metrics statistics table
  const updateMetricsList = (
    algoId: AlgorithmType, 
    results: {
      duration: number;
      visitedCount: number;
      pathLength: number;
      pathCost: number;
      pathFound: boolean;
    }
  ) => {
    const names: Record<AlgorithmType, string> = {
      bfs: 'Breadth-First Search (BFS)',
      dfs: 'Depth-First Search (DFS)',
      dijkstra: 'Dijkstra',
      astar: 'A* Search',
      greedy: 'Greedy Best-First'
    };

    const isOptimal = algoId === 'bfs'
      ? isGridUnweighted()
      : algoId === 'dijkstra' || algoId === 'astar';

    const newMetric: AlgorithmMetrics = {
      algorithmId: algoId,
      name: names[algoId],
      executionTime: results.duration,
      visitedCount: results.visitedCount,
      pathLength: results.pathFound ? results.pathLength : 0,
      pathCost: results.pathFound ? results.pathCost : Infinity,
      isOptimal: results.pathFound && isOptimal,
      pathFound: results.pathFound
    };

    setMetricsList(prev => {
      const filtered = prev.filter(item => item.algorithmId !== algoId);
      return [...filtered, newMetric].sort((a, b) => a.name.localeCompare(b.name));
    });
  };

  // Check if grid has weights drawn
  const isGridUnweighted = (): boolean => {
    for (const row of grid) {
      for (const node of row) {
        if (node.weight > 1) return false;
      }
    }
    return true;
  };

  // INSTANT COMPARE RUNNER FOR ALL ALGORITHMS
  const handleTriggerCompareAll = () => {
    if (isRunning) return;
    setIsRunningAll(true);
    
    // Clear old visual queues
    clearAllTimeouts();
    const cleanedGrid = clearPathsAndVisitations(grid);
    setGrid(cleanedGrid);

    setTimeout(() => {
      const results: AlgorithmMetrics[] = [];
      const algos: AlgorithmType[] = ['bfs', 'dfs', 'dijkstra', 'astar', 'greedy'];

      for (const algo of algos) {
        // Clone grid separately for calculation
        const localGrid = cleanedGrid.map(row => row.map(node => ({ ...node })));
        const localStart = localGrid[startCoords.row][startCoords.col];
        const localEnd = localGrid[endCoords.row][endCoords.col];

        // Benchmark speed average over 50 iterations to ensure realistic CPU time measurements
        let visitedOrdered: GridNode[] = [];
        const iterCount = 50;
        const subStart = performance.now();
        
        for (let i = 0; i < iterCount; i++) {
          const iterGrid = cleanedGrid.map(row => row.map(node => ({ ...node })));
          const iterStart = iterGrid[startCoords.row][startCoords.col];
          const iterEnd = iterGrid[endCoords.row][endCoords.col];
          
          if (algo === 'bfs') {
            visitedOrdered = bfs(iterGrid, iterStart, iterEnd, allowDiagonal);
          } else if (algo === 'dfs') {
            visitedOrdered = dfs(iterGrid, iterStart, iterEnd, allowDiagonal);
          } else if (algo === 'dijkstra') {
            visitedOrdered = dijkstra(iterGrid, iterStart, iterEnd, allowDiagonal);
          } else if (algo === 'astar') {
            visitedOrdered = astar(iterGrid, iterStart, iterEnd, allowDiagonal, heuristicType);
          } else {
            visitedOrdered = greedyBfs(iterGrid, iterStart, iterEnd, allowDiagonal, heuristicType);
          }
        }

        const subEnd = performance.now();
        const avgDuration = (subEnd - subStart) / iterCount;

        // Run one last tracking state to extract shortest path
        if (algo === 'bfs') {
          visitedOrdered = bfs(localGrid, localStart, localEnd, allowDiagonal);
        } else if (algo === 'dfs') {
          visitedOrdered = dfs(localGrid, localStart, localEnd, allowDiagonal);
        } else if (algo === 'dijkstra') {
          visitedOrdered = dijkstra(localGrid, localStart, localEnd, allowDiagonal);
        } else if (algo === 'astar') {
          visitedOrdered = astar(localGrid, localStart, localEnd, allowDiagonal, heuristicType);
        } else {
          visitedOrdered = greedyBfs(localGrid, localStart, localEnd, allowDiagonal, heuristicType);
        }

        const finalPathNode = localGrid[endCoords.row][endCoords.col];
        const shortestPath = getNodesInShortestPathOrder(finalPathNode);
        const pathFound = shortestPath.length > 0 && shortestPath[0].isStart;

        const pathLength = pathFound ? shortestPath.length : 0;
        const pathCost = pathFound 
          ? shortestPath.reduce((acc, curr) => acc + (curr.isStart ? 0 : curr.weight), 0)
          : Infinity;

        const names: Record<AlgorithmType, string> = {
          bfs: 'Breadth-First Search (BFS)',
          dfs: 'Depth-First Search (DFS)',
          dijkstra: 'Dijkstra',
          astar: 'A* Search',
          greedy: 'Greedy Best-First'
        };

        const isOptimal = algo === 'bfs'
          ? isGridUnweighted()
          : algo === 'dijkstra' || algo === 'astar';

        results.push({
          algorithmId: algo,
          name: names[algo],
          executionTime: avgDuration,
          visitedCount: visitedOrdered.length,
          pathLength,
          pathCost,
          isOptimal: pathFound && isOptimal,
          pathFound
        });
      }

      setMetricsList(results.sort((a, b) => a.name.localeCompare(b.name)));
      setIsRunningAll(false);
    }, 300);
  };

  // Auto layout maze triggers
  const handleRandomWallsGen = (density: number) => {
    if (isRunning) return;
    const newGrid = generateRandomWalls(grid, density);
    setGrid(clearPathsAndVisitations(newGrid));
  };

  const handleRecursiveMazeGen = () => {
    if (isRunning) return;
    const newGrid = generateRecursiveDivision(grid);
    setGrid(clearPathsAndVisitations(newGrid));
  };

  const handleSwampTerrainGen = () => {
    if (isRunning) return;
    const newGrid = generateSwampTerrain(grid);
    setGrid(clearPathsAndVisitations(newGrid));
  };

  const isGridUnweightedWithCustom = (targetGrid: GridNode[][]): boolean => {
    for (const row of targetGrid) {
      for (const node of row) {
        if (node.weight > 1) return false;
      }
    }
    return true;
  };

  const getScenarioSetup = (id: ScenarioId) => {
    let start = DEFAULT_START;
    let end = DEFAULT_END;

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

  const handleSelectScenario = (id: ScenarioId) => {
    if (isRunning || isRunningAll) return;
    setCurrentScenario(id);
    clearAllTimeouts();
    setMetricsList([]);

    const { start, end, newGrid } = getScenarioSetup(id);
    setStartCoords(start);
    setEndCoords(end);
    setGrid(newGrid);
  };

  const handleRunScenario = (id: ScenarioId) => {
    if (isRunning || isRunningAll) return;
    setCurrentScenario(id);
    clearAllTimeouts();
    setMetricsList([]);

    const { start, end, newGrid } = getScenarioSetup(id);
    setStartCoords(start);
    setEndCoords(end);
    setGrid(newGrid);

    setIsRunningAll(true);
    setTimeout(() => {
      const results: AlgorithmMetrics[] = [];
      const algos: AlgorithmType[] = ['bfs', 'dfs', 'dijkstra'];
      const cleanedGrid = clearPathsAndVisitations(newGrid);

      for (const algo of algos) {
        const localGrid = cleanedGrid.map(row => row.map(node => ({ ...node })));
        const localStart = localGrid[start.row][start.col];
        const localEnd = localGrid[end.row][end.col];

        let visitedOrdered: GridNode[] = [];
        const iterCount = 20;
        const subStart = performance.now();
        
        for (let i = 0; i < iterCount; i++) {
          const iterGrid = cleanedGrid.map(row => row.map(node => ({ ...node })));
          const iterStart = iterGrid[start.row][start.col];
          const iterEnd = iterGrid[end.row][end.col];
          
          if (algo === 'bfs') {
            visitedOrdered = bfs(iterGrid, iterStart, iterEnd);
          } else if (algo === 'dfs') {
            visitedOrdered = dfs(iterGrid, iterStart, iterEnd);
          } else {
            visitedOrdered = dijkstra(iterGrid, iterStart, iterEnd);
          }
        }

        const subEnd = performance.now();
        const avgDuration = (subEnd - subStart) / iterCount;

        if (algo === 'bfs') {
          visitedOrdered = bfs(localGrid, localStart, localEnd);
        } else if (algo === 'dfs') {
          visitedOrdered = dfs(localGrid, localStart, localEnd);
        } else {
          visitedOrdered = dijkstra(localGrid, localStart, localEnd);
        }

        const finalPathNode = localGrid[end.row][end.col];
        const shortestPath = getNodesInShortestPathOrder(finalPathNode);
        const pathFound = shortestPath.length > 0 && shortestPath[0].isStart;

        const pathLength = pathFound ? shortestPath.length : 0;
        const pathCost = pathFound 
          ? shortestPath.reduce((acc, curr) => acc + (curr.isStart ? 0 : curr.weight), 0)
          : Infinity;

        const names = {
          bfs: 'Breadth-First Search (BFS)',
          dfs: 'Depth-First Search (DFS)',
          dijkstra: "Thuật toán Dijkstra"
        };

        const isOptimal = algo === 'bfs' 
          ? isGridUnweightedWithCustom(cleanedGrid)
          : algo === 'dijkstra';

        results.push({
          algorithmId: algo,
          name: names[algo],
          executionTime: avgDuration,
          visitedCount: visitedOrdered.length,
          pathLength,
          pathCost,
          isOptimal: pathFound && isOptimal,
          pathFound
        });
      }

      setMetricsList(results.sort((a, b) => a.name.localeCompare(b.name)));

      const bestAlgo: AlgorithmType = id === 'case1' ? 'dijkstra' : id === 'case2' ? 'bfs' : 'dijkstra';
      const visualGrid = cleanedGrid.map(row => row.map(node => ({ ...node })));
      const vStart = visualGrid[start.row][start.col];
      const vEnd = visualGrid[end.row][end.col];
      
      let vVisited: GridNode[] = [];
      if (bestAlgo === 'bfs') {
        vVisited = bfs(visualGrid, vStart, vEnd);
      } else {
        vVisited = dijkstra(visualGrid, vStart, vEnd);
      }
      
      const vPathNode = visualGrid[end.row][end.col];
      const vPath = getNodesInShortestPathOrder(vPathNode);
      
      for (const vn of vVisited) {
        if (!vn.isStart && !vn.isEnd) {
          visualGrid[vn.row][vn.col].isVisited = true;
        }
      }
      for (const pn of vPath) {
        if (!pn.isStart && !pn.isEnd) {
          visualGrid[pn.row][pn.col].isPath = true;
        }
      }
      
      setGrid(visualGrid);
      setIsRunningAll(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F0] p-4 sm:p-6 lg:p-8 font-sans transition-all selection:bg-[#D4AF37]/30 selection:text-white" id="main-application-container">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Title Header Section */}
        <Header />

        {/* Dynamic Map Legend Indicators */}
        <Legend />

        {/* Lab Đối Kháng Tình Huống */}
        <ScenarioLab
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
          onRunScenario={handleRunScenario}
          isRunning={isRunning || isRunningAll}
        />

        {/* Main Grid Interactive Canvas Area */}
        <main className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="primary-visualizer-workspace">
          
          {/* Visual Grid Canvas & Control Panel Column (Left + Middle Column) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Grid Interactive Visual Panel */}
            <GridRenderer 
              grid={grid}
              onNodeMouseDown={(r, c) => handleNodeInteraction(r, c, true)}
              onNodeMouseEnter={(r, c) => handleNodeInteraction(r, c, false)}
              onNodeMouseUp={handleMouseUp}
            />

            {/* Custom Control Panel */}
            <ControlPanel
              selectedAlgo={selectedAlgo}
              onChangeAlgo={setSelectedAlgo}
              speed={speed}
              onChangeSpeed={setSpeed}
              toolMode={toolMode}
              onChangeToolMode={setToolMode}
              isRunning={isRunning}
              onStartVisualization={startAlgorithmVisualization}
              onClearGrid={() => resetGrid()}
              onClearPathsOnly={handleClearPathsOnly}
              onGenerateRandomWalls={handleRandomWallsGen}
              onGenerateRecursiveDivision={handleRecursiveMazeGen}
              onGenerateSwampTerrain={handleSwampTerrainGen}
              wallDensity={wallDensity}
              onChangeWallDensity={setWallDensity}
              allowDiagonal={allowDiagonal}
              onChangeAllowDiagonal={setAllowDiagonal}
              heuristicType={heuristicType}
              onChangeHeuristicType={setHeuristicType}
            />
          </div>

          {/* Performance Comparative Charts & Knowledge-Base Column (Right Column) */}
          <div className="space-y-6">
            
            {/* Metrics Benchmarking Dashboard */}
            <MetricsDashboard 
              metricsList={metricsList}
              onTriggerCompare={handleTriggerCompareAll}
              isRunningAll={isRunningAll}
              onClearMetrics={handleClearMetrics}
            />

            {/* Science Documentation Theoretical Cards */}
            <AlgorithmInfo />
          </div>

        </main>
      </div>
    </div>
  );
}
