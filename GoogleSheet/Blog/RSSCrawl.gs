function parseRSSAndWriteAllToSheet() {
  var url = "https://rss.blog.naver.com/zetmond.xml";
  var response = UrlFetchApp.fetch(url);
  var xml = response.getContentText();

  var document = XmlService.parse(xml);
  var root = document.getRootElement(); // <rss>
  var channel = root.getChild("channel");
  var items = channel.getChildren("item");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("RSS Crawl");
  if (!sheet) {
    Logger.log("RSS Crawl 시트가 없습니다.");
    return;
  }

  var data = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    var title = getText(item, "title");
    var category = getText(item, "category");
    var pubDate = getText(item, "pubDate");
    var tag = getText(item, "tag");

    data.push([title, category, pubDate, tag]);
  }

  // 시트 초기화: 기존 데이터 전부 삭제
  sheet.clear();

  // 헤더 작성
  sheet.getRange(1, 1, 1, 4).setValues([["제목", "카테고리", "발행일", "태그"]]);

  // 새로운 데이터가 있으면 2행부터 작성
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 4).setValues(data);
  } else {
    Logger.log("추출한 데이터가 없습니다.");
  }
}

function getText(parent, tagName) {
  var child = parent.getChild(tagName);
  if (!child) return "";
  return child.getText().trim();
}
