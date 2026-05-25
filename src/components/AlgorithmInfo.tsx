import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, XCircle, Info, BookOpen } from 'lucide-react';
import { AlgorithmType } from '../types';

export default function AlgorithmInfo() {
  const [activeTab, setActiveTab] = useState<AlgorithmType>('bfs');

  const infoData = {
    bfs: {
      title: 'Breadth-First Search (BFS) - Chiều rộng',
      description: 'Lực lượng duyệt đồ thị tối ưu mác phẳng không trọng số. BFS bắt đầu tại nút nguồn, tỏa tròn đồng tâm kiểm tra tất cả lân cận trước khi lấn sâu.',
      pros: [
        'Đảm bảo tìm ra đường đi có số bước ít nhất khi hệ số trọng số đồng dạng.',
        'Xác định biên tối ưu phẳng nhanh chóng, kiểm tra bão hòa đồng tâm.'
      ],
      cons: [
        'Tiêu tốn bộ nhớ lớn để duy trì biên hàng đợi (Frontier Queue).',
        'Bị sai số nghiêm trọng khi đồ thị phân cấp trọng số địa hình lồi lõm.'
      ],
      complexityTime: 'O(V + E)',
      complexitySpace: 'O(V) - Frontier',
      optimal: 'Đúng (Lưới không trọng số)',
      useCase: 'Lan truyền thực thể, tìm vùng phẳng kề cận ngắn nhất.'
    },
    dfs: {
      title: 'Depth-First Search (DFS) - Chiều sâu',
      description: 'Tìm kiếm dấn sâu thăm dò tối đa nhánh trước khi có tín hiệu quay lui. Sử dụng cấu trúc Ngăn xếp (Stack) hoặc Đệ quy để lột tả nhánh sâu.',
      pros: [
        'Tiêu tốn bộ nhớ rất thấp khi độ sâu lớn và có cấu trúc nhánh hẹp.',
        'Thích hợp trong tạo lập mê cung hồi quy (Recursive Backtracking).'
      ],
      cons: [
        'Không đảm bảo tìm đường tối ưu tối thiểu. Dễ sa đà vào đường vòng lớn vô tận.',
        'Không khả thi khi làm hạt nhân AI tìm đường trong trò chơi thế giới mở.'
      ],
      complexityTime: 'O(V + E)',
      complexitySpace: 'O(H) - Max Depth',
      optimal: 'Không tối ưu',
      useCase: 'Tự động tạo mê cung, duyệt chu trình đồ thị khép kín.'
    },
    dijkstra: {
      title: "Dijkstra's Algorithm — Tìm đường Trọng số",
      description: "Hạt nhân tối ưu hóa đường đi trên đồ thị có trọng số phức tạp. Thuật toán hoạt động bằng cách mở rộng liên tục nút có tổng chi phí thấp nhất từ khởi điểm.",
      pros: [
        'Đảm bảo tìm được đường có chi phí tích lũy thấp nhất tuyệt đối.',
        'Rất linh động: AI có thể chủ động vòng tránh đầm lầy, ao sâu để giữ thể lực.'
      ],
      cons: [
        'Chậm hơn BFS ở bản đồ trơn vì liên tục phải hoán vị hàng đợi ưu tiên.',
        'Không vận hành được với trọng số âm (không xuất hiện ở bản đồ thường).'
      ],
      complexityTime: 'O((V + E) log V)',
      complexitySpace: 'O(V)',
      optimal: 'Đúng tuyệt đối (Ngay cả khi có sình lầy)',
      useCase: 'Bản đồ Google Maps né tránh kẹt xe, AI tìm đường trong game chiến thuật.'
    },
    astar: {
      title: 'A* Search — Tối ưu Heuristic',
      description: 'Vua của tất cả thuật toán tìm đường. A* kết hợp chi phí thực tế g(n) từ điểm xuất phát với ước lượng heuristic h(n) tới đích: f(n) = g(n) + h(n). Nhờ vậy vừa đảm bảo tối ưu, vừa cực kỳ nhanh.',
      pros: [
        'Đảm bảo đường tối ưu như Dijkstra nhưng duyệt ít ô hơn rất nhiều nhờ hướng tới đích.',
        'Đây là thuật toán tiêu chuẩn trong mọi AI game thực tế (Unity, Unreal Engine).'
      ],
      cons: [
        'Cần thêm bộ nhớ để lưu fScore cho mỗi ô trong Open Set.',
        'Chất lượng phụ thuộc vào hàm Heuristic h(n) được chọn.'
      ],
      complexityTime: 'O((V + E) log V)',
      complexitySpace: 'O(V) — Open Set',
      optimal: 'Đúng (khi Heuristic là admissible)',
      useCase: 'AI tìm đường trong game, robot tự hành, Google Maps điều hướng thực tế.'
    },
    greedy: {
      title: 'Greedy Best-First Search — Tham Lam Nhanh',
      description: 'Triết lý cực đơn giản: luôn đi về phía có vẻ gần đích nhất. Greedy chỉ dùng heuristic h(n) mà bỏ qua chi phí đã đi g(n). Rất nhanh nhưng dễ bị bẫy bởi các vật cản hình chữ U.',
      pros: [
        'Tốc độ cực nhanh, duyệt số ô ít nhất trong hầu hết trường hợp bản đồ trơn.',
        'Tiêu tốn ít bộ nhớ hơn A* vì không cần duy trì gScore tích lũy.'
      ],
      cons: [
        'KHÔNG đảm bảo đường tối ưu — rất dễ bị lừa bởi cạm bẫy hình chữ U.',
        'Bỏ qua trọng số địa hình, không phân biệt được đầm lầy hay bãi đất phẳng.'
      ],
      complexityTime: 'O(b^m) trong trường hợp xấu',
      complexitySpace: 'O(b^m)',
      optimal: 'Không tối ưu',
      useCase: 'Game cần AI siêu nhanh, bản đồ mở không có bẫy, real-time pathfinding đơn giản.'
    }
  };

  const current = infoData[activeTab];

  return (
    <div className="bg-[#141412] rounded-xl p-6 border border-[#2A2A28] flex flex-col h-full shadow-2xl" id="algorithm-info-panel">
      <div className="flex items-center gap-2 mb-4 border-b border-[#2A2A28] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Sơ Lược Hệ Lý Thuyết</h3>
        </div>
        <div className="text-[9px] text-[#666] font-mono flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Click chuyển Tab</span>
        </div>
      </div>

      {/* Tabs list with Sophisticated Dark style */}
      <div className="flex flex-wrap bg-[#0D0D0D] p-1 rounded border border-[#2A2A28] mb-4 text-[10px] font-mono font-semibold gap-0.5">
        {(['bfs', 'dfs', 'dijkstra', 'astar', 'greedy'] as AlgorithmType[]).map((tab) => {
          const labels: Record<AlgorithmType, string> = {
            bfs: 'BFS', dfs: 'DFS', dijkstra: 'Dijkstra', astar: 'A*', greedy: 'Greedy'
          };
          const activeColors: Record<AlgorithmType, string> = {
            bfs: 'text-slate-200 border-slate-500',
            dfs: 'text-[#888] border-[#666]',
            dijkstra: 'text-[#D4AF37] border-[#D4AF37]',
            astar: 'text-emerald-400 border-emerald-600',
            greedy: 'text-amber-400 border-amber-600',
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 px-1 rounded-sm text-center uppercase tracking-wider transition-all min-w-[50px] ${
                activeTab === tab
                  ? `bg-[#1A1A18] ${activeColors[tab]} border`
                  : 'text-[#555] hover:text-[#F2F2F0]'
              }`}
              id={`tab-${tab}`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="space-y-4 flex-1">
        <div>
          <h4 className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5 font-sans uppercase tracking-wider">
            <span className="w-1 h-3.5 bg-[#D4AF37] rounded-sm" />
            {current.title}
          </h4>
          <p className="text-[11px] text-[#A0A09B] mt-2 leading-relaxed">
            {current.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          <div className="bg-[#0D0D0D] border border-[#2A2A28] p-3 rounded space-y-2">
            <h5 className="font-semibold text-slate-300 flex items-center gap-1 uppercase tracking-wider text-[10px] font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ưu điểm</span>
            </h5>
            <ul className="space-y-1.5 text-[#888]">
              {current.pros.map((pro, i) => (
                <li key={i} className="flex gap-1 items-start leading-relaxed text-[10px]">
                  <ChevronRight className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0D0D0D] border border-[#2A2A28] p-3 rounded space-y-2">
            <h5 className="font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider text-[10px] font-mono">
              <XCircle className="w-3.5 h-3.5 text-[#666]" />
              <span>Hạn chế</span>
            </h5>
            <ul className="space-y-1.5 text-[#888]">
              {current.cons.map((con, i) => (
                <li key={i} className="flex gap-1 items-start leading-relaxed text-[10px]">
                  <ChevronRight className="w-3 h-3 text-[#666] shrink-0 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Complexity specs footer */}
        <div className="grid grid-cols-2 gap-2 border-t border-[#2A2A28] pt-3 text-[10px] font-mono">
          <div className="p-2 rounded bg-[#0D0D0D] flex flex-col justify-center border border-[#2A2A28]/50">
            <span className="text-[#555] text-[9px] uppercase tracking-wider">PHỨC TẠP THỜI GIAN</span>
            <span className="text-[#D4AF37] font-medium truncate mt-0.5">{current.complexityTime}</span>
          </div>
          <div className="p-2 rounded bg-[#0D0D0D] flex flex-col justify-center border border-[#2A2A28]/50">
            <span className="text-[#555] text-[9px] uppercase tracking-wider">PHỨC TẠP KHÔNG GIAN</span>
            <span className="text-slate-300 font-medium truncate mt-0.5">{current.complexitySpace}</span>
          </div>
          <div className="p-2 rounded bg-[#0D0D0D] flex flex-col justify-center border border-[#2A2A28]/50">
            <span className="text-[#555] text-[9px] uppercase tracking-wider">TỐI ƯU TOÀN VẸN</span>
            <span className="text-[#D4AF37] font-medium truncate mt-0.5">{current.optimal}</span>
          </div>
          <div className="p-2 rounded bg-[#0D0D0D] flex flex-col justify-center border border-[#2A2A28]/50">
            <span className="text-[#555] text-[9px] uppercase tracking-wider">LĨNH VỰC ÁP DỤNG</span>
            <span className="text-slate-400 font-medium truncate mt-0.5">{current.useCase}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
