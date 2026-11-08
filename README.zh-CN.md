# YouTube 分享链接净化

[English](README.md) · [其他语言](docs/TRANSLATIONS.md)

净化 YouTube 原生复制、社交分享和嵌入代码中的分享追踪标识。只使用原生按钮，不增加额外按钮。

## 功能

- 删除 si 和 feature=shared，保留时间戳、播放列表、播放选项与网址片段。
- 处理顶部“信息、WhatsApp、Facebook、X、邮件、Reddit、Pinterest、LinkedIn”等分享目标中经过编码的 YouTube 链接。
- 清理嵌入 iframe 代码；保留尺寸、开始时间、播放器控件与隐私增强模式等选项。
- 从分享接口返回数据、按钮内部数据和最终复制／分享操作多处清理。
- 提供简中、繁中、英、日、韩、德、西、法、巴西葡语和俄语的名称、简介与控制台诊断。YouTube 自身按钮的文字仍由 YouTube 的语言设置决定。

## 安装和更新

安装 Tampermonkey 后，打开仓库内的 YouTube-Clean-Share.user.js，点击 Raw 安装，或者把全部代码复制到油猴的新脚本中保存。

旧版用户请编辑原脚本并完整替换，保存后刷新所有已打开的 YouTube 页面，不要同时启用两份脚本。原始默认名称和 namespace 保持不变，便于识别更新。

如果 Chrome／Edge 未执行脚本，检查扩展详情的“允许用户脚本”，或按 [Tampermonkey 官方说明](https://www.tampermonkey.net/faq.php?q=Q209)完成所需设置。

## 范围与隐私

运行于 youtube.com、www.youtube.com、m.youtube.com 和 music.youtube.com 的 HTTPS 网页。手机 YouTube App 和其他网站不在处理范围内。

脚本在本地处理，不增加网络请求、不加载外部代码、不保存分享历史、不读取已有剪贴板。它只净化待写入的内容及 YouTube 分享数据。移除链接参数不能关闭 YouTube 或分享目标网站本身的统计、Cookie、账号活动记录。

## 兼容性和验证

主要在桌面 Chrome 验证。不能保证所有能安装 Tampermonkey 的浏览器都兼容；Edge、Firefox、Safari、手机版网页及 Music 仍需分别进行完整安装测试。

1.2.0 候选版通过 67 项浏览器模拟回归检查。此前 1.1.0 已检查真实 YouTube 页面中的分享目标和嵌入代码，用户也反馈安装后普通视频、Shorts 和直播链接均已成功净化。这些结果不等于 1.2.0 已在所有浏览器、平台账号中完成最终发送测试。

## 开发验证

Node.js 20 或更新版本，无须安装依赖：node --test tests/userscript.test.cjs。

便携测试覆盖链接、嵌入代码文本、社交目标、十种语言及语言回退。发布准备期间另外执行了浏览器模拟测试，两者范围不同。

## 致谢

由 wrrsesais 维护，使用 OpenAI Codex 辅助开发、测试和文档编写。

## 许可

[MIT](LICENSE)，copyright 2026 wrrsesais。
