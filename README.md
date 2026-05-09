# Pomodoro

> 一款 Apple 风格的桌面端番茄钟应用，基于 Tauri + React + Tailwind CSS 构建。

<!-- 项目截图：替换为你的实际截图 -->
<!-- ![Screenshot](./docs/screenshot-light.png) -->
<!-- ![Screenshot](./docs/screenshot-dark.png) -->

## 功能特性

### 计时器

- **专注计时** — 25 分钟专注 / 5 分钟短休息 / 15 分钟长休息
- **极简控制** — 开始、暂停、重置、跳过
- **自动流转** — 专注完成后自动切换到休息，每 4 轮专注后进入长休息
- **会话追踪** — 圆点指示器显示已完成的专注轮数

### 数据 & 统计

- **持久化存储** — 专注记录保存到本地 JSON 文件，重启不丢失
- **今日进度** — 显示今日完成次数 / 每日目标
- **累计统计** — 总专注分钟数、连续达标天数

### 自定义设置

- **时长调整** — 自定义专注、短休、长休时长（滑块调节）
- **轮数设置** — 自定义长休间隔轮数
- **每日目标** — 设置每日专注目标次数
- **设置面板** — 毛玻璃 overlay，点击标题栏齿轮图标打开

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始 / 暂停 |
| `R` | 重置计时器 |
| `S` | 跳过当前阶段 |
| `1` / `2` / `3` | 切换到 专注 / 短休 / 长休 |
| `Esc` | 关闭设置面板 |

### 桌面特性

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
git clone https://github.com/Daqinpro/pomodoro.git
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

## 数据存储

应用数据存储在系统标准目录：

| 系统 | 路径 |
|------|------|
| Windows | `%APPDATA%\com.yourname.pomodoro\` |
| macOS | `~/Library/Application Support/com.yourname.pomodoro/` |
| Linux | `~/.local/share/com.yourname.pomodoro/` |

包含两个 JSON 文件：
- `pomodoro-settings.json` — 用户设置（时长、目标等）
- `pomodoro-stats.json` — 专注统计记录

## 项目结构

```
pomodoro/
├── src/                        # React 前端
│   ├── App.tsx                 # 主组件（组合层）
│   ├── App.css                 # 苹果风格样式
│   ├── index.css               # Tailwind 入口 + 全局样式
│   ├── main.tsx                # React 入口
│   ├── types.ts                # 共享类型和常量
│   ├── hooks/
│   │   ├── useTimer.ts         # 计时器状态机
│   │   ├── useSettings.ts      # 设置 + 持久化
│   │   ├── useStats.ts         # 统计 + 持久化
│   │   └── useKeyboardShortcuts.ts  # 键盘快捷键
│   ├── components/
│   │   ├── SettingsPanel.tsx   # 设置面板
│   │   └── StatsDisplay.tsx    # 统计信息行
│   └── utils/
│       └── storage.ts          # Tauri JSON 文件读写
├── src-tauri/                  # Tauri / Rust 后端
│   ├── src/
│   │   ├── main.rs             # Rust 入口
│   │   └── lib.rs              # 系统托盘 + 窗口管理 + 数据存储命令
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

- [ ] 音效提醒（计时结束播放提示音）
- [ ] 开机自启动
- [ ] 多语言支持
- [ ] 自定义主题色

## License

[MIT](./LICENSE)
