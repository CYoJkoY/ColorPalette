<div align="center">
  <img src="assets/readme/hero.svg" alt="ColorPalette — 色卡、配色、图片取色，一处完成" width="100%" />
</div>

<div align="center">

**ColorPalette** · 一个面向设计师、游戏开发者与前端开发者的轻量级微信色彩工具。

<a href="https://github.com/CYoJkoY/ColorPalette">Source</a> · Native WeChat Mini Program · GPL-3.0

</div>

## ![Palette](assets/readme/icons/palette.svg) 项目定位

ColorPalette 不是“色卡图片集合”，而是一套可以直接完成工作的色彩工具：浏览色卡、输入 HEX 生成和谐配色、从图片提取主色，并将常用配色保存到设备。

第一版优先解决高频、低学习成本的任务；广告与 Pro 只是商业化层，不阻塞核心使用。

## ![Palette](assets/readme/icons/palette.svg) 当前能力

| 能力 | 状态 | 说明 |
| :--- | :---: | :--- |
| 精选色卡 | ✅ | Aurora、Forest、Sunset、Monochrome 等预置配色 |
| HEX / RGB / HSL | ✅ | 核心颜色转换与验证 |
| 和谐配色 | ✅ | 互补、类似、三角色、分裂互补 |
| 图片取色 | ✅ | 本地图片采样并提取最多 8 个主色 |
| 本地收藏 | ✅ | 使用微信本地存储保存色卡 |
| Pro 权益 | ✅ | 本地权益状态与兑换逻辑已抽象 |
| 激励广告 | 🧩 | 已留出成功回调接口；需绑定正式广告位 |
| 微信支付 | 🧩 | 价格与订单接口预留；生产环境需服务端校验 |
| 云同步 | 🧩 | 规划中的 Pro 能力 |

## ![Image](assets/readme/icons/image.svg) 快速开始

1. 使用微信开发者工具打开仓库。
2. 将项目根目录设置为开发者工具项目目录。
3. 确认 `project.config.json` 中的 `appid` 为你的正式小程序 AppID。
4. 编译 `miniprogram/`，即可预览首页、图片取色、收藏和 Pro 页面。

当前仓库不包含真实 AppID、广告位 ID、支付商户参数或服务端密钥。

## ![Palette](assets/readme/icons/palette.svg) 产品结构

```text
ColorPalette
├── 发现        精选色卡与入口
├── 色卡详情    颜色复制 + 和谐配色生成
├── 图片取色    图片上传 + 主色提取
├── 收藏        本地保存常用色卡
└── Pro         月卡 / 年卡 / 广告兑换权益
```

## ![Pro](assets/readme/icons/pro.svg) 商业化设计

ColorPalette 采用“付费订阅 + 广告兑换临时权益”的双路径模型。

**Free**：核心色卡、基础转换、基础图片取色与本地收藏可直接使用。

**广告兑换**：用户主动观看激励广告，在广告成功回调后获得临时 Pro 权益。示例实现使用 `getApp().grantProHours(24)` 表示发放 24 小时权益；正式接入时应只在广告成功回调中调用。

**月卡 / 年卡**：推荐的首测价为 `¥3.9 / 30 天` 与 `¥19.9 / 365 天`。价格只是产品实验参数，不代表已接通微信支付。

生产环境必须将支付订单创建、签名验证、退款与权益到账放在可信服务端处理，客户端只能展示和消费经过校验的权益状态。

## ![Palette](assets/readme/icons/palette.svg) 技术实现

本项目坚持微信小程序原生技术栈，减少运行时与构建依赖：

- WXML / WXSS / JavaScript
- 本地 `wx.setStorageSync` 收藏与权益持久化
- `wx.chooseMedia` 图片输入
- Canvas / OffscreenCanvas 采样图片像素
- 颜色计算逻辑集中在 `miniprogram/utils/color.js`

核心算法保持无第三方依赖，方便后续抽成共享库或迁移到云函数。

## ![Image](assets/readme/icons/image.svg) 图片取色说明

MVP 采用缩略采样与量化聚类：将图片缩放到小尺寸、跳过低透明度像素、按 RGB 桶统计出现频率，再取高频颜色作为主色板。

这套实现重点是速度与稳定性，而不是专业级感知色彩聚类。后续可加入 Lab / OKLab、K-means、去重距离阈值和主体区域识别。

## ![Palette](assets/readme/icons/palette.svg) 开发路线

**v0.1** 已完成基础工作流：色卡 → 配色 → 图片取色 → 收藏 → Pro 权益演示。

**v0.2** 将优先加入高级色阶、更多色彩空间、导出/分享色卡、收藏搜索与真正的广告成功回调。

**v0.3** 再加入云端收藏、多设备同步、微信支付后端和运营数据闭环。

## ![Pro](assets/readme/icons/pro.svg) 许可证

本项目强制采用 **GNU General Public License v3.0 (GPL-3.0)**。对本项目代码进行再发布或修改时，请遵守 GPL-3.0 的 copyleft 条款，并保留相应版权与许可证声明。

完整许可证文本见 [`LICENSE`](LICENSE)。

## ![Palette](assets/readme/icons/palette.svg) 贡献

欢迎通过 Issue 或 Pull Request 提交新的色卡、算法改进、交互优化和小程序兼容性修复。

请不要提交真实 AppID、广告位 ID、支付密钥、用户数据或任何生产环境凭据。

<div align="center">
  <img src="assets/readme/support-cta.svg" alt="Support ColorPalette development" width="720" />
</div>

本项目目前不设置强制捐赠入口；后续如加入赞助渠道，会在此处维护 canonical 支付/赞助链接。
