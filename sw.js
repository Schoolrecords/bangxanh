/* =========================================================================
   BẢNG XANH — service worker
   Mục đích: mở được app khi lớp mất mạng (vỏ app + ảnh + dữ liệu lần trước).
   Nguyên tắc: LUÔN ƯU TIÊN MẠNG.
     - Có mạng  → lấy bản mới nhất, đồng thời lưu lại vào bộ đệm.
     - Mất mạng → lấy bản đã lưu.
   Nhờ vậy thầy cô sửa file links.js xong, F5 là thấy ngay, không bị kẹt
   bản cũ. File bài giảng nằm trên Google Drive nên vẫn cần mạng để mở.
   ⚠ Sửa file này xong nhớ tăng số PHIEN_BAN để máy người dùng nhận bản mới.
   ========================================================================= */
const PHIEN_BAN = "bangxanh-v1";
const VO_APP = [
  "./",
  "./index.html",
  "./assets/css/style.css",
  "./assets/js/links.js",
  "./assets/js/data.js",
  "./assets/js/app.js",
  "./manifest.webmanifest",
  "./assets/img/icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(PHIEN_BAN)
      .then(c => c.addAll(VO_APP))
      .catch(() => null)          // thiếu 1 file cũng không chặn cài đặt
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ds => Promise.all(ds.filter(d => d !== PHIEN_BAN).map(d => caches.delete(d))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const cungNha = url.origin === self.location.origin;
  const laFont  = /fonts\.(googleapis|gstatic)\.com|cdnfonts\.com/.test(url.hostname);

  // Google Drive, Google Docs… luôn đi thẳng ra mạng, không đụng vào bộ đệm
  if (!cungNha && !laFont) return;

  // Phông chữ: dùng bản đã lưu trước cho nhanh, nền tải bản mới
  if (laFont){
    e.respondWith(
      caches.match(req).then(daCo => {
        const mang = fetch(req).then(res => {
          if (res && res.ok) caches.open(PHIEN_BAN).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => daCo);
        return daCo || mang;
      })
    );
    return;
  }

  // File của app: ưu tiên mạng, hỏng mạng thì lấy bản đã lưu
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const ban = res.clone();
          caches.open(PHIEN_BAN).then(c => c.put(req, ban));
        }
        return res;
      })
      .catch(() => caches.match(req).then(daCo =>
        daCo || (req.mode === "navigate" ? caches.match("./index.html") : undefined)
      ))
  );
});
