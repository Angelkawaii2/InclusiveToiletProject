# InclusiveToiletProject

![Master Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-master.yml/badge.svg)
![Dev Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-dev.yml/badge.svg)
![Pages Deployment Workflow](https://github.com/Angelkawaii2/InclusiveToiletProject/actions/workflows/pages/pages-build-deployment/badge.svg)

包容性卫生间地图数据采集项目

[//]: # (【稳定版&#40;经过测试&#41;】[➡️ 在线体验&#40;支持PWA&#41;]&#40;https://angelkawaii2.github.io/InclusiveToiletProject/&#41;)

【测试版(最新功能预览)】[🛠️ Dev 测试分支](https://angelkawaii2.github.io/InclusiveToiletProject/dev/)

## 当前分支版本 | App Version

### v0.3.0.20240628-dev.3 (20240628)

<details>

<summary>
点击展开更新日志
</summary>

----
v0.3.0.20240628-dev.3 变更 (20240628)

1. 数据版本更新到
2. 增加了卫生间名称字段

v0.3.0.20240430-dev.2 变更 (20240430)

1. 新增 地图组件，支持定位点可视化
2. 更新 依赖库版本


v0.3.0.20240321-dev.1 变更 (20240321)

1. 更新 版本号，使其符合语义化版本规范
2. 优化 添加界面的布局效果，现在多栏能够紧凑显示
3. 添加 版本号水印标识于Dev分支构建的页面
4. 修正 GPS组件 在 点击reset按钮后 显示的 距离上次获取时间 错误的问题
5. 更新 语言文件，优化部分表达方式

v0.2.1-dev1 变更 (20240320)

1. 增加 ``zh-tw`` 和 ``zh-nyaa`` 翻译文件
2. 引入 ``Vue-router`` ，拆分页面，为后续扩展做准备
3. 优化  GPS组件 的按钮交互效果

已知问题

1. 除简体中文外部分翻译不完整，等正式版再添加进去

----

</details>

**不同分支请在 GitHub Pages 的 URL 后添加分支名:**

- ``dev``: 开发中分支，仅供测试预览 **(不建议普通用户使用)**
- ``beta``（暂时还没有）: 也许能用的版本，但未经过测试
- ``master``: 经过测试的版本 (默认)

### 数据版本 | DataVersion

1. [v0.0.1 => v1-20240210](./data_structure/v1-20240210.md)
2. [v0.1.0 => v2-20240221](./data_structure/v2-20240221.md)
3. [v0.2.0 => v3-20240301](./data_structure/v3-20240301.md)
4. [v0.3.0 => v4-20240628](./data_structure/v4-20240628.md)

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

