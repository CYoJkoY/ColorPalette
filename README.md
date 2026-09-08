<div align="center">
  <img src="assets/readme/hero.svg" alt="ColorPalette — 微信小程序色彩工具" width="100%" />
</div>

<div align="center">

# ColorPalette

**一款真正用于“做颜色”的微信小程序。**

从 HEX、配色关系到 OKLab 色阶，再到图片取色与收藏，ColorPalette 把常用色彩工作压缩进一个轻量、无需第三方依赖的原生微信小程序。

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
[![Platform: WeChat Mini Program](https://img.shields.io/badge/Platform-WeChat%20Mini%20Program-07C160.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript-F7DF1E.svg)](https://developer.mozilla.org/docs/Web/JavaScript)

</div>

<div align="center">

**设计师** · **前端开发者** · **游戏开发者** · **UI/UX 创作者**

</div>

## <img src="assets/readme/icons/palette.svg" width="20" alt=""> 它解决什么问题？

很多色彩工具擅长“展示颜色”，但实际创作时需要的是一条连续的工作流：找到一个基础色 → 快速生成关系色 → 调整亮度 → 从参考图提取颜色 → 保存结果。

ColorPalette 围绕这条工作流设计，而不是做一个静态色卡目录。

```text
基础色
  ↓
HEX / RGB / HSL
  ↓
互补 · 类似 · 三角色 · 分裂互补
  ↓
OKLab 感知色阶
  ↓
图片取色
  ↓
收藏 / 分享
```

## <img src="assets/readme/icons/image.svg" width="20" alt=""> 当前版本能做什么？

| 能力 | 状态 | 当前实现 |
| :--- | :---: | :--- |
| 精选色卡 | ✅ | Aurora / Forest / Sunset / Monochrome |
| HEX / RGB / HSL | ✅ | 颜色解析、转换与格式验证 |
| 和谐配色 | ✅ | 互补、类似、三角色、分裂互补 |
| OKLab 色阶 | ✅ | 9 阶感知亮度色阶 |
| 图片取色 | ✅ | 本地缩略采样，最多提取 8 个主色 |
| 本地收藏 | ✅ | 微信本地存储 |
| 色卡分享 | ✅ | 复制可分享的色卡文本 |
| Pro 权益模型 | ✅ | 临时权益 + 订阅权益 |
| 激励广告 | 🧩 | 已预留真实广告 SDK 接入边界 |
| 微信支付 | 🧩 | 已预留可信后端订单边界 |
| 云同步 | 🗓️ | 计划在后续版本加入 |

> `🧩` 表示代码结构已经准备好，但正式发布前仍需要配置微信侧生产资源；不会用模拟逻辑伪装成已经上线的支付或广告。

## <img src="assets/readme/icons/palette.svg" width="20" alt=""> 为什么使用 OKLab？

普通 RGB 插值并不等价于人眼感知上的均匀变化。ColorPalette 的高级色阶使用 OKLab，将颜色转换到感知色彩空间后主要调整 `L`（Lightness）通道，再转换回 sRGB。

这使生成的亮度阶梯更适合实际的 UI 层级、插画明暗和游戏素材调色，而不是简单地把 RGB 数值平均拉高或拉低。

核心实现位于：

```text
miniprogram/utils/
├── color.js              # HEX / RGB / HSL 与基础配色关系
├── oklab.js              # RGB ↔ OKLab 与感知距离
└── advanced-palette.js   # OKLab 色阶与颜色去重
```

## <img src="assets/readme/icons/image.svg" width="20" alt=""> 图片取色是怎么工作的？

当前版本优先考虑微信小程序端的响应速度：

1. 选择本地图片。
2. 将图片缩略到较小采样区域。
3. 读取像素数据。
4. 对 RGB 进行量化，降低近似颜色数量。
5. 按出现频率排序。
6. 输出最多 8 个代表色。

因此它适合快速回答“这张图的大致色彩是什么”，而不是替代专业的视觉聚类系统。

后续版本会继续向 **Lab / OKLab 聚类、颜色去重、主体区域检测和更稳定的代表色排序** 演进。

## <img src="assets/readme/icons/pro.svg" width="20" alt=""> Pro 与商业化

ColorPalette 不把基础功能锁死，而是采用：

```text
                    ColorPalette
                         │
             ┌───────────┴───────────┐
             │                       │
            Free                    Pro
             │                       │
      核心色彩能力             重度使用能力
             │                       │
             │              ┌────────┴────────┐
             │              │                 │
             │           订阅购买          激励广告
             │              │                 │
             │           月卡 / 年卡       临时 Pro
```

当前首测价格方案：

| 方案 | 建议价格 | 权益 |
| :--- | :---: | :--- |
| Free | ¥0 | 核心色卡、基础转换、基础图片取色、收藏 |
| Monthly | ¥3.9 / 30 天 | Pro |
| Yearly | ¥19.9 / 365 天 | Pro |
| Rewarded Ad | 免费 | 完整观看一次激励广告 → 24 小时临时 Pro |

广告和支付有明确的安全边界：

- 广告只有收到完整播放回调后才发放权益。
- 未配置真实广告位时不会模拟成功。
- 客户端不会把“点击购买”当作支付成功。
- 订单创建、支付验证、退款、重复回调幂等和最终权益到账必须由可信后端处理。
- 生产凭据不会进入 Git 仓库。

详细生产接入原则见 [`docs/MONETIZATION.md`](docs/MONETIZATION.md)。

## <img src="assets/readme/icons/installation.svg" width="20" alt=""> 运行项目

### <img src="assets/readme/icons/package.svg" width="18" alt=""> 环境

- 微信开发者工具
- 一个属于你自己的微信小程序 AppID
- Node.js 20+（仅用于本地运行仓库测试；小程序运行本身不依赖 Node）

### <img src="assets/readme/icons/download.svg" width="18" alt=""> 打开项目

1. 克隆仓库。
2. 使用微信开发者工具打开仓库根目录。
3. 在 `project.config.json` 中填写自己的 AppID。
4. 编译并预览。

```bash
git clone https://github.com/CYoJkoY/ColorPalette.git
cd ColorPalette
node tests/color.test.js
```

小程序入口目录为：

```text
miniprogram/
```

仓库故意不包含真实广告位 ID、支付商户密钥、API Token 或其他生产凭据。

## <img src="assets/readme/icons/architecture.svg" width="20" alt=""> 项目结构

```text
ColorPalette/
├── miniprogram/
│   ├── pages/
│   │   ├── home/             # 精选色卡
│   │   ├── palette/          # 配色、OKLab 色阶、分享
│   │   ├── extractor/        # 图片取色
│   │   ├── favorites/        # 本地收藏
│   │   └── pro/              # Pro / 商业化入口
│   ├── services/
│   │   └── monetization.js   # 广告与支付接入边界
│   └── utils/
│       ├── color.js
│       ├── oklab.js
│       ├── advanced-palette.js
│       ├── share.js
│       └── storage.js
├── assets/readme/             # README 专用视觉资产
├── docs/
│   └── MONETIZATION.md
├── tests/
│   └── color.test.js
├── .github/workflows/
│   └── check.yml
├── LICENSE
└── README.md
```

## <img src="assets/readme/icons/check.svg" width="20" alt=""> 质量与可信边界

项目使用原生微信小程序技术栈，不依赖第三方 npm 色彩库。核心颜色算法可以在没有微信运行时的 Node 环境中独立测试。

GitHub Actions 会检查：

- JavaScript 测试；
- 小程序配置 JSON；
- README 必需视觉资源；
- 核心色彩工具的基础行为。

同时，项目明确区分“已经实现”和“等待生产配置”的能力，不会在 README 或客户端 UI 中宣称不存在的支付、广告或云服务已经上线。

## <img src="assets/readme/icons/roadmap.svg" width="20" alt=""> Roadmap

### <img src="assets/readme/icons/layers.svg" width="18" alt=""> v0.3 — 更强的取色与无障碍能力

- Lab / OKLab 图片聚类
- 更稳定的颜色去重与排序
- WCAG 对比度检查
- 色盲模拟
- 色卡图片导出
- 收藏搜索与标签

### <img src="assets/readme/icons/cloud.svg" width="18" alt=""> v0.4 — 云端与商业化闭环

- 微信云同步
- 服务端订阅权益
- 订单与退款状态同步
- 基础运营数据与转化漏斗
- 更完整的游戏 / 像素艺术配色库

## <img src="assets/readme/icons/contribution.svg" width="20" alt=""> 参与开发

欢迎提交 Issue 和 Pull Request。尤其欢迎：

- 新的高质量色卡；
- 色彩算法改进；
- 图片聚类算法；
- WCAG / 无障碍能力；
- 微信开发者工具兼容性修复；
- UI / UX 改进。

请不要提交：

- 真实 AppID（公开仓库无需提交）；
- 广告位生产配置；
- 微信支付密钥；
- API Token；
- 用户个人数据；
- 任何其他生产环境秘密。

## <img src="assets/readme/icons/license.svg" width="20" alt=""> License

ColorPalette 使用 **GNU General Public License v3.0**。

GPL-3.0 是本项目的核心开源许可。对于受到 GPL 条款约束的修改版本和再发布版本，应按照许可证要求提供对应源代码、许可证文本以及必要的版权与许可声明。

完整许可证见 [`LICENSE`](LICENSE)。

<div align="center">
  <img src="assets/readme/support-cta.svg" alt="Support ColorPalette development" width="720" />
</div>

<div align="center">

**ColorPalette · 把“找颜色”变成“做颜色”。**

</div>
