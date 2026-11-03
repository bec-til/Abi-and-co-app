'use client';

import React, { useRef } from 'react';
import { X, Printer, ArrowRight } from 'lucide-react';

interface InquiryDocumentModalProps {
  isOpen: boolean;
  client: any | null;
  onClose: () => void;
  onImportClient?: (client: any) => void;
}

export default function InquiryDocumentModal({
  isOpen,
  client,
  onClose,
  onImportClient,
}: InquiryDocumentModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !client) return null;

  // Helper to safely parse and merge JSON payloads from the notes column
  const getParsedClientData = (rawClient: any) => {
    let data = { ...rawClient };
    const rawNotes = rawClient.notes || rawClient.additionalNote;
    if (rawNotes) {
      const trimmed = String(rawNotes).trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'object' && parsed !== null) {
            data = { ...parsed, ...data };
          }
        } catch (e) {
          // Not valid JSON, ignore
        }
      }
    }
    return data;
  };

  const c = getParsedClientData(client);

  // Reliable print handler using a temporary print window
  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Please allow popups for this website to print/save PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ABI&Co. - Inquiry Submission Record</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            @media print {
              .print-page {
                page-break-before: always;
                break-before: page;
                padding: 30px 0;
              }
              .print-page:first-of-type {
                page-break-before: avoid;
                break-before: avoid;
              }
            }
            body {
              font-family: ui-sans-serif, system-ui, sans-serif;
              color: #000;
              background: #fff;
              padding: 40px;
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper to render arrays/lists cleanly
  const renderList = (val: any) => {
    if (!val) return 'None specified';
    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'None specified';
    return String(val);
  };

  // Helper for Yes / No / Value display with fallback mapping
  const renderValue = (val: any) => {
    if (val === true || val === 'YES' || val === 'Yes') return 'Yes';
    if (val === false || val === 'NO' || val === 'No') return 'No';
    if (val === null || val === undefined || val === '') return 'Not provided';
    return String(val);
  };

  // Safe cleaner for final notes to filter out raw form JSON payloads completely
  const getCleanFinalNotes = () => {
    const rawNote = c.finalNotes || c.final_notes || c.additionalNote || c.additional_note || client.notes || client.additionalNote;
    
    if (!rawNote) return 'Not provided';

    const trimmed = String(rawNote).trim();
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
        // Not valid JSON
      }
      return 'Not provided';
    }

    return trimmed;
  };

  const submissionDate = c.created_at
    ? new Date(c.created_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      {/* Main Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-black font-sans border border-gray-200">
        
        {/* Top Control Bar */}
        <div className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md uppercase tracking-wider">
              INQUIRY REF: #{c.id ? String(c.id).slice(0, 8) : 'SUBMISSION'}
            </span>
            <span className="text-xs bg-emerald-950 text-emerald-400 px-3 py-1 rounded-md font-medium border border-emerald-800 hidden sm:inline-block">
              5-Page Full Inquiry Submission Record
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* EXPORT TO CLIENT LIST BUTTON */}
            {onImportClient && (
              <button
                onClick={() => onImportClient(c)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer uppercase tracking-wider"
              >
                <span>Export to Client List</span>
                <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-white text-black hover:bg-gray-100 font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-sm cursor-pointer"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          <div
            ref={printRef}
            className="bg-white border border-gray-200 rounded-xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-10 text-black"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-6 print-page">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-widest text-black">
                  ABI&amp;Co.
                </h1>
                <p className="text-xs text-gray-500 font-sans mt-1 uppercase tracking-widest">
                  New Client Form Submission
                </p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-1">
                <p>
                  <strong className="text-black">Submission Date:</strong> {submissionDate}
                </p>
                <p>
                  <strong className="text-black">Client Name:</strong>{' '}
                  {c.brideName || c.clientName || c.client_name || c.name || 'N/A'}
                </p>
                <p>
                  <strong className="text-black">Status:</strong>{' '}
                  <span className="uppercase font-semibold text-blue-700">
                    {c.statusOfClient || c.status || 'NEW'}
                  </span>
                </p>
              </div>
            </div>

            {/* PAGE 1: GENERAL DETAILS & CLIENT INFORMATION */}
            <section className="space-y-4 print-page">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  Page 1
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  General Details &amp; Client Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Bride's Name</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.brideName || c.bride_name || c.clientName || c.name)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Groom's Name</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.groomName || c.groom_name || c.partnerName)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Contact Information</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.contactInfo || c.contact_info || c.phone || c.contactInformation)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Email Address</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.emailAddress || c.email_address || c.email)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Wedding Date</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.weddingDate || c.wedding_date || c.event_date)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Date Flexibility</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.dateFlexibility || c.date_flexibility)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Is there a Vow Ceremony?</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.isVowCeremony || c.vowCeremony)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Time and Place of Vow (if Yes)</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.vowTimeAndPlace || c.vow_time_and_place || c.vowDetails)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Time of Reception</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.receptionTime || c.reception_time)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Venue Name &amp; Address</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.venueNameAddress || c.venueNameAndAddress || c.venueAddress || c.venue_address || c.location)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Venue Contact Person &amp; Number</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.venueContact || c.venueContactPersonAndNumber || c.venue_contact)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Will the Event Take Place</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.eventLocationType || c.eventTypeLocation || c.event_type_location || c.eventType)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Venue / Time Restrictions</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.venueRestrictions || c.venueTimeRestrictions || c.venue_restrictions)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Specific Theme Required by Venue</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.venueThemeRequirements || c.venueRequiredTheme || c.venue_required_theme)}
                  </p>
                </div>
              </div>
            </section>

            {/* PAGE 2: GUEST INFORMATION & WEDDING THEME */}
            <section className="space-y-4 print-page">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  Page 2
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Guest Information &amp; Wedding Theme
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Estimated Number of Guests</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.estimatedGuests || c.estimated_guests || c.guest_count)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Number of People in Bridal Party</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.bridalPartyCount || c.bridal_party_count)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Bridesmaid Count</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.bridesmaidsCount || c.bridesmaids_count)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Groomsmen Count</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.groomsmenCount || c.groomsmen_count)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Flower Girls / Ring Bearer</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.flowerGirlsRingBearer || c.flower_girls_ring_bearer)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Designated Area for Family</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.designatedFamilyArea || c.designated_family_area)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Family Designated Seating Details</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.familyAreaTypes || c.family_area_types)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">VIP Guests for Personalized Arrangement</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.vipArrangements || c.vip_arrangements)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Specific Wedding Theme in Mind</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.weddingThemes || c.wedding_themes)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Color Palette</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.colorPalette || c.color_palette)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Mood / Atmosphere to Create</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.desiredAtmosphere || c.desired_atmosphere)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Cultural / Religious Elements to Incorporate</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.culturalElements || c.cultural_elements)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Themes or Decor Styles to Avoid</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.themesToAvoid || c.themes_to_avoid)}
                  </p>
                </div>
              </div>
            </section>

            {/* PAGE 3: VOW / CEREMONY DECOR & INSPIRATION */}
            <section className="space-y-4 print-page">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  Page 3
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Vow / Ceremony Decor &amp; Inspiration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Decorate Ceremony Space</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.decorateCeremonySpace || c.decorate_ceremony_space)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Aisle Decoration</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.aisleDecoration || c.aisle_decoration)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Altar / Arch Setup</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.altarArchSetup || c.altar_arch_setup)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Seating Arrangement</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.seatingArrangement || c.seating_arrangement)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Chair Style Preference</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.chairStylePreference || c.chair_style_preference)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Ceremony Backdrop Design</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.ceremonyBackdropDesign || c.ceremony_backdrop_design)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Seen Previous Work Loved?</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.seenPreviousWork || c.seen_previous_work)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Specific Design Details / Link / Photo</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {renderValue(c.previousWorkDetails || c.previous_work_details)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Inspiration Board / Pinterest Collection / Saved Photos</p>
                  <p className="font-semibold text-gray-900 break-all">
                    {renderValue(c.pinterestLink || c.pinterest_link)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Decor Elements Inspired by Other Weddings/Events</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.otherEventsInspiration || c.other_events_inspiration)}
                  </p>
                </div>
              </div>
            </section>

            {/* PAGE 4: RECEPTION DECOR */}
            <section className="space-y-4 print-page">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  Page 4
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Reception Decor &amp; Styling
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Special Decoration for Entrance</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.entranceDecoration || c.entrance_decoration)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Stage Setup Design</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.stageSetupDesign || c.stage_setup_design)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Sweetheart Table Seating on Stage?</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.sweetheartTableOnStage || c.sweetheart_table_on_stage)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Ceiling Decoration Required?</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.ceilingDecoration || c.ceiling_decoration)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Ceiling Decoration Choices</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.ceilingDecorationChoices || c.ceiling_decoration_choices)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Lighting Option</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.preferredLighting || c.preferred_lighting)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Chair Styles (Reception)</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.preferredReceptionChairStyles || c.preferred_reception_chair_styles)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Table Styles</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.preferredTableStyles || c.preferred_table_styles)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Close Family Seating Setup</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.closeFamilySeating || c.close_family_seating)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Lounge Area for Guests</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.loungeAreaForGuests || c.lounge_area_for_guests)}
                  </p>
                </div>
              </div>
            </section>

            {/* PAGE 5: DANCE FLOOR, ADDITIONAL DECOR, BUDGET & NOTES */}
            <section className="space-y-4 print-page">
              <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded">
                  Page 5
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Dance Floor, Extras &amp; Budget
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Require Dance Floor?</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.requireDanceFloor || c.require_dance_floor)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Dance Floor Type Preference</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.danceFloorType || c.dance_floor_type)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Overhead Decoration Above Dance Floor</p>
                  <p className="font-semibold text-gray-900">
                    {renderValue(c.overheadDanceFloorDecor || c.overhead_dance_floor_decor)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Centerpiece Type</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.centerpieceType || c.centerpiece_type)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Preferred Centerpiece Elements</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.preferredElements || c.preferred_elements)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Additional Decor Elements</p>
                  <p className="font-semibold text-gray-900">
                    {renderList(c.additionalDecorElements || c.additional_decor_elements)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                  <p className="text-[10px] text-gray-400 font-medium uppercase">Additional Notes / Final Remarks</p>
                  <p className="font-semibold text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {getCleanFinalNotes()}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}