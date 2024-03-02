# Changelog


## v0.2.0-dev3 (20240303)

<details>

<summary>
点击展开更新日志
</summary>
变更

</details>

## v0.2.0-dev2

<details>
<summary>
更新日期: 20240302
</summary>
变更

1. 解耦剩余其他组件
2. 引入pinia管理全局状态
3. 组件修改为使用pinia
4. 为``metadata``面板中添加了吹风机/干手机的选项

已知问题

</details>


## v0.2.0-dev1 

<details>
<summary>
更新日期: 20240301
</summary>
变更

1. 解耦 GPSLocation 组件
2. 测试同时部署多个分支到 GitHub Pages 以避免变更影响到 release 版本
3. 在数据中添加DEBUG节点，存储项目编译时间和app版本
4. 修复 data.toiletMetadata.score.recommendation 节点更新错误的问题

已知问题
1. 第一次点击获取gps时，deltaSec 的UI更新会延迟1秒
</details>


## v0.1.2

### 变更

1. 修正数据版本号未更新的问题

## v0.1.1

### 变更

1. 修正PWA更新问题
    - 原先旧版本需手动清除浏览器缓存/ServiceWorker

## v0.1.0-alpha-数据版本-20240221

### 变更

1. **优化页面布局**
    - 对不同的组件使用卡片进行分区
    - 为部分选项添加默认值
    - 优化时间选择器
    - 优化页面在移动端的表现
    - 新增了一键恢复初始值的功能（便于移动端PWA使用）
2. **更新数据版本**
    - 更多信息请参照 [v2-20240221.md](data_structure/v2-20240221.md)
3. **重构了语言文件部分字段**
    - 已同步更新英文与日文版本

## v0.0.1-prototype-数据版本-20240210

first release