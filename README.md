# InclusiveToiletProject

![Master Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-master.yml/badge.svg)
![Dev Build Status](https://github.com/angelkawaii2/InclusiveToiletProject/actions/workflows/deploy-dev.yml/badge.svg)
![Pages Deployment Workflow](https://github.com/Angelkawaii2/InclusiveToiletProject/actions/workflows/pages/pages-build-deployment/badge.svg)

包容性卫生间地图数据采集项目

[//]: # (【稳定版&#40;经过测试&#41;】[➡️ 在线体验&#40;支持PWA&#41;]&#40;https://angelkawaii2.github.io/InclusiveToiletProject/&#41;)

在线访问：=> [🛠️ Dev 测试分支](https://angelkawaii2.github.io/InclusiveToiletProject/dev/) <=

---

## 当前分支版本 | App Version

### v0.5.3.20250507 (20241121)
1. 修复i18n t符号warning
2. el-radio 增加 label（未完成
3. 修复.env版本号未更新问题

### v0.5.2.20250507 (20241121)
1. 移除pwa包（依赖冲突）
2. 修复typescript支持（``tsconfig include /types``）
3. 更新三方依赖版本
4. 更新``en-us``翻译

### v0.5.1.20241121 (20241121)

1. 修复组件瀑布流显示问题

### v0.5.0.20241121 (20241121)

1. 升级数据版本到 20241121
2. 重构对应组件到新版本
3. 实现数据查询页面的导入测试效果预览（需要优化性能）
4. 引入 Tailwind CSS
5. 调整部分页面布局

### v0.4.0.20241119 (20240628)

1. 封装设置项，增加独立设置页
2. 拆分功能到独立tab
3. 暂时移除部分语言文件
4. 优化GPS获取
    - 修复超时卡住问题
    - 获取失败时，提示更详细的错误内容

---

[//]: # (**不同分支请在 GitHub Pages 的 URL 后添加分支名:**)

[//]: # ()
[//]: # (- ``dev``: 开发中分支，供测试预览)

[//]: # (- ``master``: 经过测试的版本 &#40;默认&#41;)

### 数据版本 | DataVersion

1. [v0.0.1 => v1-20240210](./data_structure/v1-20240210.md)
2. [v0.1.0 => v2-20240221](./data_structure/v2-20240221.md)
3. [v0.2.0 => v3-20240301](./data_structure/v3-20240301.md)
4. [v0.3.0 => v4-20240628](./data_structure/v4-20240628.md)
4. [v0.4.0+ => v5-20241121](./data_structure/v5-20240915.md)

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

