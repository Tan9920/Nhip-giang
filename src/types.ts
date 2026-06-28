/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 6 nhãn Trạng thái dữ liệu bắt buộc (Data Status)
export enum DataStatus {
  SEED = 'seed',
  SCAFFOLD = 'scaffold',
  COMMUNITY = 'community',
  REVIEWED = 'reviewed',
  VERIFIED = 'verified',
  APPROVED_FOR_RELEASE = 'approved_for_release',
}

export const DataStatusLabels: Record<DataStatus, { label: string; color: string; desc: string }> = {
  [DataStatus.SEED]: {
    label: 'Mẫu chuẩn Bộ GD&ĐT',
    color: 'bg-blue-50 text-blue-700 border-blue-200/60',
    desc: 'Dữ liệu mẫu chuẩn từ Bộ Giáo dục và Đào tạo',
  },
  [DataStatus.SCAFFOLD]: {
    label: 'Khung bài soạn',
    color: 'bg-purple-50 text-purple-700 border-purple-200/60',
    desc: 'Khung giáo án được chuẩn bị sẵn theo chủ đề Công văn 5512',
  },
  [DataStatus.COMMUNITY]: {
    label: 'Cộng đồng chia sẻ',
    color: 'bg-amber-50 text-amber-700 border-amber-200/60',
    desc: 'Bài soạn tham khảo do giáo viên cộng đồng đóng góp',
  },
  [DataStatus.REVIEWED]: {
    label: 'Tổ chuyên môn duyệt',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    desc: 'Đã được thông qua bởi tổ chuyên môn bộ môn của trường',
  },
  [DataStatus.VERIFIED]: {
    label: 'Đã kiểm định',
    color: 'bg-teal-50 text-teal-700 border-teal-200/60',
    desc: 'Đã được rà soát và xác nhận tính tương thích quy định sư phạm',
  },
  [DataStatus.APPROVED_FOR_RELEASE]: {
    label: 'Chính thức phát hành',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    desc: 'Đã phê duyệt ban hành chính thức cho nhà trường giảng dạy',
  },
};

// Loại bài dạy (Lesson Classification)
export enum LessonClassification {
  OFFICIAL_LESSON = 'official_lesson',
  TOPIC_STRAND = 'topic_strand',
  REVIEW_LESSON = 'review_lesson',
  SUPPLEMENTARY_ACTIVITY = 'supplementary_activity',
  TEACHER_INPUT = 'teacher_input',
  LEGACY_REFERENCE = 'legacy_reference',
  UNMAPPED = 'unmapped',
}

export const LessonClassificationLabels: Record<LessonClassification, string> = {
  [LessonClassification.OFFICIAL_LESSON]: 'Bài học chính thức',
  [LessonClassification.TOPIC_STRAND]: 'Chuyên đề học tập',
  [LessonClassification.REVIEW_LESSON]: 'Bài ôn tập / Tổng kết',
  [LessonClassification.SUPPLEMENTARY_ACTIVITY]: 'Hoạt động bổ trợ',
  [LessonClassification.TEACHER_INPUT]: 'Dữ liệu giáo viên tự soạn',
  [LessonClassification.LEGACY_REFERENCE]: 'Tư liệu tham khảo cũ',
  [LessonClassification.UNMAPPED]: 'Chưa phân loại',
};

// Cấu trúc 4 Hoạt động trong Tiến trình dạy học (Phần V)
export interface ProgressionActivity {
  target: string;      // Mục tiêu
  content: string;     // Nội dung
  product: string;     // Sản phẩm
  execution: {         // Tổ chức thực hiện (4 bước bắt buộc)
    transfer: string;  // Chuyển giao nhiệm vụ
    perform: string;   // Thực hiện nhiệm vụ
    report: string;    // Báo cáo, thảo luận
    conclude: string;  // Kết luận, nhận định
  };
}

// 6 tham số ngữ cảnh sư phạm thực tế (Batch 03)
export interface PedagogicalContext {
  classSize: string;      // Ít / trung bình / đông
  studentLevel: string;   // Cần hỗ trợ / chuẩn / khá / nâng cao
  equipment: string;      // Không thiết bị / máy chiếu / điện thoại / phòng bộ môn
  classroomSpace: string; // Phòng cố định / linh hoạt / ngoài lớp
  durationMin: string;    // 35 phút / 40 phút / 45 phút / 90 phút
  coreObjective: string;  // Bài mới / luyện tập / ôn tập / dự án / bổ trợ
}

// Nhật ký phiên bản (Version Control - Batch 03)
export interface LessonVersion {
  v: number;
  content: any; // Bản lưu snapshot đầy đủ của LessonPlan
  updatedAt: string;
}

// Cấu trúc Kế hoạch bài dạy (Giáo án) 8 phần chuẩn Việt Nam
export interface LessonPlan {
  id: string;
  ownerId: string; // Tuân thủ nguyên tắc Owner Isolation
  title: string;
  grade: string;
  subject: string; // Phải tuân thủ quy định thuật ngữ môn học: Bắt buộc dùng từ "Công nghệ"
  duration: string; // Thời lượng (ví dụ: "2 tiết")
  status: DataStatus;
  classification: LessonClassification;
  createdAt: string;
  updatedAt: string;

  // Trường bổ sung của Batch 03
  levelId?: string; // tieu_hoc | thcs | thpt
  topicName?: string; // Tên chủ đề/Mạch kiến thức
  context?: PedagogicalContext; // Ngữ cảnh sư phạm lớp học
  versions?: LessonVersion[]; // Mảng chứa các bản sao lưu phiên bản cũ

  // I. Thông tin chung
  part1: {
    className: string;
    subjectName: string; // Phải là "Công nghệ"
    lessonTitle: string;
    duration: string;
  };

  // II. Yêu cầu cần đạt
  part2: {
    knowledgeAndSkills: string; // Kiến thức/kĩ năng
    generalCapacity: string;    // Năng lực chung
    specificCapacity: string;   // Năng lực đặc thù
    qualities: string;          // Phẩm chất
    evaluationEvidence: string; // Minh chứng đánh giá
  };

  // III. Thiết bị dạy học và học liệu
  part3: {
    teacherEquipment: string;
    studentEquipment: string;
    sources: string;           // Yêu cầu nhập Nguồn (Source)
    copyrightLicense: string;  // Yêu cầu Bản quyền/License
  };

  // IV. Phương pháp và kĩ thuật dạy học
  part4: {
    methods: string;           // Phương pháp dạy học
    techniques: string;        // Kĩ thuật dạy học (Chỉ dùng từ này cho sư phạm, ko dùng thay tên môn học)
  };

  // V. Tiến trình dạy học
  part5: {
    warmup: ProgressionActivity;     // 1. Khởi động
    exploration: ProgressionActivity; // 2. Hình thành kiến thức mới
    practice: ProgressionActivity;    // 3. Luyện tập
    application: ProgressionActivity; // 4. Vận dụng
  };

  // VI. Kiểm tra, đánh giá
  part6: {
    diagnostic: string; // Đánh giá chẩn đoán / Thường xuyên
    formative: string;  // Đánh giá định kỳ
  };

  // VII. Phân hóa đối tượng học sinh
  part7: {
    remedial: string;   // Hỗ trợ học sinh yếu
    enrichment: string; // Phát triển học sinh khá giỏi
  };

  // VIII. Ghi chú / Điều chỉnh sau tiết dạy
  part8: {
    notes: string;
  };
}
