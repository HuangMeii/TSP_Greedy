// Quản lý điểm và trạng thái
let points = [];
let currentAlgorithm = null;
let animationSpeed = 500;
let isAnimating = false;
let selectedPoint = null;
let currentPath = [];
let currentStep = 0;
let animationInterval = null;
let algorithmResult = null; // ✅ THÊM dòng này

// Thêm biến global (dòng ~10, sau let algorithmResult)
let startPoint = 0; // Điểm bắt đầu mặc định


// Canvas setup
const canvas = document.querySelector('.visualization-area');

// Tạo canvas element thực sự
const canvasElement = document.createElement('canvas');
canvasElement.width = 1400;
canvasElement.height = 600;
canvasElement.style.width = '100%';
canvasElement.style.height = '100%';
canvasElement.style.cursor = 'crosshair';
canvas.appendChild(canvasElement);

const ctx = canvasElement.getContext('2d');

// Tạo nút xóa
const deleteButton = document.createElement('button');
deleteButton.textContent = 'Xóa điểm';
deleteButton.style.cssText = `
    position: absolute;
    background: #f44336;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    display: none;
    z-index: 1000;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
`;
canvas.appendChild(deleteButton);

deleteButton.addEventListener('click', () => {
    if (selectedPoint !== null) {
        points.splice(selectedPoint, 1);
        points.forEach((p, i) => p.id = i);
        
        // Điều chỉnh startPoint nếu cần
        if (startPoint >= points.length) {
            startPoint = 0;
        }
        
        selectedPoint = null;
        deleteButton.style.display = 'none';
        
        updateStartPointSelect();
        drawPoints();
        updateCoordinatesPanel();
    }
});

// Tạo input số lượng
const quantityInput = document.createElement('input');
quantityInput.type = 'number';
quantityInput.min = '1';
quantityInput.max = '20';
quantityInput.value = '5';
quantityInput.style.cssText = `
    width: 100%;
    height: 100%;
    border: 3px solid #FFB6D9;
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
    color: #8B4789;
    background: #FFF0F5;
    box-shadow: 0 3px 10px rgba(255, 182, 193, 0.3);
    outline: none;
    transition: all 0.3s;
`;

// Thêm hiệu ứng focus
quantityInput.addEventListener('focus', () => {
    quantityInput.style.border = '3px solid #FF69B4';
    quantityInput.style.boxShadow = '0 5px 15px rgba(255, 105, 180, 0.5)';
});

quantityInput.addEventListener('blur', () => {
    quantityInput.style.border = '3px solid #FFB6D9';
    quantityInput.style.boxShadow = '0 3px 10px rgba(255, 182, 193, 0.3)';
});

document.querySelector('.quantity-input').appendChild(quantityInput);

// Tạo input số bước để chạy animation
const stepsInput = document.createElement('input');
stepsInput.type = 'number';
stepsInput.min = '1';
stepsInput.max = '100';
stepsInput.value = '1';
stepsInput.style.cssText = `
    width: 100%;
    height: 100%;
    border: 3px solid #DA70D6;
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: #8B008B;
    background: #F0E6FF;
    box-shadow: 0 3px 10px rgba(218, 112, 214, 0.3);
    outline: none;
    transition: all 0.3s;
`;

stepsInput.addEventListener('focus', () => {
    stepsInput.style.border = '3px solid #DA70D6';
    stepsInput.style.boxShadow = '0 5px 15px rgba(218, 112, 214, 0.5)';
});

stepsInput.addEventListener('blur', () => {
    stepsInput.style.border = '3px solid #DA70D6';
    stepsInput.style.boxShadow = '0 3px 10px rgba(218, 112, 214, 0.3)';
});

document.querySelector('.steps-display').innerHTML = '';
document.querySelector('.steps-display').appendChild(stepsInput);

// Cập nhật tiến độ
function updateProgress(current, total) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressIndicator = document.querySelector('.progress-indicator');
    
    const maxWidth = 697;
    const fillWidth = (percentage / 100) * maxWidth;
    
    progressFill.style.width = fillWidth + 'px';
    progressPercentage.textContent = percentage + '%';
    
    const indicatorLeft = 33 + fillWidth - 8;
    const percentageLeft = 33 + fillWidth - 12;
    
    progressIndicator.style.left = indicatorLeft + 'px';
    progressPercentage.style.left = percentageLeft + 'px';
}

// Cập nhật số bước - Bỏ hàm cũ
// function updateSteps(current, total) { ... }

// Chạy thuật toán với animation - SỬA LẠI
async function runAlgorithm(algorithm) {
    if (points.length < 2) {
        alert('⚠️ Vui lòng tạo ít nhất 2 điểm!');
        return;
    }
    
    resetAnimation();
    
    selectedAlgorithm = algorithm;
    // ✅ ĐÚNG - Đo thời gian THUẦN của thuật toán
    const startTime = performance.now(); // Đo TRƯỚC khi chạy
    let result;
    switch (algorithm) {
        case 'greedy':
            result = greedyTSP();
            break;
        case 'exhaustive':
            result = exhaustiveTSP();
            break;
        case 'dynamic':
            result = dynamicTSP();
            break;
    }
    const endTime = performance.now(); // Đo NGAY SAU khi chạy xong
    const executionTime = endTime - startTime;
    
    displayResults(algorithm, result, executionTime);
    
    if (result.path && result.path.length > 0) {
        algorithmResult = result;
        currentPath = result.path;
        currentStep = 0;
        
        // Highlight nút thuật toán đã chọn
        document.querySelectorAll('.algorithm-button').forEach(btn => {
            btn.style.background = '#FFF0F5';
            btn.style.color = '';
        });
        
        if (algorithm === 'greedy') {
            document.querySelector('.greedy-button').style.background = 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)';
            document.querySelector('.greedy-button').style.color = 'white';
        } else if (algorithm === 'exhaustive') {
            document.querySelector('.exhaustive-button').style.background = 'linear-gradient(135deg, #FFDAB9 0%, #FFE4B5 100%)';
            document.querySelector('.exhaustive-button').style.color = 'white';
        } else if (algorithm === 'dynamic') {
            document.querySelector('.dynamic-button').style.background = 'linear-gradient(135deg, #E6E6FA 0%, #F0E6FF 100%)';
            document.querySelector('.dynamic-button').style.color = 'white';
        }
        
        // Chỉ vẽ các điểm, không tự động chạy animation
        drawPoints();
    }
}
// Next step - Chạy theo số bước người dùng nhập - SỬA LẠI
// function nextStep() {
//     // Nếu chưa có thuật toán, tự động chạy Tham lam
//     if (!currentPath || currentPath.length === 0) {
//         if (points.length < 2) {
//             alert('⚠️ Vui lòng tạo ít nhất 2 điểm!');
//             return;
//         }
        
//         runAlgorithm('greedy');
//         return;
//     }
    
//     // ✅ SỬA: Kiểm tra đã hoàn thành chưa (phải vẽ đủ n-1 đoạn)
//     if (currentStep >= currentPath.length - 1) {
//         alert('✅ Đã hoàn thành tất cả các bước!');
//         return;
//     }
    
//     if (animationInterval) {
//         clearInterval(animationInterval);
//         animationInterval = null;
//     }
    
//     const stepsToRun = parseInt(stepsInput.value) || 1;
    
//     for (let i = 0; i < stepsToRun; i++) {
//         // ✅ SỬA: Kiểm tra trong vòng lặp
//         if (currentStep >= currentPath.length - 1) {
//             isAnimating = false;
//             updateProgress(currentPath.length - 1, currentPath.length - 1);
//             alert('✅ Đã hoàn thành tất cả các bước!');
//             break;
//         }
        
//         currentStep++; // ✅ Tăng trước khi vẽ
//         drawPathStep(currentPath, currentStep);
//         updateProgress(currentStep, currentPath.length - 1);
//     }
// }
// Next step - Chạy theo số bước người dùng nhập
// Next step - Chạy theo số bước người dùng nhập
function nextStep() {
    console.log('🔍 nextStep called');
    console.log('currentPath:', currentPath);
    console.log('currentStep:', currentStep);
    console.log('points.length:', points.length);
    
    // Nếu chưa có thuật toán, tự động chạy Tham lam
    if (!currentPath || currentPath.length === 0) {
        console.log('⚠️ No path, checking points...');
        if (points.length < 2) {
            alert('⚠️ Vui lòng tạo ít nhất 2 điểm!');
            return;
        }
        
        console.log('✅ Running greedy algorithm...');
        runAlgorithm('greedy');
        return; // ✅ Dừng ở đây, không vẽ gì
    }
    
    console.log('✅ Path exists, length:', currentPath.length);
    
    // Kiểm tra đã hoàn thành chưa
    if (currentStep >= currentPath.length - 1) {
        alert('✅ Đã hoàn thành tất cả các bước!');
        return;
    }
    
    // Dừng animation nếu đang chạy
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    // Lấy số bước cần chạy
    const stepsToRun = parseInt(stepsInput.value) || 1;
    console.log('Steps to run:', stepsToRun);
    
    // Chạy từng bước
    for (let i = 0; i < stepsToRun; i++) {
        // Kiểm tra trong vòng lặp
        if (currentStep >= currentPath.length - 1) {
            isAnimating = false;
            updateProgress(currentPath.length - 1, currentPath.length - 1);
            alert('✅ Đã hoàn thành tất cả các bước!');
            break;
        }
        
        // ✅ Tăng bước TRƯỚC khi vẽ
        currentStep++;
        console.log('Drawing step:', currentStep, 'from', currentPath[currentStep - 1], 'to', currentPath[currentStep]);
        
        // Vẽ đường đi
        drawPathStep(currentPath, currentStep);
        
        // Cập nhật progress bar
        updateProgress(currentStep, currentPath.length - 1);
    }
    
    console.log('Final currentStep:', currentStep);
}

// Kiểm tra click vào điểm nào
function getClickedPoint(x, y) {
    for (let i = 0; i < points.length; i++) {
        const dist = Math.sqrt(
            Math.pow(x - points[i].x, 2) + 
            Math.pow(y - points[i].y, 2)
        );
        if (dist <= 10) {
            return i;
        }
    }
    return -1;
}

// Vẽ đường đi từng bước
function drawPathStep(path, currentStep) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Vẽ các đường đi đã hoàn thành
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4CAF50';
    ctx.setLineDash([]);
    
    for (let i = 0; i < Math.min(currentStep, path.length - 1); i++) {
        ctx.beginPath();
        ctx.moveTo(points[path[i]].x, points[path[i]].y);
        ctx.lineTo(points[path[i + 1]].x, points[path[i + 1]].y);
        ctx.stroke();
        
        // Vẽ mũi tên
        const angle = Math.atan2(
            points[path[i + 1]].y - points[path[i]].y,
            points[path[i + 1]].x - points[path[i]].x
        );
        const headlen = 12;
        const arrowX = points[path[i + 1]].x;
        const arrowY = points[path[i + 1]].y;
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
            arrowX - headlen * Math.cos(angle - Math.PI / 6),
            arrowY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
            arrowX - headlen * Math.cos(angle + Math.PI / 6),
            arrowY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }
    
    // Vẽ lại các điểm
    drawPoints(false);
    
    // Highlight điểm hiện tại
    if (currentStep > 0 && currentStep <= path.length - 1) {
        const currentPointIndex = path[currentStep - 1];
        if (points[currentPointIndex]) {
            ctx.beginPath();
            ctx.arc(points[currentPointIndex].x, points[currentPointIndex].y, 15, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
}

// Tính khoảng cách Euclidean
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// Tính ma trận khoảng cách
function calculateDistanceMatrix() {
    const n = points.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                matrix[i][j] = distance(points[i], points[j]);
            }
        }
    }
    
    return matrix;
}

// Hiển thị ma trận khoảng cách - SỬA LẠI (BỎ NÚT PHÓNG TO TRONG TABLE)
function displayDistanceMatrix() {
    const matrix = calculateDistanceMatrix();
    const resultsDisplay = document.querySelector('.results-display');
    const zoomBtn = document.getElementById('zoom-matrix-btn');
    
    if (points.length === 0 || points.length === 1) {
        resultsDisplay.innerHTML = '<div style="padding: 20px; text-align: center; color: #999; font-size: 14px;">Cần ít nhất 2 điểm để hiển thị ma trận</div>';
        if (zoomBtn) zoomBtn.style.display = 'none';
        return;
    }
    
    // Hiện/ẩn nút phóng to
    if (zoomBtn) {
        zoomBtn.style.display = points.length > 6 ? 'block' : 'none';
    }
    
    let html = '<div style="padding: 20px;">';
    html += '<div style="overflow: auto; max-height: 215px;">';
    html += '<table style="border-collapse: separate; border-spacing: 0; font-size: 12px; width: 100%; box-shadow: 0 2px 8px rgba(255, 107, 157, 0.1);">';
    
    // Header
    html += '<thead><tr><th style="position: sticky; left: 0; z-index: 3; border: none; padding: 10px 12px; background: linear-gradient(135deg, #FF69B4, #FFB6C1); font-weight: 700; color: white; text-align: center; border-top-left-radius: 8px;">•</th>';
    for (let i = 0; i < points.length; i++) {
        const isLast = i === points.length - 1;
        html += `<th style="position: sticky; top: 0; z-index: 2; border: none; padding: 10px 12px; background: linear-gradient(135deg, #FF69B4, #FFB6C1); font-weight: 700; color: white; text-align: center; ${isLast ? 'border-top-right-radius: 8px;' : ''}">Đ${i}</th>`;
    }
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    for (let i = 0; i < points.length; i++) {
        const isLastRow = i === points.length - 1;
        html += '<tr>';
        html += `<th style="position: sticky; left: 0; z-index: 1; border: none; padding: 10px 12px; background: linear-gradient(135deg, #FFB6C1, #FFC0CB); font-weight: 700; color: white; text-align: center; ${isLastRow ? 'border-bottom-left-radius: 8px;' : ''}">Đ${i}</th>`;
        for (let j = 0; j < points.length; j++) {
            const value = i === j ? '—' : matrix[i][j].toFixed(1);
            const isDiagonal = i === j;
            const isLastCol = j === points.length - 1;
            const bgColor = isDiagonal ? '#FFE4E1' : (i % 2 === 0 ? '#FFFAF0' : '#FFF5F5');
            
            html += `<td style="
                border: none; 
                padding: 10px 12px; 
                text-align: center; 
                background: ${bgColor}; 
                color: ${isDiagonal ? '#999' : '#8B4789'}; 
                font-weight: ${isDiagonal ? '400' : '600'};
                ${isLastRow && isLastCol ? 'border-bottom-right-radius: 8px;' : ''}
            ">${value}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody>';
    
    html += '</table></div></div>';
    resultsDisplay.innerHTML = html;
}

// Hiển thị ma trận phóng to trong modal - SỬA LẠI
function showFullMatrix() {
    const matrix = calculateDistanceMatrix();
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 30px;
    `;
    
    let modalContent = `
        <div style="
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
            box-shadow: 0 10px 40px rgba(255, 105, 180, 0.3);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #FF69B4; margin: 0; font-size: 24px; font-weight: 700;">📊 Ma trận khoảng cách đầy đủ</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="
                    padding: 10px 20px;
                    background: linear-gradient(135deg, #FF4444, #FF6B6B);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    box-shadow: 0 3px 10px rgba(255, 68, 68, 0.3);
                ">✖ Đóng</button>
            </div>
            <div style="overflow: auto;">
                <table style="border-collapse: separate; border-spacing: 0; width: 100%; font-size: 14px; box-shadow: 0 2px 8px rgba(255, 107, 157, 0.1);">
                    <thead><tr><th style="border: none; padding: 12px 15px; background: linear-gradient(135deg, #FF69B4, #FFB6C1); color: white; font-weight: 700; text-align: center; border-top-left-radius: 8px;">•</th>`;
    
    for (let i = 0; i < points.length; i++) {
        const isLast = i === points.length - 1;
        modalContent += `<th style="border: none; padding: 12px 15px; background: linear-gradient(135deg, #FF69B4, #FFB6C1); color: white; font-weight: 700; text-align: center; ${isLast ? 'border-top-right-radius: 8px;' : ''}">Đ${i}</th>`;
    }
    modalContent += '</tr></thead><tbody>';
    
    for (let i = 0; i < points.length; i++) {
        const isLastRow = i === points.length - 1;
        modalContent += '<tr>';
        modalContent += `<th style="border: none; padding: 12px 15px; background: linear-gradient(135deg, #FFB6C1, #FFC0CB); color: white; font-weight: 700; text-align: center; ${isLastRow ? 'border-bottom-left-radius: 8px;' : ''}">Đ${i}</th>`;
        for (let j = 0; j < points.length; j++) {
            const value = i === j ? '—' : matrix[i][j].toFixed(1);
            const isDiagonal = i === j;
            const isLastCol = j === points.length - 1;
            const bgColor = isDiagonal ? '#FFE4E1' : (i % 2 === 0 ? '#FFFAF0' : '#FFF5F5');
            
            modalContent += `<td style="
                border: none; 
                padding: 12px 15px; 
                text-align: center; 
                background: ${bgColor}; 
                color: ${isDiagonal ? '#999' : '#8B4789'}; 
                font-weight: ${isDiagonal ? '400' : '600'};
                ${isLastRow && isLastCol ? 'border-bottom-right-radius: 8px;' : ''}
            ">${value}</td>`;
        }
        modalContent += '</tr>';
    }
    
    modalContent += '</tbody></table></div></div>';
    modal.innerHTML = modalContent;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Hàm hiển thị bảng so sánh kết quả
function showComparisonTable(results) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(139, 69, 137, 0.85); z-index: 10000; 
        display: flex; justify-content: center; align-items: center;
        padding: 20px;
    `;
    
    let html = '<div style="background: linear-gradient(135deg, #FFF0F5, #FFFAF0); padding: 40px; border-radius: 15px; max-width: 900px; max-height: 90%; overflow: auto; box-shadow: 0 10px 40px rgba(255, 107, 157, 0.5);">';
    html += '<h2 style="margin-bottom: 25px; color: #FF6B9D; text-align: center; font-size: 28px;">📊 So Sánh Kết Quả Các Thuật Toán</h2>';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-bottom: 20px;">';
    html += `<tr style="background: linear-gradient(135deg, #FF69B4, #FFB6C1);">
        <th style="padding: 15px; border: 2px solid #FF69B4; color: white; font-weight: bold;">Thuật toán</th>
        <th style="padding: 15px; border: 2px solid #FF69B4; color: white; font-weight: bold;">Đường đi</th>
        <th style="padding: 15px; border: 2px solid #FF69B4; color: white; font-weight: bold;">Khoảng cách</th>
        <th style="padding: 15px; border: 2px solid #FF69B4; color: white; font-weight: bold;">Thời gian</th>
    </tr>`;
    
    const algoNames = { 
        greedy: '🚀 Tham lam', 
        exhaustive: '🔍 Vét cạn', 
        dynamic: '⚡ Quy hoạch động' 
    };
    
    const colors = {
        greedy: '#E8F5E9',
        exhaustive: '#FFF3E0',
        dynamic: '#E3F2FD'
    };
    
    for (const [algo, result] of Object.entries(results)) {
        html += `<tr style="background: ${colors[algo]};">`;
        html += `<td style="padding: 12px; border: 1px solid #FFB6D9; font-weight: bold; color: #8B4789;">${algoNames[algo]}</td>`;
        html += `<td style="padding: 12px; border: 1px solid #FFB6D9; color: #8B4789; font-size: 13px;">${result.path ? result.path.join(' → ') : '-'}</td>`;
        html += `<td style="padding: 12px; border: 1px solid #FFB6D9; color: #FF6B9D; font-weight: bold; text-align: center;">${result.distance ? (result.distance * 0.01).toFixed(1) + ' km' : '-'}</td>`;
        html += `<td style="padding: 12px; border: 1px solid #FFB6D9; color: #FFB347; font-weight: bold; text-align: center;">${result.time.toFixed(2)}ms</td>`;
        html += '</tr>';
    }
    
    html += '</table>';
    
    // Nút điều hướng
    html += '<div style="display: flex; gap: 15px; justify-content: center;">';
    html += '<button style="padding: 12px 24px; background: linear-gradient(135deg, #4CAF50, #66BB6A); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);" onclick="window.location.href=\'conclusion.html\'">📈 Xem Phân Tích Chi Tiết</button>';
    html += '<button style="padding: 12px 24px; background: linear-gradient(135deg, #FF1493, #FF69B4); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 20, 147, 0.4);" onclick="this.closest(\'div\').parentElement.remove()">✖ Đóng</button>';
    html += '</div>';
    html += '</div>';
    
    modal.innerHTML = html;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
}

// Reset animation
function resetAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    currentPath = [];
    currentStep = 0;
    isAnimating = false;
    updateProgress(0, 1);
}

// Tạo điểm ngẫu nhiên
function generateRandomPoints(count) {
    points = [];
    
    // Tạo các điểm ngẫu nhiên
    for (let i = 0; i < count; i++) {
        points.push({
            x: Math.random() * (canvasElement.width - 40) + 20,
            y: Math.random() * (canvasElement.height - 40) + 20,
            id: i
        });
    }
    
    selectedPoint = null;
    deleteButton.style.display = 'none';
    resetAnimation();
    
    // Cập nhật combobox
    updateStartPointSelect();
    
    drawPoints();
    updateCoordinatesPanel();
}

// Khởi tạo điểm 0 ở trung tâm
function initializeCenter() {
    points = [];
    startPoint = 0;
    updateStartPointSelect();
    drawPoints();
    updateCoordinatesPanel();
}

// Cập nhật combobox điểm bắt đầu
function updateStartPointSelect() {
    const select = document.getElementById('start-point-select');
    if (!select) return;
    
    const currentValue = select.value;
    select.innerHTML = '';
    
    if (points.length === 0) {
        select.innerHTML = '<option value="0">0</option>';
        select.disabled = true;
        startPoint = 0;
        return;
    }
    
    select.disabled = false;
    
    points.forEach((p, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}`;
        if (i === parseInt(currentValue) && i < points.length) {
            option.selected = true;
            startPoint = i;
        }
        select.appendChild(option);
    });
    
    // Nếu điểm cũ không còn, chọn điểm 0
    if (parseInt(currentValue) >= points.length) {
        startPoint = 0;
        select.value = 0;
    }
}

// Thêm event listener cho select (sau updateStartPointSelect)
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('start-point-select');
    if (select) {
        select.addEventListener('change', (e) => {
            startPoint = parseInt(e.target.value);
            console.log('Điểm bắt đầu được chọn:', startPoint);
            
            // Reset animation khi đổi điểm bắt đầu
            resetAnimation();
            
            // Highlight điểm được chọn
            drawPoints();
        });
    }
});

// Cập nhật hàm updateCoordinatesPanel (dòng ~818)
function updateCoordinatesPanel() {
    const panel = document.querySelector('.coordinates-panel');
    panel.innerHTML = '<div style="padding: 15px; overflow-y: auto; max-height: 400px; font-family: monospace;">';
    
    if (points.length === 0) {
        panel.innerHTML += '<div style="color: #999; text-align: center; padding: 20px;">Chưa có điểm nào</div>';
    } else {
        points.forEach((p, i) => {
            const isSelected = i === selectedPoint;
            const isStartPoint = i === startPoint;
            panel.innerHTML += `<div style="color: #000; font-size: 13px; margin-bottom: 8px; padding: 5px; 
                background: ${isSelected ? '#FFC107' : (isStartPoint ? '#E8F5E9' : '#fff')}; 
                border-radius: 4px; border: ${isSelected ? '2px solid #FF5722' : (isStartPoint ? '2px solid #4CAF50' : 'none')};">
                <strong>Điểm ${i}${isStartPoint ? ' 🏁 (Bắt đầu)' : ''}:</strong> (${Math.round(p.x)}, ${Math.round(p.y)})
            </div>`;
        });
    }
    
    panel.innerHTML += '</div>';
    
    displayDistanceMatrix();
}

// Cập nhật hàm drawPoints để highlight điểm bắt đầu (dòng ~590)
function drawPoints(clearCanvas = true) {
    if (clearCanvas) {
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
    
    points.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        
        if (index === selectedPoint) {
            ctx.fillStyle = '#FFC107';
            ctx.strokeStyle = '#FF5722';
            ctx.lineWidth = 3;
        } else if (index === startPoint) {
            // Highlight điểm bắt đầu bằng màu xanh lá
            ctx.fillStyle = '#4CAF50';
            ctx.strokeStyle = '#2E7D32';
            ctx.lineWidth = 3;
        } else {
            ctx.fillStyle = '#2196F3';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
        }
        
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(index, point.x, point.y);
    });
}

// Thuật toán Tham lam (Greedy - Nearest Neighbor)
function greedyTSP() {
    if (points.length < 2) return { path: [], distance: 0 };
    
    const visited = new Array(points.length).fill(false);
    const path = [startPoint]; // Bắt đầu từ điểm được chọn
    visited[startPoint] = true;
    let totalDistance = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
        let current = path[path.length - 1];
        let nearest = -1;
        let minDist = Infinity;
        
        for (let j = 0; j < points.length; j++) {
            if (!visited[j]) {
                let dist = distance(points[current], points[j]);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = j;
                }
            }
        }
        
        if (nearest !== -1) {
            path.push(nearest);
            visited[nearest] = true;
            totalDistance += minDist;
        }
    }
    
    totalDistance += distance(points[path[path.length - 1]], points[startPoint]);
    path.push(startPoint); // Quay về điểm bắt đầu
    
    return { path, distance: totalDistance };
}

// Thuật toán Vét cạn (Brute Force)
function exhaustiveTSP() {
    if (points.length < 2) return { path: [], distance: 0, maxDistance: 0 };
    if (points.length > 10) {
        alert('Vét cạn chỉ khả thi với <= 10 điểm!');
        return { path: [], distance: 0, maxDistance: 0 };
    }
    
    // Lấy tất cả điểm trừ điểm bắt đầu
    const indices = [...Array(points.length).keys()].filter(i => i !== startPoint);
    let minPath = null;
    let minDistance = Infinity;
    let maxDistance = 0;
    
    function permute(arr, start = 0) {
        if (start === arr.length - 1) {
            const fullPath = [startPoint, ...arr, startPoint];
            let dist = 0;
            for (let i = 0; i < fullPath.length - 1; i++) {
                dist += distance(points[fullPath[i]], points[fullPath[i + 1]]);
            }
            if (dist > maxDistance) {
                maxDistance = dist;
            }
            if (dist < minDistance) {
                minDistance = dist;
                minPath = [...fullPath];
            }
            return;
        }
        
        for (let i = start; i < arr.length; i++) {
            [arr[start], arr[i]] = [arr[i], arr[start]];
            permute(arr, start + 1);
            [arr[start], arr[i]] = [arr[i], arr[start]];
        }
    }
    
    permute(indices);
    return { path: minPath, distance: minDistance, maxDistance: maxDistance };
}

// Thuật toán Quy hoạch động (Dynamic Programming)
function dynamicTSP() {
    if (points.length < 2) return { path: [], distance: 0 };
    if (points.length > 15) {
        alert('QHD chỉ khả thi với <= 15 điểm!');
        return { path: [], distance: 0 };
    }
    
    const n = points.length;
    const dp = Array(1 << n).fill(null).map(() => Array(n).fill(Infinity));
    const parent = Array(1 << n).fill(null).map(() => Array(n).fill(-1));
    
    dp[1 << startPoint][startPoint] = 0;
    
    for (let mask = 0; mask < (1 << n); mask++) {
        if (!(mask & (1 << startPoint))) continue;
        
        for (let last = 0; last < n; last++) {
            if (!(mask & (1 << last))) continue;
            if (dp[mask][last] === Infinity) continue;
            
            for (let next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;
                
                const newMask = mask | (1 << next);
                const newDist = dp[mask][last] + distance(points[last], points[next]);
                
                if (newDist < dp[newMask][next]) {
                    dp[newMask][next] = newDist;
                    parent[newMask][next] = last;
                }
            }
        }
    }
    
    const fullMask = (1 << n) - 1;
    let minDist = Infinity;
    let lastNode = -1;
    
    for (let i = 0; i < n; i++) {
        if (i === startPoint) continue;
        const totalDist = dp[fullMask][i] + distance(points[i], points[startPoint]);
        if (totalDist < minDist) {
            minDist = totalDist;
            lastNode = i;
        }
    }
    
    const path = [];
    let mask = fullMask;
    let current = lastNode;
    
    while (current !== -1) {
        path.unshift(current);
        const prev = parent[mask][current];
        mask ^= (1 << current);
        current = prev;
    }
    
    path.push(startPoint);
    
    return { path, distance: minDist };
}

// Hiển thị kết quả
// function displayResults(algorithm, result, time) {
//     saveResults(algorithm, result, time);
    
//     let pathText = '';
//     if (result.path && result.path.length > 0) {
//         if (result.path.length > 10) {
//             const first4 = result.path.slice(0, 4).join(' → ');
//             const last4 = result.path.slice(-4).join(' → ');
//             pathText = `${first4} → ... → ${last4}`;
//         } else {
//             pathText = result.path.join(' → ');
//         }
//     } else {
//         pathText = 'Chưa có đường đi';
//     }
//     document.querySelector('.distance-value').textContent = pathText;
    
//     const distanceInKm = result.distance ? (result.distance * 0.01).toFixed(1) : '0.0';
//     document.querySelector('.total-distance-value').textContent = distanceInKm + ' km';
    
//     // ✅ Hiển thị thời gian với độ chính xác cao cho giá trị nhỏ
//     let timeText;
//     if (time === 0) {
//         timeText = '0ms';
//     } else if (time < 0.1) {
//         timeText = `${time.toFixed(8)}ms`;
//     } else {
//         timeText = `${time.toFixed(1)}ms`;
//     }
//     document.querySelector('.execution-time-value').textContent = timeText;
    
//     // Hiển thị quãng đường dài nhất (chỉ cho thuật toán vét cạn)
//     if (algorithm === 'exhaustive' && result.maxDistance) {
//         const maxDistanceInKm = (result.maxDistance * 0.01).toFixed(1);
//         document.querySelector('.max-distance').textContent = maxDistanceInKm + ' km';
//     } else {
//         document.querySelector('.max-distance').textContent = '0.0 km';
//     }
// }
// Hiển thị kết quả
function displayResults(algorithm, result, time) {
    saveResults(algorithm, result, time);
    
    let pathText = '';
    if (result.path && result.path.length > 0) {
        if (result.path.length > 10) {
            const first4 = result.path.slice(0, 4).join(' → ');
            const last4 = result.path.slice(-4).join(' → ');
            pathText = `${first4} → ... → ${last4}`;
        } else {
            pathText = result.path.join(' → ');
        }
    } else {
        pathText = 'Chưa có đường đi';
    }
    
    // ✅ KIỂM TRA phần tử có tồn tại trước khi gán
    const distanceValueEl = document.querySelector('.distance-value');
    if (distanceValueEl) {
        distanceValueEl.textContent = pathText;
    }
    
    const distanceInKm = result.distance ? (result.distance * 0.01).toFixed(1) : '0.0';
    const totalDistanceEl = document.querySelector('.total-distance-value');
    if (totalDistanceEl) {
        totalDistanceEl.textContent = distanceInKm + ' km';
    }
    
    // ✅ Hiển thị thời gian với độ chính xác cao cho giá trị nhỏ
    let timeText;
    if (time === 0) {
        timeText = '0ms';
    } else if (time < 0.1) {
        timeText = `${time.toFixed(5)}ms`;
    } else {
        timeText = `${time.toFixed(1)}ms`;
    }
    const executionTimeEl = document.querySelector('.execution-time-value');
    if (executionTimeEl) {
        executionTimeEl.textContent = timeText;
    }
    
    // Hiển thị quãng đường dài nhất (chỉ cho thuật toán vét cạn)
    const maxDistanceEl = document.querySelector('.max-distance');
    if (maxDistanceEl) {
        if (algorithm === 'exhaustive' && result.maxDistance) {
            const maxDistanceInKm = (result.maxDistance * 0.01).toFixed(1);
            maxDistanceEl.textContent = maxDistanceInKm + ' km';
        } else {
            maxDistanceEl.textContent = '0.0 km';
        }
    }
}

// Lưu kết quả vào localStorage - ✅ CẬP NHẬT
function saveResults(algorithm, result, time) {
    const results = JSON.parse(localStorage.getItem('tsp-results') || '{}');
    
    // ✅ Định dạng thời gian giống displayResults
    let timeText;
    if (time === 0) {
        timeText = '0ms';
    } else if (time < 0.1) {
        timeText = `${time.toFixed(5)}ms`;
    } else {
        timeText = `${time.toFixed(1)}ms`;
    }
    
    results[algorithm] = {
        path: result.path ? result.path.join(' → ') : '-',
        distance: result.distance ? (result.distance * 0.01).toFixed(1) + ' km' : '-',
        time: timeText,
        timeMs: time || 0,
        points: points.length,
        efficiency: algorithm === 'greedy' ? 'Nhanh' : (algorithm === 'dynamic' ? 'Cân bằng' : 'Chậm'),
        maxDistance: result.maxDistance ? (result.maxDistance * 0.01).toFixed(1) + ' km' : '0.0 km'
    };
    
    localStorage.setItem('tsp-results', JSON.stringify(results));
}

// Animation từng bước
function animatePathStep() {
    if (currentStep > currentPath.length - 1) {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        isAnimating = false;
        updateProgress(currentPath.length - 1, currentPath.length - 1);
        return;
    }
    
    drawPathStep(currentPath, currentStep + 1);
    updateProgress(currentStep, currentPath.length - 1);
    currentStep++;
}

// Chạy thuật toán với animation
async function runAlgorithm(algorithm) {
    if (points.length < 2) {
        alert('⚠️ Vui lòng tạo ít nhất 2 điểm!');
        return;
    }
    
    resetAnimation();
    
    selectedAlgorithm = algorithm;
    // ✅ ĐÚNG - Đo thời gian THUẦN của thuật toán
    const startTime = performance.now(); // Đo TRƯỚC khi chạy
    let result;
    switch (algorithm) {
        case 'greedy':
            result = greedyTSP();
            break;
        case 'exhaustive':
            result = exhaustiveTSP();
            break;
        case 'dynamic':
            result = dynamicTSP();
            break;
    }
    const endTime = performance.now(); // Đo NGAY SAU khi chạy xong
    const executionTime = endTime - startTime;
    
    displayResults(algorithm, result, executionTime);
    
    if (result.path && result.path.length > 0) {
        algorithmResult = result;
        currentPath = result.path;
        currentStep = 0;
        
        // Highlight nút thuật toán đã chọn
        document.querySelectorAll('.algorithm-button').forEach(btn => {
            btn.style.background = '#FFF0F5';
            btn.style.color = '';
        });
        
        if (algorithm === 'greedy') {
            document.querySelector('.greedy-button').style.background = 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)';
            document.querySelector('.greedy-button').style.color = 'white';
        } else if (algorithm === 'exhaustive') {
            document.querySelector('.exhaustive-button').style.background = 'linear-gradient(135deg, #FFDAB9 0%, #FFE4B5 100%)';
            document.querySelector('.exhaustive-button').style.color = 'white';
        } else if (algorithm === 'dynamic') {
            document.querySelector('.dynamic-button').style.background = 'linear-gradient(135deg, #E6E6FA 0%, #F0E6FF 100%)';
            document.querySelector('.dynamic-button').style.color = 'white';
        }
        
        // Chỉ vẽ các điểm, không tự động chạy animation
        drawPoints();
    }
}

// Run all steps - SỬA LẠI HÀM NÀY
function runAllSteps() {
    if (points.length < 2) {
        alert('⚠️ Vui lòng tạo ít nhất 2 điểm!');
        return;
    }
    
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    resetAnimation();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(139, 69, 137, 0.9); z-index: 9999;
        display: flex; justify-content: center; align-items: center;
        flex-direction: column; gap: 20px;
    `;
    loadingDiv.innerHTML = `
        <div style="color: white; font-size: 24px; font-weight: bold;">🔄 Đang chạy tất cả thuật toán...</div>
        <div style="color: #FFB6C1; font-size: 16px;" id="loading-status">Đang khởi tạo...</div>
    `;
    document.body.appendChild(loadingDiv);
    
    const statusDiv = document.getElementById('loading-status');
    
    setTimeout(async () => {
        const algorithms = ['greedy', 'dynamic', 'exhaustive'];
        const results = {};
        let maxDistanceFound = 0;
        
        // ✅ Xóa toàn bộ dữ liệu cũ trước khi chạy
        localStorage.removeItem('tsp-results');
        
        for (const algo of algorithms) {
            const algoName = algo === 'greedy' ? 'Tham lam' : algo === 'dynamic' ? 'Quy hoạch động' : 'Vét cạn';
            statusDiv.textContent = `Đang chạy: ${algoName}...`;
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            let result;
            let skipped = false;
            
            const startTime = performance.now(); 
            
            try {
                switch (algo) {
                    case 'greedy':
                        result = greedyTSP();
                        break;
                    case 'exhaustive':
                        if (points.length > 10) {
                            statusDiv.textContent = `⚠️ Vét cạn bỏ qua (quá nhiều điểm: ${points.length})`;
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            skipped = true;
                            // ✅ KHÔNG lưu kết quả vào results khi bỏ qua
                            break;
                        }
                        result = exhaustiveTSP();
                        if (result.maxDistance) {
                            maxDistanceFound = result.maxDistance;
                        }
                        break;
                    case 'dynamic':
                        if (points.length > 15) {
                            statusDiv.textContent = `⚠️ QHĐ bỏ qua (quá nhiều điểm: ${points.length})`;
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            skipped = true;
                            // ✅ KHÔNG lưu kết quả vào results khi bỏ qua
                            break;
                        }
                        result = dynamicTSP();
                        break;
                }
                
                const endTime = performance.now();
                
                // ✅ Chỉ lưu kết quả nếu KHÔNG bị bỏ qua
                if (!skipped && result && result.path && result.path.length > 0) {
                    results[algo] = {
                        path: result.path,
                        distance: result.distance,
                        time: endTime - startTime,
                        maxDistance: result.maxDistance || 0
                    };
                    
                    saveResults(algo, result, endTime - startTime);
                }
            } catch (error) {
                console.error(`Lỗi khi chạy ${algo}:`, error);
            }
        }
        
        // ✅ Lưu số lượng điểm vào localStorage
        const savedResults = JSON.parse(localStorage.getItem('tsp-results') || '{}');
        savedResults.pointsCount = points.length;
        localStorage.setItem('tsp-results', JSON.stringify(savedResults));
        
        if (maxDistanceFound > 0) {
            const maxDistanceInKm = (maxDistanceFound * 0.01).toFixed(1);
            document.querySelector('.max-distance').textContent = maxDistanceInKm + ' km';
        }
        
        loadingDiv.remove();
        showComparisonTable(results);
    }, 100);
}

// Event listeners cho các nút thuật toán
document.querySelector('.greedy-button').addEventListener('click', () => {
    runAlgorithm('greedy');
});

document.querySelector('.exhaustive-button').addEventListener('click', () => {
    runAlgorithm('exhaustive');
});

document.querySelector('.dynamic-button').addEventListener('click', () => {
    runAlgorithm('dynamic');
});

// ✅ SỬA: Event listener cho nút Next
document.querySelector('.next-button').addEventListener('click', async () => {
    await nextStep();
});

document.querySelector('.run-all-button').addEventListener('click', runAllSteps);

// Khởi tạo - Chỉ có điểm 0 ở trung tâm và highlight nút Tham lam
initializeCenter();
updateProgress(0, 1);

// Highlight nút Tham lam mặc định
document.querySelector('.greedy-button').style.background = 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)';
document.querySelector('.greedy-button').style.color = 'white';

// Reset highlight các nút khi tạo điểm mới
document.querySelector('.random-button').addEventListener('click', () => {
    const count = parseInt(quantityInput.value);
    if (count >= 1 && count <= 20) {
        generateRandomPoints(count);
        
        // Reset về Tham lam mặc định
        document.querySelectorAll('.algorithm-button').forEach(btn => {
            btn.style.background = '#FFF0F5';
            btn.style.color = '';
        });
        
        document.querySelector('.greedy-button').style.background = 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)';
        document.querySelector('.greedy-button').style.color = 'white';
        
        // Reset algorithm
        selectedAlgorithm = 'greedy';
        algorithmResult = null;
        currentPath = [];
        currentStep = 0;
    } else {
        alert('⚠️ Vui lòng nhập số lượng từ 1 đến 20!');
    }
});

// Nút Xóa - Hoàn tác lại đoạn đường vừa vẽ
document.querySelector('.delete-single').addEventListener('click', () => {
    if (!currentPath || currentPath.length === 0) {
        alert('⚠️ Chưa có đường đi nào để xóa!');
        return;
    }
    
    if (currentStep <= 0) {
        alert('⚠️ Không còn bước nào để hoàn tác!');
        return;
    }
    
    const stepsToUndo = parseInt(stepsInput.value) || 1;
    
    for (let i = 0; i < stepsToUndo; i++) {
        if (currentStep <= 0) {
            alert('⚠️ Đã về điểm xuất phát!');
            break;
        }
        currentStep--;
    }
    
    // Vẽ lại đường đi với số bước còn lại
    if (currentStep === 0) {
        // Nếu về đầu thì chỉ vẽ các điểm
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        drawPoints();
        updateProgress(0, currentPath.length - 1);
    } else {
        drawPathStep(currentPath, currentStep);
        updateProgress(currentStep - 1, currentPath.length - 1);
    }
});

// Nút Xóa hết - Xóa toàn bộ đường đi
document.querySelector('.delete-all').addEventListener('click', () => {
    if (!currentPath || currentPath.length === 0) {
        alert('⚠️ Chưa có đường đi nào để xóa!');
        return;
    }
    
    const confirmDelete = confirm('🗑️ Bạn có chắc muốn xóa toàn bộ đường đi?\n\n(Các điểm sẽ được giữ lại)');
    
    if (confirmDelete) {
        // Reset về trạng thái ban đầu nhưng giữ lại các điểm
        currentStep = 0;
        
        // Xóa canvas và vẽ lại chỉ các điểm
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        drawPoints();
        
        // Reset progress bar
        updateProgress(0, 1);
        
        // Reset kết quả hiển thị
        document.querySelector('.distance-value').textContent = 'Chưa có đường đi';
        document.querySelector('.total-distance-value').textContent = '0.0 km';
        document.querySelector('.execution-time-value').textContent = '0.0ms';
        
        // Không xóa currentPath để người dùng vẫn có thể Next tiếp
        alert('✅ Đã xóa toàn bộ đường đi!\n\nBạn có thể click "Next" để vẽ lại từ đầu.');
    }
});

// Nút Xóa tất cả điểm - XÓA TOÀN BỘ CÁC ĐIỂM (chỉ giữ điểm 0)
document.querySelector('.delete-all-points').addEventListener('click', () => {
    if (points.length <= 1) {
        alert('⚠️ Chỉ còn điểm xuất phát (Điểm 0), không thể xóa!');
        return;
    }
    
    const confirmDelete = confirm('🗑️ Bạn có chắc muốn xóa TẤT CẢ các điểm giao hàng?\n\n(Chỉ giữ lại điểm xuất phát - Điểm 0)');
    
    if (confirmDelete) {
        // Reset về chỉ còn điểm 0
        initializeCenter();
        
        // Reset tất cả trạng thái
        currentPath = [];
        currentStep = 0;
        selectedPoint = null;
        deleteButton.style.display = 'none';
        
        // Reset animation
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        isAnimating = false;
        
        // Reset progress bar
        updateProgress(0, 1);
        
        // Reset kết quả hiển thị
        document.querySelector('.distance-value').textContent = 'Chưa có đường đi';
        document.querySelector('.total-distance-value').textContent = '0.0 km';
        document.querySelector('.execution-time-value').textContent = '0.0ms';
        
        // Reset highlight nút về Tham lam mặc định
        document.querySelectorAll('.algorithm-button').forEach(btn => {
            btn.style.background = '#FFF0F5';
            btn.style.color = '';
        });
        
        document.querySelector('.greedy-button').style.background = 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)';
        document.querySelector('.greedy-button').style.color = 'white';
        
        alert('✅ Đã xóa tất cả các điểm giao hàng!\n\nChỉ còn điểm xuất phát (Điểm 0).');
    }
});

// Canvas event listeners - SỬA LẠI PHẦN NÀY
canvasElement.addEventListener('click', (e) => {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    console.log('Click at:', x, y); // Debug
    
    const clickedIndex = getClickedPoint(x, y);
    
    console.log('Clicked index:', clickedIndex); // Debug
    
    if (clickedIndex !== -1) {
        // Click vào điểm có sẵn - hiện nút xóa
        selectedPoint = clickedIndex;
        
        const btnX = e.clientX - rect.left;
        const btnY = e.clientY - rect.top;
        
        deleteButton.style.left = (btnX + 15) + 'px';
        deleteButton.style.top = (btnY - 15) + 'px';
        deleteButton.style.display = 'block';
        
        drawPoints();
    } else {
        // Click vào vùng trống - tạo điểm mới
        selectedPoint = null;
        deleteButton.style.display = 'none';
        
        const newPoint = {
            x: x,
            y: y,
            id: points.length
        };
        points.push(newPoint);
        
        console.log('New point created:', newPoint); // Debug
        
        drawPoints();
        updateCoordinatesPanel();
        
        // Cập nhật combobox
        updateStartPointSelect();
    }
});

// Click ra ngoài để ẩn nút xóa
canvas.addEventListener('mouseleave', () => {
    if (selectedPoint !== null) {
        selectedPoint = null;
        deleteButton.style.display = 'none';
        drawPoints();
    }
});







