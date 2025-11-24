// Quản lý điểm và trạng thái
let points = [];
let bestPath = null;
let currentAlgorithm = 'ga-asa';
let isRunning = false;

// Canvas setup
const canvas = document.querySelector('.visualization-area');
const canvasElement = document.createElement('canvas');
canvasElement.width = 1100;
canvasElement.height = 500;
canvasElement.style.width = '100%';
canvasElement.style.height = '100%';
canvas.appendChild(canvasElement);

const ctx = canvasElement.getContext('2d');

// Khởi tạo với điểm depot ở giữa
function initialize() {
    points = [{ x: 550, y: 250, id: 0 }];
    draw();
}

// Vẽ điểm và đường đi
function draw() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Vẽ đường đi nếu có
    if (bestPath && bestPath.length > 1) {
        ctx.strokeStyle = '#66BB6A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(points[bestPath[0]].x, points[bestPath[0]].y);
        for (let i = 1; i < bestPath.length; i++) {
            ctx.lineTo(points[bestPath[i]].x, points[bestPath[i]].y);
        }
        ctx.stroke();
        
        // Vẽ mũi tên chỉ hướng
        for (let i = 0; i < bestPath.length - 1; i++) {
            const p1 = points[bestPath[i]];
            const p2 = points[bestPath[i + 1]];
            drawArrow(p1.x, p1.y, p2.x, p2.y);
        }
    }
    
    // Vẽ các điểm
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = index === 0 ? '#EF5350' : '#42A5F5';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Số thứ tự
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index, point.x, point.y);
    });
}

// Vẽ mũi tên
function drawArrow(fromX, fromY, toX, toY) {
    const headlen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    
    ctx.strokeStyle = '#66BB6A';
    ctx.fillStyle = '#66BB6A';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX - headlen * Math.cos(angle - Math.PI / 6), midY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(midX - headlen * Math.cos(angle + Math.PI / 6), midY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}

// Tính khoảng cách
function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Tính tổng quãng đường
function calculatePathDistance(path) {
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
        total += distance(points[path[i]], points[path[i + 1]]);
    }
    return total;
}

// Tạo điểm ngẫu nhiên
function generatePoints() {
    const numPoints = parseInt(document.getElementById('numPoints').value);
    points = [{ x: 550, y: 250, id: 0 }]; // Depot ở giữa
    
    for (let i = 1; i < numPoints; i++) {
        points.push({
            x: 100 + Math.random() * 900,
            y: 50 + Math.random() * 400,
            id: i
        });
    }
    
    bestPath = null;
    draw();
    log('Đã tạo ' + (numPoints - 1) + ' điểm giao hàng');
}

// Logging
function log(message) {
    const logContainer = document.getElementById('logContainer');
    const time = new Date().toLocaleTimeString();
    logContainer.innerHTML += `<div>[${time}] ${message}</div>`;
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ==========================================
// THUẬT TOÁN GA + ASA
// ==========================================

// Tạo cá thể ASA
function createASAIndividual() {
    return {
        temp0: 500 + Math.random() * 500,
        coolingRate: 0.005 + Math.random() * 0.01,
        iterations: parseInt(document.getElementById('asaIterations').value)
    };
}

// ASA - Adaptive Simulated Annealing
function runASA(params) {
    if (points.length < 2) return { path: [], distance: Infinity };
    
    // Tạo solution ngẫu nhiên
    let currentPath = [0];
    const remaining = [...Array(points.length - 1).keys()].map(i => i + 1);
    while (remaining.length > 0) {
        const idx = Math.floor(Math.random() * remaining.length);
        currentPath.push(remaining[idx]);
        remaining.splice(idx, 1);
    }
    currentPath.push(0);
    
    let currentDist = calculatePathDistance(currentPath);
    let bestPath = [...currentPath];
    let bestDist = currentDist;
    
    let temp = params.temp0;
    
    for (let iter = 0; iter < params.iterations; iter++) {
        // Tạo neighbor bằng 2-opt
        const newPath = [...currentPath];
        const i = 1 + Math.floor(Math.random() * (newPath.length - 3));
        const j = i + 1 + Math.floor(Math.random() * (newPath.length - i - 2));
        
        // Reverse segment
        const segment = newPath.slice(i, j + 1).reverse();
        newPath.splice(i, j - i + 1, ...segment);
        
        const newDist = calculatePathDistance(newPath);
        const delta = newDist - currentDist;
        
        // Accept or reject
        if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
            currentPath = newPath;
            currentDist = newDist;
            
            if (currentDist < bestDist) {
                bestPath = [...currentPath];
                bestDist = currentDist;
            }
        }
        
        // Adaptive cooling
        temp = params.temp0 * Math.exp(-params.coolingRate * Math.pow(iter, 1 / 1.5));
        if (temp < 1e-10) temp = 1e-10;
    }
    
    return { path: bestPath, distance: bestDist };
}

// Lai ghép
function crossover(parent1, parent2) {
    return {
        temp0: parent1.temp0,
        coolingRate: parent2.coolingRate,
        iterations: Math.floor((parent1.iterations + parent2.iterations) / 2)
    };
}

// Đột biến
function mutate(individual) {
    if (Math.random() < 0.1) {
        const gene = Math.random();
        if (gene < 0.33) {
            individual.temp0 *= (0.9 + Math.random() * 0.2);
            individual.temp0 = Math.max(400, Math.min(individual.temp0, 1200));
        } else if (gene < 0.66) {
            individual.coolingRate *= (0.8 + Math.random() * 0.4);
            individual.coolingRate = Math.max(0.003, Math.min(individual.coolingRate, 0.02));
        } else {
            individual.iterations = Math.floor(individual.iterations * (0.85 + Math.random() * 0.3));
            individual.iterations = Math.max(500, Math.min(individual.iterations, 5000));
        }
    }
    return individual;
}

// Chạy GA + ASA
async function runGAASA() {
    const populationSize = parseInt(document.getElementById('populationSize').value);
    const generations = parseInt(document.getElementById('generations').value);
    
    log('🧬 Bắt đầu GA + ASA...');
    log(`Quần thể: ${populationSize}, Thế hệ: ${generations}`);
    
    let population = [];
    for (let i = 0; i < populationSize; i++) {
        population.push(createASAIndividual());
    }
    
    let globalBest = { path: null, distance: Infinity, params: null };
    
    for (let gen = 0; gen < generations; gen++) {
        const progress = ((gen + 1) / generations * 100).toFixed(0);
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = `Thế hệ ${gen + 1}/${generations} (${progress}%)`;
        
        log(`--- Thế hệ ${gen + 1} ---`);
        
        const results = [];
        for (let i = 0; i < population.length; i++) {
            const result = runASA(population[i]);
            results.push({ individual: population[i], ...result });
            
            if (result.distance < globalBest.distance) {
                globalBest = { ...result, params: population[i] };
                bestPath = result.path;
                draw();
                log(`✨ Tìm thấy solution tốt hơn: ${(result.distance * 0.01).toFixed(2)} km`);
            }
        }
        
        // Sắp xếp theo fitness
        results.sort((a, b) => a.distance - b.distance);
        
        log(`Tốt nhất thế hệ: ${(results[0].distance * 0.01).toFixed(2)} km`);
        
        // Tạo thế hệ mới
        const newPopulation = [];
        
        // Giữ lại 2 cá thể tốt nhất (Elitism)
        newPopulation.push(results[0].individual);
        if (results.length > 1) {
            newPopulation.push(results[1].individual);
        }
        
        // Lai ghép và đột biến
        while (newPopulation.length < populationSize) {
            const parent1 = results[Math.floor(Math.random() * Math.min(5, results.length))].individual;
            const parent2 = results[Math.floor(Math.random() * Math.min(5, results.length))].individual;
            let child = crossover(parent1, parent2);
            child = mutate(child);
            newPopulation.push(child);
        }
        
        population = newPopulation;
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    log(`✅ Hoàn thành! Quãng đường tốt nhất: ${(globalBest.distance * 0.01).toFixed(2)} km`);
    
    return globalBest;
}

// ==========================================
// THUẬT TOÁN MULTI-START
// ==========================================

async function runMultiStart() {
    log('🔄 Bắt đầu Multi-Start Greedy...');
    
    let globalBest = { path: null, distance: Infinity };
    const numStarts = points.length;
    
    for (let startIdx = 0; startIdx < points.length; startIdx++) {
        const progress = ((startIdx + 1) / numStarts * 100).toFixed(0);
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = `Điểm xuất phát ${startIdx}/${numStarts - 1} (${progress}%)`;
        
        // Greedy từ điểm xuất phát startIdx
        const path = [startIdx];
        const visited = new Set([startIdx]);
        
        while (path.length < points.length) {
            const current = path[path.length - 1];
            let nearest = -1;
            let minDist = Infinity;
            
            for (let i = 0; i < points.length; i++) {
                if (!visited.has(i)) {
                    const dist = distance(points[current], points[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = i;
                    }
                }
            }
            
            path.push(nearest);
            visited.add(nearest);
        }
        
        // Quay về điểm xuất phát
        path.push(startIdx);
        
        const totalDist = calculatePathDistance(path);
        
        if (totalDist < globalBest.distance) {
            globalBest = { path, distance: totalDist };
            bestPath = path;
            draw();
            log(`✨ Điểm xuất phát ${startIdx} cho kết quả tốt hơn: ${(totalDist * 0.01).toFixed(2)} km`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    log(`✅ Hoàn thành! Quãng đường tốt nhất: ${(globalBest.distance * 0.01).toFixed(2)} km`);
    
    return globalBest;
}

// ==========================================
// THUẬT TOÁN HYBRID (GA+ASA + Multi-Start)
// ==========================================

async function runHybrid() {
    log('🚀 Bắt đầu Hybrid Optimization...');
    
    // Chạy Multi-Start trước
    log('Bước 1: Multi-Start Greedy');
    const multiStartResult = await runMultiStart();
    
    // Chạy GA+ASA với seed từ Multi-Start
    log('Bước 2: GA + ASA từ solution Multi-Start');
    const gaAsaResult = await runGAASA();
    
    const finalBest = gaAsaResult.distance < multiStartResult.distance ? gaAsaResult : multiStartResult;
    bestPath = finalBest.path;
    draw();
    
    log(`✅ Hybrid hoàn thành! Quãng đường cuối: ${(finalBest.distance * 0.01).toFixed(2)} km`);
    
    return finalBest;
}

// ==========================================
// CHẠY TỐI ƯU HÓA - GA+ASA VỚI MULTI-START
// ==========================================

async function runOptimization() {
    if (points.length < 2) {
        log('⚠️ Vui lòng tạo ít nhất 2 điểm!');
        return;
    }
    
    if (isRunning) {
        log('⚠️ Đang chạy thuật toán, vui lòng đợi!');
        return;
    }
    
    isRunning = true;
    document.getElementById('logContainer').innerHTML = '';
    
    const startTime = performance.now();
    
    try {
        // Bước 1: Multi-Start để tạo quần thể ban đầu
        const multiStartCount = parseInt(document.getElementById('multiStartCount').value);
        log(`🔄 Bắt đầu GA + ASA với Multi-Start initialization...`);
        log(`📍 Tạo ${multiStartCount} solution ban đầu bằng Multi-Start Greedy...`);
        
        const initialPopulation = [];
        
        for (let startIdx = 0; startIdx < Math.min(multiStartCount, points.length); startIdx++) {
            // Greedy từ điểm xuất phát startIdx
            const path = [startIdx];
            const visited = new Set([startIdx]);
            
            while (path.length < points.length) {
                const current = path[path.length - 1];
                let nearest = -1;
                let minDist = Infinity;
                
                for (let i = 0; i < points.length; i++) {
                    if (!visited.has(i)) {
                        const dist = distance(points[current], points[i]);
                        if (dist < minDist) {
                            minDist = dist;
                            nearest = i;
                        }
                    }
                }
                
                path.push(nearest);
                visited.add(nearest);
            }
            
            path.push(startIdx); // Quay về điểm xuất phát
            
            const asaParams = {
                temp0: 500 + Math.random() * 500,
                coolingRate: 0.005 + Math.random() * 0.01,
                iterations: parseInt(document.getElementById('asaIterations').value)
            };
            
            initialPopulation.push(asaParams);
            
            const progress = ((startIdx + 1) / multiStartCount * 20).toFixed(0); // 20% cho Multi-Start
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').textContent = `Multi-Start: ${startIdx + 1}/${multiStartCount}`;
        }
        
        log(`✅ Đã tạo ${initialPopulation.length} cá thể khởi đầu`);
        
        // Bước 2: Mở rộng quần thể
        const populationSize = parseInt(document.getElementById('populationSize').value);
        log(`👥 Mở rộng quần thể lên ${populationSize} cá thể...`);
        
        while (initialPopulation.length < populationSize) {
            initialPopulation.push(createASAIndividual());
        }
        
        // Bước 3: Chạy GA + ASA
        const generations = parseInt(document.getElementById('generations').value);
        log(`🧬 Chạy GA + ASA với ${generations} thế hệ...`);
        
        let population = initialPopulation;
        let globalBest = { path: null, distance: Infinity, params: null };
        
        for (let gen = 0; gen < generations; gen++) {
            const progress = (20 + (gen + 1) / generations * 80).toFixed(0); // 20-100%
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').textContent = `Thế hệ ${gen + 1}/${generations} (${progress}%)`;
            
            log(`--- Thế hệ ${gen + 1} ---`);
            
            const results = [];
            for (let i = 0; i < population.length; i++) {
                const result = runASA(population[i]);
                results.push({ individual: population[i], ...result });
                
                if (result.distance < globalBest.distance) {
                    globalBest = { ...result, params: population[i] };
                    bestPath = result.path;
                    draw();
                    log(`✨ Tìm thấy solution tốt hơn: ${(result.distance * 0.01).toFixed(2)} km`);
                }
            }
            
            // Sắp xếp theo fitness
            results.sort((a, b) => a.distance - b.distance);
            log(`Tốt nhất thế hệ: ${(results[0].distance * 0.01).toFixed(2)} km`);
            
            // Tạo thế hệ mới
            const newPopulation = [];
            
            // Elitism: Giữ lại 2 cá thể tốt nhất
            newPopulation.push(results[0].individual);
            if (results.length > 1) {
                newPopulation.push(results[1].individual);
            }
            
            // Lai ghép và đột biến
            while (newPopulation.length < populationSize) {
                const parent1 = results[Math.floor(Math.random() * Math.min(5, results.length))].individual;
                const parent2 = results[Math.floor(Math.random() * Math.min(5, results.length))].individual;
                let child = crossover(parent1, parent2);
                child = mutate(child);
                newPopulation.push(child);
            }
            
            population = newPopulation;
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const endTime = performance.now();
        const execTime = endTime - startTime;
        
        log(`✅ Hoàn thành! Quãng đường tốt nhất: ${(globalBest.distance * 0.01).toFixed(2)} km`);
        log(`⏱️ Thời gian thực thi: ${execTime.toFixed(0)} ms`);
        
        // Hiển thị kết quả
        document.getElementById('algoName').textContent = 'GA-ASA';
        document.getElementById('bestDistance').textContent = (globalBest.distance * 0.01).toFixed(2) + ' km';
        document.getElementById('execTime').textContent = execTime.toFixed(0) + ' ms';
        document.getElementById('iterations').textContent = generations;
        
    } catch (error) {
        log('❌ Lỗi: ' + error.message);
        console.error(error);
    } finally {
        isRunning = false;
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('progressText').textContent = 'Hoàn thành!';
    }
}

// Xóa tất cả
function clearAll() {
    points = [{ x: 550, y: 250, id: 0 }];
    bestPath = null;
    draw();
    document.getElementById('logContainer').innerHTML = 'Đã xóa tất cả điểm';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = 'Sẵn sàng';
    
    // Reset kết quả
    document.getElementById('algoName').textContent = '-';
    document.getElementById('bestDistance').textContent = '-';
    document.getElementById('execTime').textContent = '-';
    document.getElementById('iterations').textContent = '-';
}

// Khởi tạo
initialize();