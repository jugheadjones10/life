export function rotate4(rule) {
  // Return original rule if empty or invalid length
  if (!rule || (rule.length !== 8 && rule.length !== 4)) {
    return [rule];
  }

  const results = new Set();
  let rotated = [...rule];

  // Add all 4 rotations (0°, 90°, 180°, 270°)
  for (let i = 0; i < 4; i++) {
    results.add(JSON.stringify(rotated));

    // Choose rotation mapping based on neighborhood type
    if (rule.length === 4) {
      // von Neumann neighborhood:
      //   0
      // 1 x 2
      //   3
      rotated = [rotated[3], rotated[0], rotated[1], rotated[2]];
    } else {
      throw new Error(
        "rotate4 is only supported for von Neumann neighborhoods"
      );
    }
  }

  return Array.from(results).map((r) => JSON.parse(r));
}

export function permute(rule) {
  const neighborhood = rule;

  // Create array starting from 1 and counting up to before rule.length - 1
  const transforms = generatePermutations(neighborhood.map((n, i) => i));
  const results = new Set();
  transforms.forEach((transform) => {
    const permuted = transform.map((i) => neighborhood[i]);
    results.add(JSON.stringify(permuted));
  });

  return Array.from(results).map((r) => JSON.parse(r));
}

function generatePermutations(elements) {
  const allPermutations = [];

  for (const currentElement of elements) {
    const remainingElements = elements.filter(
      (element) => element !== currentElement
    );
    const subPermutations = generatePermutations(remainingElements);

    for (const subPermutation of subPermutations) {
      allPermutations.push([currentElement].concat(subPermutation));
    }

    if (subPermutations.length === 0) {
      allPermutations.push([currentElement]);
    }
  }

  return allPermutations;
}
