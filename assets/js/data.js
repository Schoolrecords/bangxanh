/* =========================================================================
   BẢNG XANH — CẤU HÌNH CHUNG
   -------------------------------------------------------------------------
   ⚠ LINK BÀI GIẢNG và DANH SÁCH MÔN HỌC nằm ở file  assets/js/links.js
   File này chỉ chứa: thông tin giáo viên, bộ sưu tập, lịch mẫu,
   tài liệu hướng dẫn và thông báo.
   ========================================================================= */

window.BANG_XANH = {

  app: {
    ten: "Bảng Xanh",
    khauHieu: "Giáo án trình chiếu PPT",
    giaoVien: { ten: "Hoàng Thị Mai", truong: "Trường Tiểu học Bảng Xanh", lopChuNhiem: "3A" },
    boSachChinh: "Kết nối tri thức với cuộc sống"
  },

  soTuan: 35,

  /* ---------- NĂM HỌC ----------
     Sửa mỗi năm một lần. App tự tính "tuần hiện tại" từ ngày khai giảng
     rồi tô sáng đúng ô tuần đang dạy. Viết theo dạng NĂM-THÁNG-NGÀY.

     ⚠ QUAN TRỌNG — mục "nghi":
     Những tuần nghỉ (Tết, nghỉ giữa kì…) KHÔNG được tính là tuần học.
     Nếu bỏ trống, sau Tết app sẽ báo tuần lớn hơn tuần dạy thật khoảng
     2 tuần. Thầy cô sửa lại đúng lịch nghỉ mà trường thông báo.
     Mỗi dòng là một khoảng nghỉ, viết ngày đầu và ngày cuối.            */
  namHoc: {
    ten: "2026 – 2027",
    khaiGiang: "2026-09-07",
    nghi: [
      { ten: "Nghỉ Tết Nguyên đán", tu: "2027-02-08", den: "2027-02-21" }
    ]
  },

  hocKy: [
    { ten: "Học kì 1", tu: 1,  den: 18 },
    { ten: "Học kì 2", tu: 19, den: 35 }
  ],

  /* ---------- BỘ SƯU TẬP ----------
     Xếp bài vào bộ sưu tập bằng cách ghi  tap: "mã"  trong links.js  */
  boSuuTap: [
    { id:"tuong-tac",   ten:"Bài giảng tương tác",   anh:"col-1.png", moTa:"Bài có trò chơi, câu hỏi tương tác ngay trong tiết dạy." },
    { id:"stem",        ten:"Bài giảng STEM",        anh:"col-2.png", moTa:"Tiết học gắn với thực hành, khám phá, chế tạo." },
    { id:"theo-chu-de", ten:"Bài giảng theo chủ đề", anh:"col-3.png", moTa:"Gom theo chủ đề lớn của chương trình." },
    { id:"trai-nghiem", ten:"Hoạt động trải nghiệm", anh:"col-4.png", moTa:"Sinh hoạt dưới cờ, sinh hoạt lớp, chủ điểm tháng." },
    { id:"ky-nang",     ten:"Kỹ năng sống",          anh:"col-5.png", moTa:"An toàn, ứng xử, tự phục vụ." }
  ],

  /* ---------- LỊCH BÁO GIẢNG MẪU (thu 2..7) ---------- */
  lichDay: [
    { thu:2, tiet:1, mon:"toan",   lop:3, tuan:1 },
    { thu:2, tiet:2, mon:"tviet",  lop:3, tuan:1 },
    { thu:3, tiet:1, mon:"toan",   lop:3, tuan:1 },
    { thu:3, tiet:3, mon:"tinhoc", lop:3, tuan:1 },
    { thu:4, tiet:2, mon:"tnxh",   lop:3, tuan:1 },
    { thu:5, tiet:1, mon:"tanh",   lop:3, tuan:1 },
    { thu:6, tiet:5, mon:"hdtn",   lop:3, tuan:1 }
  ],

  /* ---------- TÀI LIỆU HƯỚNG DẪN ---------- */
  huongDan: [
    { ten:"Lấy link bài giảng từ Google Drive", mau:"#2f6fed", buoc:[
      "Mở Google Drive, tìm file trình chiếu cần dùng.",
      "Bấm chuột phải vào file → chọn Chia sẻ.",
      "Đổi 'Bị hạn chế' thành 'Bất kỳ ai có đường liên kết', vai trò Người xem.",
      "Bấm Sao chép đường liên kết."
    ]},
    { ten:"Gắn link vào app", mau:"#16a34a", buoc:[
      "Mở file assets/js/links.js bằng Notepad hoặc VS Code.",
      "Tìm mã môn cần thêm, rồi tới số lớp.",
      "Viết theo mẫu:  5: 'link Drive',   (5 là tuần thứ 5)",
      "Bấm Ctrl+S rồi F5 lại trang web là thấy ngay."
    ]},
    { ten:"Dạy trên lớp", mau:"#7c3aed", buoc:[
      "Vào môn → chọn lớp → bấm đúng ô tuần cần dạy.",
      "Link mở thẳng sang Google Drive trong tab mới.",
      "Muốn xem trước ngay trong app thì bấm nút con mắt trên ô tuần.",
      "Ô tuần vừa mở sẽ nằm ở mục 'Giáo án sử dụng gần đây' ngoài trang chủ."
    ]},
    { ten:"Ghim bài hay dùng", mau:"#db2777", buoc:[
      "Bấm hình trái tim trên ô tuần để ghim vào mục Yêu thích.",
      "Vào Lịch dạy để xếp tuần vào từng tiết trong tuần.",
      "Yêu thích và lịch dạy lưu trong máy đang dùng."
    ]}
  ],

  thongBao: [
    { ten:"Chào mừng thầy cô đến với Bảng Xanh", moTa:"Vào một môn bất kỳ để xem 5 khối lớp và 35 tuần học.", thoiGian:"Hôm nay" },
    { ten:"Cách gắn link nhanh", moTa:"Mở file assets/js/links.js rồi dán link Google Drive vào đúng môn – lớp – tuần.", thoiGian:"Hôm nay" },
    { ten:"Mẹo nhỏ", moTa:"Bấm trái tim trên ô tuần để ghim bài hay dùng.", thoiGian:"Hôm qua" }
  ]
};
