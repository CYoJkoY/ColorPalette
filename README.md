<div align="center">
  <img src="assets/readme/hero.svg" alt="ColorPalette — 轻量级色彩工具" width="100%" />
</div>

<div align="center">

**ColorPalette** · 面向设计师、游戏开发者与前端开发者的轻量级微信色彩工具。

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE) · Native WeChat Mini Program

</div>

## ![Palette](assets/readme/icons/palette.svg) 项目定位

ColorPalette 不是色卡图片集合，而是一套直接完成色彩工作的工具：浏览色卡、生成和谐配色、生成感知色阶、从图片提取主色、收藏并分享配色。

产品采用 **Free + Pro + 激励广告兑换临时权益** 模型。核心能力保持可用；重度使用者可以购买月卡/年卡，也可以通过完成激励广告获得临时 Pro 权益。

## ![Palette](assets/readme/icons/palette.svg) 当前能力

| 能力 | 状态 | 说明 |
| :--- | :---: | :--- |
| 精选色卡 | ✅ | Aurora、Forest、Sunset、Monochrome 等预置配色 |
| HEX / RGB / HSL | ✅ | 核心颜色转换与验证 |
| 和谐配色 | ✅ | 互补、类似、三角色、分裂互补 |
| OKLab 感知色阶 | ✅ | 9 阶明度梯度，适合 UI 与插画调色 |
| 图片取色 | ✅ | 本地采样并提取最多 8 个主色 |
| 本地收藏 | ✅ | 使用微信本地存储 |
| 色卡分享 | ✅ | 复制可分享的色卡文本 |
| Pro 权益 | ✅ | 临时权益与订阅权益模型 |
| 激励广告 | 🧩 | 已接入 SDK 边界；配置正式广告位后启用 |
| 微信支付 | 🧩 | 已接入订单边界；生产环境必须使用可信后端 |
| 云同步 | 🗓️ | 下一阶段加入 |

## ![Image](assets/readme/icons/image.svg) 快速开始

1. 使用微信开发者工具打开仓库。
2. 将项目根目录作为开发者工具项目目录。
3. 在 `project.config.json` 中设置自己的正式 AppID。
4. 编译 `miniprogram/` 并预览。

仓库不包含真实广告位 ID、支付商户参数、API 密钥或其他生产凭据。

## ![Palette](assets/readme/icons/palette.svg) 产品结构

```text
ColorPalette
├── 发现        精选色卡
├── 色卡详情    配色生成 + OKLab 色阶 + 复制/分享
├── 图片取色    图片采样 + 主色板
├── 收藏        本地色卡收藏
└── Pro         广告兑换 + 月卡 / 年卡
```

## ![Palette](assets/readme/icons/palette.svg) 色彩引擎

基础配色使用 HSL 色相关系生成互补、类似、三角色和分裂互补方案；高级色阶使用 OKLab，在近似感知均匀的空间中调整 `L` 通道，而不是直接对 RGB 通道做线性插值。

图片取色目前采用轻量缩略采样与 RGB 量化，重点优化移动端速度。`miniprogram/utils/advanced-palette.js` 提供去重距离阈值接口，后续可进一步升级到 Lab/OKLab 聚类、主体区域检测和更稳定的色彩排序。

## ![Pro](assets/readme/icons/pro.svg) 商业化设计

ColorPalette 将付费订阅和广告兑换严格分离：

- **Free**：核心色卡、基础转换、基础取色与收藏。
- **Rewarded Ad**：只有激励广告完成回调成功后，才可以发放临时 Pro；默认策略为一次完整广告兑换 24 小时。
- **Monthly**：首测建议 `¥3.9 / 30 天`。
- **Yearly**：首测建议 `¥19.9 / 365 天`。

广告位 ID 为空时不会模拟成功，也不会虚假增加权益。支付同样不会在客户端直接把按钮点击视为购买成功。

生产环境的订单创建、支付结果验证、退款、重复回调幂等和权益到账必须由可信后端完成。详细接入原则见 [`docs/MONETIZATION.md`](docs/MONETIZATION.md)。

## ![Image](assets/readme/icons/image.svg) 开发与质量检查

项目坚持原生微信小程序技术栈：WXML、WXSS、JavaScript、Canvas/OffscreenCanvas 和微信本地存储。核心颜色算法不依赖第三方 npm 包。

GitHub Actions 会自动执行 JavaScript 语法检查、颜色算法测试、JSON 校验和 README 资产检查。

## ![Palette](assets/readme/icons/palette.svg) Roadmap

**v0.2 当前阶段**

- OKLab 感知色阶
- 色卡复制/分享
- 激励广告与支付接入边界
- 更严格的自动化检查

**v0.3**

- 更好的图片聚类与颜色去重
- 色盲模拟与 WCAG 对比度检查
- 色卡图片导出
- 收藏搜索与标签

**v0.4**

- 微信云同步
- 服务端订阅权益
- 运营数据与转化漏斗
- 更完整的游戏/像素艺术配色库

## ![Pro](assets/readme/icons/pro.svg) 许可证

本项目采用 **GNU General Public License v3.0 (GPL-3.0)**，并遵循其 copyleft 条款。修改或再发布本项目代码时，请按 GPL-3.0 的要求提供相应源代码与许可证声明。

完整许可证文本见 [`LICENSE`](LICENSE)。

## ![Palette](assets/readme/icons/palette.svg) 贡献

欢迎提交 Issue 或 Pull Request，尤其欢迎新的色卡、颜色算法、图片聚类、无障碍检查和微信小程序兼容性修复。

请勿提交真实 AppID、广告位 ID、支付密钥、用户数据或任何生产环境凭据。

<div align="center">
  <img src="assets/readme/support-cta.svg" alt="Support ColorPalette development" width="720" />
</div>
