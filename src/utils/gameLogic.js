// src/utils/gameLogic.js
export const createEmptyGrid = (rows, cols) => {
  return Array(rows)
    .fill()
    .map(() => Array(cols).fill(0));
};

export function updateGrid(grid, tableRules = null, treeRules = null) {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = createEmptyGrid(rows, cols);

  // If no rules provided, use Conway's Game of Life rules
  if (!tableRules && !treeRules) {
    // ... existing Conway's Game of Life logic ...
    return newGrid;
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (treeRules) {
        // Use tree-based rules
        const currentState = grid[i][j];
        const neighbors = getNeighborStates(grid, i, j, treeRules.n_neighbors);
        const newState = evaluateTreeRules(currentState, neighbors, treeRules);
        newGrid[i][j] = newState;
      } else {
        // Use table-based rules
        const currentState = grid[i][j];
        const neighborStates = getNeighborStates(
          grid,
          i,
          j,
          tableRules.n_neighbors
        );
        const key = `${currentState},${neighborStates.join(",")}`;
        const newState = tableRules.transitions.get(key);
        newGrid[i][j] = newState !== undefined ? newState : currentState;
      }
    }
  }

  return newGrid;
}

function getNeighborStates(grid, row, col, n_neighbors) {
  const rows = grid.length;
  const cols = grid[0].length;
  const states = [];

  // Define neighborhood pattern
  const neighbors =
    n_neighbors === 4
      ? [
          [0, -1], // N
          [1, 0], // E
          [0, 1], // S
          [-1, 0], // W
        ]
      : [
          [0, -1], // N
          [1, -1], // NE
          [1, 0], // E
          [1, 1], // SE
          [0, 1], // S
          [-1, 1], // SW
          [-1, 0], // W
          [-1, -1], // NW
        ];

  // Collect states of neighbors
  for (const [dx, dy] of neighbors) {
    const newRow = (row + dy + rows) % rows;
    const newCol = (col + dx + cols) % cols;
    states.push(grid[newRow][newCol]);
  }

  return states;
}

function evaluateTreeRules(currentState, neighbors, treeRules) {
  let node = treeRules.root;

  // First check current state
  if (!node[currentState]) return 0;
  node = node[currentState];

  // Then check each neighbor state according to the tree
  for (const neighborState of neighbors) {
    if (!node[neighborState]) return 0;
    node = node[neighborState];
  }

  // The final node contains the new state
  return node.result || 0;
}
