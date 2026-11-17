# Mod của Claude Code — trang bài viết

Trang bài viết dài (Next.js) về mod của Claude Code, xuất bản bởi AgentsRoom.

## Chạy trên máy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # kiểm tra bản build trước khi đẩy lên
```

## Cấu trúc

| Tệp | Nội dung |
| --- | --- |
| `app/page.tsx` | Toàn bộ nội dung bài viết, mục lục (`SECTIONS`) và FAQ |
| `app/globals.css` | Màu sắc (sáng/tối), chữ, bố cục |
| `app/layout.tsx` | Font, SEO, chống nháy khi tải ở chế độ tối |
| `app/opengraph-image.tsx` | Ảnh xem trước khi chia sẻ Facebook/Zalo (1200×630) |
| `components/` | Mục lục, nút sáng/tối, thanh tiến độ, khối code + nút Copy, sơ đồ |
| `lib/site.ts` | Tiêu đề, mô tả, tên thương hiệu, link bài gốc |

Sửa chữ trong bài: mở `app/page.tsx`. Thêm một mục mới: thêm `<section id="...">` và thêm id đó vào `SECTIONS` để nó hiện trong mục lục.

## Đưa lên GitHub

1. Tạo repository mới trên GitHub (để trống, không thêm README).
2. Trong thư mục này chạy:

```bash
git init
git add .
git commit -m "Trang bài viết mod Claude Code"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/<tên-repo>.git
git push -u origin main
```

## Kết nối Vercel

1. Vào vercel.com → **Add New… → Project** → chọn repository vừa đẩy.
2. Vercel tự nhận Next.js, giữ nguyên cấu hình mặc định → **Deploy**.
3. Mỗi lần `git push` lên `main`, Vercel tự build và cập nhật trang.

## Thêm domain

1. Trong project trên Vercel: **Settings → Domains → Add**, nhập domain (ví dụ `mods.tenmien.com`).
2. Vào nơi quản lý DNS của domain, thêm bản ghi đúng như Vercel hiển thị:
   - Subdomain (`mods.tenmien.com`): bản ghi **CNAME** trỏ tới giá trị Vercel đưa.
   - Domain gốc (`tenmien.com`): bản ghi **A** trỏ tới IP Vercel đưa.
3. Chờ Vercel báo **Valid Configuration** (thường vài phút, có khi tới vài giờ). HTTPS được cấp tự động.
4. **Settings → Environment Variables**: thêm `NEXT_PUBLIC_SITE_URL` = `https://<domain-của-bạn>`, rồi **Redeploy**. Biến này giúp link chia sẻ và ảnh xem trước dùng đúng domain.
