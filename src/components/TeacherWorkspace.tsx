/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LessonPlan, DataStatus, DataStatusLabels, LessonClassification, LessonClassificationLabels } from '../types';
import { checkSubjectTerminology, createEmptyScaffold } from '../lib/templates';
import { exportLessonToWord } from '../lib/exporter';
import { useRuleValidator } from '../hooks/useRuleValidator';
import { 
  Calendar, BookOpen, Plus, Download, ChevronRight, FileText, 
  HelpCircle, AlertTriangle, AlertCircle, Save, X, Edit3, Eye, CheckCircle 
} from 'lucide-react';

interface TeacherWorkspaceProps {
  lessonPlans: LessonPlan[];
  onAddPlan: (plan: LessonPlan) => void;
  onUpdatePlan: (plan: LessonPlan) => void;
  activeTeacherId: string;
}

export default function TeacherWorkspace({ lessonPlans, onAddPlan, onUpdatePlan, activeTeacherId }: TeacherWorkspaceProps) {
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

  // Xử lý tạo giáo án mới
  const handleCreateNew = () => {
    const newScaffold = createEmptyScaffold(activeTeacherId);
    setFormData(newScaffold);
    setSelectedPlan(null);
    setIsEditing(true);
    setIsPreviewing(false);
    setActiveFormTab(1);
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
    <div className="space-y-6" id="teacher-workspace-container">
      {/* Cảnh báo cứng luôn xuất hiện trên đỉnh trang học tập theo yêu cầu pháp lý */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4.5 text-xs flex items-start gap-3.5 shadow-xs" id="fixed-legal-advisory">
        <div className="bg-amber-100 p-1.5 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-700" />
        </div>
        <div className="space-y-0.5">
          <span className="font-bold text-amber-950 uppercase tracking-wider block text-[10px]">
            Thông báo Pháp lý & Nghiệm vụ Bắt buộc
          </span>
          <p className="text-amber-900/90 leading-relaxed font-semibold">
            Nội dung hiển thị là dữ liệu mẫu / tham chiếu sư phạm theo chuẩn. Giáo viên bắt buộc phải tự rà soát, điều chỉnh thực tế dựa trên điều kiện giáo dục của nhà trường trước khi triển khai giảng dạy chính thức.
          </p>
        </div>
      </div>

      {!isEditing && !isPreviewing ? (
        /* ================== GIAO DIỆN DASHBOARD GIÁO VIÊN ================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-view">
          
          {/* Lịch tuần cơ bản */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 flex flex-col" id="weekly-calendar-card">
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
                            onClick={() => handleEditExisting(plan)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100"
                            title="Sửa giáo án"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => exportLessonToWord(plan)}
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
                <button
                  onClick={handleSave}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4.5 py-2 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all gap-2 cursor-pointer border border-emerald-500/20"
                  id="btn-save-plan"
                >
                  <Save className="w-4 h-4" />
                  Lưu giáo án
                </button>
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
                onClick={() => exportLessonToWord(formData)}
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
    </div>
  );
}
