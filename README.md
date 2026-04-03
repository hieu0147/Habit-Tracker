# Habit Tracker - Ứng dụng Theo dõi Thói quen Hiện đại

Một ứng dụng web hiện đại giúp người dùng theo dõi và xây dựng thói quen tốt hơn thông qua giao diện thân thiện và trực quan.

## 📋 Mô tả dự án

Habit Tracker là một hệ thống quản lý thói quen toàn diện được xây dựng với kiến trúc hiện đại. Ứng dụng cho phép người dùng tạo, theo dõi, và phân tích các thói quen hàng ngày, đồng thời cung cấp các công cụ thống kê chi tiết để đo lường tiến trình và hiệu suất.

## 🎯 Chức năng chính

### 📱 Giao diện người dùng
- **Đăng ký/Đăng nhập** - Hệ thống xác thực người dùng an toàn với JWT
- **Dashboard** - Tổng quan nhanh về các thói quen và tiến trình hàng ngày
- **Quản lý Thói quen** - Tạo, chỉnh sửa, và xóa thói quen
- **Thống kê** - Phân tích chi tiết hiệu suất và xu hướng thói quen
- **Hồ sơ cá nhân** - Quản lý thông tin và cài đặt tài khoản
- **Panel Admin** - Quản lý người dùng và phân quyền

### 🔥 Tính năng theo dõi
- **Check-in hàng ngày** - Đánh dấu hoàn thành thói quen mỗi ngày
- **Chuỗi (Streaks)** - Theo dõi chuỗi ngày hoàn thành liên tiếp
- **Tỷ lệ hoàn thành** - Tính toán phần trăm hoàn thành theo thời gian
- **Thói quen tốt nhất** - Xác định thói quen có hiệu suất cao nhất
- **Lịch sử dụng** - Hiển thị lịch các hoạt động theo dõi

### 📊 Phân tích và Thống kê
- **Biểu đồ tiến trình** - Trực quan hóa dữ liệu với Recharts
- **Thống kê chi tiết** - Số liệu về chuỗi, tỷ lệ hoàn thành, tổng check-in
- **Xu hướng hiệu suất** - Phân tích xu hướng và hiệu suất theo thời gian
- **Báo cáo** - Tổng hợp và xuất báo cáo tiến trình

### 🛡️ Quản trị và Bảo mật
- **Panel Admin** - Quản lý người dùng, vai trò, và trạng thái
- **Phân quyền** - Hệ thống vai trò (Admin/User)
- **Chặn/Bỏ chặn** - Kiểm soát truy cập người dùng
- **Xác thực JWT** - Token-based authentication với thời hạn
- **Bảo mật** - Hashing password với bcrypt

## 🛠️ Công nghệ sử dụng (Tech Stack)

### 🎨 Frontend
- **Framework**: Next.js 16 với App Router
- **Ngôn ngữ**: TypeScript 5.7+
- **UI Library**: Radix UI Components
- **Styling**: Tailwind CSS với PostCSS
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod Validation
- **Charts**: Recharts cho data visualization
- **Icons**: Lucide React Icons
- **Animations**: Framer Motion
- **Date Handling**: date-fns library

### 🖥️ Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js với TypeScript
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt.js
- **Validation**: Zod schemas
- **Logging**: Morgan middleware
- **Security**: Helmet.js cho headers
- **CORS**: Cross-origin resource sharing

### 🗄️ Database
- **Database**: MongoDB
- **ODM**: Mongoose
- **Schema Design**: Flexible với embedded documents
- **Indexing**: Optimized cho performance
- **Data Relationships**: User-Habits-CheckIns

### 🧩 DevOps & Tools
- **Package Manager**: npm/pnpm
- **Build Tool**: TypeScript Compiler (tsc)
- **Code Quality**: ESLint + Prettier
- **Environment**: dotenv cho configuration
- **Development**: Hot-reload với nodemon/tsx-watch

## 🚀 Hướng dẫn cài đặt

### 📋 Yêu cầu hệ thống
- Node.js 18+ 
- npm 9+ hoặc pnpm 8+
- MongoDB 6.0+
- Git để clone repository

### 🔧 Backend Setup

1. **Clone repository**
```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker/backend
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
pnpm install
```

3. **Cấu hình môi trường**
```bash
cp .env.example .env
# Chỉnh sửa các biến sau:
# MONGODB_URI=mongodb://localhost:27017/habit-tracker
# JWT_SECRET=your-super-secret-jwt-key
# CORS_ORIGIN=http://localhost:3000
# PORT=4000
```

4. **Khởi động database**
```bash
# Đảm bảo MongoDB đang chạy
mongod
```

5. **Chạy backend**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Backend sẽ chạy tại `http://localhost:4000`

### 🎨 Frontend Setup

1. **Clone repository**
```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker/frontend
```

2. **Cài đặt dependencies**
```bash
npm install
# hoặc
pnpm install
```

3. **Cấu hình API**
```bash
# Tạo file .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
```

4. **Chạy frontend**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Frontend sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc dự án

```
habit-tracker/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── models/       # MongoDB schemas
│   │   ├── lib/          # Utilities
│   │   └── middleware/    # Auth & error handling
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # Next.js React App
│   ├── app/              # App Router pages
│   │   ├── (auth)/     # Login & Register
│   │   └── (dashboard)/ # Main app pages
│   ├── components/        # Reusable UI components
│   │   ├── ui/          # Base UI library
│   │   └── ...          # App components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utilities & types
│   └── styles/           # Global styles
│   └── package.json
└── README.md              # This file
```

## 🔄 Quy trình làm việc (Workflow)

### 📊 User Journey
1. **Đăng ký** → Tạo tài khoản mới
2. **Đăng nhập** → Xác thực và nhận JWT token
3. **Dashboard** → Xem tổng quan nhanh
4. **Tạo Thói quen** → Thiết lập mục tiêu mới
5. **Check-in hàng ngày** → Đánh dấu hoàn thành
6. **Xem Thống kê** → Phân tích tiến trình
7. **Quản lý** → Chỉnh sửa và xóa khi cần

### 🔄 Data Flow
1. **Client** gửi request với JWT token
2. **Middleware** xác thực token và permissions
3. **API Routes** xử lý business logic
4. **Database** lưu trữ và truy vấn dữ liệu
5. **Response** trả về data đã được xử lý

## 🎯 Tính năng nổi bật

### ✨ Điểm mạnh
- **Responsive Design** - Tương thích mọi thiết bị
- **Real-time Updates** - Instant feedback cho actions
- **Data Visualization** - Charts và graphs trực quan
- **Type Safety** - Full TypeScript coverage
- **Modern UI/UX** - Intuitive và accessible
- **Performance Optimized** - Fast loading và smooth interactions
- **Security First** - Authentication và data protection

### 🔮 Tương lai phát triển
- **Mobile App** - React Native version
- **Team Features** - Shared habits và team goals
- **Advanced Analytics** - Machine learning insights
- **Integrations** - Calendar và productivity apps
- **Export/Import** - Data portability
- **Offline Support** - PWA capabilities

## 🤝 Đóng góp

Chúng tôi rất mong nhận được đóng góp từ cộng đồng!

### 🐛 Báo cáo Issues
Vui lòng report bugs tại [GitHub Issues](https://github.com/your-username/habit-tracker/issues)

### 💡 Đề xuất Features
Gửi đề xuất tính năng mới tại [GitHub Discussions](https://github.com/your-username/habit-tracker/discussions)

### 📧 Hướng dẫn phát triển
Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết thêm chi tiết về cách đóng góp code.

## 📄 Giấy phép

Dự án này được cấp phép dưới [MIT License](LICENSE) - bạn có thể tự do sử dụng, sửa đổi, và phân phối.

## 👥 Team

- **Developer**: [Your Name]
- **Design**: [Your Name]
- **Testing**: [Your Name]

---

**Hãy bắt đầu xây dựng thói quen tốt hơn ngay hôm nay! 🚀**
