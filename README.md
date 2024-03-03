# InclusiveToiletProject

![Master Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-master.yml/badge.svg)
![Dev Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-dev.yml/badge.svg)
![Pages Deployment Workflow](https://github.com/Angelkawaii2/InclusiveToiletProject/actions/workflows/pages/pages-build-deployment/badge.svg)

包容性卫生间数据采集项目

【稳定版(经过测试)】[➡️在线体验(支持PWA)](https://angelkawaii2.github.io/InclusiveToiletProject/)

【测试版(最新预览)】[⚠️Dev 测试分支 (不稳定慎用)](https://angelkawaii2.github.io/InclusiveToiletProject/dev/)

## 当前分支版本 | App Version

### v0.2.0-dev4 (20240303)

<details>

<summary>
点击展开更新日志
</summary>

v0.2.0-dev4 变更 (20240303)

1. 修复GPS计时器在部分浏览器对标签页休眠后不准确的问题
2. 

v0.2.0-dev3 变更 (20240303)

1. 修正了背景样式无法铺满页面的问题
2. 修正了页面在宽屏下布局错乱的问题
3. 适配宽屏界面（iPad等）采用自适应布局
4. 修正了第三卫生间卡片的样式问题
5. 增加部分按钮和单选框点击面积，增强移动端易用性

已知问题：
1. 部分vita变量无法正常生效，需手动修改currentData.js中的版本号

----
v0.2.0-dev2 变更 (20240302)

1. 解耦剩余其他组件
2. 引入pinia管理全局状态
3. 为``metadata``面板中添加了吹风机/干手机的选项
4. 修正部分翻译问题

----

v0.2.0-dev1 变更 (20240301)

1. 解耦 GPSLocation 组件
2. 测试同时部署多个分支到 GitHub Pages 以避免变更影响到 release 版本
3. 在数据中添加DEBUG节点，存储项目编译时间和app版本
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

