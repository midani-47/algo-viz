// Global variables for visualization
let svg, simulation;
let currentGraph = null;
let algorithmSteps = [];
let currentStep = 0;
let animationSpeed = 1000; // milliseconds

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeGraphVisualization();
    initializeEventListeners();
});

// Navigation initialization
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            // Update active states
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Show selected section
            document.querySelectorAll('.algorithm-section').forEach(sec => {
                sec.classList.remove('active');
            });
            document.getElementById(section).classList.add('active');
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Graph algorithms
    document.getElementById('runGraphAlgo').addEventListener('click', runGraphAlgorithm);
    document.getElementById('resetGraph').addEventListener('click', resetVisualization);
    
    // Optimization algorithms
    document.getElementById('runOptimization').addEventListener('click', () => {
        const algorithm = document.getElementById('optimizationAlgorithm').value;
        if (algorithm === 'statespace') {
            runStateSpaceTree();
        } else {
            runKnapsack();
        }
    });
    document.getElementById('resetOptimization').addEventListener('click', resetVisualization);
    
    // Advanced paradigms
    document.getElementById('runAdvanced').addEventListener('click', runAdvancedAlgorithm);
    document.getElementById('resetAdvanced').addEventListener('click', resetVisualization);

    // Add algorithm change handlers
    document.getElementById('graphAlgorithm').addEventListener('change', () => {
        const stepsDiv = document.querySelector('#graph .algorithm-steps');
        stepsDiv.innerHTML = ''; // Clear previous steps
        resetVisualization();
        if (currentGraph) {
            runGraphAlgorithm(); // Re-run with new algorithm
        }
    });

    document.getElementById('optimizationAlgorithm').addEventListener('change', () => {
        const stepsDiv = document.querySelector('#optimization .algorithm-steps');
        stepsDiv.innerHTML = ''; // Clear previous steps
        resetVisualization();
        
        // Don't automatically run on algorithm change
        // Let user click the Run button instead
    });

    document.getElementById('advancedAlgorithm').addEventListener('change', () => {
        const stepsDiv = document.querySelector('#advanced .algorithm-steps');
        stepsDiv.innerHTML = ''; // Clear previous steps
        resetVisualization();
        if (document.getElementById('advancedInput').value.trim()) {
            runAdvancedAlgorithm();
        }
    });

    // Add input change handlers
    document.getElementById('itemsInput').addEventListener('input', debounce(() => {
        const algorithm = document.getElementById('optimizationAlgorithm').value;
        if (algorithm === 'knapsack' && document.getElementById('itemsInput').value.trim()) {
            runKnapsack();
        }
    }, 500));
}

// Graph visualization initialization
function initializeGraphVisualization() {
    const container = document.getElementById('graphVisualization');
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg = d3.select('#graphVisualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            svg.selectAll('g').attr('transform', event.transform);
        });

    svg.call(zoom);
}

// Parse graph input
function parseGraphInput() {
    const format = document.getElementById('graphInputFormat').value;
    const input = document.getElementById('graphInput').value.trim();
    const errorDiv = document.getElementById('graphError');
    
    try {
        if (format === 'adjacency') {
            return parseAdjacencyMatrix(input);
        } else {
            return parseEdgeList(input);
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        return null;
    }
}

// Parse adjacency matrix
function parseAdjacencyMatrix(input) {
    const lines = input.split('\n').map(line => 
        line.trim().split(/\s+/).map(Number)
    );
    
    if (lines.some(row => row.length !== lines.length)) {
        throw new Error('Invalid adjacency matrix: must be square');
    }

    const nodes = Array.from({length: lines.length}, (_, i) => ({id: i}));
    const links = [];

    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines.length; j++) {
            if (lines[i][j]) {
                links.push({source: i, target: j, weight: lines[i][j]});
            }
        }
    }

    return {nodes, links};
}

// Parse edge list
function parseEdgeList(input) {
    const lines = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const nodes = new Set();
    const links = [];

    lines.forEach(line => {
        const [source, target, weight = 1] = line.split(/\s+/).map(Number);
        if (isNaN(source) || isNaN(target)) {
            throw new Error('Invalid edge format');
        }
        nodes.add(source);
        nodes.add(target);
        links.push({source, target, weight: Number(weight)});
    });

    return {
        nodes: Array.from(nodes).map(id => ({id})),
        links
    };
}

// Run graph algorithm
function runGraphAlgorithm() {
    const algorithm = document.getElementById('graphAlgorithm').value;
    const graph = parseGraphInput();
    if (!graph) return;

    const startVertex = parseInt(document.getElementById('startVertex').value);
    if (isNaN(startVertex) || startVertex < 0 || startVertex >= graph.nodes.length) {
        document.getElementById('graphError').textContent = 'Invalid start vertex';
        return;
    }

    currentGraph = graph;
    algorithmSteps = [];
    currentStep = 0;

    switch (algorithm) {
        case 'bfs':
            bfs(graph, startVertex);
            break;
        case 'dfs':
            dfs(graph, startVertex);
            break;
        case 'topological':
            topologicalSort(graph);
            break;
        case 'prim':
            prim(graph, startVertex);
            break;
        case 'dijkstra':
            dijkstra(graph, startVertex);
            break;
    }

    visualizeAlgorithm();
}

// BFS implementation
function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    visited.add(start);

    algorithmSteps.push({
        type: 'init',
        message: `Starting BFS from vertex ${start}`,
        visited: new Set([start]),
        queue: [...queue],
        current: start
    });

    while (queue.length > 0) {
        const vertex = queue.shift();
        const neighbors = graph.links
            .filter(link => link.source.id === vertex)
            .map(link => link.target.id);

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                algorithmSteps.push({
                    type: 'visit',
                    message: `Visiting vertex ${neighbor} from ${vertex}`,
                    visited: new Set(visited),
                    queue: [...queue],
                    current: neighbor
                });
            }
        }
    }
}

// DFS implementation
function dfs(graph, start) {
    const visited = new Set();

    function dfsVisit(vertex) {
        visited.add(vertex);
        algorithmSteps.push({
            type: 'visit',
            message: `Visiting vertex ${vertex}`,
            visited: new Set(visited),
            current: vertex
        });

        const neighbors = graph.links
            .filter(link => link.source.id === vertex)
            .map(link => link.target.id);

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                dfsVisit(neighbor);
            }
        }
    }

    dfsVisit(start);
}

// Topological Sort implementation
function topologicalSort(graph) {
    const visited = new Set();
    const stack = [];
    const temp = new Set();

    function visit(vertex) {
        if (temp.has(vertex)) {
            throw new Error('Graph contains a cycle');
        }
        if (visited.has(vertex)) return;

        temp.add(vertex);
        const neighbors = graph.links
            .filter(link => link.source.id === vertex)
            .map(link => link.target.id);

        for (const neighbor of neighbors) {
            visit(neighbor);
        }

        temp.delete(vertex);
        visited.add(vertex);
        stack.unshift(vertex);

        algorithmSteps.push({
            type: 'visit',
            message: `Adding vertex ${vertex} to topological order`,
            visited: new Set(visited),
            current: vertex,
            order: [...stack]
        });
    }

    for (const node of graph.nodes) {
        if (!visited.has(node.id)) {
            visit(node.id);
        }
    }

    return stack;
}

// Prim's Algorithm implementation
function prim(graph, start) {
    const visited = new Set([start]);
    const mst = [];
    
    algorithmSteps.push({
        type: 'init',
        message: `Starting Prim's algorithm from vertex ${start}`,
        visited: new Set([start]),
        mst: [],
        current: start
    });

    while (visited.size < graph.nodes.length) {
        let minEdge = null;
        let minWeight = Infinity;

        // Find minimum weight edge connecting visited and unvisited vertices
        for (const edge of graph.links) {
            const sourceVisited = visited.has(edge.source.id);
            const targetVisited = visited.has(edge.target.id);

            if (sourceVisited !== targetVisited) {
                if (edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
        }

        if (!minEdge) break;

        const newVertex = visited.has(minEdge.source.id) ? minEdge.target.id : minEdge.source.id;
        visited.add(newVertex);
        mst.push(minEdge);

        algorithmSteps.push({
            type: 'visit',
            message: `Adding edge (${minEdge.source.id}, ${minEdge.target.id}) to MST`,
            visited: new Set(visited),
            mst: [...mst],
            current: newVertex
        });
    }

    return mst;
}

// Dijkstra's Algorithm implementation
function dijkstra(graph, start) {
    const distances = {};
    const previous = {};
    const unvisited = new Set(graph.nodes.map(node => node.id));
    
    // Initialize distances
    graph.nodes.forEach(node => {
        distances[node.id] = Infinity;
    });
    distances[start] = 0;

    algorithmSteps.push({
        type: 'init',
        message: `Starting Dijkstra's algorithm from vertex ${start}`,
        distances: {...distances},
        current: start
    });

    while (unvisited.size > 0) {
        // Find vertex with minimum distance
        let minDistance = Infinity;
        let minVertex = null;
        
        for (const vertex of unvisited) {
            if (distances[vertex] < minDistance) {
                minDistance = distances[vertex];
                minVertex = vertex;
            }
        }

        if (minVertex === null) break;
        unvisited.delete(minVertex);

        // Update distances to neighbors
        const neighbors = graph.links
            .filter(link => link.source.id === minVertex)
            .map(link => ({vertex: link.target.id, weight: link.weight}));

        for (const {vertex, weight} of neighbors) {
            const distance = distances[minVertex] + weight;
            if (distance < distances[vertex]) {
                distances[vertex] = distance;
                previous[vertex] = minVertex;

                algorithmSteps.push({
                    type: 'update',
                    message: `Updating distance to vertex ${vertex} via ${minVertex}`,
                    distances: {...distances},
                    current: vertex,
                    previous: {...previous}
                });
            }
        }
    }

    return {distances, previous};
}

// Run optimization algorithm
function runOptimizationAlgorithm() {
    const algorithm = document.getElementById('optimizationAlgorithm').value;
    
    switch (algorithm) {
        case 'knapsack':
            runKnapsack();
            break;
    }
}

// Knapsack implementation
function runKnapsack() {
    const capacity = parseInt(document.getElementById('knapsackCapacity').value);
    const itemsInput = document.getElementById('itemsInput').value.trim();
    const errorDiv = document.getElementById('optimizationError');

    try {
        const items = parseKnapsackItems(itemsInput);
        const solution = solveKnapsack(items, capacity);
        displayKnapsackSolution(solution);
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

function parseKnapsackItems(input) {
    const lines = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return lines.map((line, index) => {
        const [weight, value] = line.split(/\s+/).map(Number);
        if (isNaN(weight) || isNaN(value)) {
            throw new Error(`Invalid item format at line ${index + 1}`);
        }
        return {weight, value, index};
    });
}

function solveKnapsack(items, capacity) {
    const n = items.length;
    const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
    const selected = new Set();

    // Fill dp table
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity; w++) {
            if (items[i-1].weight <= w) {
                dp[i][w] = Math.max(
                    items[i-1].value + dp[i-1][w - items[i-1].weight],
                    dp[i-1][w]
                );
            } else {
                dp[i][w] = dp[i-1][w];
            }
        }
    }

    // Backtrack to find selected items
    let w = capacity;
    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i-1][w]) {
            selected.add(items[i-1].index);
            w -= items[i-1].weight;
        }
    }

    return {
        maxValue: dp[n][capacity],
        selected,
        dp
    };
}

function displayKnapsackSolution(solution) {
    const stepsDiv = document.querySelector('#optimization .algorithm-steps');
    const visualizationDiv = document.getElementById('optimizationVisualization');
    
    // Create visualization of items
    let visualizationHtml = '<div class="knapsack-visualization">';
    const items = parseKnapsackItems(document.getElementById('itemsInput').value.trim());
    
    items.forEach((item, index) => {
        const isSelected = solution.selected.has(index);
        visualizationHtml += `
            <div class="item-bar ${isSelected ? 'selected' : ''}">
                <span>Item ${index}</span>
                <span class="item-weight">Weight: ${item.weight}</span>
                <span class="item-value">Value: ${item.value}</span>
                ${isSelected ? '<span class="selected-marker">✓ Selected</span>' : ''}
            </div>
        `;
    });
    visualizationHtml += '</div>';
    
    visualizationDiv.innerHTML = visualizationHtml;
    
    // Display solution details
    stepsDiv.innerHTML = `
        <h3>Knapsack Solution</h3>
        <p>Maximum Value: ${solution.maxValue}</p>
        <p>Selected Items: ${Array.from(solution.selected).join(', ')}</p>
        <h4>Dynamic Programming Table:</h4>
        <div class="dp-table">
            ${formatDPTable(solution.dp, solution.selected)}
        </div>
    `;
}

// Improved DP table formatting
function formatDPTable(dp, selected) {
    const capacity = dp[0].length - 1;
    let html = '<table class="dp-table">';
    
    // Add header row with weights
    html += '<tr><th>Items \\ Weight</th>';
    for (let w = 0; w <= capacity; w++) {
        html += `<th>${w}</th>`;
    }
    html += '</tr>';
    
    // Add data rows
    for (let i = 0; i < dp.length; i++) {
        html += '<tr>';
        html += `<th>Item ${i}</th>`;
        for (let w = 0; w < dp[i].length; w++) {
            const isSelected = selected && i > 0 && dp[i][w] !== dp[i-1][w];
            html += `<td class="${isSelected ? 'selected' : ''}">${dp[i][w]}</td>`;
        }
        html += '</tr>';
    }
    
    html += '</table>';
    return html;
}

// Run advanced algorithm
function runAdvancedAlgorithm() {
    const algorithm = document.getElementById('advancedAlgorithm').value;
    const problemType = document.getElementById('problemType').value;
    const k = parseInt(document.getElementById('parameterK').value);
    const input = document.getElementById('advancedInput').value.trim();
    
    switch (algorithm) {
        case 'prune':
            runPruneAndSearch(problemType, input, k);
            break;
        case 'parameterized':
            runParameterizedAlgorithm(problemType, input, k);
            break;
        case 'kernelization':
            runKernelization(problemType, input, k);
            break;
    }
}

// Visualization functions
function visualizeAlgorithm() {
    if (!currentGraph) return;

    const width = document.getElementById('graphVisualization').clientWidth;
    const height = document.getElementById('graphVisualization').clientHeight;

    svg.selectAll('*').remove();
    const container = svg.append('g');

    // Add arrow markers for directed edges
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');

    // Create edges with weights
    const links = container.selectAll('.link')
        .data(currentGraph.links)
        .enter()
        .append('g')
        .attr('class', 'link');

    links.append('line')
        .attr('marker-end', 'url(#arrowhead)')
        .attr('class', 'link-line');

    links.append('text')
        .attr('class', 'link-weight')
        .text(d => d.weight);

    // Create interactive nodes
    const nodes = container.selectAll('.node')
        .data(currentGraph.nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded));

    nodes.append('circle')
        .attr('r', 20)
        .attr('class', 'node-circle');

    nodes.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .text(d => d.id);

    // Add tooltips
    nodes.append('title')
        .text(d => `Node ${d.id}`);

    links.append('title')
        .text(d => `${d.source.id} → ${d.target.id} (weight: ${d.weight})`);

    // Force simulation
    simulation = d3.forceSimulation(currentGraph.nodes)
        .force('link', d3.forceLink(currentGraph.links).id(d => d.id).distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30))
        .on('tick', ticked);

    function ticked() {
        links.select('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        links.select('text')
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);

        nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    // Add algorithm-specific visualization
    const algorithm = document.getElementById('graphAlgorithm').value;
    switch (algorithm) {
        case 'bfs':
            visualizeBFS();
            break;
        case 'dfs':
            visualizeDFS();
            break;
        case 'topological':
            visualizeTopologicalSort();
            break;
        case 'prim':
            visualizePrim();
            break;
        case 'dijkstra':
            visualizeDijkstra();
            break;
    }
}

// Algorithm-specific visualizations
function visualizeBFS() {
    const startVertex = parseInt(document.getElementById('startVertex').value);
    const visited = new Set();
    const queue = [startVertex];
    visited.add(startVertex);
    
    let step = 0;
    const interval = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(interval);
            return;
        }

        const vertex = queue.shift();
        const neighbors = currentGraph.links
            .filter(link => link.source.id === vertex)
            .map(link => link.target.id);

        // Highlight current node
        svg.selectAll('.node')
            .filter(d => d.id === vertex)
            .select('circle')
            .transition()
            .duration(500)
            .style('fill', '#4CAF50');

        // Process neighbors
        neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
                
                // Highlight edge and target node
                svg.selectAll('.link-line')
                    .filter(d => d.source.id === vertex && d.target.id === neighbor)
                    .transition()
                    .duration(500)
                    .style('stroke', '#2196F3')
                    .style('stroke-width', 3);

                svg.selectAll('.node')
                    .filter(d => d.id === neighbor)
                    .select('circle')
                    .transition()
                    .duration(500)
                    .style('fill', '#FFA726');
            }
        });

        updateStepDescription({
            message: `Step ${++step}: Visiting node ${vertex}, Queue: [${queue.join(', ')}]`,
            visited,
            queue
        });
    }, 1000);
}

function visualizeDijkstra() {
    const startVertex = parseInt(document.getElementById('startVertex').value);
    const distances = {};
    const previous = {};
    const unvisited = new Set(currentGraph.nodes.map(node => node.id));
    
    // Initialize distances
    currentGraph.nodes.forEach(node => {
        distances[node.id] = Infinity;
    });
    distances[startVertex] = 0;

    let step = 0;
    const interval = setInterval(() => {
        if (unvisited.size === 0) {
            clearInterval(interval);
            // Show final paths
            highlightShortestPaths(previous, distances);
            return;
        }

        // Find minimum distance vertex
        let minVertex = null;
        let minDistance = Infinity;
        for (const vertex of unvisited) {
            if (distances[vertex] < minDistance) {
                minVertex = vertex;
                minDistance = distances[vertex];
            }
        }

        if (minVertex === null) {
            clearInterval(interval);
            return;
        }

        unvisited.delete(minVertex);

        // Update neighbors
        const neighbors = currentGraph.links
            .filter(link => link.source.id === minVertex)
            .map(link => ({
                vertex: link.target.id,
                weight: link.weight
            }));

        // Highlight current node and its edges
        svg.selectAll('.node')
            .filter(d => d.id === minVertex)
            .select('circle')
            .transition()
            .duration(500)
            .style('fill', '#4CAF50');

        neighbors.forEach(({vertex, weight}) => {
            const distance = distances[minVertex] + weight;
            if (distance < distances[vertex]) {
                distances[vertex] = distance;
                previous[vertex] = minVertex;

                // Highlight edge and updated node
                svg.selectAll('.link-line')
                    .filter(d => d.source.id === minVertex && d.target.id === vertex)
                    .transition()
                    .duration(500)
                    .style('stroke', '#2196F3')
                    .style('stroke-width', 3);

                svg.selectAll('.node')
                    .filter(d => d.id === vertex)
                    .select('circle')
                    .transition()
                    .duration(500)
                    .style('fill', '#FFA726');
            }
        });

        updateStepDescription({
            message: `Step ${++step}: Updated distances from node ${minVertex}`,
            distances: {...distances}
        });
    }, 1000);
}

function runStateSpaceTree() {
    const capacity = parseInt(document.getElementById('knapsackCapacity').value);
    const itemsInput = document.getElementById('itemsInput').value.trim();
    const errorDiv = document.getElementById('optimizationError');
    
    try {
        if (!itemsInput) {
            throw new Error('Please enter items data');
        }
        
        const items = parseKnapsackItems(itemsInput);
        if (items.length === 0) {
            throw new Error('No valid items found');
        }
        
        if (isNaN(capacity) || capacity <= 0) {
            throw new Error('Please enter a valid capacity (greater than 0)');
        }

        const treeData = generateStateSpaceTree(items, capacity);
        visualizeStateSpaceTree(treeData);
        
        // Add step description
        const stepsDiv = document.querySelector('#optimization .algorithm-steps');
        stepsDiv.innerHTML = `
            <div class="step">
                <h4>State Space Tree Analysis</h4>
                <p>Capacity: ${capacity}</p>
                <p>Number of items: ${items.length}</p>
                <p>Tree depth: ${items.length + 1}</p>
                <p>Green nodes: Root</p>
                <p>Blue nodes: Solutions</p>
                <p>White nodes: Decision points</p>
            </div>
        `;
    } catch (error) {
        errorDiv.textContent = error.message;
        // Clear visualization on error
        document.getElementById('optimizationVisualization').innerHTML = '';
    }
}

function generateStateSpaceTree(items, capacity) {
    if (!items || items.length === 0) {
        return {
            id: 'root',
            label: 'Empty',
            type: 'root',
            description: 'No items',
            children: []
        };
    }

    let nodeId = 0;

    function createNode(level, currentWeight, currentValue, decisions) {
        const node = {
            id: `node_${nodeId++}`,
            label: `Level ${level}`,
            type: level === 0 ? 'root' : 'decision',
            description: `W:${currentWeight}, V:${currentValue}`,
            children: []
        };

        if (level >= items.length) {
            node.type = 'solution';
            node.label = `Solution`;
            node.description = `Total W:${currentWeight}, V:${currentValue}`;
            return node;
        }

        const item = items[level];

        // Include item branch
        if (currentWeight + item.weight <= capacity) {
            const includeChild = createNode(
                level + 1,
                currentWeight + item.weight,
                currentValue + item.value,
                [...decisions, 1]
            );
            if (includeChild) {
                node.children.push(includeChild);
            }
        }

        // Exclude item branch
        const excludeChild = createNode(
            level + 1,
            currentWeight,
            currentValue,
            [...decisions, 0]
        );
        if (excludeChild) {
            node.children.push(excludeChild);
        }

        return node;
    }

    return createNode(0, 0, 0, []);
}

function visualizeStateSpaceTree(treeData) {
    const container = document.getElementById('optimizationVisualization');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous visualization
    container.innerHTML = '';

    // Create SVG
    const svg = d3.select('#optimizationVisualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Add zoom behavior
    const g = svg.append('g');
    svg.call(d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => g.attr('transform', event.transform)));

    // Create tree layout
    const treeLayout = d3.tree()
        .size([width - 100, height - 100]);

    // Create hierarchy
    const root = d3.hierarchy(treeData);
    
    // Apply layout
    treeLayout(root);

    // Create links
    g.selectAll('.tree-link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'tree-link')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y));

    // Create nodes
    const nodes = g.selectAll('.tree-node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', d => `tree-node ${d.data.type}`)
        .attr('transform', d => `translate(${d.x},${d.y})`);

    // Add circles to nodes
    nodes.append('circle')
        .attr('r', 10);

    // Add labels
    nodes.append('text')
        .attr('dy', -15)
        .attr('text-anchor', 'middle')
        .text(d => d.data.label);

    // Add descriptions
    nodes.append('text')
        .attr('dy', 25)
        .attr('text-anchor', 'middle')
        .attr('class', 'node-description')
        .text(d => d.data.description);

    // Add tooltips
    nodes.append('title')
        .text(d => `${d.data.label}\n${d.data.description}`);
}

function highlightShortestPaths(previous, distances) {
    const paths = new Map();
    Object.keys(distances).forEach(vertex => {
        if (distances[vertex] < Infinity) {
            const path = [];
            let current = vertex;
            while (previous[current] !== undefined) {
                path.unshift(current);
                current = previous[current];
            }
            path.unshift(current);
            paths.set(vertex, path);
        }
    });

    // Display paths
    const stepsDiv = document.querySelector('#graph .algorithm-steps');
    stepsDiv.innerHTML += '<h4>Shortest Paths:</h4>';
    paths.forEach((path, vertex) => {
        stepsDiv.innerHTML += `
            <div class="path-result">
                To vertex ${vertex}: ${path.join(' → ')} (distance: ${distances[vertex]})
            </div>
        `;
    });
}

// Add CSS styles for the new visualizations
const style = document.createElement('style');
style.textContent = `
    .link-line {
        stroke: #999;
        stroke-width: 2px;
    }
    
    .link-weight {
        font-size: 12px;
        fill: #666;
    }
    
    .node-circle {
        fill: #6baed6;
        stroke: #4682b4;
        stroke-width: 2px;
        transition: all 0.3s ease;
    }
    
    .node-label {
        font-size: 12px;
        font-weight: bold;
        pointer-events: none;
    }
    
    .path-result {
        padding: 8px;
        margin: 5px 0;
        background-color: #f8f9fa;
        border-radius: 4px;
        border-left: 4px solid #4CAF50;
    }
`;
document.head.appendChild(style);

// Add Advanced Paradigms implementations
function runPruneAndSearch(problemType, input, k) {
    const visualizationDiv = document.getElementById('advancedVisualization');
    const stepsDiv = document.querySelector('#advanced .algorithm-steps');
    
    try {
        let result;
        if (problemType === 'vertex-cover') {
            result = pruneAndSearchVertexCover(input, k);
        } else {
            result = pruneAndSearchSetCover(input, k);
        }
        
        // Create a more visual representation
        visualizationDiv.innerHTML = createVertexCoverVisualization(result);
        
        // Add animation classes after rendering
        setTimeout(() => {
            document.querySelectorAll('.timeline-item').forEach((item, i) => {
                setTimeout(() => item.classList.add('active'), i * 500);
            });
        }, 100);
        
    } catch (error) {
        document.getElementById('advancedError').textContent = error.message;
    }
}

function createVertexCoverVisualization(result) {
    const html = `
        <div class="graph-visualization">
            <div class="problem-stats">
                <div class="stat-card">
                    <div class="stat-title">Original Size</div>
                    <div class="stat-value">${result.originalSize}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Kernel Size</div>
                    <div class="stat-value">${result.kernelSize}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Reduction</div>
                    <div class="stat-value">${Math.round((1 - result.kernelSize/result.originalSize) * 100)}%</div>
                </div>
            </div>
            <div class="reduction-steps">
                <div class="reduction-step">
                    <h4>Original Graph</h4>
                    <div class="graph-container" id="originalGraph"></div>
                    <div class="step-info">
                        <p>Vertices: ${result.originalSize}</p>
                        <p>Edges: ${result.originalGraph.links.length}</p>
                    </div>
                </div>
                <div class="reduction-step">
                    <h4>After Removing Isolated Vertices</h4>
                    <div class="graph-container" id="intermediateGraph"></div>
                    <div class="step-info">
                        <p>Removed vertices: ${result.steps[0] || 'None'}</p>
                    </div>
                </div>
                <div class="reduction-step">
                    <h4>Final Kernel</h4>
                    <div class="graph-container" id="finalKernelGraph"></div>
                    <div class="step-info">
                        <p>Kernel size: ${result.kernelSize}</p>
                        <p>High-degree vertices: ${result.highDegreeVertices?.join(', ') || 'None'}</p>
                    </div>
                </div>
            </div>
            <div class="timeline">
                ${result.steps.map((step, index) => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <h4>Step ${index + 1}</h4>
                            <p>${step}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('advancedVisualization').innerHTML = html;

    // Initialize the graph visualizations after the HTML is added
    setTimeout(() => {
        visualizeVertexCoverGraph(result.originalGraph, 'originalGraph');
        
        // Create and visualize intermediate graph
        const intermediateGraph = {
            nodes: result.originalGraph.nodes.filter(n => 
                !result.isolatedVertices?.includes(n.id)
            ),
            links: result.originalGraph.links.filter(l => 
                !result.isolatedVertices?.includes(l.source.id) && 
                !result.isolatedVertices?.includes(l.target.id)
            )
        };
        visualizeVertexCoverGraph(intermediateGraph, 'intermediateGraph');
        
        // Visualize final kernel
        visualizeVertexCoverGraph(result.reducedGraph, 'finalKernelGraph');
    }, 100);

    return html;
}

function createSetCoverVisualization(result) {
    return `
        <div class="set-cover-visualization">
            <h3>Set Cover Reduction Visualization</h3>
            <div class="sets-container">
                <div class="original-sets">
                    <h4>Original Sets</h4>
                    <div class="sets-grid">
                        ${result.originalSets.map(set => `
                            <div class="set-card">
                                <div class="set-header">${set.name}</div>
                                <div class="set-elements">
                                    ${set.elements.map(elem => 
                                        `<span class="set-element">${elem}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="reduced-sets">
                    <h4>Reduced Sets</h4>
                    <div class="sets-grid">
                        ${result.reducedSets.map(set => `
                            <div class="set-card ${set.isEssential ? 'essential' : ''}">
                                <div class="set-header">
                                    ${set.name}
                                    ${set.isEssential ? '<span class="essential-badge">Essential</span>' : ''}
                                </div>
                                <div class="set-elements">
                                    ${set.elements.map(elem => 
                                        `<span class="set-element">${elem}</span>`
                                    ).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="solution-panel">
                <h4>Solution Status</h4>
                <p class="solution-status ${result.solution.includes('No solution') ? 'error' : 'success'}">
                    ${result.solution}
                </p>
            </div>
        </div>
    `;
}

// Add CSS styles for the advanced paradigms visualization
const advancedStyles = document.createElement('style');
advancedStyles.textContent = `
    .paradigm-visualization {
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .problem-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 30px;
    }

    .stat-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        min-width: 150px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .stat-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #2196F3;
    }

    .visualization-steps {
        margin: 30px 0;
    }

    .step-timeline {
        position: relative;
        padding: 20px 0;
    }

    .step-timeline::before {
        content: '';
        position: absolute;
        left: 50px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e9ecef;
    }

    .timeline-item {
        position: relative;
        padding-left: 70px;
        margin-bottom: 20px;
        opacity: 0;
        transform: translateX(-20px);
        transition: all 0.5s ease;
    }

    .timeline-item.active {
        opacity: 1;
        transform: translateX(0);
    }

    .timeline-marker {
        position: absolute;
        left: 42px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #4CAF50;
        border: 3px solid white;
        box-shadow: 0 0 0 2px #4CAF50;
    }

    .timeline-content {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .timeline-content h4 {
        margin: 0 0 10px 0;
        color: #2c3e50;
    }

    .graph-visualization,
    .set-cover-visualization {
        margin-top: 30px;
    }

    .reduction-steps {
        display: flex;
        gap: 20px;
        margin: 20px 0;
    }

    .reduction-step {
        flex: 1;
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
    }

    .graph-container {
        height: 200px;
        background: white;
        border-radius: 4px;
        border: 1px solid #dee2e6;
    }

    .sets-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .sets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 10px;
    }

    .set-card {
        background: white;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .set-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .set-card.essential {
        border-color: #4CAF50;
        background: #f1f8e9;
    }

    .set-header {
        padding: 10px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .essential-badge {
        background: #4CAF50;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
    }

    .set-elements {
        padding: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .set-element {
        background: #e9ecef;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
    }

    .solution-panel {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .solution-status {
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }

    .solution-status.success {
        background: #f1f8e9;
        color: #2e7d32;
        border-left: 4px solid #4CAF50;
    }

    .solution-status.error {
        background: #fbe9e7;
        color: #c62828;
        border-left: 4px solid #f44336;
    }
`;
document.head.appendChild(advancedStyles);

// Add event listeners for input changes
document.getElementById('graphInput').addEventListener('input', () => {
    const algorithm = document.getElementById('graphAlgorithm').value;
    if (currentGraph) {
        runGraphAlgorithm();
    }
});

document.getElementById('itemsInput').addEventListener('input', debounce(() => {
    if (document.getElementById('itemsInput').value.trim()) {
        runKnapsack();
    }
}, 500));

document.getElementById('advancedInput').addEventListener('input', debounce(() => {
    if (document.getElementById('advancedInput').value.trim()) {
        runAdvancedAlgorithm();
    }
}, 500));

// Drag functions for nodes
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

// Update step description
function updateStepDescription(step) {
    const stepsDiv = document.querySelector('#graph .algorithm-steps');
    const stepElement = document.createElement('div');
    stepElement.className = 'step';
    
    let description = step.message;
    if (step.distances) {
        description += '<br>Distances: ' + 
            Object.entries(step.distances)
                .map(([node, dist]) => `${node}: ${dist === Infinity ? '∞' : dist}`)
                .join(', ');
    }
    if (step.queue) {
        description += '<br>Queue: [' + step.queue.join(', ') + ']';
    }
    
    stepElement.innerHTML = description;
    stepsDiv.appendChild(stepElement);
    stepElement.scrollIntoView({ behavior: 'smooth' });
}

// Reset visualization function
function resetVisualization() {
    // Clear visualizations
    svg.selectAll('*').remove();
    
    // Clear step descriptions
    document.querySelectorAll('.algorithm-steps').forEach(div => {
        div.innerHTML = '';
    });
    
    // Clear error messages
    document.querySelectorAll('.error-message').forEach(div => {
        div.textContent = '';
    });
    
    // Reset state
    currentGraph = null;
    algorithmSteps = [];
    currentStep = 0;
    
    if (simulation) {
        simulation.stop();
    }
}

// Add missing algorithm visualizations
function visualizeDFS() {
    const startVertex = parseInt(document.getElementById('startVertex').value);
    const visited = new Set();
    const stack = [startVertex];
    
    let step = 0;
    const interval = setInterval(() => {
        if (stack.length === 0) {
            clearInterval(interval);
            return;
        }

        const vertex = stack.pop();
        if (visited.has(vertex)) {
            return;
        }
        
        visited.add(vertex);
        const neighbors = currentGraph.links
            .filter(link => link.source.id === vertex)
            .map(link => link.target.id)
            .filter(n => !visited.has(n));
            
        stack.push(...neighbors);

        // Highlight current node
        svg.selectAll('.node')
            .filter(d => d.id === vertex)
            .select('circle')
            .transition()
            .duration(500)
            .style('fill', '#4CAF50');

        // Process neighbors
        neighbors.forEach(neighbor => {
            // Highlight edge and target node
            svg.selectAll('.link-line')
                .filter(d => d.source.id === vertex && d.target.id === neighbor)
                .transition()
                .duration(500)
                .style('stroke', '#2196F3')
                .style('stroke-width', 3);

            svg.selectAll('.node')
                .filter(d => d.id === neighbor)
                .select('circle')
                .transition()
                .duration(500)
                .style('fill', '#FFA726');
        });

        updateStepDescription({
            message: `Step ${++step}: Visiting node ${vertex}, Stack: [${stack.join(', ')}]`,
            visited,
            stack
        });
    }, 1000);
}

function visualizeTopologicalSort() {
    const visited = new Set();
    const stack = [];
    const temp = new Set();
    let step = 0;

    function visit(vertex) {
        if (temp.has(vertex)) {
            throw new Error('Graph contains a cycle');
        }
        if (visited.has(vertex)) return;

        temp.add(vertex);
        
        // Highlight current node as being processed
        svg.selectAll('.node')
            .filter(d => d.id === vertex)
            .select('circle')
            .transition()
            .duration(500)
            .style('fill', '#FFA726');

        const neighbors = currentGraph.links
            .filter(link => link.source.id === vertex)
            .map(link => link.target.id);

        for (const neighbor of neighbors) {
            // Highlight edge being explored
            svg.selectAll('.link-line')
                .filter(d => d.source.id === vertex && d.target.id === neighbor)
                .transition()
                .duration(500)
                .style('stroke', '#2196F3')
                .style('stroke-width', 3);
                
            visit(neighbor);
        }

        temp.delete(vertex);
        visited.add(vertex);
        stack.unshift(vertex);

        // Highlight node as completed
        svg.selectAll('.node')
            .filter(d => d.id === vertex)
            .select('circle')
            .transition()
            .duration(500)
            .style('fill', '#4CAF50');

        updateStepDescription({
            message: `Step ${++step}: Added vertex ${vertex} to topological order. Current order: [${stack.join(' → ')}]`,
            visited,
            order: [...stack]
        });
    }

    try {
        for (const node of currentGraph.nodes) {
            if (!visited.has(node.id)) {
                visit(node.id);
            }
        }
    } catch (error) {
        updateStepDescription({
            message: `Error: ${error.message}`,
            error: true
        });
    }
}

function visualizePrim() {
    const startVertex = parseInt(document.getElementById('startVertex').value);
    const visited = new Set([startVertex]);
    const mst = [];
    let step = 0;

    // Highlight start vertex
    svg.selectAll('.node')
        .filter(d => d.id === startVertex)
        .select('circle')
        .transition()
        .duration(500)
        .style('fill', '#4CAF50');

    const interval = setInterval(() => {
        if (visited.size === currentGraph.nodes.length) {
            clearInterval(interval);
            return;
        }

        let minEdge = null;
        let minWeight = Infinity;

        // Find minimum weight edge
        for (const edge of currentGraph.links) {
            const sourceVisited = visited.has(edge.source.id);
            const targetVisited = visited.has(edge.target.id);

            if (sourceVisited !== targetVisited) {
                if (edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
        }

        if (!minEdge) {
            clearInterval(interval);
            return;
        }

        const newVertex = visited.has(minEdge.source.id) ? minEdge.target.id : minEdge.source.id;
        visited.add(newVertex);
        mst.push(minEdge);

        // Highlight new edge and vertex
        svg.selectAll('.link-line')
            .filter(d => d === minEdge)
            .transition()
            .duration(500)
            .style('stroke', '#2196F3')
            .style('stroke-width', 3);

        svg.selectAll('.node')
            .filter(d => d.id === newVertex)
            .select('circle')
            .transition()
            .duration(500)
            .style('fill', '#4CAF50');

        updateStepDescription({
            message: `Step ${++step}: Added edge (${minEdge.source.id}, ${minEdge.target.id}) with weight ${minEdge.weight}`,
            visited,
            mst: [...mst]
        });
    }, 1000);
}

function pruneAndSearchVertexCover(input, k) {
    const edges = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const [u, v] = line.split(/\s+/).map(Number);
            return [u, v];
        });
    
    const vertices = new Set(edges.flat());
    const originalGraph = {
        nodes: Array.from(vertices).map(id => ({ id })),
        links: edges.map(([u, v]) => ({ source: u, target: v }))
    };
    
    // Find isolated vertices
    const degrees = new Map();
    edges.forEach(([u, v]) => {
        degrees.set(u, (degrees.get(u) || 0) + 1);
        degrees.set(v, (degrees.get(v) || 0) + 1);
    });
    
    const isolatedVertices = Array.from(vertices).filter(v => !degrees.has(v));
    const steps = [];
    
    if (isolatedVertices.length > 0) {
        steps.push(`Removed ${isolatedVertices.length} isolated vertices: ${isolatedVertices.join(', ')}`);
    }
    
    // Find high-degree vertices
    const highDegreeVertices = Array.from(degrees.entries())
        .filter(([_, deg]) => deg > k)
        .map(([v]) => v);
    
    if (highDegreeVertices.length > 0) {
        steps.push(`Found ${highDegreeVertices.length} high-degree vertices: ${highDegreeVertices.join(', ')}`);
    }
    
    // Create reduced graph
    const remainingVertices = new Set(vertices);
    isolatedVertices.forEach(v => remainingVertices.delete(v));
    
    const reducedGraph = {
        nodes: Array.from(remainingVertices).map(id => ({ id })),
        links: edges.filter(([u, v]) => remainingVertices.has(u) && remainingVertices.has(v))
    };
    
    return {
        originalSize: vertices.size,
        kernelSize: remainingVertices.size,
        steps,
        isolatedVertices,
        highDegreeVertices,
        solution: highDegreeVertices.length > k ? 
            'No solution exists' : 
            `Possible solution exists with ${highDegreeVertices.length} mandatory vertices`,
        originalGraph,
        reducedGraph
    };
}

function pruneAndSearchSetCover(input, k) {
    const lines = input.split('\n').map(line => line.trim());
    const sets = new Map();
    let universe = new Set();
    
    // Parse input
    lines.forEach(line => {
        if (line.startsWith('Set')) {
            const [name, elements] = line.split(':');
            const setElements = elements.trim().split(/\s+/).map(Number);
            sets.set(name, new Set(setElements));
        } else if (line.startsWith('Universe')) {
            universe = new Set(line.split(':')[1].trim().split(/\s+/).map(Number));
        }
    });
    
    const steps = [];
    const originalSets = Array.from(sets.entries()).map(([name, elements]) => ({
        name,
        elements: Array.from(elements)
    }));
    
    // Rule 1: Remove redundant sets
    const redundantSets = new Set();
    for (const [set1, elements1] of sets) {
        for (const [set2, elements2] of sets) {
            if (set1 !== set2 && !redundantSets.has(set1) && !redundantSets.has(set2)) {
                if (isSubset(elements1, elements2)) {
                    redundantSets.add(set1);
                    steps.push(`${set1} is contained in ${set2} (redundant)`);
                }
            }
        }
    }
    
    // Rule 2: Essential elements
    const essentialSets = new Set();
    for (const element of universe) {
        const coveringSets = Array.from(sets.entries())
            .filter(([_, elements]) => elements.has(element))
            .map(([name]) => name);
        
        if (coveringSets.length === 1) {
            essentialSets.add(coveringSets[0]);
            steps.push(`${coveringSets[0]} is essential (unique cover for element ${element})`);
        }
    }
    
    // Create reduced sets
    const reducedSets = Array.from(sets.entries())
        .filter(([name]) => !redundantSets.has(name))
        .map(([name, elements]) => ({
            name,
            elements: Array.from(elements),
            isEssential: essentialSets.has(name)
        }));
    
    return {
        originalSize: sets.size,
        kernelSize: sets.size - redundantSets.size,
        steps,
        solution: essentialSets.size > k ?
            'No solution exists' :
            `Possible solution exists with ${essentialSets.size} mandatory sets`,
        originalSets,
        reducedSets
    };
}

function isSubset(set1, set2) {
    for (const element of set1) {
        if (!set2.has(element)) return false;
    }
    return true;
}

// Add visualization for vertex cover graphs
function visualizeVertexCoverGraph(graphData, containerId) {
    const container = document.getElementById(containerId);
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        
    const g = svg.append('g');
    
    // Add zoom behavior
    svg.call(d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => g.attr('transform', event.transform)));
    
    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(50))
        .force('charge', d3.forceManyBody().strength(-200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(20));
    
    // Create links
    const links = g.selectAll('.link')
        .data(graphData.links)
        .enter()
        .append('line')
        .attr('class', 'link-line');
    
    // Create nodes
    const nodes = g.selectAll('.node')
        .data(graphData.nodes)
        .enter()
        .append('g')
        .attr('class', 'node');
    
    nodes.append('circle')
        .attr('r', 15)
        .attr('class', 'node-circle');
    
    nodes.append('text')
        .text(d => d.id)
        .attr('text-anchor', 'middle')
        .attr('dy', '.3em')
        .attr('class', 'node-label');
    
    // Update positions on tick
    simulation.on('tick', () => {
        links
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    return simulation;
}

// Add CSS styles for the new visualizations
const stateSpaceStyles = document.createElement('style');
stateSpaceStyles.textContent = `
    .tree-node circle {
        fill: #fff;
        stroke: #666;
        stroke-width: 2px;
    }

    .tree-node.root circle {
        fill: #4CAF50;
        stroke: #2E7D32;
    }

    .tree-node.solution circle {
        fill: #2196F3;
        stroke: #1976D2;
    }

    .tree-link {
        fill: none;
        stroke: #999;
        stroke-width: 1.5px;
    }

    .node-description {
        font-size: 10px;
        fill: #666;
    }

    .tree-node text {
        font-size: 12px;
        font-family: Arial, sans-serif;
    }
`;
document.head.appendChild(stateSpaceStyles);

function runParameterizedAlgorithm(problemType, input, k) {
    const visualizationDiv = document.getElementById('advancedVisualization');
    const errorDiv = document.getElementById('advancedError');
    
    try {
        let result;
        if (problemType === 'vertex-cover') {
            result = parameterizedVertexCover(input, k);
        } else {
            result = parameterizedSetCover(input, k);
        }
        
        // Create visualization
        visualizationDiv.innerHTML = createParameterizedVisualization(result);
        
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

function runKernelization(problemType, input, k) {
    const visualizationDiv = document.getElementById('advancedVisualization');
    const errorDiv = document.getElementById('advancedError');
    
    try {
        let result;
        if (problemType === 'vertex-cover') {
            result = kernelizeVertexCover(input, k);
        } else {
            result = kernelizeSetCover(input, k);
        }
        
        // Create visualization
        visualizationDiv.innerHTML = createKernelizationVisualization(result);
        
    } catch (error) {
        errorDiv.textContent = error.message;
    }
}

function parameterizedVertexCover(input, k) {
    const edges = input.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            const [u, v] = line.split(/\s+/).map(Number);
            return [u, v];
        });
    
    const vertices = new Set(edges.flat());
    const steps = [];
    let currentK = k;
    let remainingEdges = [...edges];
    let solution = new Set();
    
    // Branch on edges
    while (remainingEdges.length > 0 && currentK > 0) {
        const [u, v] = remainingEdges[0];
        steps.push(`Branching on edge (${u}, ${v})`);
        
        // Try including vertex u
        solution.add(u);
        currentK--;
        remainingEdges = remainingEdges.filter(([a, b]) => a !== u && b !== u);
        steps.push(`Added vertex ${u} to solution, ${currentK} vertices remaining`);
    }
    
    return {
        originalSize: vertices.size,
        parameterK: k,
        currentK: currentK,
        steps,
        solution: Array.from(solution),
        isSolved: remainingEdges.length === 0,
        originalGraph: {
            nodes: Array.from(vertices).map(id => ({ id })),
            links: edges.map(([u, v]) => ({ source: u, target: v }))
        }
    };
}

function parameterizedSetCover(input, k) {
    const lines = input.split('\n').map(line => line.trim());
    const sets = new Map();
    let universe = new Set();
    
    // Parse input
    lines.forEach(line => {
        if (line.startsWith('Set')) {
            const [name, elements] = line.split(':');
            const setElements = elements.trim().split(/\s+/).map(Number);
            sets.set(name, new Set(setElements));
        } else if (line.startsWith('Universe')) {
            universe = new Set(line.split(':')[1].trim().split(/\s+/).map(Number));
        }
    });
    
    const steps = [];
    let currentK = k;
    let remainingElements = new Set(universe);
    let solution = new Set();
    
    // Greedy selection for demonstration
    while (remainingElements.size > 0 && currentK > 0) {
        let bestSet = null;
        let maxCovered = 0;
        
        for (const [setName, elements] of sets) {
            if (solution.has(setName)) continue;
            
            const covered = new Set([...remainingElements].filter(x => elements.has(x))).size;
            if (covered > maxCovered) {
                maxCovered = covered;
                bestSet = setName;
            }
        }
        
        if (!bestSet || maxCovered === 0) break;
        
        solution.add(bestSet);
        currentK--;
        const coveredElements = sets.get(bestSet);
        remainingElements = new Set([...remainingElements].filter(x => !coveredElements.has(x)));
        
        steps.push(`Selected ${bestSet} covering ${maxCovered} elements, ${currentK} sets remaining`);
    }
    
    return {
        originalSize: sets.size,
        parameterK: k,
        currentK: currentK,
        steps,
        solution: Array.from(solution),
        isSolved: remainingElements.size === 0,
        remainingElements: Array.from(remainingElements)
    };
}

function kernelizeVertexCover(input, k) {
    // Similar to pruneAndSearchVertexCover but with more detailed kernelization rules
    const result = pruneAndSearchVertexCover(input, k);
    
    // Add kernelization-specific information
    result.kernelizationRules = [
        "Rule 1: Remove isolated vertices",
        "Rule 2: Include vertices of degree > k in solution",
        "Rule 3: Remove edges covered by high-degree vertices"
    ];
    
    result.kernelBounds = {
        vertices: Math.min(result.kernelSize, k * k),
        edges: Math.min(result.reducedGraph.links.length, k * k)
    };
    
    return result;
}

function kernelizeSetCover(input, k) {
    // Similar to pruneAndSearchSetCover but with more detailed kernelization rules
    const result = pruneAndSearchSetCover(input, k);
    
    // Add kernelization-specific information
    result.kernelizationRules = [
        "Rule 1: Remove redundant sets",
        "Rule 2: Include essential sets in solution",
        "Rule 3: Reduce universe size"
    ];
    
    result.kernelBounds = {
        sets: result.kernelSize,
        elements: result.reducedSets.reduce((acc, set) => acc + set.elements.length, 0)
    };
    
    return result;
}

function createParameterizedVisualization(result) {
    return `
        <div class="paradigm-visualization">
            <div class="problem-stats">
                <div class="stat-card">
                    <div class="stat-title">Parameter k</div>
                    <div class="stat-value">${result.parameterK}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Remaining k</div>
                    <div class="stat-value">${result.currentK}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Status</div>
                    <div class="stat-value ${result.isSolved ? 'success' : 'error'}">
                        ${result.isSolved ? 'Solved' : 'Not Solved'}
                    </div>
                </div>
            </div>
            
            <div class="branching-tree">
                <h4>Branching Steps</h4>
                <div class="timeline">
                    ${result.steps.map((step, index) => `
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h4>Step ${index + 1}</h4>
                                <p>${step}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="solution-panel">
                <h4>Solution</h4>
                <p>Selected elements: ${result.solution.join(', ')}</p>
                ${!result.isSolved ? `
                    <p class="error-message">
                        Could not find solution with parameter k = ${result.parameterK}
                    </p>
                ` : ''}
            </div>
        </div>
    `;
}

function createKernelizationVisualization(result) {
    return `
        <div class="paradigm-visualization">
            <div class="problem-stats">
                <div class="stat-card">
                    <div class="stat-title">Original Size</div>
                    <div class="stat-value">${result.originalSize}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Kernel Size</div>
                    <div class="stat-value">${result.kernelSize}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Reduction</div>
                    <div class="stat-value">
                        ${Math.round((1 - result.kernelSize/result.originalSize) * 100)}%
                    </div>
                </div>
            </div>
            
            <div class="kernelization-rules">
                <h4>Applied Rules</h4>
                <ul>
                    ${result.kernelizationRules.map(rule => `
                        <li>${rule}</li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="kernel-bounds">
                <h4>Kernel Bounds</h4>
                <div class="bounds-info">
                    ${Object.entries(result.kernelBounds).map(([key, value]) => `
                        <div class="bound-item">
                            <span class="bound-label">${key}:</span>
                            <span class="bound-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="solution-panel">
                <h4>Kernelization Result</h4>
                <p>${result.solution}</p>
            </div>
        </div>
    `;
} 