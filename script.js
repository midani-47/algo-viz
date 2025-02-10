// Data structure representing NP-complete problems and their reductions
const npProblems = {
    nodes: [
        { 
            id: "SAT", 
            label: "Boolean Satisfiability (SAT)", 
            description: "Given a boolean formula, is there an assignment that makes it true?", 
            complexity: "NP-complete",
            example: "Formula: (x₁ ∨ x₂) ∧ (¬x₁ ∨ x₃)\nSolution: x₁ = true, x₂ = false, x₃ = true",
            importance: "SAT is one of the first problems proven to be NP-complete (Cook-Levin theorem). Many practical problems in circuit design and automated reasoning reduce to SAT."
        },
        { 
            id: "3SAT", 
            label: "3-SAT", 
            description: "SAT restricted to clauses with exactly 3 literals", 
            complexity: "NP-complete",
            example: "Formula: (x₁ ∨ x₂ ∨ ¬x₃) ∧ (¬x₁ ∨ x₂ ∨ x₄)\nSolution: x₁ = true, x₂ = false, x₃ = false, x₄ = true",
            importance: "3SAT is often used as a starting point for NP-completeness proofs due to its simple structure while maintaining the full power of SAT."
        },
        { 
            id: "CLIQUE", 
            label: "Clique", 
            description: "Does a graph contain a clique of size k?", 
            complexity: "NP-complete",
            example: "Graph with 5 vertices, k = 3\nSolution: Vertices {1,2,3} form a clique",
            importance: "Clique has applications in social network analysis and pattern recognition. It's a fundamental graph theory problem."
        },
        { 
            id: "VERTEX-COVER", 
            label: "Vertex Cover", 
            description: "Is there a vertex cover of size k?", 
            complexity: "NP-complete",
            example: "Graph with 4 vertices, k = 2\nSolution: Vertices {2,3} cover all edges",
            importance: "Vertex Cover has practical applications in network security and resource allocation problems."
        },
        { 
            id: "HAM-CYCLE", 
            label: "Hamiltonian Cycle", 
            description: "Does a graph contain a cycle visiting each vertex exactly once?", 
            complexity: "NP-complete",
            example: "Graph with 4 vertices\nSolution: Path 1→2→3→4→1",
            importance: "Hamiltonian Cycle is closely related to the Traveling Salesman Problem and has applications in logistics and circuit design."
        },
        { 
            id: "TSP", 
            label: "Traveling Salesman", 
            description: "Is there a tour visiting all cities with total cost ≤ k?", 
            complexity: "NP-complete",
            example: "4 cities with distances, k = 10\nSolution: Path A→B→C→D→A with cost 9",
            importance: "TSP is one of the most studied optimization problems with numerous real-world applications in logistics and planning."
        },
        { 
            id: "SUBSET-SUM", 
            label: "Subset Sum", 
            description: "Given a set of integers, is there a subset that sums to exactly k?", 
            complexity: "NP-complete",
            example: "Set {1,3,5,7}, k = 8\nSolution: {3,5} sums to 8",
            importance: "Subset Sum is a simple to state but hard to solve problem, demonstrating that even numerical problems can be NP-complete."
        }
    ],
    links: [
        { 
            source: "SAT", 
            target: "3SAT", 
            description: "Split clauses into 3-literal clauses using additional variables",
            details: "For each clause with n > 3 literals, introduce n-3 new variables to break it into n-2 clauses of size 3. For clauses with < 3 literals, add duplicate literals.",
            complexity: "Linear time reduction"
        },
        { 
            source: "3SAT", 
            target: "CLIQUE", 
            description: "Create graph where literals form cliques of size 3, one from each clause",
            details: "For each clause, create 3 vertices representing its literals. Add edges between compatible literals from different clauses. k equals number of clauses.",
            complexity: "Polynomial time reduction"
        },
        { 
            source: "3SAT", 
            target: "VERTEX-COVER", 
            description: "Create graph where cover corresponds to satisfying assignment",
            details: "Create a vertex for each literal and its negation. Add edges between complementary literals and between literals in the same clause.",
            complexity: "Polynomial time reduction"
        },
        { 
            source: "VERTEX-COVER", 
            target: "HAM-CYCLE", 
            description: "Convert cover to path constraints in a graph",
            details: "Construct gadgets for each vertex and edge in the original graph. The cycle must make choices corresponding to vertex cover selection.",
            complexity: "Polynomial time reduction"
        },
        { 
            source: "HAM-CYCLE", 
            target: "TSP", 
            description: "Add weights to edges (1 for edges in original graph, 2 for others)",
            details: "Use the same graph but assign weight 1 to original edges and weight 2 to added edges. Set k to number of vertices.",
            complexity: "Linear time reduction"
        },
        { 
            source: "3SAT", 
            target: "SUBSET-SUM", 
            description: "Create numbers encoding clause satisfaction constraints",
            details: "Create base-10 numbers where digits encode variable selections. Sum target ensures exactly one literal per clause is true.",
            complexity: "Polynomial time reduction"
        }
    ]
};

// State management
let selectedProblems = new Set();
let currentLayout = 'force';
let zoom = d3.zoom().scaleExtent([0.1, 4]);
let svg, container, simulation;

// Initialize the visualization
function initVisualization() {
    const width = document.getElementById('visualization').clientWidth;
    const height = document.getElementById('visualization').clientHeight;

    // Create SVG container
    svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add zoom behavior
    container = svg.append("g");
    svg.call(zoom.on("zoom", (event) => {
        container.attr("transform", event.transform);
    }));

    // Define arrow marker for directed edges
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 28) // Increased to move arrow away from node
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#666");

    // Initialize all components
    initProblemSelector();
    initSearch();
    initInteractivePanel();
    initLayoutSelector();
    initZoomControls();
    
    // Initial visualization
    updateVisualization();

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        const newWidth = document.getElementById('visualization').clientWidth;
        const newHeight = document.getElementById('visualization').clientHeight;
        svg.attr("width", newWidth).attr("height", newHeight);
        updateVisualization();
    }, 250));
}

// Initialize problem selector checkboxes
function initProblemSelector() {
    const selector = document.getElementById('problemSelector');
    
    // Add Select All button
    const selectAllLabel = document.createElement('label');
    selectAllLabel.className = 'problem-checkbox select-all';
    
    const selectAllInput = document.createElement('input');
    selectAllInput.type = 'checkbox';
    selectAllInput.addEventListener('change', (e) => {
        const checkboxes = selector.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox !== selectAllInput) {
                checkbox.checked = e.target.checked;
                if (e.target.checked) {
                    selectedProblems.add(checkbox.value);
                } else {
                    selectedProblems.delete(checkbox.value);
                }
            }
        });
        updateVisualization();
    });

    selectAllLabel.appendChild(selectAllInput);
    selectAllLabel.appendChild(document.createTextNode('Select All'));
    selector.appendChild(selectAllLabel);
    
    // Add individual problem checkboxes
    npProblems.nodes.forEach(node => {
        const label = document.createElement('label');
        label.className = 'problem-checkbox';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = node.id;
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedProblems.add(node.id);
            } else {
                selectedProblems.delete(node.id);
                // Uncheck Select All if any individual checkbox is unchecked
                const selectAllCheckbox = selector.querySelector('.select-all input');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
            }
            updateVisualization();
        });

        label.appendChild(input);
        label.appendChild(document.createTextNode(node.id));
        selector.appendChild(label);
    });
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterProblems(searchTerm);
    }, 300));
}

// Filter problems based on search term
function filterProblems(searchTerm) {
    const checkboxes = document.querySelectorAll('.problem-checkbox');
    let allVisible = true;
    
    checkboxes.forEach(checkbox => {
        if (checkbox.classList.contains('select-all')) {
            return; // Skip Select All button in filtering
        }
        
        const problemId = checkbox.querySelector('input').value;
        const problem = npProblems.nodes.find(n => n.id === problemId);
        const matches = 
            problem.id.toLowerCase().includes(searchTerm) ||
            problem.label.toLowerCase().includes(searchTerm) ||
            problem.description.toLowerCase().includes(searchTerm) ||
            problem.importance.toLowerCase().includes(searchTerm);
        
        checkbox.style.display = matches ? 'flex' : 'none';
        if (!matches) allVisible = false;
    });
    
    // Show/hide Select All based on whether any problems are visible
    const selectAll = document.querySelector('.select-all');
    if (selectAll) {
        selectAll.style.display = allVisible ? 'flex' : 'none';
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter nodes and links based on selection
function getFilteredData() {
    if (selectedProblems.size === 0) {
        return {
            nodes: npProblems.nodes,
            links: npProblems.links
        };
    }

    const nodes = npProblems.nodes.filter(node => 
        selectedProblems.has(node.id) || 
        npProblems.links.some(link => 
            (selectedProblems.has(link.source) && link.target === node.id) ||
            (selectedProblems.has(link.target) && link.source === node.id)
        )
    );

    const nodeIds = new Set(nodes.map(n => n.id));
    const links = npProblems.links.filter(link => 
        nodeIds.has(link.source) && nodeIds.has(link.target)
    );

    return { nodes, links };
}

// Update visualization based on current state
function updateVisualization() {
    const { nodes, links } = getFilteredData();
    const width = document.getElementById('visualization').clientWidth;
    const height = document.getElementById('visualization').clientHeight;

    // Clear previous visualization
    container.selectAll("*").remove();

    // Create groups for links and nodes to control z-index
    const linksGroup = container.append("g").attr("class", "links-group");
    const nodesGroup = container.append("g").attr("class", "nodes-group");

    // Create links
    const link = linksGroup.selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .on("click", showReductionInfo);

    // Create nodes with enhanced drag behavior
    const node = nodesGroup.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", function(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
                d3.select(this).classed("dragging", true);
            })
            .on("drag", function(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", function(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
                d3.select(this).classed("dragging", false);
            }))
        .on("click", showProblemInfo);

    // Add circles to nodes
    node.append("circle")
        .attr("r", 30)
        .attr("class", d => getNodeClass(d));

    // Add labels to nodes
    node.append("text")
        .text(d => d.id)
        .attr("text-anchor", "middle")
        .attr("dy", 5);

    // Apply layout
    if (currentLayout === 'force') {
        applyForceLayout(nodes, links, width, height);
    } else if (currentLayout === 'hierarchical') {
        applyHierarchicalLayout(nodes, links, width, height);
    } else if (currentLayout === 'circular') {
        applyCircularLayout(nodes, links, width, height);
    }
}

// Layout functions
function applyForceLayout(nodes, links, width, height) {
    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(60))
        .force("x", d3.forceX(width / 2).strength(0.1))
        .force("y", d3.forceY(height / 2).strength(0.1));

    simulation.on("tick", () => {
        nodes.forEach(d => {
            d.x = Math.max(40, Math.min(width - 40, d.x));
            d.y = Math.max(40, Math.min(height - 40, d.y));
        });

        container.selectAll(".link")
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        container.selectAll(".node")
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });
}

function applyHierarchicalLayout(nodes, links, width, height) {
    const levels = {};
    const visited = new Set();

    // Find root nodes (nodes with no incoming edges)
    const hasIncoming = new Set(links.map(l => l.target.id));
    const roots = nodes.filter(n => !hasIncoming.has(n.id));

    // Assign levels through BFS
    let currentLevel = 0;
    let currentNodes = roots;
    while (currentNodes.length > 0) {
        levels[currentLevel] = currentNodes;
        visited.add(...currentNodes.map(n => n.id));
        
        const nextNodes = [];
        currentNodes.forEach(node => {
            const outgoing = links
                .filter(l => l.source.id === node.id)
                .map(l => nodes.find(n => n.id === l.target.id))
                .filter(n => !visited.has(n.id));
            nextNodes.push(...outgoing);
        });
        
        currentNodes = nextNodes;
        currentLevel++;
    }

    // Position nodes
    const levelHeight = height / (Object.keys(levels).length || 1);
    Object.entries(levels).forEach(([level, levelNodes]) => {
        const levelWidth = width / (levelNodes.length + 1);
        levelNodes.forEach((node, i) => {
            node.x = levelWidth * (i + 1);
            node.y = levelHeight * level + levelHeight / 2;
        });
    });

    // Update positions
    container.selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    container.selectAll(".node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    if (simulation) simulation.stop();
}

function applyCircularLayout(nodes, links, width, height) {
    const radius = Math.min(width, height) / 3;
    const angleStep = (2 * Math.PI) / nodes.length;
    const center = { x: width / 2, y: height / 2 };

    nodes.forEach((node, i) => {
        const angle = i * angleStep;
        node.x = center.x + radius * Math.cos(angle);
        node.y = center.y + radius * Math.sin(angle);
    });

    container.selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    container.selectAll(".node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    if (simulation) simulation.stop();
}

// Helper functions
function getNodeClass(node) {
    if (selectedProblems.size === 0) return "";
    return selectedProblems.has(node.id) ? "selected" : "related";
}

function showProblemInfo(event, d) {
    event.stopPropagation(); // Prevent event bubbling
    
    const infoPanel = document.getElementById('infoPanel');
    const content = infoPanel.querySelector('.info-content');
    
    content.innerHTML = `
        <h4>${d.label}</h4>
        <p><strong>Description:</strong> ${d.description}</p>
        <p><strong>Complexity:</strong> ${d.complexity}</p>
        <p><strong>Example:</strong><br>${formatExample(d.example)}</p>
        <p><strong>Importance:</strong> ${d.importance}</p>
        <h5>Related Reductions:</h5>
        <ul>
            ${getRelatedReductions(d.id).map(r => `<li>${r}</li>`).join('')}
        </ul>
    `;
    
    infoPanel.classList.add('active');
    
    // Highlight related nodes and links
    highlightRelatedNodes(d.id);
}

function showReductionInfo(event, d) {
    event.stopPropagation(); // Prevent event bubbling
    
    const infoPanel = document.getElementById('infoPanel');
    const content = infoPanel.querySelector('.info-content');
    
    content.innerHTML = `
        <h4>Reduction: ${d.source.id} → ${d.target.id}</h4>
        <p><strong>Summary:</strong> ${d.description}</p>
        <p><strong>Details:</strong> ${d.details}</p>
        <p><strong>Complexity:</strong> ${d.complexity}</p>
    `;
    
    infoPanel.classList.add('active');
    
    // Highlight the involved nodes and the reduction edge
    highlightReduction(d);
}

function getRelatedReductions(nodeId) {
    const reductions = [];
    npProblems.links.forEach(link => {
        if (link.source === nodeId) {
            reductions.push(`Reduces to ${link.target}: ${link.description}`);
        }
        if (link.target === nodeId) {
            reductions.push(`Reduced from ${link.source}: ${link.description}`);
        }
    });
    return reductions;
}

// Highlight related nodes and their connections
function highlightRelatedNodes(nodeId) {
    // Reset all nodes and links
    container.selectAll(".node circle")
        .classed("selected", false)
        .classed("related", false);
    container.selectAll(".link")
        .classed("highlighted", false);
    
    // Highlight selected node
    container.selectAll(".node")
        .filter(d => d.id === nodeId)
        .select("circle")
        .classed("selected", true);
    
    // Highlight related nodes and links
    const relatedLinks = npProblems.links.filter(l => 
        l.source === nodeId || l.target === nodeId ||
        l.source.id === nodeId || l.target.id === nodeId
    );
    
    relatedLinks.forEach(link => {
        container.selectAll(".node")
            .filter(d => d.id === link.source.id || d.id === link.target.id)
            .select("circle")
            .classed("related", true);
        
        container.selectAll(".link")
            .filter(l => l === link)
            .classed("highlighted", true);
    });
}

// Highlight reduction and involved nodes
function highlightReduction(reduction) {
    // Reset all nodes and links
    container.selectAll(".node circle")
        .classed("selected", false)
        .classed("related", false);
    container.selectAll(".link")
        .classed("highlighted", false);
    
    // Highlight source and target nodes
    container.selectAll(".node")
        .filter(d => d.id === reduction.source.id)
        .select("circle")
        .classed("selected", true);
    
    container.selectAll(".node")
        .filter(d => d.id === reduction.target.id)
        .select("circle")
        .classed("related", true);
    
    // Highlight the reduction edge
    container.selectAll(".link")
        .filter(l => l === reduction)
        .classed("highlighted", true);
}

// Initialize interactive panel
function initInteractivePanel() {
    initProblemExamples();
    initReductionSteps();
}

// Initialize problem examples
function initProblemExamples() {
    const select = document.getElementById('problemSelect');
    const instanceDiv = document.getElementById('problemInstance');
    const inputDiv = document.getElementById('instanceInput');
    const solveButton = document.getElementById('solveInstance');

    // Populate problem select
    npProblems.nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.label;
        select.appendChild(option);
    });

    // Handle problem selection
    select.addEventListener('change', () => {
        const problem = npProblems.nodes.find(n => n.id === select.value);
        if (!problem) {
            instanceDiv.style.display = 'none';
            return;
        }

        instanceDiv.style.display = 'block';
        inputDiv.innerHTML = createProblemInput(problem);
    });

    // Handle solve button
    solveButton.addEventListener('click', () => {
        const problem = npProblems.nodes.find(n => n.id === select.value);
        if (!problem) return;

        const result = solveProblemInstance(problem);
        showSolutionResult(result);
    });
}

// Initialize reduction steps
function initReductionSteps() {
    const select = document.getElementById('reductionSelect');
    const stepsDiv = document.getElementById('reductionSteps');
    const contentDiv = document.getElementById('stepContent');
    const prevButton = document.getElementById('prevStep');
    const nextButton = document.getElementById('nextStep');

    let currentStep = 0;
    let currentReduction = null;

    // Populate reduction select
    npProblems.links.forEach(link => {
        const option = document.createElement('option');
        option.value = `${link.source}-${link.target}`;
        option.textContent = `${link.source} → ${link.target}`;
        select.appendChild(option);
    });

    // Handle reduction selection
    select.addEventListener('change', () => {
        if (!select.value) {
            stepsDiv.style.display = 'none';
            return;
        }

        const [source, target] = select.value.split('-');
        currentReduction = npProblems.links.find(
            l => l.source === source && l.target === target
        );
        
        if (!currentReduction) return;

        currentStep = 0;
        stepsDiv.style.display = 'block';
        updateReductionStep();
    });

    // Handle step navigation
    prevButton.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateReductionStep();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentStep < getReductionSteps(currentReduction).length - 1) {
            currentStep++;
            updateReductionStep();
        }
    });

    function updateReductionStep() {
        if (!currentReduction) return;

        const steps = getReductionSteps(currentReduction);
        contentDiv.innerHTML = steps[currentStep];
        
        prevButton.disabled = currentStep === 0;
        nextButton.disabled = currentStep === steps.length - 1;
    }
}

// Helper function to create problem input interface
function createProblemInput(problem) {
    switch (problem.id) {
        case 'CLIQUE':
            return `
                <div class="problem-input">
                    <p>Enter graph as adjacency matrix (0s and 1s):</p>
                    <p class="input-help">Example: For a graph with 3 vertices:<br>0 1 1<br>1 0 1<br>1 1 0</p>
                    <textarea class="graph-input" rows="5" placeholder="Enter adjacency matrix"></textarea>
                    <p>Enter clique size (k):</p>
                    <input type="number" class="graph-input" placeholder="Enter k" min="1">
                    <div class="input-error"></div>
                </div>
            `;
        case 'VERTEX-COVER':
            return `
                <div class="problem-input">
                    <p>Enter graph as edge list (one edge per line):</p>
                    <p class="input-help">Example:<br>0 1<br>1 2<br>2 0</p>
                    <textarea class="graph-input" rows="5" placeholder="Enter edge list"></textarea>
                    <p>Enter cover size (k):</p>
                    <input type="number" class="graph-input" placeholder="Enter k" min="1">
                    <div class="input-error"></div>
                </div>
            `;
        default:
            return `<p>Interactive input not yet implemented for ${problem.label}</p>`;
    }
}

// Helper function to validate input
function validateInput(problem, inputs) {
    const errorDiv = document.querySelector('.input-error');
    errorDiv.textContent = '';
    
    try {
        switch (problem.id) {
            case 'CLIQUE': {
                const matrixStr = inputs[0].value.trim();
                if (!matrixStr) {
                    throw new Error('Please enter an adjacency matrix');
                }

                // Split into rows and clean up each row
                const matrix = matrixStr.split('\n')
                    .map(row => row.trim())
                    .filter(row => row.length > 0)
                    .map(row => row.split(/\s+/).map(val => parseInt(val, 10)));

                // Basic structure validation
                if (!matrix.length) {
                    throw new Error('Matrix cannot be empty');
                }

                const n = matrix.length;
                if (matrix.some(row => row.length !== n)) {
                    throw new Error('Matrix must be square (same number of rows and columns)');
                }

                // Validate values and symmetry
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        // Check for valid values (0 or 1)
                        if (![0, 1].includes(matrix[i][j])) {
                            throw new Error('Matrix must contain only 0s and 1s');
                        }
                        // Check for no self-loops
                        if (i === j && matrix[i][j] !== 0) {
                            throw new Error('Diagonal elements must be 0 (no self-loops)');
                        }
                        // Check for symmetry
                        if (matrix[i][j] !== matrix[j][i]) {
                            throw new Error('Matrix must be symmetric');
                        }
                    }
                }

                const k = parseInt(inputs[1].value);
                if (isNaN(k) || k < 1 || k > n) {
                    throw new Error(`Clique size k must be between 1 and ${n}`);
                }
                
                return { matrix, k };
            }
            
            case 'VERTEX-COVER': {
                const edgeList = inputs[0].value.trim();
                if (!edgeList) {
                    throw new Error('Please enter at least one edge');
                }
                
                const edges = edgeList.split('\n')
                    .map(edge => {
                        const [u, v] = edge.split(/\s+/).map(Number);
                        if (isNaN(u) || isNaN(v)) {
                            throw new Error('Each edge must contain two numbers');
                        }
                        if (u === v) {
                            throw new Error('Self-loops are not allowed');
                        }
                        return [u, v];
                    });
                
                const k = parseInt(inputs[1].value);
                const vertices = new Set(edges.flat());
                
                if (isNaN(k) || k < 1 || k > vertices.size) {
                    throw new Error(`Cover size k must be between 1 and ${vertices.size}`);
                }
                
                return { edges, k };
            }
            
            default:
                throw new Error('Problem type not implemented');
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        return null;
    }
}

// Update solveProblemInstance to use validation
function solveProblemInstance(problem) {
    const inputs = document.querySelectorAll('.graph-input');
    const validatedInput = validateInput(problem, inputs);
    
    if (!validatedInput) {
        return {
            problem: problem.label,
            result: 'Invalid input',
            steps: ['Please correct the input errors and try again']
        };
    }
    
    let result = { problem: problem.label, result: '', steps: [] };
    
    try {
        switch (problem.id) {
            case 'CLIQUE':
                result = solveClique(validatedInput.matrix, validatedInput.k);
                break;
                
            case 'VERTEX-COVER':
                result = solveVertexCover(validatedInput.edges, validatedInput.k);
                break;
                
            default:
                result.result = 'Solver not implemented for this problem yet';
                result.steps = ['This is a placeholder for future implementation'];
        }
    } catch (error) {
        result.result = 'Error solving problem';
        result.steps = [`An error occurred: ${error.message}`];
    }
    
    return result;
}

// Helper function to solve Clique problem
function solveClique(matrix, k) {
    const n = matrix.length;
    const result = {
        problem: 'Clique',
        result: '',
        steps: []
    };

    // Input validation
    if (!isValidAdjacencyMatrix(matrix)) {
        result.result = 'Invalid adjacency matrix';
        result.steps = ['Matrix must be symmetric and contain only 0s and 1s'];
        return result;
    }

    // Brute force solution for small instances
    const vertices = Array.from({length: n}, (_, i) => i);
    const cliques = findCliques(vertices, matrix);
    const maxClique = cliques.find(clique => clique.length >= k);

    result.steps.push(`1. Analyzing graph with ${n} vertices`);
    result.steps.push(`2. Looking for clique of size ${k}`);
    result.steps.push(`3. Found ${cliques.length} cliques in total`);

    if (maxClique) {
        result.result = `Found clique of size ${maxClique.length}: {${maxClique.join(', ')}}`;
        result.steps.push(`4. Success! Found clique: {${maxClique.join(', ')}}`);
    } else {
        result.result = `No clique of size ${k} exists`;
        result.steps.push(`4. No clique of size ${k} found`);
    }

    return result;
}

// Helper function to solve Vertex Cover problem
function solveVertexCover(edges, k) {
    const result = {
        problem: 'Vertex Cover',
        result: '',
        steps: []
    };

    // Create adjacency list
    const graph = {};
    edges.forEach(([u, v]) => {
        graph[u] = graph[u] || new Set();
        graph[v] = graph[v] || new Set();
        graph[u].add(v);
        graph[v].add(u);
    });

    const vertices = Object.keys(graph).map(Number);
    result.steps.push(`1. Graph has ${vertices.length} vertices and ${edges.length} edges`);

    // Simple greedy approximation
    const cover = findGreedyVertexCover(graph);
    result.steps.push(`2. Finding approximate solution using greedy algorithm`);

    if (cover.length <= k) {
        result.result = `Found vertex cover of size ${cover.length}: {${cover.join(', ')}}`;
        result.steps.push(`3. Success! Found cover: {${cover.join(', ')}}`);
    } else {
        result.result = `No vertex cover of size ${k} found (smallest found: ${cover.length})`;
        result.steps.push(`3. Best cover found has size ${cover.length}: {${cover.join(', ')}}`);
        result.steps.push(`4. Note: This is an approximation, a smaller cover might exist`);
    }

    return result;
}

// Utility functions
function isValidAdjacencyMatrix(matrix) {
    const n = matrix.length;
    return matrix.every((row, i) => 
        row.length === n && 
        row.every(val => val === 0 || val === 1) &&
        row[i] === 0 && // No self-loops
        matrix.every((otherRow, j) => row[j] === matrix[j][i]) // Symmetry
    );
}

function findCliques(vertices, matrix) {
    const cliques = [];
    const n = vertices.length;

    // For small graphs, use brute force to find all cliques
    for (let size = 1; size <= n; size++) {
        const combinations = getCombinations(vertices, size);
        combinations.forEach(combo => {
            if (isClique(combo, matrix)) {
                cliques.push(combo);
            }
        });
    }

    return cliques;
}

function getCombinations(arr, size) {
    if (size === 1) return arr.map(x => [x]);
    const result = [];
    
    for (let i = 0; i <= arr.length - size; i++) {
        const first = arr[i];
        const rest = getCombinations(arr.slice(i + 1), size - 1);
        rest.forEach(combo => result.push([first, ...combo]));
    }
    
    return result;
}

function isClique(vertices, matrix) {
    return vertices.every((v1, i) => 
        vertices.every((v2, j) => 
            i === j || matrix[v1][v2] === 1
        )
    );
}

function findGreedyVertexCover(graph) {
    const cover = new Set();
    const edges = new Set();
    
    // Create set of all edges
    Object.entries(graph).forEach(([u, neighbors]) => {
        u = Number(u);
        neighbors.forEach(v => {
            if (u < v) edges.add(`${u}-${v}`);
        });
    });

    // While there are uncovered edges
    while (edges.size > 0) {
        // Find vertex that covers most uncovered edges
        let bestVertex = null;
        let maxCovered = 0;
        
        Object.keys(graph).forEach(v => {
            v = Number(v);
            if (cover.has(v)) return;
            
            let covered = 0;
            graph[v].forEach(u => {
                const edge = `${Math.min(u,v)}-${Math.max(u,v)}`;
                if (edges.has(edge)) covered++;
            });
            
            if (covered > maxCovered) {
                maxCovered = covered;
                bestVertex = v;
            }
        });
        
        if (bestVertex === null) break;
        
        // Add vertex to cover and remove covered edges
        cover.add(bestVertex);
        graph[bestVertex].forEach(u => {
            const edge = `${Math.min(u,bestVertex)}-${Math.max(u,bestVertex)}`;
            edges.delete(edge);
        });
    }
    
    return Array.from(cover).sort((a, b) => a - b);
}

// Helper function to show solution result
function showSolutionResult(result) {
    const instanceDiv = document.getElementById('problemInstance');
    const resultDiv = document.createElement('div');
    resultDiv.className = 'solution-result';
    resultDiv.innerHTML = `
        <h4>Solution:</h4>
        <p>${result.result}</p>
        <h4>Steps:</h4>
        <ul>
            ${result.steps.map(step => `<li>${step}</li>`).join('')}
        </ul>
    `;

    // Remove any existing result
    const existingResult = instanceDiv.querySelector('.solution-result');
    if (existingResult) {
        existingResult.remove();
    }

    instanceDiv.appendChild(resultDiv);
}

// Helper function to get reduction steps
function getReductionSteps(reduction) {
    // This would be expanded with actual reduction steps
    return [
        `<h4>Step 1: Understanding the Source Problem</h4>
         <p>Starting with ${reduction.source}: ${npProblems.nodes.find(n => n.id === reduction.source).description}</p>`,
        
        `<h4>Step 2: Transformation</h4>
         <p>${reduction.details}</p>`,
        
        `<h4>Step 3: Target Problem</h4>
         <p>Resulting ${reduction.target} instance: ${npProblems.nodes.find(n => n.id === reduction.target).description}</p>`,
        
        `<h4>Complexity Analysis</h4>
         <p>This is a ${reduction.complexity}</p>`
    ];
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initVisualization); 