const fs = require('fs');
const puppeteer = require('puppeteer');
var request = require('request');
var readline = require('readline');

var allBooks = [];
var hasBooks = [];
var browser = null;
var bookName = '务虚笔记';
var folder = "./downloads"
// const sourceUrl = "https://book.douban.com/";
let sourceUrl = "https://search.douban.com/book/subject_search?search_text=" + bookName + "&cat=1001";

function downImg(opts = {}, path = '') {
  console.log('=opts=', opts);
  return new Promise((resolve, reject) => {
    request
      .get(opts)
      .on('response', (response) => {
        console.log("img type:", response.headers['content-type'])
      })
      .pipe(fs.createWriteStream(path))
      .on("error", (e) => {
        console.log("pipe error", e)
        resolve('');
      })
      .on("finish", () => {
        console.log("finish");
        resolve("ok");
      })
      .on("close", async () => {
        console.log("close");
      })

  })
};

var fRead = fs.createReadStream('./allBooks.txt');
var objReadline = readline.createInterface({ input: fRead });

// console.log('=fRead=', fRead);
// console.log('=objReadline=', objReadline);

objReadline.on('line', function (line) {
  if (!line.includes('【') && /[\u4e00-\u9fa5]/.test(line)) {
    // console.log('line:'+ line);
    allBooks = [...line.split(' '), ...allBooks];
  }
});

var book2href = {};

objReadline.on('close', function () {
  console.log('objReadline close',);
  checkHasDownload(() => {
    console.log('=allBooks=', allBooks, hasBooks);
    var books = allBooks.filter(i => !hasBooks.includes(i));
    console.log('开始下载：', books.length, JSON.stringify(books));

    (async () => {

      browser = await puppeteer.launch({ timeout: 55000, headless: false });
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });

      flag = 0;

      async function next() {
        book = books[flag];
        console.log('当前下载：', book);
        sourceUrl = "https://search.douban.com/book/subject_search?search_text=" + book + "&cat=1001";
        await page.goto(sourceUrl);
        await page.waitForSelector(".item-root", { timeout: 50000, visible: true });
        let href = await page.$eval("[alt~='" + book + "']", ele => ele.src);
        let rate = await page.$eval(".rating_nums", ele => ele.innerText);
        console.log('=href=', book, href);
        book2href[book] = [rate, href];
        flag++;

        (async (url, book) => {
          try {
            let opts = { url: url };
            let path = folder + '/' + book + ".jpg";
            var hasBook = fs.existsSync(path);
            if (!hasBook) {
              let r1 = await downImg(opts, path);
              console.log(r1);
            }
          }
          catch (e) {
            console.log(e);
          }
        })(href, book);

        console.log('=flag=', flag, books);
        if (flag < books.length) {
          next();
        } else {
          console.log('结束？',);
          await browser.close();
        }
        console.log('=book2href=', JSON.stringify(book2href));
      }

      next();
      // await page.waitFor(1000);
      // await browser.close();
    })()
  })

})

function checkHasDownload(callback) {
  console.log('=folder=', folder);
  fs.readdir(folder, function (err, files) {
    console.log('=e=', (files && files.length), JSON.stringify(files));
    files && files.forEach(function (item, index) {
      var file = folder + '/' + item;
      var name = item.replace(/\.[a-zA-Z]{2,4}$/, '');
      fs.stat(file, function (e, b) {
        if (b.size <= 0) {
          fs.unlink(file, function (err) {
            if (err) {
              throw err;
            }
            console.log('file', name + '删除成功！');
          })
        } else {
          hasBooks.push(name);
        }
        if (index == files.length - 1) {
          console.log('=hasBooks=', hasBooks.length, JSON.stringify(hasBooks));
          console.log('=============================');
          callback && callback(hasBooks);
        }
      });
    })
    console.log('=hasBooks=', hasBooks);
    if (!files || !files.length) {
      callback && callback(hasBooks);
    }

  })
}

// (async (url, book) => {
//   try {
//     let opts = { url: url };
//     let path = folder + '/' + book + ".jpg";
//     var hasBook = fs.existsSync(path);
//     if (!hasBook) {
//       let r1 = await downImg(opts, path);
//       console.log(r1);
//     }
//   }
//   catch (e) {
//     console.log(e);
//   }
// })(href, book)

    // await page.type('input[name=search_text]', bookName);
    // await page.click('input[type=submit]');

