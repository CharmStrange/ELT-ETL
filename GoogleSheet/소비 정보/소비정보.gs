function sendSumEmail() {
  sendSumEmailForMonth("7월");
}

function sendSumEmailForMonth(monthName) {
  const monthList = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  
  if (!monthList.includes(monthName)) {
    throw new Error(`"${monthName}"은 유효한 월 이름이 아닙니다.`);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(monthName);
  if (!sheet) {
    throw new Error(`"${monthName}"라는 시트를 찾을 수 없습니다.`);
  }

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
    { Sum: sum.toFixed(2), Month: monthName }
  );

  // 📌 메일 전송
  GmailApp.sendEmail(recipient, msgObj.subject, msgObj.text, {
    htmlBody: msgObj.html,
    attachments: template.attachments,
    inlineImages: template.inlineImages
  });

  // ✅ 로그 남기기
  Logger.log(`이메일을 ${recipient}로 보냈습니다. [${monthName}] 합계: ${sum.toFixed(2)}`);
}

//Gmail 초안 템플릿 불러오기
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

//자리표시자 치환 함수
function fillInTemplate_(template, data) {
  let templateString = JSON.stringify(template);
  templateString = templateString.replace(/{{[^{}]+}}/g, key => {
    const cleanKey = key.replace(/[{}]+/g, "").trim();
    return data[cleanKey] != null ? data[cleanKey] : "";
  });
  return JSON.parse(templateString);
}
