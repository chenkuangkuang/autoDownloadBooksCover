# autoDownloadBooksCover
自动从豆瓣下载书籍封面的爬虫（node + puppeteer）

使用说明：

1.在allBooks.txt文件中写下你想下载的书封面对应的书名，使用换行分隔，请尽量保证名称准确，尽量不使用括号、冒号等；

2.下载基于puppeteer，需要科学上网才能安装，或使用离线安装；

  -离线安装可以参考 https://www.jianshu.com/p/873f0bb2c3e5

3.封面图片会自动下载到downloads文件夹内；

4.下载出错中断时，不必惊慌，继续运行脚本，已下载的不会覆盖，脚本会自动查询已下载的文件，并继续下载未下载的。
