# 🦊 八重神子工作陪伴 — 完整项目指南

## 项目概述

**八重神子工作陪伴**是一个 VS Code 扩展，让《原神》角色**八重神子**化身为你的工作甲方兼总编，以优雅毒舌、看似刻薄实则关心的方式陪伴你完成工作和学习任务。

---

## 🎯 核心功能

### 1. **总编式陪伴 ・ 9 条命令**

| 命令 | 功能 |
|------|------|
| 🦊 `神子：今日开卷` | 时间感知的个性化开场 |
| ⏱ `神子：开始番茄钟` | 25 分钟专注 + 5 分钟休息，状态栏倒计时 |
| ⏹ `神子：结束番茄钟` | 提前结束番茄钟 |
| 💡 `神子：给我一点建议` | 获得毒舌但有用的鼓励 |
| 📋 `神子：审稿式检查代码` | 读取诊断信息，总编审稿风格点评 |
| 📕 `神子：今日收卷` | 一天结束的收卷总结 |
| 📚 `神子：总编点评` | 八重堂总编式犀利点评 |
| ⚡ `神子：来个小说反转` | 来一段出乎意料的剧情反转 |
| 🌩️ `神子：聊聊影` | 提起雷电影的彩蛋对话 |

### 2. **被动陪伴**

- **每保存 10 次文件自动插话**：总编对稿件进度的点评
- **长时间闲置提醒**：超过 30 分钟未操作时，神子会毒舌催稿
- **时间段感知**：凌晨、早上、午后、深夜各有不同的犀利问候
- **深层悲伤识别**：当用户极度低落时，神子放下毒舌，以罕见的真诚给出安慰

### 3. **侧边栏聊天面板**

活动栏有 🦊 图标，点开即可进入"**八重堂编辑部**"聊天面板：
- 所有对话实时显示
- 打字机逐字效果
- 80+ 条手写台词覆盖多种情境

---

## 🏗️ 项目结构

```
yae-companion/
├── src/
│   ├── extension.ts         # 扩展入口：9 命令、事件循环、dispose
│   ├── persona.ts           # 人格引擎：80+ 台词库
│   ├── dynamicReply.ts      # 动态对话：关键词识别、意图分析、deep_sad
│   ├── chatPanel.ts         # Webview 侧边栏：HTML + CSS + nonce CSP
│   ├── pomodoro.ts          # 番茄钟：PomodoroPhase 三阶段
│   ├── idleWatcher.ts       # 闲置检测：() => void 回调
│   └── stats.ts             # 统计追踪：.current 访问器
├── media/
│   └── yae-icon.svg         # 活动栏图标
├── package.json             # 配置清单、命令声明、设置项
├── tsconfig.json            # TypeScript 编译配置
└── README.md
```

---

## ⚙️ 配置项

```json
{
  "yae.pomodoroMinutes": 25,
  "yae.breakMinutes": 5,
  "yae.enableIdleReminder": true,
  "yae.idleMinutes": 30,
  "yae.enableStatusBar": true
}
```

---

## 🚀 开发与运行

### 首次设置

```bash
cd yae-companion
npm install
npm run compile
```

### 调试运行

按 `F5` 启动 Extension Development Host。

### 开发中编译

```bash
npm run watch
```

---

## 📖 关键架构

### PomodoroPhase 三阶段

```typescript
type PomodoroPhase = 'focus-end' | 'break-start' | 'break-end';
pomodoro.start(minutes, (phase) => {
    switch (phase) {
        case 'focus-end': /* 专注结束 */ break;
        case 'break-start': /* 休息开始 */ break;
        case 'break-end': /* 休息结束 */ break;
    }
});
```

### 意图识别层级

```
deep_sad → editorial → plot → raiden → sad → encourage → work → greeting → unknown
```

深层悲伤优先匹配，确保用户在最脆弱时获得少见的真诚安慰，而非日常毒舌。

### 独有角色特色

- **总编点评**：5 段八重堂总编式犀利点评，用编辑语言解构问题
- **小说反转**：6 个出其不意的剧情反转脑洞，灵感碰撞
- **影的彩蛋**：5 条关于雷电影的私密对话——难得一见的柔软
- **真诚安慰**：当用户极度消沉时，神子放下所有戏谑，以"总编也有翻不开稿子的时候"给出共情

---

## 📄 License

MIT
