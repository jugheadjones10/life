import { permute, rotate4 } from "./symmetries";

export function parseRuleFile(content) {
  const sections = {};
  let currentSection = null;
  let currentContent = [];

  // Split content into lines
  const lines = content.split("\n");

  for (let line of lines) {
    line = line.trim();

    // Check for section headers
    if (line.startsWith("@")) {
      if (currentSection) {
        sections[currentSection] = currentContent.join("\n");
        currentContent = [];
      }
      currentSection = line.substring(1).split(" ")[0];
      continue;
    }

    // Add content to current section
    if (currentSection) {
      currentContent.push(line);
    }
  }

  // Add the last section
  if (currentSection) {
    sections[currentSection] = currentContent.join("\n");
  }

  return {
    ruleName: sections.RULE?.trim(),
    colors: parseColors(sections.COLORS),
    table: parseTable(sections.TABLE),
    tree: parseTree(sections.TREE),
  };
}

function parseTable(tableSection) {
  if (!tableSection) return null;

  const table = {
    n_states: 2, // default to 2 states (0 and 1)
    n_neighbors: 8, // default to 8 neighbors (Moore neighborhood)
    symmetries: "none",
    transitions: new Map(),
  };

  const lines = tableSection.split("\n");

  for (let line of lines) {
    line = line.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("#")) continue;

    // Parse n_states declaration
    if (line.startsWith("n_states:")) {
      table.n_states = parseInt(line.split(":")[1]);
      continue;
    }

    // Parse neighborhood declaration
    if (line.startsWith("neighborhood:")) {
      const neighborhood = line.split(":")[1].trim();
      table.n_neighbors =
        neighborhood === "Moore"
          ? 8
          : neighborhood === "vonNeumann"
          ? 4
          : parseInt(neighborhood) || 8;
      continue;
    }

    // Add support for symmetries:
    if (line.startsWith("symmetries:")) {
      const symmetries = line.split(":")[1].trim();
      table.symmetries = symmetries;
      continue;
    }

    // Parse transition rules
    // Format: current_state + neighbor_states -> new_state
    if (line.length >= 6) {
      // Minimum length for a valid rule
      let lineArray = [];
      if (line.includes(",")) {
        lineArray = line.split(",");
      } else {
        lineArray = line.split("");
      }
      const currentState = parseInt(lineArray[0]);
      const neighborStates = lineArray.slice(1, -1).map(Number);
      const newState = parseInt(lineArray[lineArray.length - 1]);

      // Create key for the transition
      const key = `${currentState},${neighborStates.join(",")}`;
      table.transitions.set(key, newState);
    }
  }

  if (table.symmetries === "permute") {
    const newTransitions = new Map();
    for (let [key, value] of table.transitions) {
      // Slice neighborhood from key
      const keyArray = key.split(",");
      const currentState = keyArray[0];
      const neighborhood = keyArray.slice(1, keyArray.length);
      const permuted = permute(neighborhood);
      for (let p of permuted) {
        newTransitions.set(`${currentState},${p.join(",")}`, value);
      }
    }
    table.transitions = newTransitions;
  } else if (table.symmetries === "rotate4") {
    const newTransitions = new Map();
    for (let [key, value] of table.transitions) {
      const keyArray = key.split(",");
      const currentState = keyArray[0];
      const neighborhood = keyArray.slice(1);
      const rotated = rotate4(neighborhood);
      for (let r of rotated) {
        newTransitions.set(`${currentState},${r.join(",")}`, value);
      }
    }
    table.transitions = newTransitions;
  }

  return table;
}

function parseColors(colorsSection) {
  if (!colorsSection) return null;

  const colors = {};
  const lines = colorsSection.split("\n");

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const parts = line.split(/\s+/);
    if (parts.length >= 4) {
      const state = parseInt(parts[0]);
      const r = parseInt(parts[1]);
      const g = parseInt(parts[2]);
      const b = parseInt(parts[3]);

      if (!isNaN(state) && !isNaN(r) && !isNaN(g) && !isNaN(b)) {
        colors[state] = `rgb(${r}, ${g}, ${b})`;
      }
    }
  }

  return colors;
}

function parseTree(treeSection) {
  if (!treeSection) return null;

  const tree = {
    n_states: 2,
    n_neighbors: 8,
    root: {},
  };

  const lines = treeSection.split("\n");

  for (let line of lines) {
    line = line.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith("#")) continue;

    // Parse n_states declaration
    if (line.startsWith("n_states:")) {
      tree.n_states = parseInt(line.split(":")[1]);
      continue;
    }

    // Parse neighborhood declaration
    if (line.startsWith("neighborhood:")) {
      const neighborhood = line.split(":")[1].trim();
      tree.n_neighbors =
        neighborhood === "Moore"
          ? 8
          : neighborhood === "vonNeumann"
          ? 4
          : parseInt(neighborhood) || 8;
      continue;
    }

    // Parse tree nodes
    // Format: var=value or var=value,value,value
    const match = line.match(/(\w+)\s*=\s*(.+)/);
    if (match) {
      const [_, variable, valueStr] = match;
      const values = valueStr.split(",").map((v) => v.trim());

      // Build tree structure
      let node = tree.root;
      const path = variable.split("");

      // Create path in tree
      for (let i = 0; i < path.length - 1; i++) {
        const state = parseInt(path[i]);
        if (!node[state]) {
          node[state] = {};
        }
        node = node[state];
      }

      // Add leaf values
      const lastState = parseInt(path[path.length - 1]);
      if (values.length === 1) {
        node[lastState] = { result: parseInt(values[0]) };
      } else {
        node[lastState] = values.reduce((obj, val, idx) => {
          obj[idx] = parseInt(val);
          return obj;
        }, {});
      }
    }
  }

  return tree;
}
