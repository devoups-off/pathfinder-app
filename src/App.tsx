import React, {useState} from "react";
import './App.css';

interface CellProps {
  row: number;
  col: number;
  color: string;
  onClick: () => void;
}

interface GridProps {
  rows: number;
  cols: number;
}

interface Node {
  row: number;
  col: number;
  cost: number;
  parent: Node | null;
}

function findPath(grid: string[][], start: [number, number], end: [number, number]): [number, number][] {
  const ROWS = grid.length;
  const COLS = grid[0].length;
  const visited = Array(ROWS).fill(false).map(() => Array(COLS).fill(false));
  const costMap = Array(ROWS).fill(Infinity).map(() => Array(COLS).fill(Infinity));
  const queue: Node[] = [];

  costMap[start[0]][start[1]] = 0;
  queue.push({row: start[0], col: start[1], cost: 0, parent: null});

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const current = queue.shift()!;

    if (current.row === end[0] && current.col === end[1]) {
      // End reached, construct the path
      const path: [number, number][] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift([node.row, node.col]);
        node = node.parent;
      }
      return path;
    }

    visited[current.row][current.col] = true;

    const neighbors: [number, number][] = [
      [current.row - 1, current.col], // Up
      [current.row + 1, current.col], // Down
      [current.row, current.col - 1], // Left
      [current.row, current.col + 1], // Right
    ];

    for (const [r, c] of neighbors) {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) {
        continue;
      }
      if (visited[r][c] || grid[r][c] === "black") {
        continue;
      }

      const newCost = current.cost + 1;
      if (newCost < costMap[r][c]) {
        costMap[r][c] = newCost;
        queue.push({row: r, col: c, cost: newCost + heuristic(r, c, end), parent: current});
      }
    }
  }

  return [];

  function heuristic(r: number, c: number, end: [number, number]) {
    return Math.abs(r - end[0]) + Math.abs(c - end[1]);
  }
}


const Cell: React.FC<CellProps> = ({row, col, color, onClick}) => {
  const isStartingCell = row === 0 && col === 0;
  const isEndCell = row === 49 && col === 49;
  return (
      <div
          className="cell"
          style={{backgroundColor: isStartingCell || isEndCell ? "red" : color}}
          onClick={onClick}
          id={row + '-' + col}
      />
  );
};

const Grid: React.FC<GridProps> = ({rows, cols}) => {
  const [grid, setGrid] = useState<string[][]>(
      Array(rows)
          .fill("")
          .map(() => Array(cols).fill("white"))
  );

  const [start, setStart] = useState<[number, number]>([0, 0]);
  const [end, setEnd] = useState<[number, number]>([rows - 1, cols - 1]);
  const [path, setPath] = useState<[number, number][]>([]);

  const handleClick = (row: number, col: number) => {
    const newGrid = [...grid];
    console.log(newGrid[row][col])
    newGrid[row][col] = newGrid[row][col] === "white" ? "black" : "white";
    setGrid(newGrid);
  };

  const handleFindPath = () => {
    const newPath = findPath(grid, start, end);
    setPath(newPath);
    console.log(newPath);
    const newGrid = [...grid];
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    newPath.forEach(cell => {
      newGrid[cell[0]][cell[1]] = color;
    });
    setGrid(newGrid);
  };

  const handleReset = () => {
    setGrid(
        Array(rows)
            .fill("")
            .map(() => Array(cols).fill("white"))
    );
    setStart([0, 0]);
    setEnd([rows - 1, cols - 1]);
    setPath([]);
  };

  const handleRandomize = () => {
    handleReset();
    const newGrid = [...grid];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newGrid[i][j] = Math.random() < 0.2 ? "black" : "white";
      }
    }
    setGrid(newGrid);
  };
  return (
      <div className={'frame'}>
        <div className="grid">
          {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                  <Cell
                      key={`${rowIndex}-${colIndex}`}
                      row={rowIndex}
                      col={colIndex}
                      color={cell}
                      onClick={() => handleClick(rowIndex, colIndex)}
                  />
              ))
          )}
        </div>
        <button onClick={handleFindPath}>Find path</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleRandomize}>Randomize</button>
      </div>
  );
};


const App: React.FC = () => {
  return <Grid rows={50} cols={50}/>;
};

export default App;
