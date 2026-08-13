// ====== CẤU HÌNH LINK GOOGLE DRIVE ======
// Anh dán link Drive cho từng tuần vào đây.
// Cấu trúc: DRIVE_LINKS[mã môn][lớp][tuần] = "https://drive.google.com/..."
// Mã môn: toan | tviet | tanh | tinhoc. Lớp: 1-5. Tuần: 1-35.
// Tuần chưa có link sẽ hiển thị mờ kèm chữ "Sắp có".
window.SUBJECTS = {
  toan:   { name: 'Toán',       color: '#2563eb', bg: 'linear-gradient(180deg,#eaf3fe,#dceafc)', img: 'assets/subj-toan.png' },
  tviet:  { name: 'Tiếng Việt', color: '#16a34a', bg: 'linear-gradient(180deg,#ecf9ef,#e0f4e6)', img: 'assets/subj-tviet.png' },
  tanh:   { name: 'Tiếng Anh',  color: '#db2777', bg: 'linear-gradient(180deg,#fdeef5,#fbe2ee)', img: 'assets/subj-tanh.png' },
  tinhoc: { name: 'Tin học',    color: '#ea580c', bg: 'linear-gradient(180deg,#fef3e8,#fdeada)', img: 'assets/subj-tinhoc.png' }
};
window.DRIVE_LINKS = {
  toan: {
    1: { 1: '', 2: '', 3: '' /* ... tuần 4-35 */ },
    2: {},
    3: { 1: 'https://drive.google.com/drive/folders/VI_DU_THAY_LINK_NAY' },
    4: {},
    5: {}
  },
  tviet: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} },
  tanh:  { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} },
  tinhoc:{ 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }
};
