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

  /* ---------- THỜI KHOÁ BIỂU (thứ 2..7, tiết 1..5) ----------
     Mỗi dòng chỉ ghi môn và lớp — tiết đó lặp lại ở mọi tuần, app tự lấy
     bài giảng của tuần đang xem. Chỉ thêm "tuan: 5" khi muốn ghim cứng
     một tiết vào đúng tuần 5.                                            */
  lichDay: [
    { thu:2, tiet:1, mon:"toan",   lop:3 },
    { thu:2, tiet:2, mon:"tviet",  lop:3 },
    { thu:3, tiet:1, mon:"toan",   lop:3 },
    { thu:3, tiet:3, mon:"tinhoc", lop:3 },
    { thu:4, tiet:2, mon:"tnxh",   lop:3 },
    { thu:5, tiet:1, mon:"tanh",   lop:3 },
    { thu:6, tiet:5, mon:"hdtn",   lop:3 }
  ],

  /* ---------- TÀI LIỆU HƯỚNG DẪN ----------
     Viết cho thầy cô dùng app, không nói tới file hay mã nguồn.
     Phần kỹ thuật nằm ở HUONG-DAN-SU-DUNG.md trong thư mục app.        */
  huongDan: [
    { ten:"Mở bài giảng để dạy", mau:"#2f6fed", buoc:[
      "Vào mục Giáo án, chọn môn cần dạy.",
      "Chọn khối lớp đang dạy.",
      "Bấm vào ô tuần — bài giảng mở thẳng trên Google Drive.",
      "Ô có biểu tượng màu là đã có bài, ô xám là tuần chưa có."
    ]},
    { ten:"Xem trước và tải về phòng khi mất mạng", mau:"#16a34a", buoc:[
      "Rê chuột lên ô tuần, bấm hình con mắt để xem ngay trong app.",
      "Trong khung xem trước có nút Tải xuống — tải sẵn ở nhà.",
      "Bấm Trình chiếu trên Drive để dạy toàn màn hình.",
      "Ô tuần vừa mở sẽ nằm ở mục Giáo án sử dụng gần đây ngoài trang chủ."
    ]},
    { ten:"Ghim bài và xếp lịch báo giảng", mau:"#7c3aed", buoc:[
      "Bấm hình trái tim trên ô tuần để ghim vào mục Yêu thích.",
      "Vào Lịch dạy, bấm dấu cộng để xếp môn vào từng tiết.",
      "Thời khoá biểu lặp lại hằng tuần, không phải xếp lại mỗi tuần.",
      "Đến giờ chỉ cần bấm Dạy là bài mở lên."
    ]},
    { ten:"Cài Bảng Xanh lên máy như một app", mau:"#db2777", buoc:[
      "Mở Bảng Xanh bằng Chrome hoặc Microsoft Edge.",
      "Bấm biểu tượng Cài đặt ở cuối thanh địa chỉ.",
      "App hiện ra như phần mềm riêng, có biểu tượng ngoài màn hình.",
      "Cài rồi thì mất mạng vẫn mở được app để xem lịch và bài đã tải."
    ]}
  ],

  thongBao: [
    { ten:"Chào mừng thầy cô đến với Bảng Xanh", moTa:"Vào một môn bất kỳ để xem 5 khối lớp và 35 tuần học.", thoiGian:"Hôm nay" },
    { ten:"Dạy nhanh hơn mỗi sáng", moTa:"Vào Lịch dạy xếp sẵn thời khoá biểu, đến tiết chỉ cần bấm Dạy.", thoiGian:"Hôm nay" },
    { ten:"Mẹo nhỏ", moTa:"Bấm trái tim trên ô tuần để ghim bài hay dùng vào mục Yêu thích.", thoiGian:"Hôm qua" }
  ]
};
