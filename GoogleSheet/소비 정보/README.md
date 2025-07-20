# 소비 정보 시트(Spend Log sheet)

<img width="1362" height="742" alt="image" src="https://github.com/user-attachments/assets/7cef7484-5ee9-473f-ae10-1fcf16fa4364" />

**사용하는 계좌와 구글 워크스페이스를 연동하는 것은 불가능하며 계좌의 수가 다수이기에 데이터의 입력은 매일 수기가 필요하다.**

#

<img width="670" height="320" alt="image" src="https://github.com/user-attachments/assets/b18ac9d9-e476-4c4d-b91e-44151774f8b5" />

**소비 내역에 대한 메모 또한 작성한다.**

#

### 시트 정보 추출 후 매 달 말 이메일 자동 전송 작업을 수행하는 스크립트
```
function sendSumEmail() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 📌 합계 계산 (M2:M33)
  const sumRange = sheet.getRange("M2:M33").getValues();
  const sum = sumRange.reduce((acc, row) => acc + (parseFloat(row[0]) || 0), 0);

  // 📌 수신자 이메일 (B34)
  const recipient = sheet.getRange("B34").getValue();
  if (!recipient) {
    throw new Error("B34 셀에 이메일 주소가 없습니다.");
  }

  // 📌 Gmail 초안 제목 (고정)
  const subjectLine = '소비 정보';

  // 📌 Gmail 초안 템플릿 가져오기
  const template = getGmailTemplateFromDrafts_(subjectLine);

  // 📌 자리표시자 치환
  const msgObj = fillInTemplate_(
    template.message, 
    { Sum: sum.toFixed(2) } // 소수점 2자리로 포맷
  );

  // 📌 메일 전송
  GmailApp.sendEmail(recipient, msgObj.subject, msgObj.text, {
    htmlBody: msgObj.html,
    attachments: template.attachments,
    inlineImages: template.inlineImages
  });

  // ✅ 사용자 알림 제거 → 로그만 남김
  Logger.log(`이메일을 ${recipient}로 보냈습니다. 합계: ${sum.toFixed(2)}`);
}

/**
 * Gmail 초안 템플릿 불러오기
 */
function getGmailTemplateFromDrafts_(subject_line){
  const drafts = GmailApp.getDrafts();
  const draft = drafts.filter(d => d.getMessage().getSubject() === subject_line)[0];
  if (!draft) {
    throw new Error(`제목이 '${subject_line}'인 Gmail 초안을 찾을 수 없습니다.`);
  }

  const msg = draft.getMessage();
  const attachments = msg.getAttachments({includeInlineImages: false});
  const allInlineImages = msg.getAttachments({includeInlineImages: true, includeAttachments:false});
  const htmlBody = msg.getBody();

  const imgObj = allInlineImages.reduce((o, img) => {
    o[img.getName()] = img;
    return o;
  }, {});

  const matches = [...htmlBody.matchAll(/<img.*?src="cid:(.*?)".*?alt="(.*?)"[^\>]+>/g)];
  const inlineImagesObj = {};
  matches.forEach(match => inlineImagesObj[match[1]] = imgObj[match[2]]);

  return {
    message: {
      subject: subject_line,
      text: msg.getPlainBody(),
      html: htmlBody
    },
    attachments: attachments,
    inlineImages: inlineImagesObj
  };
}

/**
 * 자리표시자 치환 함수
 */
function fillInTemplate_(template, data) {
  let templateString = JSON.stringify(template);
  templateString = templateString.replace(/{{[^{}]+}}/g, key => {
    const cleanKey = key.replace(/[{}]+/g, "").trim();
    return data[cleanKey] != null ? data[cleanKey] : "";
  });
  return JSON.parse(templateString);
}
```

#

### 작성한 메모를 추출하는 스크립트
```다
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
```

#

### 이메일 전송 작업이 완료되면 모바일 위젯에서 바로 확인
<img width="1080" height="1404" alt="image" src="https://github.com/user-attachments/assets/97aea74f-011a-47cc-8d44-33cee8e60dd2" />
<img width="966" height="1243" alt="image" src="https://github.com/user-attachments/assets/ee7f4f03-a7c9-48b0-a292-b0e1792befc0" />
