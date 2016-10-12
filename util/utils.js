/**
 * Created by suncg on 2016/10/12.
 */
var superagent = require('superagent');
var cheerio = require('cheerio');


// 抓取昵称、入园年龄、粉丝数、关注数
function getPersonInfo(url, cb) {
    var infoArray = {};
    superagent.get(url)
        .end(function (err, ares) {
            if (err) {
                console.log(err);
                return;
            }

            var $ = cheerio.load(ares.text),
                info = $('#profile_block a'),
                len = info.length,
                age = "",
                flag = false,
                curDate = new Date();
            var city = $('#blog-news>div:first-child>span:first-child>p:last-child');

                console.log(city.html())
                // console.log(city.text())
                // .html().trim().split('<br>')[1].split('：')[1];
            // console.log(city)

            // 小概率异常抛错
            try {
                age = "20" + (info.eq(1).attr('title').split('20')[1]);
            }
            catch (err) {
                console.log(err);
                age = "2012-11-06";
            }

            infoArray.name = info.eq(0).text();
            infoArray.age = parseInt((new Date() - new Date(age)) / 1000 / 60 / 60 / 24);

            if (len == 4) {
                infoArray.fans = info.eq(2).text();
                infoArray.focus = info.eq(3).text();
            } else if (len == 5) {// 博客园推荐博客
                infoArray.fans = info.eq(3).text();
                infoArray.focus = info.eq(4).text();
            }
            //console.log('用户信息:'+JSON.stringify(infoArray));
            // console.log(infoArray)
            // return infoArray;
            cb(infoArray);

        });
}

// 判断作者是否重复
function isRepeat(deleteRepeat, authorName) {
    if (deleteRepeat[authorName] == undefined) {
        deleteRepeat[authorName] = 1;
        return 0;
    } else if (deleteRepeat[authorName] == 1) {
        return 1;
    }
}


module.exports = {
    getPersonInfo,
    isRepeat
}






















