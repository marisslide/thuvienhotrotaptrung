export type MaterialType = 'video' | 'powerpoint' | 'word' | 'pdf' | 'image' | 'canva' | 'link';

export type ActivityGroupId =
  | 'van-dong'
  | 'quan-sat'
  | 'ghi-nho'
  | 'phan-xa'
  | 'tuong-tac'
  | 'thu-gian';

export interface MaterialItem {
  id: string;
  title: string;
  groupId: ActivityGroupId;
  groupName: string;
  type: MaterialType;
  url: string;
  description: string;
  studentProductExample?: string;
  thumbnailUrl?: string;
  driveFileId?: string;
  author: string;
  createdAt: string;
  fileSize?: string;
  isPriority?: boolean;
}

export interface StudentProfile {
  fullName: string;
  className: string;
  schoolName: string;
  registeredAt: string;
}

export interface TeacherSession {
  username: string;
  displayName: string;
  role: 'admin' | 'teacher';
  loggedInAt: string;
}
