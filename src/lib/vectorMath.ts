/**
 * Calculates the dot product of two vectors.
 * A · B = Σ (Ai * Bi)
 */
export function dotProduct(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

/**
 * Calculates the magnitude (Euclidean norm) of a vector.
 * ||A|| = √ (Σ Ai^2)
 */
export function magnitude(vec: number[]): number {
  let sumSquares = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSquares += vec[i] * vec[i];
  }
  return Math.sqrt(sumSquares);
}

/**
 * Calculates the Cosine Similarity between two vectors.
 * Cosine Similarity = (A · B) / (||A|| * ||B||)
 * Range: [-1, 1] (1 is identical, 0 is orthogonal, -1 is opposite)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dot = dotProduct(vecA, vecB);
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  
  if (magA === 0 || magB === 0) {
    return 0; // Avoid division by zero
  }
  
  return dot / (magA * magB);
}

/**
 * Generates two random orthogonal unit vectors of a given dimension.
 * Used for projecting high-dimensional vectors onto a 2D plane for visualization.
 * This is a simple form of random projection.
 */
export function generateProjectionMatrix(dim: number): [number[], number[]] {
  // Generate random vector 1
  const p1 = Array.from({ length: dim }, () => Math.random() - 0.5);
  const mag1 = magnitude(p1);
  const p1Normalized = p1.map(v => v / mag1);

  // Generate random vector 2
  let p2 = Array.from({ length: dim }, () => Math.random() - 0.5);
  
  // Orthogonalize p2 against p1 using Gram-Schmidt process
  // p2_orth = p2 - proj_p1(p2) = p2 - ((p2 · p1) / (p1 · p1)) * p1
  // Since p1 is normalized, (p1 · p1) = 1
  const dot = dotProduct(p2, p1Normalized);
  p2 = p2.map((val, i) => val - dot * p1Normalized[i]);
  
  const mag2 = magnitude(p2);
  const p2Normalized = p2.map(v => v / mag2);

  return [p1Normalized, p2Normalized];
}

/**
 * Projects a high-dimensional vector onto a 2D plane using the provided basis vectors.
 */
export function projectVector(vec: number[], basis: [number[], number[]]): { x: number, y: number } {
  return {
    x: dotProduct(vec, basis[0]),
    y: dotProduct(vec, basis[1])
  };
}
