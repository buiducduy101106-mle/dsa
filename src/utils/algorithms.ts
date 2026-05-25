import { GridNode } from '../types';

// ============================================================
// HELPER: Lấy danh sách ô lân cận — hỗ trợ 4 hoặc 8 hướng
// ============================================================
function getNeighbors(node: GridNode, grid: GridNode[][], allowDiagonal: boolean = false): GridNode[] {
  const neighbors: GridNode[] = [];
  const { row, col } = node;
  const rows = grid.length;
  const cols = grid[0].length;

  // 4 hướng cơ bản
  if (row > 0)        neighbors.push(grid[row - 1][col]); // Lên
  if (row < rows - 1) neighbors.push(grid[row + 1][col]); // Xuống
  if (col > 0)        neighbors.push(grid[row][col - 1]); // Trái
  if (col < cols - 1) neighbors.push(grid[row][col + 1]); // Phải

  // 4 hướng chéo (chỉ kích hoạt khi allowDiagonal = true)
  if (allowDiagonal) {
    if (row > 0        && col > 0)        neighbors.push(grid[row - 1][col - 1]); // Lên-Trái
    if (row > 0        && col < cols - 1) neighbors.push(grid[row - 1][col + 1]); // Lên-Phải
    if (row < rows - 1 && col > 0)        neighbors.push(grid[row + 1][col - 1]); // Xuống-Trái
    if (row < rows - 1 && col < cols - 1) neighbors.push(grid[row + 1][col + 1]); // Xuống-Phải
  }

  return neighbors;
}

// Kiểm tra xem di chuyển từ a sang b có phải đường chéo không
function isDiagonalMove(a: GridNode, b: GridNode): boolean {
  return a.row !== b.row && a.col !== b.col;
}

// ============================================================
// CÁC HÀM HEURISTIC (ước lượng khoảng cách tới đích)
// ============================================================
export function getHeuristic(
  node: GridNode,
  endNode: GridNode,
  type: 'manhattan' | 'euclidean' | 'octile' = 'manhattan'
): number {
  const dx = Math.abs(node.col - endNode.col);
  const dy = Math.abs(node.row - endNode.row);

  if (type === 'euclidean') {
    // Khoảng cách đường thẳng (đường chim bay)
    return Math.sqrt(dx * dx + dy * dy);
  } else if (type === 'octile') {
    // Tối ưu cho di chuyển 8 hướng: thẳng = 1, chéo = √2 ≈ 1.414
    return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
  }
  // Manhattan: phù hợp nhất cho lưới 4 hướng
  return dx + dy;
}

// ============================================================
// 1. THUẬT TOÁN DIJKSTRA
// ============================================================
export function dijkstra(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode,
  allowDiagonal: boolean = false
) {
  const visitedNodesInOrder: GridNode[] = [];

  for (const row of grid) {
    for (const node of row) {
      node.distance = node.row === startNode.row && node.col === startNode.col ? 0 : Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  const unvisitedNodes: GridNode[] = grid.flat();

  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift()!;

    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) break;

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode.row === endNode.row && closestNode.col === endNode.col) break;

    const neighbors = getNeighbors(closestNode, grid, allowDiagonal);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      // Đường chéo có chi phí √2 × weight
      const stepCost = isDiagonalMove(closestNode, neighbor)
        ? neighbor.weight * Math.SQRT2
        : neighbor.weight;

      const tentativeDistance = closestNode.distance + stepCost;
      if (tentativeDistance < neighbor.distance) {
        neighbor.distance = tentativeDistance;
        neighbor.previousNode = closestNode;
      }
    }
  }

  return visitedNodesInOrder;
}

// ============================================================
// 2. THUẬT TOÁN BFS (Breadth-First Search)
// ============================================================
export function bfs(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode,
  allowDiagonal: boolean = false
) {
  const visitedNodesInOrder: GridNode[] = [];

  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  const queue: GridNode[] = [];
  const start = grid[startNode.row][startNode.col];
  start.isVisited = true;
  queue.push(start);

  while (queue.length > 0) {
    const currentNode = queue.shift()!;
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) break;

    const neighbors = getNeighbors(currentNode, grid, allowDiagonal);
    for (const neighbor of neighbors) {
      if (neighbor.isWall || neighbor.isVisited) continue;
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      queue.push(neighbor);
    }
  }

  return visitedNodesInOrder;
}

// ============================================================
// 3. THUẬT TOÁN DFS (Depth-First Search)
// ============================================================
export function dfs(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode,
  allowDiagonal: boolean = false
) {
  const visitedNodesInOrder: GridNode[] = [];

  for (const row of grid) {
    for (const node of row) {
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  const stack: GridNode[] = [];
  const start = grid[startNode.row][startNode.col];
  stack.push(start);

  while (stack.length > 0) {
    const currentNode = stack.pop()!;

    if (currentNode.isVisited) continue;
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) break;

    const neighbors = getNeighbors(currentNode, grid, allowDiagonal);
    for (const neighbor of neighbors.reverse()) {
      if (!neighbor.isWall && !neighbor.isVisited) {
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}

// ============================================================
// 4. THUẬT TOÁN A* SEARCH
// Công thức: f(n) = g(n) + h(n)
//   g(n) = Chi phí thực tế từ Start tới n
//   h(n) = Ước lượng Heuristic từ n tới End
// ============================================================
export function astar(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode,
  allowDiagonal: boolean = false,
  heuristicType: 'manhattan' | 'euclidean' | 'octile' = 'manhattan'
) {
  const visitedNodesInOrder: GridNode[] = [];

  for (const row of grid) {
    for (const node of row) {
      node.distance = node.row === startNode.row && node.col === startNode.col ? 0 : Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  // fScore: tổng chi phí ước lượng f(n) = g(n) + h(n)
  const fScore = new Map<string, number>();
  const key = (n: GridNode) => `${n.row},${n.col}`;

  const start = grid[startNode.row][startNode.col];
  fScore.set(key(start), getHeuristic(start, endNode, heuristicType));

  const openSet: GridNode[] = [start];

  while (openSet.length > 0) {
    // Luôn chọn ô có f(n) nhỏ nhất
    openSet.sort((a, b) => {
      const fa = fScore.get(key(a)) ?? Infinity;
      const fb = fScore.get(key(b)) ?? Infinity;
      if (fa !== fb) return fa - fb;
      // Nếu bằng nhau, ưu tiên ô gần đích hơn (tie-breaking)
      return getHeuristic(a, endNode, heuristicType) - getHeuristic(b, endNode, heuristicType);
    });

    const currentNode = openSet.shift()!;
    if (currentNode.isWall) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) break;

    const neighbors = getNeighbors(currentNode, grid, allowDiagonal);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      const stepCost = isDiagonalMove(currentNode, neighbor)
        ? neighbor.weight * Math.SQRT2
        : neighbor.weight;

      const tentativeG = currentNode.distance + stepCost;

      if (tentativeG < neighbor.distance) {
        neighbor.distance = tentativeG; // g(n)
        neighbor.previousNode = currentNode;

        const h = getHeuristic(neighbor, endNode, heuristicType);
        fScore.set(key(neighbor), tentativeG + h); // f(n) = g(n) + h(n)

        if (!openSet.some(n => n.row === neighbor.row && n.col === neighbor.col)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return visitedNodesInOrder;
}

// ============================================================
// 5. THUẬT TOÁN GREEDY BEST-FIRST SEARCH
// Công thức: f(n) = h(n) — Chỉ quan tâm khoảng cách tới đích
// Nhanh nhất nhưng KHÔNG ĐẢM BẢO đường tối ưu
// ============================================================
export function greedyBfs(
  grid: GridNode[][],
  startNode: GridNode,
  endNode: GridNode,
  allowDiagonal: boolean = false,
  heuristicType: 'manhattan' | 'euclidean' | 'octile' = 'manhattan'
) {
  const visitedNodesInOrder: GridNode[] = [];

  for (const row of grid) {
    for (const node of row) {
      node.distance = node.row === startNode.row && node.col === startNode.col ? 0 : Infinity;
      node.isVisited = false;
      node.previousNode = null;
    }
  }

  const openSet: GridNode[] = [grid[startNode.row][startNode.col]];

  while (openSet.length > 0) {
    // Greedy chỉ xếp theo h(n) — khoảng cách ước lượng tới đích
    openSet.sort((a, b) =>
      getHeuristic(a, endNode, heuristicType) - getHeuristic(b, endNode, heuristicType)
    );

    const currentNode = openSet.shift()!;
    if (currentNode.isWall) continue;

    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);

    if (currentNode.row === endNode.row && currentNode.col === endNode.col) break;

    const neighbors = getNeighbors(currentNode, grid, allowDiagonal);
    for (const neighbor of neighbors) {
      if (neighbor.isVisited || neighbor.isWall) continue;

      if (neighbor.distance === Infinity) {
        const stepCost = isDiagonalMove(currentNode, neighbor)
          ? neighbor.weight * Math.SQRT2
          : neighbor.weight;
        neighbor.distance = currentNode.distance + stepCost;
        neighbor.previousNode = currentNode;

        if (!openSet.some(n => n.row === neighbor.row && n.col === neighbor.col)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return visitedNodesInOrder;
}

// ============================================================
// HELPER: Truy ngược đường đi từ đích về xuất phát
// ============================================================
export function getNodesInShortestPathOrder(endNode: GridNode): GridNode[] {
  const nodesInShortestPathOrder: GridNode[] = [];
  let currentNode: GridNode | null = endNode;

  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }

  return nodesInShortestPathOrder;
}

