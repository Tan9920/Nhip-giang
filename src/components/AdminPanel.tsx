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
  activeSession: string;
}

export default function AdminPanel({ lessonPlans, onUpdateStatus, onDeletePlan, activeSession }: AdminPanelProps) {
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="admin-stat-summary">
          <div className="flex items-center space-x-3 text-slate-800 font-bold mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-display font-extrabold text-slate-900 text-lg">Kho Học Liệu Số</h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 mb-1">{totalPlans}</p>
          <p className="text-xs text-slate-500 font-medium">Kế hoạch bài giảng trong bộ nhớ đệm</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-2" id="admin-stat-distribution">
          <div className="flex items-center space-x-3 text-slate-800 font-bold mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-display font-extrabold text-slate-900 text-lg">Trạng Thái Thẩm Định Giáo Án</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
            {Object.entries(DataStatusLabels).map(([status, info]) => {
              const count = statusStats[status as DataStatus] || 0;
              return (
                <div key={status} className="p-3 bg-slate-50 hover:bg-slate-50/80 border border-slate-100 rounded-xl transition-all shadow-3xs flex flex-col justify-between">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-mono border font-bold ${info.color}`}>
                    {info.label}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-2">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách giáo án cần kiểm duyệt */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1" id="admin-lessons-list">
          <div className="flex items-center justify-between mb-5 pb-1 border-b border-slate-100">
            <h3 className="font-display font-extrabold text-slate-900 text-lg">Phiếu thẩm định</h3>
            <span className="px-2.5 py-1 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200/50 rounded-full font-sans font-bold uppercase tracking-wider">
              Chế độ Thẩm định
            </span>
          </div>
          
          {lessonPlans.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 stroke-1.5 mb-2" />
              <p className="text-xs font-bold">Chưa có giáo án để kiểm duyệt</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {lessonPlans.map(plan => {
                const termCheck = checkSubjectTerminology(plan.subject, plan.part4.techniques);
                const statusInfo = DataStatusLabels[plan.status];
                
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-150 block cursor-pointer ${
                      selectedPlanId === plan.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/30 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">Khối: {plan.grade}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono border font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-2 leading-snug">{plan.title}</h4>
                    
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100/50">
                      <span className="text-slate-500 font-semibold truncate max-w-[120px]">Môn: {plan.subject}</span>
                      {termCheck.errors.length > 0 ? (
                        <span className="flex items-center text-rose-700 text-[10px] font-bold">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-rose-600" /> Sai chuẩn
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[10px] font-bold flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0 text-emerald-600" /> Đúng chuẩn
                        </span>
                      )}
                    </div>

                    {plan.status === DataStatus.SCAFFOLD && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(plan.id, DataStatus.VERIFIED);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-3 rounded-md transition-all cursor-pointer shadow-2xs"
                          id={`btn-approve-${plan.id}`}
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          Duyệt chuyên môn
                        </button>
                      </div>
                    )}
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

              {selectedPlan.status === DataStatus.SCAFFOLD && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3" id="quick-approve-banner">
                  <div className="flex gap-2.5 items-start">
                    <FileCheck2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-emerald-900">Giáo án đang ở trạng thái "Khung bài soạn"</h4>
                      <p className="text-xs text-emerald-700 font-medium">Bài viết này đã sẵn sàng để thẩm định, phê duyệt và nâng cấp lên trạng thái "Đã kiểm định".</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateStatus(selectedPlan.id, DataStatus.VERIFIED)}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Duyệt chuyên môn ngay
                  </button>
                </div>
              )}

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
