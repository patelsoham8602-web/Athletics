/**
 * IIT (BHU) Athletics website ↔ Google Sheets bridge.
 *
 * SETUP:
 * 1. Create a Google Sheet.
 * 2. Extensions → Apps Script; replace Code.gs with this file.
 * 3. In Apps Script → Project Settings → Script Properties, add:
 *      ADMIN_SYNC_KEY = a long random secret you choose
 * 4. Run setupSheet once and approve the permissions.
 * 5. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the deployed /exec URL into the website Admin → Google Sheets sync.
 *
 * DATA FORMAT:
 * A tab named WebsiteData stores the entire site database as JSON in cell A2.
 * Public visitors can read the website data. Writes require ADMIN_SYNC_KEY.
 * Keep this sheet free of private or sensitive information.
 *
 * Note: Google Apps Script's web-app deployment/access options can vary by
 * Workspace policy. If "Anyone" access is disabled, use an approved backend.
 */

const SHEET_NAME = 'WebsiteData';
const DATA_CELL = 'A2';
const KEY_PROPERTY = 'ADMIN_SYNC_KEY';

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  sh.getRange('A1:B1').setValues([['last_updated_utc', 'website_data_json']]);
  if (!sh.getRange(DATA_CELL).getValue()) {
    sh.getRange('A2').setValue(new Date().toISOString());
    sh.getRange('B2').setValue('{}');
  }
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, 2);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== 'load') return output_({ok:true,message:'Athletics Sheets bridge is running. Use ?action=load to fetch site data.'}, p.callback);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) throw new Error('WebsiteData tab missing. Run setupSheet first.');
    const raw = sh.getRange('B2').getValue();
    if (!raw || raw === '{}') return output_({ok:false,error:'No website data saved yet. Publish from the website admin first.'}, p.callback);
    return output_({ok:true,data:JSON.parse(raw),updatedAt:sh.getRange('A2').getDisplayValue()}, p.callback);
  } catch (err) {
    return output_({ok:false,error:String(err.message || err)}, p.callback);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty(KEY_PROPERTY);
    if (!expected || !body.token || body.token !== expected) {
      return ContentService.createTextOutput(JSON.stringify({ok:false,error:'Unauthorized'})).setMimeType(ContentService.MimeType.JSON);
    }
    if (body.action !== 'save' || !body.data || !body.data.site || !Array.isArray(body.data.ath)) {
      return ContentService.createTextOutput(JSON.stringify({ok:false,error:'Invalid website data'})).setMimeType(ContentService.MimeType.JSON);
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) { setupSheet(); sh = ss.getSheetByName(SHEET_NAME); }
    const json = JSON.stringify(body.data);
    if (json.length > 45000000) throw new Error('Data is too large for a single Google Sheets cell. Use image URLs instead of embedding many photos.');
    sh.getRange('A2').setValue(new Date().toISOString());
    sh.getRange('B2').setValue(json);
    return ContentService.createTextOutput(JSON.stringify({ok:true,updatedAt:new Date().toISOString()})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message || err)})).setMimeType(ContentService.MimeType.JSON);
  }
}

function output_(obj, callback) {
  const json = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
