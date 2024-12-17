import * as rle from "@ca-ts/rle";

export function parseRleFile(content) {
  const parsed = rle.parseRLE(content);

  const initialGrid = Array(parsed.size.height)
    .fill()
    .map(() => Array(parsed.size.width).fill(0));

  parsed.cells.forEach((cell) => {
    initialGrid[cell.position.y][cell.position.x] = cell.state;
  });

  return {
    width: parsed.size.width,
    height: parsed.size.height,
    rule: parsed.ruleString,
    pattern: initialGrid,
  };
}
