function main() {
  extractNotes("7월");
}

function extractNotes(targetMonth) {
  const sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(targetMonth);
  const statsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("통계");

  if (!sourceSheet) {
    Logger.log(`시트 "${targetMonth}"를 찾을 수 없습니다.`);
    return;
  }

  if (!statsSheet) {
    Logger.log(`"통계" 시트를 찾을 수 없습니다.`);
    return;
  }

  // 📌 전체 범위에서 메모 추출
  const range = sourceSheet.getDataRange();
  const notes = range.getNotes();
  const startRow = range.getRow();
  const startCol = range.getColumn();

  const extractedNotes = [];

  for (let row = 0; row < notes.length; row++) {
    for (let col = 0; col < notes[row].length; col++) {
      const note = notes[row][col];
      if (note) {
        extractedNotes.push(note);
      }
    }
  }

  if (extractedNotes.length === 0) {
    Logger.log(`"${targetMonth}" 시트에서 추출한 메모가 없습니다.`);
    return;
  }

  // 📌 "통계" 시트에서 월 이름을 가진 셀 찾기
  const statsRange = statsSheet.getDataRange();
  const statsValues = statsRange.getValues();
  const statsStartRow = statsRange.getRow();
  const statsStartCol = statsRange.getColumn();

  let targetRow = -1;
  let targetCol = -1;

  for (let row = 0; row < statsValues.length; row++) {
    for (let col = 0; col < statsValues[row].length; col++) {
      if (statsValues[row][col] === targetMonth) {
        targetRow = statsStartRow + row;
        targetCol = statsStartCol + col;
        break;
      }
    }
    if (targetRow !== -1) break;
  }

  if (targetRow === -1) {
    Logger.log(`"통계" 시트에서 "${targetMonth}" 셀을 찾을 수 없습니다.`);
    return;
  }

  // 📌 해당 셀 바로 아래부터 메모 기록
  for (let i = 0; i < extractedNotes.length; i++) {
    statsSheet.getRange(targetRow + 1 + i, targetCol).setValue(extractedNotes[i]);
  }

  Logger.log(`"${targetMonth}" 메모를 "통계" 시트 ${targetRow + 1}행부터 기록했습니다.`);
}
