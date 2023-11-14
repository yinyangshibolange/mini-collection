# mini-collection

前端资源优化整合, 包含css压缩，js压缩，图片压缩

## 使用方式

### 传统方法

1. 安装mini-collection

```shell
npm install mini-collection --save-dev / yarn add mini-collection -D / pnpm add mini-collection -D
```

2. 初始化配置文件

```shell
npx mini init
```

将在运行目录下生成一个mini.config.js配置文件

3. 按需修改配置文件

4. 编译并监听文件夹

```shell
npx mini start
```

### 使用脚本

```json
{
 "scripts": {
  "mini:start": "mini init && mini start -s static_dev -t static_dist"
 }
}

```


### 在程序中使用

```nodejs
const mini  = require("mini-collection")
const config = require("mini.config.js") // your vno config
mini(config)
 .then(() => {
  console.log("编译完成，开始监听文件夹")
 })
 .catch(err => {
  console.error(err)
 })
```

### 从1.0.10开始不再支持image压缩

### 获取帮助

```shell
npx mini --help
npx mini init --help
npx mini start --help
```
