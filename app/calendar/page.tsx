'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Home, 
  User, 
  BarChart2, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut,
  X,
  Pencil,
  Paperclip,
  Loader2,
  Menu,
  ExternalLink
} from 'lucide-react';

type ClientStatus = 'NEW' | 'BOOKED(PAID HALF)' | 'PAYED FULL' | 'ARCHIVED';

interface EventClient {
  id: string;
  name: string;
  phone: string;
  email: string;
  additionalNotes: string;
  eventType: string;
  status: ClientStatus;
  location: string;
  eventDate: string; 
  totalPayment: string;
  depositedAmount: string;
  paymentReceipt?: string | null;
  signedContract?: string | null;
  customerInvoice?: string | null;
}

export default function CalendarPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'ALL' | string>('ALL');
  const [selectedClient, setSelectedClient] = useState<EventClient | null>(null);
  const [events, setEvents] = useState<EventClient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Fetch real client data from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*');

        if (error) {
          console.error('Error fetching clients from Supabase:', error.message);
        } else if (data && data.length > 0) {
          const mappedData: EventClient[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.full_name || item.client_name || 'Untitled Client',
            phone: item.contact_info || '',
            email: item.email || '',
            additionalNotes: item.notes || '',
            eventType: item.event_type || 'WEDDING',
            status: (item.status || 'NEW').toUpperCase() as ClientStatus,
            location: item.venue_address || 'GHION HOTEL',
            eventDate: item.event_date || new Date().toISOString().split('T')[0],
            totalPayment: item.total_payment || '0',
            depositedAmount: item.deposited_amount || '0',
            paymentReceipt: item.payment_proof_url || null,
            signedContract: item.agreement_url || null,
            customerInvoice: item.invoice_url || null,
          }));
          setEvents(mappedData);
        }
      } catch (err) {
        console.error('Unexpected error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    document.cookie = 'auth_token=; path=/; max-age=0;';
    router.push('/login');
    router.refresh();
  };

  // Calculate days away from today
  const calculateDaysAway = (targetDateStr: string): number => {
    if (!targetDateStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatEventDate = (dateStr: string): string => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const month = d.toLocaleString('en-US', { month: 'long' }).toUpperCase();
    return `${month} ${d.getDate()} ${d.getFullYear()}`;
  };

  const getStatusBorderStyle = (status: ClientStatus) => {
    switch (status) {
      case 'NEW':
        return 'border-2 border-blue-600 shadow-blue-100';
      case 'BOOKED(PAID HALF)':
        return 'border-2 border-yellow-400 shadow-yellow-100';
      case 'PAYED FULL':
        return 'border-2 border-emerald-500 shadow-emerald-100';
      default:
        return 'border border-gray-300';
    }
  };

  const handleUpdateClientNotes = async (newNotes: string) => {
    if (!selectedClient) return;

    const updated = { ...selectedClient, additionalNotes: newNotes };
    setSelectedClient(updated);
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));

    try {
      await supabase
        .from('clients')
        .update({ notes: newNotes, updated_at: new Date().toISOString() })
        .eq('id', selectedClient.id);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  // Sort events so closest upcoming date is 1st
  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((evt) => (filter === 'ALL' ? evt.status !== 'ARCHIVED' : evt.status === filter))
      .sort((a, b) => {
        const dateA = new Date(a.eventDate).getTime() || 0;
        const dateB = new Date(b.eventDate).getTime() || 0;
        return dateA - dateB;
      });
  }, [events, filter]);

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECECEC] font-sans text-black antialiased select-none relative">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-56 h-full bg-black text-white flex flex-col justify-between shrink-0 py-8 px-4 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          <div className="flex items-center justify-between lg:justify-center mb-12 px-2 lg:px-0">
            <h1 className="font-serif text-2xl font-bold tracking-wider text-center w-full">ABI&amp;Co.</h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
              <X size={22} />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-semibold tracking-wider">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <Home size={18} />
              <span>DASHBOARD</span>
            </Link>

            <Link href="/customers" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <User size={18} />
              <span>CUSTOMERS</span>
            </Link>

            <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <BarChart2 size={18} />
              <span>ANALYTICS</span>
            </Link>

            <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-md bg-white text-black transition shadow-sm font-bold">
              <CalendarIcon size={18} />
              <span>CALENDAR</span>
            </Link>

            <Link href="/chatbot" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <MessageSquare size={18} />
              <span>CHATBOT</span>
            </Link>
          </nav>
        </div>

        <div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-xs py-2.5 px-4 rounded-full hover:bg-gray-200 transition shadow-md cursor-pointer">
            <span>LOG OUT</span>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col p-4 sm:p-6 lg:p-10 overflow-hidden">
        
        <div className="flex items-center justify-between mb-4 lg:hidden shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="bg-black text-white p-2.5 rounded-xl hover:bg-zinc-800 transition shadow-md">
            <Menu size={20} />
          </button>
          <h2 className="text-lg font-serif font-bold tracking-widest text-black uppercase">CALENDAR</h2>
          <div className="w-9" />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-4 mb-6 shrink-0 overflow-x-auto pb-2 w-full">
          {[
            { key: 'ALL', label: 'ALL' },
            { key: 'NEW', label: 'NEW CLIENT' },
            { key: 'BOOKED(PAID HALF)', label: 'PAID-HALF' },
            { key: 'PAYED FULL', label: 'PAID-FULL' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-5 sm:px-6 py-2 rounded-2xl text-xs font-bold tracking-wider transition cursor-pointer whitespace-nowrap shrink-0 ${
                filter === tab.key
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-black border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events Grid Box */}
        <div className="flex-1 bg-[#E1E1E1] rounded-3xl p-4 sm:p-6 lg:p-10 overflow-y-auto border border-gray-300 shadow-inner">
          {loading ? (
            <div className="h-full flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Loading events...</span>
            </div>
          ) : sortedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedEvents.map((evt) => {
                const daysAway = calculateDaysAway(evt.eventDate);

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedClient(evt);
                      setTempNotes(evt.additionalNotes || '');
                      setIsEditingNotes(false);
                    }}
                    className={`bg-[#ECECEC] rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${getStatusBorderStyle(
                      evt.status
                    )}`}
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold tracking-wider text-black uppercase">
                        {daysAway > 0 ? `${daysAway} DAYS AWAY` : daysAway === 0 ? 'TODAY!' : `${Math.abs(daysAway)} DAYS AGO`}
                      </p>
                      <p className="text-xs font-medium text-gray-700">
                        {formatEventDate(evt.eventDate)}
                      </p>
                      <p className="text-xs font-bold text-gray-900 uppercase pt-2">
                        {evt.name}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 uppercase mt-4">
                      📍 {evt.location || 'GHION HOTEL'}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-medium text-gray-500 uppercase tracking-wider text-center p-4">
              No upcoming events found.
            </div>
          )}
        </div>
      </main>

      {/* CLIENT DETAILS MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 lg:p-8">
          <div className="bg-[#ECECEC] w-full max-w-6xl max-h-[90vh] rounded-3xl p-5 sm:p-8 overflow-y-auto relative shadow-2xl text-black">
            
            <button
              onClick={() => setSelectedClient(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-600 hover:text-black p-2 rounded-full hover:bg-gray-300 transition cursor-pointer z-10"
            >
              <X size={22} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div className="bg-[#D9D9D9] p-6 rounded-3xl space-y-3 shadow-sm">
                  <p className="text-[11px] font-bold text-gray-700 uppercase">NAME OF CLIENT:</p>
                  <p className="text-xs font-semibold text-black">{selectedClient.name}</p>
                  <p className="text-[11px] font-bold text-gray-700 uppercase">PHONE:</p>
                  <p className="text-xs font-medium text-black">{selectedClient.phone || 'N/A'}</p>
                  <p className="text-[11px] font-bold text-gray-700 uppercase">EMAIL:</p>
                  <p className="text-xs font-medium text-black lowercase">{selectedClient.email || 'N/A'}</p>
                </div>

                <div className="bg-[#D9D9D9] p-6 rounded-3xl relative shadow-sm min-h-[160px] flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-gray-700 uppercase mb-2">ADDITIONAL NOTES</p>
                    {isEditingNotes ? (
                      <div className="space-y-2">
                        <textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="w-full h-20 p-2 text-xs bg-white border border-gray-400 rounded-md outline-none"
                        />
                        <button
                          onClick={() => {
                            handleUpdateClientNotes(tempNotes);
                            setIsEditingNotes(false);
                          }}
                          className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-md cursor-pointer"
                        >
                          SAVE
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-800 whitespace-pre-wrap">{selectedClient.additionalNotes || 'No notes added.'}</p>
                    )}
                  </div>
                  {!isEditingNotes && (
                    <button onClick={() => setIsEditingNotes(true)} className="absolute bottom-4 right-4 bg-white border border-black p-1.5 rounded-full shadow hover:bg-gray-100 cursor-pointer">
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Center Column */}
              <div className="bg-[#D9D9D9] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-center font-serif text-lg font-bold uppercase tracking-widest text-black mb-4">EVENT DETAILS</h3>
                  <p className="text-xs font-bold uppercase">TYPE OF EVENT: <span className="font-semibold">{selectedClient.eventType}</span></p>
                  <p className="text-xs font-bold uppercase">STATUS OF CLIENT: <span className="font-semibold">{selectedClient.status}</span></p>
                  <p className="text-xs font-bold uppercase">LOCATION OF EVENT: <span className="font-normal">{selectedClient.location}</span></p>
                  <p className="text-xs font-bold uppercase">DATE OF EVENT: <span className="font-normal">{selectedClient.eventDate}</span></p>
                </div>
              </div>

              {/* Right Column: Payments & Files */}
              <div className="space-y-6">
                <div className="bg-[#D9D9D9] p-6 rounded-3xl shadow-sm space-y-3">
                  <h3 className="text-center font-serif text-lg font-bold uppercase tracking-widest text-black mb-3">CLIENT'S PAYMENT</h3>
                  <p className="text-xs font-bold uppercase">TOTAL PAYMENT: <span className="font-mono">{Number(selectedClient.totalPayment || 0).toLocaleString()} ETB</span></p>
                  <p className="text-xs font-bold uppercase">DEPOSITED AMOUNT: <span className="font-mono">{Number(selectedClient.depositedAmount || 0).toLocaleString()} ETB</span></p>
                </div>

                <div className="bg-[#D9D9D9] p-6 rounded-3xl shadow-sm space-y-4 text-xs">
                  <p className="font-bold uppercase text-[11px]">Documents</p>
                  {[
                    { label: 'Payment Receipt', url: selectedClient.paymentReceipt },
                    { label: 'Signed Agreement', url: selectedClient.signedContract },
                    { label: 'Customer Invoice', url: selectedClient.customerInvoice },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center justify-between bg-white/60 px-3 py-2 rounded-xl">
                      <span className="font-medium truncate">{doc.label}</span>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-black text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">
                          VIEW <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[10px]">No File</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}