import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ClientItem } from '../../types/client';
import { clientService } from '../../services/clientService';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Power,
  Wrench,
  Building,
  FolderGit2,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

export function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Load clients
  const loadClientData = async () => {
    setLoading(true);
    const data = await clientService.getClients();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClientData();
  }, []);

  const handleToggleStatus = async (id: string) => {
    const updated = await clientService.toggleClientStatus(id);
    setClients(updated);
    setActiveMenuId(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this client? This will remove all their projects and data.')) {
      const updated = await clientService.deleteClient(id);
      setClients(updated);
      setActiveMenuId(null);
    }
  };

  const handleOpenEditPage = (clientId: string) => {
    navigate(`/admin/clients/edit/${clientId}`);
  };

  const handleOpenCreatePage = () => {
    navigate('/admin/clients/edit/new');
  };

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = clients.filter((c) => c.status === 'active').length;
  const totalBilledVal = clients.reduce((acc, c) => {
    const val = parseInt(c.totalBilled.replace(/[^0-9]/g, '')) || 0;
    return acc + val;
  }, 0);

  return (
    <>
      <SEO
        title="Client Management Directory - GM Digital Studio Admin"
        description="Manage active client accounts, provision portal access, and configure studio tool permissions."
      />

      <div className="space-y-6 font-sans">
        
        {/* Top Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Client Directory & Accounts
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Provision client accounts, manage service packages, and configure studio tool entitlements.
            </p>
          </div>

          <button
            onClick={handleOpenCreatePage}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Provision New Client
          </button>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Provisioned Clients</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{clients.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Accounts</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Billed Revenue</p>
              <h3 className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                ${totalBilledVal.toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, email or company..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-600 text-xs transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-surface p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All Clients ({clients.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-dark-card text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Inactive ({clients.length - activeCount})
              </button>
            </div>
          </div>
        </div>

        {/* Client Directory Table */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading client directory...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-gray-400" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No clients match your filter query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Client & Company</th>
                    <th className="py-3.5 px-6">Package & Projects</th>
                    <th className="py-3.5 px-6">Tool Access Entitlements</th>
                    <th className="py-3.5 px-6">Total Billed</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border text-xs">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/50 transition-colors">
                      
                      {/* Client Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleOpenEditPage(client.id)}>
                          {client.avatarUrl && typeof client.avatarUrl === 'string' && client.avatarUrl.trim() !== '' ? (
                            <img
                              src={client.avatarUrl}
                              alt={client.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-dark-border flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm border border-brand-500/20 flex-shrink-0">
                              {client.fullName ? client.fullName.charAt(0).toUpperCase() : 'C'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white hover:text-brand-600 transition-colors">{client.fullName}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-brand-600" /> {client.company}
                            </p>
                            <p className="text-gray-400 text-[10px] mt-0.5">{client.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Package */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{client.assignedPackage}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <FolderGit2 className="w-3 h-3 text-gray-400" /> {client.activeProjectsCount} Active Projects
                        </p>
                      </td>

                      {/* Tool Entitlements Badge */}
                      <td className="py-4 px-6">
                        <div
                          onClick={() => handleOpenEditPage(client.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[11px] cursor-pointer hover:bg-brand-500/20 transition-colors"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>{client.allowedToolIds?.length || 0} Tools Enabled</span>
                        </div>
                      </td>

                      {/* Total Billed */}
                      <td className="py-4 px-6 font-extrabold text-gray-900 dark:text-white">
                        {client.totalBilled}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {client.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-4 px-6 text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === client.id && (
                            <div className="absolute right-6 top-12 z-30 w-48 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xl p-1 text-xs">
                              <button
                                onClick={() => handleOpenEditPage(client.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface text-left cursor-pointer font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-brand-600" /> Edit Profile & Tools
                              </button>
                              <button
                                onClick={() => handleToggleStatus(client.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface text-left cursor-pointer font-medium"
                              >
                                <Power className="w-3.5 h-3.5 text-gray-500" />
                                {client.status === 'active' ? 'Deactivate Client' : 'Activate Client'}
                              </button>
                              <div className="my-1 border-t border-gray-100 dark:border-dark-border" />
                              <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left cursor-pointer font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Client
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default Clients;
