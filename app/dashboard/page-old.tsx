'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type InquiryStatus = 'NEW' | 'BOOKED(PAID HALF)' | 'PAYED FULL' | 'ARCHIVED';
type UserRole = 'admin' | 'staff';

interface ClientInquiry {
  id: number;
  created_at: string;
  updated_at?: string;
  full_name: string;
  email: string;
  phone: string;
  status: InquiryStatus;
  payment_proof_url?: string;
  agreement_url?: string;
  invoice_url?: string;
  notes?: string;
}

interface ActivityLog {
  id: number;
  created_at: string;
  client_id: number;
  action_type: string;
  details: string;
  performed_by: string;
  clients?: { full_name: string };
}

const STATUS_OPTIONS: InquiryStatus[] = [
  'NEW',
  'BOOKED(PAID HALF)',
  'PAYED FULL',
  'ARCHIVED',
];

const STATUS_COLORS: Record<InquiryStatus, string> = {
  'NEW': 'bg-blue-100 text-blue-800 border-blue-200',
  'BOOKED(PAID HALF)': 'bg-amber-100 text-amber-800 border-amber-200',
  'PAYED FULL': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'ARCHIVED': 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function DashboardPage() {
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<ClientInquiry | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [globalLogs, setGlobalLogs] = useState<ActivityLog[]>([]);
  const [showGlobalLogs, setShowGlobalLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const router = useRouter();

  const fetchInquiries = useCallback(async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error) {
      setInquiries(data || []);
    }
  }, []);

  const fetchGlobalLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, clients(full_name)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) {
      setGlobalLogs(data || []);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      setUserEmail(session.user.email || 'Staff Member');
      setUserRole((session.user.app_metadata?.role as UserRole) || 'staff');

      await fetchInquiries();
      await fetchGlobalLogs();
      setLoading(false);
    };

    init();
  }, [router, fetchInquiries, fetchGlobalLogs]);

  const fetchClientLogs = useCallback(async (clientId: number) => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (!error) {
      setLogs(data || []);
    }
    setLoadingLogs(false);
  }, []);

  const logActivity = async (clientId: number, actionType: string, details: string) => {
    await supabase.from('activity_logs').insert([
      {
        client_id: clientId,
        action_type: actionType,
        details,
        performed_by: userEmail,
      },
    ]);
    fetchClientLogs(clientId);
    fetchGlobalLogs();
  };

  const handleSelectClient = (client: ClientInquiry) => {
    setSelectedClient(client);
    setCurrentNotes(client.notes || '');
    setIsSaved(false);
    fetchClientLogs(client.id);
  };

  const handleStatusChange = async (id: number, newStatus: InquiryStatus) => {
    const oldStatus = inquiries.find((i) => i.id === id)?.status || 'NEW';

    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    if (selectedClient?.id === id) {
      setSelectedClient((prev) => prev ? { ...prev, status: newStatus } : null);
    }

    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error.message);
      alert('Failed to update status. Please try again.');
    } else {
      await logActivity(id, 'STATUS_UPDATE', `Changed status from ${oldStatus} to ${newStatus}`);
      fetchInquiries();
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;

    setSavingNotes(true);

    const { error } = await supabase
      .from('clients')
      .update({ notes: currentNotes, updated_at: new Date().toISOString() })
      .eq('id', selectedClient.id);

    setSavingNotes(false);

    if (error) {
      alert(`Error saving notes: ${error.message}`);
    } else {
      const updatedClient = { ...selectedClient, notes: currentNotes };
      setSelectedClient(updatedClient);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);

      await logActivity(selectedClient.id, 'NOTE_UPDATE', `Updated internal notes`);
      fetchInquiries();
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (userRole !== 'admin') {
      alert('Access denied. Only administrators can delete records.');
      return;
    }

    if (!confirm('Are you sure you want to delete this client record? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) {
      alert(`Error deleting record: ${error.message}`);
    } else {
      setSelectedClient(null);
      fetchInquiries();
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: 'payment_proof_url' | 'agreement_url' | 'invoice_url'
  ) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedClient) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${selectedClient.id}/${docType}-${Date.now()}.${fileExt}`;

    setUploading(docType);

    const { error: uploadError } = await supabase.storage
      .from('client-documents')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Upload error: ${uploadError.message}`);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('client-documents')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('clients')
      .update({ [docType]: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', selectedClient.id);

    setUploading(null);

    if (updateError) {
      alert(`Database update error: ${updateError.message}`);
    } else {
      const updatedClient = { ...selectedClient, [docType]: publicUrl };
      setSelectedClient(updatedClient);

      const docName = docType === 'payment_proof_url' ? 'Payment Proof' : docType === 'agreement_url' ? 'Agreement' : 'Invoice';
      await logActivity(selectedClient.id, 'FILE_UPLOAD', `Uploaded ${docName}`);
      fetchInquiries();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const metrics = useMemo(() => {
    const total = inquiries.length;
    const newInquiries = inquiries.filter((i) => (i.status || 'NEW') === 'NEW').length;
    const booked = inquiries.filter((i) => i.status === 'BOOKED(PAID HALF)' || i.status === 'PAYED FULL').length;
    return { total, newInquiries, booked };
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesSearch =
        (item.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (item.phone || '').includes(searchQuery) ||
        (item.notes?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedFilter === 'ALL' || (item.status || 'NEW') === selectedFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchQuery, selectedFilter]);

  const handleExportCSV = () => {
    if (filteredInquiries.length === 0) {
      alert('No data to export!');
      return;
    }

    const headers = ['ID', 'Date Updated', 'Full Name', 'Email', 'Phone', 'Status', 'Notes'];

    const rows = filteredInquiries.map((item) => [
      item.id,
      item.updated_at ? new Date(item.updated_at).toLocaleString() : new Date(item.created_at).toLocaleDateString(),
      `"${(item.full_name || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.status || 'NEW').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `client_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-800">Staff Portal Dashboard</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {userRole}
              </span>
            </div>
            <p className="text-sm text-gray-500">Manage client inquiries, notes, and track payments</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">{userEmail}</span>
            <button
              onClick={() => setShowGlobalLogs(true)}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>📜</span> Activity Stream
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Clients</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{metrics.total}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">New Inquiries</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{metrics.newInquiries}</h3>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Active Bookings</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{metrics.booked}</h3>
          </div>
        </div>

        {/* Search Bar, Filter Tabs & Export Button */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Search by name, email, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-wrap gap-2">
              {['ALL', ...STATUS_OPTIONS].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedFilter === status
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ml-0 md:ml-2 shadow-sm"
            >
              <span>📊</span> Export to Excel
            </button>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/50 text-gray-600 text-xs uppercase font-semibold border-b border-gray-100">
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Notes Preview</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No matching inquiries found.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectClient(item)}
                    className="hover:bg-gray-50/80 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        : new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.full_name || '-'}</td>
                    <td className="px-6 py-4 text-blue-600">{item.email || '-'}</td>
                    <td className="px-6 py-4">{item.phone || '-'}</td>
                    <td className="px-6 py-4 max-w-xs">
                      {item.notes ? (
                        <p className="truncate text-xs text-gray-600 italic">
                          "{item.notes}"
                        </p>
                      ) : (
                        <span className="text-xs text-gray-300">No notes</span>
                      )}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={item.status || 'NEW'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as InquiryStatus)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition ${
                          STATUS_COLORS[item.status || 'NEW']
                        }`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-white text-gray-800">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Activity Stream Slide-over Drawer */}
      {showGlobalLogs && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white shadow-2xl h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Global Activity</h2>
                <button
                  onClick={() => setShowGlobalLogs(false)}
                  className="text-gray-400 hover:text-gray-600 font-semibold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {globalLogs.length === 0 ? (
                  <p className="text-xs text-gray-400">No activity recorded yet.</p>
                ) : (
                  globalLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs">
                      <div className="flex justify-between font-semibold text-gray-800 mb-1">
                        <span>{log.performed_by || 'Staff'}</span>
                        <span className="text-gray-400 font-normal">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-600">{log.details}</p>
                      {log.clients?.full_name && (
                        <p className="mt-1 text-[10px] text-indigo-600 font-medium">
                          Client: {log.clients.full_name}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowGlobalLogs(false)}
              className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition"
            >
              Close Stream
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Detail Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white shadow-2xl h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Client Details & Notes</h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600 font-semibold text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-semibold text-gray-400">Full Name</label>
                  <p className="text-base font-medium text-gray-900">{selectedClient.full_name || 'N/A'}</p>
                </div>

                <div>
                  <label className="text-xs uppercase font-semibold text-gray-400">Contact Info</label>
                  <p className="text-sm text-blue-600">{selectedClient.email || 'N/A'}</p>
                  <p className="text-sm text-gray-800">{selectedClient.phone || 'N/A'}</p>
                </div>

                {/* Editable Staff Notes Section */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs uppercase font-semibold text-gray-400 block mb-1">
                    Edit Internal Notes
                  </label>
                  <textarea
                    rows={4}
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder="Type client notes or payment terms here..."
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className={`mt-2 w-full py-2 text-xs font-semibold rounded-md transition ${
                      isSaved
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-900 hover:bg-black text-white'
                    } disabled:opacity-50`}
                  >
                    {savingNotes ? 'Saving...' : isSaved ? 'Saved! ✓' : 'Update Note on Dashboard'}
                  </button>
                </div>

                {/* Document Uploads */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Client Files & Uploads</h3>

                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Payment Screenshot / Receipt</label>
                    {selectedClient.payment_proof_url ? (
                      <a
                        href={selectedClient.payment_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 underline font-medium hover:text-indigo-800"
                      >
                        View Payment Proof ↗
                      </a>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'payment_proof_url')}
                        disabled={uploading === 'payment_proof_url'}
                        className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Signed Agreement / Contract</label>
                    {selectedClient.agreement_url ? (
                      <a
                        href={selectedClient.agreement_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 underline font-medium hover:text-indigo-800"
                      >
                        View Signed Agreement ↗
                      </a>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'agreement_url')}
                        disabled={uploading === 'agreement_url'}
                        className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-medium text-gray-600 block mb-1">Customer Invoice</label>
                    {selectedClient.invoice_url ? (
                      <a
                        href={selectedClient.invoice_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 underline font-medium hover:text-indigo-800"
                      >
                        View Invoice ↗
                      </a>
                    ) : (
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, 'invoice_url')}
                        disabled={uploading === 'invoice_url'}
                        className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    )}
                  </div>
                </div>

                {/* Activity Log Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Activity Log</h3>
                  {loadingLogs ? (
                    <p className="text-xs text-gray-400">Loading history...</p>
                  ) : logs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No activity recorded yet.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {logs.map((log) => (
                        <div key={log.id} className="text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <div className="flex justify-between font-semibold text-gray-700 mb-0.5">
                            <span>{log.performed_by || 'Staff'}</span>
                            <span className="text-gray-400 font-normal">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-600">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-6 flex flex-col gap-2">
              {/* ADMIN ONLY DELETE BUTTON */}
              {userRole === 'admin' && (
                <button
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg transition border border-red-200"
                >
                  🗑 Delete Client Record (Admin Only)
                </button>
              )}

              <button
                onClick={() => setSelectedClient(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}