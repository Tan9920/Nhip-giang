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
    label: 'seed',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    desc: 'Dữ liệu mẫu khởi tạo bởi hệ thống',
  },
  [DataStatus.SCAFFOLD]: {
    label: 'scaffold',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    desc: 'Giáo án khung tạo tự động từ template engine',
  },
  [DataStatus.COMMUNITY]: {
    label: 'community',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    desc: 'Nội dung do cộng đồng giáo viên đóng góp',
  },
  [DataStatus.REVIEWED]: {
    label: 'reviewed',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    desc: 'Đã rà soát nội bộ hoặc bởi tổ bộ môn',
  },
  [DataStatus.VERIFIED]: {
    label: 'verified',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    desc: 'Đã xác minh tính tương thích kỹ thuật',
  },
  [DataStatus.APPROVED_FOR_RELEASE]: {
    label: 'approved_for_release',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    desc: 'Chính thức phê duyệt phát hành giảng dạy',
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
