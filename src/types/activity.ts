export type ActivityGroupId =
  | 'van-dong'
  | 'quan-sat'
  | 'ghi-nho'
  | 'phan-xa'
  | 'tuong-tac'
  | 'thu-gian';

export type ExpressionId =
  | 'met-moi'
  | 'nhin-ra-ngoai'
  | 'noi-chuyen-rieng'
  | 'phan-hoi-cham'
  | 'it-tham-gia'
  | 'kho-duy-tri';

export type ActivityScale =
  | 'Cả lớp'
  | 'Theo nhóm'
  | 'Theo cặp'
  | 'Cá nhân tại chỗ';

export type ActivityTiming =
  | 'Đầu tiết'
  | 'Giữa tiết'
  | 'Chuyển tiếp nhiệm vụ'
  | 'Cuối tiết'
  | 'Linh hoạt';

export type ActivityStatus = 'published' | 'hidden';

export interface Activity {
  id: string;
  title: string;
  slug: string;
  group: ActivityGroupId;
  expressions: ExpressionId[];
  durationMinutes: number;
  scale: ActivityScale;
  materials: string;
  noMaterialsNeeded: boolean;
  shortDescription: string;
  goal: string;
  steps: string[];
  transitionBackTip: string;
  teacherNotes: string;
  suitableTiming: ActivityTiming;
  gradeRange: string;
  status: ActivityStatus;
  authorId: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivityInput = Omit<Activity, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>;

export interface ActivityGroupMeta {
  id: ActivityGroupId;
  order: string;
  name: string;
  shortTitle: string;
  tagline: string;
  description: string;
  pedagogicalPurpose: string;
  bestTiming: string;
  classroomArrangement: string;
  recommendedFor: ExpressionId[];
  accentColor: string;
  softBg: string;
  borderColor: string;
}

export interface ExpressionMeta {
  id: ExpressionId;
  order: string;
  label: string;
  classroomCues: string[];
  contextNote: string;
  recommendedGroups: ActivityGroupId[];
  facilitationTip: string;
}

export interface TeacherProfile {
  uid: string;
  displayName: string;
  role: 'teacher' | 'admin';
  addedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherAccessRequest {
  uid: string;
  displayName: string;
  schoolName: string;
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}
