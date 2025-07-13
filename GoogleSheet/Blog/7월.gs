function copyJulyDataToSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 시트 가져오기
  var rssSheet = ss.getSheetByName("RSS Crawl");
  var julySheet = ss.getSheetByName("7월");

  if (!rssSheet || !julySheet) {
    Logger.log("RSS Crawl 시트 또는 7월 시트를 찾을 수 없습니다.");
    return;
  }

  // RSS Crawl 시트 데이터 읽기
  var rssData = rssSheet.getDataRange().getValues();

  if (rssData.length < 2) {
    Logger.log("RSS Crawl 시트에 데이터가 없습니다.");
    return;
  }

  // 헤더 인덱스 파악
  var header = rssData[0];
  var titleIdx = header.indexOf("제목");
  var categoryIdx = header.indexOf("카테고리");
  var pubDateIdx = header.indexOf("발행일");
  var tagIdx = header.indexOf("태그");

  if (titleIdx === -1 || categoryIdx === -1 || pubDateIdx === -1 || tagIdx === -1) {
    Logger.log("RSS Crawl 시트에 필요한 헤더가 없습니다.");
    return;
  }

  var julyData = [];

  for (var i = 1; i < rssData.length; i++) {
    var row = rssData[i];
    var pubDate = row[pubDateIdx];

    if (!pubDate) continue;

    // 발행일에서 년도와 월을 추출
    var parts = pubDate.split(" "); // ["Sun,", "13", "Jul", "2025", "10:59:45", "+0900"]
    var day = parts[1];
    var mon = parts[2];
    var year = parts[3];

    // 2025년 7월이면
    if (year === "2025" && mon === "Jul") {
      var yyyy = year;
      var mm = "07";
      var dd = day.padStart(2, "0");
      var yyyymmdd = `${yyyy}${mm}${dd}`;

      julyData.push([
        yyyymmdd,
        row[titleIdx],
        row[categoryIdx],
        row[tagIdx],
        "None"  // Statistics 기본값
      ]);
    }
  }

  if (julyData.length === 0) {
    Logger.log("7월에 작성된 글이 없습니다.");
    return;
  }

  // 7월 시트에 추가
  var startRow = julySheet.getLastRow() + 1;
  julySheet.getRange(startRow, 1, julyData.length, 5).setValues(julyData);

  Logger.log(`${julyData.length}개의 7월 데이터를 추가했습니다.`);
}
