/**
 * HỆ THỐNG ĐỒNG BỘ GOOGLE SHEET & GOOGLE DRIVE
 * THƯ VIỆN HOẠT ĐỘNG HỖ TRỢ TÁI TẬP TRUNG
 * Tác giả: Cô Diệu Hiền
 *
 * CÁC TAB TỰ ĐỘNG TẠO:
 * 1. DanhSach_HocVien: Danh sách học sinh và tổng thời lượng truy cập app
 * 2. HocSinh_LichSu: Nhật ký chi tiết từng thao tác học tập của học sinh
 * 3. GiaoVien_LichSu: Nhật ký các thao tác của giáo viên quản trị
 * 4. HocLieu: Danh mục học liệu (Video, Slide, Word, PDF...)
 */

const FOLDER_NAME = 'HocLieu_TaiTapTrung';
const TAB_STUDENT_LIST = 'DanhSach_HocVien';
const TAB_STUDENT_LOGS = 'HocSinh_LichSu';
const TAB_TEACHER_LOGS = 'GiaoVien_LichSu';
const TAB_MATERIALS = 'HocLieu';

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : '';
    const data = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Cập nhật Sheet "DanhSach_HocVien" (Lưu thông tin học sinh & thời lượng sử dụng app)
    if (data.action === 'SYNC_STUDENT_SESSION') {
      const p = data.payload || {};
      const sheet = getOrCreateSheet(ss, TAB_STUDENT_LIST, [
        'Mã học viên',
        'Họ và tên học sinh',
        'Lớp',
        'Trường THCS',
        'Thời điểm bắt đầu',
        'Lần truy cập gần nhất',
        'Số lần truy cập',
        'Tổng thời lượng (phút)',
        'Trạng thái phiên',
      ]);

      const studentKey = (p.studentId || (p.fullName + '_' + p.className)).trim().toLowerCase();
      const dataRange = sheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < dataRange.length; i++) {
        const rowId = String(dataRange[i][0] || '').trim().toLowerCase();
        const rowNameClass = (String(dataRange[i][1] || '') + '_' + String(dataRange[i][2] || '')).trim().toLowerCase();
        if (rowId === studentKey || rowNameClass === studentKey) {
          rowIndex = i + 1;
          break;
        }
      }

      const nowStr = p.timestamp || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const addedMinutes = Number(p.durationMinutes || 0);

      if (rowIndex === -1) {
        // Thêm học viên mới
        const initMinutes = addedMinutes > 0 ? addedMinutes : 1;
        sheet.appendRow([
          p.studentId || 'HS-' + new Date().getTime(),
          p.fullName || '',
          p.className || '',
          p.schoolName || '',
          nowStr,
          nowStr,
          1,
          Number(initMinutes.toFixed(1)),
          p.status || 'Đang học tập',
        ]);
      } else {
        // Cập nhật học viên đã có
        const currentVisits = Number(sheet.getRange(rowIndex, 7).getValue() || 1);
        const currentDuration = Number(sheet.getRange(rowIndex, 8).getValue() || 0);
        const newVisits = p.isNewSession ? currentVisits + 1 : currentVisits;
        const newDuration = Number((currentDuration + addedMinutes).toFixed(1));

        sheet.getRange(rowIndex, 6).setValue(nowStr);
        sheet.getRange(rowIndex, 7).setValue(newVisits);
        sheet.getRange(rowIndex, 8).setValue(newDuration);
        sheet.getRange(rowIndex, 9).setValue(p.status || 'Đang học tập');
      }

      return createJsonResponse({ success: true, message: 'Đã cập nhật DanhSach_HocVien' });
    }

    // 2. Ghi lịch sử hoạt động chi tiết của Học sinh
    if (data.action === 'LOG_STUDENT') {
      const p = data.payload || {};
      const sheet = getOrCreateSheet(ss, TAB_STUDENT_LOGS, [
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

      // Tự động đảm bảo học sinh cũng có mặt trong DanhSach_HocVien
      syncStudentToDirectory(ss, p);

      return createJsonResponse({ success: true, message: 'Đã lưu log học sinh' });
    }

    // 3. Ghi lịch sử hoạt động của Giáo viên
    if (data.action === 'LOG_TEACHER') {
      const p = data.payload || {};
      const sheet = getOrCreateSheet(ss, TAB_TEACHER_LOGS, [
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

    // 4. Tải tệp lên Google Drive và lưu vào mục Học liệu
    if (data.action === 'UPLOAD_FILE') {
      const folder = getOrCreateFolder(FOLDER_NAME);
      const decodedBytes = Utilities.base64Decode(data.fileData);
      const blob = Utilities.newBlob(decodedBytes, data.mimeType || 'application/octet-stream', data.fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileUrl = file.getUrl();
      const fileId = file.getId();

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

      const teacherSheet = getOrCreateSheet(ss, TAB_TEACHER_LOGS, [
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

    // 5. Lưu học liệu mới hoặc cập nhật
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

    // Lấy danh sách học viên và thời lượng
    if (action === 'GET_STUDENTS') {
      const sheet = ss.getSheetByName(TAB_STUDENT_LIST);
      if (!sheet) return createJsonResponse({ students: [] });
      const data = sheet.getDataRange().getValues();
      const students = [];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[1]) continue;
        students.push({
          studentId: row[0],
          fullName: row[1],
          className: row[2],
          schoolName: row[3],
          startTime: row[4],
          lastActiveTime: row[5],
          visitCount: row[6],
          durationMinutes: row[7],
          status: row[8],
        });
      }
      return createJsonResponse({ students: students });
    }

    if (action === 'GET_MATERIALS') {
      const sheet = ss.getSheetByName(TAB_MATERIALS);
      if (!sheet) return createJsonResponse({ materials: [] });
      const data = sheet.getDataRange().getValues();
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

function syncStudentToDirectory(ss, p) {
  if (!p.fullName) return;
  const sheet = getOrCreateSheet(ss, TAB_STUDENT_LIST, [
    'Mã học viên',
    'Họ và tên học sinh',
    'Lớp',
    'Trường THCS',
    'Thời điểm bắt đầu',
    'Lần truy cập gần nhất',
    'Số lần truy cập',
    'Tổng thời lượng (phút)',
    'Trạng thái phiên',
  ]);

  const key = (p.fullName + '_' + p.className).trim().toLowerCase();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowKey = (String(data[i][1]) + '_' + String(data[i][2])).trim().toLowerCase();
    if (rowKey === key) {
      sheet.getRange(i + 1, 6).setValue(p.timestamp || new Date().toLocaleString('vi-VN'));
      return;
    }
  }

  // Thêm mới nếu chưa có
  sheet.appendRow([
    p.studentId || 'HS-' + new Date().getTime(),
    p.fullName,
    p.className || '',
    p.schoolName || '',
    p.timestamp || new Date().toLocaleString('vi-VN'),
    p.timestamp || new Date().toLocaleString('vi-VN'),
    1,
    1,
    'Đang học tập',
  ]);
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
