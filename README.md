# Pomodoro

> 一款 Apple 风格的桌面端番茄钟应用，基于 Tauri + React + Tailwind CSS 构建。

<!-- 项目截图：替换为你的实际截图 -->
<!-- ![Screenshot](./docs/screenshot-light.png) -->
<!-- ![Screenshot](./docs/screenshot-dark.png) -->

## 功能特性

- **专注计时** — 25 分钟专注 / 5 分钟短休息 / 15 分钟长休息
- **极简控制** — 开始、暂停、重置、跳过
- **自动流转** — 专注完成后自动切换到休息，每 4 轮专注后进入长休息
- **会话追踪** — 圆点指示器显示已完成的专注轮数
- **窗口置顶** — 支持始终置顶，可随时切换
- **系统托盘** — 关闭窗口后最小化到托盘，托盘右键菜单可控制
- **毛玻璃 UI** — 半透明模糊背景，macOS 风格大圆角
- **深色/浅色模式** — 跟随系统主题自动切换
- **丝滑动画** — 按钮 hover、状态切换均有弹性过渡动画
- **无边框窗口** — 自定义红绿灯标题栏，支持拖拽移动

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Tauri v2](https://v2.tauri.app/) |
| 前端 | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com/) + 自定义 CSS |
| 构建 | [Vite](https://vite.dev/) |
| 后端 | [Rust](https://www.rust-lang.org/) |

## 运行环境

- **Node.js** >= 18
- **Rust** >= 1.77（[安装指南](https://rustup.rs/)）
- **Windows** 10/11（需要 WebView2，Win10+ 自带）
- **macOS** / **Linux** 同样支持

## 本地启动

```bash
# 1. 克隆项目
git clone https://github.com/your-username/pomodoro.git
cd pomodoro

# 2. 安装前端依赖
npm install

# 3. 启动开发模式（首次会编译 Rust，需要几分钟）
npm run tauri dev
```

## 打包构建

```bash
# 构建生产版本（输出到 src-tauri/target/release/bundle/）
npm run tauri build
```

构建产物：
- **Windows**: `.msi` 安装包 + `.exe` 可执行文件
- **macOS**: `.dmg` 安装包 + `.app`
- **Linux**: `.deb` / `.AppImage`

## 项目结构

```
pomodoro/
├── src/                        # React 前端
│   ├── App.tsx                 # 主组件（计时器逻辑 + UI）
│   ├── App.css                 # 苹果风格样式
│   ├── index.css               # Tailwind 入口 + 全局样式
│   └── main.tsx                # React 入口
├── src-tauri/                  # Tauri / Rust 后端
│   ├── src/
│   │   ├── main.rs             # Rust 入口
│   │   └── lib.rs              # 系统托盘 + 窗口管理命令
│   ├── capabilities/           # Tauri v2 权限配置
│   ├── icons/                  # 应用图标
│   ├── tauri.conf.json         # Tauri 窗口 & 构建配置
│   ├── Cargo.toml              # Rust 依赖
│   └── Cargo.lock
├── index.html                  # HTML 入口
├── vite.config.ts              # Vite + Tailwind 配置
├── package.json                # Node.js 依赖
└── tsconfig.json               # TypeScript 配置
```

## 后续优化

- [ ] 自定义专注/休息时长
- [ ] 音效提醒（计时结束播放提示音）
- [ ] 开机自启动
- [ ] 专注历史统计
- [ ] 多语言支持
- [ ] 自定义主题色

## License

[MIT](./LICENSE)

