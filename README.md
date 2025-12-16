Course-Plus (University Schedule Planner / 大学排课助手)

Course-Plus is a modern, single-file course scheduling application built with React and Tailwind CSS. It is designed to handle complex university schedules, supporting multi-slot entries, smart fuzzy imports, and local data persistence.

Course-Plus 是一款基于 React 和 Tailwind CSS 构建的现代化单文件排课应用。专为处理复杂的大学课程安排设计，支持多时间段录入、智能模糊导入及本地数据持久化。

✨ Features / 核心功能

Dark UI / 深色界面

Optimized dark mode using Tailwind CSS.

基于 Tailwind CSS 设计的优化深色模式。

Complex Schedule Support / 复杂课表支持

Support for multiple time slots per course (e.g., Wed 3-5, Fri 1-2).

Flexible settings for odd/even weeks or specific week ranges.

支持“一课多时段”（如周三3-5节 + 周五1-2节）及单双周/特定周次设置。

Smart Fuzzy Import / 智能模糊导入

Text sequence parsing: Name -> Teacher -> Room -> Day -> Time -> Weeks.

Wildcard Support: Use * to skip fields and apply default values.

支持文本序列解析导入。使用 * 通配符可跳过字段（自动应用默认值），无需完整信息即可导入。

Interactive Editing / 交互式编辑

Click on course blocks to view details, modify info, or adjust time slots.

点击课程卡片即可查看详情，修改信息或调整时间段。

Data Persistence / 数据存储

Auto-save: Real-time saving to localStorage.

JSON Backup: Export/Import .json files for backup or migration.

iCal Export: Generate .ics files for Apple/Google/Outlook calendars.

支持自动保存至 LocalStorage，JSON 数据导入导出备份，以及导出 .ics 日历文件。

🛠️ Tech Stack / 技术栈

Frontend: React (Hooks)

Styling: Tailwind CSS

Build Tool: Vite

Icons: Lucide-React

Architecture: Single-File Component (SFC)

🚀 How to Run / 本地运行

1. Clone Project / 克隆项目

git clone [https://github.com/hlzx-cpu/course-plus.git](https://github.com/hlzx-cpu/course-plus.git)
cd course-plus


2. Install Dependencies / 安装依赖

npm install


3. Start Dev Server / 启动开发服务

npm run dev


Access via / 访问地址: http://localhost:5173

4. Build / 构建 (Optional)

npm run build


🌐 Deployment / 部署指南

Recommended: Vercel (Automated deployment for Vite/React).
推荐使用 Vercel 进行自动化部署。

Sign Up / 注册: Go to Vercel.com and login with GitHub.

Import / 导入: Click "Add New Project" and select the course-plus repository.

Deploy / 部署: Keep default settings (Framework Preset: Vite) and click "Deploy".

📄 License

This project is open sourced under the MIT license.
