'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Check, X, ExternalLink } from 'lucide-react';

export interface FullClientRecord {
  id: string;
  lastUpdated: string;
  eventType: string;
  clientName: string;
  contactInfo: string;
  emailAddress: string;
  weddingDate: string;
  vowCeremony: 'YES' | 'NO';
  venueAddress: string;
  estimatedGuests: string;
  statusOfClient: string;
  paymentReceipt: File | string | null;
  customerInvoice: File | string | null;
  signedContract: File | string | null;
  paymentReceiptFile?: File | null;
  customerInvoiceFile?: File | null;
  signedContractFile?: File | null;
  additionalNote: string;
  notes?: string;
  totalPayment?: string;
  depositedAmount?: string;
  depositPercentage?: string;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  client: FullClientRecord | null;
  onClose: () => void;
  onUpdateClient?: (updatedClient: FullClientRecord) => void;
}

export default function ClientDetailsModal({ 
  isOpen, 
  client, 
  onClose,
  onUpdateClient 
}: ClientDetailsModalProps) {
  const [formData, setFormData] = useState<FullClientRecord | null>(null);

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [isEditingPayments, setIsEditingPayments] = useState(false);

  // Helper function to filter out raw JSON form payloads from the notes field
  const getCleanFormNote = (rawNotes: any) => {
    if (!rawNotes) return '';
    const trimmed = String(rawNotes).trim();
    
    // If it's a JSON object string from a form submission, extract genuine text or clear it
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && parsed !== null) {
          const userNote = parsed.notes || parsed.additionalNote || parsed.additional_note || parsed.finalNotes;
          if (userNote && !String(userNote).trim().startsWith('{')) {
            return String(userNote);
          }
        }
      } catch (e) {
        // invalid JSON
      }
      return ''; // Clear out raw JSON blob
    }
    
    return trimmed;
  };

  useEffect(() => {
    if (client) {
      const rawNoteField = client.additionalNote || client.notes || '';
      setFormData({ 
        ...client, 
        additionalNote: getCleanFormNote(rawNoteField),
        totalPayment: client.totalPayment !== undefined && client.totalPayment !== '' 
          ? client.totalPayment 
          : '0',
        depositedAmount: client.depositedAmount !== undefined && client.depositedAmount !== '' 
          ? client.depositedAmount 
          : '0' 
      });
    }
    setIsEditingContact(false);
    setIsEditingNotes(false);
    setIsEditingEvent(false);
    setIsEditingPayments(false);
  }, [client, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof FullClientRecord, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSaveSection = (sectionSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    sectionSetter(false);
  };

  const calculatePercentage = (deposited: string, total: string) => {
    const depNum = parseFloat((deposited || '0').replace(/,/g, ''));
    const totNum = parseFloat((total || '0').replace(/,/g, ''));
    if (!isNaN(depNum) && !isNaN(totNum) && totNum > 0) {
      return `${Math.round((depNum / totNum) * 100)}%`;
    }
    return '0%';
  };

  const getFileDisplayName = (fileObj: File | null | undefined, fileValue: File | string | null) => {
    if (fileObj && typeof fileObj === 'object' && 'name' in fileObj) {
      return fileObj.name;
    }
    if (fileValue && typeof fileValue === 'object' && fileValue !== null && 'name' in fileValue) {
      return (fileValue as File).name;
    }
    if (typeof fileValue === 'string' && fileValue.trim() !== '') {
      try {
        const urlObj = new URL(fileValue);
        const segments = urlObj.pathname.split('/').filter(Boolean);
        const fullName = segments[segments.length - 1] || 'Uploaded Document';
        return fullName.length > 30 ? `${fullName.substring(0, 27)}...` : fullName;
      } catch {
        return fileValue.length > 30 ? `${fileValue.substring(0, 27)}...` : fileValue;
      }
    }
    return 'No File Chosen';
  };

  const getFileUrl = (fileValue: File | string | null) => {
    if (typeof fileValue === 'string' && fileValue.trim() !== '') {
      return fileValue;
    }
    return null;
  };

  const renderFileField = (
    label: string, 
    fileValue: File | string | null, 
    fileObj: File | null | undefined,
    fieldKey: 'paymentReceipt' | 'signedContract' | 'customerInvoice',
    fileKeyFile: 'paymentReceiptFile' | 'signedContractFile' | 'customerInvoiceFile'
  ) => {
    const displayName = getFileDisplayName(fileObj, fileValue);
    const fileUrl = getFileUrl(fileValue);

    return (
      <div>
        <span className="font-medium text-black block text-xs mb-1">{label}</span>
        <div className="flex items-center justify-between gap-2 bg-white/60 border border-gray-300/60 rounded-xl px-3 py-2">
          <label className="inline-flex items-center gap-2 cursor-pointer truncate flex-1">
            <span className="font-bold flex items-center gap-1 text-[11px] text-black hover:opacity-80 transition shrink-0">
              <Pencil size={11} /> REPLACE
            </span>
            <span className="text-gray-600 text-[11px] truncate" title={displayName}>
              {displayName}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) return;
                
                setFormData((prev) => prev ? { 
                  ...prev, 
                  [fieldKey]: file, 
                  [fileKeyFile]: file 
                } : null);
              }}
            />
          </label>

          {fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-black text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition shrink-0"
              title="View Document"
            >
              <span>VIEW</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#EEEEEE] text-black font-sans rounded-3xl p-6 sm:p-10 w-full max-w-6xl max-h-[92vh] overflow-y-auto relative shadow-2xl select-none border border-gray-300/50">
        
        <button
          onClick={() => {
            if (formData && onUpdateClient) {
              onUpdateClient(formData);
            }
            onClose();
          }}
          type="button"
          aria-label="Close modal"
          className="absolute top-6 right-6 text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center bg-transparent">
                <svg className="w-16 h-16 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 bg-white text-black rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-100 transition cursor-pointer"
                title="Edit Avatar"
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium uppercase tracking-widest text-black">
              EVENT DETAILS
            </h2>
          </div>

          <div className="text-center md:text-right">
            <h2 className="font-serif text-xl sm:text-2xl font-medium uppercase tracking-wider text-black">
              CLIENT’S PAYMENT/FILES
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-8">
            <div className="bg-[#E3E3E3] rounded-3xl p-6 relative shadow-sm text-xs font-semibold uppercase space-y-4 border border-gray-300/40">
              {isEditingContact ? (
                <div className="space-y-3 normal-case pr-4">
                  <div>
                    <label className="text-gray-600 uppercase text-[10px] block font-bold mb-1">Name of Client:</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleChange('clientName', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 uppercase text-[10px] block font-bold mb-1">Phone:</label>
                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => handleChange('contactInfo', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 uppercase text-[10px] block font-bold mb-1">Email:</label>
                    <input
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => handleChange('emailAddress', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-black font-semibold text-xs tracking-wider">NAME OF CLIENT:</span>
                    <span className="text-xs font-bold text-black">{formData.clientName || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-black font-semibold text-xs tracking-wider">PHONE:</span>
                    <span className="text-xs font-medium text-black">{formData.contactInfo || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-black font-semibold text-xs tracking-wider">EMAIL:</span>
                    <span className="text-xs font-medium text-black lowercase">{formData.emailAddress || ''}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => isEditingContact ? handleSaveSection(setIsEditingContact) : setIsEditingContact(true)}
                className="absolute -bottom-3 -right-3 bg-white text-black hover:bg-gray-100 rounded-full p-2 shadow-lg border border-gray-200 transition cursor-pointer"
                title={isEditingContact ? "Save Changes" : "Edit Contact Information"}
              >
                {isEditingContact ? <Check size={14} /> : <Pencil size={14} />}
              </button>
            </div>

            <div className="bg-[#E3E3E3] rounded-3xl p-6 relative shadow-sm min-h-[220px] flex flex-col justify-between border border-gray-300/40">
              <div>
                <span className="text-black font-semibold text-xs uppercase tracking-wider block mb-3">ADDITIONAL NOTES</span>
                {isEditingNotes ? (
                  <textarea
                    value={formData.additionalNote}
                    onChange={(e) => handleChange('additionalNote', e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs normal-case outline-none focus:border-black min-h-[140px] resize-none"
                  />
                ) : (
                  <p className="text-xs text-gray-800 normal-case whitespace-pre-wrap leading-relaxed">
                    {formData.additionalNote || ''}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => isEditingNotes ? handleSaveSection(setIsEditingNotes) : setIsEditingNotes(true)}
                className="absolute -bottom-3 -right-3 bg-white text-black hover:bg-gray-100 rounded-full p-2 shadow-lg border border-gray-200 transition cursor-pointer"
                title={isEditingNotes ? "Save Notes" : "Edit Notes"}
              >
                {isEditingNotes ? <Check size={14} /> : <Pencil size={14} />}
              </button>
            </div>
          </div>

          <div className="bg-[#E3E3E3] rounded-3xl p-6 relative shadow-sm flex flex-col justify-between min-h-[460px] border border-gray-300/40">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase text-black tracking-wider mb-4">
                  TYPE OF EVENT: <strong className="text-black font-bold uppercase ml-1">{formData.eventType || 'WEDDING'}</strong>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] uppercase font-medium">
                  {['WEDDING', 'PRE-WEDDING', 'MELS', 'CORPORATE'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      disabled={!isEditingEvent}
                      onClick={() => handleChange('eventType', type)}
                      className={`py-2 px-3 rounded-full text-center border transition-all ${
                        formData.eventType === type 
                          ? 'bg-black text-white border-black font-semibold shadow-sm' 
                          : 'bg-transparent text-gray-800 border-gray-500 hover:border-black'
                      } ${!isEditingEvent ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {type}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!isEditingEvent}
                    onClick={() => handleChange('eventType', 'OTHER')}
                    className={`col-span-2 py-2 px-3 rounded-full text-center border transition-all ${
                      !['WEDDING', 'PRE-WEDDING', 'MELS', 'CORPORATE'].includes(formData.eventType)
                        ? 'bg-black text-white border-black font-semibold shadow-sm'
                        : 'bg-transparent text-gray-800 border-gray-500 hover:border-black'
                    } ${!isEditingEvent ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    OTHER(SPECIFY)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold uppercase text-black tracking-wider">
                  STATUS OF CLIENT:
                </span>
                {isEditingEvent ? (
                  <select
                    value={formData.statusOfClient}
                    onChange={(e) => handleChange('statusOfClient', e.target.value)}
                    className="bg-white border border-gray-400 text-xs font-bold uppercase rounded-full px-3 py-1 outline-none focus:border-black"
                  >
                    <option value="NEW">NEW</option>
                    <option value="BOOKED(PAID HALF)">BOOKED(PAID HALF)</option>
                    <option value="PAYED FULL">PAYED FULL</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                ) : (
                  <span className="inline-block bg-[#BFF3D3] text-[#1E5D38] text-[11px] font-bold uppercase px-3 py-1 rounded-full border border-emerald-200/60 shadow-xs">
                    {formData.statusOfClient || 'PAYED FULL'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold uppercase text-black tracking-wider">
                  LOCATION OF EVENT:
                </span>
                {isEditingEvent ? (
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => handleChange('venueAddress', e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-black uppercase"
                  />
                ) : (
                  <span className="text-xs font-bold text-black uppercase">
                    {formData.venueAddress || 'GHION HOTEL'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold uppercase text-black tracking-wider">
                  DATE OF EVENT:
                </span>
                {isEditingEvent ? (
                  <input
                    type="text"
                    value={formData.weddingDate}
                    onChange={(e) => handleChange('weddingDate', e.target.value)}
                    placeholder="MM.DD.YYYY"
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none focus:border-black font-mono"
                  />
                ) : (
                  <span className="text-xs font-bold text-black font-mono">
                    {formData.weddingDate || 'MM.DD.YYYY'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => isEditingEvent ? handleSaveSection(setIsEditingEvent) : setIsEditingEvent(true)}
              className="absolute -bottom-3 -right-3 bg-white text-black hover:bg-gray-100 rounded-full p-2 shadow-lg border border-gray-200 transition cursor-pointer"
              title={isEditingEvent ? "Save Event Details" : "Edit Event Details"}
            >
              {isEditingEvent ? <Check size={14} /> : <Pencil size={14} />}
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-[#E3E3E3] rounded-3xl p-6 relative shadow-sm text-xs space-y-4 uppercase font-semibold border border-gray-300/40">
              {isEditingPayments ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-700 text-[10px] block font-bold mb-1">TOTAL PAYMENT:</label>
                    <input
                      type="text"
                      value={formData.totalPayment || '0'}
                      onChange={(e) => handleChange('totalPayment', e.target.value)}
                      placeholder="e.g. 0"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-[10px] block font-bold mb-1">DEPOSITED AMOUNT:</label>
                    <input
                      type="text"
                      value={formData.depositedAmount || '0'}
                      onChange={(e) => handleChange('depositedAmount', e.target.value)}
                      placeholder="e.g. 0"
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-black font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-xs tracking-wider">TOTAL PAYMENT:</span>
                    <span className="text-xs font-bold font-mono text-black">{formData.totalPayment || '0'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-xs tracking-wider">DEPOSITED AMOUNT:</span>
                    <span className="text-xs font-bold font-mono text-black">{formData.depositedAmount || '0'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 text-xs tracking-wider">DEPOSITED IN PERCENTILE:</span>
                    <span className="text-xs font-bold font-mono text-black">
                      {calculatePercentage(formData.depositedAmount || '0', formData.totalPayment || '0')}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => isEditingPayments ? handleSaveSection(setIsEditingPayments) : setIsEditingPayments(true)}
                className="absolute -bottom-3 -right-3 bg-white text-black hover:bg-gray-100 rounded-full p-2 shadow-lg border border-gray-200 transition cursor-pointer"
                title={isEditingPayments ? "Save Payments" : "Edit Payments"}
              >
                {isEditingPayments ? <Check size={14} /> : <Pencil size={14} />}
              </button>
            </div>

            <div className="bg-[#E3E3E3] rounded-3xl p-6 relative shadow-sm text-xs space-y-4 border border-gray-300/45">
              {renderFileField('Payment Screenshot / Receipt', formData.paymentReceipt, formData.paymentReceiptFile, 'paymentReceipt', 'paymentReceiptFile')}
              {renderFileField('Signed Agreement / Contract', formData.signedContract, formData.signedContractFile, 'signedContract', 'signedContractFile')}
              {renderFileField('Customer Invoice', formData.customerInvoice, formData.customerInvoiceFile, 'customerInvoice', 'customerInvoiceFile')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}