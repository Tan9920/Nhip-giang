/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { LessonPlan } from '../types';

export interface RuleValidatorResult {
  hasWarning: boolean;
  warningMessage: string | null;
  invalidFields: string[];
}

/**
 * React Hook useRuleValidator rà soát quy chuẩn thuật ngữ môn học thời gian thực.
 * Không dùng AI, vận hành 100% bằng quy tắc (rule-based).
 */
export function useRuleValidator(lessonPlan: LessonPlan | null): RuleValidatorResult {
  return useMemo(() => {
    if (!lessonPlan) {
      return {
        hasWarning: false,
        warningMessage: null,
        invalidFields: [],
      };
    }

    const invalidFields: string[] = [];
    let hasWarning = false;

    // Các từ khóa sai chuẩn liên quan đến môn học
    const forbiddenPatterns = [
      /môn kĩ thuật/i,
      /môn kỹ thuật/i,
      /kĩ thuật công nghiệp/i,
      /kỹ thuật công nghiệp/i,
      /\bkĩ thuật\b/i,
      /\bkỹ thuật\b/i
    ];

    // Trình kiểm tra xem văn bản có vi phạm quy chuẩn môn học không
    // (Bao gồm từ khóa kĩ thuật/kỹ thuật nói về môn học hoặc kĩ thuật công nghiệp,
    // ngoại trừ cụm từ "kĩ thuật dạy học", "kỹ thuật dạy học", "phương pháp và kĩ thuật", "phương pháp và kỹ thuật")
    const detectIncorrectTerminology = (text: string | null | undefined): boolean => {
      if (!text) return false;
      const normalized = text.toLowerCase();
      
      // Nếu có cụm từ "kĩ thuật dạy học" hoặc "kỹ thuật dạy học" hoặc "kĩ thuật sư phạm", hãy bỏ qua cụm từ đó và check phần còn lại
      let sanitized = normalized
        .replace(/kĩ thuật dạy học/g, '')
        .replace(/kỹ thuật dạy học/g, '')
        .replace(/kĩ thuật sư phạm/g, '')
        .replace(/kỹ thuật sư phạm/g, '')
        .replace(/kĩ thuật mảnh ghép/g, '')
        .replace(/kỹ thuật mảnh ghép/g, '')
        .replace(/kĩ thuật khăn trải bàn/g, '')
        .replace(/kỹ thuật khăn trải bàn/g, '')
        .replace(/kĩ thuật động não/g, '')
        .replace(/kỹ thuật động não/g, '')
        .replace(/kĩ thuật đặt câu hỏi/g, '')
        .replace(/kỹ thuật đặt câu hỏi/g, '')
        .replace(/kĩ thuật bể cá/g, '')
        .replace(/kỹ thuật bể cá/g, '')
        .replace(/kĩ thuật ổ bi/g, '')
        .replace(/kỹ thuật ổ bi/g, '')
        .replace(/kĩ thuật mảnh ghép/g, '')
        .replace(/kỹ thuật mảnh ghép/g, '')
        .replace(/phương pháp và kĩ thuật/g, '')
        .replace(/phương pháp và kỹ thuật/g, '')
        .replace(/phương pháp, kĩ thuật/g, '')
        .replace(/phương pháp, kỹ thuật/g, '');

      // Nếu sau khi lọc các cụm từ sư phạm hợp chuẩn, văn bản vẫn chứa "kĩ thuật" hoặc "kỹ thuật"
      // chứng tỏ họ đang dùng sai thuật ngữ khi mô tả môn học hoặc công nghệ (e.g. môn kĩ thuật, vẽ kĩ thuật (vẽ kỹ thuật môn học), kĩ thuật công nghiệp)
      return forbiddenPatterns.some(pattern => pattern.test(sanitized));
    };

    // 1. Rà soát trường "Môn học" ở Phần I (subjectName) và root subject
    const subjectName = lessonPlan.part1?.subjectName || '';
    const rootSubject = lessonPlan.subject || '';
    
    // Đối với tên môn học, bất kỳ sự xuất hiện nào của "kĩ thuật" hoặc "kỹ thuật" mà không có "công nghệ" đi kèm, hoặc nói chung đều bị cảnh báo
    const isSubjectInvalid = 
      subjectName.toLowerCase().includes('kĩ thuật') || 
      subjectName.toLowerCase().includes('kỹ thuật') ||
      rootSubject.toLowerCase().includes('kĩ thuật') ||
      rootSubject.toLowerCase().includes('kỹ thuật') ||
      (subjectName.trim() !== '' && !subjectName.toLowerCase().includes('công nghệ'));

    if (isSubjectInvalid) {
      hasWarning = true;
      invalidFields.push('part1.subjectName');
    }

    // 2. Rà soát toàn bộ Tiến trình dạy học ở Phần V
    const part5 = lessonPlan.part5;
    if (part5) {
      const activities: Array<'warmup' | 'exploration' | 'practice' | 'application'> = [
        'warmup', 'exploration', 'practice', 'application'
      ];

      activities.forEach(actKey => {
        const act = part5[actKey];
        if (act) {
          if (detectIncorrectTerminology(act.target)) {
            hasWarning = true;
            invalidFields.push(`part5.${actKey}.target`);
          }
          if (detectIncorrectTerminology(act.content)) {
            hasWarning = true;
            invalidFields.push(`part5.${actKey}.content`);
          }
          if (detectIncorrectTerminology(act.product)) {
            hasWarning = true;
            invalidFields.push(`part5.${actKey}.product`);
          }
          
          const exec = act.execution;
          if (exec) {
            if (detectIncorrectTerminology(exec.transfer)) {
              hasWarning = true;
              invalidFields.push(`part5.${actKey}.execution.transfer`);
            }
            if (detectIncorrectTerminology(exec.perform)) {
              hasWarning = true;
              invalidFields.push(`part5.${actKey}.execution.perform`);
            }
            if (detectIncorrectTerminology(exec.report)) {
              hasWarning = true;
              invalidFields.push(`part5.${actKey}.execution.report`);
            }
            if (detectIncorrectTerminology(exec.conclude)) {
              hasWarning = true;
              invalidFields.push(`part5.${actKey}.execution.conclude`);
            }
          }
        }
      });
    }

    const warningMessage = hasWarning 
      ? "Chú ý: Tên môn học chuẩn theo chương trình mới phải là 'Công nghệ'. Thuật ngữ 'kĩ thuật' chỉ được dùng khi mô tả phương pháp/kĩ thuật dạy học."
      : null;

    return {
      hasWarning,
      warningMessage,
      invalidFields,
    };
  }, [lessonPlan]);
}
