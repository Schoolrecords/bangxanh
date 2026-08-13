# 🌿 Bảng Xanh — App giáo án trình chiếu PPT cho tiểu học

**Trên web:** https://schoolrecords.github.io/bangxanh
**Trên máy:** bấm đúp `index.html` là chạy, không cần cài gì.

> Giao diện dựng bám theo bản thiết kế trong thư mục **`design_handoff_bang_xanh`**
> (`index.html` = trang chủ, `mon.html` = chọn lớp, `tuan.html` = 35 tuần).

## Luồng sử dụng

```
Trang chủ → Môn học → Lớp 1..5 → 35 tuần (Học kì 1 + Học kì 2) → bấm tuần → mở Google Drive
```

Tuần có **chấm xanh + “Mở Drive”** là đã có bài. Tuần mờ ghi **“Sắp có”** là chưa gắn link — bấm vào để gắn nhanh.
Rê chuột lên ô tuần sẽ hiện 2 nút nhỏ: 👁 xem trước ngay trong app, ♡ ghim vào Yêu thích.

## Thêm bài giảng — chỉ sửa 1 file

Mở **`assets/js/links.js`** bằng Notepad. Cấu trúc:

```js
DRIVE_LINKS[mã môn][lớp][tuần] = "https://drive.google.com/..."
```

Ví dụ — môn Toán, lớp 3, tuần 1 và 2:

```js
toan: {
  3: {
    1: 'https://drive.google.com/file/d/XXXX/view?usp=sharing',
    2: 'https://docs.google.com/presentation/d/XXXX/edit',
  }
},
```

Muốn ghi thêm tên bài hoặc xếp vào bộ sưu tập:

```js
5: { link: 'https://...', ten: 'Bài 12: Bảng nhân 7', tap: 'stem' },
```

Lưu lại (Ctrl+S) rồi F5 trang web là thấy ngay.

> ⚠️ Trên Google Drive phải chia sẻ file ở chế độ **“Bất kỳ ai có đường liên kết – Người xem”**, nếu không máy ở lớp sẽ báo *“Bạn cần quyền truy cập”*.
> App tự nhận mọi kiểu link: `/file/d/…/view`, `/presentation/d/…`, `open?id=…`, `uc?id=…`, và cả link thư mục `/folders/…`.

### Mã môn

| Mã | Môn | Lớp | Mã | Môn | Lớp |
|---|---|---|---|---|---|
| `toan` | Toán | 1–5 | `daoduc` | Đạo đức | 1–5 |
| `tviet` | Tiếng Việt | 1–5 | `tnxh` | Tự nhiên và Xã hội | 1–3 |
| `tanh` | Tiếng Anh | 1–5 | `khoahoc` | Khoa học | 4–5 |
| `tinhoc` | Tin học | 3–5 | `lsdl` | Lịch sử và Địa lí | 4–5 |
| `mithuat` | Mĩ thuật | 1–5 | `congnghe` | Công nghệ | 3–5 |
| `amnhac` | Âm nhạc | 1–5 | `hdtn` | Hoạt động trải nghiệm | 1–5 |
| `gdtc` | Giáo dục thể chất | 1–5 | | | |

Mã bộ sưu tập: `tuong-tac` · `stem` · `theo-chu-de` · `trai-nghiem` · `ky-nang`

Gõ sai mã môn / lớp / tuần / link, app báo rõ sai ở đâu trong mục **Tài khoản** — không âm thầm bỏ qua.

## Các mục trong app

| Mục | Nội dung |
|---|---|
| **Trang chủ** | Banner, 6 lối tắt, 4 môn nổi bật, bộ sưu tập, bài mở gần đây |
| **Giáo án** | Lưới 13 môn học — cổng vào chính |
| **Bộ sưu tập** | 5 nhóm theo mục đích dùng (gắn bằng `tap` trong links.js) |
| **Tuần học** | Lưới 35 tuần, bấm 1 tuần thấy bài của **mọi môn** trong tuần đó |
| **Lớp học** | Vào theo khối 1–5, thấy các môn của khối đó |
| **Yêu thích** | Các tuần đã ghim bằng nút trái tim |
| **Lịch dạy** | Bảng tiết trong tuần, bấm **▶ Dạy** là mở bài |
| **Trợ lý AI** | Sinh khung 4 hoạt động tiết dạy (mẫu dựng sẵn, chạy offline — không phải AI thật) |
| **Tìm kiếm** | Gõ không dấu: “toan 3”, “tuan 5”, “tieng viet” |
| **Tài khoản** | Đổi tên giáo viên/trường/lớp, kiểm tra lỗi link, xoá dữ liệu máy |

## Cấu trúc thư mục

```
Bảng Xanh/
├─ index.html            ← chạy app
├─ HUONG-DAN-SU-DUNG.md
├─ design_handoff_bang_xanh/   ← bản thiết kế gốc (để đối chiếu)
└─ assets/
   ├─ css/style.css      ← màu sắc, bố cục
   ├─ js/links.js        ← ⭐ LINK BÀI GIẢNG + danh sách môn
   ├─ js/data.js         ← giáo viên, bộ sưu tập, lịch mẫu, hướng dẫn
   ├─ js/app.js          ← phần xử lý
   └─ img/               ← 13 ảnh PNG bản thiết kế + 9 SVG môn phụ
```

## Cập nhật bản trên web

Sửa xong trong thư mục này thì chạy 3 lệnh (cần cài Git):

```bash
git add -A
git commit -m "Cập nhật bài giảng"
git push
```

Khoảng 1 phút sau là https://schoolrecords.github.io/bangxanh có bản mới.
