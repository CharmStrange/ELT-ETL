function parseRSSAndWriteAllToSheet() {
  var url = "https://rss.blog.naver.com/zetmond.xml";
  var response = UrlFetchApp.fetch(url);
  var xml = response.getContentText();

  var document = XmlService.parse(xml);
  var root = document.getRootElement(); // <rss>
  var channel = root.getChild("channel");
  var items = channel.getChildren("item");

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // 기존 데이터 지우고 새로 씀

  // 헤더 작성
  sheet.getRange(1, 1, 1, 4).setValues([["제목", "카테고리", "발행일", "태그"]]);

  var data = [];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];

    var title = getText(item, "title");
    var category = getText(item, "category");
    var pubDate = getText(item, "pubDate");
    var tag = getText(item, "tag");

    data.push([title, category, pubDate, tag]);
  }

  // 시트에 데이터 기록
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, 4).setValues(data);
  }
}

function getText(parent, tagName) {
  var child = parent.getChild(tagName);
  if (!child) return "";
  return child.getText().trim();
}
