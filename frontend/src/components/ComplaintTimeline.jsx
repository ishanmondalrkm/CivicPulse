import React from 'react';
import { CheckCircle2, Clock, Check, Building2, FileText, Camera } from 'lucide-react';

export default function ComplaintTimeline({ complaint }) {
  if (!complaint) return null;

  const history = complaint.status_history || [];
  const statusSteps = ['PENDING', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED'];
  const currentStatus = complaint.status || 'PENDING';

  const getStepIndex = (st) => {
    if (st === 'REJECTED' || st === 'DUPLICATE' || st === 'CLOSED') return 3;
    const idx = statusSteps.indexOf(st);
    return idx !== -1 ? idx : 0;
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div className="space-y-6" data-testid="complaint-timeline-modal">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              {complaint.complaint_number}
            </span>
             <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                complaint.priority === 'High' || complaint.priority === 'Critical'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {complaint.priority} Priority
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">{complaint.title || complaint.category}</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            {complaint.assigned_department}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              currentStatus === 'RESOLVED'
                ? 'bg-emerald-100 text-emerald-800'
                : currentStatus === 'IN PROGRESS'
                ? 'bg-blue-100 text-blue-800'
                : currentStatus === 'ASSIGNED'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {currentStatus}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            Filed: {new Date(complaint.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="relative px-2 py-4">
        <div className="absolute top-8 left-6 right-6 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${(currentIndex / 3) * 100}%` }}
          />
        </div>

        <div className="flex justify-between relative z-10">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div key={step} className="flex flex-col items-center text-center max-w-[80px]">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all shadow-sm ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-semibold mt-2 ${isCurrent ? 'text-blue-700' : 'text-slate-600'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Grievance Description</span>
          {complaint.original_language && complaint.original_language !== 'English' && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
              Submitted in {complaint.original_language}
            </span>
          )}
        </div>
        <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          "{complaint.description}"
        </p>
        {complaint.translated_description && complaint.original_language !== 'English' && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="font-semibold text-blue-700 flex items-center gap-1">
              <FileText className="h-3 w-3" /> AI Normalized English Summary:
            </span>
            <p className="text-slate-700 mt-1 italic">"{complaint.translated_description}"</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-600" /> Resolution Action Timeline
        </h4>
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-full mt-0.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{h.status}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(h.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{h.remarks}</p>
                <span className="text-[10px] text-slate-400 font-medium">By: {h.changed_by}</span>

                {h.proof_photo_url && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <Camera className="h-3 w-3" /> On-site proof-of-work photo
                    </span>
                    <div className="relative rounded-lg overflow-hidden border border-emerald-200 max-w-xs">
                      <img
                        src={h.proof_photo_url}
                        alt="Proof of work"
                        className="w-full h-40 object-cover"
                        data-testid={`timeline-proof-photo-${i}`}
                      />
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
                        SITE EVIDENCE
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}