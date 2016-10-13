var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    eventproxy = require('eventproxy');

var utils = require('./util/utils');
var personInfo = utils.getPersonInfo;
var isRepeat = utils.isRepeat;
var fs = require('fs');
var ep = new eventproxy();

var catchFirstUrl = 'http://www.cnblogs.com/',	//入口页面
    deleteRepeat = {},	//去重哈希数组
    urlsArray = [],	//存放爬取网址
    catchDate = [],	//存放爬取数据
    pageUrls = [],	//存放收集文章页面网站
    pageNum = 2;	//要爬取文章的页数

for (var i = 1; i <= pageNum; i++) {
    pageUrls.push(`${catchFirstUrl}?CategoryId=808&CategoryType=%22SiteHome%22&ItemListActionName=%22PostList%22&PageIndex=${i}&ParentCategoryId=0`);
}

//环环相扣
//1. 遍历多个文章目录页，异步抓取每个文章目录页中所有文章的url
//2. 当所有文章的url都抓取完毕后开始一次对5个文章url进行异步抓取
//3. 在对每个文章url抓取后将需要的数据放到全局的数组中存储


// 主start程序
function start() {
    function onRequest(req, res) {
        //设置服务器的cors，解决跨域问题
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        // 设置字符编码(去掉中文会乱码)
        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});

        // 当触发 (pageUrls.length * 20) 次‘BlogArticleHtml’事件后 执行回调，每次触发时把附带的数据放到articleUrls中
        ep.after('BlogArticleHtml', pageUrls.length * 20, function (articleUrls) {


            //控制并发数
            var reptileMove = function (url, callback) {
                //收集数据
                //1、收集用户个人信息，昵称、园龄、粉丝、关注
                var currentBlogApp = url.split('/p/')[0].split('/')[3];
                var flag = isRepeat(deleteRepeat, currentBlogApp);

                if (!flag) {
                    var appUrl = `http://www.cnblogs.com/mvc/blog/news.aspx?blogApp=${currentBlogApp}`;
                    personInfo(appUrl, function (info) {
                        //返回数据后执行添加数据
                        catchDate.push(info);
                        //此处必须调用callback，来确保personInfo的回调被正常执行，否则不会等待personInfo的异步请求完成
                        callback(null, 'new author');
                    });

                }
                else {
                    callback(null, 'existed author');
                }


            };

            // 使用async控制异步抓取，避免卡死
            // mapLimit(arr, limit, iterator, [callback])
            // 异步回调
            async.mapLimit(articleUrls, 5,
                function (url, callback) {
                    reptileMove(url, callback);
                },
                function (err, results) {
                    //results是reptileMove 执行callback返回的

                    var len = 0,
                        aveAge = 0,
                        aveFans = 0,
                        aveFocus = 0, eachDateJson, eachDateJsonFans, eachDateJsonFocus;

                    len = catchDate.length;

                    for (var i = 0; i < len; i++) {
                        eachDateJson = catchDate[i];
                        // 小几率取不到值则赋默认值
                        eachDateJsonFans = eachDateJson.fans || 110;
                        eachDateJsonFocus = eachDateJson.focus || 11;

                        aveAge += parseInt(eachDateJson.age);
                        aveFans += parseInt(eachDateJsonFans);
                        aveFocus += parseInt(eachDateJsonFocus);
                    }


                    var sendData = JSON.stringify({
                        pageNum: pageNum * 20,
                        authorNum: len,
                        aveAge: Math.round(aveAge / len),
                        aveFans: Math.round(aveFans / len),
                        aveFocus: Math.round(aveFocus / len)
                    });

                    res.end(sendData);

                });
        });

        // 轮询 所有文章列表页
        pageUrls.forEach(function (pageUrl) {
            superagent.get(pageUrl)
                .end(function (err, pres) {
                    // 常规的错误处理

                    if (err) {
                        console.log(err);
                    }
                    // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
                    // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
                    // 剩下就都是 jquery 的内容了
                    var $ = cheerio.load(pres.text);
                    var curPageUrls = $('.titlelnk');
                    for (var i = 0; i < curPageUrls.length; i++) {
                        var articleUrl = curPageUrls.eq(i).attr('href');
                        urlsArray.push(articleUrl);
                        // 相当于一个计数器
                        ep.emit('BlogArticleHtml', articleUrl);
                    }
                })
        })
    }

    http.createServer(onRequest).listen(3000);
}

exports.start = start;