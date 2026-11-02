import React, { useState } from 'react';
import { Report } from '../types';
import { storage } from '../services/storage';
import { X, ShieldAlert, Check, Ban, AlertTriangle, EyeOff } from 'lucide-react';

interface ModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const ModeratorModal: React.FC<ModeratorModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [reports, setReports] = useState<Report[]>(() => storage.getReports());

  if (!isOpen) return null;

  const handleAction = (reportId: string, action: 'dismissed' | 'resolved', banUid?: string) => {
    storage.resolveReport(reportId, action, banUid);
    setReports(storage.getReports());
    onUpdated();
    alert(banUid ? `Member banned and content removed.` : `Report marked as ${action}.`);
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#2D2640] text-white p-4 flex items-center justify-between border-b border-[#3f3557] shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold">Safety & Moderation Queue</h2>
              <span className="text-[10px] text-[#CCC3E8]">SRS Section 4.10 (FR-S2)</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {pendingReports.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Check className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
              <p className="text-xs font-bold text-gray-700">Moderation queue is clean!</p>
              <p className="text-[11px] text-gray-400 mt-1">No pending reports to review.</p>
            </div>
          ) : (
            pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-amber-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    {report.reason.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-gray-800">
                  Target: <strong>{report.targetType}</strong> (ID: {report.targetId})
                </p>

                {report.description && (
                  <p className="text-gray-600 italic bg-white p-2 rounded-xl border border-gray-100">
                    "{report.description}"
                  </p>
                )}

                <div className="flex items-center space-x-2 pt-1 border-t border-gray-200">
                  <button
                    onClick={() => handleAction(report.id, 'dismissed')}
                    className="flex-1 py-1.5 rounded-xl border border-gray-300 font-bold hover:bg-gray-100 transition text-[11px]"
                  >
                    Dismiss
                  </button>

                  <button
                    onClick={() => handleAction(report.id, 'resolved')}
                    className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition text-[11px]"
                  >
                    Warn & Resolve
                  </button>

                  {report.targetType === 'user' && (
                    <button
                      onClick={() => handleAction(report.id, 'resolved', report.targetId)}
                      className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition text-[11px] flex items-center space-x-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Ban</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
