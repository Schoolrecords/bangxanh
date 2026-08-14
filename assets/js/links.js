/* ============================================================================
   ====== CẤU HÌNH LINK GOOGLE DRIVE ======

   ĐÂY LÀ FILE DUY NHẤT CẦN SỬA KHI THÊM BÀI GIẢNG.
   Mở bằng Notepad hoặc VS Code, sửa xong bấm Ctrl+S rồi F5 lại trang web.

   Cấu trúc:  DRIVE_LINKS[mã môn][lớp][tuần] = "https://drive.google.com/..."

   Mã môn:  toan · tviet · tanh · tinhoc · daoduc · tnxh · khoahoc
            lsdl · congnghe · mithuat · amnhac · hdtn · gdtc
   Lớp:     1 → 5          Tuần: 1 → 35

   Tuần chưa có link sẽ hiển thị mờ kèm chữ "Sắp có".

   ⚠ Trên Google Drive nhớ chia sẻ file ở chế độ
     "Bất kỳ ai có đường liên kết – Người xem",
     nếu không máy ở lớp sẽ báo "Bạn cần quyền truy cập".

   Muốn ghi thêm tên bài / xếp vào bộ sưu tập thì viết dạng đầy đủ:
     3: { link: "https://...", ten: "Bài 12: Bảng nhân 7", tap: "stem" }
   Mã bộ sưu tập: tuong-tac · stem · theo-chu-de · trai-nghiem · ky-nang
   ============================================================================ */

/* Thứ tự viết ở đây chính là thứ tự hiện ra khắp app: trang chủ, kho giáo
   án, danh sách môn của từng khối lớp và các ô chọn môn. Muốn đổi chỗ môn
   nào thì cắt cả dòng đó dán lên trên hoặc xuống dưới.                   */
window.SUBJECTS = {
  tviet:    { name:'Tiếng Việt',            color:'#16a34a', bg:'linear-gradient(180deg,#ecf9ef,#e0f4e6)', img:'subj-tviet.png',    lop:[1,2,3,4,5] },
  toan:     { name:'Toán',                  color:'#2563eb', bg:'linear-gradient(180deg,#eaf3fe,#dceafc)', img:'subj-toan.png',     lop:[1,2,3,4,5] },
  tinhoc:   { name:'Tin học',               color:'#ea580c', bg:'linear-gradient(180deg,#fef3e8,#fdeada)', img:'subj-tinhoc.png',   lop:[3,4,5]     },
  congnghe: { name:'Công nghệ',             color:'#475569', bg:'linear-gradient(180deg,#f2f6fb,#e5ecf5)', img:'mon-cong-nghe.svg', lop:[3,4,5]     },
  tanh:     { name:'Tiếng Anh',             color:'#db2777', bg:'linear-gradient(180deg,#fdeef5,#fbe2ee)', img:'subj-tanh.png',     lop:[1,2,3,4,5] },
  tnxh:     { name:'Tự nhiên và Xã hội',    color:'#0f766e', bg:'linear-gradient(180deg,#eafaf7,#d9f4ee)', img:'mon-tnxh.svg',      lop:[1,2,3]     },
  khoahoc:  { name:'Khoa học',              color:'#0369a1', bg:'linear-gradient(180deg,#eaf5fe,#d9ecfb)', img:'mon-khoa-hoc.svg',  lop:[4,5]       },
  lsdl:     { name:'Lịch sử và Địa lí',     color:'#a16207', bg:'linear-gradient(180deg,#fdf8ea,#faeecd)', img:'mon-lsdl.svg',      lop:[4,5]       },
  daoduc:   { name:'Đạo đức',               color:'#7c3aed', bg:'linear-gradient(180deg,#f4f1fe,#e9e2fd)', img:'mon-dao-duc.svg',   lop:[1,2,3,4,5] },
  hdtn:     { name:'Hoạt động trải nghiệm', color:'#ea580c', bg:'linear-gradient(180deg,#fff5e9,#fde9d5)', img:'mon-hdtn.svg',      lop:[1,2,3,4,5] },
  mithuat:  { name:'Mĩ thuật',              color:'#c026d3', bg:'linear-gradient(180deg,#fdf0fd,#fadcfa)', img:'mon-mi-thuat.svg',  lop:[1,2,3,4,5] },
  amnhac:   { name:'Âm nhạc',               color:'#6d28d9', bg:'linear-gradient(180deg,#f5f3ff,#e9e4fd)', img:'mon-am-nhac.svg',   lop:[1,2,3,4,5] },
  gdtc:     { name:'Giáo dục thể chất',     color:'#0891b2', bg:'linear-gradient(180deg,#eafaff,#d5f1fb)', img:'mon-gdtc.svg',      lop:[1,2,3,4,5] }
};


/* ==========================================================================
   ↓↓↓  DÁN LINK CỦA THẦY CÔ VÀO ĐÂY  ↓↓↓
   ========================================================================== */

window.DRIVE_LINKS = {

  tviet: {
    1: {},
    2: {},
    3: {
      // 1: 'https://drive.google.com/file/d/XXXXXXXX/view?usp=sharing',
      // 2: 'https://docs.google.com/presentation/d/XXXXXXXX/edit',
    },
    4: {},
    5: {}
  },

  toan:     { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} },
  tinhoc:   { 3:{}, 4:{}, 5:{} },
  congnghe: { 3:{}, 4:{}, 5:{} },
  tanh:     { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} },
  tnxh:     { 1:{}, 2:{}, 3:{} },
  khoahoc:  { 4:{}, 5:{} },
  lsdl:     { 4:{}, 5:{} },
  daoduc:   { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} },
  hdtn:     { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} },
  mithuat:  { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} },
  amnhac:   { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} },
  gdtc:     { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} }

};

/* ==========================================================================
   ↑↑↑  DÁN XONG NHỚ BẤM CTRL+S RỒI F5 LẠI TRANG WEB  ↑↑↑

   VÍ DỤ ĐẦY ĐỦ:

   toan: {
     3: {
       1: 'https://drive.google.com/file/d/1AbC.../view?usp=sharing',
       2: 'https://docs.google.com/presentation/d/1AbC.../edit',
       5: { link: 'https://drive.google.com/drive/folders/1AbC...',
            ten: 'Bài 12: Bảng nhân 7', tap: 'stem' }
     }
   },
   ========================================================================== */

/* Viết tắt cũ vẫn dùng được, không cần sửa lại */
window.SUBJECT_ALIAS = {
  "tieng-viet":"tviet", "tieng-anh":"tanh", "tin-hoc":"tinhoc", "dao-duc":"daoduc",
  "khoa-hoc":"khoahoc", "cong-nghe":"congnghe", "mi-thuat":"mithuat", "am-nhac":"amnhac"
};
