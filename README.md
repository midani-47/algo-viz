# Algorithm Visualizer

An interactive tool for visualizing various algorithms and computational paradigms.

## Core Algorithm Features

### 1. Optimization Problems
- **0/1 Knapsack Algorithm**
  - Dynamic programming implementation
  - Visual state space exploration
  - Step-by-step solution tracking
  - Weight-value pair optimization

- **State Space Tree**
  - Tree-based decision visualization
  - Branch and bound representation
  - Solution path highlighting
  - Interactive node exploration

### 2. Graph Algorithms
- **Search Algorithms**
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - Topological Sort
  
- **Path Finding**
  - Dijkstra's Algorithm
    - Shortest path computation
    - Distance tracking
    - Path reconstruction
  
- **Minimum Spanning Tree**
  - Prim's Algorithm
    - Edge weight consideration
    - Tree construction visualization
    - Step-by-step growth

### 3. Advanced Algorithmic Paradigms
- **Prune and Search**
  - Problem size reduction
  - Efficient solution space exploration
  - Visual pruning steps

- **Parameterized Complexity**
  - Parameter-based analysis
  - Fixed-parameter tractability
  - Branching visualization

- **Kernelization**
  - Problem kernel extraction
  - Size reduction rules
  - Kernel visualization

## Input Formats

### Graph Input
```
// Adjacency Matrix
0 2 4 0
2 0 1 3
4 1 0 5
0 3 5 0

// Edge List
0 1 2
1 2 1
0 2 4
```

### Optimization Input
```
// Knapsack Items (weight value)
2 3
3 4
4 5
5 6
```

### Advanced Problems
```
// Vertex Cover (edge list)
0 1
1 2
2 3

// Set Cover
Set1: 1 2 3 4
Set2: 2 4 5 6
Universe: 1 2 3 4 5 6
```

## Quick Start
1. Open `algorithms.html` in a browser
2. Select algorithm category
3. Choose specific algorithm
4. Input problem instance
5. Click "Run Algorithm"

## Technical Stack
- D3.js for visualization
- HTML5/CSS3
- Vanilla JavaScript

## License
MIT License