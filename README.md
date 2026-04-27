# Movie & Story App

Ứng dụng đọc truyện cổ tích cho bé.

## Hướng dẫn chạy trên GitHub

Ứng dụng này đã được cấu hình để có thể chạy trên GitHub Pages.

### Cách triển khai (Deploy to GitHub Pages)

1. Đẩy mã nguồn lên một repository mới trên GitHub.
2. Đi tới **Settings** > **Pages** của repository đó.
3. Trong phần **Build and deployment** > **Source**, chọn **GitHub Actions**.
4. Ứng dụng sẽ tự động được build và triển khai thông qua file workflow `.github/workflows/deploy.yml` đã được tạo sẵn.

### Lưu ý về Hình ảnh
Các hình ảnh hiện đang sử dụng liên kết từ Google AI Studio Artifacts. Nếu bạn muốn ứng dụng hoạt động vĩnh viễn và độc lập trên GitHub, bạn nên:
1. Tải các ảnh bìa về máy.
2. Lưu vào thư mục `public/assets/` hoặc `src/assets/`.
3. Cập nhật đường dẫn trong `src/data/books.ts`.

## Phát triển cục bộ

```bash
npm install
npm run dev
```
