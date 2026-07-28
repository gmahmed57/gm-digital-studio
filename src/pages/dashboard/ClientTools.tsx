import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../services/clientService';
import { MASTER_STUDIO_TOOLS } from '../../constants/toolsData';
import type { ClientItem } from '../../types/client';
import {
  Wrench,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  FileSpreadsheet,
  Search,
  Palette,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import SEO from '../../components/common/SEO';

const ICON_MAP: Record<string, any> = {
  LayoutGrid,
  FileSpreadsheet,
  Sparkles,
  Search,
  Palette,
};

export function ClientTools() {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientItem | null>(null);
  const [requestSentMap, setRequestSentMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchClient = async () => {
      const clients = await clientService.getClients();
      // Match current logged in user email
      const matched = clients.find((c) => c.email.toLowerCase() === user?.email.toLowerCase());
      if (matched) {
        setClientData(matched);
      } else {
        // Fallback default client profile
        setClientData(clients[0]);
      }
    };
    fetchClient();
  }, [user]);

  const handleRequestAccess = (toolId: string) => {
    setRequestSentMap((prev) => ({ ...prev, [toolId]: true }));
  };

  const allowedIds = clientData?.allowedToolIds || ['file-converter', 'brand-kit'];

  return (
    <>
      <SEO
        title="Studio Tools & Add-ons Suite - GM Digital Studio Client Portal"
        description="Access your enabled studio software tools, AI content generators, file converters, and brand assets."
      />

      <div className="space-y-6 font-sans">
        
        {/* Consistent Top Header Card (Clean, Professional, Zero Pill Badges, Matches Theme) */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              Studio Tools & SaaS Utilities
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Launch unlocked automation tools assigned to your account or request access to premium studio add-ons.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-500/20">
              {allowedIds.length} of {MASTER_STUDIO_TOOLS.length} Tools Unlocked
            </span>
          </div>
        </div>

        {/* Tools Catalog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MASTER_STUDIO_TOOLS.map((tool) => {
            const isUnlocked = allowedIds.includes(tool.id);
            const IconComponent = ICON_MAP[tool.iconName] || Wrench;
            const isRequested = requestSentMap[tool.id];

            return (
              <div
                key={tool.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                  isUnlocked
                    ? 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border shadow-xs hover:shadow-md'
                    : 'bg-gray-50/70 dark:bg-dark-surface/60 border-gray-200 dark:border-dark-border opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                        isUnlocked
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked & Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        <Lock className="w-3.5 h-3.5" /> Locked Add-on
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {tool.category} • {tool.version}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                      {tool.name}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                  {isUnlocked ? (
                    <button
                      onClick={() => alert(`Launching ${tool.name}...`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      {tool.actionLabel || 'Launch Tool'} <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : isRequested ? (
                    <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs text-center flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Access Requested from Admin
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestAccess(tool.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-950 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      Request Tool Access <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}

export default ClientTools;
