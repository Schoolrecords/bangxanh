# Handoff: Bảng Xanh — Trang chủ (Giáo án trình chiếu PPT)

## Overview
Trang chủ của app "Bảng Xanh" — trợ lý giáo án trình chiếu PPT cho giáo viên tiểu học (Việt Nam). Gồm: sidebar điều hướng, thanh tìm kiếm + tài khoản, hero banner, 6 lối tắt, giáo án theo môn học, bộ sưu tập nổi bật, giáo án gần đây, banner bộ sách, và bottom tab bar.

## About the Design Files
`index.html` + `assets/` là **bản thiết kế tham chiếu bằng HTML/CSS tĩnh** — không phải production code. Nhiệm vụ: **tái tạo giao diện này trong môi trường codebase đích** (React, Vue, Flutter, native…) theo pattern sẵn có; nếu chưa có codebase, hãy chọn framework phù hợp (gợi ý: React + Vite hoặc Next.js) và triển khai từ đầu, dùng file này làm chuẩn pixel.

## Fidelity
**High-fidelity.** Tái tạo pixel-perfect: màu, chữ, bo góc, đổ bóng lấy đúng từ CSS trong `index.html`.

## Screens / Views
### Trang chủ (duy nhất trong bản này)
- Khung tổng: max-width 1400px (desktop), nền `#eef4fa`, 2 cột flex gap 16px (sidebar 222px + main flex:1), padding 16px 12px.
- Font: **UTM Avo** (nhúng qua fonts.cdnfonts.com, fallback Nunito). Lưu ý bản quyền UTM Avo khi dùng production — nên tự host file font hợp lệ.

**Sidebar** (thẻ trắng bo 18px):
- Logo lá xanh + "Bảng Xanh" (20px/900, `#16a34a`) + tagline 11px `#64748b`.
- Menu: Trang chủ (active: gradient xanh dương `#2f6fed→#3b82f6`, chữ trắng, bo 12px), rồi Giáo án, Bộ sưu tập, Chủ đề, Lớp học, Yêu thích, Lịch dạy, Tài liệu hướng dẫn (14.5px/700, `#475569`, hover `#f1f5f9`).
- Card "Nâng cấp Pro" (nền `#effaf2→#e4f6ea`, viền `#d3eedd`, nút gradient xanh lá).
- Card "Trung tâm hỗ trợ" (trắng, nút outline "Xem ngay").
- Ảnh cô giáo `assets/teacher.png` (mix-blend-mode: multiply).

**Top bar**: ô tìm kiếm pill trắng (placeholder "Tìm kiếm giáo án, bài giảng, chủ đề..."), nút pill "Nâng cấp Pro" (gradient `#22a55b→#16a34a`, sao vàng `#ffd34d`), chuông + badge đỏ "3" (`#ef4444`), avatar + "Hoàng Thị Mai" + chevron.

**Hero** (bo 20px, gradient `100deg #f2f7fe→#e3edfb→#dbe8fa`, min-height 340px):
- H1 31px/900 `#1d3f74`: "Trợ lý giáo án trình chiếu PPT cho giáo viên tiểu học".
- 2 dòng tick xanh: "Thiết kế đẹp – Dễ dùng – Bám sát chương trình GDPT mới" / "Giúp thầy cô tiết kiệm thời gian, nâng cao hiệu quả giảng dạy."
- CTA pill "Bắt đầu ngay" (gradient `#2fae62→#22a55b`, 16px/800).
- 3 feature nhỏ (ô icon 38px bo 11px, gradient tím/xanh lá/xám): "Chuẩn chương trình GDPT 2018", "Dễ chỉnh sửa linh hoạt", "Tiết kiệm thời gian hiệu quả".
- Ảnh `assets/hero.png` absolute phải, mask fade trái 14%; 3 dot phân trang (active `#2f6fed`).

**Lối tắt** (grid 6 cột, gap 14px): thẻ trắng bo 16px, icon 46px bo 13px gradient — Trợ lý AI (xanh dương), Lịch báo giảng (xanh lá), Kho bài giảng (vàng), Yêu thích (hồng), Tải lên (xanh), Xem tất cả (tím). Hover: nâng 2px + bóng.

**Header section** (dùng chung 3 mục): thanh dọc 4×22px `#22a55b` + tiêu đề 20px/900 + link "Xem tất cả" xanh lá kèm nút chevron tròn `#e8f6ee`.

**Giáo án theo môn học** (grid 4 cột, gap 16px): mỗi thẻ bo 16px, phần trên nền gradient màu môn + tên môn 20px/900 + ảnh minh họa; footer trắng "Khám phá ngay →" cùng màu môn.
- Toán `#2563eb` / nền `#eaf3fe→#dceafc`
- Tiếng Việt `#16a34a` / `#ecf9ef→#e0f4e6`
- Tiếng Anh `#db2777` / `#fdeef5→#fbe2ee`
- Tin học `#ea580c` / `#fef3e8→#fdeada`

**Bộ sưu tập nổi bật** (grid 5 cột, gap 14px): thẻ trắng bo 14px, ảnh 106px bo 9px, tên 13.5px/800, "N giáo án" 12px `#94a3b8`. Dữ liệu: Bài giảng tương tác (128), Bài giảng STEM (95), Bài giảng theo chủ đề (152), Hoạt động trải nghiệm (88), Kỹ năng sống (76).

**Giáo án sử dụng gần đây** (grid 4 cột): thẻ nền `#f4f8fc` bo 14px, ô "PPT" 36px gradient màu môn, tiêu đề 13.5px/800, meta 12px/700 `#64748b`, dòng thời gian kèm icon đồng hồ.

**Banner**: nền `#e4f6ea`, viền `#d3eedd`, bo 12px: "Chỉ 1 bộ sách: **Kết nối tri thức với cuộc sống** – Đồng hành cùng thầy cô trên mọi tiết dạy."

**Bottom tab bar**: sticky bottom, trắng, bo trên 22px, bóng hắt lên; 5 tab: Trang chủ (active `#16a34a`), Tìm kiếm, Lớp học của tôi, Yêu thích, Tài khoản (inactive `#94a3b8`), icon 22px + nhãn 12px/800.

## Responsive
- ≥900px (desktop): sidebar hiển thị, bottom tab bar ẩn, khung max-width 1400px.
- <900px (mobile): sidebar ẩn, logo hiện trên đầu main, search xuống hàng full-width, hero ảnh xuống dưới chữ, lưới: lối tắt 3 cột, môn học 2, bộ sưu tập 2, gần đây 1 cột; bottom tab bar hiện (sticky).

## Interactions & Behavior
- Bản tĩnh: hover states có sẵn trong CSS (`:hover` trên nav, quick-card, subj, col-card, recent, buttons).
- Cần triển khai: điều hướng sidebar/tab, tìm kiếm, carousel hero (3 slide theo dots), dropdown tài khoản, badge thông báo động.

## State Management
- `notifCount` (số thông báo, hiện = 3), `activeNav`/`activeTab`, `heroSlide` (0–2), `user {name, avatar}`, danh sách môn học / bộ sưu tập / giáo án gần đây fetch từ API.

## Design Tokens
- Nền trang `#eef4fa`; thẻ trắng `#fff`, viền `#eaf0f6` / `#e2e8f0`.
- Xanh lá chủ đạo: `#22a55b`, `#16a34a`, đậm `#166534`; nền nhạt `#e8f6ee`, `#e4f6ea`, viền `#d3eedd`.
- Xanh dương: `#2f6fed`, `#3b82f6`, `#2563eb`; navy chữ hero `#1d3f74`.
- Chữ: `#1e293b` chính, `#475569`/`#64748b` phụ, `#94a3b8` mờ. Đỏ badge `#ef4444`.
- Bo góc: 18px card sidebar, 16–20px card lớn, 12–14px card nhỏ, 999px pill.
- Bóng: `0 1px 3px rgba(30,64,120,.06)` mặc định; hover `0 8px 20px rgba(30,64,120,.13)`.
- Font: UTM Avo (fallback Nunito); tiêu đề section 20px/900, body 13–14.5px/600–800.

## Assets
`assets/` — cắt từ ảnh thiết kế gốc (minh họa AI): `hero.png` (448×338), `teacher.png`, `avatar.png`, `subj-*.png` (4 môn), `col-1..5.png` (bộ sưu tập). Icon là SVG inline trong HTML. Khi làm thật nên thay bằng ảnh chất lượng cao hơn.

## Files
- `index.html` — toàn bộ trang (HTML + CSS trong `<style>`, không JS).
- `assets/` — 12 ảnh PNG.
