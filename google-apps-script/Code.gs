/**
 * HỆ THỐNG ĐỒNG BỘ GOOGLE SHEET & GOOGLE DRIVE
 * THƯ VIỆN HOẠT ĐỘNG HỖ TRỢ TÁI TẬP TRUNG
 * Tác giả: Cô Diệu Hiền
 *
 * HƯỚNG DẪN CÀI ĐẶT:
 * 1. Mở một Google Spreadsheet mới (https://sheets.new)
 * 2. Đặt tên: "Thư Viện Tái Tập Trung - Dữ Liệu & Nhật Ký"
 * 3. Vào menu: Tiện ích mở rộng (Extensions) -> Apps Script
 * 4. Dán toàn bộ nội dung mã này vào tệp Code.gs và nhấn biểu tượng Lưu (Ctrl+S)
 * 5. Nhấn nút "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 * 6. Chọn loại "Ứng dụng web" (Web app):
 *    - Mô tả: "API Thu Vien Tai Tap Trung"
 *    - Người thực thi (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)
 * 7. Nhấn "Triển khai", cấp quyền khi Google hỏi, sau đó sao chép "URL ứng dụng web" (Web App URL)
 * 8. Dán URL này vào mục cài đặt trên website hoặc tệp .env (VITE_APPS_SCRIPT_URL)
 */

const FOLDER_NAME = 'HocLieu_TaiTapTrung';
const TAB_STUDENT = 'HocSinh_LichSu';
const TAB_TEACHER = 'GiaoVien_LichSu';
const TAB_MATERIALS = 'HocLieu';

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : '';
    const data = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Ghi lịch sử hoạt động của Học sinh
    if (data.action === 'LOG_STUDENT') {
      const p = data.payload || {};
      const sheet = getOrCreateSheet(ss, TAB_STUDENT, [
        'Thời gian',
        'Họ và tên học sinh',
        'Lớp',
        'Trường',
        'Hành động',
        'Nội dung chi tiết',
        'Ghi chú',
      ]);
      sheet.appendRow([
        p.timestamp || new Date().toLocaleString('vi-VN'),
        p.fullName || '',
        p.className || '',
        p.schoolName || '',
        p.action || '',
        p.detail || '',
        p.notes || '',
      ]);
      return createJsonResponse({ success: true, message: 'Đã lưu log học sinh' });
    }

    // 2. Ghi lịch sử hoạt động của Giáo viên
    if (data.action === 'LOG_TEACHER') {
      const p = data.payload || {};
      const sheet = getOrCreateSheet(ss, TAB_TEACHER, [
        'Thời gian',
        'Tên giáo viên',
        'Hành động',
        'Học liệu / Đối tượng',
        'Chi tiết thao tác',
      ]);
      sheet.appendRow([
        p.timestamp || new Date().toLocaleString('vi-VN'),
        p.teacherName || 'Cô Diệu Hiền',
        p.action || '',
        p.targetTitle || '',
        p.details || '',
      ]);
      return createJsonResponse({ success: true, message: 'Đã lưu log giáo viên' });
    }

    // 3. Tải tệp lên Google Drive và lưu vào mục Học liệu
    if (data.action === 'UPLOAD_FILE') {
      const folder = getOrCreateFolder(FOLDER_NAME);
      const decodedBytes = Utilities.base64Decode(data.fileData);
      const blob = Utilities.newBlob(decodedBytes, data.mimeType || 'application/octet-stream', data.fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileUrl = file.getUrl();
      const fileId = file.getId();

      // Lưu vào sheet Học liệu
      const sheet = getOrCreateSheet(ss, TAB_MATERIALS, [
        'ID',
        'Tiêu đề học liệu',
        'Nhóm hoạt động',
        'Định dạng',
        'Đường link (Google Drive/Web)',
        'Mô tả',
        'Ví dụ sản phẩm',
        'Tác giả',
        'Ngày tạo',
      ]);
      const materialId = 'mat-' + new Date().getTime();
      sheet.appendRow([
        materialId,
        data.title || data.fileName,
        data.groupName || 'Vận động',
        detectTypeFromName(data.fileName),
        fileUrl,
        data.description || 'Tài liệu tải lên từ giáo viên',
        data.studentProductExample || 'Sản phẩm học tập',
        'Cô Diệu Hiền',
        new Date().toISOString().slice(0, 10),
      ]);

      // Ghi log giáo viên
      const teacherSheet = getOrCreateSheet(ss, TAB_TEACHER, [
        'Thời gian',
        'Tên giáo viên',
        'Hành động',
        'Học liệu / Đối tượng',
        'Chi tiết thao tác',
      ]);
      teacherSheet.appendRow([
        new Date().toLocaleString('vi-VN'),
        'Cô Diệu Hiền',
        'TẢI TỆP LÊN GOOGLE DRIVE',
        data.title || data.fileName,
        'File ID: ' + fileId + ' | Link: ' + fileUrl,
      ]);

      return createJsonResponse({
        success: true,
        fileUrl: fileUrl,
        fileId: fileId,
        materialId: materialId,
      });
    }

    // 4. Lưu học liệu mới hoặc cập nhật
    if (data.action === 'SAVE_MATERIAL') {
      const p = data.payload || {};
      const sheet = getOrCreateSheet(ss, TAB_MATERIALS, [
        'ID',
        'Tiêu đề học liệu',
        'Nhóm hoạt động',
        'Định dạng',
        'Đường link (Google Drive/Web)',
        'Mô tả',
        'Ví dụ sản phẩm',
        'Tác giả',
        'Ngày tạo',
      ]);
      sheet.appendRow([
        p.id || 'mat-' + new Date().getTime(),
        p.title || '',
        p.groupName || '',
        p.type || 'link',
        p.url || '',
        p.description || '',
        p.studentProductExample || '',
        p.author || 'Cô Diệu Hiền',
        p.createdAt || new Date().toISOString().slice(0, 10),
      ]);
      return createJsonResponse({ success: true, message: 'Đã lưu học liệu vào Sheet' });
    }

    return createJsonResponse({ success: false, message: 'Hành động không hợp lệ' });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function doGet(e) {
  try {
    const action = e.parameter ? e.parameter.action : '';
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'GET_MATERIALS') {
      const sheet = ss.getSheetByName(TAB_MATERIALS);
      if (!sheet) {
        return createJsonResponse({ materials: [] });
      }
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return createJsonResponse({ materials: [] });
      }
      const materials = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0] && !row[1]) continue;
        materials.push({
          id: String(row[0] || 'mat-' + i),
          title: String(row[1] || ''),
          groupName: String(row[2] || 'Vận động'),
          groupId: convertGroupNameToId(String(row[2])),
          type: String(row[3] || 'link'),
          url: String(row[4] || ''),
          description: String(row[5] || ''),
          studentProductExample: String(row[6] || ''),
          author: String(row[7] || 'Cô Diệu Hiền'),
          createdAt: String(row[8] || ''),
        });
      }
      return createJsonResponse({ materials: materials });
    }

    return createJsonResponse({
      status: 'active',
      name: 'Google Apps Script API - Thư viện Hỗ trợ Tái tập trung',
      author: 'Cô Diệu Hiền',
    });
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E6F4EA');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  const folder = DriveApp.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function detectTypeFromName(fileName) {
  const lower = (fileName || '').toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.avi')) return 'video';
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'powerpoint';
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'word';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif')) return 'image';
  return 'link';
}

function convertGroupNameToId(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('vận động')) return 'van-dong';
  if (n.includes('quan sát')) return 'quan-sat';
  if (n.includes('ghi nhớ')) return 'ghi-nho';
  if (n.includes('phản xạ')) return 'phan-xa';
  if (n.includes('tương tác')) return 'tuong-tac';
  if (n.includes('thư giãn')) return 'thu-gian';
  return 'van-dong';
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
