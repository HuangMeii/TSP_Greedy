
using System;
using System.Collections.Generic;
using System.Linq;

namespace TSP_Console
{
    class Point
    {
        public int Id { get; set; }
        public double X { get; set; }
        public double Y { get; set; }

        public Point(int id, double x, double y)
        {
            Id = id;
            X = x;
            Y = y;
        }

        public double DistanceTo(Point other)
        {
            return Math.Sqrt(Math.Pow(X - other.X, 2) + Math.Pow(Y - other.Y, 2));
        }

        public override string ToString()
        {
            return $"Điểm {Id}: ({X:F2}, {Y:F2})";
        }
    }

    class TSPSolver
    {
        private List<Point> points;

        public TSPSolver()
        {
            points = new List<Point>();
        }

        public void AddPoint(double x, double y)
        {
            int id = points.Count + 1;
            points.Add(new Point(id, x, y));
            Console.WriteLine($"✓ Đã thêm {points[^1]}");
        }

        public void ClearPoints()
        {
            points.Clear();
            Console.WriteLine("✓ Đã xóa tất cả các điểm");
        }

        public void ShowPoints()
        {
            if (points.Count == 0)
            {
                Console.WriteLine("Chưa có điểm nào!");
                return;
            }

            Console.WriteLine($"\n=== Danh sách {points.Count} điểm ===");
            foreach (var point in points)
            {
                Console.WriteLine(point);
            }
        }

        public void ShowDistanceMatrix()
        {
            try
            {
                if (points.Count == 0)
                {
                    Console.WriteLine("Chưa có điểm nào!");
                    return;
                }

            Console.WriteLine("\n╔═══════════════════════════════════════════════════╗");
            Console.WriteLine("║              MA TRẬN KHOẢNG CÁCH                  ║");
            Console.WriteLine("╚═══════════════════════════════════════════════════╝\n");

            // Header
            Console.Write("      ");
            foreach (var point in points)
            {
                Console.Write($"   Đ{point.Id,-4}");
            }
            Console.WriteLine();
            Console.WriteLine("    " + new string('─', points.Count * 8 + 2));

            // Ma trận
            foreach (var fromPoint in points)
            {
                Console.Write($"Đ{fromPoint.Id,-3} │");
                foreach (var toPoint in points)
                {
                    if (fromPoint.Id == toPoint.Id)
                    {
                        Console.ForegroundColor = ConsoleColor.DarkGray;
                        Console.Write("    -   ");
                        Console.ResetColor();
                    }
                    else
                    {
                        double distance = fromPoint.DistanceTo(toPoint);
                        Console.ForegroundColor = ConsoleColor.Cyan;
                        Console.Write($" {distance,6:F2} ");
                        Console.ResetColor();
                    }
                }
                Console.WriteLine();
            }

                Console.WriteLine("\n✓ Ma trận khoảng cách Euclidean giữa các điểm");
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"✗ Lỗi khi hiển thị ma trận khoảng cách: {ex.Message}");
                Console.ResetColor();
            }
        }

        // public void DrawCanvasWithPath(List<Point> tour)
        // {
        //     if (points.Count == 0 || tour.Count == 0)
        //     {
        //         Console.WriteLine("Chưa có điểm hoặc đường đi!");
        //         return;
        //     }

        //     const int canvasWidth = 80;
        //     const int canvasHeight = 35;

        //     // Tìm min/max để scale
        //     double minX = points.Min(p => p.X);
        //     double maxX = points.Max(p => p.X);
        //     double minY = points.Min(p => p.Y);
        //     double maxY = points.Max(p => p.Y);

        //     double rangeX = maxX - minX;
        //     double rangeY = maxY - minY;
        //     if (rangeX < 1) rangeX = 1;
        //     if (rangeY < 1) rangeY = 1;

        //     // Tạo canvas
        //     char[,] canvas = new char[canvasHeight, canvasWidth];
        //     ConsoleColor[,] colors = new ConsoleColor[canvasHeight, canvasWidth];
            
        //     for (int i = 0; i < canvasHeight; i++)
        //     {
        //         for (int j = 0; j < canvasWidth; j++)
        //         {
        //             canvas[i, j] = ' ';
        //             colors[i, j] = ConsoleColor.DarkGray;
        //         }
        //     }

        //     // Vẽ đường đi
        //     for (int idx = 0; idx < tour.Count; idx++)
        //     {
        //         Point from = tour[idx];
        //         Point to = (idx == tour.Count - 1) ? tour[0] : tour[idx + 1];

        //         int x1 = (int)((from.X - minX) / rangeX * (canvasWidth - 3)) + 1;
        //         int y1 = canvasHeight - 2 - (int)((from.Y - minY) / rangeY * (canvasHeight - 3));
        //         int x2 = (int)((to.X - minX) / rangeX * (canvasWidth - 3)) + 1;
        //         int y2 = canvasHeight - 2 - (int)((to.Y - minY) / rangeY * (canvasHeight - 3));

        //         // Vẽ đường thẳng giữa 2 điểm
        //         DrawLine(canvas, colors, x1, y1, x2, y2);
        //     }

        //     // Vẽ các điểm (sau để đè lên đường)
        //     Dictionary<(int, int), int> pointMap = new Dictionary<(int, int), int>();
        //     foreach (var point in points)
        //     {
        //         int canvasX = (int)((point.X - minX) / rangeX * (canvasWidth - 3)) + 1;
        //         int canvasY = canvasHeight - 2 - (int)((point.Y - minY) / rangeY * (canvasHeight - 3));
                
        //         canvasX = Math.Clamp(canvasX, 0, canvasWidth - 1);
        //         canvasY = Math.Clamp(canvasY, 0, canvasHeight - 1);
                
        //         pointMap[(canvasY, canvasX)] = point.Id;
                
        //         if (point.Id < 10)
        //             canvas[canvasY, canvasX] = (char)('0' + point.Id);
        //         else
        //             canvas[canvasY, canvasX] = '#';
                    
        //         colors[canvasY, canvasX] = ConsoleColor.Yellow;
        //     }

        //     // Hiển thị canvas
        //     Console.WriteLine("\n╔" + new string('═', canvasWidth) + "╗");
        //     for (int i = 0; i < canvasHeight; i++)
        //     {
        //         Console.Write("║");
        //         for (int j = 0; j < canvasWidth; j++)
        //         {
        //             Console.ForegroundColor = colors[i, j];
        //             Console.Write(canvas[i, j]);
        //             Console.ResetColor();
        //         }
        //         Console.WriteLine("║");
        //     }
        //     Console.WriteLine("╚" + new string('═', canvasWidth) + "╝");
        //     Console.WriteLine("\nChú thích: Số màu vàng = điểm, Đường xanh = đường đi");
        // }

        // private void DrawLine(char[,] canvas, ConsoleColor[,] colors, int x1, int y1, int x2, int y2)
        // {
        //     int height = canvas.GetLength(0);
        //     int width = canvas.GetLength(1);

        //     // Bresenham's line algorithm
        //     int dx = Math.Abs(x2 - x1);
        //     int dy = Math.Abs(y2 - y1);
        //     int sx = x1 < x2 ? 1 : -1;
        //     int sy = y1 < y2 ? 1 : -1;
        //     int err = dx - dy;

        //     while (true)
        //     {
        //         if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height)
        //         {
        //             if (canvas[y1, x1] == ' ')
        //             {
        //                 canvas[y1, x1] = '─';
        //                 colors[y1, x1] = ConsoleColor.Cyan;
        //             }
        //         }

        //         if (x1 == x2 && y1 == y2) break;

        //         int e2 = 2 * err;
        //         if (e2 > -dy)
        //         {
        //             err -= dy;
        //             x1 += sx;
        //         }
        //         if (e2 < dx)
        //         {
        //             err += dx;
        //             y1 += sy;
        //         }
        //     }
        // }

        public void GenerateRandomPoints(int count)
        {
            Random rand = new Random();
            points.Clear();
            
            for (int i = 0; i < count; i++)
            {
                double x = rand.NextDouble() * 100;
                double y = rand.NextDouble() * 100;
                points.Add(new Point(i + 1, x, y));
            }
            
            Console.WriteLine($"✓ Đã tạo {count} điểm ngẫu nhiên");
        }

        private (List<Point>, double) CalculateGreedyTour(Point startPoint)
        {
            try
            {
                if (startPoint == null)
                {
                    throw new ArgumentNullException(nameof(startPoint), "Điểm bắt đầu không được null");
                }

                if (points == null || points.Count == 0)
                {
                    throw new InvalidOperationException("Danh sách điểm trống");
                }

                List<Point> tour = new List<Point>();
                HashSet<Point> visited = new HashSet<Point>();
                Point current = startPoint;
                tour.Add(current);
                visited.Add(current);

                double totalDistance = 0;

                while (visited.Count < points.Count)
                {
                    Point? nearest = null;
                    double minDistance = double.MaxValue;

                    foreach (var point in points)
                    {
                        if (!visited.Contains(point))
                        {
                            double distance = current.DistanceTo(point);
                            if (distance < minDistance)
                            {
                                minDistance = distance;
                                nearest = point;
                            }
                        }
                    }

                    if (nearest != null)
                    {
                        tour.Add(nearest);
                        visited.Add(nearest);
                        totalDistance += minDistance;
                        current = nearest;
                    }
                    else
                    {
                        // Không tìm thấy điểm gần nhất (trường hợp bất thường)
                        break;
                    }
                }

                totalDistance += current.DistanceTo(startPoint);
                return (tour, totalDistance);
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"✗ Lỗi trong quá trình tính toán đường đi: {ex.Message}");
                Console.ResetColor();
                // Trả về tour rỗng với khoảng cách vô cực
                return (new List<Point>(), double.MaxValue);
            }
        }

        public void FindBestGreedyRoute()
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n=== TÌM ĐƯỜNG ĐI THAM LAM TỐI ƯU ===");
            Console.WriteLine("Đang thử 5 điểm xuất phát...\n");
            Console.ResetColor();
            
            // Chỉ tính từ điểm đầu tiên
            SolveGreedy(1);
        }

        // QUY HOẠCH ĐỘNG - Held-Karp Algorithm
        public void SolveDynamicProgramming()
        {
            try
            {
                if (points.Count < 2)
                {
                    Console.WriteLine("Cần ít nhất 2 điểm để tính đường đi!");
                    return;
                }

                if (points.Count > 20)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("⚠️ Quy hoạch động chỉ phù hợp với tối đa 20 điểm!");
                    Console.WriteLine("Với số điểm lớn hơn, hãy sử dụng thuật toán Tham lam.");
                    Console.ResetColor();
                    return;
                }

                Console.WriteLine("\n╔════════════════════════════════════════════════════════╗");
                Console.WriteLine("║   QUY HOẠCH ĐỘNG (Dynamic Programming - Held-Karp)     ║");
                Console.WriteLine("╚════════════════════════════════════════════════════════╝");
                Console.WriteLine($"Số điểm: {points.Count}");
                Console.WriteLine("Đang tính toán...\n");

                var startTime = DateTime.Now;

                int n = points.Count;

                // Tính ma trận khoảng cách
                double[,] dist = new double[n, n];
                for (int i = 0; i < n; i++)
                {
                    for (int j = 0; j < n; j++)
                    {
                        dist[i, j] = points[i].DistanceTo(points[j]);
                    }
                }

                // DP table: dp[mask, i] = chi phí tối thiểu để đi qua các thành phố trong mask và kết thúc tại i
                int maxMask = 1 << n; // 2^n
                double[,] dp = new double[maxMask, n];
                int[,] parent = new int[maxMask, n];

                // Khởi tạo tất cả giá trị = vô cực
                for (int mask = 0; mask < maxMask; mask++)
                {
                    for (int i = 0; i < n; i++)
                    {
                        dp[mask, i] = double.MaxValue;
                        parent[mask, i] = -1;
                    }
                }

                // Base case: Bắt đầu từ điểm 0
                dp[1, 0] = 0;

                // Duyệt qua tất cả các subset (bitmask)
                for (int mask = 1; mask < maxMask; mask++)
                {
                    // Kiểm tra xem điểm 0 có trong mask không
                    if ((mask & 1) == 0) continue;

                    // Duyệt qua điểm cuối cùng trong mask
                    for (int last = 0; last < n; last++)
                    {
                        // Nếu điểm 'last' không có trong mask, bỏ qua
                        if ((mask & (1 << last)) == 0) continue;

                        // Nếu chỉ có điểm 0 và last trong mask
                        if (mask == ((1 << last) | 1))
                        {
                            dp[mask, last] = dist[0, last];
                            parent[mask, last] = 0;
                            continue;
                        }

                        // Tính dp[mask][last] bằng cách thử tất cả các điểm trước đó
                        int prevMask = mask ^ (1 << last); // Bỏ điểm 'last' khỏi mask

                        for (int prev = 0; prev < n; prev++)
                        {
                            if ((prevMask & (1 << prev)) == 0) continue;
                            if (dp[prevMask, prev] == double.MaxValue) continue;

                            double newCost = dp[prevMask, prev] + dist[prev, last];
                            if (newCost < dp[mask, last])
                            {
                                dp[mask, last] = newCost;
                                parent[mask, last] = prev;
                            }
                        }
                    }
                }

                // Tìm điểm cuối cùng tốt nhất
                int fullMask = (1 << n) - 1;
                double minCost = double.MaxValue;
                int lastCity = -1;

                for (int i = 1; i < n; i++)
                {
                    if (dp[fullMask, i] == double.MaxValue) continue;
                    double totalCost = dp[fullMask, i] + dist[i, 0];
                    if (totalCost < minCost)
                    {
                        minCost = totalCost;
                        lastCity = i;
                    }
                }

                if (lastCity == -1)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("✗ Không tìm thấy đường đi hợp lệ!");
                    Console.ResetColor();
                    return;
                }

                // Truy vết đường đi
                List<int> path = new List<int>();
                int currentMask = fullMask;
                int curr = lastCity;

                while (curr != -1)
                {
                    path.Add(curr);
                    int prev = parent[currentMask, curr];
                    if (prev != -1)
                    {
                        currentMask ^= (1 << curr);
                    }
                    curr = prev;
                }

                path.Reverse();

                var endTime = DateTime.Now;
                var execTime = (endTime - startTime).TotalMilliseconds;

                // Hiển thị kết quả
                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("\n=== KẾT QUẢ ===");
                Console.Write("Đường đi tối ưu: ");
                
                double totalDistance = 0;
                for (int i = 0; i < path.Count; i++)
                {
                    int pointId = points[path[i]].Id;
                    Console.Write($"{pointId}");
                    
                    if (i < path.Count - 1)
                    {
                        Console.Write(" → ");
                        totalDistance += dist[path[i], path[i + 1]];
                    }
                }
                totalDistance += dist[path[path.Count - 1], path[0]];
                Console.WriteLine($" → {points[path[0]].Id}");

                Console.WriteLine($"\n✓ Tổng khoảng cách tối ưu: {minCost:F2}");
                Console.WriteLine($"✓ Thời gian tính toán: {execTime:F0} ms");
                
                // Phân tích độ phức tạp
                Console.ForegroundColor = ConsoleColor.Cyan;
                Console.WriteLine("\n=== PHÂN TÍCH ĐỘ PHỨC TẠP ===");
                Console.WriteLine($"• Số điểm (n): {n}");
                Console.WriteLine($"• Số subset đã xét: {maxMask:N0} (2^{n})");
                Console.WriteLine($"• Số phép tính: ~{(long)n * n * maxMask:N0}");
                Console.WriteLine($"• Độ phức tạp thời gian: O(n² × 2ⁿ)");
                Console.WriteLine($"• Độ phức tạp không gian: O(n × 2ⁿ)");
                Console.WriteLine($"• Bộ nhớ sử dụng: ~{(maxMask * n * 12.0 / 1024 / 1024):F2} MB");
                
                Console.ResetColor();
            }
            catch (OutOfMemoryException)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("\n✗ Hết bộ nhớ! Số điểm quá lớn cho quy hoạch động.");
                Console.WriteLine("Hãy giảm số điểm xuống hoặc sử dụng thuật toán Tham lam.");
                Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"\n✗ Lỗi khi tính toán: {ex.Message}");
                Console.ResetColor();
            }
        }

        public void SolveGreedy(int startPointId = 1)
        {
            try
            {
                if (points.Count < 2)
                {
                    Console.WriteLine("Cần ít nhất 2 điểm để tính đường đi!");
                    return;
                }

                // Tìm điểm bắt đầu
                Point? startPoint = points.FirstOrDefault(p => p.Id == startPointId);
                if (startPoint == null)
                {
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine($"✗ Không tìm thấy điểm có ID {startPointId}!");
                    Console.WriteLine($"Danh sách ID hợp lệ: 1 đến {points.Count}");
                    Console.ResetColor();
                    return;
                }

                Console.WriteLine($"\n=== THUẬT TOÁN THAM LAM (Greedy/Nearest Neighbor) ===");
            Console.WriteLine($"Điểm bắt đầu: {startPoint}\n");

            List<Point> tour = new List<Point>();
            HashSet<Point> visited = new HashSet<Point>();
            Point current = startPoint;
            tour.Add(current);
            visited.Add(current);

            double totalDistance = 0;

            // Thuật toán tham lam: luôn chọn điểm gần nhất chưa thăm
            while (visited.Count < points.Count)
            {
                Point? nearest = null;
                double minDistance = double.MaxValue;

                // Tìm điểm gần nhất chưa thăm
                foreach (var point in points)
                {
                    if (!visited.Contains(point))
                    {
                        double distance = current.DistanceTo(point);
                        if (distance < minDistance)
                        {
                            minDistance = distance;
                            nearest = point;
                        }
                    }
                }

                if (nearest != null)
                {
                    Console.WriteLine($"Bước {visited.Count}: Từ điểm {current.Id} → Điểm {nearest.Id} (khoảng cách: {minDistance:F2})");
                    tour.Add(nearest);
                    visited.Add(nearest);
                    totalDistance += minDistance;
                    current = nearest;
                }
            }

            // Quay về điểm bắt đầu
            double returnDistance = current.DistanceTo(startPoint);
            totalDistance += returnDistance;
            Console.WriteLine($"Bước {tour.Count}: Từ điểm {current.Id} → Điểm {startPoint.Id} (khoảng cách: {returnDistance:F2})");

            // Hiển thị kết quả
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("\n=== KẾT QUẢ ===");
            Console.Write("Đường đi: ");
            foreach (var point in tour)
            {
                Console.Write($"{point.Id} → ");
            }
                Console.WriteLine($"{startPoint.Id}");
                
                Console.WriteLine($"\n✓ Tổng khoảng cách: {totalDistance:F2}");
            Console.ResetColor();
            
            // Phân tích độ phức tạp
            int n = points.Count;
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("\n=== PHÂN TÍCH ĐỘ PHỨC TẠP ===");
            Console.WriteLine($"• Số điểm (n): {n}");
            Console.WriteLine($"• Số bước lặp: {n - 1} (tìm điểm gần nhất)");
            Console.WriteLine($"• Số phép so sánh: ~{n * (n - 1) / 2:N0}");
            Console.WriteLine($"• Độ phức tạp thời gian: O(n²)");
            Console.WriteLine($"• Độ phức tạp không gian: O(n)");
            Console.WriteLine($"• Bộ nhớ sử dụng: ~{(n * 48.0 / 1024):F2} KB");
            Console.WriteLine("\n⚠️ Lưu ý: Thuật toán Tham lam không đảm bảo tối ưu!");
            Console.WriteLine("   Kết quả có thể sai lệch 10-30% so với nghiệm tối ưu.");
            Console.ResetColor();
            }
            catch (Exception ex)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine($"✗ Lỗi khi tính đường đi tham lam: {ex.Message}");
                Console.ResetColor();
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            TSPSolver solver = new TSPSolver();
            
            Console.WriteLine("╔════════════════════════════════════════════════════════╗");
            Console.WriteLine("║   BÀI TOÁN NGƯỜI DU LỊCH (TSP) - THUẬT TOÁN THAM LAM   ║");
            Console.WriteLine("╚════════════════════════════════════════════════════════╝");

            while (true)
            {
                Console.WriteLine("\n┌─────────────────────────────────────────┐");
                Console.WriteLine("│              MENU CHÍNH                 │");
                Console.WriteLine("├─────────────────────────────────────────┤");
                Console.WriteLine("│ 1. Thêm điểm (nhập tọa độ)              │");
                Console.WriteLine("│ 2. Tạo điểm ngẫu nhiên                  │");
                Console.WriteLine("│ 3. Xem danh sách điểm                   │");
                Console.WriteLine("│ 4. Hiển thị ma trận khoảng cách         │");
                Console.WriteLine("│ 5. Tìm đường đi tham lam                │");
                Console.WriteLine("│ 6. Tìm đường đi quy hoạch động          │");
                Console.WriteLine("│ 7. Xóa tất cả điểm                      │");
                Console.WriteLine("│ 0. Thoát                                │");
                Console.WriteLine("└─────────────────────────────────────────┘");
                Console.Write("\nChọn chức năng: ");

                string? choice = Console.ReadLine();

                try
                {
                    switch (choice)
                    {
                        case "1":
                            try
                            {
                                Console.Write("Nhập tọa độ X: ");
                                if (double.TryParse(Console.ReadLine(), out double x))
                                {
                                    Console.Write("Nhập tọa độ Y: ");
                                    if (double.TryParse(Console.ReadLine(), out double y))
                                    {
                                        solver.AddPoint(x, y);
                                    }
                                    else
                                    {
                                        Console.WriteLine("✗ Tọa độ Y không hợp lệ!");
                                    }
                                }
                                else
                                {
                                    Console.WriteLine("✗ Tọa độ X không hợp lệ!");
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi thêm điểm: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "2":
                            try
                            {
                                Console.Write("Nhập số lượng điểm cần tạo (tối đa 15): ");
                                if (int.TryParse(Console.ReadLine(), out int count) && count > 0)
                                {
                                    if (count > 15)
                                    {
                                        Console.ForegroundColor = ConsoleColor.Yellow;
                                        Console.WriteLine("✗ Số lượng điểm không được vượt quá 15!");
                                        Console.ResetColor();
                                    }
                                    else
                                    {
                                        solver.GenerateRandomPoints(count);
                                        solver.ShowPoints();
                                    }
                                }
                                else
                                {
                                    Console.WriteLine("✗ Số lượng không hợp lệ!");
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi tạo điểm: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "3":
                            try
                            {
                                solver.ShowPoints();
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi hiển thị điểm: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "4":
                            try
                            {
                                solver.ShowDistanceMatrix();
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi hiển thị ma trận: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "5":
                            try
                            {
                                solver.ShowPoints();
                                Console.Write("\nTìm đường đi tốt nhất? (Enter/Y = Có, Nhập số = Chọn điểm bắt đầu): ");
                                string? bestRouteChoice = Console.ReadLine()?.Trim();
                                
                                if (string.IsNullOrWhiteSpace(bestRouteChoice) || bestRouteChoice.ToUpper() == "Y" || bestRouteChoice.ToUpper() == "YES" || bestRouteChoice.ToUpper() == "CO" || bestRouteChoice.ToUpper() == "CÓ")
                                {
                                    Console.ForegroundColor = ConsoleColor.Green;
                                    solver.FindBestGreedyRoute();
                                    Console.ResetColor();
                                }
                                else if (int.TryParse(bestRouteChoice, out int startId))
                                {
                                    // Người dùng đã nhập số ID điểm bắt đầu
                                    solver.SolveGreedy(startId);
                                }
                                else
                                {
                                    // Nhập khác (N hoặc ký tự khác), hỏi lại
                                    Console.Write("\nNhập ID điểm bắt đầu (Enter để chọn điểm đầu tiên): ");
                                    string? startInput = Console.ReadLine();
                                    if (string.IsNullOrWhiteSpace(startInput))
                                    {
                                        solver.SolveGreedy();
                                    }
                                    else if (int.TryParse(startInput, out int secondStartId))
                                    {
                                        solver.SolveGreedy(secondStartId);
                                    }
                                    else
                                    {
                                        Console.WriteLine("✗ ID không hợp lệ!");
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi tìm đường đi: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "6":
                            try
                            {
                                solver.SolveDynamicProgramming();
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi tìm đường đi: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "7":
                            try
                            {
                                solver.ClearPoints();
                            }
                            catch (Exception ex)
                            {
                                Console.ForegroundColor = ConsoleColor.Red;
                                Console.WriteLine($"✗ Lỗi khi xóa điểm: {ex.Message}");
                                Console.ResetColor();
                            }
                            break;

                        case "0":
                            Console.WriteLine("\nTạm biệt! 👋");
                            return;

                        default:
                            Console.WriteLine("✗ Lựa chọn không hợp lệ!");
                            break;
                    }
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"\n✗ Đã xảy ra lỗi: {ex.Message}");
                    Console.WriteLine($"Chi tiết: {ex.StackTrace}");
                    Console.ResetColor();
                }
            }
        }
    }
}
