'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
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
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

function AnalyticsContent() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw error;
      if (data) setClients(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    document.cookie = 'auth_token=; path=/; max-age=0;';
    router.push('/login');
    router.refresh();
  };

  // Calculations
  const totalClients = clients.length;
  
  const parseAmount = (val: string | number) => {
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const totalRevenuePotential = clients.reduce((sum, c) => sum + parseAmount(c.total_payment), 0);
  const totalCollected = clients.reduce((sum, c) => sum + parseAmount(c.deposited_amount), 0);
  const totalOutstanding = Math.max(0, totalRevenuePotential - totalCollected);
  const collectionRate = totalRevenuePotential > 0 ? Math.round((totalCollected / totalRevenuePotential) * 100) : 0;

  const statusCounts = {
    new: clients.filter((c) => (c.status || '').toUpperCase() === 'NEW').length,
    bookedHalf: clients.filter((c) => (c.status || '').toUpperCase() === 'BOOKED(PAID HALF)').length,
    paidFull: clients.filter((c) => (c.status || '').toUpperCase() === 'PAYED FULL' || (c.status || '').toUpperCase() === 'PAID FULL').length,
    archived: clients.filter((c) => (c.status || '').toUpperCase() === 'ARCHIVED').length,
  };

  const eventTypeCounts = clients.reduce((acc: any, c) => {
    const type = (c.event_type || 'WEDDING').toUpperCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#ECECEC] font-sans text-black antialiased select-none relative">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
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

            <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-md bg-white text-black transition shadow-sm font-bold">
              <BarChart2 size={18} />
              <span>ANALYTICS</span>
            </Link>

            <Link href="/calendar" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
              <Calendar size={18} />
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
      <main className="flex-1 h-full flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden bg-black text-white p-2.5 rounded-xl hover:bg-zinc-800 transition shadow-md cursor-pointer">
              <Menu size={20} />
            </button>
            <h2 className="text-xl sm:text-2xl font-serif tracking-widest font-normal uppercase text-black">
              ANALYTICS &amp; PERFORMANCE
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center py-20">
            <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
              <Loader2 size={24} className="animate-spin" />
              Loading analytics data...
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-12">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Potential Revenue</span>
                  <div className="p-2 bg-gray-100 rounded-xl text-black">
                    <DollarSign size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-black font-mono">
                    {totalRevenuePotential.toLocaleString()} ETB
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">Combined contract value</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Collected</span>
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-emerald-700 font-mono">
                    {totalCollected.toLocaleString()} ETB
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">{collectionRate}% overall collection rate</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Balance</span>
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Clock size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-amber-700 font-mono">
                    {totalOutstanding.toLocaleString()} ETB
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">Pending client payments</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Clients</span>
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                    <Users size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-black font-mono">
                    {totalClients}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">Registered event accounts</p>
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Status Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black mb-6 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-black" />
                  Client Status Distribution
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'New Inquiry / Lead', count: statusCounts.new, color: 'bg-blue-500' },
                    { label: 'Booked (Paid Half)', count: statusCounts.bookedHalf, color: 'bg-amber-500' },
                    { label: 'Paid Full', count: statusCounts.paidFull, color: 'bg-emerald-500' },
                    { label: 'Archived', count: statusCounts.archived, color: 'bg-gray-400' },
                  ].map((item) => {
                    const percentage = totalClients > 0 ? Math.round((item.count / totalClients) * 100) : 0;
                    return (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-700 uppercase">{item.label}</span>
                          <span className="font-mono text-black">{item.count} clients ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Type Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-black mb-6 flex items-center gap-2">
                  <Briefcase size={18} className="text-black" />
                  Event Types Breakdown
                </h3>
                {Object.keys(eventTypeCounts).length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">No event data recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(eventTypeCounts).map(([type, count]: [string, any]) => {
                      const percentage = totalClients > 0 ? Math.round((count / totalClients) * 100) : 0;
                      return (
                        <div key={type} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-700 uppercase">{type}</span>
                            <span className="font-mono text-black">{count} events ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-black h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#ECECEC]">Loading Analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}