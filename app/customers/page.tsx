'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import NewClientModal, { ClientFormData } from '@/components/NewClientModal';
import ClientDetailsModal, { FullClientRecord } from '@/components/ClientDetailsModal';
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
  Trash2
} from 'lucide-react';

const STATUS_OPTIONS = ['ALL', 'NEW', 'BOOKED(PAID HALF)', 'PAYED FULL', 'ARCHIVED'];

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<FullClientRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const [customers, setCustomers] = useState<FullClientRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync activeFilter with URL status parameter when coming from dashboard
  useEffect(() => {
    if (statusParam) {
      const formattedStatus = statusParam.toUpperCase();
      if (STATUS_OPTIONS.includes(formattedStatus)) {
        setActiveFilter(formattedStatus);
      }
    }
  }, [statusParam]);

  // Helper function to upload file to Supabase Storage using 'client-documents' bucket
  const uploadFileToSupabase = async (file: File | null | undefined): Promise<string | null> => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError.message);
        return null;
      }

      const { data } = supabase.storage.from('client-documents').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('File upload exception:', err);
      return null;
    }
  };

  // Fetch real client data from Supabase
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedData: FullClientRecord[] = data.map((item: any) => ({
          id: String(item.id),
          clientName: item.full_name || item.client_name || 'Untitled Client',
          contactInfo: item.contact_info || '',
          weddingDate: item.event_date || '',
          venueAddress: item.venue_address || '',
          statusOfClient: (item.status || 'NEW').toUpperCase(),
          lastUpdated: item.updated_at 
            ? new Date(item.updated_at).toLocaleDateString('en-GB') 
            : new Date().toLocaleDateString('en-GB'),
          totalPayment: item.total_payment || '',
          depositedAmount: item.deposited_amount || '',
          depositPercentage: item.deposit_percentage || '',
          additionalNote: item.notes || '',
          paymentReceipt: item.payment_proof_url || null,
          customerInvoice: item.invoice_url || null,
          signedContract: item.agreement_url || null,
          eventType: item.event_type || 'WEDDING',
          vowCeremony: item.vow_ceremony || 'NO',
          estimatedGuests: item.estimated_guests || '',
          emailAddress: item.email || '',
        }));
        setCustomers(mappedData);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.stopPropagation();
    const newStatus = e.target.value;

    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, statusOfClient: newStatus } : c))
    );

    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchCustomers();
    } catch (err) {
      console.error('Failed to update status in Supabase:', err);
      fetchCustomers();
    }
  };

  // Delete customer function with confirmation prompt
  const handleDeleteCustomer = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${name || 'this client'}" permanently from the database?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete customer:', err);
      alert('Failed to delete customer from database.');
    }
  };

  const handleSaveNewClient = async (newClientData: ClientFormData) => {
    try {
      const paymentProofUrl = await uploadFileToSupabase(newClientData.paymentReceiptFile || (newClientData.paymentReceipt instanceof File ? newClientData.paymentReceipt : null));
      const invoiceUrl = await uploadFileToSupabase(newClientData.customerInvoiceFile || (newClientData.customerInvoice instanceof File ? newClientData.customerInvoice : null));
      const agreementUrl = await uploadFileToSupabase(newClientData.signedContractFile || (newClientData.signedContract instanceof File ? newClientData.signedContract : null));

      const payload = {
        full_name: newClientData.clientName,
        contact_info: newClientData.contactInfo,
        email: newClientData.emailAddress,
        event_date: newClientData.weddingDate || null,
        vow_ceremony: newClientData.vowCeremony,
        venue_address: newClientData.venueAddress,
        estimated_guests: newClientData.estimatedGuests,
        event_type: newClientData.eventType || 'WEDDING',
        status: newClientData.statusOfClient || 'NEW',
        notes: newClientData.additionalNote,
        payment_proof_url: paymentProofUrl,
        invoice_url: invoiceUrl,
        agreement_url: agreementUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([payload])
        .select();

      if (error) {
        alert(`Failed to save client: ${error.message}`);
        return;
      }

      if (data) {
        await fetchCustomers();
        setIsNewClientModalOpen(false);
      }
    } catch (err) {
      console.error('Error adding client:', err);
    }
  };

  const handleUpdateClient = async (updatedClient: FullClientRecord & { paymentReceiptFile?: File | null; customerInvoiceFile?: File | null; signedContractFile?: File | null }) => {
    try {
      const paymentProofUrl = updatedClient.paymentReceiptFile instanceof File
        ? await uploadFileToSupabase(updatedClient.paymentReceiptFile) 
        : (updatedClient.paymentReceipt instanceof File ? await uploadFileToSupabase(updatedClient.paymentReceipt) : updatedClient.paymentReceipt);

      const invoiceUrl = updatedClient.customerInvoiceFile instanceof File
        ? await uploadFileToSupabase(updatedClient.customerInvoiceFile) 
        : (updatedClient.customerInvoice instanceof File ? await uploadFileToSupabase(updatedClient.customerInvoice) : updatedClient.customerInvoice);

      const agreementUrl = updatedClient.signedContractFile instanceof File
        ? await uploadFileToSupabase(updatedClient.signedContractFile) 
        : (updatedClient.signedContract instanceof File ? await uploadFileToSupabase(updatedClient.signedContract) : updatedClient.signedContract);

      const payload = {
        full_name: updatedClient.clientName || '',
        contact_info: updatedClient.contactInfo || '',
        email: updatedClient.emailAddress || '',
        event_date: updatedClient.weddingDate || null,
        venue_address: updatedClient.venueAddress || '',
        estimated_guests: updatedClient.estimatedGuests || '',
        event_type: updatedClient.eventType || 'WEDDING',
        vow_ceremony: updatedClient.vowCeremony || 'NO',
        status: updatedClient.statusOfClient || 'NEW',
        total_payment: updatedClient.totalPayment || '',
        deposited_amount: updatedClient.depositedAmount || '',
        deposit_percentage: updatedClient.depositPercentage || '',
        notes: String(updatedClient.additionalNote || ''),
        payment_proof_url: paymentProofUrl,
        invoice_url: invoiceUrl,
        agreement_url: agreementUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('id', updatedClient.id);

      if (error) throw error;

      await fetchCustomers();
      setSelectedClient(updatedClient);
      setIsDetailsModalOpen(false);
    } catch (err) {
      console.error('Error updating client details:', err);
    }
  };

  const handleRowClick = (customer: FullClientRecord) => {
    setSelectedClient(customer);
    setIsDetailsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    document.cookie = 'auth_token=; path=/; max-age=0;';
    router.push('/login');
    router.refresh();
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (customer.clientName && customer.clientName.toLowerCase().includes(query)) ||
      (customer.contactInfo && customer.contactInfo.includes(query)) ||
      (customer.venueAddress && customer.venueAddress.toLowerCase().includes(query));

    const matchesFilter = activeFilter === 'ALL' || customer.statusOfClient === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PAYED FULL':
      case 'PAID FULL':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'BOOKED(PAID HALF)':
      case 'BOOKED':
      case 'PAID HALF':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'ARCHIVED':
        return 'bg-gray-200 text-gray-700 border border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

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

            <Link href="/customers" className="flex items-center gap-3 px-4 py-3 rounded-md bg-white text-black transition shadow-sm font-bold">
              <User size={18} />
              <span>CUSTOMERS</span>
            </Link>

            <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-300 hover:text-white hover:bg-zinc-900 transition">
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
      <main className="flex-1 h-full flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden bg-black text-white p-2.5 rounded-xl hover:bg-zinc-800 transition shadow-md cursor-pointer">
              <Menu size={20} />
            </button>
            <h2 className="text-xl sm:text-2xl font-serif tracking-widest font-normal uppercase text-black">
              CUSTOMERS
            </h2>
          </div>

          <button onClick={() => setIsNewClientModalOpen(true)} className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase hover:bg-zinc-800 transition shadow cursor-pointer">
            + ADD CLIENT
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <input
            type="text"
            placeholder="Search by name, phone or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-72 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-black"
          />

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase transition shrink-0 cursor-pointer ${
                  activeFilter === status
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs font-sans min-w-[650px]">
            <thead className="bg-gray-50 border-b border-gray-200 uppercase font-serif text-[11px] tracking-wider text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="p-4">Last Updated</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Day of Event</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Event Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex justify-center items-center gap-2 text-gray-500 font-medium">
                      <Loader2 size={20} className="animate-spin" />
                      Loading clients from Supabase...
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleRowClick(customer)}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="p-4 text-gray-500 font-mono text-[11px]">{customer.lastUpdated}</td>
                    <td className="p-4 font-semibold text-gray-900">{customer.clientName || '-'}</td>
                    <td className="p-4 text-gray-700">{customer.weddingDate || '-'}</td>
                    <td className="p-4 text-gray-700 font-mono">{customer.contactInfo || '-'}</td>
                    <td className="p-4 text-gray-600">{customer.venueAddress || '-'}</td>
                    <td className="p-4">
                      <select
                        value={customer.statusOfClient}
                        onChange={(e) => handleStatusChange(e, customer.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full cursor-pointer outline-none ${getStatusBadgeStyle(customer.statusOfClient)}`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="BOOKED(PAID HALF)">BOOKED(PAID HALF)</option>
                        <option value="PAYED FULL">PAYED FULL</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      {customer.statusOfClient === 'ARCHIVED' ? (
                        <button
                          onClick={(e) => handleDeleteCustomer(e, customer.id, customer.clientName)}
                          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition cursor-pointer"
                          title="Delete Client Permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-medium">
                    No client records found. Click <strong className="text-black">+ ADD CLIENT</strong> to create your first client entry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSave={handleSaveNewClient}
      />

      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        client={selectedClient}
        onClose={() => setIsDetailsModalOpen(false)}
        onUpdateClient={handleUpdateClient}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#ECECEC]">Loading Customers...</div>}>
      <CustomersContent />
    </Suspense>
  );
}