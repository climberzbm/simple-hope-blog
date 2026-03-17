# 复古游戏模拟器

## 使用说明

本项目使用 EmulatorJS 作为游戏模拟器引擎。

### 支持的平台

| 平台 | 核心 | 文件格式 |
|------|------|----------|
| NES (红白机) | nestopia | .nes, .zip |
| SNES (超任) | snes9x | .sfc, .smc, .zip |
| GBA (Game Boy Advance) | mgba | .gba, .zip |
| GB/GBC | gambatte | .gb, .gbc, .zip |
| N64 | mupen64plus | .z64, .n64, .zip |
| PS1 | pcsx_rearmed | .bin, .cue, .zip |

### 添加游戏

1. 准备合法的 ROM 文件（自己拥有的游戏卡带备份）

2. 将 ROM 文件放到对应目录：
```
web/public/emulator/
├── nes/
│   ├── game1.nes
│   └── game2.nes
├── gba/
│   └── game3.gba
└── snes/
    └── game4.sfc
```

3. 在 `web/src/app/emulator/page.tsx` 中添加游戏信息：
```typescript
{
  id: 'game1',
  name: '游戏名称',
  system: 'nes',
  description: '游戏描述',
  core: 'nestopia',
}
```

### 控制键位

**键盘：**
- 方向键：移动
- Z：A 键
- X：B 键
- A：L 键（GBA）
- S：R 键（GBA）
- Enter：Start
- Shift：Select

**移动端：**
- 使用屏幕虚拟按键

### 存档

模拟器自动将存档保存到浏览器本地存储。

### 法律声明

请确保您拥有合法的游戏 ROM：
- 您拥有原始游戏卡带/光盘
- 或者使用开源 Homebrew 游戏
- 或者使用已进入公有领域的游戏

请勿下载/分发盗版游戏 ROM。

### 免费游戏资源

以下是一些合法的免费 ROM 资源：

1. **Homebrew Hub** - https://hh.gbdev.io/
   - 原创开源 GB/GBC 游戏

2. **itch.io** - https://itch.io/games/tag-nes
   - 独立开发者制作的 NES 游戏

3. **GBAdev.org** - https://gbadev.org/
   - GBA Homebrew 游戏合集

### 示例配置

在 `web/public/emulator/` 下创建测试用的 placeholder 文件：

```bash
# 创建目录
mkdir -p web/public/emulator/nes
mkdir -p web/public/emulator/gba

# 下载免费 Homebrew 游戏（示例）
# 请从合法来源获取 ROM 文件
```