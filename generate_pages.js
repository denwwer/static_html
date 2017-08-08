var fs = require('fs');
var sitemap = new WebPage();
var urls = [];
var currDir = fs.workingDirectory;

// Domain name
// var domain = 'https://domain.com';
var domain = '';

// URL to sitemap
var sitemapUrl = domain + '/sitemap.xml';

// What path in sitemap should be skipped
// var skipPath = ['/icons', '/status'];
var skipPath = [];

// Where save generated pages
// var pagesPath = '/public/static_pages';
var pagesPath = '';

// Just set some User Agent
var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36';
var path = currDir + pagesPath;

if (fs.isDirectory(path)) {
  console.log('Clear dir');
  fs.removeTree(path);
}

console.log('Create dir');
fs.makeDirectory(path);

sitemap.open(sitemapUrl, function() {
  var content = sitemap.content;
  parser = new DOMParser();
  xmlDoc = parser.parseFromString(content, 'text/xml');
  var loc = xmlDoc.getElementsByTagName('loc');

  for (var i=0; i < loc.length; i++) {
    var url = loc[i].textContent;
    var path = url.replace(domain, '');

    if (skipPath.indexOf(path) === -1) { urls.push(url); }
  }
});

sitemap.onLoadFinished = function() {
  parsePage();
};

function parsePage() {
  if (urls.length === 0) { phantom.exit(); }

  var url = urls[0];
  var page = new WebPage();
  page.settings.userAgent = userAgent;
  var pagePath = url.split('.com/')[1] || 'home';
  var savePath = path + '/' + pagePath.replace('/', '_') + '.html';

  page.open(url, function() {
    page.evaluate(function() { });

    console.log('Parse /' + pagePath);
    var content = page.content;
    fs.write(savePath, content, 'w');
    urls.shift();
    parsePage();
  });
}
