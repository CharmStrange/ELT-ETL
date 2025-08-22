function main() {
  var allData = [];  // 모든 데이터를 저장할 배열

  // Files, Folders, Analyze 각각에서 데이터 수집
  allData = allData.concat(Files());  // Files에서 반환된 데이터를 allData에 합침
  allData = allData.concat(Folders());  // Folders에서 반환된 데이터를 allData에 합침
  allData = allData.concat(Analyze());  // Analyze에서 반환된 데이터를 allData에 추가

  // 데이터 삽입
  writeToSheet(allData);
}

function writeToSheet(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 2행부터 기존 데이터를 삭제 (1행은 헤더를 남겨두기 위함)
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent(); // 2행부터 데이터 삭제
  }

  // 데이터가 1차원 배열인 경우 2차원 배열로 변환
  if (data.length && !Array.isArray(data[0])) {
    data = [data];  // 1차원 배열을 2차원 배열로 변환
  }

  // 전체 데이터 개수 계산
  var numRows = data.length; // 행의 수
  var numColumns = data[0].length; // 열의 수

  // 시트의 열 수를 확인하고, 데이터의 열 수가 시트의 열 수와 일치하는지 확인
  var sheetColumns = sheet.getLastColumn();

  // 데이터가 예상보다 적은 열 수를 가지고 있으면, 열 수를 맞추기 위해 빈 데이터를 추가
  if (numColumns < sheetColumns) {
    for (var i = 0; i < numRows; i++) {
      while (data[i].length < sheetColumns) {
        data[i].push(""); // 열 수가 부족하면 빈 값을 추가
      }
    }
  }

  // 데이터 삽입: 한 번에 모든 데이터를 삽입
  if (data.length > 0) {
    sheet.getRange(2, 1, numRows, sheetColumns).setValues(data);  // 2행부터 데이터 삽입
  }
}

function Files() {
  var allFilesData = [];  // 파일 데이터를 모을 배열
  var files = DriveApp.getFiles();

  while (files.hasNext()) {
    var file = files.next();
    var owner = file.getOwner() ? file.getOwner().getEmail() : 'No owner';  // 파일 소유자
    var sharingStatus = getSharingStatus(file);  // 공유 상태 체크
    var lastUpdated = file.getLastUpdated();  // 마지막 수정 시간

    var data = [
      file.getName(),                        // File Name
      'File',                                // Type
      file.getSize(),                        // Size in bytes
      file.getDateCreated(),                 // Created Date
      lastUpdated,                           // Last Updated (수정 시간)
      file.getMimeType(),                    // File Type (MIME Type)
      owner,                                 // Owner
      sharingStatus,                         // Sharing Status
      '',                                    // 파일의 폴더에 대한 정보는 여기에는 없음
      lastUpdated                              // 마지막 수정 시간을 대신 기록
    ];
    allFilesData.push(data);  // 각 파일 데이터를 배열에 추가
  }

  return allFilesData;  // 전체 파일 데이터를 반환
}

function Folders() {
  var allFoldersData = [];  // 폴더 데이터를 모을 배열
  var folders = DriveApp.getFolders();

  while (folders.hasNext()) {
    const folder = folders.next();
    var fileCount = countFilesInFolder(folder);  // 폴더 내 파일 수
    var owner = folder.getOwner() ? folder.getOwner().getEmail() : 'No owner'; // 폴더 소유자
    var sharingStatus = getSharingStatus(folder);  // 폴더 공유 상태
    var lastUpdated = getLastUpdatedInFolder(folder);  // 폴더 내 최신 수정 시간

    var data = [
      folder.getName(),                      // Folder Name
      'Folder',                              // Type
      '',                                    // 폴더는 크기가 없음
      folder.getDateCreated(),               // Created Date
      lastUpdated,                           // Last Updated (폴더 내 최신 수정 시간)
      'Folder',                              // MIME Type (폴더에는 없음)
      owner,                                 // Owner
      sharingStatus,                         // Sharing Status
      fileCount,                             // File Count in Folder
      lastUpdated                             // 마지막 수정 시간
    ];
    allFoldersData.push(data);  // 각 폴더 데이터를 배열에 추가
  }

  return allFoldersData;  // 전체 폴더 데이터를 반환
}

function Analyze() {
  var available_bytes = DriveApp.getStorageLimit();
  var used_bytes = DriveApp.getStorageUsed();

  Logger.log('Available Storage: ' + available_bytes);
  Logger.log('Used Storage: ' + used_bytes);

  // 스토리지 정보 배열로 반환
  return [['Storage Information', '', 'Used: ' + used_bytes + ' bytes', 'Available: ' + available_bytes + ' bytes', '', '', '', '', '', '']];
}

function countFilesInFolder(folder) {
  var files = folder.getFiles();
  var count = 0;

  while (files.hasNext()) {
    files.next();
    count++;
  }

  return count;
}

function getLastUpdatedInFolder(folder) {
  var files = folder.getFiles();
  var lastUpdated = new Date(0); // 초기값: 아주 오래된 날짜

  while (files.hasNext()) {
    var file = files.next();
    var fileLastUpdated = file.getLastUpdated();

    if (fileLastUpdated > lastUpdated) {
      lastUpdated = fileLastUpdated;
    }
  }

  return lastUpdated;
}

function getSharingStatus(item) {
  var viewers = item.getViewers();
  var editors = item.getEditors();

  var status = 'Private'; // 기본적으로는 비공개로 설정

  if (viewers.length > 0 || editors.length > 0) {
    status = 'Shared';
  }

  return status;
}
