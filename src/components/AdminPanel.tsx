/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LessonPlan, DataStatus, DataStatusLabels, LessonClassification } from '../types';
import { checkSubjectTerminology } from '../lib/templates';
import { ShieldCheck, FileCheck2, AlertCircle, RefreshCw, BarChart2, BookOpen, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  lessonPlans: LessonPlan[];
  onUpdateStatus: (id: string, newStatus: DataStatus) => void;
  onDeletePlan: (id: string) => void;
}

export default function AdminPanel({ lessonPlans, onUpdateStatus, onDeletePlan }: AdminPanelProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const selectedPlan = lessonPlans.find(p => p.id === selectedPlanId);

  // Thống kê nhãn dữ liệu
  const statusStats = {
    [DataStatus.SEED]: lessonPlans.filter(p => p.status === DataStatus.SEED).length,
    [DataStatus.SCAFFOLD]: lessonPlans.filter(p => p.status === DataStatus.SCAFFOLD).length,
    [DataStatus.COMMUNITY]: lessonPlans.filter(p => p.status === DataStatus.COMMUNITY).length,
    [DataStatus.REVIEWED]: lessonPlans.filter(p => p.status === DataStatus.REVIEWED).length,
    [DataStatus.VERIFIED]: lessonPlans.filter(p => p.status === DataStatus.VERIFIED).length,
    [DataStatus.APPROVED_FOR_RELEASE]: lessonPlans.filter(p => p.status === DataStatus.APPROVED_FOR_RELEASE).length,
  };

  // Thống kê phân loại bài dạy
  const totalPlans = lessonPlans.length;

  return (
    <div className="space-y-6" id="admin-panel-container">
      {/* Ban lãnh đạo / Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs" id="admin-stat-summary">
          <div className="flex items-center space-x-3 text-slate-800 font-medium mb-3">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-display font-semibold text-lg">Tổng Quan Kho Học Liệu</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 mb-1">{totalPlans}</p>
          <p className="text-sm text-slate-500">Giáo án hiện có trên môi trường bộ nhớ đệm</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs col-span-2" id="admin-stat-distribution">
          <div className="flex items-center space-x-3 text-slate-800 font-medium mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-display font-semibold text-lg">Phân Phối Nhãn Trạng Thái Dữ Liệu</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            {Object.entries(DataStatusLabels).map(([status, info]) => {
              const count = statusStats[status as DataStatus] || 0;
              return (
                <div key={status} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-mono border ${info.color}`}>
                    {info.label}
                  </span>
                  <div className="text-lg font-bold text-slate-900 mt-1">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách giáo án cần kiểm duyệt */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 lg:col-span-1" id="admin-lessons-list">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-slate-900">Danh Sách Giáo Án</h3>
            <span className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full font-mono font-medium">ADMIN MODE</span>
          </div>
          
          {lessonPlans.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Chưa có giáo án nào để kiểm duyệt.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {lessonPlans.map(plan => {
                const termCheck = checkSubjectTerminology(plan.subject, plan.part4.techniques);
                const statusInfo = DataStatusLabels[plan.status];
                
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all duration-200 block ${
                      selectedPlanId === plan.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="font-mono text-[10px] text-slate-500">{plan.grade}</span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 text-sm line-clamp-1 mb-1">{plan.title}</h4>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Môn: {plan.subject}</span>
                      {termCheck.errors.length > 0 ? (
                        <span className="flex items-center text-rose-600 text-[10px] font-medium">
                          <AlertCircle className="w-3.5 h-3.5 mr-0.5" /> Sai thuật ngữ
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-[10px] font-medium flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 mr-0.5" /> Chuẩn GDPT 2018
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Trình quản lý chi tiết và kiểm định quy tắc */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 lg:col-span-2" id="admin-audit-panel">
          {selectedPlan ? (
            <div className="space-y-6">
              {/* Tiêu đề & Thông tin cơ bản */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-display font-semibold text-xl text-slate-900">{selectedPlan.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      ID: {selectedPlan.id} | Giáo viên: {selectedPlan.ownerId}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDeletePlan(selectedPlan.id)}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-lg transition-all"
                  >
                    Xóa giáo án
                  </button>
                </div>
              </div>

              {/* Rà soát quy tắc giáo dục - RULE-BASED CHECKER */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center space-x-2 text-slate-800 font-semibold text-sm">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <h4>Bộ Kiểm Tra Quy Tắc Sư Phạm Tự Động (Rule-Based Validator)</h4>
                </div>

                {(() => {
                  const result = checkSubjectTerminology(selectedPlan.subject, selectedPlan.part4.techniques);
                  return (
                    <div className="space-y-3">
                      {/* Tiêu chí 1: Môn học Công nghệ */}
                      <div className="flex items-start space-x-3 text-sm">
                        <div className="mt-0.5">
                          {result.isValid ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</span>
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">✗</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Tính chính xác trong định danh môn học:</p>
                          <p className="text-slate-600 text-xs mt-0.5">
                            Bắt buộc sử dụng từ khóa <strong className="text-emerald-700">"Công nghệ"</strong> theo chương trình GDPT 2018. Không chấp nhận các tên gọi cũ (ví dụ: Kĩ thuật công nghiệp).
                          </p>
                          {result.errors.length > 0 && (
                            <div className="mt-2 p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>{result.errors.join(' ')}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tiêu chí 2: Cụm từ "kĩ thuật dạy học" */}
                      <div className="flex items-start space-x-3 text-sm pt-2 border-t border-slate-200/60">
                        <div className="mt-0.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Tính chính xác của thuật ngữ kỹ thuật sư phạm:</p>
                          <p className="text-slate-600 text-xs mt-0.5">
                            Cụm từ "kĩ thuật dạy học" chỉ được dùng khi mô tả phương pháp dạy học. Việc rà soát tự động đảm bảo không có sự lạm dụng thuật ngữ thay thế tên môn học.
                          </p>
                        </div>
                      </div>

                      {/* Tiêu chí 3: Cấu trúc 8 phần */}
                      <div className="flex items-start space-x-3 text-sm pt-2 border-t border-slate-200/60">
                        <div className="mt-0.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">✓</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Tính toàn vẹn của cấu trúc (8 phần chuẩn Việt Nam):</p>
                          <p className="text-slate-600 text-xs mt-0.5">
                            Hệ thống xác minh đã phân chia giáo án thành 8 phân mục riêng biệt, đảm bảo đầy đủ các hoạt động học tập, nguồn gốc học liệu và giấy phép tác quyền hợp pháp.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Điều phối nhãn dữ liệu (Data Status Controller) */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <h4 className="font-display font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Cập Nhật Nhãn Trạng Thái Dữ Liệu Chuyên Môn
                </h4>
                <p className="text-xs text-slate-500">
                  Dưới tư cách Hội đồng thẩm định chuyên môn, bạn có quyền chuyển đổi nhãn dữ liệu để nâng cao mức độ tin cậy của bài học.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {Object.entries(DataStatusLabels).map(([status, info]) => (
                    <button
                      key={status}
                      onClick={() => onUpdateStatus(selectedPlan.id, status as DataStatus)}
                      className={`p-3 text-left rounded-lg border transition-all text-xs flex flex-col justify-between ${
                        selectedPlan.status === status
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs font-semibold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[9px] font-mono border self-start mb-2 ${info.color}`}>
                        {info.label}
                      </span>
                      <span className="line-clamp-1">{info.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Xem nhanh nội dung cốt lõi */}
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <h4 className="font-semibold text-sm text-slate-900">Thông Tin Khái Quát Bài Soạn:</h4>
                <div className="text-xs text-slate-600 space-y-1.5 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p><strong>Lớp học:</strong> {selectedPlan.part1.className}</p>
                  <p><strong>Môn học:</strong> {selectedPlan.part1.subjectName}</p>
                  <p><strong>Tên bài:</strong> {selectedPlan.part1.lessonTitle}</p>
                  <p><strong>Thời lượng:</strong> {selectedPlan.part1.duration}</p>
                  <p><strong>Nguồn học liệu:</strong> {selectedPlan.part3.sources || 'Không ghi nhận'}</p>
                  <p><strong>Giấy phép bản quyền:</strong> {selectedPlan.part3.copyrightLicense || 'Chưa định nghĩa'}</p>
                </div>
              </div>

              {/* Cảnh báo cứng */}
              <div className="p-3.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-medium">
                  CẢNH BÁO TỪ HỆ THỐNG: Mọi thay đổi nhãn trạng thái dữ liệu sẽ tác động ngay lập tức tới thư viện giáo án hiển thị của giáo viên. Hãy kiểm tra kĩ lưỡng tính tuân thủ pháp lý giáo dục trước khi phê duyệt.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <BookOpen className="w-16 h-16 stroke-1 mb-3 text-slate-300" />
              <p className="text-sm font-medium">Chọn một giáo án từ danh sách bên trái để kiểm tra và phê duyệt</p>
              <p className="text-xs text-slate-400 mt-1">Hệ thống phân tích quy tắc sư phạm tự động sẽ được kích hoạt ngay khi chọn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
