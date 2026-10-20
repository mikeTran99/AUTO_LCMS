# 👑 AUTO LCMS QUIZ SOLVER — 3D LUXURY STEALTH EDITION (v2.2.0)

> **Extension chuyên dụng tương thích 100% mọi trình duyệt Chromium (Chrome, Microsoft Edge, Brave, Cốc Cốc, Opera) cho hệ thống LCMS NTTU (`lcms.ntt.edu.vn`) và nền tảng Moodle Quiz toàn cầu.**  
> Tự động hóa tối thượng: **Chụp toàn trang (PNG/JPG/PDF A4 đa trang) ➔ 1-Click Gemini AI Auto-Solver hoặc Web AI ➔ Bóc tách vạn năng & Điền 2 tốc độ (0.02s Siêu Tốc hoặc Stealth Delay) ➔ Khóa an toàn tuyệt đối.**

👉 **[BẤM VÀO ĐÂY ĐỂ XEM CẨM NANG HƯỚNG DẪN CHI TIẾT CHO SINH VIÊN (DỄ HIỂU 100%)](docs/HUONG_DAN_SU_DUNG_SINH_VIEN.md)**

---

## ✨ CÁC TÍNH NĂNG ĐỈNH CAO (v2.2.0)

1. **Giao diện 3D Luxury Obsidian & 24K Gold**:
   - Phối màu đẳng cấp hoàng gia, độ nghiêng phối cảnh 3D (Tilt Perspective), phím bấm dập nổi có chiều sâu, hiệu ứng ánh sáng vàng kim loại.
2. **Xuất PDF A4 Đa Trang Thông Minh (Multi-Page Smart Break)**:
   - **Bước 1**: Chụp cuộn trang tự động toàn bộ đề thi (không giới hạn độ dài), khử lặp header dính `navbar.fixed-top`.
   - Lưu ảnh về định dạng **PNG (Lossless)**, **JPG (High-Res)**, hoặc xuất trực tiếp ra **PDF đa trang chuẩn A4**.
   - **🆕 v2.2**: Bộ sinh PDF thuần Javascript tự động chia trang A4 (595.28×841.89pt), sử dụng thuật toán **Smart Page Break** quét vùng 10% cuối mỗi trang để tìm hàng pixel đồng nhất (khoảng trắng giữa các câu hỏi), tránh cắt ngang câu hỏi/đáp án. DPI cao, đồ họa sắc nét, mở chuẩn trên mọi ứng dụng đọc PDF.
   - Bộ sinh PDF nhị phân (`/Filter /DCTDecode`), siêu nhẹ ~150 dòng, 0 thư viện bên ngoài (Zero npm bloat).
3. **1-Click Gemini API Auto-Solver Tự Do Chọn Mô Hình (SOTA)**:
   - Nhập Gemini API Key của bạn (chỉ lưu cục bộ an toàn trong `chrome.storage.local`).
   - Tự do lựa chọn mô hình mong muốn: **👑 Gemini 4 Argon (Siêu trí tuệ SOTA - Chính xác nhất có thể)**, **⚡ Gemini 4 Ultra**, **🧠 Gemini 3.1 Pro**, hoặc **🚀 Gemini 2.5 Flash**. Tự động kích hoạt chuỗi dự phòng (fallback) nếu hết hạn mức.
   - Nhấn **⚡ 1-CLICK GIẢI BẰNG GEMINI & ĐIỀN TỰ ĐỘNG**: Extension tự bóc tách toàn bộ câu hỏi trên trang, gửi trực tiếp đến Gemini, nhận đáp án và tự động điền ngay lập tức!
4. **Cổng Kết Nối Mở Nhanh Các Nền Tảng AI Suy Luận Cao Nhất Thế Giới**:
   - **Claude**: `Opus 5.5 / Sonnet 5.5` (Mô hình Top 1 thế giới về logic & trắc nghiệm học thuật).
   - **ChatGPT**: `GPT-6` (Siêu trí tuệ nhân tạo thế hệ mới nhất của OpenAI).
   - **Gemini**: `4 Argon / Ultra` (Đỉnh cao tư duy đa phương thức của Google).
   - **DeepSeek**: `R2 / R1 (Reasoning CoT)` (Siêu AI mã nguồn mở miễn phí).
   - **AI Studio**: `Gemini 4 Argon Max Context` (Môi trường trực tiếp từ Google).
   - **Grok**: `Grok 4 (Thinking)` (Mô hình SOTA thế hệ mới nhất của xAI).
   - Tự động copy sẵn Prompt suy luận chuyên sâu vào Clipboard.
5. **Bộ Bóc Tách Đáp Án Vạn Năng (Universal Ultra Parser)**:
   - Chấp nhận **bất kỳ định dạng văn bản nào**:
     - Bảng Markdown: `| 1 | C | restore |`
     - Bảng Excel / Google Sheets copy sang: `1	C	restore`
     - Danh sách đánh số: `1. C - restore`, `Câu 1: restore`, `1/ C: restore`
     - Dạng viết tắt: `1C 2A 3A 4C 5C`
     - Dãy ký tự thuần: `C, A, A, C, C, D...`
     - JSON: `{"1": "restore", "2": "A"}`
6. **Chuẩn Hóa Unicode NFC & Kháng Đảo Đề Chính Xác Nhất Có Thể (Anti-Shuffle)**:
   - Tự động chuẩn hóa Unicode NFC (tránh lỗi font tiếng Việt tổ hợp NFD).
   - Tự động gọt bỏ tiền tố `a. `, `B) ` để so khớp **xâu ký tự nguyên văn của đáp án**. Đề thi xáo trộn vị trí A, B, C, D vẫn chọn chính xác nhất có thể.
7. **Động Cơ Điền 2 Tốc Độ (Dual-Speed Engine)**:
   - **⚡ Siêu Tốc (Burst)**: Kích hoạt đồng loạt toàn bộ câu hỏi chỉ trong ~0.02 giây.
   - **🛡️ Tàng Hình (Stealth Delay)**: Điền từng câu với độ trễ ngẫu nhiên 150ms - 350ms mô phỏng chuẩn xác tốc độ thao tác của người thật.
8. **🛡️ KHÓA AN TOÀN TUYỆT ĐỐI (TUYỆT ĐỐI KHÔNG BẤM GỬI)**:
   - Hệ thống điền xong sẽ **DỪNG LẬP TỨC 100%**. Tuyệt đối không bấm nút "Nộp bài" hay chuyển trang.
   - Hiển thị **Bảng Soát Lại (Review Matrix)** trực quan. Bấm vào bất kỳ dòng nào sẽ tự động cuộn trang êm ái tới đúng câu hỏi đó để bạn kiểm tra tận mắt.
9. **Tàng Hình Stealth Trước Hệ Thống Giám Sát**:
   - Bảng điều khiển sử dụng công nghệ **Closed Shadow DOM**, cách ly hoàn toàn, không thể bị quét bởi mã JavaScript của Moodle hay hệ thống giám thị trực tuyến.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT (CHỈ MẤT 30 GIÂY)

1. Mở bất kỳ trình duyệt nào: **Chrome, Microsoft Edge, Brave, Cốc Cốc, Opera**.
2. Truy cập vào trang quản lý tiện ích:
   - Chrome / Brave / Cốc Cốc / Opera: `chrome://extensions/`
   - Microsoft Edge: `edge://extensions/`
3. Gạt bật công tắc **Chế độ dành cho nhà phát triển (Developer mode)** ở góc trên bên phải.
4. Nhấn nút **Tải tiện ích đã giải nén (Load unpacked)**.
5. Chọn thư mục dự án:
   ```
   e:\Projects\EXTENSIONS\AUTO_LCMS
   ```
6. Biểu tượng Vương Miện Vàng 👑 sẽ xuất hiện trên thanh tiện ích của trình duyệt!

---

## 📖 HƯỚNG DẪN SỬ DỤNG CHI TIẾT

### Cách 1: Giải Tự Động 1-Click Bằng Gemini API (Nhanh & Tiện Nhất)
1. Bấm vào biểu tượng extension **👑** trên thanh công cụ.
2. Tại mục **Bước 2**, nhập Gemini API Key của bạn (Key miễn phí lấy tại Google AI Studio) -> Bấm **Lưu Key**.
3. Mở bài thi trắc nghiệm trên `lcms.ntt.edu.vn`.
4. Bấm nút **⚡ 1-CLICK GIẢI & ĐIỀN BẰNG GEMINI API**.
5. Extension sẽ tự động trích xuất toàn bộ câu hỏi, gửi API tới Gemini 4 Argon / 3.1 Pro, nhận kết quả và điền toàn bộ bài thi ngay lập tức!

### Cách 2: Quy Trình Thủ Công (Chụp Toàn Trang & Mở Web AI)
1. **Bước 1 — Chụp Đề**:
   - Bấm nút **📸 CHỤP MÀN HÌNH TOÀN TRANG**. Extension sẽ tự động cuộn trang và ghép ảnh hoàn chỉnh.
   - Tải về theo định dạng **PNG**, **JPG** hoặc xuất thẳng file **PDF A4 đa trang** (tự động chia trang thông minh, không cắt ngang câu hỏi).
2. **Bước 2 — Mở Web AI**:
   - Bấm vào biểu tượng **Gemini**, **ChatGPT**, **Claude** hoặc **DeepSeek**.
   - Tab AI sẽ mở ra, Prompt giải đề đã tự động nằm sẵn trong Clipboard. Bấm `Ctrl + V` dán prompt và đính kèm file ảnh/PDF vừa tải.
3. **Bước 3 — Điền Đáp Án**:
   - Copy kết quả AI trả về -> Dán vào ô nhập liệu trong Popup -> Chọn tốc độ (**⚡ Siêu Tốc** hoặc **🛡️ Tàng Hình**) -> Bấm **⚡ ĐIỀN 1 LOẠT NGAY**.

### Cách 3: Sử Dụng Bảng Điều Khiển Trên Trang (On-Page Stealth Panel)
- Tại trang làm bài thi LCMS, bạn có thể bấm tổ hợp phím **`Alt + A`** hoặc click vào nút tròn 👑 ở góc dưới bên phải màn hình.
- Bảng điều khiển tàng hình sẽ trượt ra, có đầy đủ ô chọn tốc độ (`⚡ Siêu Tốc` / `🛡️ Tàng Hình`) và ô dán đáp án để điền tức thì.

---

## 📂 CẤU TRÚC THƯ MỤC CHUẨN HÓA (MODULAR ARCHITECTURE)

```
AUTO_LCMS/
├── manifest.json              # Extension Entry Manifest (MV3)
├── src/                       # Mã nguồn chức năng (phân tách theo phạm vi)
│   ├── background/
│   │   └── background.js      # Background Service Worker
│   ├── content/
│   │   ├── content.js         # Content Script (Shadow DOM & Autofill Engine)
│   │   └── content.css        # Content Script Fallback Styles
│   └── popup/
│       ├── popup.html         # Giao diện Popup 3D Luxury & Accordion SOP
│       ├── popup.css          # Styling 3D Luxury Obsidian & 24K Gold
│       └── popup.js           # Bộ điều khiển Popup, A4 PDF Engine & SOP Nav
├── icons/                     # Bộ biểu tượng ứng dụng chuẩn Chrome Store
│   ├── icon16.png             # 16x16 Toolbar
│   ├── icon48.png             # 48x48 Extension Management
│   ├── icon128.png            # 128x128 Store Display
│   └── luxury_icon_master.jpg # Master Vector/HD Source
├── tests/                     # Bộ kiểm thử tự động & Dữ liệu thực tế E2E
│   ├── test_e2e_runner.js     # Runner kiểm thử 28 bài test tự động
│   ├── verify_guide_modal.js  # Script kiểm định giao diện Accordion SOP
│   └── samples/               # Đề thi thật Moodle HTML & PDF mẫu
├── docs/                      # Tài liệu kỹ thuật chuyên sâu
│   ├── PROJECT_PROGRESS.md    # Nhật ký tiến độ và kiến trúc hệ thống
│   ├── HUONG_DAN_SU_DUNG_SINH_VIEN.md   # Cẩm nang hướng dẫn sinh viên
│   └── HUONG_DAN_SU_DUNG_SINH_VIEN.docx # Bản Word cho sinh viên
└── README.md                  # Hướng dẫn sử dụng tổng quan
```

---

## 🌐 TÁC GIẢ & BẢN QUYỀN
- **Đơn vị phát triển**: [MikeSmart Studio](https://mikesmart.vercel.app/)
- **Website chính thức**: [https://mikesmart.vercel.app/](https://mikesmart.vercel.app/)
- Mọi thắc mắc hoặc yêu cầu nâng cấp vui lòng truy cập website hoặc liên hệ qua kênh hỗ trợ của tác giả.
