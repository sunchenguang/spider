# 基于 nodejs 的可视化博客园爬虫项目

运行方式
```js
//启动后端服务器
node index.js
//运行客户端,将index.html置于任意静态服务器或Apache, Nginx可访问的环境下
//例如在当前目录终端下，安装http-server后运行，访问 http://localhost:8080, 端口若冲突可自行修改 
http-server 



```

## 相关博文

具体使用请看：
原文链接：
[【node爬虫】前端爬虫系列「博客园」爬虫](http://www.cnblogs.com/coco1s/p/4954063.html)




### 技术要点
- 客户端
    - 原生 fetch API 取数据
    - ECharts做数据可视化
    
- 服务端
    - node http server，做CORS，允许跨域
    - superagent做发送请求工具
    - cheerio做解析网页的工具
    - async控制异步抓取
    - eventproxy做事件代理，对已抓取文章计数
    - 业务逻辑

### 后续
- 模块化代码
- 对几个具体工具做进一步研究
- 优化数据展示
- 爬虫的训练机制
- 使用不同语言的学习成本对比















## license 
MIT
