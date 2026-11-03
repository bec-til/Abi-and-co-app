'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import NewClientModal, { ClientFormData } from '@/components/NewClientModal';
import InquiryDocumentModal from '@/components/InquiryDocumentModal';
import { 
  Home, 
  User, 
  BarChart2, 
  Calendar, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Loader2,
  Plus,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface ClientMetrics {
  totalClients: number;
  newInquiries: number;
  activeBookings: number;
  realSubmissions: number;
  upcomingEvents30Days: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Account Accordions State
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isActiveAccountsOpen, setIsActiveAccountsOpen] = useState(false);
  
  // Modals & Panels State
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewEntriesListOpen, setIsNewEntriesListOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // State to hold data being exported from an inquiry to the New Client Modal
  const [exportingData, setExportingData] = useState<any | null>(null);
  const [activeInquiryIdToClean, setActiveInquiryIdToClean] = useState<string | null>(null);

  // Real Database Clients & Metrics State
  const [loading, setLoading] = useState(true);
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ClientMetrics>({
    totalClients: 0,
    newInquiries: 0,
    activeBookings: 0,
    realSubmissions: 0,
    upcomingEvents30Days: 0,
  });

  // Fetch metrics from `clients`, `events`, and `inquiries` tables
  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Set boundary starting from 00:00:00 today up to 30 days in the future (23:59:59)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const thirtyDaysFromNow = new Date(startOfToday);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      thirtyDaysFromNow.setHours(23, 59, 59, 999);

      const countedEventKeys = new Set<string>();

      // 1. Fetch Confirmed Clients from `clients` table
      const { data: clients, error: clientsErr } = await supabase
        .from('clients')
        .select('*');

      if (clientsErr) throw clientsErr;

      // 2. Fetch Prospective Form Inquiries from `inquiries` table
      const { data: inquiries, error: inquiriesErr } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (inquiriesErr) throw inquiriesErr;

      // 3. Fetch dedicated events from `events` table (if present)
      const { data: events } = await supabase
        .from('events')
        .select('*');

      let newClientsCount = 0;
      let active = 0;

      if (clients) {
        clients.forEach((client: any) => {
          const status = (client.status || client.statusOfClient || client.status_of_client || '').toUpperCase();
          
          if (status === 'NEW') {
            newClientsCount++;
          }

          if (
            status.includes('PAID') || 
            status.includes('BOOKED')
          ) {
            active++;
          }

          // Scan all possible date fields on the client record
          const eventDateStr = client.wedding_date || client.weddingDate || client.event_date || client.eventDate;
          if (eventDateStr) {
            const eventDate = new Date(eventDateStr);
            if (!isNaN(eventDate.getTime()) && eventDate >= startOfToday && eventDate <= thirtyDaysFromNow) {
              const uniqueKey = client.id ? `client-${client.id}` : `date-${eventDateStr}-${client.client_name || client.clientName}`;
              countedEventKeys.add(uniqueKey);
            }
          }
        });
      }

      // Check events table entries
      if (events && Array.isArray(events)) {
        events.forEach((evt: any) => {
          const evtDateStr = evt.start_date || evt.startDate || evt.event_date || evt.eventDate || evt.date;
          if (evtDateStr) {
            const eventDate = new Date(evtDateStr);
            if (!isNaN(eventDate.getTime()) && eventDate >= startOfToday && eventDate <= thirtyDaysFromNow) {
              const uniqueKey = evt.id ? `event-${evt.id}` : `event-date-${evtDateStr}`;
              countedEventKeys.add(uniqueKey);
            }
          }
        });
      }

      const safeInquiries = inquiries || [];
      setInquiriesList(safeInquiries);

      setMetrics({
        totalClients: clients ? clients.length : 0,
        newInquiries: newClientsCount,
        activeBookings: active,
        realSubmissions: safeInquiries.length,
        upcomingEvents30Days: countedEventKeys.size,
      });
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const handleSaveClient = async (formData: ClientFormData) => {
    try {
      setLoading(true);

      const { data: sampleRows } = await supabase.from('clients').select('*').limit(1);
      const existingColumns = sampleRows && sampleRows.length > 0 ? Object.keys(sampleRows[0]) : [];

      const fieldMappings = [
        { variants: ['eventType', 'event_type'], value: formData.eventType || 'WEDDING' },
        { variants: ['clientName', 'client_name', 'full_name', 'name'], value: formData.clientName },
        { variants: ['contactInfo', 'contact_info', 'phone'], value: formData.contactInfo },
        { variants: ['emailAddress', 'email_address', 'email'], value: formData.emailAddress },
        { variants: ['weddingDate', 'wedding_date', 'event_date'], value: formData.weddingDate || null },
        { variants: ['vowCeremony', 'vow_ceremony'], value: formData.vowCeremony || 'NO' },
        { variants: ['venueAddress', 'venue_address', 'address'], value: formData.venueAddress },
        { variants: ['estimatedGuests', 'estimated_guests', 'guest_count'], value: formData.estimatedGuests },
        { variants: ['status', 'status_of_client', 'statusOfClient'], value: formData.statusOfClient || 'NEW' },
        { variants: ['notes', 'additional_note', 'additionalNote'], value: formData.additionalNote || '' },
      ];

      const cleanPayload: Record<string, any> = {};

      if (existingColumns.length > 0) {
        fieldMappings.forEach(({ variants, value }) => {
          const matchedKey = variants.find((v) => existingColumns.includes(v));
          if (matchedKey) {
            cleanPayload[matchedKey] = value;
          }
        });
      } else {
        cleanPayload['event_type'] = formData.eventType || 'WEDDING';
        cleanPayload['client_name'] = formData.clientName;
        cleanPayload['contact_info'] = formData.contactInfo;
        cleanPayload['email'] = formData.emailAddress;
        cleanPayload['wedding_date'] = formData.weddingDate || null;
        cleanPayload['vow_ceremony'] = formData.vowCeremony || 'NO';
        cleanPayload['venue_address'] = formData.venueAddress;
        cleanPayload['estimated_guests'] = formData.estimatedGuests;
        cleanPayload['status'] = formData.statusOfClient || 'NEW';
        cleanPayload['notes'] = formData.additionalNote || '';
      }

      const { error: insertErr } = await supabase.from('clients').insert([cleanPayload]);
      if (insertErr) throw insertErr;

      if (activeInquiryIdToClean) {
        const { error: deleteErr } = await supabase
          .from('inquiries')
          .delete()
          .eq('id', activeInquiryIdToClean);
        
        if (deleteErr) {
          console.error('Failed to remove inquiry from submissions list:', deleteErr);
        }
        setActiveInquiryIdToClean(null);
      }

      await fetchDashboardMetrics();
      alert('Client successfully saved to Customers list!');
    } catch (err: any) {
      console.error('Error saving client record:', err);
      alert('Failed to save client: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportClient = (clientToImport: any) => {
    const raw = clientToImport.raw_data || {};
    const brideName = clientToImport.bride_name || raw.brideName || raw.bride_name || '';
    const groomName = clientToImport.groom_name || raw.groomName || raw.groom_name || '';
    
    const resolvedName =
      clientToImport.client_name ||
      (brideName && groomName ? `${brideName} & ${groomName}` : brideName || groomName || 'Exported Inquiry');

    setActiveInquiryIdToClean(clientToImport.id || null);

    setExportingData({
      eventType: 'WEDDING',
      clientName: resolvedName,
      contactInfo: clientToImport.contact_info || raw.contactInformation || raw.contactInfo || '',
      emailAddress: clientToImport.email || raw.emailAddress || raw.email || '',
      weddingDate: clientToImport.wedding_date || raw.weddingDate || raw.eventDate || '',
      venueAddress: clientToImport.venue_address || raw.venueNameAddress || raw.venueAddress || '',
      estimatedGuests: clientToImport.guest_count || raw.estimatedGuests || raw.guestCount || '',
      statusOfClient: 'NEW',
      additionalNote: clientToImport.notes || '',
    });

    setSelectedClient(null);
    setIsNewClientModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}

    document.cookie = 'auth_token=; path=/; max-age=0;';
    router.push('/login');
    router.refresh();
  };

  const realNewEntries = inquiriesList;

  return (
    <div 
      className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECECEC] font-sans text-black antialiased select-none relative" 
      suppressHydrationWarning
    >
      {/* Backdrop Overlay for Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Backdrop Overlay for Account Slide-Over */}
      {isAccountOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsAccountOpen(false)}
        />
      )}

      {/* Backdrop Overlay for New Entries Drawer */}
      {isNewEntriesListOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsNewEntriesListOpen(false)}
        />
      )}

      {/* Left Navigation Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 h-full bg-black text-white flex flex-col justify-between shrink-0 py-8 px-4 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="flex items-center justify-between lg:justify-center mb-12 px-2 lg:px-0">
            <h1 className="font-serif text-2xl font-bold tracking-wider text-center w-full">
              ABI&amp;Co.
            </h1>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1 cursor-pointer"
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-semibold tracking-wider">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-md bg-white text-black transition shadow-sm"
            >
              <Home size={18} />
              <span>DASHBOARD</span>
            </Link>

            <Link 
              href="/customers" 
              className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <User size={18} />
              <span>CUSTOMERS</span>
            </Link>

            <Link 
              href="/analytics" 
              className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <BarChart2 size={18} />
              <span>ANALYTICS</span>
            </Link>

            <Link 
              href="/calendar" 
              className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <Calendar size={18} />
              <span>CALENDAR</span>
            </Link>

            <Link 
              href="/chatbot" 
              className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition"
            >
              <MessageSquare size={18} />
              <span>CHATBOT</span>
            </Link>
          </nav>
        </div>

        <div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-xs py-2.5 px-4 rounded-full hover:bg-gray-200 transition shadow-md cursor-pointer"
          >
            <span>LOG OUT</span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Account Slide-Over Panel */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-black text-white flex flex-col justify-between py-8 px-6 transition-transform duration-300 ease-in-out shadow-2xl ${
          isAccountOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
            <div className="w-full flex flex-col items-center relative">
              <button 
                onClick={() => setIsAccountOpen(false)}
                className="absolute right-0 top-0 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
                aria-label="Close account panel"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-2">
                <User size={24} className="text-white" />
              </div>
              <span className="text-[10px] tracking-widest bg-zinc-800 text-white px-2 py-0.5 rounded-full uppercase mb-2">
                ADMIN
              </span>
              <h3 className="font-serif text-lg font-normal tracking-wide uppercase text-white">
                MY ACCOUNT
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-serif">
                rebekatilahun83@gmail.com
              </p>
            </div>
          </div>

          <div className="flex-1 py-6 space-y-3 overflow-y-auto">
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <button 
                onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                className="w-full flex items-center justify-between p-4 text-xs font-semibold tracking-wider text-white hover:bg-zinc-900 transition cursor-pointer uppercase"
              >
                <span>LOG-IN PASSWORD</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isPasswordOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPasswordOpen && (
                <div className="p-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-3">
                  <p>Manage your account security and password credentials.</p>
                  <button className="w-full bg-white text-black py-2 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer">
                    Change Password
                  </button>
                </div>
              )}
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <button 
                onClick={() => setIsActiveAccountsOpen(!isActiveAccountsOpen)}
                className="w-full flex items-center justify-between p-4 text-xs font-semibold tracking-wider text-white hover:bg-zinc-900 transition cursor-pointer uppercase"
              >
                <span>ACTIVE ACCOUNTS</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isActiveAccountsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isActiveAccountsOpen && (
                <div className="p-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <span>rebekatilahun83@gmail.com</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-xs py-3 px-4 rounded-full hover:bg-gray-200 transition shadow-md cursor-pointer uppercase tracking-wider"
            >
              <span>LOG OUT</span>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Real Entries Drawer */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white text-black flex flex-col justify-between py-6 px-6 transition-transform duration-300 ease-in-out shadow-2xl ${
          isNewEntriesListOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide uppercase text-black">
                Real Client Submissions
              </h3>
              <p className="text-xs text-gray-500 font-serif">
                Select a submission to review details
              </p>
            </div>
            <button 
              onClick={() => setIsNewEntriesListOpen(false)}
              className="text-gray-400 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              aria-label="Close list"
            >
              <X size={22} />
            </button>
          </div>

          <div className="pt-4 pb-2">
            <button 
              onClick={() => {
                setExportingData(null);
                setActiveInquiryIdToClean(null);
                setIsNewEntriesListOpen(false);
                setIsNewClientModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl hover:bg-zinc-800 transition shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>ENTER NEW CLIENT FORM</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : realNewEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No new client submissions found.
              </div>
            ) : (
              realNewEntries.map((client) => (
                <div 
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className="bg-[#F8F8F8] border border-gray-200 hover:border-black rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-black">
                        {client.client_name || client.full_name || 'Inquiry Entry'}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                        {client.event_type || 'Event Inquiry'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {client.email || client.contact_info || 'No contact provided'}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden bg-black text-white p-2.5 rounded-xl hover:bg-zinc-800 transition shadow-md cursor-pointer"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h2 className="text-xl sm:text-2xl font-serif tracking-widest font-normal uppercase text-black">
                DASHBOARD
              </h2>
              <p className="text-[11px] sm:text-xs font-serif text-gray-700 mt-0.5">
                Manage client inquiries, notes, and track payments
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <button 
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-2 bg-black text-white px-4 sm:px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider hover:bg-zinc-800 transition shadow-md cursor-pointer"
            >
              <User size={16} />
              <span className="hidden sm:inline">MY ACCOUNT</span>
            </button>
            <span className="text-[10px] sm:text-[11px] text-gray-600 font-serif mt-1 pr-1">Admin</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-h-0 overflow-y-auto pr-1">
          
          <div className="bg-[#D9D9D9] rounded-3xl p-4 sm:p-5 shadow-md border border-gray-300/60 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link 
                href="/customers?status=ALL" 
                className="bg-[#F6F6F6] border border-black rounded-3xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between h-32 text-left cursor-pointer w-full block"
              >
                <span className="text-xs font-normal text-gray-800">Total Clients</span>
                <span className="text-3xl sm:text-4xl font-serif text-black font-semibold flex items-center">
                  {loading ? <Loader2 size={28} className="animate-spin text-gray-400" /> : metrics.totalClients}
                </span>
              </Link>

              <Link 
                href="/customers?status=NEW" 
                className="bg-[#F6F6F6] border-2 border-blue-600 rounded-3xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between h-32 text-left cursor-pointer w-full block"
              >
                <span className="text-xs font-normal text-gray-800">New Inquiries</span>
                <span className="text-3xl sm:text-4xl font-serif text-black font-semibold flex items-center">
                  {loading ? <Loader2 size={28} className="animate-spin text-gray-400" /> : metrics.newInquiries}
                </span>
              </Link>

              <Link 
                href="/customers?status=BOOKED(PAID HALF)" 
                className="bg-[#F6F6F6] border-2 border-yellow-400 rounded-3xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between h-32 text-left cursor-pointer w-full block"
              >
                <span className="text-xs font-normal text-gray-800">Active Bookings</span>
                <span className="text-3xl sm:text-4xl font-serif text-black font-semibold flex items-center">
                  {loading ? <Loader2 size={28} className="animate-spin text-gray-400" /> : metrics.activeBookings}
                </span>
              </Link>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-0">
            
            <div 
              onClick={() => setIsNewEntriesListOpen(true)}
              className="bg-[#D9D9D9] border-2 border-blue-600 rounded-3xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[160px] md:min-h-0 md:h-full text-left cursor-pointer w-full group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-black tracking-tight">Real Submissions</h3>
                  <p className="text-xs font-serif text-gray-700 mt-1">Review complete entry details</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExportingData(null);
                    setActiveInquiryIdToClean(null);
                    setIsNewClientModalOpen(true);
                  }}
                  className="text-[10px] bg-black text-white px-2.5 py-1 rounded-full font-sans font-semibold tracking-wider flex items-center gap-1 uppercase hover:bg-zinc-800 transition"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <span className="text-3xl sm:text-4xl font-serif text-black font-semibold mt-4 md:mt-0 flex items-center">
                {loading ? <Loader2 size={28} className="animate-spin text-gray-400" /> : metrics.realSubmissions}
              </span>
            </div>

            <div className="bg-[#D9D9D9] border border-gray-300/60 rounded-3xl p-5 shadow-md transition-shadow min-h-[160px] md:min-h-0 md:h-full flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-black tracking-tight mb-2">Activity Log</h3>
                <p className="text-xs font-serif text-gray-600">
                  {metrics.totalClients > 0 
                    ? `${metrics.totalClients} client record(s) synced from Supabase` 
                    : 'No database activity recorded yet.'}
                </p>
              </div>
            </div>

            <Link 
              href="/calendar" 
              className="bg-[#D9D9D9] border border-gray-300/60 rounded-3xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between min-h-[160px] md:min-h-0 md:h-full text-left cursor-pointer w-full block"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-black" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black">CALENDAR</span>
                </div>
                <p className="text-xs sm:text-sm font-serif text-gray-800">Events in the next 30 days</p>
              </div>
              <span className="text-3xl sm:text-4xl font-serif text-black font-semibold mt-4 md:mt-0 flex items-center">
                {loading ? <Loader2 size={28} className="animate-spin text-gray-400" /> : metrics.upcomingEvents30Days}
              </span>
            </Link>

          </div>

        </div>

      </main>

      <NewClientModal
        isOpen={isNewClientModalOpen}
        initialData={exportingData}
        onClose={() => {
          setIsNewClientModalOpen(false);
          setExportingData(null);
          setActiveInquiryIdToClean(null);
        }}
        onSave={handleSaveClient}
      />

      <InquiryDocumentModal
        isOpen={!!selectedClient}
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onImportClient={handleImportClient}
      />
    </div>
  );
}