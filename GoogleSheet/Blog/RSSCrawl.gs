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

  // 현재 시트에 있는 기존 데이터를 읽음
  var existingData = sheet.getDataRange().getValues();

  // 첫 행이 헤더가 아니면 추가
  if (existingData.length === 0 || existingData[0][0] !== "제목") {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, 4).setValues([["제목", "카테고리", "발행일", "태그"]]);
    existingData = [["제목", "카테고리", "발행일", "태그"]];
  }

  // 기존에 기록된 글의 제목 리스트 추출 (1행 헤더는 제외)
  var existingTitles = existingData.slice(1).map(function(row) {
    return row[0];
  });

  var newData = [];

  // 새로운 데이터 중 기존 제목과 중복되지 않는 것만 추림
  for (var j = 0; j < data.length; j++) {
    if (existingTitles.indexOf(data[j][0]) === -1) {
      newData.push(data[j]);
    }
  }

  // 새로운 데이터가 있으면 시트 맨 위(헤더 바로 아래)에 삽입
  if (newData.length > 0) {
    sheet.insertRowsAfter(1, newData.length);
    sheet.getRange(2, 1, newData.length, 4).setValues(newData);
  } else {
    Logger.log("추가할 새로운 데이터가 없습니다.");
  }
}

function getText(parent, tagName) {
  var child = parent.getChild(tagName);
  if (!child) return "";
  return child.getText().trim();
}
