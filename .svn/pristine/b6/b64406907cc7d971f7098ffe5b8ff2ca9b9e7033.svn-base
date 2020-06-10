export function resetRichTxt(txt) {
  var htmlTagReg2 = /(\<[^\<]*\>)|&\w*;|\t|\r/g;
  txt = txt.replace(htmlTagReg2, '');

  var htmlTagReg = /\n{2,}/g

  txt = txt.replace(htmlTagReg, '\n');
  return txt ;
}