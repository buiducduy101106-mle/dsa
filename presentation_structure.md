# Đề tài: Báo cáo Dự án Trực quan hóa Thuật toán & Kiểm thử Lỗi trên Địa hình Phức tạp
*Đơn vị thực hiện: Trường Đại học Kinh tế Quốc dân (NEU) • Chuyên ngành Khoa học Dữ liệu & Kỷ nguyên số (DSEB)*
*Nhóm thực hiện: Group 5*

---

## 🌐 PHẦN 1: Giới Thiệu & Cơ Sở Thiết Kế Hệ Thống (Slide 1 – 4)
*Tập trung vào tổng quan dự án, kiến trúc mã nguồn và các thiết lập toán học nền tảng.*

### Slide 1: Cover Slide (Slide Mở Đầu)
* **Tiêu đề:** VISUALIZATION & CASE ERROR TESTING ON COMPLEX TERRAINS.
* **Nội dung:** Giới thiệu đề tài nghiên cứu hành vi đồ thị tĩnh, động lực học đa trọng số, kiểm soát góc di chuyển thực tế và mổ xẻ kỹ thuật 3 trường hợp lỗi kinh điển của BFS, DFS & Dijkstra.
* **Thông số phòng thí nghiệm:**
  * Kích thước lưới: 20 × 45 (900 Nodes).
  * Trọng số địa hình: Swamp (Đầm lầy - Cost: 5) | Water (Nước sâu - Cost: 10).
  * Hệ thống Heuristic: Tích hợp 4 hệ đo khoảng cách.
  * Giả lập song song: Phòng thí nghiệm đối kháng thời gian thực.

### Slide 2: System Architecture & Data Flow (Kiến Trúc Hệ Thống & Luồng Dữ Liệu)
* **Khái niệm cốt lõi:** Thiết kế phân rã mô hình (**Decoupled Model**) giúp tách biệt phần xử lý thuật toán thuần túy (`algorithms.ts`) khỏi tầng hiển thị React 19 (`GridRenderer.tsx`).
* **Ba thành phần chính:**
  1. *Algorithmic Pathfinding Core (`algorithms.ts`):* Nhận lưới thô, tính toán tuần tự và trả ra mảng các node đã duyệt để đạt tốc độ xử lý CPU tối đa.
  2. *Real-time Grid Rendering (`GridRenderer.tsx`):* Hiển thị lưới 900 ô bằng phần cứng CSS tăng tốc, hỗ trợ vẽ vật cản/trọng số tự do bằng chuột.
  3. *Adversarial Laboratory (`ScenarioLab.tsx`):* Môi trường hộp cát (sandbox) độc lập chạy song song hai thuật toán cùng lúc.
* **Cấu trúc GridNode (TypeScript):**
  ```typescript
  export interface GridNode {
    row: number;
    col: number;
    isStart: boolean;
    isEnd: boolean;
    isWall: boolean;
    weight: number; // Trọng số: 1 (bình thường), 5 (đầm lầy), 10 (nước sâu)
    isVisited: boolean;
    isPath: boolean;
    distance: number;
    previousNode: GridNode | null;
  }
  ```

### Slide 3: Creating Multi-weighted Terrain Grids (Hệ Thống Địa Hình Đa Trọng Số)
* **Ý nghĩa:** Khác với các trình giả lập nhị phân thông thường (chỉ có tường và đường đi trống), hệ thống bổ sung **Trọng số địa hình động** để mô phỏng bản đồ thực tế:
  * **Stone Wall:** Vật cản tuyệt đối (Không thể đi qua).
  * **Swamp Mud:** Đầm lầy (Trọng số cản = 5).
  * **Deep Water:** Nước sâu (Trọng số cản = 10).
* **Thuật toán sinh địa hình tự động (`maze.ts`):** Sử dụng các hàm sóng hình sin kết hợp nhiễu ngẫu nhiên để sinh ra các con sông uốn lượn tự nhiên.
  ```typescript
  const sineWave = Math.sin(col * 0.3) * 4 + 10;
  const distanceToWave = Math.abs(row - sineWave);
  if (distanceToWave < 2.2) {
    weight = 10; // Nước sâu (Sức cản cực đại)
  } else if (distanceToWave < 4.5) {
    weight = 5;  // Đầm lầy (Sức cản trung bình)
  }
  ```

### Slide 4: Heuristic Estimates & Diagonal Movement (Toán Học Heuristic & Di Chuyển Chéo)
* **Di chuyển 8 hướng:** Hỗ trợ di chuyển chéo kết hợp với cơ chế **Corner-Crossing Control** (ngăn chặn nhân vật đi xuyên qua khe hẹp chéo của hai bức tường liền kề gây lỗi hiển thị vật lý).
* **3 Hệ đo khoảng cách chính:**
  1. *Manhattan Distance:* Dùng cho di chuyển 4 hướng (lên, xuống, trái, phải).
  2. *Octile Distance:* Tối ưu cho di chuyển 8 hướng với chi phí chéo là $\sqrt{2}$.
  3. *Chebyshev Distance:* Dùng khi chi phí đi chéo bằng đi thẳng (bằng 1).
* **Mã nguồn chặn xuyên góc tường trong `algorithms.ts`:**
  ```typescript
  if (allowDiagonal) {
    // Trường hợp: Đi chéo Lên - Trái
    if (up && left) {
      const target = grid[row - 1][col - 1];
      const blocked = dontCrossCorners
        ? (upNode?.isWall || leftNode?.isWall) // Chặn nếu 1 trong 2 bên là tường
        : (upNode?.isWall && leftNode?.isWall); // Chỉ chặn nếu cả 2 bên là tường
      if (!blocked) neighbors.push(target);
    }
  }
  ```

---

## 🧪 PHẦN 2: Phòng Thử Nghiệm Đối Kháng & 3 Ca Lỗi Điển Hình (Slide 5 – 8)
*Trực quan hóa sự thất bại của các thuật toán phổ biến thông qua các kịch bản thử nghiệm đối kháng thực tế.*

### Slide 5: The Adversarial Sandbox: Scenario Lab (Hộp Cát Giả Lập Đối Kháng)
* Nhóm đã thiết kế **3 kịch bản kiểm thử giới hạn** (stress-test) để bộc lộ các khuyết điểm về mặt mặt lý thuyết và thực tiễn của 3 thuật toán: BFS, DFS và Dijkstra.
  * **Kịch bản 1:** Ao Sâu Cản Địa (Deep Water Barrier) -> So tài giữa BFS & Dijkstra.
  * **Kịch bản 2:** Mê Cung Ngõ Cụt (Dead-End Maze Trap) -> So tài giữa DFS & BFS.
  * **Kịch bản 3:** Mồi Nhử Trọng Số (Cheap Weight Luring) -> So tài giữa Dijkstra & BFS.

### Slide 6: Case 1: Deep Water Barrier (Ca Lỗi 1: Ao Sâu Cản Địa)
* **Bối cảnh:** Điểm xuất phát và đích nằm hai bên một hồ nước sâu (Trọng số cản = 10). Bên dưới hồ nước có một đường vòng đất bằng phẳng (Trọng số = 1).
* **Thất bại của BFS:** Do BFS coi đồ thị là không trọng số (mỗi bước đi là 1 đơn vị bằng nhau), nó phán đoán đường thẳng đi xuyên qua hồ nước là ngắn nhất. Kết quả: BFS dẫn đường đi xuyên hồ nước, tiêu tốn đến **101 năng lượng**.
* **Sự tối ưu của Dijkstra:** Dijkstra nhận biết được trọng số cản của nước, chấp nhận đi đường vòng dài hơn về số bước nhưng tối ưu năng lượng nhất, tiêu tốn chỉ **35 năng lượng**.

### Slide 7: Case 2: Dead-End Corridor Trap (Ca Lỗi 2: Mê Cung Ngõ Cụt)
* **Bối cảnh:** Điểm đích nằm ngay dưới điểm xuất phát chỉ 3 ô, nhưng bị ngăn cách bởi một bức tường nằm ngang. Ở giữa bức tường có lối rẽ dẫn vào một ngõ cụt rất dài hướng lên trên.
* **Thất bại của DFS:** Do DFS ưu tiên duyệt sâu theo nhánh đến cùng, nó bị hút sâu vào bên trong ngõ cụt dài phía trên, đi hết ngõ cụt mới chịu quay lui để tìm đường khác. DFS phải duyệt thừa tới **hơn 280 ô**.
* **Sự tối ưu của BFS:** BFS loang đều ra xung quanh theo hình tròn đồng tâm, quét hết các ô lân cận và nhanh chóng tìm thấy đích ở ngay bên cạnh chỉ sau **3 bước**.

### Slide 8: Case 3: Cheap Weight Luring (Ca Lỗi 3: Mồi Nhử Trọng Số)
* **Bối cảnh:** Đích nằm bên phải và bị chặn bởi một dải đầm lầy (Trọng số = 10). Phía bên trái xuất phát là một vùng thảo nguyên rộng lớn trống trải (Trọng số = 1).
* **Thất bại của Dijkstra (Lỗi mù phương hướng):** Do Dijkstra chỉ tập trung vào việc chọn ô có chi phí tích lũy rẻ nhất hiện tại, nó bị thu hút và chạy ngược về phía thảo nguyên bên trái để duyệt hết sạch vùng giá rẻ này, sau đó mới chịu đi qua đầm lầy bên phải. Dijkstra bị duyệt thừa rất nhiều ô ở hướng ngược lại.
* **Sự tối ưu của BFS:** BFS bỏ qua mọi trọng số cản, đi thẳng một mạch về phía đích qua dải đầm lầy với số ô duyệt tối thiểu.

---

## 📊 PHẦN 3: Cài Đặt Kỹ Thuật & Đo Kiểm Hiệu Năng Thực Nghiệm (Slide 9 – 10)
*Đi sâu vào chi tiết lập trình và chứng minh hiệu quả thuật toán bằng số liệu định lượng.*

### Slide 9: Implementing the Parallel Adversarial Laboratory (Hiện Thực Hóa Phòng Giả Lập Song Song)
* **Giải quyết xung đột dữ liệu:** Để hai thuật toán chạy độc lập trên cùng một kịch bản bản đồ mà không gây ảnh hưởng lẫn nhau, mã nguồn React ứng dụng cơ chế **Deep-cloning** ma trận lưới:
  ```typescript
  // Trích đoạn logic đồng bộ hóa trong ScenarioLab.tsx
  timerRef.current = setInterval(() => {
    step += stepIncr;
    setComparisonStep(step);
    
    // Tạo bản sao độc lập cho ma trận lưới bên trái (BFS)
    const nextLeftGrid = newGrid.map(row => row.map(node => ({ ...node })));
    const leftVisitedCount = Math.min(step, visitedLeft.length);
    for (let i = 0; i < leftVisitedCount; i++) {
      nextLeftGrid[visitedLeft[i].row][visitedLeft[i].col].isVisited = true;
    }
    setLeftGrid(nextLeftGrid);
    
    // Tương tự với ma trận lưới bên phải (Dijkstra)
    ...
  }, intervalMs);
  ```

### Slide 10: Quantitative Empirical Performance Benchmarking (Đo Kiểm Hiệu Năng Thực Tế)
* **Cơ chế đo chính xác:** Để loại bỏ nhiễu CPU do các tiến trình chạy ngầm của hệ điều hành, hệ thống thực hiện chạy thuật toán **50 lần liên tiếp** rồi tính toán thời gian thực thi trung bình.
* **Bảng so sánh hiệu năng thực tế thu được:**
  | Thuật toán | Thời gian thực thi (ms) | Số ô đã duyệt (Visited) | Tính tối ưu đường đi |
  | :--- | :--- | :--- | :--- |
  | **A\* Search** | 2.1 ms | 84 cells | **Có (Tối ưu nhất)** |
  | **BFS** | 4.2 ms | 210 cells | Chỉ tối ưu đồ thị phẳng |
  | **Dijkstra** | 6.4 ms | 482 cells | **Có (Tối ưu nhất)** |
  | **Greedy BFS** | 0.8 ms | 42 cells | Không tối ưu |

---

## 🚀 PHẦN 4: Ứng Dụng Thực Tế & Định Hướng Phát Triển (Slide 11 – 14)
*Kết luận về tính thực tiễn của dự án và lộ trình mở rộng quy mô.*

### Slide 11: Practical Applications in Game Development (Ứng Dụng Thực Tế Trong Phát Triển Game)
* **Tránh lỗi vật lý:** Cơ chế di chuyển 8 hướng kết hợp `dontCrossCorners` giúp các NPC/nhân vật trong game không bị lỗi đi xuyên qua góc vách núi hoặc góc tường gạch.
* **Lựa chọn Heuristic:**
  * Sử dụng *Manhattan Heuristic* cho game thể loại dàn trận RTS di chuyển lưới ô vuông orthogonal (4 hướng).
  * Sử dụng *Octile/Euclidean Heuristic* cho game nhập vai RPG di chuyển tự do 8 hướng.

### Slide 12: Key Technological Breakthroughs (Đột Phá Công Nghệ Cốt Lõi)
* **TypeScript Safe:** Đảm bảo kiểu dữ liệu nghiêm ngặt, loại bỏ hoàn toàn lỗi tràn bộ nhớ hoặc tham chiếu vòng trong đồ thị khi chạy.
* **Vite HMR (Hot Module Replacement):** Tốc độ phản hồi và biên dịch giao diện gần như tức thời khi phát triển.
* **Dynamic Weights:** Khả năng gán trọng số linh hoạt cho từng ô để tạo địa hình có độ phức tạp cao.
* **Realtime Lab:** Cơ chế hiển thị song song giúp đối chiếu trực quan tiến trình lan tỏa của hai thuật toán.

### Slide 13: Product Growth & Roadmap (Lộ Trình Phát Triển)
1. **Hierarchical Pathfinding (HPA\*):** Chia lưới bản đồ lớn thành các cụm nhỏ (clusters) để tính toán đường đi vĩ mô trước, giúp tìm đường siêu tốc trên bản đồ cực lớn (>10,000 ô).
2. **Multi-agent Simultaneous Pathing:** Xử lý tránh va chạm cục bộ thời gian thực giữa nhiều nhân vật di chuyển cùng lúc bằng giải thuật ORCA hoặc Social Force.
3. **3D Engine Integration:** Xuất mảng tọa độ đường đi để ánh xạ trực tiếp vào không gian 3D của Three.js, WebGL hoặc Unity.

### Slide 14: Thank You & Q&A (Kết Thúc & Hỏi Đáp)
* **Liên kết mã nguồn:** [Github: Pathfinding-Visualizer-for-Games_Maps](https://github.com/mhan0505/Pathfinding-Visualizer-for-Games_Maps)
* **Liên kết trang chạy thử (Live Demo):** [GitHub Pages Demo](https://mhan0505.github.io/Pathfinding-Visualizer-for-Games_Maps/)
