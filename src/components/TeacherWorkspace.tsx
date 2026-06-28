/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LessonPlan, DataStatus, DataStatusLabels, LessonClassification, LessonClassificationLabels, LessonVersion, PedagogicalContext } from '../types';
import { checkSubjectTerminology, createEmptyScaffold } from '../lib/templates';
import { exportLessonToWord } from '../lib/exporter';
import { useRuleValidator } from '../hooks/useRuleValidator';
import { useQuotaGuard } from '../hooks/useQuotaGuard';
import { UserAccount } from '../lib/auth/authService';
import { 
  Calendar, BookOpen, Plus, Download, ChevronRight, FileText, 
  HelpCircle, AlertTriangle, AlertCircle, Save, X, Edit3, Eye, CheckCircle,
  Copy, Clock, RotateCcw, Shield
} from 'lucide-react';
import { CURRICULUM_COMPATIBILITY_MATRIX, findCurriculumMatch } from '../lib/curriculum/compatibilityMatrix';

interface TeacherWorkspaceProps {
  lessonPlans: LessonPlan[];
  onAddPlan: (plan: LessonPlan) => void;
  onUpdatePlan: (plan: LessonPlan) => void;
  activeTeacherId: string;
  onNavigateToPlans?: () => void;
  currentUser?: UserAccount | null;
  onRefreshUser?: () => void;
}

export default function TeacherWorkspace({ 
  lessonPlans, 
  onAddPlan, 
  onUpdatePlan, 
  activeTeacherId,
  onNavigateToPlans,
  currentUser,
  onRefreshUser
}: TeacherWorkspaceProps) {
  // Quota validation hook
  const { checkAndDeductQuota, showQuotaModal, setShowQuotaModal, userQuotaInfo, refreshQuotaInfo } = useQuotaGuard();

  // Sync quota info whenever user triggers login or edits
  useEffect(() => {
    refreshQuotaInfo();
  }, [currentUser, refreshQuotaInfo]);

  // Trạng thái cho nhân bản/phiên bản & thông báo
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [dismissedAdvisory, setDismissedAdvisory] = useState<boolean>(() => {
    return localStorage.getItem('nhip_giang_dismissed_advisory') === 'true';
  });

  // States cho Bộ lựa chọn Ngữ cảnh & Ma trận tương thích
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('tieu_hoc');
  const [selectedGradeLabel, setSelectedGradeLabel] = useState<string>('Lớp 3');
  const [selectedTopicName, setSelectedTopicName] = useState<string>('Công nghệ và đời sống');
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string>('Bài 1: Tự nhiên và công nghệ');
  const [isCustomLesson, setIsCustomLesson] = useState<boolean>(false);
  const [customLessonTitleInput, setCustomLessonTitleInput] = useState<string>('');
  const [customTopicNameInput, setCustomTopicNameInput] = useState<string>('');

  const [contextForm, setContextForm] = useState<PedagogicalContext>({
    classSize: 'Trung bình',
    studentLevel: 'Chuẩn',
    equipment: 'Máy chiếu',
    classroomSpace: 'Phòng cố định',
    durationMin: '45 phút',
    coreObjective: 'Bài mới',
  });

  // Tải lại tiến độ soạn bài dở từ Local Storage khi khởi chạy
  const [isEditing, setIsEditing] = useState<boolean>(() => {
    return localStorage.getItem('nhip_giang_is_editing') === 'true';
  });
  const [isPreviewing, setIsPreviewing] = useState<boolean>(() => {
    return localStorage.getItem('nhip_giang_is_previewing') === 'true';
  });
  const [activeFormTab, setActiveFormTab] = useState<number>(() => {
    const saved = localStorage.getItem('nhip_giang_active_form_tab');
    return saved ? parseInt(saved, 10) : 1;
  });
  
  // Trạng thái giáo án đang chọn
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(() => {
    const savedId = localStorage.getItem('nhip_giang_selected_plan_id');
    if (savedId) {
      return lessonPlans.find(p => p.id === savedId) || null;
    }
    return null;
  });
  
  // Trạng thái Form soạn giáo án (Chứa dữ liệu nhập động)
  const [formData, setFormData] = useState<LessonPlan | null>(() => {
    const savedDraft = localStorage.getItem('nhip_giang_active_draft');
    if (savedDraft) {
      try {
        return JSON.parse(savedDraft);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Kích hoạt Bộ kiểm tra quy tắc thời gian thực (Real-Time Rule Validator Hook)
  const { hasWarning, warningMessage } = useRuleValidator(formData);

  const isAdmin = activeTeacherId === 'admin';

  // Lưu trữ các cấu trúc trạng thái UI khi thay đổi
  useEffect(() => {
    localStorage.setItem('nhip_giang_is_editing', isEditing.toString());
  }, [isEditing]);

  useEffect(() => {
    localStorage.setItem('nhip_giang_is_previewing', isPreviewing.toString());
  }, [isPreviewing]);

  useEffect(() => {
    localStorage.setItem('nhip_giang_active_form_tab', activeFormTab.toString());
  }, [activeFormTab]);

  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem('nhip_giang_selected_plan_id', selectedPlan.id);
    } else {
      localStorage.removeItem('nhip_giang_selected_plan_id');
    }
  }, [selectedPlan]);

  // Cô lập trạng thái khi chuyển đổi giáo viên/admin
  useEffect(() => {
    setIsEditing(false);
    setIsPreviewing(false);
    setFormData(null);
    setSelectedPlan(null);
    localStorage.removeItem('nhip_giang_is_editing');
    localStorage.removeItem('nhip_giang_is_previewing');
    localStorage.removeItem('nhip_giang_active_draft');
    localStorage.removeItem('nhip_giang_selected_plan_id');
  }, [activeTeacherId]);

  // Cơ chế Tự động lưu (Auto-save) debounce 1.5 giây
  useEffect(() => {
    if (!isEditing || !formData) return;

    const timer = setTimeout(() => {
      // 1. Lưu bản nháp
      localStorage.setItem('nhip_giang_active_draft', JSON.stringify(formData));

      // 2. Tự động đồng bộ lên tầng lưu trữ chính ở App.tsx
      const updated = {
        ...formData,
        title: formData.part1.lessonTitle || 'Giáo án mới',
        grade: formData.grade,
        subject: formData.part1.subjectName,
        duration: formData.part1.duration,
        updatedAt: new Date().toISOString()
      };
      
      onUpdatePlan(updated);
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, isEditing]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Xử lý thay đổi cấp học, lớp học, chủ đề
  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId);
    const level = CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === levelId);
    if (level && level.grades.length > 0) {
      const firstGrade = level.grades[0];
      handleGradeChange(firstGrade.gradeLabel, levelId);
    }
  };

  const handleGradeChange = (gradeLabel: string, levelId = selectedLevelId) => {
    setSelectedGradeLabel(gradeLabel);
    const level = CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === levelId);
    const grade = level?.grades.find(g => g.gradeLabel === gradeLabel);
    if (grade && grade.topics.length > 0) {
      const firstTopic = grade.topics[0];
      handleTopicChange(firstTopic.name, firstTopic.id, grade.topics);
    } else {
      setSelectedTopicName('Khác');
      setSelectedLessonTitle('Khác');
      setIsCustomLesson(true);
    }
  };

  const handleTopicChange = (topicName: string, topicId = '', availableTopics: any[] = []) => {
    setSelectedTopicName(topicName);
    if (topicName === 'Khác') {
      setSelectedLessonTitle('Khác');
      setIsCustomLesson(true);
      return;
    }
    
    let topic: any;
    if (availableTopics.length > 0) {
      topic = availableTopics.find(t => t.name === topicName);
    } else {
      const level = CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === selectedLevelId);
      const grade = level?.grades.find(g => g.gradeLabel === selectedGradeLabel);
      topic = grade?.topics.find(t => t.name === topicName);
    }

    if (topic && topic.lessons.length > 0) {
      setSelectedLessonTitle(topic.lessons[0].title);
      setIsCustomLesson(false);
    } else {
      setSelectedLessonTitle('Khác');
      setIsCustomLesson(true);
    }
  };

  // Xác nhận khởi tạo và gán ngữ cảnh sư phạm thực tế
  const handleConfirmContext = () => {
    let finalTitle = selectedLessonTitle;
    let finalTopic = selectedTopicName;
    let classification = LessonClassification.OFFICIAL_LESSON;
    let status = DataStatus.SCAFFOLD;

    if (selectedLessonTitle === 'Khác' || isCustomLesson) {
      finalTitle = customLessonTitleInput.trim();
      finalTopic = customTopicNameInput.trim() || 'Chủ đề tự chọn';
      classification = LessonClassification.UNMAPPED;
    }

    if (!finalTitle) {
      showToast('Vui lòng nhập tên bài dạy!', 'error');
      return;
    }

    const baseScaffold = createEmptyScaffold(activeTeacherId);
    const newPlan: LessonPlan = {
      ...baseScaffold,
      id: `plan_${Date.now()}`,
      title: finalTitle,
      grade: selectedGradeLabel,
      subject: 'Công nghệ',
      duration: contextForm.durationMin,
      classification: classification,
      status: status,
      levelId: selectedLevelId,
      topicName: finalTopic,
      context: { ...contextForm },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
      part1: {
        className: `Lớp ${selectedGradeLabel.replace('Lớp ', '')}A1`,
        subjectName: 'Công nghệ',
        lessonTitle: finalTitle,
        duration: contextForm.durationMin,
      }
    };

    if (classification === LessonClassification.UNMAPPED) {
      newPlan.part2 = {
        knowledgeAndSkills: 'Yêu cầu tự nhập (Chế độ khung cấu trúc an toàn - unmapped)',
        generalCapacity: 'Yêu cầu tự nhập (Chế độ khung cấu trúc an toàn - unmapped)',
        specificCapacity: 'Yêu cầu tự nhập (Chế độ khung cấu trúc an toàn - unmapped)',
        qualities: 'Yêu cầu tự nhập (Chế độ khung cấu trúc an toàn - unmapped)',
        evaluationEvidence: 'Yêu cầu tự nhập (Chế độ khung cấu trúc an toàn - unmapped)',
      };
      newPlan.part3 = {
        teacherEquipment: 'Thiết bị dạy học của giáo viên...',
        studentEquipment: 'Học liệu và thiết bị học tập của học sinh...',
        sources: 'Yêu cầu tự nhập',
        copyrightLicense: 'Sử dụng phi thương mại',
      };
      newPlan.part4 = {
        methods: 'Phương pháp dạy học giáo viên tự cấu hình...',
        techniques: 'Kĩ thuật dạy học giáo viên tự cấu hình...',
      };
      newPlan.part5 = {
        warmup: {
          target: 'Mục tiêu khởi động...',
          content: 'Nội dung hoạt động khởi động...',
          product: 'Sản phẩm hoạt động khởi động...',
          execution: { transfer: '', perform: '', report: '', conclude: '' }
        },
        exploration: {
          target: 'Mục tiêu hình thành kiến thức...',
          content: 'Nội dung hoạt động hình thành kiến thức...',
          product: 'Sản phẩm hoạt động hình thành kiến thức...',
          execution: { transfer: '', perform: '', report: '', conclude: '' }
        },
        practice: {
          target: 'Mục tiêu hoạt động luyện tập...',
          content: 'Nội dung hoạt động luyện tập...',
          product: 'Sản phẩm hoạt động luyện tập...',
          execution: { transfer: '', perform: '', report: '', conclude: '' }
        },
        application: {
          target: 'Mục tiêu hoạt động vận dụng...',
          content: 'Nội dung hoạt động vận dụng...',
          product: 'Sản phẩm hoạt động vận dụng...',
          execution: { transfer: '', perform: '', report: '', conclude: '' }
        },
      };
    } else {
      newPlan.part2.knowledgeAndSkills = `Học xong bài "${finalTitle}", học sinh đạt được:\n- Kiến thức cốt lõi tương ứng mạch chủ đề "${finalTopic}".\n- Biết cách vận dụng sáng tạo phù hợp ngữ cảnh lớp học chuẩn.`;
    }

    onAddPlan(newPlan);
    setFormData(newPlan);
    setSelectedPlan(newPlan);
    setIsCreatingNew(false);
    setIsEditing(true);
    setIsPreviewing(false);
    setActiveFormTab(1);
    showToast('Tạo giáo án ngữ cảnh thành công!', 'success');
  };

  // Xử lý tạo giáo án mới
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setIsPreviewing(false);
    setSelectedPlan(null);
    
    // Đặt lại các giá trị mặc định cho bộ chọn
    setSelectedLevelId('tieu_hoc');
    setSelectedGradeLabel('Lớp 3');
    setSelectedTopicName('Công nghệ và đời sống');
    setSelectedLessonTitle('Bài 1: Tự nhiên và công nghệ');
    setIsCustomLesson(false);
    setCustomLessonTitleInput('');
    setCustomTopicNameInput('');
  };

  // Xử lý nhân bản giáo án (Cloning - Batch 03)
  const handleClonePlan = (plan: LessonPlan) => {
    setIsActionLoading(true);
    setLoadingMessage('Đang tiến hành nhân bản giáo án...');
    
    setTimeout(() => {
      try {
        const cloned: LessonPlan = JSON.parse(JSON.stringify(plan));
        cloned.id = `plan_${Date.now()}`;
        cloned.title = `Bản sao - ${plan.title}`;
        cloned.part1.lessonTitle = `Bản sao - ${plan.part1.lessonTitle}`;
        cloned.createdAt = new Date().toISOString();
        cloned.updatedAt = new Date().toISOString();
        cloned.versions = []; // Bản sao mới được reset lịch sử phiên bản
        
        onAddPlan(cloned);
        showToast('Nhân bản giáo án thành công!', 'success');
      } catch (err) {
        showToast('Lưu giáo án nhân bản thất bại. Hãy kiểm tra dung lượng trình duyệt!', 'error');
      } finally {
        setIsActionLoading(false);
      }
    }, 600);
  };

  // Lưu phiên bản mới (Version Control - Batch 03)
  const handleSaveVersion = () => {
    if (!formData) return;

    setIsActionLoading(true);
    setLoadingMessage('Đang ghi nhận mốc phiên bản...');

    setTimeout(() => {
      try {
        const currentVersions = formData.versions || [];
        const nextVersionNumber = currentVersions.length > 0 
          ? Math.max(...currentVersions.map(v => v.v)) + 1 
          : 1;
        
        const newVersion: LessonVersion = {
          v: nextVersionNumber,
          content: JSON.parse(JSON.stringify(formData)),
          updatedAt: new Date().toISOString()
        };
        
        const updatedPlan: LessonPlan = {
          ...formData,
          versions: [newVersion, ...currentVersions],
          updatedAt: new Date().toISOString()
        };
        
        setFormData(updatedPlan);
        onUpdatePlan(updatedPlan);
        showToast(`Lưu trữ thành công phiên bản v${nextVersionNumber}!`, 'success');
      } catch (err) {
        showToast('Lỗi ghi nhận phiên bản mới vào cơ sở dữ liệu!', 'error');
      } finally {
        setIsActionLoading(false);
      }
    }, 500);
  };

  // Khôi phục phiên bản cũ
  const handleRestoreVersion = (ver: LessonVersion) => {
    if (!window.confirm(`Xác nhận: Bạn muốn khôi phục nội dung về mốc phiên bản v${ver.v}? Toàn bộ tiến trình soạn thảo hiện tại sẽ bị thay thế.`)) {
      return;
    }

    setIsActionLoading(true);
    setLoadingMessage(`Đang tải dữ liệu phiên bản v${ver.v}...`);

    setTimeout(() => {
      try {
        const currentVersions = formData?.versions || [];
        const restored: LessonPlan = {
          ...ver.content,
          versions: currentVersions, // Giữ nguyên lịch sử để có thể quay lại
          updatedAt: new Date().toISOString()
        };

        setFormData(restored);
        onUpdatePlan(restored);
        showToast(`Đã khôi phục thành công về phiên bản v${ver.v}!`, 'success');
        setActiveFormTab(1); // Trở về Phần I để xem kết quả
      } catch (err) {
        showToast('Khôi phục phiên bản lưu trữ thất bại!', 'error');
      } finally {
        setIsActionLoading(false);
      }
    }, 500);
  };

  // Xử lý chọn xem/sửa giáo án
  const handleSelectPlan = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setFormData(JSON.parse(JSON.stringify(plan))); // Deep copy
    setIsEditing(false);
    setIsPreviewing(true);
  };

  const handleEditExisting = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setFormData(JSON.parse(JSON.stringify(plan))); // Deep copy
    setIsEditing(true);
    setIsPreviewing(false);
    setActiveFormTab(1);
  };

  // Lưu giáo án
  const handleSave = () => {
    if (!formData) return;
    
    // Kiểm duyệt nhanh quy tắc trước khi lưu
    const termCheck = checkSubjectTerminology(formData.subject, formData.part4.techniques);
    if (!termCheck.isValid) {
      if (!window.confirm('Cảnh báo quy tắc: ' + termCheck.errors[0] + '\n\nBạn có chắc chắn muốn lưu với lỗi thuật ngữ này không?')) {
        return;
      }
    }

    const updated = {
      ...formData,
      title: formData.part1.lessonTitle || 'Giáo án mới',
      grade: formData.grade,
      subject: formData.part1.subjectName,
      duration: formData.part1.duration,
      updatedAt: new Date().toISOString()
    };

    if (lessonPlans.some(p => p.id === updated.id)) {
      onUpdatePlan(updated);
    } else {
      onAddPlan(updated);
    }

    setIsEditing(false);
    setIsPreviewing(true);
    setSelectedPlan(updated);
  };

  // Trình thay đổi giá trị trong form
  const updateFormPart = (partKey: string, fieldKey: string, value: string) => {
    if (!formData) return;
    
    const updated = { ...formData };
    if (partKey === 'root') {
      // @ts-ignore
      updated[fieldKey] = value;
      if (fieldKey === 'grade') {
        // Đồng bộ khối lớp
        updated.grade = value;
      }
    } else {
      // @ts-ignore
      updated[partKey][fieldKey] = value;
      
      // Đồng bộ thông tin chung ở phần I
      if (partKey === 'part1' && fieldKey === 'subjectName') {
        updated.subject = value;
      }
      if (partKey === 'part1' && fieldKey === 'lessonTitle') {
        updated.title = value;
      }
    }
    setFormData(updated);
  };

  // Trình thay đổi tiến trình dạy học ở Phần V
  const updateProgression = (activityKey: 'warmup' | 'exploration' | 'practice' | 'application', fieldKey: string, value: string, isExecutionStep = false, stepKey = '') => {
    if (!formData) return;
    
    const updated = { ...formData };
    if (isExecutionStep) {
      // @ts-ignore
      updated.part5[activityKey].execution[stepKey] = value;
    } else {
      // @ts-ignore
      updated.part5[activityKey][fieldKey] = value;
    }
    setFormData(updated);
  };

  // Kiểm soát hiển thị lịch dạy cá nhân mẫu
  const mockWeeklyCalendar = [
    { day: 'Thứ Hai', period: 'Tiết 2', class: '10A1', subject: 'Công nghệ', topic: 'Bài 1: Khái quát về Công nghệ' },
    { day: 'Thứ Ba', period: 'Tiết 4', class: '10A2', subject: 'Công nghệ', topic: 'Bài 2: Hệ thống kỹ thuật' },
    { day: 'Thứ Năm', period: 'Tiết 1', class: '11B3', subject: 'Công nghệ', topic: 'Bài 5: Bản vẽ kĩ thuật' },
    { day: 'Thứ Sáu', period: 'Tiết 3', class: '10A1', subject: 'Công nghệ', topic: 'Bài 1: Khái quát về Công nghệ' },
  ];

  return (
    <div className="space-y-6 relative" id="teacher-workspace-container">
      {/* Toast Alert Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4.5 py-3 rounded-xl shadow-lg border text-xs font-bold animate-slide-in ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : toast.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 animate-bounce" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Action Loading Overlay Spinner */}
      {isActionLoading && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-xs font-bold font-display tracking-wide">{loadingMessage || 'Đang xử lý dữ liệu...'}</span>
        </div>
      )}

      {/* Cảnh báo hướng dẫn sư phạm, có thể tắt đi để tiết kiệm diện tích */}
      {!dismissedAdvisory && (
        <div className="bg-amber-50/75 border border-amber-200/70 rounded-2xl p-4.5 text-xs flex items-start justify-between gap-3.5 shadow-3xs relative animate-fade-in" id="fixed-legal-advisory">
          <div className="flex items-start gap-3.5">
            <div className="bg-amber-100 p-1.5 rounded-xl shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-950 uppercase tracking-wider block text-[10px]">
                Lưu ý sư phạm quan trọng
              </span>
              <p className="text-amber-900/90 leading-relaxed font-semibold">
                Các bài dạy mẫu và khung tham chiếu trên hệ thống được xây dựng làm cơ sở định hướng theo chuẩn Công văn 5512. Thầy/cô vui lòng chủ động rà soát và điều chỉnh linh hoạt nhằm bảo đảm sự phù hợp tối ưu với điều kiện dạy học thực tế tại đơn vị.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setDismissedAdvisory(true);
              localStorage.setItem('nhip_giang_dismissed_advisory', 'true');
            }}
            className="p-1 text-amber-700/60 hover:text-amber-950 hover:bg-amber-100/50 rounded-lg transition-all cursor-pointer shrink-0 animate-fade-in"
            title="Đóng thông báo này"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isEditing && !isPreviewing ? (
        isCreatingNew ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 max-w-3xl mx-auto space-y-6 animate-fade-in" id="context-selector-card">
            <div className="border-b border-slate-150 pb-4">
              <h3 className="font-display font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                Khởi tạo thông tin & Điều kiện giảng dạy
              </h3>
              <p className="text-xs text-slate-500 mt-1">Thiết lập các điều kiện lớp học thực tế và tự động chuẩn bị cấu trúc môn Công nghệ chuẩn GDPT 2018.</p>
            </div>

            {/* Section 1: Curriculum Alignment Matrix */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                1. Phân phối chương trình & Ma trận tương thích (Công nghệ)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cấp học</label>
                  <select
                    value={selectedLevelId}
                    onChange={(e) => handleLevelChange(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    {CURRICULUM_COMPATIBILITY_MATRIX.map(level => (
                      <option key={level.levelId} value={level.levelId}>{level.levelLabel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lớp học</label>
                  <select
                    value={selectedGradeLabel}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    {CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === selectedLevelId)?.grades.map(g => (
                      <option key={g.gradeId} value={g.gradeLabel}>{g.gradeLabel}</option>
                    )) || <option value="">Không có dữ liệu</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học áp dụng</label>
                  <input
                    type="text"
                    value="Công nghệ"
                    disabled
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-slate-100/60 text-slate-500 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chủ đề / Mạch kiến thức</label>
                  <select
                    value={selectedTopicName}
                    onChange={(e) => handleTopicChange(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    {CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === selectedLevelId)
                      ?.grades.find(g => g.gradeLabel === selectedGradeLabel)
                      ?.topics.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      )) || <option value="">Không có dữ liệu</option>}
                    <option value="Khác">Khác (Nhập thủ công)</option>
                  </select>
                </div>

                {selectedTopicName === 'Khác' && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập tên Chủ đề / Mạch kiến thức thủ công</label>
                    <input
                      type="text"
                      value={customTopicNameInput}
                      onChange={(e) => setCustomTopicNameInput(e.target.value)}
                      placeholder="Ví dụ: Công nghệ chế tạo và lắp ráp máy bay mini"
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                    />
                  </div>
                )}

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên bài dạy học chuẩn</label>
                  {selectedTopicName !== 'Khác' ? (
                    <select
                      value={selectedLessonTitle}
                      onChange={(e) => {
                        setSelectedLessonTitle(e.target.value);
                        setIsCustomLesson(e.target.value === 'Khác');
                      }}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                    >
                      {CURRICULUM_COMPATIBILITY_MATRIX.find(l => l.levelId === selectedLevelId)
                        ?.grades.find(g => g.gradeLabel === selectedGradeLabel)
                        ?.topics.find(t => t.name === selectedTopicName)
                        ?.lessons.map(l => (
                          <option key={l.id} value={l.title}>{l.title}</option>
                        )) || <option value="">Không có dữ liệu</option>}
                      <option value="Khác">Khác (Tự nhập thủ công)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customLessonTitleInput}
                      onChange={(e) => setCustomLessonTitleInput(e.target.value)}
                      placeholder="Ví dụ: Bài thực hành nâng cao tự sáng tạo"
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                    />
                  )}
                </div>

                {selectedTopicName !== 'Khác' && selectedLessonTitle === 'Khác' && (
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập tên bài dạy học thủ công</label>
                    <input
                      type="text"
                      value={customLessonTitleInput}
                      onChange={(e) => setCustomLessonTitleInput(e.target.value)}
                      placeholder="Ví dụ: Bài thực hành nâng cao tự sáng tạo"
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Matrix Validation Alert Panel */}
              {(selectedLessonTitle === 'Khác' || selectedTopicName === 'Khác' || isCustomLesson) ? (
                <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs flex items-start gap-3">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-700 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold block text-amber-950 uppercase tracking-wider text-[10px]">Bài học tự chọn (Ngoài danh mục mẫu)</span>
                    <p className="leading-relaxed text-slate-600 font-medium">
                      Thầy/cô đang soạn một bài giảng tự do ngoài danh mục Công nghệ chuẩn. Hệ thống sẽ chuẩn bị một biểu mẫu trống đúng cấu trúc Công văn 5512 để thầy/cô tự do nhập nội dung giảng dạy của riêng mình.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs flex items-start gap-3">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-700 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-extrabold block text-emerald-950 uppercase tracking-wider text-[10px]">Đã khớp bài học Công nghệ chuẩn</span>
                    <p className="leading-relaxed text-slate-600 font-medium">
                      Đã khớp bài học mẫu trong Chương trình Giáo dục Phổ thông 2018. Hệ thống sẽ chuẩn bị sẵn khung nội dung tham khảo định hướng (Yêu cầu cần đạt, thiết bị dạy học) để hỗ trợ thầy/cô soạn bài nhanh hơn.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Pedagogical Context Options */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                2. Điều kiện lớp học & Thiết bị giảng dạy thực tế
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quy mô lớp học</label>
                  <select
                    value={contextForm.classSize}
                    onChange={(e) => setContextForm({ ...contextForm, classSize: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="Ít">Ít (Dưới 20 học sinh)</option>
                    <option value="Trung bình">Trung bình (20-40 học sinh)</option>
                    <option value="Đông">Đông (Trên 40 học sinh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trình độ nhận thức của học sinh</label>
                  <select
                    value={contextForm.studentLevel}
                    onChange={(e) => setContextForm({ ...contextForm, studentLevel: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="Cần hỗ trợ">Cần hỗ trợ học tập nhiều</option>
                    <option value="Chuẩn">Chuẩn phổ thông (Đại trà)</option>
                    <option value="Khá">Khá giỏi (Phát triển cao)</option>
                    <option value="Nâng cao">Nâng cao (Đội tuyển mũi nhọn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thiết bị, đồ dùng dạy học hiện có</label>
                  <select
                    value={contextForm.equipment}
                    onChange={(e) => setContextForm({ ...contextForm, equipment: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="Không thiết bị">Không có thiết bị công nghệ hỗ trợ</option>
                    <option value="Máy chiếu">Có máy chiếu / Tivi trình chiếu lớp học</option>
                    <option value="Điện thoại">Cho phép học sinh sử dụng Thiết bị cá nhân</option>
                    <option value="Phòng bộ môn">Dạy học tại Phòng bộ môn / Phòng xưởng thực hành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Không gian lớp học</label>
                  <select
                    value={contextForm.classroomSpace}
                    onChange={(e) => setContextForm({ ...contextForm, classroomSpace: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="Phòng cố định">Phòng học truyền thống (Bàn ghế cố định)</option>
                    <option value="Linh hoạt">Phòng học linh hoạt (Dễ sắp xếp nhóm hoạt động)</option>
                    <option value="Ngoài lớp">Ngoài không gian lớp học (Sân trường, xưởng ngoài)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời lượng tiết học định mức</label>
                  <select
                    value={contextForm.durationMin}
                    onChange={(e) => setContextForm({ ...contextForm, durationMin: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="35 phút">35 phút (Chuẩn tiết Tiểu học)</option>
                    <option value="40 phút">40 phút</option>
                    <option value="45 phút">45 phút (Chuẩn tiết Trung học)</option>
                    <option value="90 phút">90 phút (2 tiết liên tiếp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mục tiêu cốt lõi của bài dạy</label>
                  <select
                    value={contextForm.coreObjective}
                    onChange={(e) => setContextForm({ ...contextForm, coreObjective: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white cursor-pointer"
                  >
                    <option value="Bài mới">Chiếm lĩnh kiến thức bài mới</option>
                    <option value="Luyện tập">Luyện tập / Thực hành kỹ xảo</option>
                    <option value="Ôn tập">Ôn tập / Hệ thống kiến thức</option>
                    <option value="Dự án">Thực hiện dự án STEM / Trải nghiệm sáng tạo</option>
                    <option value="Bổ trợ">Hoạt động bồi dưỡng bổ trợ nâng cao</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stepper Buttons Panel */}
            <div className="border-t border-slate-150 pt-5 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs font-bold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmContext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/15 hover:shadow-lg transition-all cursor-pointer border border-emerald-600/20"
              >
                Xác nhận & Bắt đầu soạn bài
              </button>
            </div>
          </div>
        ) : (
          /* ================== GIAO DIỆN DASHBOARD GIÁO VIÊN ================== */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-view">
          
          {/* Lịch tuần cơ bản & Hạn ngạch */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            {/* Hộp quản lý hạn ngạch */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 font-sans" id="quota-dashboard-card">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-emerald-600" />
                  Hạn ngạch xuất bản
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                  userQuotaInfo?.planType === 'pro_early' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {userQuotaInfo?.planType === 'pro_early' ? 'Pro Early' : 'Miễn phí'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>Hạn ngạch tuần:</span>
                  <span className="font-bold text-slate-900">
                    {userQuotaInfo?.quotaRemaining ?? 3} / {userQuotaInfo?.quotaLimit ?? 3} lượt
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (userQuotaInfo?.quotaRemaining ?? 3) === 0 
                        ? 'bg-rose-500' 
                        : (userQuotaInfo?.quotaRemaining ?? 3) === 1 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((userQuotaInfo?.quotaRemaining ?? 3) / (userQuotaInfo?.quotaLimit ?? 3)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-slate-400 font-medium">
                  {userQuotaInfo?.planType === 'pro_early' ? 'Xuất bản sạch không đóng dấu watermark' : 'Tải xuống Word tự động đóng dấu'}
                </span>
                {userQuotaInfo?.planType === 'free' ? (
                  <button 
                    onClick={onNavigateToPlans}
                    className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-800 underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    Nâng cấp Pro Early
                  </button>
                ) : (
                  <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                    ✓ Đã mở khóa Pro
                  </span>
                )}
              </div>
            </div>

            {/* Lịch tuần cơ bản */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col" id="weekly-calendar-card">
              <h3 className="font-display font-extrabold text-slate-900 text-lg mb-5 flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                Lịch dạy tuần này
              </h3>
              
              <div className="space-y-4 flex-1">
                {mockWeeklyCalendar.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl flex items-start gap-3.5 transition-all duration-150 group">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white text-[10px] font-mono font-extrabold px-2.5 py-1.5 rounded-lg shrink-0 shadow-xs">
                      {item.day}
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">
                        {item.period} • <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-mono text-[10px]">{item.class}</span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{item.topic}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Phân môn: {item.subject}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-slate-50/50 rounded-xl text-xs text-slate-500 border border-slate-150 leading-relaxed font-medium">
                * Lịch giảng dạy được đồng bộ tự động dựa trên biên chế chương trình của Bộ GD&ĐT cùng phân môn môn <strong className="text-emerald-700 font-bold">Công nghệ</strong> mới.
              </div>
            </div>
          </div>

          {/* Danh sách giáo án hiện có */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-5" id="lesson-plans-list-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-slate-900 text-xl tracking-tight">Không gian bài soạn cá nhân</h3>
                <p className="text-xs text-slate-500 font-medium">Quản lý và cập nhật hồ sơ giáo án 8 phần chuẩn Bộ Giáo dục</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md shadow-emerald-600/15 hover:shadow-lg transition-all duration-150 shrink-0 gap-2 cursor-pointer border border-emerald-600/30"
                id="btn-create-new"
              >
                <Plus className="w-4.5 h-4.5" />
                Soạn giáo án mới
              </button>
            </div>

            {lessonPlans.length === 0 ? (
              <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <div className="p-4 bg-white rounded-full inline-block shadow-xs border border-slate-100 mb-3.5">
                  <BookOpen className="w-10 h-10 stroke-1.5 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-600">Chưa có bài giảng nào được khởi tạo</p>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">Hãy bấm nút "Soạn giáo án mới" phía trên để tạo bản thảo giáo án 8 phần đầu tiên của bạn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonPlans.map(plan => {
                  const statusInfo = DataStatusLabels[plan.status];
                  const termCheck = checkSubjectTerminology(plan.subject, plan.part4.techniques);
                  
                  return (
                    <div 
                      key={plan.id}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300/80 bg-white hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200/50 px-2.5 py-1 rounded-md">
                            Khối: {plan.grade}
                          </span>
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono border font-bold ${statusInfo.color}`} title={statusInfo.desc}>
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <h4 className="font-display font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 min-h-[44px] group-hover:text-emerald-700 transition-colors leading-snug">
                          {plan.title}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-normal">Môn học</span>
                            <span className="text-slate-800 line-clamp-1 font-bold">{plan.subject}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-normal">Thời lượng</span>
                            <span className="text-slate-800 line-clamp-1 font-bold">{plan.duration}</span>
                          </div>
                        </div>

                        {termCheck.errors.length > 0 ? (
                          <div className="py-1.5 px-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-[10px] flex items-center gap-1.5 font-bold">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>Sai quy chuẩn thuật ngữ GDPT</span>
                          </div>
                        ) : (
                          <div className="py-1.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[10px] flex items-center gap-1.5 font-bold">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                            <span>Chuẩn môn Công nghệ GDPT</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          Xem chi tiết
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleClonePlan(plan)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                            title="Nhân bản bài dạy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditExisting(plan)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                            title="Sửa giáo án"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => checkAndDeductQuota(() => {
                              exportLessonToWord(plan, userQuotaInfo?.planType || 'free');
                              if (onRefreshUser) onRefreshUser();
                            })}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                            title="Tải file Word (.doc)"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        )
      ) : isEditing && formData ? (
        /* ================== TRÌNH SOẠN THẢO GIÁO ÁN 8 PHẦN ================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden" id="editor-view">
          {/* Elegant Editor Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-600/90 text-white text-[10px] font-mono font-bold rounded-lg tracking-wide shadow-xs">
                  KHUNG BỘ GD&ĐT 5512
                </span>
                <span className="text-xs text-slate-400 font-mono">Bài soạn ID: {formData.id}</span>
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-100 leading-tight">
                {formData.part1.lessonTitle || 'Khởi soạn giáo án mới...'}
              </h3>
            </div>
            
            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsPreviewing(selectedPlan ? true : false);
                  localStorage.removeItem('nhip_giang_active_draft');
                  setFormData(selectedPlan ? JSON.parse(JSON.stringify(selectedPlan)) : null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
              >
                {isAdmin ? 'Quay lại' : 'Hủy bỏ'}
              </button>
              {!isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveVersion}
                    className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md transition-all gap-1.5 cursor-pointer"
                    title="Ghi nhận mốc lịch sử phiên bản của bản thảo này"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Lưu phiên bản
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4.5 py-2 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all gap-2 cursor-pointer border border-emerald-500/20"
                    id="btn-save-plan"
                  >
                    <Save className="w-4 h-4" />
                    Lưu giáo án
                  </button>
                </div>
              )}
              {isAdmin && (
                <span className="px-3.5 py-2 bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-bold rounded-xl">
                  Chế độ Xem (Admin)
                </span>
              )}
            </div>
          </div>

          {/* Cảnh báo trong trình soạn thảo - Dynamic Warning Banner */}
          {hasWarning && (
            <div className="bg-amber-50/80 text-amber-950 border-b border-amber-100 px-5 sm:px-6 py-4 text-xs flex items-start gap-3 animate-fade-in" id="soft-warning-alert-banner">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-amber-950 block font-bold tracking-wider uppercase text-[10px]">Cảnh báo quy chuẩn giáo khoa sư phạm:</strong>
                <p className="leading-relaxed font-semibold">
                  {warningMessage}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 min-h-[500px]">
            {/* Adaptive Stepper (Horizontal on mobile, vertical sidebar on PC) */}
            <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200/80 p-4 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:space-y-1 md:col-span-1 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth snap-x">
              <div className="hidden md:block text-[10px] font-extrabold text-slate-400 tracking-wider uppercase px-2.5 mb-3">
                CẤU TRÚC 8 PHẦN
              </div>
              
              {[
                { step: 1, name: 'I. Thông tin chung' },
                { step: 2, name: 'II. Yêu cầu đạt' },
                { step: 3, name: 'III. Thiết bị học liệu' },
                { step: 4, name: 'IV. Phương pháp dạy' },
                { step: 5, name: 'V. Tiến trình dạy' },
                { step: 6, name: 'VI. Kiểm tra đánh giá' },
                { step: 7, name: 'VII. Phân hóa học sinh' },
                { step: 8, name: 'VIII. Điều chỉnh' },
              ].map(tab => (
                <button
                  key={tab.step}
                  onClick={() => setActiveFormTab(tab.step)}
                  className={`shrink-0 md:shrink snap-center text-left px-3.5 py-2.5 text-xs rounded-xl font-bold transition-all flex items-center gap-2 border-b-2 md:border-b-0 md:border-l-3 border-transparent cursor-pointer ${
                    activeFormTab === tab.step
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-600 font-extrabold shadow-3xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 border ${
                    activeFormTab === tab.step
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {tab.step}
                  </span>
                  <span className="truncate">{tab.name}</span>
                </button>
              ))}
              
              <div className="hidden md:block mt-6 p-4 bg-white rounded-xl border border-slate-200/65 text-[11px] text-slate-500 leading-relaxed shadow-3xs">
                <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[9px]">Nguyên tắc bảo mật Owner Isolation:</span>
                Giáo án này được lưu trữ cô lập, mã hóa cục bộ và chỉ có bạn mới có quyền xem hoặc chỉnh sửa.
              </div>

              {/* Lịch sử phiên bản (Version History Sidebar Box) */}
              <div className="hidden md:block mt-4 p-4 bg-white rounded-xl border border-slate-200/65 shadow-3xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Lịch sử phiên bản
                  </span>
                  <span className="bg-slate-100 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {(formData.versions || []).length} mốc
                  </span>
                </div>
                
                {!(formData.versions && formData.versions.length > 0) ? (
                  <p className="text-[10px] text-slate-400 italic">Chưa ghi nhận mốc lịch sử nào. Hãy lưu phiên bản mới ở thanh công cụ phía trên.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {formData.versions.map((ver) => (
                      <div key={ver.v} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:border-emerald-200 transition-colors">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold text-slate-700">Phiên bản v{ver.v}</span>
                          <span className="text-[8px] text-slate-400 font-mono block">
                            {new Date(ver.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(ver.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRestoreVersion(ver)}
                          className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[9px] font-extrabold text-emerald-700 rounded-md shadow-3xs cursor-pointer transition-all inline-flex items-center gap-0.5"
                          title="Khôi phục phiên bản này"
                        >
                          <RotateCcw className="w-3 h-3" /> Khôi phục
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Nội dung chi tiết Form soạn */}
            <div className="p-6 md:col-span-3 space-y-5 overflow-y-auto max-h-[650px]">
              
              <fieldset disabled={isAdmin} className="space-y-5">
                {/* PHẦN I: THÔNG TIN CHUNG */}
              {activeFormTab === 1 && (
                <div className="space-y-4" id="form-part-1">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần I. Thông tin chung</h4>
                    <p className="text-xs text-slate-500 mt-1">Cấu hình thông tin cơ sở của tiết dạy học.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học áp dụng (Bắt buộc "Công nghệ")</label>
                      <input
                        type="text"
                        value={formData.part1.subjectName}
                        onChange={(e) => updateFormPart('part1', 'subjectName', e.target.value)}
                        placeholder="Công nghệ"
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      />
                      {formData.part1.subjectName.toLowerCase() !== 'công nghệ' && (
                        <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Tên môn học phải chính xác là "Công nghệ"
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Khối lớp học áp dụng</label>
                      <select
                        value={formData.grade}
                        onChange={(e) => updateFormPart('root', 'grade', e.target.value)}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      >
                        <option value="Lớp 10">Lớp 10</option>
                        <option value="Lớp 11">Lớp 11</option>
                        <option value="Lớp 12">Lớp 12</option>
                        <option value="Lớp 6">Lớp 6</option>
                        <option value="Lớp 7">Lớp 7</option>
                        <option value="Lớp 8">Lớp 8</option>
                        <option value="Lớp 9">Lớp 9</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tên lớp học áp dụng</label>
                      <input
                        type="text"
                        value={formData.part1.className}
                        onChange={(e) => updateFormPart('part1', 'className', e.target.value)}
                        placeholder="Ví dụ: 10A1"
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Thời lượng dạy học (Ví dụ: "2 tiết")</label>
                      <input
                        type="text"
                        value={formData.part1.duration}
                        onChange={(e) => updateFormPart('part1', 'duration', e.target.value)}
                        placeholder="Ví dụ: 2 tiết (90 phút)"
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tiêu đề bài dạy chính thức</label>
                      <input
                        type="text"
                        value={formData.part1.lessonTitle}
                        onChange={(e) => updateFormPart('part1', 'lessonTitle', e.target.value)}
                        placeholder="Ví dụ: Bài 1: Khái quát về Công nghệ"
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại học liệu</label>
                      <select
                        value={formData.classification}
                        onChange={(e) => updateFormPart('root', 'classification', e.target.value)}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      >
                        {Object.entries(LessonClassificationLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN II: YÊU CẦU CẦN ĐẠT */}
              {activeFormTab === 2 && (
                <div className="space-y-4" id="form-part-2">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần II. Yêu cầu cần đạt</h4>
                    <p className="text-xs text-slate-500 mt-1">Đảm bảo mục tiêu đầu ra năng lực của học sinh.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">1. Kiến thức, kĩ năng đạt được</label>
                      <textarea
                        value={formData.part2.knowledgeAndSkills}
                        onChange={(e) => updateFormPart('part2', 'knowledgeAndSkills', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Nhập kiến thức trọng tâm học sinh cần tiếp thụ..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">2. Năng lực chung phát triển</label>
                      <textarea
                        value={formData.part2.generalCapacity}
                        onChange={(e) => updateFormPart('part2', 'generalCapacity', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Tự chủ tự học, giao tiếp hợp tác nhóm..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">3. Năng lực đặc thù phân môn</label>
                      <textarea
                        value={formData.part2.specificCapacity}
                        onChange={(e) => updateFormPart('part2', 'specificCapacity', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Nhận thức công nghệ, đánh giá thiết kế..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">4. Phẩm chất giáo dục</label>
                      <textarea
                        value={formData.part2.qualities}
                        onChange={(e) => updateFormPart('part2', 'qualities', e.target.value)}
                        rows={2}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Chăm chỉ học hỏi công nghệ, trách nhiệm bảo vệ môi trường..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">5. Minh chứng đánh giá</label>
                      <textarea
                        value={formData.part2.evaluationEvidence}
                        onChange={(e) => updateFormPart('part2', 'evaluationEvidence', e.target.value)}
                        rows={2}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Phiếu bài tập số 1, Sơ đồ tư duy học sinh tự hoàn thiện..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN III: THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU */}
              {activeFormTab === 3 && (
                <div className="space-y-4" id="form-part-3">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần III. Thiết bị dạy học và học liệu</h4>
                    <p className="text-xs text-slate-500 mt-1">Đăng ký thiết bị và học liệu sử dụng trong tiết dạy (Phải ghi nguồn rõ ràng).</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Học liệu, đồ dùng dạy học dành cho Giáo viên</label>
                      <textarea
                        value={formData.part3.teacherEquipment}
                        onChange={(e) => updateFormPart('part3', 'teacherEquipment', e.target.value)}
                        rows={2.5}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Bài giảng điện tử, máy sấy tóc mô phỏng..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Đồ dùng học tập dành cho Học sinh</label>
                      <textarea
                        value={formData.part3.studentEquipment}
                        onChange={(e) => updateFormPart('part3', 'studentEquipment', e.target.value)}
                        rows={2.5}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Giấy vẽ kỹ thuật A4, thước kẻ, viết chì..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nguồn gốc tư liệu học liệu (Bắt buộc)</label>
                        <input
                          type="text"
                          value={formData.part3.sources}
                          onChange={(e) => updateFormPart('part3', 'sources', e.target.value)}
                          placeholder="Ví dụ: SGK Công nghệ 10 bộ Kết nối tri thức..."
                          className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Giấy phép sở hữu / Bản quyền (License)</label>
                        <input
                          type="text"
                          value={formData.part3.copyrightLicense}
                          onChange={(e) => updateFormPart('part3', 'copyrightLicense', e.target.value)}
                          placeholder="Ví dụ: Miễn phí giáo dục (CC BY-NC 4.0)"
                          className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN IV: PHƯƠNG PHÁP VÀ KĨ THUẬT DẠY HỌC */}
              {activeFormTab === 4 && (
                <div className="space-y-4" id="form-part-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần IV. Phương pháp và kĩ thuật dạy học</h4>
                    <p className="text-xs text-slate-500 mt-1">Lựa chọn giải pháp sư phạm chuẩn hóa.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phương pháp dạy học chủ đạo</label>
                      <input
                        type="text"
                        value={formData.part4.methods}
                        onChange={(e) => updateFormPart('part4', 'methods', e.target.value)}
                        placeholder="Ví dụ: Dạy học hợp tác nhóm, giải quyết vấn đề..."
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Kĩ thuật dạy học sư phạm chuyên dụng</label>
                      <input
                        type="text"
                        value={formData.part4.techniques}
                        onChange={(e) => updateFormPart('part4', 'techniques', e.target.value)}
                        placeholder="Ví dụ: Kĩ thuật khăn trải bàn, kĩ thuật mảnh ghép..."
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      />
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        * Chỉ ghi các cụm từ thuật ngữ phương pháp như "kĩ thuật mảnh ghép", "kĩ thuật động não". Không dùng từ "kĩ thuật" để lồng vào làm sai tên môn học.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN V: TIẾN TRÌNH DẠY HỌC (4 HOẠT ĐỘNG CHIA NHỎ) */}
              {activeFormTab === 5 && (
                <div className="space-y-6" id="form-part-5">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần V. Tiến trình dạy học</h4>
                    <p className="text-xs text-slate-500 mt-1">Tiến trình bắt buộc phải bao gồm 4 hoạt động cơ bản. Mỗi hoạt động chia nhỏ thành 4 trường bắt buộc.</p>
                  </div>

                  {/* Accordion cho từng Hoạt động */}
                  {['warmup', 'exploration', 'practice', 'application'].map((actKey, idx) => {
                    const titles = {
                      warmup: '1. Hoạt động Khởi động (Xác định vấn đề học tập)',
                      exploration: '2. Hoạt động Hình thành kiến thức mới (Giải quyết vấn đề)',
                      practice: '3. Hoạt động Luyện tập thực hành',
                      application: '4. Hoạt động Vận dụng mở rộng thực tế',
                    };
                    
                    // @ts-ignore
                    const actData = formData.part5[actKey];

                    return (
                      <div key={actKey} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                        <h5 className="font-display font-bold text-slate-800 text-sm border-b border-slate-200 pb-1.5">
                          {/* @ts-ignore */}
                          {titles[actKey]}
                        </h5>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Mục tiêu hoạt động</label>
                            <input
                              type="text"
                              value={actData.target}
                              // @ts-ignore
                              onChange={(e) => updateProgression(actKey, 'target', e.target.value)}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                              placeholder="Mục tiêu hướng tới..."
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Nội dung học tập</label>
                            <textarea
                              value={actData.content}
                              // @ts-ignore
                              onChange={(e) => updateProgression(actKey, 'content', e.target.value)}
                              rows={2}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                              placeholder="Nhiệm vụ học sinh cần làm..."
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Sản phẩm học tập mong đợi</label>
                            <textarea
                              value={actData.product}
                              // @ts-ignore
                              onChange={(e) => updateProgression(actKey, 'product', e.target.value)}
                              rows={1.5}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                              placeholder="Kết quả thực tế học sinh thu về..."
                            />
                          </div>

                          {/* Tổ chức thực hiện 4 bước */}
                          <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 space-y-2.5">
                            <span className="block text-[11px] font-bold text-emerald-700 tracking-wider uppercase mb-1">
                              Tổ chức thực hiện (4 Bước sư phạm bắt buộc)
                            </span>
                            
                            <div className="grid grid-cols-1 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bước 1. Chuyển giao nhiệm vụ</label>
                                <textarea
                                  value={actData.execution.transfer}
                                  // @ts-ignore
                                  onChange={(e) => updateProgression(actKey, '', e.target.value, true, 'transfer')}
                                  rows={1.5}
                                  className="w-full text-xs p-2 rounded-md border border-slate-100 bg-slate-50/50"
                                  placeholder="GV giao bài như thế nào..."
                                />
                              </div>
                              
                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bước 2. Thực hiện nhiệm vụ</label>
                                <textarea
                                  value={actData.execution.perform}
                                  // @ts-ignore
                                  onChange={(e) => updateProgression(actKey, '', e.target.value, true, 'perform')}
                                  rows={1.5}
                                  className="w-full text-xs p-2 rounded-md border border-slate-100 bg-slate-50/50"
                                  placeholder="HS thảo luận/làm bài ra sao..."
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bước 3. Báo cáo, thảo luận</label>
                                <textarea
                                  value={actData.execution.report}
                                  // @ts-ignore
                                  onChange={(e) => updateProgression(actKey, '', e.target.value, true, 'report')}
                                  rows={1.5}
                                  className="w-full text-xs p-2 rounded-md border border-slate-100 bg-slate-50/50"
                                  placeholder="HS trình bày kết quả ra sao..."
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Bước 4. Kết luận, nhận định</label>
                                <textarea
                                  value={actData.execution.conclude}
                                  // @ts-ignore
                                  onChange={(e) => updateProgression(actKey, '', e.target.value, true, 'conclude')}
                                  rows={1.5}
                                  className="w-full text-xs p-2 rounded-md border border-slate-100 bg-slate-50/50"
                                  placeholder="GV chốt kiến thức như thế nào..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PHẦN VI: KIỂM TRA ĐÁNH GIÁ */}
              {activeFormTab === 6 && (
                <div className="space-y-4" id="form-part-6">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần VI. Kiểm tra, đánh giá</h4>
                    <p className="text-xs text-slate-500 mt-1">Xác lập tiêu chuẩn đo lường năng lực người học.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phương án đánh giá chẩn đoán / Thường xuyên trong tiết học</label>
                      <textarea
                        value={formData.part6.diagnostic}
                        onChange={(e) => updateFormPart('part6', 'diagnostic', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Đánh giá bằng câu hỏi gợi mở, chấm điểm phiếu thảo luận..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phương án đánh giá tổng kết / Định kỳ</label>
                      <textarea
                        value={formData.part6.formative}
                        onChange={(e) => updateFormPart('part6', 'formative', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Kiểm tra thu hoạch thực hành vẽ kỹ thuật, làm mô hình thực tế..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN VII: PHÂN HÓA HỌC SINH */}
              {activeFormTab === 7 && (
                <div className="space-y-4" id="form-part-7">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần VII. Phân hóa đối tượng học sinh</h4>
                    <p className="text-xs text-slate-500 mt-1">Đảm bảo tính đại chúng và thúc đẩy tính mũi nhọn giáo dục.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Giải pháp hỗ trợ học sinh yếu/kém hoặc gặp khó khăn</label>
                      <textarea
                        value={formData.part7.remedial}
                        onChange={(e) => updateFormPart('part7', 'remedial', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Cung cấp bản vẽ mẫu thô, hướng dẫn trực quan 1-1..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Giải pháp bồi dưỡng học sinh khá/giỏi và phát triển tư duy sáng tạo</label>
                      <textarea
                        value={formData.part7.enrichment}
                        onChange={(e) => updateFormPart('part7', 'enrichment', e.target.value)}
                        rows={3}
                        className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                        placeholder="Ví dụ: Tìm hiểu mạch smart-home thông minh, vẽ linh kiện phức tạp..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN VIII: GHI CHÚ ĐIỀU CHỈNH */}
              {activeFormTab === 8 && (
                <div className="space-y-4" id="form-part-8">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-display font-bold text-slate-900 text-base">Phần VIII. Ghi chú / Điều chỉnh sau tiết dạy</h4>
                    <p className="text-xs text-slate-500 mt-1">Rút kinh nghiệm sư phạm thực hành.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nội dung ghi chép, phản tư của giáo viên sau buổi học</label>
                    <textarea
                      value={formData.part8.notes}
                      onChange={(e) => updateFormPart('part8', 'notes', e.target.value)}
                      rows={5}
                      className="w-full text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-emerald-600 bg-white"
                      placeholder="Ghi nhận điểm tốt, điểm cần thay đổi về thời lượng hoặc cách tổ chức..."
                    />
                  </div>
                </div>
              )}

              </fieldset>

              {/* Phím bấm di chuyển qua các phân đoạn */}
              <div className="border-t border-slate-200 pt-5 flex items-center justify-between">
                <button
                  type="button"
                  disabled={activeFormTab === 1}
                  onClick={() => setActiveFormTab(prev => Math.max(1, prev - 1))}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg disabled:opacity-40"
                >
                  Phần trước
                </button>

                <button
                  type="button"
                  disabled={activeFormTab === 8}
                  onClick={() => setActiveFormTab(prev => Math.min(8, prev + 1))}
                  className="px-3.5 py-1.5 text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg disabled:opacity-40 font-semibold"
                >
                  Phần tiếp theo
                </button>
              </div>

            </div>
          </div>
        </div>
      ) : isPreviewing && formData ? (
        /* ================== TRÌNH XEM TRƯỚC VÀ XUẤT GIÁO ÁN (PREVIEW) ================== */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-fade-in" id="preview-view">
          {/* High-Fidelity Preview Header */}
          <div className="bg-slate-50 p-5 border-b border-slate-200/85 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-lg border border-emerald-200/60 shadow-3xs uppercase tracking-wider">
                  Xem trước giáo án chuẩn
                </span>
                <span className="text-xs text-slate-500 font-mono">Nhãn dữ liệu: <strong className="text-slate-800 font-bold">{formData.status.toUpperCase()}</strong></span>
              </div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                {formData.part1.lessonTitle}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsPreviewing(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                Về danh sách
              </button>
              <button
                onClick={() => handleEditExisting(formData)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 rounded-xl transition-all cursor-pointer"
              >
                Chỉnh sửa
              </button>
              <button
                onClick={() => checkAndDeductQuota(() => {
                  exportLessonToWord(formData, userQuotaInfo?.planType || 'free');
                  if (onRefreshUser) onRefreshUser();
                })}
                className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs px-4.5 py-2 rounded-xl shadow-md shadow-emerald-600/15 hover:shadow-lg transition-all gap-2 cursor-pointer border border-emerald-600/20"
                id="btn-export-word-preview"
              >
                <Download className="w-4 h-4" />
                Xuất file Word
              </button>
            </div>
          </div>

          {/* Chi tiết nội dung giáo án dạng trang giấy 5512 - Immersive floating paper workspace */}
          <div className="bg-slate-100/50 p-4 sm:p-8 md:p-12">
            <div className="p-5 sm:p-10 md:p-14 max-w-4xl mx-auto space-y-8 bg-white border border-slate-200/80 shadow-lg rounded-2xl" id="lesson-paper-preview">
            
            <div className="text-center font-display uppercase tracking-wider text-xs border-b border-slate-100 pb-3 text-slate-400">
              CỔNG HIỂN THỊ CHUẨN KẾ HOẠCH BÀI DẠY VIỆT NAM
            </div>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-1/2 text-center text-sm font-semibold text-slate-600">
                    TRƯỜNG: ...........................................<br />
                    TỔ BỘ MÔN: .......................................
                  </td>
                  <td className="w-1/2 text-center text-sm text-slate-800">
                    <strong className="block text-xs uppercase tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong>
                    <span className="text-xs font-semibold block mt-1">Độc lập - Tự do - Hạnh phúc</span>
                    <span className="block mt-1 text-[10px] text-slate-400">-------------------------------------</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-center space-y-2 pt-4">
              <h2 className="font-display font-bold text-2xl text-slate-900 uppercase">KẾ HOẠCH BÀI DẠY</h2>
              <p className="text-sm font-semibold text-slate-700">
                MÔN HỌC: {formData.part1.subjectName.toUpperCase()} - Khối {formData.grade}
              </p>
              <p className="text-base font-bold text-slate-900">
                TÊN BÀI: {formData.part1.lessonTitle}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Thời lượng thực hiện: {formData.part1.duration}
              </p>
            </div>

            {/* Chi tiết 8 Phần */}
            <div className="space-y-6 pt-4 text-sm text-slate-800 leading-relaxed">
              
              {/* PHẦN I */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">I. THÔNG TIN CHUNG</h4>
                <div className="pl-4 space-y-1">
                  <p>• <strong>Lớp học áp dụng:</strong> {formData.part1.className}</p>
                  <p>• <strong>Môn học chính thức chuẩn mới:</strong> {formData.part1.subjectName}</p>
                  <p>• <strong>Bài học:</strong> {formData.part1.lessonTitle}</p>
                  <p>• <strong>Thời lượng:</strong> {formData.part1.duration}</p>
                </div>
              </div>

              {/* PHẦN II */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">II. YÊU CẦU CẦN ĐẠT</h4>
                <div className="pl-4 space-y-3">
                  <div>
                    <h5 className="font-semibold text-slate-800">1. Kiến thức, kĩ năng:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part2.knowledgeAndSkills}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800">2. Năng lực chung:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part2.generalCapacity}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800">3. Năng lực đặc thù:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part2.specificCapacity}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800">4. Phẩm chất:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part2.qualities}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800">5. Minh chứng đánh giá:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part2.evaluationEvidence}</p>
                  </div>
                </div>
              </div>

              {/* PHẦN III */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">III. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h4>
                <div className="pl-4 space-y-3">
                  <div>
                    <h5 className="font-semibold text-slate-800">1. Đồ dùng dạy học của Giáo viên:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part3.teacherEquipment}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-800">2. Thiết bị, đồ dùng học tập của Học sinh:</h5>
                    <p className="pl-2 text-slate-600 whitespace-pre-line">{formData.part3.studentEquipment}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Nguồn gốc học liệu:</span>
                      <span className="text-sm font-medium text-slate-800">{formData.part3.sources}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Bản quyền / Giấy phép:</span>
                      <span className="text-sm font-medium text-slate-800">{formData.part3.copyrightLicense}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PHẦN IV */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">IV. PHƯƠNG PHÁP VÀ KĨ THUẬT DẠY HỌC</h4>
                <div className="pl-4 space-y-1">
                  <p>• <strong>Phương pháp chủ đạo:</strong> {formData.part4.methods}</p>
                  <p>• <strong>Kĩ thuật giảng dạy sư phạm:</strong> {formData.part4.techniques}</p>
                </div>
              </div>

              {/* PHẦN V */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">V. TIẾN TRÌNH DẠY HỌC</h4>
                <div className="pl-2 space-y-4">
                  {['warmup', 'exploration', 'practice', 'application'].map((actKey, idx) => {
                    const titles = {
                      warmup: 'Hoạt động 1: Khởi động (Mở đầu / Xác định nhiệm vụ)',
                      exploration: 'Hoạt động 2: Hình thành kiến thức mới (Giải quyết vấn đề)',
                      practice: 'Hoạt động 3: Luyện tập',
                      application: 'Hoạt động 4: Vận dụng',
                    };
                    // @ts-ignore
                    const act = formData.part5[actKey];

                    return (
                      <div key={actKey} className="border border-slate-200 bg-slate-50/50 rounded-lg p-4 space-y-2.5">
                        {/* @ts-ignore */}
                        <h5 className="font-bold text-slate-900 text-sm">{titles[actKey]}</h5>
                        <p className="text-xs text-slate-700"><strong>• Mục tiêu:</strong> {act.target}</p>
                        <p className="text-xs text-slate-700"><strong>• Nội dung:</strong> {act.content}</p>
                        <p className="text-xs text-slate-700"><strong>• Sản phẩm học tập:</strong> {act.product}</p>
                        
                        <div className="bg-white p-3 rounded-lg border border-slate-100 text-xs space-y-1.5 mt-2">
                          <strong className="text-emerald-800 text-[11px] block mb-1 uppercase tracking-wider">Tổ chức thực hiện:</strong>
                          <p><strong>- Chuyển giao:</strong> {act.execution.transfer}</p>
                          <p><strong>- Thực hiện:</strong> {act.execution.perform}</p>
                          <p><strong>- Báo cáo:</strong> {act.execution.report}</p>
                          <p><strong>- Kết luận:</strong> {act.execution.conclude}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN VI */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">VI. KIỂM TRA, ĐÁNH GIÁ</h4>
                <div className="pl-4 space-y-2">
                  <p>• <strong>Đánh giá chẩn đoán/Thường xuyên:</strong></p>
                  <p className="pl-3 text-slate-600 whitespace-pre-line">{formData.part6.diagnostic}</p>
                  <p className="mt-2">• <strong>Đánh giá định kỳ:</strong></p>
                  <p className="pl-3 text-slate-600 whitespace-pre-line">{formData.part6.formative}</p>
                </div>
              </div>

              {/* PHẦN VII */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">VII. PHÂN HÓA ĐỐI TƯỢNG HỌC SỐ</h4>
                <div className="pl-4 space-y-2">
                  <p>• <strong>Hỗ trợ học sinh yếu, kém:</strong></p>
                  <p className="pl-3 text-slate-600 whitespace-pre-line">{formData.part7.remedial}</p>
                  <p className="mt-2">• <strong>Phát triển học sinh khá, giỏi:</strong></p>
                  <p className="pl-3 text-slate-600 whitespace-pre-line">{formData.part7.enrichment}</p>
                </div>
              </div>

              {/* PHẦN VIII */}
              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">VIII. GHI CHÚ / ĐIỀU CHỈNH SAU TIẾT DẠY</h4>
                <div className="pl-4">
                  <p className="text-slate-600 whitespace-pre-line">{formData.part8.notes}</p>
                </div>
              </div>

            </div>

            {/* Chân trang cảnh báo */}
            <div className="border-t border-slate-200 pt-6 text-center text-[11px] text-slate-500 space-y-1 pb-4 leading-relaxed">
              <p className="font-semibold text-slate-700 uppercase tracking-wider">Nhịp Giảng - Hệ Sinh Thái Giáo Án Điện Tử Độc Lập</p>
              <p>Mã hóa chủ sở hữu: {formData.ownerId} | Bảo mật offline-first chuẩn P0</p>
              <p className="text-amber-700 font-medium bg-amber-50 inline-block px-3 py-1 rounded-full border border-amber-200 mt-2">
                Cảnh báo tác quyền: Nội dung giáo lý chỉ mang tính chất tham khảo sư phạm. Giáo viên chịu trách nhiệm kiểm duyệt trước khi đưa vào giảng dạy.
              </p>
            </div>
          </div>
          </div>
        </div>
      ) : null}

      {/* Soft Quota Alert Dialog */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in" id="quota-warning-dialog">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-in text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-slate-900 text-lg">Hạn Ngạch Tuần Đã Hết!</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Hạn ngạch xuất bản file trong tuần của thầy/cô đã hết. Vui lòng nâng cấp lên gói <strong className="text-emerald-700 font-bold">Pro Early</strong> hoặc đợi hệ thống làm mới hạn ngạch vào tuần kế tiếp.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setShowQuotaModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-xs font-bold cursor-pointer"
              >
                Để sau
              </button>
              <button
                onClick={() => {
                  setShowQuotaModal(false);
                  if (onNavigateToPlans) {
                    onNavigateToPlans();
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all cursor-pointer border border-emerald-600/20"
              >
                Trải nghiệm Pro Early
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
