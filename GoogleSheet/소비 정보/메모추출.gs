function extractNotesFromJulySheet() {
  const sheetName = '7월';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(`시트 "${sheetName}"를 찾을 수 없습니다.`);
    return;
  }

  const range = sheet.getDataRange();
  const notes = range.getNotes(); // 전체 범위의 메모 가져오기
  const startRow = range.getRow();
  const startCol = range.getColumn();

  for (let row = 0; row < notes.length; row++) {
    for (let col = 0; col < notes[row].length; col++) {
      const note = notes[row][col];
      if (note) {
        const cell = sheet.getRange(startRow + row, startCol + col).getA1Notation();
        Logger.log(`셀 ${cell}: ${note}`);
      }
    }
  }
}
