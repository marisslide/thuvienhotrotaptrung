import { ActivityGroupId, ActivityGroupMeta, ExpressionId, ExpressionMeta } from '../types/activity';

export const ACTIVITY_GROUPS: ActivityGroupMeta[] = [
  {
    id: 'van-dong',
    order: '01',
    name: 'VẬN ĐỘNG',
    shortTitle: 'Vận động',
    tagline: 'Giải tỏa mệt mỏi thể chất, đánh thức nhịp sinh học tại chỗ',
    description:
      'Các động tác giãn cơ nhẹ nhàng, đổi tư thế hoặc vận động nhịp nhàng ngay tại bàn học giúp lưu thông khí huyết và làm mới năng lượng lớp học.',
    pedagogicalPurpose:
      'Giảm cảm giác uể oải sau thời gian ngồi nghe giảng liên tục, tạo điểm ngắt tự nhiên trước khi chuyển sang nhiệm vụ học tập mới.',
    bestTiming: 'Giữa tiết (phút 20–25) hoặc đầu tiết chiều',
    classroomArrangement: 'Tại chỗ bên bàn học hoặc đứng dậy nhẹ nhàng trong 2–3 phút',
    recommendedFor: ['met-moi', 'phan-hoi-cham', 'kho-duy-tri'],
    accentColor: '#176B5B',
    softBg: '#DDF3EA',
    borderColor: '#B8E2D1',
  },
  {
    id: 'quan-sat',
    order: '02',
    name: 'QUAN SÁT',
    shortTitle: 'Quan sát',
    tagline: 'Thu hút ánh nhìn trở lại bảng lớp và không gian học tập',
    description:
      'Những thử thách tìm điểm khác biệt, nhận diện chi tiết trực quan trên bảng hoặc trong phòng học để kéo sự chú ý về phía giáo viên một cách nhẹ nhàng.',
    pedagogicalPurpose:
      'Giúp học sinh đang nhìn ra ngoài hoặc xao nhãng hướng mắt trở lại vùng trình chiếu/bảng mà không cần nhắc nhở gắt gao.',
    bestTiming: 'Trước khi giảng phần trọng tâm hoặc khi lớp bắt đầu xao nhãng',
    classroomArrangement: 'Cả lớp cùng nhìn lên bảng, màn hình chiếu hoặc quan sát xung quanh',
    recommendedFor: ['nhin-ra-ngoai', 'noi-chuyen-rieng'],
    accentColor: '#7563B8',
    softBg: '#EFECFB',
    borderColor: '#D6CEEF',
  },
  {
    id: 'ghi-nho',
    order: '03',
    name: 'GHI NHỚ',
    shortTitle: 'Ghi nhớ',
    tagline: 'Kích hoạt trí nhớ làm việc qua chuỗi từ khóa và hình ảnh ngắn',
    description:
      'Các trò chơi ghi nhớ nhanh 5–7 từ khóa, con số hoặc chuỗi thao tác trong 30–60 giây để khởi động lại khả năng xử lý thông tin.',
    pedagogicalPurpose:
      'Rèn nhịp tập trung ngắn hạn, hỗ trợ học sinh khó duy trì nhiệm vụ quay lại trạng thái tiếp nhận kiến thức có cấu trúc.',
    bestTiming: 'Đầu tiết ôn bài cũ hoặc chuyển tiếp giữa hai nội dung kiến thức',
    classroomArrangement: 'Cá nhân tại chỗ hoặc thi đua nhanh theo dãy bàn',
    recommendedFor: ['kho-duy-tri', 'phan-hoi-cham', 'nhin-ra-ngoai'],
    accentColor: '#176B5B',
    softBg: '#DDF3EA',
    borderColor: '#B8E2D1',
  },
  {
    id: 'phan-xa',
    order: '04',
    name: 'PHẢN XẠ',
    shortTitle: 'Phản xạ',
    tagline: 'Tăng tốc độ đáp ứng qua tín hiệu âm thanh và cử chỉ tức thì',
    description:
      'Các hoạt động vỗ tay theo mật mã, làm theo hiệu lệnh ngược hoặc phản ứng theo từ khóa giúp cả lớp bắt nhịp đồng bộ ngay lập tức.',
    pedagogicalPurpose:
      'Tạo sự tỉnh táo tức thì khi lớp có biểu hiện phản hồi chậm, nói chuyện riêng hoặc chưa sẵn sàng vào phần luyện tập.',
    bestTiming: 'Ngay khi cần ổn định trật tự hoặc chuyển sang phần hỏi – đáp',
    classroomArrangement: 'Cả lớp cùng thực hiện đồng thanh hoặc theo cử chỉ tay tại bàn',
    recommendedFor: ['phan-hoi-cham', 'noi-chuyen-rieng', 'met-moi'],
    accentColor: '#B87414',
    softBg: '#FDF3E1',
    borderColor: '#F3D69F',
  },
  {
    id: 'tuong-tac',
    order: '05',
    name: 'TƯƠNG TÁC',
    shortTitle: 'Tương tác',
    tagline: 'Kết nối bạn cùng bàn và mở lời cho học sinh ít tham gia',
    description:
      'Những lượt trao đổi 60 giây theo cặp, chuyền tín hiệu nhóm nhỏ hoặc bình chọn bằng giơ tay an toàn giúp mọi học sinh đều có vai trò.',
    pedagogicalPurpose:
      'Tạo bầu không khí cởi mở, kéo học sinh trầm lặng hoặc ít tham gia vào dòng chảy chung mà không gây áp lực bị gọi đột ngột.',
    bestTiming: 'Trước hoạt động thảo luận nhóm hoặc khi lớp học quá trầm lắng',
    classroomArrangement: 'Theo cặp bạn cùng bàn hoặc nhóm 4 học sinh quay mặt vào nhau',
    recommendedFor: ['it-tham-gia', 'kho-duy-tri', 'met-moi'],
    accentColor: '#7563B8',
    softBg: '#EFECFB',
    borderColor: '#D6CEEF',
  },
  {
    id: 'thu-gian',
    order: '06',
    name: 'THƯ GIÃN',
    shortTitle: 'Thư giãn',
    tagline: 'Điều hòa nhịp thở và lắng dịu lớp học sau hoạt động sôi nổi',
    description:
      'Các bài tập hít thở có nhịp đếm, thả lỏng vai gáy và nhắm mắt nghỉ 60 giây giúp giảm ồn ào, đưa lớp về trạng thái tĩnh tâm.',
    pedagogicalPurpose:
      'Ổn định lại nhịp lớp sau giờ ra chơi, sau bài kiểm tra ngắn hoặc khi học sinh nói chuyện riêng quá mức cần hạ nhiệt.',
    bestTiming: 'Sau giờ ra chơi, sau hoạt động nhóm sôi nổi hoặc trước khi làm bài viết',
    classroomArrangement: 'Ngồi ngay ngắn tại bàn học, không cần di chuyển hay dùng thiết bị',
    recommendedFor: ['noi-chuyen-rieng', 'met-moi', 'kho-duy-tri'],
    accentColor: '#176B5B',
    softBg: '#DDF3EA',
    borderColor: '#B8E2D1',
  },
];

export const STUDENT_EXPRESSIONS: ExpressionMeta[] = [
  {
    id: 'met-moi',
    order: '01',
    label: 'Mệt mỏi, uể oải',
    classroomCues: [
      'Gục đầu lên bàn, chống cằm lâu hoặc ngáp liên tục',
      'Tư thế ngồi chùng xuống, ánh mắt lờ đờ vào tiết 4–5 hoặc đầu buổi chiều',
      'Động tác ghi chép chậm dần, thiếu sức sống khi chuyển hoạt động',
    ],
    contextNote:
      'Thường xuất hiện sau nhiều tiết học liên tiếp hoặc vào khung giờ sau ăn trưa. Lớp cần một nhịp đổi trạng thái nhẹ về thể chất hoặc hô hấp.',
    recommendedGroups: ['van-dong', 'phan-xa', 'thu-gian'],
    facilitationTip:
      'Ưu tiên cho học sinh đứng lên giãn vai hoặc vỗ tay đổi nhịp trong 2 phút, sau đó giao ngay một câu hỏi khởi động ngắn.',
  },
  {
    id: 'nhin-ra-ngoai',
    order: '02',
    label: 'Nhìn ra ngoài, ít theo dõi',
    classroomCues: [
      'Hướng mắt ra cửa sổ, hành lang hoặc nhìn xuống ngăn bàn kéo dài',
      'Không xoay người theo bảng hoặc màn hình khi giáo viên chuyển nội dung',
      'Bỏ lỡ yêu cầu mở trang sách hoặc câu hỏi vừa nêu',
    ],
    contextNote:
      'Nhịp giảng đơn điệu dễ khiến ánh nhìn rời khỏi trung tâm lớp học. Cần tín hiệu trực quan mới mẻ trên bảng để thu hút lại sự chú ý.',
    recommendedGroups: ['quan-sat', 'ghi-nho'],
    facilitationTip:
      'Đưa một chi tiết trực quan bất ngờ lên bảng trong 60 giây để học sinh tự nguyện hướng mắt về phía trước.',
  },
  {
    id: 'noi-chuyen-rieng',
    order: '03',
    label: 'Nói chuyện riêng, dễ phân tán',
    classroomCues: [
      'Quay sang trao đổi việc ngoài bài học với bạn bên cạnh hoặc bàn dưới',
      'Cười đùa nhỏ, nghịch đồ dùng học tập khi giáo viên đang hướng dẫn',
      'Khó giữ im lặng khi chuyển từ thảo luận sang nghe giảng',
    ],
    contextNote:
      'Thay vì nhắc nhở kéo dài làm gián đoạn mạch tiết học, giáo viên có thể dùng mật mã phản xạ đồng thanh hoặc bài tập lắng dịu nhịp thở.',
    recommendedGroups: ['phan-xa', 'thu-gian', 'quan-sat'],
    facilitationTip:
      'Dùng hiệu lệnh vỗ tay bắt nhịp đồng bộ hoặc 60 giây tĩnh lặng theo nhịp đếm để cả lớp cùng hạ âm lượng tự nhiên.',
  },
  {
    id: 'phan-hoi-cham',
    order: '04',
    label: 'Phản hồi chậm',
    classroomCues: [
      'Khi giáo viên đặt câu hỏi, cả lớp im lặng lâu hoặc trả lời rời rạc',
      'Học sinh chần chừ khi bắt đầu thao tác mở vở, làm bài tập mẫu',
      'Nhịp tương tác hỏi – đáp diễn ra chậm hơn bình thường',
    ],
    contextNote:
      'Trạng thái "chưa vào guồng" thường gặp đầu tiết hoặc khi nội dung bài học mang tính trừu tượng cao.',
    recommendedGroups: ['phan-xa', 'van-dong', 'ghi-nho'],
    facilitationTip:
      'Khởi động bằng hoạt động phản xạ nhanh không chấm điểm (đúng – sai bằng giơ tay) để học sinh dạn dĩ bật phản hồi trở lại.',
  },
  {
    id: 'it-tham-gia',
    order: '05',
    label: 'Ít tham gia',
    classroomCues: [
      'Chỉ vài học sinh quen thuộc giơ tay, phần lớn lớp ngồi im quan sát',
      'Ngại phát biểu trước cả lớp hoặc né tránh ánh nhìn khi giáo viên gọi tên',
      'Ít tương tác trong phần xây dựng bài mới',
    ],
    contextNote:
      'Học sinh THCS thường e ngại nói sai trước tập thể. Hoạt động theo cặp hoặc biểu quyết không lời giúp giảm áp lực tâm lý.',
    recommendedGroups: ['tuong-tac', 'phan-xa'],
    facilitationTip:
      'Tạo cơ hội nói thử 30 giây với bạn cùng bàn trước khi chia sẻ trước lớp để học sinh tự tin hơn.',
  },
  {
    id: 'kho-duy-tri',
    order: '06',
    label: 'Khó duy trì nhiệm vụ',
    classroomCues: [
      'Làm bài được 2–3 phút rồi dừng lại, bỏ dở giữa chừng',
      'Thường xuyên hỏi lại yêu cầu nhiệm vụ dù giáo viên vừa hướng dẫn',
      'Nhanh chán khi bài tập kéo dài trên 10 phút liên tục',
    ],
    contextNote:
      'Chia nhỏ nhiệm vụ học tập kèm một hoạt động chuyển tiếp 2–3 phút giúp học sinh lấy lại đà hoàn thành phần việc tiếp theo.',
    recommendedGroups: ['ghi-nho', 'tuong-tac', 'van-dong'],
    facilitationTip:
      'Chốt mỗi hoạt động tái tập trung bằng một bước chuyển cụ thể: "Bây giờ chúng ta dành 5 phút hoàn thành nốt câu số 2".',
  },
];

export const GROUP_MAP: Record<ActivityGroupId, ActivityGroupMeta> = ACTIVITY_GROUPS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ActivityGroupId, ActivityGroupMeta>
);

export const EXPRESSION_MAP: Record<ExpressionId, ExpressionMeta> = STUDENT_EXPRESSIONS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ExpressionId, ExpressionMeta>
);
