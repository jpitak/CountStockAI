import React, { useState } from 'react';
import { Search, Download, Trash2, Filter } from 'lucide-react';
import { ScannedRecord, AppSettings } from '../types';
import { exportScannedRecords } from '../utils/storage';

interface ViewItemScanScreenProps {
  records: ScannedRecord[];
  onClearAll: () => void;
  onDeleteRecord?: (id: string) => void;
  settings: AppSettings;
}

export const ViewItemScanScreen: React.FC<ViewItemScanScreenProps> = ({
  records,
  onClearAll,
  onDeleteRecord,
  settings
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'NORMAL' | 'DAMAGE' | 'in_master' | 'not_master'>('all');
  const [showExportModal, setShowTemplateExportModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredRecords = records.filter(rec => {
    const matchesSearch =
      rec.ItemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.LocationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.SerialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'NORMAL') return rec.Status === 'NORMAL';
    if (filterType === 'DAMAGE') return rec.Status === 'DAMAGE';
    if (filterType === 'in_master') return rec.InMaster === true;
    if (filterType === 'not_master') return rec.InMaster === false;

    return true;
  });

  return (
    <div className="bg-white min-h-screen pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Top Action Buttons matching Screenshot Page 38 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => {
            if (confirm("คุณต้องการล้างข้อมูลรายการสแกนทั้งหมดในเครื่องใช่หรือไม่?")) {
              onClearAll();
              showToast("🗑️ ล้างข้อมูลรายการสแกนเรียบร้อยแล้ว");
            }
          }}
          className="bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm py-2.5 rounded-2xl shadow-xs transition-colors"
        >
          Clear
        </button>

        <button
          onClick={() => setShowTemplateExportModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm py-2.5 rounded-2xl shadow-xs transition-colors"
        >
          Export to Data
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search item code or location code"
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter Dropdown & Record Count Bar */}
      <div className="flex items-center justify-between mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none"
        >
          <option value="all">All</option>
          <option value="NORMAL">Normal Only</option>
          <option value="DAMAGE">Damage Only</option>
          <option value="in_master">In Master Only</option>
          <option value="not_master">Not in Master Only</option>
        </select>

        <span className="text-xs font-extrabold text-gray-600">
          Record Count: {filteredRecords.length}
        </span>
      </div>

      {/* Scanned Records Card List matching Screenshot Page 38 */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            ไม่พบรายการข้อมูลสแกน
          </div>
        ) : (
          filteredRecords.map((rec) => {
            // Left border accent logic
            let borderAccent = 'border-l-4 border-l-emerald-500';
            if (!rec.InMaster) {
              borderAccent = 'border-l-4 border-l-amber-500';
            } else if (rec.Status === 'DAMAGE') {
              borderAccent = 'border-l-4 border-l-rose-500';
            }

            return (
              <div
                key={rec.id}
                className={`border border-gray-200 ${borderAccent} rounded-2xl p-3.5 bg-white shadow-2xs`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-extrabold text-blue-600 text-sm leading-snug">
                    [{rec.ItemCode}] {rec.ItemName !== '-' ? rec.ItemName : ''}
                  </h4>

                  <div className="flex gap-1.5 items-center flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      rec.Status === 'DAMAGE'
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}>
                      {rec.Status}
                    </span>

                    {!rec.InMaster && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white">
                        NOT IN MASTER
                      </span>
                    )}

                    {onDeleteRecord && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(rec.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg active:scale-95 transition-all"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-700 space-y-0.5 font-medium leading-relaxed">
                  <p>DESC: {rec.ItemName !== '-' ? rec.ItemName : '-'}</p>
                  <p className="text-[11px] text-gray-600">
                    SN: <span className="font-bold text-gray-900">{rec.SerialNumber}</span> Lot: <span className="font-bold text-gray-900">{rec.LotNumber}</span> Exp: <span className="font-bold text-gray-900">{rec.ExpiryDate}</span>
                  </p>
                  <p className="text-[11px] text-gray-600">
                    LOCATION: <span className="font-bold text-blue-700">{rec.LocationCode}</span>
                  </p>
                  <p className="text-[11px] text-gray-600">
                    QUANTITY: Plan[{rec.QuantityPlan || '-'}] Scan[{rec.QuantityScan}] EA By: <span className="font-bold text-gray-800">{rec.ScannedBy}</span> {rec.ScanDate}T{rec.ScanTime}
                  </p>
                  {rec.Remark && (
                    <p className="text-[11px] text-rose-600 font-semibold italic">
                      Remark: {rec.Remark}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Export Modal matching Screenshot Page 40 */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center shadow-2xl border border-gray-100 animate-fade-in">
            <h3 className="text-base font-extrabold text-gray-900 mb-6">
              Export Count Stock
            </h3>

            <div className="flex gap-2 justify-center mb-2">
              <button
                onClick={() => {
                  exportScannedRecords('txt', filteredRecords, settings);
                  setShowTemplateExportModal(false);
                  showToast("ส่งออกข้อมูล .TXT สำเร็จ");
                }}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                .TXT
              </button>

              <button
                onClick={() => {
                  exportScannedRecords('csv', filteredRecords, settings);
                  setShowTemplateExportModal(false);
                  showToast("ส่งออกข้อมูล .CSV สำเร็จ");
                }}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                .CSV
              </button>

              <button
                onClick={() => {
                  exportScannedRecords('xlsx', filteredRecords, settings);
                  setShowTemplateExportModal(false);
                  showToast("ส่งออกข้อมูล .XLSX สำเร็จ");
                }}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                .XLSX
              </button>
            </div>

            <button
              onClick={() => setShowTemplateExportModal(false)}
              className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              ยกเลิก / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
