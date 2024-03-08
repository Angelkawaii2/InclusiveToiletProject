# InclusiveToiletProject

![Master Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-master.yml/badge.svg)
![Dev Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-dev.yml/badge.svg)
![Pages Deployment Workflow](https://github.com/Angelkawaii2/InclusiveToiletProject/actions/workflows/pages/pages-build-deployment/badge.svg)

包容性卫生间数据采集项目

【稳定版(经过测试)】[➡️在线体验(支持PWA)](https://angelkawaii2.github.io/InclusiveToiletProject/)

【测试版(最新预览)】[⚠️Dev 测试分支 (慎用)](https://angelkawaii2.github.io/InclusiveToiletProject/dev/)

## 当前分支版本 | App Version

### v0.2.0-dev4 (20240308)

<details>

<summary>
点击展开更新日志
</summary>

----

v0.2.0-dev4 变更 (20240308)

1. 修复 GPS计时器 在部分浏览器对标签页休眠后不准确的问题
2. 修复 vite变量 无法使用的问题（之后需要修ts的代码提示，现在先跑起来）
3. 修复 data 中没有 version 字段的问题
4. 更新 comments 组件，为按钮添加更多常用标签
5. 优化 页面布局和显示效果，修正一些布局偏移，添加图标到简体中文 i18n
6. 新增 判断当前部署是否为Dev分支，在主页给予用户提示

v0.2.0-dev3 变更 (20240303)

1. 修正 背景样式无法铺满页面
2. 修正 页面在宽屏下布局错乱
3. 适配 宽屏界面（iPad等）采用自适应布局
4. 修正 第三卫生间卡片样式
5. 优化 部分按钮和单选框点击面积，增强移动端易用性

已知问题：

1. 部分vita变量无法正常生效，需手动修改currentData.js中的版本号

----
v0.2.0-dev2 变更 (20240302)

1. 解耦 剩余其他组件
2. 增加 pinia 组件，管理全局状态
3. 增加 ``metadata``面板中 吹风机/干手机的选项
4. 修正 部分翻译问题

----

v0.2.0-dev1 变更 (20240301)

1. 解耦 GPSLocation 组件
2. 测试 同时部署多个分支到 GitHub Pages 以避免变更影响到 release 版本
3. 添加 DEBUG节点到data数据中，存储项目编译时间和app版本供未来可能的升级使用
4. 修复 data.toiletMetadata.score.recommendation 节点更新错误的问题

已知问题

1. 第一次点击获取gps时，deltaSec 的UI更新会延迟1秒

----

</details>

**不同分支请在 GitHub Pages 的 URL 后添加分支名:**

- ``dev``: 开发中分支，不保证功能正常(不建议普通用户使用)
- ``beta``: 也许能用的版本，但未经过测试
- ``master``: 经过测试的版本 (默认)

### 数据版本 | DataVersion

1. [v0.0.1 => v1-20240210](./data_structure/v1-20240210.md)
2. [v0.1.0 => v2-20240221](./data_structure/v2-20240221.md)
3. [v0.2.0 => v3-20240301](./data_structure/v3-20240301.md)

## 更新路线 | RoadMap

- [x] 数据采集功能
    - [x] 记录GPS坐标
    - [x] 记录照片
- [x] i18n 多语言支持 (英语、简体中文、日语)
    - 除中文以外均由 GPT 翻译，欢迎提交更正
- [ ] 数据持久化
    - [x] 单条数据导出
    - [ ] IndexedDB 持久化
    - [ ] 全量数据导出
- [ ] 数据编辑
- [ ] 数据导入
- [ ] 云端评价/评论功能

## 开源许可证 | License

GPL v3

