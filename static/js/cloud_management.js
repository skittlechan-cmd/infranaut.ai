// Initialize charts and interactive elements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Fix for fade-in elements - modify CSS directly instead of using classes
    document.querySelectorAll('.fade-in').forEach(el => {
        // Apply visible styles directly
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });

    // Tab switching for dashboard section
    initializeTabs();
    
    // Initialize first chart immediately
    renderCostChart();
    
    // Make expand button interactive
    document.querySelector('.expand-button')?.addEventListener('click', function() {
        const icon = this.querySelector('i');
        const span = this.querySelector('span');
        
        if (icon.classList.contains('fa-chevron-down')) {
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            span.textContent = 'Hide recommendations';
            
            // In a real implementation, this would show all recommendations
            // For this demo, we'll add a couple more instances
            const recommendations = document.querySelector('.instance-recommendations');
            
            const newInstances = [
                {
                    name: 'dev-worker-cluster-02',
                    current: 'm5.xlarge',
                    recommend: 'm5.large',
                    cpu: '15%',
                    memory: '28%',
                    savings: '$130/month'
                },
                {
                    name: 'analytics-worker-01',
                    current: 'r5.2xlarge',
                    recommend: 'r5.xlarge',
                    cpu: '30%',
                    memory: '45%',
                    savings: '$270/month'
                }
            ];
            
            newInstances.forEach(instance => {
                const instanceEl = createInstanceElement(instance);
                recommendations.appendChild(instanceEl);
            });
        } else {
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            span.textContent = 'Show all recommendations';
            
            // Remove the additional instances
            const recommendations = document.querySelector('.instance-recommendations');
            const instances = recommendations.querySelectorAll('.instance-item');
            if (instances.length > 2) {
                for (let i = 2; i < instances.length; i++) {
                    instances[i].remove();
                }
            }
        }
    });
});

// Initialize tab switching functionality
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            // Update active states
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${target}-tab`).classList.add('active');
            
            // Load the appropriate chart
            if (target === 'cost') {
                renderCostChart();
            } else if (target === 'usage') {
                renderUsageChart();
            } else if (target === 'topology') {
                renderTopologyChart();
            }
        });
    });
}

// Create instance element for recommendations
function createInstanceElement(instance) {
    const instanceEl = document.createElement('div');
    instanceEl.className = 'instance-item';
    
    // Make visible immediately, no animations
    instanceEl.style.opacity = '1';
    instanceEl.style.transform = 'translateY(0)';
    
    instanceEl.innerHTML = `
        <div class="instance-name">${instance.name}</div>
        <div class="instance-details">
            <div class="current-type">Current: ${instance.current}</div>
            <div class="recommend-type">Recommend: ${instance.recommend}</div>
        </div>
        <div class="instance-metrics">
            <div class="metric">CPU: ${instance.cpu}</div>
            <div class="metric">Memory: ${instance.memory}</div>
        </div>
        <div class="instance-savings">${instance.savings}</div>
    `;
    
    return instanceEl;
}

// Render Cost Distribution Chart
function renderCostChart() {
    const container = document.getElementById('costChart');
    if (!container) return;
    
    // Skip the loading class to avoid flickering
    // container.classList.add('loading');
    
    // Clear container immediately
    container.innerHTML = '';
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'chart-title';
    title.textContent = 'Monthly Cloud Expenditure by Service Category';
    container.appendChild(title);
    
    // Create subtitle
    const subtitle = document.createElement('p');
    subtitle.style.textAlign = 'center';
    subtitle.style.fontSize = '0.875rem';
    subtitle.style.color = 'var(--text-light)';
    subtitle.style.marginBottom = '2rem';
    subtitle.textContent = 'Bars show percentage of total monthly spend | Trend indicators show month-over-month change';
    container.appendChild(subtitle);
    
    // Cost data
    const costData = [
        { name: 'Compute Resources', value: 35, trend: -5, color: '#FF6C37' },
        { name: 'Storage Services', value: 25, trend: 2, color: '#3B82F6' },
        { name: 'Network Services', value: 15, trend: -2, color: '#8B5CF6' },
        { name: 'Database Services', value: 15, trend: 0, color: '#14B8A6' },
        { name: 'Analytics Services', value: 10, trend: 3, color: '#F59E0B' }
    ];
    
    // Create bar chart container
    const barChart = document.createElement('div');
    barChart.className = 'cost-bar-chart';
    
    // Sort data (largest first)
    costData.sort((a, b) => b.value - a.value);
    
    // Create bars - with full width immediately instead of animating
    costData.forEach((item, index) => {
        const barContainer = document.createElement('div');
        barContainer.style.position = 'relative';
        barContainer.style.height = '2.5rem';
        barContainer.style.marginBottom = '1rem';
        
        const barBackground = document.createElement('div');
        barBackground.style.position = 'absolute';
        barBackground.style.left = '0';
        barBackground.style.top = '0';
        barBackground.style.width = '100%';
        barBackground.style.height = '100%';
        barBackground.style.backgroundColor = '#f1f1f1';
        barBackground.style.borderRadius = '4px';
        
        const bar = document.createElement('div');
        bar.className = 'cost-bar';
        // Set full width immediately instead of animating
        bar.style.width = `${item.value}%`;
        
        const label = document.createElement('div');
        label.className = 'cost-bar-label';
        label.textContent = item.name;
        
        const value = document.createElement('div');
        value.className = 'cost-bar-value';
        value.textContent = `${item.value}%`;
        
        // Add trend indicator
        if (item.trend !== 0) {
            const trend = document.createElement('span');
            trend.className = `cost-trend-indicator ${item.trend < 0 ? 'cost-trend-down' : 'cost-trend-up'}`;
            
            const trendArrow = document.createElement('span');
            trendArrow.textContent = item.trend < 0 ? '↓' : '↑';
            trendArrow.style.marginRight = '0.25rem';
            
            const trendValue = document.createElement('span');
            trendValue.textContent = `${Math.abs(item.trend)}%`;
            
            trend.appendChild(trendArrow);
            trend.appendChild(trendValue);
            value.appendChild(trend);
        }
        
        barContainer.appendChild(barBackground);
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(value);
        barChart.appendChild(barContainer);
    });
    
    container.appendChild(barChart);
    
    // Add footer with total
    const footer = document.createElement('div');
    footer.style.marginTop = '2rem';
    footer.style.textAlign = 'center';
    footer.style.padding = '1rem';
    footer.style.background = 'rgba(255, 108, 55, 0.05)';
    footer.style.borderRadius = '0.5rem';
    footer.style.fontWeight = '600';
    footer.innerHTML = `Total Monthly Cloud Spend: <span style="color: var(--primary-color)">$14,350</span>`;
    container.appendChild(footer);
}

// Render Resource Usage Chart
function renderUsageChart() {
    const container = document.getElementById('usageChart');
    if (!container) return;
    
    // Skip loading class
    // container.classList.add('loading');
    
    // Clear container immediately
    container.innerHTML = '';
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'chart-title';
    title.textContent = 'Current Resource Utilization';
    container.appendChild(title);
    
    // Create subtitle
    const subtitle = document.createElement('p');
    subtitle.style.textAlign = 'center';
    subtitle.style.fontSize = '0.875rem';
    subtitle.style.color = 'var(--text-light)';
    subtitle.style.marginBottom = '2rem';
    subtitle.textContent = 'Gauges show current utilization against thresholds';
    container.appendChild(subtitle);
    
    // Usage data
    const usageData = [
        { name: 'CPU Utilization', value: 68, threshold: 80, icon: 'fas fa-microchip' },
        { name: 'Memory Usage', value: 72, threshold: 85, icon: 'fas fa-memory' },
        { name: 'Storage Used', value: 45, threshold: 90, icon: 'fas fa-database' },
        { name: 'Network Load', value: 62, threshold: 75, icon: 'fas fa-network-wired' }
    ];
    
    // Create gauges container
    const gaugeContainer = document.createElement('div');
    gaugeContainer.className = 'resource-gauge-container';
    
    // Create gauges
    usageData.forEach((item, index) => {
        const { name, value, threshold, icon } = item;
        
        const gaugeWrapper = document.createElement('div');
        gaugeWrapper.style.display = 'flex';
        gaugeWrapper.style.flexDirection = 'column';
        gaugeWrapper.style.alignItems = 'center';
        
        const gauge = document.createElement('div');
        gauge.className = 'resource-gauge';
        
        // Create SVG for gauge
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        // Background circle
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', '60');
        bgCircle.setAttribute('cy', '60');
        bgCircle.setAttribute('r', '54');
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', '#f1f1f1');
        bgCircle.setAttribute('stroke-width', '12');
        
        // Threshold indicator
        const thresholdArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const thresholdAngle = (threshold / 100) * 360;
        const thresholdStartX = 60 + 54 * Math.cos((270 - thresholdAngle) * (Math.PI / 180));
        const thresholdStartY = 60 + 54 * Math.sin((270 - thresholdAngle) * (Math.PI / 180));
        
        thresholdArc.setAttribute('d', `M 60 6 A 54 54 0 0 1 ${thresholdStartX} ${thresholdStartY}`);
        thresholdArc.setAttribute('fill', 'none');
        thresholdArc.setAttribute('stroke', 'rgba(239, 68, 68, 0.2)');
        thresholdArc.setAttribute('stroke-width', '12');
        thresholdArc.setAttribute('stroke-linecap', 'round');
        
        // Value arc
        const valueArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const valueAngle = (value / 100) * 360;
        
        // Determine color based on value vs threshold
        let arcColor;
        if (value < threshold * 0.7) {
            arcColor = '#10B981'; // Green for safe
        } else if (value < threshold * 0.9) {
            arcColor = '#F59E0B'; // Yellow for warning
        } else {
            arcColor = '#EF4444'; // Red for critical
        }
        
        const valueStartX = 60 + 54 * Math.cos((270 - valueAngle) * (Math.PI / 180));
        const valueStartY = 60 + 54 * Math.sin((270 - valueAngle) * (Math.PI / 180));
        
        valueArc.setAttribute('d', `M 60 6 A 54 54 0 0 1 ${valueStartX} ${valueStartY}`);
        valueArc.setAttribute('fill', 'none');
        valueArc.setAttribute('stroke', arcColor);
        valueArc.setAttribute('stroke-width', '12');
        valueArc.setAttribute('stroke-linecap', 'round');
        
        // Set full value immediately - no animation
        valueArc.setAttribute('stroke-dasharray', `${valueAngle} 360`);
        
        // Value text
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', '60');
        valueText.setAttribute('y', '55');
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('font-size', '20');
        valueText.setAttribute('font-weight', 'bold');
        valueText.setAttribute('fill', arcColor);
        valueText.textContent = `${value}%`;
        
        // Icon - using a simpler approach
        const iconEl = document.createElement('i');
        iconEl.className = icon;
        iconEl.style.color = '#6B7280';
        iconEl.style.fontSize = '1.5rem';
        iconEl.style.marginTop = '0.5rem';
        
        svg.appendChild(bgCircle);
        svg.appendChild(thresholdArc);
        svg.appendChild(valueArc);
        svg.appendChild(valueText);
        gauge.appendChild(svg);
        
        // Label
        const label = document.createElement('div');
        label.className = 'gauge-label';
        label.textContent = name;
        
        gaugeWrapper.appendChild(gauge);
        gaugeWrapper.appendChild(iconEl);
        gaugeWrapper.appendChild(label);
        gaugeContainer.appendChild(gaugeWrapper);
    });
    
    container.appendChild(gaugeContainer);
    
    // Add insight section
    const insight = document.createElement('div');
    insight.style.marginTop = '2rem';
    insight.style.padding = '1rem';
    insight.style.backgroundColor = 'rgba(255, 108, 55, 0.1)';
    insight.style.borderRadius = '0.5rem';
    insight.style.textAlign = 'center';
    insight.innerHTML = '<strong>Insight:</strong> Memory usage trending close to threshold. Consider scaling up or optimizing within the next 72 hours.';
    container.appendChild(insight);
}

// Render Cloud Topology Chart
function renderTopologyChart() {
    const container = document.getElementById('topologyChart');
    if (!container) return;
    
    // Skip loading class
    // container.classList.add('loading');
    
    // Clear container immediately
    container.innerHTML = '';
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'chart-title';
    title.textContent = 'Cloud Infrastructure Topology';
    container.appendChild(title);
    
    // Create topology container
    const topologyContainer = document.createElement('div');
    topologyContainer.className = 'topology-container';
    
    // Cloud providers data
    const cloudProviders = [
        {
            name: 'AWS',
            type: 'cloud',
            status: 'active',
            connections: [
                {
                    name: 'Load Balancer',
                    type: 'network',
                    status: 'active',
                    connections: [
                        {
                            name: 'Web Server Cluster',
                            type: 'compute',
                            status: 'active',
                            metrics: {
                                instances: 4,
                                cpu: '68%',
                                memory: '72%'
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'Azure',
            type: 'cloud',
            status: 'warning',
            connections: [
                {
                    name: 'API Gateway',
                    type: 'network',
                    status: 'warning',
                    connections: [
                        {
                            name: 'Application Servers',
                            type: 'compute',
                            status: 'active',
                            metrics: {
                                instances: 2,
                                cpu: '45%',
                                memory: '60%'
                            }
                        }
                    ]
                }
            ]
        }
    ];
    
    // Shared resources
    const sharedResources = {
        name: 'Shared Resources',
        type: 'cloud',
        status: 'active',
        connections: [
            {
                name: 'Managed Database',
                type: 'database',
                status: 'active',
                metrics: {
                    size: '500GB',
                    connections: 120,
                    iops: '1.2K'
                }
            },
            {
                name: 'Storage Cluster',
                type: 'database',
                status: 'active',
                metrics: {
                    size: '2.4TB',
                    objects: '14.5K',
                    throughput: '85MB/s'
                }
            }
        ]
    };
    
    // Render cloud providers
    cloudProviders.forEach(provider => {
        const providerNode = createTopologyNode(provider, 0);
        topologyContainer.appendChild(providerNode);
    });
    
    // Render shared resources
    const sharedNode = createTopologyNode(sharedResources, 0);
    topologyContainer.appendChild(sharedNode);
    
    container.appendChild(topologyContainer);
    
    // Add legend
    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.justifyContent = 'center';
    legend.style.flexWrap = 'wrap';
    legend.style.gap = '1rem';
    legend.style.marginTop = '2rem';
    
    const statusTypes = [
        { name: 'Active', class: 'status-active' },
        { name: 'Warning', class: 'status-warning' },
        { name: 'Inactive', class: 'status-inactive' }
    ];
    
    statusTypes.forEach(status => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.marginRight = '1rem';
        
        const dot = document.createElement('div');
        dot.className = `topology-node-status ${status.class}`;
        dot.style.marginRight = '0.5rem';
        
        const label = document.createElement('span');
        label.textContent = status.name;
        label.style.fontSize = '0.875rem';
        label.style.color = 'var(--text-dark)';
        
        item.appendChild(dot);
        item.appendChild(label);
        legend.appendChild(item);
    });
    
    container.appendChild(legend);
    
    // Add interactive note
    const note = document.createElement('div');
    note.style.marginTop = '1.5rem';
    note.style.fontSize = '0.875rem';
    note.style.textAlign = 'center';
    note.style.color = 'var(--text-light)';
    note.innerHTML = 'Click on any node to view detailed metrics and configuration';
    container.appendChild(note);
    
    // Add click interactions to nodes
    document.querySelectorAll('.topology-node').forEach(node => {
        node.addEventListener('click', function() {
            // Reset all nodes
            document.querySelectorAll('.topology-node').forEach(n => {
                n.style.boxShadow = '';
                n.style.borderLeftWidth = '4px';
            });
            
            // Highlight clicked node
            this.style.boxShadow = '0 0 0 2px var(--primary-color)';
            this.style.borderLeftWidth = '6px';
            
            // Show details panel
            const existingInfo = document.getElementById('node-detail-info');
            if (existingInfo) {
                existingInfo.remove();
            }
            
            const nodeInfo = document.createElement('div');
            nodeInfo.id = 'node-detail-info';
            nodeInfo.style.marginTop = '1rem';
            nodeInfo.style.padding = '1rem';
            nodeInfo.style.backgroundColor = 'white';
            nodeInfo.style.borderRadius = '0.5rem';
            nodeInfo.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            nodeInfo.style.fontSize = '0.875rem';
            nodeInfo.style.textAlign = 'center';
            
            const nodeName = this.querySelector('.topology-node-title').textContent;
            nodeInfo.innerHTML = `<strong>Selected:</strong> ${nodeName} | <span style="color: var(--primary-color)">View detailed metrics & configuration</span>`;
            
            container.appendChild(nodeInfo);
        });
    });
}

// Create topology node
function createTopologyNode(node, level = 0) {
    const nodeContainer = document.createElement('div');
    
    const nodeElement = document.createElement('div');
    nodeElement.className = `topology-node ${node.type}`;
    nodeElement.style.marginLeft = `${level * 1.5}rem`;
    
    // Make nodes visible immediately
    nodeElement.style.opacity = '1';
    nodeElement.style.transform = 'translateY(0)';
    
    // Node header
    const header = document.createElement('div');
    header.className = 'topology-node-header';
    
    // Add icon based on type
    const iconEl = document.createElement('i');
    
    switch(node.type) {
        case 'cloud':
            iconEl.className = 'fas fa-cloud topology-node-icon';
            break;
        case 'network':
            iconEl.className = 'fas fa-network-wired topology-node-icon';
            break;
        case 'compute':
            iconEl.className = 'fas fa-server topology-node-icon';
            break;
        case 'database':
            iconEl.className = 'fas fa-database topology-node-icon';
            break;
        default:
            iconEl.className = 'fas fa-cog topology-node-icon';
    }
    
    header.appendChild(iconEl);
    
    const title = document.createElement('div');
    title.className = 'topology-node-title';
    title.textContent = node.name;
    header.appendChild(title);
    
    const status = document.createElement('div');
    status.className = `topology-node-status status-${node.status}`;
    header.appendChild(status);
    
    nodeElement.appendChild(header);
    
    // Add metrics if available
    if (node.metrics) {
        const metricsEl = document.createElement('div');
        metricsEl.className = 'topology-node-metrics';
        
        for (const [key, value] of Object.entries(node.metrics)) {
            const metricEl = document.createElement('div');
            metricEl.className = 'topology-node-metric';
            
            const metricValue = document.createElement('div');
            metricValue.className = 'metric-value';
            metricValue.textContent = value;
            
            const metricLabel = document.createElement('div');
            metricLabel.className = 'metric-label';
            metricLabel.textContent = key;
            
            metricEl.appendChild(metricValue);
            metricEl.appendChild(metricLabel);
            metricsEl.appendChild(metricEl);
        }
        
        nodeElement.appendChild(metricsEl);
    }
    
    nodeContainer.appendChild(nodeElement);
    
    // Container for child nodes with connection lines
    if (node.connections && node.connections.length > 0) {
        const connectionContainer = document.createElement('div');
        connectionContainer.className = 'topology-connection';
        
        // Add connections
        node.connections.forEach(connection => {
            connectionContainer.appendChild(createTopologyNode(connection, level + 1));
        });
        
        nodeContainer.appendChild(connectionContainer);
    }
    
    return nodeContainer;
}