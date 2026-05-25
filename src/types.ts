export interface GridNode {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  weight: number; // Normal fields have weight = 1. Weighted (mud/water) fields have weight = 5 or 10.
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  previousNode: GridNode | null;
}

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy';

export type HeuristicType = 'manhattan' | 'euclidean' | 'octile';

export type SpeedType = 'fast' | 'medium' | 'slow';

export type ToolMode = 'start' | 'end' | 'wall' | 'weight' | 'eraser';

export interface AlgorithmMetrics {
  algorithmId: AlgorithmType;
  name: string;
  executionTime: number; // in ms
  visitedCount: number; // total nodes explored
  pathLength: number; // count of steps on path
  pathCost: number; // sum of weights
  isOptimal: boolean;
  pathFound: boolean;
}
