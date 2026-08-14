/* =========================================================================
   BẢNG XANH — phần xử lý
   Giao diện dựng theo bản thiết kế design_handoff_bang_xanh
   (index.html = trang chủ, mon.html = chọn lớp, tuan.html = 35 tuần)
   Luồng chính:  Môn học → Lớp (1-5) → 35 tuần → mở link Google Drive
   ========================================================================= */
(function () {
"use strict";

const D = window.BANG_XANH;
const SO_TUAN = D.soTuan || 35;

/* ============================ Tiện ích ============================ */
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const esc = s => String(s == null ? "" : s)
  .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
/* Kích thước ghi thẳng vào thẻ svg để gọi cỡ nào cũng đúng, không phụ thuộc
   việc CSS có sẵn lớp .icNN hay chưa. */
const ic  = (n, sz) => '<svg class="ic' + (sz = sz || 19) + '" width="' + sz + '" height="' + sz + '"><use href="#i-' + n + '"/></svg>';
const icf = (n, sz) => '<svg class="ic' + (sz = sz || 19) + ' fill" width="' + sz + '" height="' + sz + '"><use href="#f-' + n + '"/></svg>';
const anh = f => "assets/img/" + f;
const TICK = '<svg class="check-ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#22a55b"/>' +
             '<path d="m7.5 12.5 3 3 6-6.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function toast(msg, kind){
  const t = document.createElement("div");
  t.className = "toast " + (kind || "");
  t.innerHTML = (kind === "ok" ? ic("check",17) : kind === "err" ? ic("x",17) : "") + "<span>" + esc(msg) + "</span>";
  $("#toastRoot").appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; t.style.transition = ".3s"; }, 2200);
  setTimeout(() => t.remove(), 2600);
}

function copyText(text){
  const done = () => toast("Đã sao chép", "ok");
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
  function fallback(){
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); }
    catch(e){ toast("Trình duyệt chặn sao chép, thầy cô bôi đen rồi Ctrl+C giúp em", "err"); }
    ta.remove();
  }
}

/* ============================== Hộp thoại ============================== */
function openModal(o){
  closeModal();
  const w = document.createElement("div");
  w.className = "modal-bg";
  w.innerHTML =
    '<div class="modal' + (o.rong ? " modal-wide" : "") + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><h3>' + esc(o.title) + '</h3>' +
        '<button class="x-btn" data-close aria-label="Đóng">' + ic("x",17) + '</button></div>' +
      '<div class="modal-body">' + o.body + '</div>' +
      (o.foot ? '<div class="modal-foot">' + o.foot + '</div>' : '') +
    '</div>';
  w.addEventListener("click", e => { if (e.target === w || e.target.closest("[data-close]")) closeModal(); });
  $("#modalRoot").appendChild(w);
  if (o.onOpen) o.onOpen(w);
  return w;
}
const closeModal = () => { $("#modalRoot").innerHTML = ""; };
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ============================== Bộ nhớ máy ============================== */
const Store = {
  key: k => "bangxanh:" + k,
  get(k, d){ try { const v = localStorage.getItem(Store.key(k)); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(Store.key(k), JSON.stringify(v)); } catch(e){ toast("Không lưu được vào bộ nhớ máy", "err"); } }
};
const S = {
  fav:    Store.get("fav", []),
  recent: Store.get("recent", []),
  them:   Store.get("them", {}),
  lich:   Store.get("lich", []),
  me:     Store.get("me", null)
};
const save = k => Store.set(k, S[k]);
const me = () => S.me || D.app.giaoVien;

/* ======================= Danh sách môn (từ links.js) ======================= */
const SUB = window.SUBJECTS || {};
const ALIAS = window.SUBJECT_ALIAS || {};
const DB = {
  chuan: id => ALIAS[String(id||"").trim()] || String(id||"").trim(),
  mon0(id){
    const k = DB.chuan(id), s = SUB[k];
    if (!s) return null;
    return { id:k, ten:s.name, mau:s.color, nen:s.bg, img:s.img,
             lop:s.lop || [1,2,3,4,5], grad:"linear-gradient(135deg," + s.color + "cc," + s.color + ")" };
  },
  mon: id => DB.mon0(id) || { id:String(id||""), ten:String(id||"Khác"), mau:"#475569",
        nen:"linear-gradient(180deg,#f2f6fb,#e5ecf5)", img:"subj-toan.png", lop:[1,2,3,4,5],
        grad:"linear-gradient(135deg,#94a3b8,#475569)" },
  dsMon: () => Object.keys(SUB).map(k => DB.mon0(k)),
  monTheoLop: l => DB.dsMon().filter(m => m.lop.indexOf(Number(l)) >= 0),
  tap: id => D.boSuuTap.find(t => t.id === id) || null
};

const boDau = s => String(s||"").toLowerCase()
  .normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]","g"), "").replace(/đ/g,"d");

/* =========================== Link Google Drive =========================== */
const Drive = {
  parse(url){
    if (!url) return null;
    const u = String(url).trim(); let m;
    if ((m = u.match(/\/(presentation|document|spreadsheets)\/d\/([\w-]{8,})/)))
      return { id:m[2], loai: m[1]==="presentation" ? "slides" : m[1]==="document" ? "docs" : "sheets" };
    if ((m = u.match(/\/folders\/([\w-]{8,})/))) return { id:m[1], loai:"folder" };
    if ((m = u.match(/\/file\/d\/([\w-]{8,})/))) return { id:m[1], loai:"file" };
    if ((m = u.match(/[?&]id=([\w-]{8,})/)))     return { id:m[1], loai:"file" };
    if (/^[\w-]{20,}$/.test(u))                  return { id:u,    loai:"file" };
    return null;
  },
  xem(url){
    const p = Drive.parse(url); if (!p) return "";
    if (p.loai === "slides") return "https://docs.google.com/presentation/d/" + p.id + "/preview";
    if (p.loai === "docs")   return "https://docs.google.com/document/d/" + p.id + "/preview";
    if (p.loai === "sheets") return "https://docs.google.com/spreadsheets/d/" + p.id + "/preview";
    if (p.loai === "folder") return "https://drive.google.com/embeddedfolderview?id=" + p.id + "#grid";
    return "https://drive.google.com/file/d/" + p.id + "/preview";
  },
  mo(url){
    const p = Drive.parse(url); if (!p) return "";
    if (p.loai === "slides") return "https://docs.google.com/presentation/d/" + p.id + "/present";
    if (p.loai === "docs")   return "https://docs.google.com/document/d/" + p.id + "/edit";
    if (p.loai === "sheets") return "https://docs.google.com/spreadsheets/d/" + p.id + "/edit";
    if (p.loai === "folder") return "https://drive.google.com/drive/folders/" + p.id;
    return "https://drive.google.com/file/d/" + p.id + "/view";
  },
  tai(url){
    const p = Drive.parse(url); if (!p) return "";
    if (p.loai === "slides") return "https://docs.google.com/presentation/d/" + p.id + "/export/pptx";
    if (p.loai === "file")   return "https://drive.google.com/uc?export=download&id=" + p.id;
    return "";
  },
  tenLoai(url){
    const p = Drive.parse(url); if (!p) return "Chưa có link";
    return { slides:"Google Trang trình bày", docs:"Google Tài liệu", sheets:"Google Trang tính",
             folder:"Thư mục Drive", file:"Tệp trên Drive (PPT/PDF…)" }[p.loai];
  }
};

/* =========================== Kho bài giảng =========================== */
const K = (m,l,t) => m + "|" + l + "|" + t;
const tachK = k => { const p = String(k).split("|"); return { mon:p[0], lop:Number(p[1]), tuan:Number(p[2]) }; };

const Kho = {
  bang: {}, loi: [],
  nap(){
    Kho.bang = {}; Kho.loi = [];
    const DL = window.DRIVE_LINKS || {};
    Object.keys(DL).forEach(monRaw => {
      const mon = DB.chuan(monRaw);
      if (!DB.mon0(mon)) return Kho.loi.push('Không có mã môn "' + monRaw + '"');
      const byLop = DL[monRaw] || {};
      Object.keys(byLop).forEach(lopRaw => {
        const lop = Number(lopRaw);
        if (!(lop >= 1 && lop <= 5)) return Kho.loi.push(monRaw + ": lớp "  + lopRaw + " phải từ 1 đến 5");
        const byTuan = byLop[lopRaw] || {};
        Object.keys(byTuan).forEach(tRaw => {
          const tuan = Number(tRaw);
          if (!(tuan >= 1 && tuan <= SO_TUAN))
            return Kho.loi.push(monRaw + " lớp " + lop + ": tuần " + tRaw + " phải từ 1 đến " + SO_TUAN);
          const v = byTuan[tRaw];
          const o = (typeof v === "string") ? { link:v } : (v || {});
          const link = String(o.link || "").trim();
          if (!link) return;
          if (!Drive.parse(link))
            return Kho.loi.push(monRaw + " lớp " + lop + " tuần " + tuan + ": link không đúng dạng Google Drive");
          const tap = String(o.tap || "").trim();
          if (tap && !DB.tap(tap))
            Kho.loi.push(monRaw + " lớp " + lop + " tuần " + tuan + ': không có mã bộ sưu tập "' + tap + '"');
          Kho.bang[K(mon, lop, tuan)] = { link:link, ten:String(o.ten || "").trim(), tap:tap };
        });
      });
    });
  },
  o(mon, lop, tuan){
    const k = K(mon, lop, tuan), g = Kho.bang[k] || {}, t = S.them[k] || {};
    return { k:k, mon:mon, lop:Number(lop), tuan:Number(tuan),
             link: t.link || g.link || "", ten: t.ten || g.ten || "", tap: g.tap || "",
             tuTao: !!(t.link && !g.link) };
  },
  dsTuan(mon, lop){ const r = []; for (let t = 1; t <= SO_TUAN; t++) r.push(Kho.o(mon, lop, t)); return r; },
  tatCa(){
    const keys = {};
    Object.keys(Kho.bang).forEach(k => keys[k] = 1);
    Object.keys(S.them).forEach(k => keys[k] = 1);
    return Object.keys(keys).map(k => { const p = tachK(k); return Kho.o(p.mon, p.lop, p.tuan); })
      .filter(o => o.link || o.ten)
      .sort((a,b) => a.mon.localeCompare(b.mon) || a.lop - b.lop || a.tuan - b.tuan);
  },
  dem(f){
    f = f || {};
    return Kho.tatCa().filter(o => o.link
      && (!f.mon  || o.mon === f.mon)
      && (!f.lop  || o.lop === Number(f.lop))
      && (!f.tuan || o.tuan === Number(f.tuan))
      && (!f.tap  || o.tap === f.tap)).length;
  }
};

/* ===================== Tuần hiện tại của năm học =====================
   Tính từ ngày khai giảng trong data.js. Tuần luôn bắt đầu vào thứ Hai.
   Trả về 0 khi chưa tới năm học hoặc đã qua tuần cuối.                */
const NH = D.namHoc || {};
const NGAY = 86400000;
const ngay = s => { const d = new Date(String(s) + "T00:00:00"); return isNaN(d.getTime()) ? null : d; };
const homNay = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

function thuHaiDauNam(){
  const d = ngay(NH.khaiGiang); if (!d) return null;
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));   // lùi về thứ Hai
  return d;
}
/* Tuần bắt đầu bằng thứ Hai này có rơi vào kỳ nghỉ không? */
function laTuanNghi(thuHai){
  const cuoi = new Date(thuHai); cuoi.setDate(thuHai.getDate() + 6);
  return (NH.nghi || []).some(k => {
    const a = ngay(k.tu), b = ngay(k.den);
    return a && b && a <= cuoi && b >= thuHai;       // hai khoảng có giao nhau
  });
}
/* Duyệt từng tuần từ đầu năm học, bỏ qua tuần nghỉ.
   ham(soTuanDay, thuHai) trả về true thì dừng.                      */
function duyetTuan(ham){
  const d0 = thuHaiDauNam(); if (!d0) return;
  let n = 0;
  for (let i = 0; i < 100 && n < SO_TUAN; i++){
    const dau = new Date(d0); dau.setDate(d0.getDate() + i * 7);
    if (laTuanNghi(dau)) continue;
    if (ham(++n, dau)) return;
  }
}
/* Khoảng ngày của tuần dạy thứ n */
function mocTuan(n){
  let kq = null;
  duyetTuan((so, dau) => {
    if (so !== n) return false;
    const cuoi = new Date(dau); cuoi.setDate(dau.getDate() + 6);
    kq = { dau:dau, cuoi:cuoi }; return true;
  });
  return kq;
}
function tuanHienTai(){
  const nay = homNay(); let kq = 0;
  duyetTuan((so, dau) => {
    const cuoi = new Date(dau); cuoi.setDate(dau.getDate() + 6);
    if (nay >= dau && nay <= cuoi){ kq = so; return true; }
    return false;
  });
  return kq;
}
const TUAN_NAY = tuanHienTai();

/* Câu mô tả trạng thái năm học, dùng cho thẻ "Tuần này" ngoài trang chủ */
function trangThaiNamHoc(){
  const d0 = thuHaiDauNam();
  if (!d0) return { tuan:0, nhan:"Chưa đặt ngày khai giảng",
                    mo:"Mở file assets/js/data.js, mục namHoc để đặt ngày khai giảng." };
  const dd = x => x.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" });

  if (TUAN_NAY){
    const mt = mocTuan(TUAN_NAY);
    return { tuan:TUAN_NAY, nhan:"Tuần " + TUAN_NAY,
             mo:"Từ " + dd(mt.dau) + " đến " + dd(mt.cuoi) + " · năm học " + (NH.ten || "") };
  }

  const nay = homNay();
  if (nay < d0){
    const con = Math.ceil((d0 - nay) / NGAY);
    return { tuan:0, nhan:"Chưa vào năm học",
             mo:"Còn " + con + " ngày nữa tới tuần đầu của năm học " + (NH.ten || "") + "." };
  }
  /* Đang trong kỳ nghỉ giữa năm học */
  const k = (NH.nghi || []).find(x => { const a = ngay(x.tu), b = ngay(x.den); return a && b && nay >= a && nay <= b; });
  if (k) return { tuan:0, nhan:k.ten || "Đang nghỉ",
                  mo:"Từ " + dd(ngay(k.tu)) + " đến " + dd(ngay(k.den)) + ". Hết nghỉ app sẽ tự nhảy sang tuần kế tiếp." };

  return { tuan:0, nhan:"Đã hết " + SO_TUAN + " tuần",
           mo:"Năm học " + (NH.ten || "") + " đã xong. Cập nhật ngày khai giảng năm mới trong file data.js." };
}

function moTaThoiGian(ts){
  if (!ts) return "";
  const p = Math.floor((Date.now() - ts) / 60000);
  if (p < 1)  return "Vừa xong";
  if (p < 60) return p + " phút trước";
  const g = Math.floor(p / 60);
  if (g < 24) return g + " giờ trước";
  const n = Math.floor(g / 24);
  if (n === 1) return "Hôm qua";
  if (n < 30)  return n + " ngày trước";
  return new Date(ts).toLocaleDateString("vi-VN");
}

/* ============================== Hành động ============================== */
function toggleFav(k){
  const i = S.fav.indexOf(k);
  if (i >= 0){ S.fav.splice(i,1); toast("Đã bỏ ghim"); }
  else { S.fav.unshift(k); toast("Đã ghim vào Yêu thích", "ok"); }
  save("fav"); render();
}
function ghiNhanMo(k){
  S.recent = S.recent.filter(r => r.k !== k);
  S.recent.unshift({ k:k, ts:Date.now() });
  S.recent = S.recent.slice(0, 20);
  save("recent");
}

function xemTruoc(k){
  const p = tachK(k), o = Kho.o(p.mon, p.lop, p.tuan), m = DB.mon(o.mon);
  if (!o.link) return hopGanLink(k);
  ghiNhanMo(k);
  openModal({
    rong: true,
    title: m.ten + " lớp " + o.lop + " — Tuần " + o.tuan + (o.ten ? ": " + o.ten : ""),
    body: '<div class="viewer"><iframe src="' + esc(Drive.xem(o.link)) + '" allow="autoplay; fullscreen" allowfullscreen title="Xem bài giảng"></iframe></div>' +
          '<p class="hint">' + esc(Drive.tenLoai(o.link)) + '. Nếu báo “Bạn cần quyền truy cập”, thầy cô mở Google Drive ' +
          'chia sẻ lại file ở chế độ “Bất kỳ ai có đường liên kết”.</p>',
    foot: '<button class="btn-pill" data-close>Đóng</button>' +
          (Drive.tai(o.link) ? '<a class="btn-pill" href="' + esc(Drive.tai(o.link)) + '" target="_blank" rel="noopener">' + ic("download",15) + ' Tải xuống</a>' : '') +
          '<a class="btn-green" style="width:auto" href="' + esc(Drive.mo(o.link)) + '" target="_blank" rel="noopener">' + ic("play",15) + ' Trình chiếu trên Drive</a>'
  });
}

function hopGanLink(k){
  const p = tachK(k), o = Kho.o(p.mon, p.lop, p.tuan), m = DB.mon(o.mon);
  openModal({
    title: "Gắn link — " + m.ten + " lớp " + o.lop + ", tuần " + o.tuan,
    body:
      '<div class="form">' +
        '<div class="field"><label>Tên bài (không bắt buộc)</label>' +
          '<input class="input" id="gTen" value="' + esc(o.ten) + '" placeholder="VD: Bài 12: Phép cộng trong phạm vi 10"></div>' +
        '<div class="field"><label>Link Google Drive</label>' +
          '<input class="input" id="gLink" value="' + esc(o.link) + '" placeholder="https://drive.google.com/file/d/..../view?usp=sharing">' +
          '<div id="gCheck" style="margin-top:8px"></div>' +
          '<p class="hint">Link này lưu trong máy đang dùng. Muốn mọi máy đều thấy thì thêm vào file ' +
          '<b>assets/js/links.js</b> theo mẫu: <code>' + esc(m.id) + ' → ' + o.lop + ' → ' + o.tuan + '</code></p></div>' +
      '</div>',
    foot: '<button class="btn-pill" data-close>Huỷ</button>' +
          (S.them[k] ? '<button class="btn-red" id="gXoa">Gỡ link</button>' : '') +
          '<button class="btn-blue" id="gLuu">' + ic("check",15) + ' Lưu</button>',
    onOpen(w){
      const inp = $("#gLink", w), box = $("#gCheck", w);
      const ck = () => {
        const q = Drive.parse(inp.value);
        box.innerHTML = !inp.value.trim() ? ""
          : q ? '<span class="tag ok">' + ic("check",13) + " " + esc(Drive.tenLoai(inp.value)) + '</span>'
              : '<span class="tag warn">Chưa đúng dạng link Google Drive</span>';
      };
      inp.addEventListener("input", ck); ck();
      const x = $("#gXoa", w);
      if (x) x.addEventListener("click", () => { delete S.them[k]; save("them"); closeModal(); toast("Đã gỡ link"); render(); });
      $("#gLuu", w).addEventListener("click", () => {
        const v = inp.value.trim(), ten = $("#gTen", w).value.trim();
        if (v && !Drive.parse(v)) return toast("Link chưa đúng dạng Google Drive", "err");
        if (!v && !ten) delete S.them[k]; else S.them[k] = { link:v, ten:ten };
        save("them"); closeModal(); toast("Đã lưu", "ok"); render();
      });
    }
  });
}

/* ========================= Mảnh giao diện dùng lại ========================= */
function secHead(ten, href, nhan){
  return '<div class="sec-head"><div class="sec-title"><span class="bar"></span><h2>' + esc(ten) + '</h2></div>' +
    (href ? '<a class="see-all" href="' + href + '">' + esc(nhan || "Xem tất cả") +
            ' <span class="chev">' + ic("chevron",13) + '</span></a>' : '') + '</div>';
}
function pageHead(ten, mo){
  return '<div class="page-head"><div><h1>' + esc(ten) + '</h1>' + (mo ? '<p>' + esc(mo) + '</p>' : '') + '</div></div>';
}
function crumb(items){
  return '<div class="crumb">' + items.map((it,i) =>
    (i ? ic("chevron",13) : "") + (it.href ? '<a href="' + it.href + '">' + esc(it.ten) + '</a>' : '<b>' + esc(it.ten) + '</b>')
  ).join("") + '</div>';
}
/* Thẻ môn học. Truyền lop để đếm và đo tiến độ riêng của khối lớp đó. */
function theMon(m, href, nhan, lop){
  const n    = lop ? Kho.dem({ mon:m.id, lop:lop }) : Kho.dem({ mon:m.id });
  const tong = (lop ? 1 : m.lop.length) * SO_TUAN;
  const pct  = tong ? Math.round(n * 100 / tong) : 0;
  /* Ở một khối lớp thì mẫu số 35 tuần dễ hiểu; gộp cả 5 khối thì mẫu số
     lên tới 175 nên chỉ ghi số bài cho gọn. */
  const nhanSo = lop ? n + "/" + SO_TUAN + " tuần" : n + " bài";
  return '<a class="subj" href="' + (href || "#/mon/" + m.id) + '">' +
    '<div class="top" style="background:' + m.nen + '">' +
      (n ? '<span class="cnt">' + nhanSo + '</span>' : '') +
      '<div class="name" style="color:' + m.mau + '">' + esc(m.ten) + '</div>' +
      '<img src="' + anh(m.img) + '" alt="' + esc(m.ten) + '" loading="lazy">' +
    '</div>' +
    '<div class="foot">' +
      '<span class="prog"><i style="width:' + pct + '%;background:' + m.grad + '"></i></span>' +
      '<div class="cta" style="color:' + m.mau + '"><span>' + esc(nhan || "Khám phá ngay") + '</span>' +
      '<span class="go">' + ic("arrow",15) + '</span></div>' +
    '</div>' +
  '</a>';
}

/* Thanh tiến độ nhỏ dùng chung.
   Đã có bài thì luôn vẽ một vạch mỏng, tránh trường hợp 8/1855 làm tròn
   thành 0% rồi thanh trông như chưa có gì.                              */
function thanhTienDo(co, tong, grad){
  let pct = tong ? Math.round(co * 100 / tong) : 0;
  if (co > 0 && pct < 3) pct = 3;
  return '<span class="prog"><i style="width:' + pct + '%;background:' + grad + '"></i></span>';
}

/* Nút quay lại + đường dẫn cho trang môn / trang lớp */
function navPhu(back, items){
  return '<div class="sub-nav">' +
    '<a class="back" href="' + back.href + '">' + ic("back",15) + ' ' + esc(back.ten) + '</a>' +
    crumb(items) + '</div>';
}

/* Hero đầu trang môn học / khối lớp
   o = { nen, mau, grad, img | so, eyebrow, ten, mo, stats:[{b,s}], co, tong, sm } */
function heroLon(o){
  const pct = o.tong ? Math.round(o.co * 100 / o.tong) : 0;
  return '<div class="subj-hero' + (o.sm ? " sm" : "") + '" style="background:' + o.nen + '">' +
    '<div class="art">' + (o.img
      ? '<img src="' + anh(o.img) + '" alt="" loading="lazy">'
      : '<span class="n" style="color:' + o.mau + '">' + esc(o.so) + '</span>') + '</div>' +
    '<div class="txt">' +
      (o.eyebrow ? '<span class="eyebrow" style="color:' + o.mau + '">' + esc(o.eyebrow) + '</span>' : '') +
      '<h1 style="color:' + o.mau + '">' + esc(o.ten) + '</h1>' +
      (o.mo ? '<p>' + esc(o.mo) + '</p>' : '') +
      (o.stats && o.stats.length ? '<div class="hero-stats">' + o.stats.map(s =>
        '<div class="hstat"><b style="color:' + o.mau + '">' + esc(s.b) + '</b><span>' + esc(s.s) + '</span></div>'
      ).join("") + '</div>' : '') +
      (o.tong ? '<div class="hero-prog"><div class="lbrow"><span>Tiến độ giáo án</span>' +
        '<span style="color:' + o.mau + '">' + o.co + '/' + o.tong + ' tuần · ' + pct + '%</span></div>' +
        thanhTienDo(o.co, o.tong, o.grad) + '</div>' : '') +
    '</div></div>';
}

/* Thẻ chọn khối lớp — o = { href, so, ten, phu, mau, grad, co, tong, donVi } */
function theLop(o){
  return '<a class="grade" href="' + o.href + '" style="--mau:' + o.mau + '">' +
    '<span class="go">' + ic("arrow",15) + '</span>' +
    '<span class="num" style="background:' + o.grad + '">' + esc(o.so) + '</span>' +
    '<span class="lb" style="color:' + o.mau + '">' + esc(o.ten) + '</span>' +
    '<span class="sub">' + esc(o.phu) + '</span>' +
    thanhTienDo(o.co, o.tong, o.grad) +
    '<span class="pct">' + (o.co ? o.co + '/' + o.tong + ' ' + (o.donVi || "tuần") + ' đã có bài'
                                 : 'Chưa gắn bài giảng') + '</span>' +
  '</a>';
}
function theTap(t){
  const n = Kho.dem({ tap:t.id });
  return '<a class="col-card" href="#/bo-suu-tap/' + t.id + '">' +
    '<img src="' + anh(t.anh) + '" alt="' + esc(t.ten) + '" loading="lazy">' +
    '<div class="nm">' + esc(t.ten) + '</div>' +
    '<div class="ct">' + (n ? n + " giáo án" : "Chưa gắn nhãn") + '</div></a>';
}

/* Làm tối một mã màu #rrggbb — dùng vẽ cạnh dưới cho ô tuần nổi khối */
function toiMau(hex, k){
  const h = String(hex || "").replace("#","");
  if (!/^[0-9a-f]{6}$/i.test(h)) return "#c9d6e4";
  const n = parseInt(h, 16);
  const p = x => Math.round(x * k).toString(16).padStart(2,"0");
  return "#" + p((n >> 16) & 255) + p((n >> 8) & 255) + p(n & 255);
}

/* Ô TUẦN dùng trong trang 35 tuần — khối nhỏ, nổi, bấm được */
function oTuan(o){
  const m = DB.mon(o.mon), fav = S.fav.indexOf(o.k) >= 0;
  const nay = o.tuan === TUAN_NAY;
  const tools = '<div class="w-tools' + (fav ? " show" : "") + '">' +
      (o.link ? '<button class="w-btn" data-preview="' + o.k + '" title="Xem trước trong app">' + ic("eye",12) + '</button>' : '') +
      '<button class="w-btn' + (fav ? " on" : "") + '" data-fav="' + o.k + '" title="Ghim vào Yêu thích">' + icf("heart",12) + '</button>' +
    '</div>';
  const than =
    (nay ? '<span class="nhan-nay">Tuần này</span>' : '') +
    '<svg class="ppt-ic" viewBox="0 0 32 32" aria-hidden="true"><use href="#f-ppt"/></svg>' +
    '<span class="lb">Tuần ' + o.tuan + '</span>' +
    '<span class="st"><i class="dot"></i>' + (o.link ? "Mở Drive" : "Sắp có") + '</span>' +
    (o.ten ? '<span class="tenbai">' + esc(o.ten) + '</span>' : '');
  const mau = ' style="--mau:' + m.mau + ';--canh:' + toiMau(m.mau, .70) + '"';
  const boc = (n, ben) => '<div class="w-item ' + n + (nay ? " nay" : "") + '" id="tuan-' + o.tuan + '"' +
    (o.link || nay ? mau : "") + '>' + ben + tools + '</div>';
  if (o.link)
    return boc("has", '<a class="week has" href="' + esc(Drive.mo(o.link)) + '" target="_blank" rel="noopener" data-open="' + o.k + '">' + than + '</a>');
  return boc("none", '<button class="week none" data-gan="' + o.k + '" title="Gắn link Google Drive">' + than + '</button>');
}

/* Thẻ bài giảng có ghi tên môn (Yêu thích, Tìm kiếm, Tuần học, Bộ sưu tập) */
function theBai(o){
  const m = DB.mon(o.mon), fav = S.fav.indexOf(o.k) >= 0;
  const tools = '<div class="w-tools">' +
      (o.link ? '<button class="w-btn" data-preview="' + o.k + '">' + ic("eye",13) + '</button>' : '') +
      '<button class="w-btn' + (fav ? " on" : "") + '" data-fav="' + o.k + '">' + icf("heart",13) + '</button></div>';
  const than =
    '<div class="row"><span class="ppt" style="background:' + (o.link ? m.grad : "") + '">' + (o.link ? "PPT" : ic("plus",17)) + '</span>' +
    '<div><div class="tt">' + esc(m.ten + " " + o.lop) + ' · Tuần ' + o.tuan + '</div>' +
    '<div class="mt">' + esc(o.ten || (o.link ? "Bài giảng tuần " + o.tuan : "Chưa có bài giảng")) + '</div></div></div>' +
    '<div class="tm">' + (o.link ? ic("external",13) + " Mở trên Google Drive" : ic("link",13) + " Gắn link") + '</div>';
  return '<div class="wcard' + (o.link ? "" : " no") + '">' +
    (o.link ? '<a href="' + esc(Drive.mo(o.link)) + '" target="_blank" rel="noopener" data-open="' + o.k + '">' + than + '</a>'
            : '<button data-gan="' + o.k + '">' + than + '</button>') + tools + '</div>';
}
const dsBai = ds => '<div class="wlist">' + ds.map(theBai).join("") + '</div>';

function hopTrong(tieuDe, moTa, nut){
  return '<div class="empty-box"><img src="' + anh("col-3.png") + '" alt="">' +
    '<div><h4>' + esc(tieuDe) + '</h4><p>' + moTa + '</p>' +
    (nut === false ? "" : '<a class="btn-blue" href="#/giao-an">' + ic("book",15) + ' Vào kho giáo án</a>') + '</div></div>';
}

/* ================================ ROUTER ================================ */
function duongDan(){
  const h = location.hash.replace(/^#/, "") || "/";
  const parts = h.split("?"), q = {};
  new URLSearchParams(parts[1] || "").forEach((v,k) => q[k] = v);
  const p = parts[0].replace(/\/+$/,"") || "/";
  return { path:p, seg:p.split("/").filter(Boolean).map(decodeURIComponent), q:q };
}
const go = h => { location.hash = h; };
const Trang = {};

/* -------------------------------- TRANG CHỦ -------------------------------- */
const slides = [
  { h:'Trợ lý giáo án <em>trình chiếu PPT</em> cho giáo viên tiểu học',
    li:["Thiết kế đẹp – Dễ dùng – Bám sát chương trình GDPT mới",
        "Giúp thầy cô tiết kiệm thời gian, nâng cao hiệu quả giảng dạy."],
    btn:{ t:"Bắt đầu ngay", h:"#/giao-an" } },
  { h:'Chọn môn → chọn lớp → chọn tuần là có ngay <em>bài giảng</em>',
    li:["Mỗi môn đủ 5 khối lớp, mỗi lớp đủ " + SO_TUAN + " tuần học.",
        "Bấm vào ô tuần là mở thẳng file trên Google Drive."],
    btn:{ t:"Xem các môn học", h:"#/giao-an" } },
  { h:'Lịch báo giảng ngay trong app, <em>đúng tiết đúng tuần</em>',
    li:["Xếp sẵn bài giảng cho từng tiết trong tuần.",
        "Đến giờ chỉ cần bấm Dạy là bài mở lên."],
    btn:{ t:"Xem lịch dạy", h:"#/lich-day" } }
];
let slideIdx = 0, slideTimer = null;

function heroHTML(){
  const s = slides[slideIdx];
  return '' +
    '<div class="hero-content">' +
      '<h1>' + s.h + '</h1>' +
      '<div class="checks">' + s.li.map(x => '<div>' + TICK + ' ' + esc(x) + '</div>').join("") + '</div>' +
      '<a class="btn-cta" href="' + s.btn.h + '">' + esc(s.btn.t) + ' ' + ic("chevron",16) + '</a>' +
      '<div class="features">' +
        '<div class="feature"><span class="ic" style="background:linear-gradient(135deg,#8b5cf6,#6366f1)">' + ic("shield",19) + '</span><span class="lb">Chuẩn chương trình GDPT 2018</span></div>' +
        '<div class="feature"><span class="ic" style="background:linear-gradient(135deg,#22c55e,#16a34a)">' + ic("edit",19) + '</span><span class="lb">Dễ chỉnh sửa linh hoạt</span></div>' +
        '<div class="feature"><span class="ic" style="background:linear-gradient(135deg,#94a3b8,#64748b)">' + ic("clock",19) + '</span><span class="lb">Tiết kiệm thời gian hiệu quả</span></div>' +
      '</div>' +
    '</div>' +
    '<img class="hero-img" src="' + anh("hero.png") + '" alt="">' +
    '<div class="dots">' + slides.map((x,i) => '<span class="' + (i===slideIdx?"on":"") + '" data-slide="' + i + '"></span>').join("") + '</div>';
}
const veLaiHero = () => { const h = $("#hero"); if (h) h.innerHTML = heroHTML(); return !!h; };

/* Dải "Tuần này" ngoài trang chủ. Chỉ hiện khi đang thực sự trong một tuần
   học — ngoài kỳ (nghỉ hè, nghỉ Tết, chưa đặt ngày khai giảng) thì không vẽ
   gì cả, tránh chiếm chỗ bằng một dải rỗng.                                */
function theTuanNay(){
  const tt = trangThaiNamHoc();
  if (!tt.tuan) return "";
  const n = Kho.dem({ tuan:tt.tuan });
  return '<div class="tuannay">' +
    '<span class="so">' + tt.tuan + '</span>' +
    '<div class="txt"><h3>' + esc(tt.nhan) + '</h3><p>' + esc(tt.mo) + '</p></div>' +
    '<div class="row-btn">' +
      '<a class="btn-green" style="width:auto" href="#/tuan-hoc/' + tt.tuan + '">' + ic("grid",15) +
      ' Xem ' + (n ? n + " bài giảng" : "tuần " + tt.tuan) + '</a>' +
      '<a class="btn-pill" href="#/lich-day">' + ic("calendar",15) + ' Lịch báo giảng</a>' +
    '</div>' +
  '</div>';
}

Trang["/"] = function(){
  const recent = S.recent.map(r => { const p = tachK(r.k); const o = Kho.o(p.mon,p.lop,p.tuan); o._ts = r.ts; return o; })
                         .filter(o => o.link).slice(0,4);
  const quick = [
    { t:"Trợ lý AI",      h:"#/tro-ly",    bg:"linear-gradient(135deg,#60a5fa,#4f7df5)", ai:true },
    { t:"Lịch báo giảng", h:"#/lich-day",  bg:"linear-gradient(135deg,#34d399,#16a34a)", i:"calendar-full" },
    { t:"Kho bài giảng",  h:"#/giao-an",   bg:"linear-gradient(135deg,#fbbf24,#f59e0b)", i:"folder" },
    { t:"Yêu thích",      h:"#/yeu-thich", bg:"linear-gradient(135deg,#f472b6,#ec4899)", f:"heart" },
    { t:"Thêm bài giảng", h:"#/huong-dan", bg:"linear-gradient(135deg,#38bdf8,#2563eb)", i:"upload" },
    { t:"Xem tất cả",     h:"#/tuan-hoc",  bg:"linear-gradient(135deg,#a78bfa,#7c3aed)", f:"grid" }
  ];
  const tong = Kho.dem();

  return '' +
  '<div class="hero" id="hero">' + heroHTML() + '</div>' +

  '<div class="quick">' + quick.map(q =>
    '<a class="quick-card" href="' + q.h + '"><span class="ic" style="background:' + q.bg + '">' +
    (q.ai ? '<span class="qai">AI</span>' : q.f ? icf(q.f,22) : ic(q.i,22)) +
    '</span><span class="lb">' + esc(q.t) + '</span></a>').join("") + '</div>' +

  theTuanNay() +

  '<section>' + secHead("Giáo án theo môn học", "#/giao-an") +
    '<div class="subjects">' + DB.dsMon().slice(0,4).map(m => theMon(m)).join("") + '</div></section>' +

  '<section>' + secHead("Bộ sưu tập nổi bật", "#/bo-suu-tap") +
    '<div class="cols">' + D.boSuuTap.map(theTap).join("") + '</div></section>' +

  '<section>' + secHead("Giáo án sử dụng gần đây", "#/tuan-hoc") +
    (recent.length
      ? '<div class="recents">' + recent.map(o => {
          const m = DB.mon(o.mon);
          return '<a class="recent" href="' + esc(Drive.mo(o.link)) + '" target="_blank" rel="noopener" data-open="' + o.k + '">' +
            '<div class="row"><span class="ppt" style="background:' + m.grad + '">PPT</span>' +
            '<div><div class="tt">' + esc(o.ten || ("Tuần " + o.tuan)) + '</div>' +
            '<div class="mt">' + esc(m.ten + " " + o.lop) + '  ·  Tuần ' + o.tuan + '</div></div></div>' +
            '<div class="tm">' + ic("clock",13) + ' ' + esc(moTaThoiGian(o._ts)) + '</div></a>';
        }).join("") + '</div>'
      : hopTrong("Chưa mở bài giảng nào",
          "Thầy cô chọn một môn học ở trên, chọn lớp rồi bấm vào ô tuần cần dạy — bài giảng sẽ mở thẳng từ Google Drive.")) +
  '</section>' +

  (tong === 0
    ? '<div class="banner warn">' + ic("link",16) + '<span><b>Chưa có link bài giảng nào.</b> Mở file ' +
      '<b>assets/js/links.js</b> rồi dán link Google Drive vào đúng môn – lớp – tuần. <a href="#/huong-dan">Xem hướng dẫn</a></span></div>'
    : '<div class="banner">' + ic("book-open",16) + '<span>Chỉ 1 bộ sách: <b>' + esc(D.app.boSachChinh) + '</b> – Đồng hành cùng thầy cô trên mọi tiết dạy.</span>' +
      icf("leaf",15) + '</div>');
};

/* ------------------------------- KHO GIÁO ÁN ------------------------------- */
Trang["/giao-an"] = function(){
  return pageHead("Kho giáo án theo môn học", "Chọn môn học → chọn khối lớp → chọn tuần cần dạy.") +
    '<div class="subjects">' + DB.dsMon().map(m => theMon(m)).join("") + '</div>';
};

/* ====================== TRANG MÔN HỌC — CHỌN KHỐI LỚP ====================== */
Trang["/mon"] = function(r){
  const m = DB.mon0(r.seg[1]);
  if (!m) return hopTrong("Không tìm thấy môn học", "Môn học này không có trong danh sách.");
  if (r.seg[2]) return trangTuan(m, Number(r.seg[2]), r);

  const tongO = m.lop.length * SO_TUAN;
  const co    = Kho.dem({ mon:m.id });
  const thieu = [1,2,3,4,5].filter(l => m.lop.indexOf(l) < 0);

  return '' +
  navPhu({ href:"#/giao-an", ten:"Môn khác" },
         [{ten:"Trang chủ",href:"#/"},{ten:"Kho giáo án",href:"#/giao-an"},{ten:"Môn " + m.ten}]) +

  heroLon({
    nen:m.nen, mau:m.mau, grad:m.grad, img:m.img,
    eyebrow:"Môn học", ten:m.ten,
    mo:"Chọn khối lớp để mở giáo án " + SO_TUAN + " tuần, bám sát chương trình GDPT 2018." +
       (thieu.length ? " Môn này chỉ dạy ở khối " + m.lop.join(", ") + "." : ""),
    stats:[
      { b:m.lop.length, s:"khối lớp" },
      { b:SO_TUAN,      s:"tuần mỗi lớp" },
      { b:co,           s:"tuần đã có bài" }
    ],
    co:co, tong:tongO
  }) +

  '<section>' + secHead("Chọn khối lớp") +
    '<div class="grades">' + m.lop.map(l => theLop({
      href:"#/mon/" + m.id + "/" + l,
      so:l, ten:"Lớp " + l, phu:m.ten + " · " + SO_TUAN + " tuần",
      mau:m.mau, grad:m.grad,
      co:Kho.dem({ mon:m.id, lop:l }), tong:SO_TUAN
    })).join("") + '</div></section>' +

  (co === 0
    ? '<div class="banner warn">' + ic("link",16) + '<span>Môn <b>' + esc(m.ten) + '</b> chưa có link nào. ' +
      'Mở file <b>assets/js/links.js</b>, tìm mã môn <b>' + esc(m.id) + '</b> rồi dán link vào đúng lớp – tuần. ' +
      '<a href="#/huong-dan">Xem hướng dẫn</a></span></div>'
    : '');
};

/* ==================== TRANG 35 TUẦN CỦA MỘT KHỐI LỚP ==================== */
function trangTuan(m, lop, r){
  const ds = Kho.dsTuan(m.id, lop);
  const co = ds.filter(o => o.link).length;
  const hk = D.hocKy || [{ten:"Học kì 1",tu:1,den:18},{ten:"Học kì 2",tu:19,den:35}];
  const demHK = k => ds.filter(o => o.tuan >= k.tu && o.tuan <= k.den && o.link).length;

  return '' +
  navPhu({ href:"#/mon/" + m.id, ten:"Chọn lớp khác" },
         [{ten:"Kho giáo án",href:"#/giao-an"},
          {ten:"Môn " + m.ten,href:"#/mon/" + m.id},
          {ten:"Lớp " + lop}]) +

  heroLon({
    sm:true, nen:m.nen, mau:m.mau, grad:m.grad, img:m.img,
    eyebrow:"Lớp " + lop, ten:m.ten + " lớp " + lop,
    mo:"Bấm vào ô tuần để mở giáo án trên Google Drive. Ô có chấm xanh là đã có bài; " +
       "rê chuột vào ô để xem trước hoặc ghim vào Yêu thích.",
    stats:hk.map(k => ({ b:demHK(k) + "/" + (k.den - k.tu + 1), s:k.ten })),
    co:co, tong:SO_TUAN
  }) +

  '<div class="week-bar">' +
    '<div class="chips">' +
      '<button class="chip on" data-loc="tat-ca">Tất cả ' + SO_TUAN + ' tuần</button>' +
      '<button class="chip" data-loc="co">' + ic("check",14) + ' Đã có bài (' + co + ')</button>' +
      '<button class="chip" data-loc="chua">' + ic("plus",14) + ' Chưa có (' + (SO_TUAN - co) + ')</button>' +
    '</div>' +
    (TUAN_NAY ? '<button class="chip nhay" data-nhay="' + TUAN_NAY + '">' +
                ic("calendar",14) + ' Tới tuần ' + TUAN_NAY + ' (tuần này)</button>' : '') +
  '</div>' +

  '<div class="tuan-wrap" id="tuanWrap" data-che-do="tat-ca">' +
  hk.map(k =>
    '<section><div class="hk"><span class="bar" style="background:' + m.mau + '"></span>' +
    '<h2 style="color:' + m.mau + '">' + esc(k.ten) + '</h2>' +
    '<span class="ct">Tuần ' + k.tu + '–' + k.den + ' · đã có ' + demHK(k) + ' tuần</span></div>' +
    '<div class="weeks">' + ds.filter(o => o.tuan >= k.tu && o.tuan <= k.den).map(oTuan).join("") + '</div>' +
    '<p class="trong-loc">Không có tuần nào khớp bộ lọc ở học kì này.</p></section>'
  ).join("") + '</div>';
}

/* ------------------------------ BỘ SƯU TẬP ------------------------------ */
Trang["/bo-suu-tap"] = function(r){
  const id = r.seg[1];
  if (!id) return pageHead("Bộ sưu tập", "Gom bài giảng theo mục đích sử dụng trong tiết dạy.") +
    '<div class="cols">' + D.boSuuTap.map(theTap).join("") + '</div>';
  const t = DB.tap(id);
  if (!t) return hopTrong("Không tìm thấy bộ sưu tập", "Bộ sưu tập này không có trong danh sách.");
  const ds = Kho.tatCa().filter(o => o.tap === id && o.link);
  return crumb([{ten:"Bộ sưu tập",href:"#/bo-suu-tap"},{ten:t.ten}]) +
    pageHead(t.ten, t.moTa) +
    (ds.length ? dsBai(ds)
      : '<div class="card pad"><h3 style="font-size:15px;font-weight:700;margin-bottom:8px">Chưa có bài nào trong bộ sưu tập này</h3>' +
        '<p class="hint" style="margin:0 0 12px">Trong file <b>assets/js/links.js</b>, viết dạng đầy đủ để xếp bài vào đây:</p>' +
        '<pre class="code">5: { link: \'https://...\', ten: \'Tên bài\', tap: \'' + esc(t.id) + '\' }</pre></div>');
};

/* -------------------------------- TUẦN HỌC -------------------------------- */
Trang["/tuan-hoc"] = function(r){
  const n = Number(r.seg[1]);
  if (!n){
    let html = "";
    for (let t = 1; t <= SO_TUAN; t++){
      const c = Kho.dem({tuan:t});
      html += '<a class="wi' + (c?" has":"") + (t===TUAN_NAY?" nay":"") + '" href="#/tuan-hoc/' + t + '">' +
              (t===TUAN_NAY ? '<span class="nhan-nay">Tuần này</span>' : '') +
              '<b>' + t + '</b><small>' + (c ? c + " bài" : "trống") + '</small></a>';
    }
    return pageHead("Tuần học trong năm",
        "Xem tất cả bài giảng của mọi môn trong cùng một tuần." +
        (TUAN_NAY ? " Đang là tuần " + TUAN_NAY + " của năm học " + (NH.ten || "") + "." : "")) +
      '<div class="week-index">' + html + '</div>';
  }
  const ds = Kho.tatCa().filter(o => o.tuan === n && o.link);
  return crumb([{ten:"Tuần học",href:"#/tuan-hoc"},{ten:"Tuần "+n}]) +
    pageHead("Tuần " + n + (n===TUAN_NAY ? " — tuần này" : ""), "Toàn bộ bài giảng đã gắn link của tuần này.") +
    (ds.length ? dsBai(ds) : hopTrong("Tuần " + n + " chưa có bài giảng",
      "Chưa môn nào gắn link cho tuần này. Thêm link tuần <b>" + n + "</b> trong file assets/js/links.js."));
};

/* -------------------------------- LỚP HỌC -------------------------------- */
const MAU_LOP = ["#2563eb","#16a34a","#db2777","#ea580c","#7c3aed"];
const NEN_LOP = ["linear-gradient(180deg,#eaf3fe,#dceafc)","linear-gradient(180deg,#ecf9ef,#e0f4e6)",
                 "linear-gradient(180deg,#fdeef5,#fbe2ee)","linear-gradient(180deg,#fef3e8,#fdeada)",
                 "linear-gradient(180deg,#f4f1fe,#e9e2fd)"];
const gradLop = l => "linear-gradient(135deg," + MAU_LOP[l-1] + "cc," + MAU_LOP[l-1] + ")";

Trang["/lop-hoc"] = function(r){
  const lop = Number(r.seg[1]);

  if (!lop){
    const cn = String(me().lopChuNhiem || "").trim();
    const soCN = (cn.match(/[1-5]/) || [])[0];
    return pageHead("Khối lớp", "Chọn khối lớp để xem toàn bộ môn đang dạy và tiến độ giáo án của khối đó.") +
      '<div class="grades">' + [1,2,3,4,5].map(l => theLop({
        href:"#/lop-hoc/" + l, so:l, ten:"Lớp " + l,
        phu:DB.monTheoLop(l).length + " môn học",
        mau:MAU_LOP[l-1], grad:gradLop(l), donVi:"ô tuần",
        co:Kho.dem({ lop:l }), tong:DB.monTheoLop(l).length * SO_TUAN
      })).join("") + '</div>' +

      '<section>' + secHead("Lớp chủ nhiệm của tôi") +
        '<div class="homeroom">' +
          '<span class="av">' + esc(cn || "?") + '</span>' +
          '<div class="info"><h3>Lớp ' + esc(cn || "chưa đặt") + '</h3>' +
          '<p>' + esc(me().truong || "Chưa đặt tên trường") + ' · ' + esc(me().ten || "Giáo viên") + '</p></div>' +
          '<div class="row-btn">' +
            (soCN ? '<a class="btn-blue" href="#/lop-hoc/' + soCN + '">' + ic("book",15) + ' Môn của lớp ' + soCN + '</a>' : '') +
            '<a class="btn-pill" href="#/tai-khoan">' + ic("edit",15) + ' Sửa thông tin</a>' +
          '</div>' +
        '</div></section>';
  }

  const dsMon = DB.monTheoLop(lop);
  const co    = Kho.dem({ lop:lop });
  const tong  = dsMon.length * SO_TUAN;

  return navPhu({ href:"#/lop-hoc", ten:"Khối khác" },
                [{ten:"Khối lớp",href:"#/lop-hoc"},{ten:"Lớp " + lop}]) +

    heroLon({
      sm:true, nen:NEN_LOP[lop-1], mau:MAU_LOP[lop-1], grad:gradLop(lop), so:lop,
      eyebrow:"Khối lớp", ten:"Lớp " + lop,
      mo:"Toàn bộ môn học của khối lớp " + lop + " theo chương trình GDPT 2018. " +
         "Chọn một môn để mở " + SO_TUAN + " tuần giáo án.",
      stats:[{ b:dsMon.length, s:"môn học" }, { b:tong, s:"ô tuần" }, { b:co, s:"tuần đã có bài" }],
      co:co, tong:tong
    }) +

    '<section>' + secHead("Môn học của lớp " + lop) +
      '<div class="subjects">' + dsMon.map(m =>
        theMon(m, "#/mon/" + m.id + "/" + lop, "Vào lớp " + lop, lop)).join("") + '</div></section>';
};

/* ------------------------------- YÊU THÍCH ------------------------------- */
Trang["/yeu-thich"] = function(){
  const ds = S.fav.map(k => { const p = tachK(k); return Kho.o(p.mon,p.lop,p.tuan); }).filter(o => o.link);
  return pageHead("Bài giảng yêu thích", "Bấm hình trái tim trên ô tuần để ghim bài hay dùng vào đây.") +
    (ds.length ? dsBai(ds) : hopTrong("Chưa ghim bài giảng nào",
      "Mở một môn học, vào lớp rồi bấm hình trái tim ở góc phải ô tuần để ghim."));
};

/* -------------------------------- TÌM KIẾM -------------------------------- */
Trang["/tim-kiem"] = function(r){
  const q = (r.q.q || "").trim();
  if (!q){
    return pageHead("Tìm kiếm", "Gõ tên môn, lớp, tuần hoặc tên bài. Không cần gõ dấu — “toan 3 tuan 5” vẫn ra.") +
      '<div class="chips">' + ["toán 3","tiếng việt 2","tuần 5","tin học","ôn tập"].map(k =>
        '<a class="chip" href="#/tim-kiem?q=' + encodeURIComponent(k) + '">' + esc(k) + '</a>').join("") + '</div>' +
      '<section>' + secHead("Mở gần đây") +
        (S.recent.length
          ? dsBai(S.recent.map(x => { const p = tachK(x.k); return Kho.o(p.mon,p.lop,p.tuan); }).filter(o => o.link).slice(0,6))
          : hopTrong("Chưa có lịch sử", "Bài giảng thầy cô mở sẽ hiện ở đây cho lần sau dùng nhanh.")) +
      '</section>';
  }
  const k = boDau(q);
  const soTuan = (k.match(/tuan\s*(\d+)/) || [])[1];
  const mons = DB.dsMon().filter(m => boDau(m.ten).indexOf(k) >= 0 || k.indexOf(boDau(m.ten)) >= 0);
  const tokens = k.split(/\s+/).filter(Boolean);
  const ds = Kho.tatCa().filter(o => {
    const chuoi = boDau(DB.mon(o.mon).ten + " lop " + o.lop + " tuan " + o.tuan + " " + o.ten);
    return chuoi.indexOf(k) >= 0 || (tokens.length > 1 && tokens.every(t => chuoi.indexOf(t) >= 0));
  });
  return pageHead("Kết quả cho “" + q + "”",
      ds.length + " bài giảng" + (mons.length ? " · " + mons.length + " môn học" : "")) +
    (mons.length ? '<div class="subjects">' + mons.map(m => theMon(m)).join("") + '</div>' : "") +
    (soTuan ? '<div class="banner">' + ic("grid",16) + '<span>Xem cả <a href="#/tuan-hoc/' + soTuan + '">tuần ' + esc(soTuan) + ' của mọi môn</a></span></div>' : "") +
    (ds.length ? dsBai(ds) : (mons.length ? "" : hopTrong("Không tìm thấy", "Không có bài giảng nào khớp với từ khoá này.")));
};

/* ------------------------------- LỊCH DẠY ------------------------------- */
Trang["/lich-day"] = function(r){
  const thu = [2,3,4,5,6,7], tiet = [1,2,3,4,5];
  /* Thời khoá biểu lặp lại hằng tuần: mỗi ô chỉ ghi môn và lớp, còn tuần
     lấy theo tuần đang xem. Ô nào ghi sẵn "tuan" trong data.js thì giữ
     nguyên tuần đó.                                                     */
  const tuan = Math.min(Math.max(Number(r.q.tuan) || TUAN_NAY || 1, 1), SO_TUAN);
  const all = D.lichDay.concat(S.lich);
  const tim = (t,ti) => { const d = all.filter(x => x.thu===t && x.tiet===ti); return d[d.length-1]; };
  const mt = mocTuan(tuan);
  const dd = x => x.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" });

  let html = pageHead("Lịch báo giảng", "Thời khoá biểu lặp hằng tuần. Đến giờ chỉ cần bấm Dạy.") +
    '<div class="week-bar">' +
      '<label class="chon-tuan">' + ic("calendar",15) + ' Xem tuần' +
        '<select class="input" id="ldTuan">' +
        Array.from({length:SO_TUAN}, (x,i) =>
          '<option value="' + (i+1) + '"' + (i+1===tuan ? " selected" : "") + '>Tuần ' + (i+1) +
          (i+1===TUAN_NAY ? " — tuần này" : "") + '</option>').join("") +
        '</select></label>' +
      (mt ? '<span class="count">Từ ' + dd(mt.dau) + ' đến ' + dd(mt.cuoi) + '</span>' : '') +
      (TUAN_NAY && tuan !== TUAN_NAY
        ? '<a class="chip nhay" href="#/lich-day?tuan=' + TUAN_NAY + '">Về tuần này</a>' : '') +
    '</div>' +
    '<div class="card tt-wrap"><table><thead><tr><th></th>' +
    thu.map(t => '<th>' + (t===7 ? "Thứ Bảy" : "Thứ " + t) + '</th>').join("") + '</tr></thead><tbody>';

  tiet.forEach(ti => {
    html += '<tr><th class="rw">Tiết ' + ti + '</th>';
    thu.forEach(t => {
      const o = tim(t, ti);
      if (!o){
        html += '<td><button class="slot-empty" data-them-tiet="' + t + '|' + ti + '" ' +
                'title="Thêm môn vào tiết này">' + ic("plus",22) + '</button></td>';
      } else {
        const mn = DB.chuan(o.mon), m = DB.mon(mn), tw = o.tuan || tuan, c = Kho.o(mn, o.lop, tw);
        html += '<td><div class="slot" style="border-left-color:' + m.mau + '">' +
          '<div class="s1" style="color:' + m.mau + '">' + esc(m.ten) + ' ' + o.lop + '</div>' +
          '<div class="s2">' + esc(c.ten || ("Tuần " + tw)) + '</div>' +
          '<div class="s3">' +
            (c.link ? '<a class="mini" href="' + esc(Drive.mo(c.link)) + '" target="_blank" rel="noopener" data-open="' + c.k + '">' + ic("play",13) + ' Dạy</a>'
                    : '<button class="mini blue" data-gan="' + c.k + '">' + ic("link",13) + ' Gắn link</button>') +
            (o.tuTao ? '<button class="mini red" data-xoa-tiet="' + t + '|' + ti + '">Xoá</button>' : '') +
          '</div></div></td>';
      }
    });
    html += '</tr>';
  });
  return html + '</tbody></table></div>' +
    '<div class="banner">' + ic("calendar",16) + '<span>Thời khoá biểu mẫu nằm trong <b>assets/js/data.js</b> (mục <b>lichDay</b>). ' +
    'Tiết thầy cô tự thêm lưu riêng trong máy này và cũng lặp lại cho mọi tuần.</span></div>';
};

/* ------------------------------ TRỢ LÝ AI ------------------------------ */
Trang["/tro-ly"] = function(){
  return pageHead("Trợ lý tiết dạy",
    "Tạo nhanh khung 4 hoạt động cho một tiết dạy. Đây là mẫu dựng sẵn chạy ngay trên máy, không phải AI thật.") +
    '<div class="card pad"><div class="form">' +
      '<div class="g3">' +
        '<div class="field"><label>Môn học</label><select class="input" id="tlMon">' +
          DB.dsMon().map(m => '<option value="' + m.id + '">' + esc(m.ten) + '</option>').join("") + '</select></div>' +
        '<div class="field"><label>Lớp</label><select class="input" id="tlLop">' +
          [1,2,3,4,5].map(l => '<option value="' + l + '">Lớp ' + l + '</option>').join("") + '</select></div>' +
        '<div class="field"><label>Tuần</label><select class="input" id="tlTuan">' +
          Array.from({length:SO_TUAN},(x,i) => '<option value="' + (i+1) + '">Tuần ' + (i+1) + '</option>').join("") + '</select></div>' +
      '</div>' +
      '<div class="field"><label>Tên bài dạy</label><input class="input" id="tlTen" placeholder="VD: Bài 45: Bảng nhân 7"></div>' +
      '<div class="row-btn"><button class="btn-blue" id="tlGo">Tạo khung tiết dạy</button></div>' +
    '</div></div><div id="tlOut"></div>';
};

function khungTietDay(mon, lop, ten){
  const m = DB.mon(mon);
  return [
    { t:"1. Khởi động (3–5 phút)", c:"#f59e0b", d:[
      "Trò chơi hoặc bài hát khởi động gắn với “" + ten + "”.",
      "Hỏi 1–2 câu gợi mở để học sinh nhắc lại kiến thức tiết trước.",
      "Giới thiệu mục tiêu tiết học bằng slide đầu của bài giảng."]},
    { t:"2. Hình thành kiến thức mới (12–15 phút)", c:"#2f6fed", d:[
      "Trình chiếu nội dung chính của môn " + m.ten + " lớp " + lop + ".",
      "Học sinh quan sát – thảo luận nhóm đôi – rút ra kết luận.",
      "Giáo viên chốt kiến thức trên slide, học sinh nhắc lại."]},
    { t:"3. Luyện tập – Thực hành (10–12 phút)", c:"#7c3aed", d:[
      "Làm bài tập trên slide theo cá nhân rồi chữa chung cả lớp.",
      "Tổ chức trò chơi củng cố (ai nhanh hơn, rung chuông vàng).",
      "Chú ý hỗ trợ nhóm học sinh còn chậm."]},
    { t:"4. Vận dụng – Củng cố (5 phút)", c:"#16a34a", d:[
      "Liên hệ nội dung bài với tình huống thực tế của học sinh.",
      "Giao nhiệm vụ nhỏ về nhà, dặn dò chuẩn bị tiết sau.",
      "Nhận xét, tuyên dương tinh thần học tập của lớp."]}
  ];
}

/* ------------------------------ HƯỚNG DẪN ------------------------------ */
Trang["/huong-dan"] = function(){
  return pageHead("Tài liệu hướng dẫn", "Bốn việc thầy cô hay làm nhất với Bảng Xanh.") +
    '<div class="guides">' + D.huongDan.map(h =>
      '<div class="card pad guide"><h3 style="color:' + h.mau + '">' + esc(h.ten) + '</h3><ol>' +
      h.buoc.map((b,i) => '<li><span class="num" style="background:' + h.mau + '">' + (i+1) + '</span><span>' + esc(b) + '</span></li>').join("") +
      '</ol></div>').join("") + '</div>' +

    '<section>' + secHead("Mẫu dán link vào file assets/js/links.js") +
      '<div class="card pad">' +
        '<pre class="code">window.DRIVE_LINKS = {\n' +
        '  toan: {\n' +
        '    3: {\n' +
        '      1: \'https://drive.google.com/file/d/XXXX/view?usp=sharing\',\n' +
        '      2: \'https://docs.google.com/presentation/d/XXXX/edit\',\n' +
        '      5: { link: \'https://...\', ten: \'Bài 12: Bảng nhân 7\', tap: \'stem\' }\n' +
        '    }\n' +
        '  }\n' +
        '};</pre>' +
        '<p class="hint">Đọc là: môn <b>toan</b> → lớp <b>3</b> → tuần <b>1</b>. ' +
        'Mã môn có sẵn ở đầu file links.js.</p>' +
      '</div></section>' +

    '<section>' + secHead("Câu hỏi hay gặp") +
      '<div class="card pad"><ul class="faq">' +
        '<li><b>Mở bài giảng báo “Bạn cần quyền truy cập”?</b><span>File trên Drive đang để chế độ Bị hạn chế. Chia sẻ lại ở mức “Bất kỳ ai có đường liên kết – Người xem”.</span></li>' +
        '<li><b>Máy khác có thấy link tôi gắn trong app không?</b><span>Không. Link gắn bằng nút trong app chỉ lưu ở máy này. Muốn dùng chung, thêm vào file links.js.</span></li>' +
        '<li><b>Lớp không có mạng thì sao?</b><span>Bấm nút con mắt trên ô tuần → Tải xuống trước ở nhà để có bản dự phòng.</span></li>' +
        '<li><b>Trường dùng bộ sách khác?</b><span>Link là do thầy cô tự gắn nên dùng bộ sách nào cũng được.</span></li>' +
      '</ul></div></section>';
};

/* ------------------------------ TÀI KHOẢN ------------------------------ */
Trang["/tai-khoan"] = function(){
  const u = me(), tong = Kho.dem(), them = Object.keys(S.them).length;
  const tongO = DB.dsMon().reduce((s,m) => s + m.lop.length * SO_TUAN, 0);
  return pageHead("Tài khoản của tôi", "Thông tin hiển thị trên app và dữ liệu lưu trong máy.") +
    '<div class="stats">' +
      '<div class="stat"><b>' + tong + '</b><span>Bài giảng có link</span></div>' +
      '<div class="stat"><b>' + tongO + '</b><span>Ô tuần của cả app</span></div>' +
      '<div class="stat"><b>' + S.fav.length + '</b><span>Bài đã ghim</span></div>' +
      '<div class="stat"><b>' + them + '</b><span>Link gắn trong máy</span></div>' +
    '</div>' +
    (Kho.loi.length ? '<div class="banner warn"><span><b>Có ' + Kho.loi.length + ' chỗ trong links.js chưa đúng:</b><br>' +
      Kho.loi.map(esc).join("<br>") + '</span></div>' : "") +
    (TUAN_NAY
      ? '<div class="banner">' + ic("calendar",16) + '<span>Năm học <b>' + esc(NH.ten || "") +
        '</b> · đang là <b>tuần ' + TUAN_NAY + '</b>.</span></div>'
      : '<div class="banner warn">' + ic("calendar",16) + '<span><b>' + esc(trangThaiNamHoc().nhan) + '.</b> ' +
        esc(trangThaiNamHoc().mo) + ' Sửa mục <b>namHoc</b> trong file <b>assets/js/data.js</b>.</span></div>') +
    '<section>' + secHead("Thông tin giáo viên") +
      '<div class="card pad"><form class="form" id="formMe">' +
        '<div class="g3">' +
          '<div class="field"><label>Họ và tên</label><input class="input" name="ten" value="' + esc(u.ten||"") + '"></div>' +
          '<div class="field"><label>Trường</label><input class="input" name="truong" value="' + esc(u.truong||"") + '"></div>' +
          '<div class="field"><label>Lớp chủ nhiệm</label><input class="input" name="lopChuNhiem" value="' + esc(u.lopChuNhiem||"") + '"></div>' +
        '</div><div class="row-btn"><button class="btn-blue" type="submit">' + ic("check",15) + ' Lưu thông tin</button></div>' +
      '</form></div></section>' +
    '<section>' + secHead("Dữ liệu trong máy") +
      '<div class="card pad">' +
        '<p class="hint" style="margin:0 0 14px">Link gắn nhanh, bài ghim, lịch sử và lịch dạy đang lưu trong trình duyệt của máy này.</p>' +
        '<div class="row-btn">' +
          '<button class="btn-pill" data-act="xuat">' + ic("download",15) + ' Xuất link ra dạng dán vào links.js</button>' +
          '<button class="btn-red" data-act="xoa-het">' + ic("trash",15) + ' Xoá dữ liệu trong máy</button>' +
        '</div></div></section>';
};

/* ================================ RENDER ================================ */
let hashCu = null;
function render(){
  const r = duongDan();
  const fn = Trang[r.path] || Trang["/" + (r.seg[0] || "")] || Trang["/"];
  $("#view").innerHTML = fn(r);
  if (hashCu !== location.hash) window.scrollTo(0, 0);
  hashCu = location.hash;

  const base = "#" + (r.seg.length ? "/" + r.seg[0] : "/");
  const navBase = base === "#/mon" ? "#/giao-an" : base;
  $$("#nav .nav-item").forEach(a => a.classList.toggle("active", a.getAttribute("href") === navBase));
  $$("#tabs .tab").forEach(a => a.classList.toggle("active", a.dataset.tab === base));

  const si = $("#searchInput");
  if (document.activeElement !== si) si.value = r.q.q || "";

  document.body.classList.remove("nav-open");
  veCotPhu();
  ganSuKien(r);
}

function ganSuKien(r){
  clearInterval(slideTimer);
  if (r.path === "/"){
    slideTimer = setInterval(() => {
      if ($("#modalRoot").children.length) return;
      slideIdx = (slideIdx + 1) % slides.length;
      if (!veLaiHero()) clearInterval(slideTimer);
    }, 7000);
  }

  const fm = $("#formMe");
  if (fm) fm.addEventListener("submit", e => {
    e.preventDefault();
    S.me = Object.fromEntries(new FormData(fm).entries());
    save("me"); capNhatHeader(); toast("Đã lưu thông tin", "ok");
  });

  const lt = $("#ldTuan");
  if (lt) lt.addEventListener("change", () => go("#/lich-day?tuan=" + lt.value));

  const tl = $("#tlGo");
  if (tl) tl.addEventListener("click", () => {
    const ten = $("#tlTen").value.trim() || "bài học hôm nay";
    const mon = $("#tlMon").value, lop = $("#tlLop").value, tuan = $("#tlTuan").value;
    const kh = khungTietDay(mon, lop, ten);
    const chu = "KHUNG TIẾT DẠY — " + DB.mon(mon).ten + " lớp " + lop + " — Tuần " + tuan + "\n" + ten + "\n\n" +
      kh.map(x => x.t + "\n" + x.d.map(y => "  - " + y).join("\n")).join("\n\n");
    $("#tlOut").innerHTML = '<section style="margin-top:22px">' + secHead("Khung tiết dạy gợi ý") +
      '<div class="guides">' + kh.map(x =>
        '<div class="card pad guide"><h3 style="color:' + x.c + '">' + esc(x.t) + '</h3><ol>' +
        x.d.map((y,i) => '<li><span class="num" style="background:' + x.c + '">' + (i+1) + '</span><span>' + esc(y) + '</span></li>').join("") +
        '</ol></div>').join("") + '</div>' +
      '<div class="row-btn" style="margin-top:14px"><button class="btn-pill" data-act="copy" data-text="' + esc(chu) + '">' +
      ic("copy",15) + ' Sao chép toàn bộ khung</button></div></section>';
  });
}

/* =========================== Sự kiện toàn app =========================== */
document.addEventListener("click", e => {
  const T = s => e.target.closest(s);

  const sd = T("[data-slide]");
  if (sd){ slideIdx = Number(sd.dataset.slide); veLaiHero(); return; }

  const fav = T("[data-fav]");
  if (fav){ e.preventDefault(); toggleFav(fav.dataset.fav); return; }

  const pv = T("[data-preview]");
  if (pv){ e.preventDefault(); xemTruoc(pv.dataset.preview); return; }

  const gn = T("[data-gan]");
  if (gn){ e.preventDefault(); hopGanLink(gn.dataset.gan); return; }

  const lc = T("[data-loc]");
  if (lc){
    e.preventDefault();
    const w = $("#tuanWrap");
    if (w) w.dataset.cheDo = lc.dataset.loc;
    $$("[data-loc]").forEach(b => b.classList.toggle("on", b === lc));
    return;
  }

  const nh = T("[data-nhay]");
  if (nh){
    e.preventDefault();
    const w = $("#tuanWrap");
    if (w && w.dataset.cheDo !== "tat-ca"){          // bỏ lọc để chắc chắn thấy được ô
      w.dataset.cheDo = "tat-ca";
      $$("[data-loc]").forEach(b => b.classList.toggle("on", b.dataset.loc === "tat-ca"));
    }
    const o = $("#tuan-" + nh.dataset.nhay);
    if (o){
      o.scrollIntoView({ behavior:"smooth", block:"center" });
      o.classList.add("chop"); setTimeout(() => o.classList.remove("chop"), 1600);
    }
    return;
  }

  const op = T("[data-open]");
  if (op){ ghiNhanMo(op.dataset.open); return; }

  const tt = T("[data-them-tiet]");
  if (tt){ hopThemTiet(tt.dataset.themTiet); return; }

  const xt = T("[data-xoa-tiet]");
  if (xt){
    const p = xt.dataset.xoaTiet.split("|");
    S.lich = S.lich.filter(x => !(x.thu === Number(p[0]) && x.tiet === Number(p[1])));
    save("lich"); toast("Đã xoá tiết"); render(); return;
  }

  const a = T("[data-act]");
  if (!a) return;
  const act = a.dataset.act;

  if (act === "copy"){ e.preventDefault(); copyText(a.dataset.text); }

  if (act === "xuat"){
    openModal({
      title: "Xuất link đã gắn trong máy",
      body: '<p class="hint" style="margin:0 0 10px">Chép đoạn dưới đây, dán đè vào <b>window.DRIVE_LINKS</b> trong file <b>assets/js/links.js</b>.</p>' +
            '<textarea class="input code" style="min-height:220px" readonly>' + esc(xuatLinks()) + '</textarea>',
      foot: '<button class="btn-pill" data-close>Đóng</button>' +
            '<button class="btn-blue" data-act="copy" data-text="' + esc(xuatLinks()) + '">' + ic("copy",15) + ' Sao chép</button>'
    });
  }

  if (act === "xoa-het"){
    openModal({
      title: "Xoá dữ liệu trong máy",
      body: '<p style="font-size:14px;font-weight:600;line-height:1.6">Xoá toàn bộ link gắn nhanh, bài đã ghim, lịch sử và lịch dạy trên máy này. ' +
            'File links.js và file trên Google Drive <b>không bị ảnh hưởng</b>.</p>',
      foot: '<button class="btn-pill" data-close>Không xoá</button><button class="btn-red" id="okHet">Xoá hết</button>',
      onOpen(w){
        $("#okHet", w).addEventListener("click", () => {
          ["fav","recent","them","lich","me"].forEach(k => localStorage.removeItem(Store.key(k)));
          S.fav=[]; S.recent=[]; S.them={}; S.lich=[]; S.me=null;
          closeModal(); capNhatHeader(); toast("Đã xoá dữ liệu trong máy", "ok"); render();
        });
      }
    });
  }
});

/* Gộp link gắn trong máy thành đoạn dán vào links.js */
function xuatLinks(){
  const g = {};
  Object.keys(S.them).forEach(k => {
    const p = tachK(k), v = S.them[k];
    if (!v.link) return;
    g[p.mon] = g[p.mon] || {};
    g[p.mon][p.lop] = g[p.mon][p.lop] || {};
    g[p.mon][p.lop][p.tuan] = v;
  });
  const mons = Object.keys(g);
  if (!mons.length) return "// Chưa có link nào gắn trong máy.";
  let out = "window.DRIVE_LINKS = {\n";
  mons.forEach(mon => {
    out += "  " + mon + ": {\n";
    Object.keys(g[mon]).sort((a,b)=>a-b).forEach(lop => {
      out += "    " + lop + ": {\n";
      Object.keys(g[mon][lop]).sort((a,b)=>a-b).forEach(t => {
        const v = g[mon][lop][t];
        out += "      " + t + ": " + (v.ten
          ? "{ link: '" + v.link + "', ten: '" + String(v.ten).replace(/'/g,"’") + "' }"
          : "'" + v.link + "'") + ",\n";
      });
      out += "    },\n";
    });
    out += "  },\n";
  });
  return out + "};";
}

function hopThemTiet(vt){
  const p = vt.split("|"), thu = Number(p[0]), tiet = Number(p[1]);
  openModal({
    title: "Thêm tiết — " + (thu === 7 ? "Thứ Bảy" : "Thứ " + thu) + ", tiết " + tiet,
    body: '<div class="g3">' +
      '<div class="field"><label>Môn</label><select class="input" id="ltMon">' +
        DB.dsMon().map(m => '<option value="' + m.id + '">' + esc(m.ten) + '</option>').join("") + '</select></div>' +
      '<div class="field"><label>Lớp</label><select class="input" id="ltLop">' +
        [1,2,3,4,5].map(l => '<option value="' + l + '">Lớp ' + l + '</option>').join("") + '</select></div></div>' +
      '<p class="hint">Tiết này lặp lại ở mọi tuần. Bài giảng hiện ra sẽ là bài của tuần thầy cô đang xem.</p>',
    foot: '<button class="btn-pill" data-close>Huỷ</button><button class="btn-blue" id="ltLuu">Lưu vào lịch</button>',
    onOpen(w){
      $("#ltLuu", w).addEventListener("click", () => {
        S.lich = S.lich.filter(x => !(x.thu === thu && x.tiet === tiet));
        S.lich.push({ thu:thu, tiet:tiet, mon:$("#ltMon",w).value,
                      lop:Number($("#ltLop",w).value), tuTao:true });
        save("lich"); closeModal(); toast("Đã thêm vào lịch dạy", "ok"); render();
      });
    }
  });
}

/* =========================== Khởi động =========================== */
function capNhatHeader(){
  $("#meName").textContent = me().ten || "Giáo viên";
  const n = (D.thongBao || []).length, b = $("#bellBadge");
  b.textContent = n; b.dataset.empty = n ? "0" : "1";

  const bt = $("#btnTuanNay");
  if (bt){
    bt.setAttribute("href", TUAN_NAY ? "#/tuan-hoc/" + TUAN_NAY : "#/tuan-hoc");
    $("span", bt).textContent = TUAN_NAY ? "Tuần " + TUAN_NAY + " · tuần này" : "Tuần học";
  }
}

/* Thẻ tiến độ kho giáo án — thay cho thẻ "Nâng cấp Pro" trước đây,
   vì nút đó chưa nối vào tính năng nào thật.                          */
function theTienDoKho(){
  const tong = DB.dsMon().reduce((s,m) => s + m.lop.length * SO_TUAN, 0);
  const co   = Kho.dem();
  const pct  = tong ? Math.round(co * 100 / tong) : 0;
  const tt   = trangThaiNamHoc();
  return '<div class="pro-card">' +
    '<div class="card-head"><span class="ic" style="background:#22a55b;color:#fff">' + icf("leaf",15) + '</span>' +
    '<span class="tt" style="color:#166534">Kho giáo án</span></div>' +
    '<div class="card-body" style="color:#446157">Đã gắn <b>' + co + '</b> trên tổng <b>' + tong + '</b> ô tuần' +
      (tt.tuan ? '. Đang ở <b>tuần ' + tt.tuan + '</b> năm học ' + esc(NH.ten || "") : "") + '.</div>' +
    '<div style="margin-bottom:12px">' + thanhTienDo(co, tong, "linear-gradient(90deg,#22a55b,#16a34a)") +
      '<div class="hint" style="margin-top:6px;color:#5c7a68">Hoàn thành ' + pct + '%</div></div>' +
    '<a class="btn-green" href="' + (tt.tuan ? "#/tuan-hoc/" + tt.tuan : "#/giao-an") + '">' +
      (tt.tuan ? "Bài giảng tuần " + tt.tuan : "Vào kho giáo án") + '</a>' +
  '</div>';
}

function veCotPhu(){
  $("#sideExtra").innerHTML =
    theTienDoKho() +
    '<div class="support-card">' +
      '<div class="card-head"><span class="ic" style="background:#eff6ff;color:#2f6fed">' + ic("support",16) + '</span>' +
      '<span class="tt">Trung tâm hỗ trợ</span></div>' +
      '<div class="card-body" style="color:#64748b">Hướng dẫn, câu hỏi thường gặp và liên hệ hỗ trợ.</div>' +
      '<a class="btn-outline" href="#/huong-dan">Xem ngay</a>' +
    '</div>';
}

$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#searchInput").value.trim();
  go(v ? "#/tim-kiem?q=" + encodeURIComponent(v) : "#/tim-kiem");
});
$("#btnMenu").addEventListener("click", () => document.body.classList.toggle("nav-open"));
$("#sidebarBackdrop").addEventListener("click", () => document.body.classList.remove("nav-open"));
$("#btnBell").addEventListener("click", () => openModal({
  title: "Thông báo",
  body: '<ul class="faq">' + (D.thongBao||[]).map(t =>
    '<li><b>' + esc(t.ten) + '</b><span>' + esc(t.moTa) + '</span>' +
    '<span class="muted small">' + esc(t.thoiGian) + '</span></li>').join("") + '</ul>'
}));

window.addEventListener("hashchange", render);
Kho.nap();
capNhatHeader();
veCotPhu();
render();
if (Kho.loi.length) toast(Kho.loi.length + " chỗ trong links.js chưa đúng — xem mục Tài khoản", "err");

})();
