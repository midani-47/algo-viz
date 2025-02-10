# NP-Completeness Visualizer

An interactive visualization tool that demonstrates the relationships between different NP-complete problems through polynomial-time reductions.

## Features

### Core Visualization
- Interactive force-directed graph visualization of NP-complete problems
- Drag and drop nodes to explore relationships
- Zoom and pan functionality
- Multiple layout options (Force-Directed, Hierarchical, Circular)
- Dynamic node highlighting and relationship visualization

### Problem Selection and Search
- Search problems by name, description, or keywords
- Filter problems using checkboxes
- Visual distinction between selected and related problems
- Detailed problem information display

### Interactive Features

#### Problem Information Panel
- Click on any problem node to see:
  - Formal problem definition
  - Complexity class
  - Example instances and solutions
  - Practical importance and applications
  - Related reductions

#### Reduction Visualization
- Click on edges to see reduction details:
  - Step-by-step reduction process
  - Complexity analysis
  - Transformation details
  - Visual representation of the reduction

#### Interactive Learning Tools
1. **Problem Explorer**
   - Select specific NP-complete problems
   - View detailed descriptions and examples
   - Input custom problem instances
   - See step-by-step solutions

2. **Reduction Steps**
   - Interactive walkthrough of reductions
   - Step-by-step transformation process
   - Complexity analysis
   - Visual aids for understanding

3. **Practice Problems**
   - Input custom instances for:
     - Clique Problem
     - Vertex Cover
     - More problems to be added
   - Get immediate feedback
   - See solution steps

### Layout Controls
- Force-Directed: Natural clustering of related problems
- Hierarchical: Clear visualization of reduction relationships
- Circular: Compact view of all problems

### View Controls
- Reset View: Return to default layout
- Zoom Controls: Zoom in/out for detail
- Pan: Navigate large graphs
- Reset Zoom: Return to default zoom level

## Problems Included

- Boolean Satisfiability (SAT)
- 3-SAT
- Clique
- Vertex Cover
- Hamiltonian Cycle
- Traveling Salesman Problem
- Subset Sum

Each problem includes:
- Formal definition
- Example instances
- Practical applications
- Complexity analysis
- Reduction relationships

## Usage

1. Open `index.html` in a modern web browser
2. Basic Interaction:
   - Drag nodes to reposition them
   - Click nodes to see problem details
   - Click edges to see reduction details
   - Use checkboxes to filter problems
   - Use search to find specific problems

3. Advanced Features:
   - Try solving problem instances in the Interactive Panel
   - Walk through reduction steps
   - Experiment with different layouts
   - Use zoom and pan for detailed exploration

## Implementation Details

Built using:
- D3.js for visualization and force-directed layout
- HTML5/CSS3 for structure and styling
- Vanilla JavaScript for interactivity

Key components:
- Force simulation for natural layout
- SVG-based visualization
- Dynamic data filtering
- Interactive problem solving

## Future Enhancements

- Add more NP-complete problems
- Implement actual solving algorithms
- Add animation for reduction steps
- Include complexity theory tutorials
- Add more interactive examples
- Implement graph drawing tools
- Add save/load functionality for custom problems

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use and modify for your own educational purposes.