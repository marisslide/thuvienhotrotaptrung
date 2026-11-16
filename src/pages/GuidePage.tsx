import { ArrowRight, CheckCircle2, HelpCircle, MonitorPlay, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../components/SafeImage';
import { GROUP_MAP, STUDENT_EXPRESSIONS } from '../data/taxonomy';

const PRINCIPLES = [
  {
    title: '01. Không gắn nhãn hay phê bình học sinh',
    body: 'Giáo viên sử dụng các biểu hiện như tín hiệu để điều chỉnh nhịp tiết học, tuyệt đối không gọi tên chỉ trích hoặc kết luận học sinh “mất tập trung”.',
  },
  {
    title: '02. Thời lượng ngắn gọn, dứt khoát 2–5 phút',
    body: 'Hoạt động chỉ đóng vai trò điểm chuyển tiếp năng lượng. Hãy sử dụng đồng hồ đếm ngược để quay lại mạch kiến thức đúng giờ.',
  },
  {
    title: '03. Không cần học sinh dùng thiết bị cá nhân',
    body: 'Toàn bộ hoạt động tổ chức trực tiếp bằng lời nói, bảng lớp hoặc màn hình trình chiếu chung của giáo viên.',
  },
  {
    title: '04. Luôn chốt bằng câu chuyển tiếp quay lại bài học',
    body: 'Ngay khi kết thúc hoạt động, giáo viên dùng câu dẫn gợi ý để gắn sự tỉnh táo vừa tạo được vào nhiệm vụ học tập kế tiếp.',
  },
];

const FAQS = [
  {
    q: 'Học sinh và phụ huynh có cần đăng nhập để xem thư viện không?',
    a: 'Không. Toàn bộ kho hoạt động đang hiển thị đều công khai để giáo viên, học sinh, phụ huynh và khách tham quan xem trực tiếp không cần tài khoản.',
  },
  {
    q: 'Website có lưu thông tin theo dõi từng học sinh hay chấm điểm không?',
    a: 'Không. Đây hoàn toàn là thư viện học liệu và gợi ý hoạt động lớp học dành cho giáo viên THCS, không chấm điểm, không lưu hồ sơ tâm lý và không phân tích hành vi cá nhân.',
  },
  {
    q: 'Khi nào giáo viên nên bật Chế độ trình chiếu lớp học?',
    a: 'Trong trang Chi tiết hoạt động, thầy cô bấm “Trình chiếu lớp học” để hiển thị chữ cỡ lớn rõ nét từ cuối phòng cùng đồng hồ đếm ngược tích hợp ngay trên bảng tương tác hoặc máy chiếu.',
  },
  {
    q: 'Giáo viên muốn đóng góp hoặc chỉnh sửa hoạt động thì làm thế nào?',
    a: 'Thầy cô truy cập mục “Giáo viên” ở góc phải trên cùng, đăng nhập bằng tài khoản Google. Nếu chưa có quyền biên tập, thầy cô có thể gửi yêu cầu cấp quyền ngay trong trang đăng nhập.',
  },
];

export function GuidePage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 sm:py-12 space-y-14">
      {/* Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs font-semibold text-[#176B5B]">Cẩm nang thực hành tại lớp THCS</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#263B3A] leading-tight">
            Hướng dẫn sử dụng thư viện trong tiết học 45 phút
          </h1>
          <p className="text-base text-[#526867] leading-relaxed max-w-2xl">
            Quy trình 3 bước gọn nhẹ giúp thầy cô linh hoạt điều chỉnh nhịp lớp học THCS khi nhận
            thấy học sinh mệt mỏi, xao nhãng hoặc trầm lắng, mà không làm đứt mạch bài giảng.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/nhan-dien"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#176B5B] text-white text-sm font-semibold hover:bg-[#125649] transition-colors"
            >
              Thử chọn theo biểu hiện <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/hoat-dong"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#DCE6E3] text-[#263B3A] text-sm font-semibold hover:bg-[#F6F9F8] transition-colors"
            >
              Mở kho hoạt động
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl overflow-hidden border border-[#DCE6E3] bg-white shadow-xs aspect-[4/3]">
            <SafeImage
              src="/src/assets/images/guide_teacher_facilitation_1794556734139.jpg"
              alt="Giáo viên THCS trình chiếu hoạt động ngắn trên màn hình lớp học"
              fallbackTitle="Điều phối hoạt động ngắn tại lớp học THCS"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4 Core Principles */}
      <section>
        <h2 className="text-2xl font-bold text-[#263B3A] mb-6">
          Nguyên tắc điều phối thân thiện & chuyên nghiệp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PRINCIPLES.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-[#DCE6E3] p-6 space-y-2"
            >
              <h3 className="text-base font-bold text-[#176B5B]">{item.title}</h3>
              <p className="text-sm text-[#526867] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mapping Matrix */}
      <section className="bg-white rounded-3xl border border-[#DCE6E3] p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#263B3A] mb-2">
            Bảng gợi ý đối chiếu nhanh trên lớp
          </h2>
          <p className="text-sm text-[#526867]">
            Tham khảo nhanh nhóm hoạt động phù hợp với từng biểu hiện thường gặp ở học sinh THCS.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DCE6E3] text-[#526867]">
                <th className="py-3 pr-4 font-semibold">Biểu hiện quan sát thấy</th>
                <th className="py-3 px-4 font-semibold">Nhóm ưu tiên</th>
                <th className="py-3 pl-4 font-semibold">Mẹo chuyển tiếp nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6E3]">
              {STUDENT_EXPRESSIONS.map((exp) => (
                <tr key={exp.id} className="align-top">
                  <td className="py-4 pr-4 font-semibold text-[#263B3A] whitespace-nowrap">
                    <Link
                      to={`/hoat-dong?bieuHien=${exp.id}`}
                      className="hover:text-[#176B5B] hover:underline"
                    >
                      {exp.order}. {exp.label}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-[#176B5B] font-medium">
                    {exp.recommendedGroups
                      .map((gId) => GROUP_MAP[gId]?.shortTitle)
                      .filter(Boolean)
                      .join(' · ')}
                  </td>
                  <td className="py-4 pl-4 text-[#526867] leading-relaxed">
                    {exp.facilitationTip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Projector & Scope */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#DDF3EA] border border-[#B8E2D1] p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#176B5B]">
            <MonitorPlay className="w-5 h-5" />
            Trình chiếu màn hình lớp học
          </div>
          <h3 className="text-lg font-bold text-[#263B3A]">
            Tối ưu cho máy chiếu và bảng tương tác
          </h3>
          <ul className="space-y-2 text-sm text-[#263B3A]/85">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
              <span>Chữ kích thước lớn, tương phản cao giúp học sinh cuối lớp đọc rõ từng bước.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#176B5B] shrink-0 mt-0.5" />
              <span>Đồng hồ đếm ngược ngay trong màn hình chiếu, có nút +30 giây và chuông báo nhẹ.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-[#DCE6E3] p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#7563B8]">
            <ShieldCheck className="w-5 h-5" />
            Ranh giới sư phạm
          </div>
          <h3 className="text-lg font-bold text-[#263B3A]">
            Cam kết an toàn và tôn trọng học sinh
          </h3>
          <ul className="space-y-2 text-sm text-[#526867]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7563B8] shrink-0 mt-0.5" />
              <span>Không sử dụng camera, không đo đạc tự động hay phân tích tâm lý học sinh.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7563B8] shrink-0 mt-0.5" />
              <span>Không quản lý điểm số; mọi hoạt động mang tính khích lệ tinh thần tự nguyện.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="w-5 h-5 text-[#176B5B]" />
          <h2 className="text-2xl font-bold text-[#263B3A]">Câu hỏi thường gặp</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FAQS.map((item) => (
            <div key={item.q} className="bg-white rounded-2xl border border-[#DCE6E3] p-6">
              <h3 className="text-base font-bold text-[#263B3A] mb-2">{item.q}</h3>
              <p className="text-sm text-[#526867] leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
