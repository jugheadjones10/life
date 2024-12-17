import { useState, useEffect, useRef } from "react";
import { Stage, Container, Graphics } from "@pixi/react";
import Controls from "./components/Controls";
import Grid from "./components/Grid";
import {
  CELL_SIZE,
  INITIAL_ZOOM,
  GRID_SIZE,
  UPDATE_INTERVAL,
} from "./constants";
import { createEmptyGrid, updateGrid } from "./utils/gameLogic";
import { parseRuleFile } from "./utils/ruleParser";
import { parseRleFile } from "./utils/rleParser";

const App = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grid, setGrid] = useState([[]]);
  const [generation, setGeneration] = useState(0);
  const [stateColors, setStateColors] = useState(null);
  const [rules, setRules] = useState(null);
  const [treeRules, setTreeRules] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize grid
  useEffect(() => {
    setGrid(createEmptyGrid(GRID_SIZE, GRID_SIZE));
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setGrid((grid) => {
        // Use tree rules if available, otherwise fall back to table rules
        if (treeRules) {
          return updateGrid(grid, null, treeRules);
        } else {
          return updateGrid(grid, rules);
        }
      });
      setGeneration((gen) => gen + 1);
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning, rules, treeRules]);

  const handleClear = () => {
    setGrid(createEmptyGrid(GRID_SIZE, GRID_SIZE));
    setGeneration(0);
    setIsRunning(false);
  };

  const handleImportRule = async (file) => {
    try {
      const content = await file.text();
      const ruleData = parseRuleFile(content);

      if (ruleData.colors) {
        setStateColors(ruleData.colors);
      }

      // If TABLE section exists, use it; otherwise fall back to TREE
      if (ruleData.table) {
        setRules(ruleData.table);
        console.log("Rules: ", ruleData.table);
        setTreeRules(null); // Clear tree rules when using table
      } else if (ruleData.tree) {
        setTreeRules(ruleData.tree);
        setRules(null); // Clear table rules when using tree
      }
    } catch (error) {
      console.error("Error importing rule file:", error);
    }
  };

  const handleImportPattern = async (file) => {
    try {
      const content = await file.text();
      const patternData = parseRleFile(content);

      // Create new empty grid
      const newGrid = createEmptyGrid(GRID_SIZE, GRID_SIZE);

      // Calculate center offset to place pattern in middle of grid
      const offsetY = Math.floor((GRID_SIZE - patternData.height) / 2);
      const offsetX = Math.floor((GRID_SIZE - patternData.width) / 2);

      // Place pattern in grid
      patternData.pattern.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell > 0) {
            const gridY = y + offsetY;
            const gridX = x + offsetX;
            if (
              gridY >= 0 &&
              gridY < GRID_SIZE &&
              gridX >= 0 &&
              gridX < GRID_SIZE
            ) {
              newGrid[gridY][gridX] = cell;
            }
          }
        });
      });

      setGrid(newGrid);
      setGeneration(0);
      setIsRunning(false);
    } catch (error) {
      console.error("Error importing pattern file:", error);
    }
  };

  return (
    <div className="app">
      <Controls
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        onClear={handleClear}
        onImportRule={handleImportRule}
        onImportPattern={handleImportPattern}
        generation={generation}
        zoom={zoom}
        setZoom={setZoom}
      />
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        options={{ backgroundColor: 0x282c34 }}
      >
        <Container
          position={[
            dimensions.width / 2 + pan.x,
            dimensions.height / 2 + pan.y,
          ]}
          scale={zoom}
          pivot={[(GRID_SIZE * CELL_SIZE) / 2, (GRID_SIZE * CELL_SIZE) / 2]}
        >
          <Grid
            grid={grid}
            setGrid={setGrid}
            cellSize={CELL_SIZE}
            stateColors={stateColors}
          />
        </Container>
      </Stage>
    </div>
  );
};

export default App;
