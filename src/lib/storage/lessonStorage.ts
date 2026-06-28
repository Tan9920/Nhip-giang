/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonPlan, DataStatus, LessonClassification } from '../../types';

/**
 * Interface LessonData chứa cấu trúc dữ liệu lưu trữ bắt buộc theo yêu cầu hệ thống.
 */
export interface LessonData {
  id: string; // Tự động sinh UUID hoặc chuỗi ngẫu nhiên không trùng lặp
  ownerId: string; // Định danh chủ sở hữu phục vụ nguyên tắc Cô lập Chủ sở hữu (Owner Isolation)
  title: string; // Tên bài dạy
  dataStatus: 'seed' | 'scaffold' | 'community' | 'reviewed' | 'verified' | 'approved_for_release'; // 6 nhãn trạng thái bắt buộc
  lessonType: 'official_lesson' | 'topic_strand' | 'review_lesson' | 'supplementary_activity' | 'teacher_input' | 'legacy_reference' | 'unmapped'; // Loại bài dạy
  content: {
    sectionI: any;  // Cấu trúc 8 phần của Công văn 5512
    sectionII: any;
    sectionIII: any;
    sectionIV: any;
    sectionV: any;
    sectionVI: any;
    sectionVII: any;
    sectionVIII: any;
    // Lưu các thông tin bổ sung để phục dựng hoàn chỉnh đối tượng LessonPlan
    grade: string;
    subject: string;
    duration: string;
    createdAt: string;
  };
  updatedAt: string; // Dấu thời gian cập nhật cuối cùng
}

const STORAGE_KEY = 'nhip_giang_lessons_v1';

/**
 * Chuyển đổi đối tượng giao diện (LessonPlan) thành cấu trúc lưu trữ (LessonData)
 */
export function mapPlanToData(plan: LessonPlan): LessonData {
  return {
    id: plan.id,
    ownerId: plan.ownerId,
    title: plan.title,
    dataStatus: plan.status as LessonData['dataStatus'],
    lessonType: plan.classification as LessonData['lessonType'],
    content: {
      sectionI: plan.part1,
      sectionII: plan.part2,
      sectionIII: plan.part3,
      sectionIV: plan.part4,
      sectionV: plan.part5,
      sectionVI: plan.part6,
      sectionVII: plan.part7,
      sectionVIII: plan.part8,
      grade: plan.grade,
      subject: plan.subject,
      duration: plan.duration,
      createdAt: plan.createdAt
    },
    updatedAt: plan.updatedAt
  };
}

/**
 * Chuyển đổi cấu trúc lưu trữ (LessonData) thành đối tượng giao diện (LessonPlan)
 */
export function mapDataToPlan(data: LessonData): LessonPlan {
  return {
    id: data.id,
    ownerId: data.ownerId,
    title: data.title,
    grade: data.content.grade || 'Lớp 10',
    subject: data.content.subject || 'Công nghệ',
    duration: data.content.duration || '2 tiết',
    status: data.dataStatus as DataStatus,
    classification: data.lessonType as LessonClassification,
    createdAt: data.content.createdAt || data.updatedAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    part1: data.content.sectionI,
    part2: data.content.sectionII,
    part3: data.content.sectionIII,
    part4: data.content.sectionIV,
    part5: data.content.sectionV,
    part6: data.content.sectionVI,
    part7: data.content.sectionVII,
    part8: data.content.sectionVIII
  };
}

/**
 * Đọc toàn bộ danh sách giáo án từ LocalStorage, chuyển đổi sang định dạng LessonPlan.
 * Nếu LocalStorage trống, tự động nạp dữ liệu Seed mẫu từ hệ thống.
 */
export function loadLessonsFromStorage(seedFallback: LessonPlan[]): LessonPlan[] {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) {
    // Lưu định dạng LessonData của các phần tử seed ban đầu
    const initialData = seedFallback.map(mapPlanToData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return seedFallback;
  }

  try {
    const rawList = JSON.parse(savedData) as any[];
    
    // Kiểm tra định dạng dữ liệu có phải là cấu trúc mới hay cũ
    const mappedList = rawList.map((item: any) => {
      if (item && item.content && item.dataStatus && item.lessonType) {
        // Đúng định dạng LessonData mới
        return mapDataToPlan(item as LessonData);
      } else {
        // Dữ liệu cũ, tự động nâng cấp chuẩn hóa sang cấu trúc mới
        const plan = item as LessonPlan;
        const dataForm = mapPlanToData(plan);
        return mapDataToPlan(dataForm);
      }
    });

    return mappedList;
  } catch (err) {
    console.error('Lỗi phân tích dữ liệu cũ từ LocalStorage:', err);
    return seedFallback;
  }
}

/**
 * Lưu danh sách giáo án xuống LocalStorage dưới định dạng LessonData chuẩn hóa.
 */
export function saveLessonsToStorage(plans: LessonPlan[]): void {
  try {
    const dataList = plans.map(mapPlanToData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataList));
  } catch (err) {
    console.error('Không thể lưu trữ giáo án vào LocalStorage:', err);
  }
}

/**
 * Lọc danh sách giáo án dựa theo Owner Isolation (Cô lập Chủ sở hữu)
 */
export function getLessonsByOwner(ownerId: string, allPlans: LessonPlan[]): LessonPlan[] {
  // Nếu là cán bộ kiểm duyệt (admin), có quyền xem toàn bộ giáo án
  if (ownerId === 'admin') {
    return allPlans;
  }
  
  // Giáo viên chỉ xem được các giáo án do chính mình soạn hoặc các giáo án mẫu hệ thống (system_seed_account)
  return allPlans.filter(p => p.ownerId === ownerId || p.ownerId === 'system_seed_account');
}

/**
 * Sinh UUID ngẫu nhiên không trùng lặp cho giáo án mới tạo
 */
export function generateUniqueID(): string {
  return 'plan_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}
