/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MatrixLesson {
  id: string;
  title: string;
  duration: string;
}

export interface MatrixTopic {
  id: string;
  name: string;
  lessons: MatrixLesson[];
}

export interface MatrixGrade {
  gradeId: string;
  gradeLabel: string;
  topics: MatrixTopic[];
}

export interface MatrixLevel {
  levelId: string;
  levelLabel: string;
  grades: MatrixGrade[];
}

export const CURRICULUM_COMPATIBILITY_MATRIX: MatrixLevel[] = [
  {
    levelId: "tieu_hoc",
    levelLabel: "Tiểu học",
    grades: [
      {
        gradeId: "3",
        gradeLabel: "Lớp 3",
        topics: [
          {
            id: "th_3_t1",
            name: "Công nghệ và đời sống",
            lessons: [
              { id: "th_3_l1", title: "Bài 1: Tự nhiên và công nghệ", duration: "1 tiết" },
              { id: "th_3_l2", title: "Bài 2: Sử dụng đèn học", duration: "1 tiết" },
              { id: "th_3_l3", title: "Bài 3: Sử dụng quạt điện", duration: "1 tiết" },
              { id: "th_3_l4", title: "Bài 4: Sử dụng máy thu thanh", duration: "2 tiết" },
              { id: "th_3_l5", title: "Bài 5: Sử dụng máy thu hình", duration: "2 tiết" }
            ]
          },
          {
            id: "th_3_t2",
            name: "Thủ công kỹ thuật",
            lessons: [
              { id: "th_3_l6", title: "Bài 6: An toàn với công nghệ trong gia đình", duration: "1 tiết" },
              { id: "th_3_l7", title: "Bài 7: Làm đồ chơi học tập", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "4",
        gradeLabel: "Lớp 4",
        topics: [
          {
            id: "th_4_t1",
            name: "Công nghệ và đời sống",
            lessons: [
              { id: "th_4_l1", title: "Bài 1: Hoa và cây cảnh quanh ta", duration: "2 tiết" },
              { id: "th_4_l2", title: "Bài 2: Trồng hoa, cây cảnh trong chậu", duration: "2 tiết" }
            ]
          },
          {
            id: "th_4_t2",
            name: "Kỹ thuật thủ công",
            lessons: [
              { id: "th_4_l3", title: "Bài 3: Lắp ráp mô hình kỹ thuật", duration: "3 tiết" },
              { id: "th_4_l4", title: "Bài 4: Đồ chơi dân gian", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "5",
        gradeLabel: "Lớp 5",
        topics: [
          {
            id: "th_5_t1",
            name: "Công nghệ và đời sống",
            lessons: [
              { id: "th_5_l1", title: "Bài 1: Vai trò của công nghệ", duration: "2 tiết" },
              { id: "th_5_l2", title: "Bài 2: Nhà sáng chế tí hon", duration: "2 tiết" }
            ]
          },
          {
            id: "th_5_t2",
            name: "Tin học và Công nghệ",
            lessons: [
              { id: "th_5_l3", title: "Bài 3: Tìm hiểu điện thoại thông minh", duration: "2 tiết" }
            ]
          }
        ]
      }
    ]
  },
  {
    levelId: "thcs",
    levelLabel: "THCS",
    grades: [
      {
        gradeId: "6",
        gradeLabel: "Lớp 6",
        topics: [
          {
            id: "cs_6_t1",
            name: "Nhà ở",
            lessons: [
              { id: "cs_6_l1", title: "Bài 1: Khái quát về nhà ở", duration: "2 tiết" },
              { id: "cs_6_l2", title: "Bài 2: Sử dụng năng lượng trong gia đình", duration: "2 tiết" },
              { id: "cs_6_l3", title: "Bài 3: Ngôi nhà thông minh", duration: "2 tiết" }
            ]
          },
          {
            id: "cs_6_t2",
            name: "Bảo quản và chế biến thực phẩm",
            lessons: [
              { id: "cs_6_l4", title: "Bài 4: Thực phẩm và dinh dưỡng", duration: "2 tiết" },
              { id: "cs_6_l5", title: "Bài 5: Phương pháp bảo quản và chế biến thực phẩm", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "7",
        gradeLabel: "Lớp 7",
        topics: [
          {
            id: "cs_7_t1",
            name: "Trồng trọt",
            lessons: [
              { id: "cs_7_l1", title: "Bài 1: Giới thiệu chung về trồng trọt", duration: "2 tiết" },
              { id: "cs_7_l2", title: "Bài 2: Quy trình trồng trọt", duration: "3 tiết" }
            ]
          },
          {
            id: "cs_7_t2",
            name: "Lâm nghiệp",
            lessons: [
              { id: "cs_7_l3", title: "Bài 3: Rừng và vai trò của rừng", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "8",
        gradeLabel: "Lớp 8",
        topics: [
          {
            id: "cs_8_t1",
            name: "Vẽ kỹ thuật cơ bản",
            lessons: [
              { id: "cs_8_l1", title: "Bài 1: Tiêu chuẩn trình bày bản vẽ kỹ thuật", duration: "2 tiết" },
              { id: "cs_8_l2", title: "Bài 2: Hình chiếu vuông góc", duration: "2 tiết" }
            ]
          },
          {
            id: "cs_8_t2",
            name: "Cơ khí",
            lessons: [
              { id: "cs_8_l3", title: "Bài 3: Vật liệu cơ khí", duration: "2 tiết" },
              { id: "cs_8_l4", title: "Bài 4: Truyền và biến đổi chuyển động", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "9",
        gradeLabel: "Lớp 9",
        topics: [
          {
            id: "cs_9_t1",
            name: "Định hướng nghề nghiệp",
            lessons: [
              { id: "cs_9_l1", title: "Bài 1: Nghề nghiệp trong lĩnh vực kỹ thuật, công nghệ", duration: "2 tiết" }
            ]
          }
        ]
      }
    ]
  },
  {
    levelId: "thpt",
    levelLabel: "THPT",
    grades: [
      {
        gradeId: "10",
        gradeLabel: "Lớp 10",
        topics: [
          {
            id: "pt_10_t1",
            name: "Khái quát về công nghệ",
            lessons: [
              { id: "pt_10_l1", title: "Bài 1: Khái quát về công nghệ", duration: "2 tiết" },
              { id: "pt_10_l2", title: "Bài 2: Hệ thống kỹ thuật trong Công nghệ", duration: "2 tiết" },
              { id: "pt_10_l3", title: "Bài 3: Một số công nghệ phổ biến", duration: "2 tiết" }
            ]
          },
          {
            id: "pt_10_t2",
            name: "Vẽ kỹ thuật cơ bản",
            lessons: [
              { id: "pt_10_l4", title: "Bài 4: Khái quát về vẽ kỹ thuật", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "11",
        gradeLabel: "Lớp 11",
        topics: [
          {
            id: "pt_11_t1",
            name: "Cơ khí chế tạo",
            lessons: [
              { id: "pt_11_l1", title: "Bài 1: Khái quát về cơ khí chế tạo", duration: "2 tiết" },
              { id: "pt_11_l2", title: "Bài 2: Vật liệu cơ khí thông dụng", duration: "2 tiết" },
              { id: "pt_11_l3", title: "Bài 5: Bản vẽ kĩ thuật và quy chuẩn trình bày", duration: "2 tiết" }
            ]
          }
        ]
      },
      {
        gradeId: "12",
        gradeLabel: "Lớp 12",
        topics: [
          {
            id: "pt_12_t1",
            name: "Kỹ thuật điện",
            lessons: [
              { id: "pt_12_l1", title: "Bài 1: Khái quát về kỹ thuật điện", duration: "2 tiết" },
              { id: "pt_12_l2", title: "Bài 2: An toàn điện và sơ cứu tai nạn điện", duration: "2 tiết" }
            ]
          }
        ]
      }
    ]
  }
];

export function findCurriculumMatch(
  levelId: string,
  gradeLabel: string,
  subject: string,
  topicName: string,
  lessonTitle: string
): { isMapped: boolean; reason?: string } {
  const normalizedSubject = subject.trim().toLowerCase();
  if (normalizedSubject !== "công nghệ") {
    return { isMapped: false, reason: "Môn học bắt buộc phải là 'Công nghệ' mới tương thích Ma trận." };
  }

  const level = CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === levelId);
  if (!level) return { isMapped: false, reason: "Cấp học không nằm trong Ma trận." };

  const grade = level.grades.find(g => g.gradeLabel === gradeLabel);
  if (!grade) return { isMapped: false, reason: "Lớp học không nằm trong Ma trận." };

  const topic = grade.topics.find(t => t.name.trim().toLowerCase() === topicName.trim().toLowerCase());
  if (!topic) return { isMapped: false, reason: "Chủ đề kiến thức chưa được lập bản đồ trong Ma trận." };

  const lesson = topic.lessons.find(l => l.title.trim().toLowerCase() === lessonTitle.trim().toLowerCase());
  if (!lesson) return { isMapped: false, reason: "Tên bài giảng tự do không khớp với bài mẫu trong Ma trận." };

  return { isMapped: true };
}
