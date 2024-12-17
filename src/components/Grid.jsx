import { Graphics } from "@pixi/react";
import { useCallback } from "react";

const Grid = ({ grid, setGrid, cellSize, stateColors }) => {
  const draw = useCallback(
    (g) => {
      g.clear();

      // Draw grid lines
      g.lineStyle(1, 0x444444, 1);

      // Draw vertical lines
      for (let x = 0; x <= grid[0].length; x++) {
        g.moveTo(x * cellSize, 0);
        g.lineTo(x * cellSize, grid.length * cellSize);
      }

      // Draw horizontal lines
      for (let y = 0; y <= grid.length; y++) {
        g.moveTo(0, y * cellSize);
        g.lineTo(grid[0].length * cellSize, y * cellSize);
      }

      // Draw cells
      grid.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell > 0) {
            // Adjust state index for color lookup (add 1 to match 1-indexed colors)
            let color = 0xffffff; // default white color

            if (stateColors?.[cell]) {
              const rgbMatch = stateColors[cell].match(
                /rgb\((\d+),\s*(\d+),\s*(\d+)\)/
              );
              if (rgbMatch) {
                const [_, r, g, b] = rgbMatch;
                color = (parseInt(r) << 16) | (parseInt(g) << 8) | parseInt(b);
              }
            }

            g.beginFill(color);
            g.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
            g.endFill();
          }
        });
      });
    },
    [grid, cellSize, stateColors]
  );

  return <Graphics draw={draw} />;
};

export default Grid;
