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

// Khởi tạo
function initialize() {
    points = [];
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
        // Quay về điểm xuất phát
        ctx.lineTo(points[bestPath[0]].x, points[bestPath[0]].y);
        ctx.stroke();
        
        // Vẽ mũi tên chỉ hướng
        for (let i = 0; i < bestPath.length - 1; i++) {
            const p1 = points[bestPath[i]];
            const p2 = points[bestPath[i + 1]];
            drawArrow(p1.x, p1.y, p2.x, p2.y);
        }
        // Mũi tên quay về điểm xuất phát
        if (bestPath.length > 0) {
            const p1 = points[bestPath[bestPath.length - 1]];
            const p2 = points[bestPath[0]];
            drawArrow(p1.x, p1.y, p2.x, p2.y);
        }
    }
    
    // Vẽ các điểm
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#42A5F5';
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
    // Thêm quãng đường quay về điểm xuất phát
    if (path.length > 0) {
        total += distance(points[path[path.length - 1]], points[path[0]]);
    }
    return total;
}

// Tạo điểm ngẫu nhiên
function generatePoints() {
    const numPoints = parseInt(document.getElementById('numPoints').value);
    
    // Kiểm tra giới hạn số điểm
    if (numPoints > 100) {
        log('⚠️ Số điểm không được vượt quá 100!');
        alert('⚠️ Số điểm tối đa là 100!');
        return;
    }
    
    if (numPoints < 2) {
        log('⚠️ Số điểm tối thiểu là 2!');
        alert('⚠️ Số điểm tối thiểu là 2!');
        return;
    }
    
    points = [];
    
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: 100 + Math.random() * 900,
            y: 50 + Math.random() * 400,
            id: i
        });
    }
    
    bestPath = null;
    draw();
    log('Đã tạo ' + numPoints + ' điểm');
}

// Logging
function log(message) {
    const logContainer = document.getElementById('logContainer');
    const time = new Date().toLocaleTimeString();
    logContainer.innerHTML += `<div style="font-size: 16px; line-height: 1.6;">[${time}] ${message}</div>`;
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
    let currentPath = [...Array(points.length).keys()];
    // Xáo trộn mảng
    for (let i = currentPath.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentPath[i], currentPath[j]] = [currentPath[j], currentPath[i]];
    }
    
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
        // ✅ Lấy kích thước quần thể từ input
        const populationSize = parseInt(document.getElementById('populationSize').value);
        const asaIterations = parseInt(document.getElementById('asaIterations').value);
        const generations = parseInt(document.getElementById('generations').value);
        
        // ✅ Kiểm tra validation số vòng lặp
        if (asaIterations > 1500) {
            log(`⚠️ Số vòng lặp ASA (${asaIterations}) không được vượt quá 1500!`);
            alert(`⚠️ Số vòng lặp ASA tối đa là 1500!`);
            isRunning = false;
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Sẵn sàng';
            return;
        }
        
        if (asaIterations < 100) {
            log(`⚠️ Số vòng lặp ASA tối thiểu là 100!`);
            alert(`⚠️ Số vòng lặp ASA tối thiểu là 100!`);
            isRunning = false;
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Sẵn sàng';
            return;
        }
        
        // ✅ Kiểm tra validation số thế hệ
        if (generations > 20) {
            log(`⚠️ Số thế hệ GA (${generations}) không được vượt quá 20!`);
            alert(`⚠️ Số thế hệ GA tối đa là 20!`);
            isRunning = false;
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Sẵn sàng';
            return;
        }
        
        if (generations < 1) {
            log(`⚠️ Số thế hệ GA tối thiểu là 1!`);
            alert(`⚠️ Số thế hệ GA tối thiểu là 1!`);
            isRunning = false;
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Sẵn sàng';
            return;
        }
        
        // ✅ Kiểm tra validation kích thước quần thể
        if (populationSize > points.length) {
            log(`⚠️ Kích thước quần thể (${populationSize}) không được vượt quá số điểm (${points.length})!`);
            alert(`⚠️ Kích thước quần thể không được vượt quá số điểm giao hàng (${points.length})!`);
            isRunning = false;
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Sẵn sàng';
            return;
        }
        
        if (populationSize < 5) {
            log(`⚠️ Kích thước quần thể tối thiểu là 5!`);
            alert(`⚠️ Kích thước quần thể tối thiểu là 5!`);
            isRunning = false;
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressText').textContent = 'Sẵn sàng';
            return;
        }
        
        // ✅ Bước 0: Chạy Greedy thông thường để so sánh
        log(`📊 Chạy thuật toán Tham lam (Greedy) từ điểm đầu tiên...`);
        const greedyStartTime = performance.now();
        const greedyResult = runGreedy();
        const greedyEndTime = performance.now();
        const greedyTime = greedyEndTime - greedyStartTime;
        
        const greedyDistance = greedyResult.distance * 0.01;
        log(`✅ Greedy: ${greedyDistance.toFixed(2)} km (${greedyTime.toFixed(2)} ms)`);
        
        // ✅ Bước 1: Multi-Start Greedy - CHẠY TẤT CẢ CÁ ĐIỂM
        const totalStarts = points.length;
        log(`🔄 Multi-Start Greedy: Tạo ${totalStarts} cá thể từ ${totalStarts} điểm xuất phát...`);
        
        const initialPopulation = [];
        
        for (let startIdx = 0; startIdx < points.length; startIdx++) {
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
            
            path.push(startIdx);
            
            const pathDistance = calculatePathDistance(path);
            
            const individual = {
                startPoint: startIdx,
                path: path,
                distance: pathDistance,
                asaParams: {
                    temp0: 500 + Math.random() * 500,
                    coolingRate: 0.005 + Math.random() * 0.01,
                    iterations: parseInt(document.getElementById('asaIterations').value)
                }
            };
            
            initialPopulation.push(individual);
            
            const progress = ((startIdx + 1) / totalStarts * 15).toFixed(0);
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').textContent = `Multi-Start: ${startIdx + 1}/${totalStarts}`;
        }
        
        // ✅ Sắp xếp và hiển thị tổng quan
        initialPopulation.sort((a, b) => a.distance - b.distance);
        
        const bestMultiStart = initialPopulation[0].distance * 0.01;
        const worstMultiStart = initialPopulation[initialPopulation.length - 1].distance * 0.01;
        
        log(`✅ Multi-Start hoàn thành:`);
        log(`   • Tốt nhất: ${bestMultiStart.toFixed(2)} km (từ điểm ${initialPopulation[0].startPoint})`);
        log(`   • Tệ nhất: ${worstMultiStart.toFixed(2)} km (từ điểm ${initialPopulation[initialPopulation.length - 1].startPoint})`);
        
        // ✅ Hiển thị độ dài TẤT CẢ các cá thể
        log(`📊 Độ dài quãng đường của ${totalStarts} cá thể:`);
        initialPopulation.forEach((ind, idx) => {
            log(`   ${idx + 1}. Điểm ${ind.startPoint}: ${(ind.distance * 0.01).toFixed(2)} km`);
        });
        
        // ✅ LẤY TOP DỰA TRÊN KÍCH THƯỚC QUẦN THỂ
        const selectedPopulation = initialPopulation.slice(0, populationSize);
        
        log(`🎯 Chọn top ${populationSize}/${totalStarts} cá thể tốt nhất để lai ghép`);
        log(`   Khoảng độ dài: ${(selectedPopulation[0].distance * 0.01).toFixed(2)} km → ${(selectedPopulation[selectedPopulation.length - 1].distance * 0.01).toFixed(2)} km`);
        
        // ✅ Bước 2: Genetic Algorithm + ASA
        log(`🧬 Bắt đầu GA + ASA với ${populationSize} cá thể, ${generations} thế hệ...`);
        
        let population = selectedPopulation.map(ind => ind.asaParams);
        let globalBest = { 
            path: initialPopulation[0].path, 
            distance: initialPopulation[0].distance, 
            params: initialPopulation[0].asaParams 
        };
        
        bestPath = globalBest.path;
        draw();
        
        for (let gen = 0; gen < generations; gen++) {
            const progress = (15 + (gen + 1) / generations * 85).toFixed(0);
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').textContent = `Thế hệ ${gen + 1}/${generations} (${progress}%)`;
            
            const results = [];
            for (let i = 0; i < population.length; i++) {
                const result = runASA(population[i]);
                results.push({ individual: population[i], ...result });
                
                if (result.distance < globalBest.distance) {
                    globalBest = { ...result, params: population[i] };
                    bestPath = result.path;
                    draw();
                }
            }
            
            // Sắp xếp theo fitness
            results.sort((a, b) => a.distance - b.distance);
            
            const genBest = results[0].distance * 0.01;
            const genWorst = results[results.length - 1].distance * 0.01;
            const genAvg = (results.reduce((sum, r) => sum + r.distance, 0) / results.length * 0.01);
            const improvement = globalBest.distance < initialPopulation[0].distance;
            
            log(`\n━━━ Thế hệ ${gen + 1}/${generations} ━━━`);
            log(`📊 Tổng quan: Tốt nhất: ${genBest.toFixed(2)} km | Trung bình: ${genAvg.toFixed(2)} km | Tệ nhất: ${genWorst.toFixed(2)} km`);
            log(`📋 Chi tiết ${results.length} cá thể:`);
            
            // Hiển thị chi tiết từng cá thể
            results.forEach((result, idx) => {
                const distKm = (result.distance * 0.01).toFixed(2);
                const temp0 = result.individual.temp0.toFixed(1);
                const cooling = result.individual.coolingRate.toFixed(4);
                const iters = result.individual.iterations;
                const pathPreview = result.path.slice(0, 5).join('→') + (result.path.length > 5 ? '...' : '');
                
                // Thêm icon cho cá thể tốt nhất và tệ nhất
                let icon = '  ';
                if (idx === 0) icon = '🥇';
                else if (idx === 1) icon = '🥈';
                else if (idx === 2) icon = '🥉';
                else if (idx === results.length - 1) icon = '📉';
                
                log(`    Cá thể ${idx + 1}: ${distKm} km | Đường: ${pathPreview}`);
            });
            
            if (improvement) {
                log(`✨ Cải thiện so với Multi-Start!`);
            }
            
            // Tạo thế hệ mới - GIỮ NGUYÊN KÍCH THƯỚC QUẦN THỂ
            const newPopulation = [];
            
            newPopulation.push(results[0].individual);
            if (results.length > 1) {
                newPopulation.push(results[1].individual);
            }
            
            const top50Results = results.slice(0, Math.ceil(results.length * 0.5));
            
            while (newPopulation.length < populationSize) {
                const parent1 = top50Results[Math.floor(Math.random() * top50Results.length)].individual;
                const parent2 = top50Results[Math.floor(Math.random() * top50Results.length)].individual;
                let child = crossover(parent1, parent2);
                child = mutate(child);
                newPopulation.push(child);
            }
            
            population = newPopulation;
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const endTime = performance.now();
        const execTime = endTime - startTime;
        const gaAsaTime = execTime - greedyTime;
        
        // ✅ Tính toán kết quả cuối cùng
        const gaAsaDistance = globalBest.distance * 0.01;
        const improvementPercent = ((greedyDistance - gaAsaDistance) / greedyDistance * 100);
        const reducedDistance = greedyDistance - gaAsaDistance;
        
        log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        log(`✅ HOÀN THÀNH!`);
        log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        log(`📊 Kết quả cuối cùng:`);
        log(`   • Greedy thông thường: ${greedyDistance.toFixed(2)} km`);
        log(`   • GA-ASA (cải tiến): ${gaAsaDistance.toFixed(2)} km`);
        log(`   • Giảm được: ${reducedDistance.toFixed(2)} km (${Math.abs(improvementPercent).toFixed(1)}%)`);
        log(`⏱️ Thời gian thực thi: ${gaAsaTime.toFixed(0)} ms`);
        log(`🧬 Kích thước quần thể: ${populationSize}/${totalStarts} cá thể`);
        log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        // Hiển thị kết quả
        document.getElementById('algoName').textContent = 'GA-ASA';
        document.getElementById('bestDistance').textContent = gaAsaDistance.toFixed(2) + ' km';
        document.getElementById('execTime').textContent = gaAsaTime.toFixed(0) + ' ms';
        document.getElementById('iterations').textContent = generations;
        
        // ✅ Lưu kết quả
        const results = {
            greedy: {
                distance: greedyDistance.toFixed(2) + ' km',
                time: greedyTime.toFixed(2) + ' ms',
                path: greedyResult.path.join(' → ')
            },
            gaAsa: {
                distance: gaAsaDistance.toFixed(2) + ' km',
                time: gaAsaTime.toFixed(0) + ' ms',
                path: globalBest.path.join(' → '),
                improvement: improvementPercent.toFixed(1) + '%',
                reduced: reducedDistance.toFixed(2) + ' km'
            },
            multiStart: {
                totalStarts: totalStarts,
                populationSize: populationSize,
                selected: populationSize,
                bestDistance: bestMultiStart.toFixed(2) + ' km',
                worstDistance: worstMultiStart.toFixed(2) + ' km'
            },
            pointsCount: points.length
        };
        
        localStorage.setItem('improved-results', JSON.stringify(results));
        
    } catch (error) {
        log('❌ Lỗi: ' + error.message);
        console.error(error);
    } finally {
        isRunning = false;
        document.getElementById('progressBar').style.width = '100%';
        document.getElementById('progressText').textContent = 'Hoàn thành!';
    }
}

// ✅ Hàm Greedy thông thường
function runGreedy() {
    if (points.length < 2) return { path: [], distance: Infinity };
    
    // Bắt đầu từ điểm đầu tiên
    const path = [0];
    const visited = new Set([0]);
    
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
        
        if (nearest !== -1) {
            path.push(nearest);
            visited.add(nearest);
        }
    }
    
    const totalDist = calculatePathDistance(path);
    return { path, distance: totalDist };
}

// Xóa tất cả
function clearAll() {
    points = [];
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


