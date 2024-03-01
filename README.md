# InclusiveToiletProject

![Master Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-master.yml/badge.svg)
![Dev Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-dev.yml/badge.svg)
![Pages Deployment Workflow](https://github.com/Angelkawaii2/InclusiveToiletProject/actions/workflows/pages/pages-build-deployment/badge.svg)

包容性卫生间数据采集项目

[➡️在线体验: InclusiveToiletProject](https://angelkawaii2.github.io/InclusiveToiletProject/)

[⚠️Dev 测试分支 (不稳定，慎用)](https://angelkawaii2.github.io/InclusiveToiletProject/dev/)

## 当前分支版本 | App Version

### v0.2.0-dev1 (20240301)

<details>

<summary>
点击展开更新日志
</summary>
变更

1. 解耦 GPSLocation 组件
2. 测试同时部署多个分支到 GitHub Pages 以避免变更影响到 release 版本
3. 在数据中添加DEBUG节点，存储项目编译时间和app版本
4. 修复 data.toiletMetadata.score.recommendation 节点更新错误的问题

已知问题
1. 第一次点击获取gps时，deltaSec 的UI更新会延迟1秒

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

