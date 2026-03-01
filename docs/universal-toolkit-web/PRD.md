# Product Requirements Document (PRD): Universal Toolkit Web

## 1. Tổng quan Sản phẩm (Product Overview)

**Universal Toolkit Web** là một nền tảng web (Single Page Application) đóng vai trò như một "hộp công cụ" (toolbox) đa năng trên nền tảng trình duyệt. Nền tảng được thiết kế với kiến trúc Modular và Plug-and-play, cho phép nhà phát triển dễ dàng mở rộng và đăng ký phân phối (Registry) hàng loạt công cụ tiện ích mà không làm ảnh hưởng đến mã nguồn hay độ ổn định của lõi hệ thống.

## 2. Mục tiêu Sản phẩm (Product Goals)

- Cung cấp một bộ công cụ web nhanh, mượt mà và tập trung tối đa vào trải nghiệm người dùng (UX).
- Tiết kiệm thời gian tìm kiếm, không cần chuyển đổi giữa nhiều tab hoặc các trang web dịch vụ trực tuyến phân mảnh khác nhau.
- Xây dựng kiến trúc lõi (Core Framework) vững chắc, cấu trúc phân lớp rõ ràng để dễ dàng rập khuôn (scale) và thêm hàng loạt tool mới.
- Đảm bảo tính độc lập tuyệt đối: Lỗi vòng đời ở một công cụ (Tool) cục bộ không được phép làm sập (crash) hay đóng băng toàn bộ ứng dụng (sử dụng Error Boundaries).

## 3. Chân dung Người dùng (User Personas)

- **Software Engineers / Developers:** Thường xuyên cần các công cụ xử lý định dạng chuẩn (JSON Format/Validate), mã hóa/bảo mật (Base64 Encode/Decode), format code.
- **UI/UX Designers:** Cần các công cụ tùy biến màu sắc (Color Picker), palette generator, chuyển đổi định dạng hình ảnh, thao tác CSS utils.
- **Content Creators / Writers:** Có nhu cầu chuyển đổi nhanh định dạng tài liệu (Markdown to DOCX), thống kê ký tự văn bản.
- **Người dùng cá nhân:** Cần một website sạch, hiện đại, truy cập nhanh các tiện ích chung mà không gặp quảng cáo rác (ad-free).

## 4. Yêu cầu Chức năng (Functional Requirements)

### 4.1. Core Framework & App Layout

- **Giao diện Chung (App Shell):** Bao gồm thẻ Sidebar bên trái chứa phân nhóm điều hướng (Navigation), Header vùng trên chứa Breadcrumb + Theme Toggle + Tìm kiếm nhanh, và App Content là vùng làm việc của từng công cụ.
- **Hệ thống Điều hướng (Navigation):** Sidebar hiển thị menu dưới dạng đa cấp (multi-level), chia công cụ theo danh mục (Ví dụ: Developer, Design, Text, Converter).
- **Công cụ Tìm kiếm (Search Engine):** Cho phép người dùng gõ từ khóa, tìm kiếm tức thời các công cụ trong hệ thống. (Sẽ tích hợp Command Palette - Ctrl+K).
- **Hệ sinh thái Plugin (Tool Registry):** Danh sách công cụ được tự động nhận diện và khởi tạo từ config phân tán thay vì gộp chung file.
- **Dark/Light Mode:** Hỗ trợ chuyển đổi sáng/tối thời gian thực với độ tương phản cao, áp dụng đồng nhất qua hệ thống màu Shadcn/UI (css variables).
- **Cách lý Lỗi (Error Isolation):** Mỗi trình công cụ được bao bọc bởi một bộ phận Bắt Lỗi (Error Boundary). Khi lỗi xảy ra cục bộ, chỉ duy nhất công cụ đó hiển thị Fallback UI thay vì màn hình trắng của React.

### 4.2. Tính năng Các Công cụ Hiện tại

Khởi điểm từ giai đoạn nguyên mẫu (MVP Phase), ứng dụng cần và đã tích hợp các công cụ sau:

1. **JSON Formatter**
   - Nhập một chuỗi định dạng JSON thô.
   - Tính năng Định dạng (Format) hoặc Nén lược bỏ khoảng trắng (Minify) đối với JSON.
   - Trình kiểm tra (Validate) để phát hiện và báo chính xác lỗi cú pháp.
   - Options cho phép cấu hình kích cỡ thụt lề (indent size) ở giao diện (UI) và sao chép.
2. **Base64 Encoder / Decoder**
   - Biến đổi mã hóa văn bản thuần sang bảng mã Base64.
   - Giải mã Base64 trở về bản văn bản gốc.
   - Tính năng "Swap" giúp tự động hoán đổi Input và Output.
3. **Color Picker**
   - Giao diện chọn màu trực quan (Native Color Input / Color Wheel hiện đại).
   - Hiển thị danh sách các dải màu có sẵn (Presets / Tailwind colors).
   - Tự động hiển thị và chuyển đổi qua lại giữa nhiều định dạng màu song song (HEX, RGB, HSL).
4. **Markdown to DOCX Converter (`md-to-docx`)**
   - Hỗ trợ công cụ chuyển đổi tức thì từ văn bản Markdown của người dùng sang dạng tài liệu văn phòng Microsoft Word (.docx).
   - Cung cấp tính năng download file đầu ra cho người dùng biên tập tiếp.
5. **Settings Module**
   - Bảng trung tâm cài đặt (Settings Panel) cho phép điều chỉnh tùy biến các tuỳ chọn ứng dụng và ứng dụng con.

## 5. Yêu cầu Phi chức năng (Non-functional Requirements)

- **Hiệu năng Nạp tải (Performance & Lazy Load):** Chỉ tải UI/logic của một Tool về client bằng Dynamic Imports (React Suspense) ngay thời điểm người dùng truy cập. Việc này giúp App Framework ban đầu cực nhỏ.
- **Tính Phản hồi (Responsiveness):** Đáp ứng tốt trên thiết bị di động. Sidebar có khả năng đóng/mở (collapsible) để tối đa hoá không gian cho công cụ dạng Editor.
- **Công nghệ Đồng nhất (Tech-Stack Unified):** Sử dụng chuẩn Next.js 16 (App Router), TailwindCSS v4, Zustand cho Global State, React Query (nếu có Server Data API) và Radix-UI (Shadcn) cho tính tiếp cận (a11y).
- **Tính Dễ bảo trì (Maintainable Standard):** Mọi công cụ (Tool module) phải tuân thủ nghiêm ngặt 4 lớp (Thư mục components, hooks, models, services). Component UI chỉ để render, Business logic được nạp qua Hooks.

## 6. Lộ trình Phát triển (Product Roadmap)

- **Phase 1 (MVP) - Đã hoàn thành:** Hoàn thành kết cấu nền (Next.js config), AppShell, Tool Registry Engine, và tích hợp 3 tính năng gốc chuẩn mực theo template (JSON Format, Base64, Color Picker).
- **Phase 2 (Core Features):** Hoàn thiện Command Palette, Pin Favorites, Responsive đầy đủ cho thiết bị Tablet/Mobile, Tích hợp hoàn thiện module chuyển đổi `md-to-docx` và Settings global.
- **Phase 3 (Enhancements):**
  - Thêm tương tác Animations / Micro-interactions bằng (Framer Motion).
  - Tích hợp 3D Utilities (Three.js) như 3D File Viewer.
  - Khả năng dùng ngoại tuyến cho số công cụ cơ bản (PWA/Offline Support).
  - Đa ngôn ngữ (i18n).
- **Phase 4 (Ecosystem/Advancement):**
  - Mở rộng "Plugin Marketplace" để cộng đồng nạp tool nhanh chóng.
  - Cấu hình (Settings Sync) thông qua Server Database.
  - Tích hợp AI (Gợi ý tham số, tự động tạo format theo yêu cầu ngôn ngữ tự nhiên).
