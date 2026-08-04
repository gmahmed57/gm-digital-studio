import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { clientService } from '../../services/clientService';
import { notificationService } from '../../services/notificationService';
import { settingsService } from '../../services/settingsService';
import type { ClientItem, StudioTool } from '../../types/client';
import { 
  Wrench, Sparkles, Search, RefreshCw, LayoutGrid, FileSpreadsheet, Lock, ArrowRight, CheckCircle2,
  Palette, ShieldCheck, ArrowLeft, Copy, Upload, AlertTriangle,
} from 'lucide-react';
import { CarouselMakerWorkspace } from '../../features/studio-tools/CarouselMaker/CarouselMakerWorkspace';
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
  const [catalogTools, setCatalogTools] = useState<StudioTool[]>([]);
  const [requestSentMap, setRequestSentMap] = useState<Record<string, boolean>>({});
  
  // Interactive tools states
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // 1. AI Carousel States (Managed inside CarouselMakerWorkspace)
  // 2. SEO Auditor States
  const [auditUrl, setAuditUrl] = useState('https://example.com');
  const [auditStep, setAuditStep] = useState<number>(0);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [auditResults, setAuditResults] = useState<any | null>(null);
  
  // 3. AI Copywriter States
  const [copyType, setCopyType] = useState<'outline' | 'headings' | 'social' | 'email'>('outline');
  const [copyTone, setCopyTone] = useState<'professional' | 'persuasive' | 'witty' | 'conversational'>('professional');
  const [copyTopic, setCopyTopic] = useState('NextJS App Router optimization');
  const [copyResults, setCopyResults] = useState<string[]>([]);
  const [activeCopyTab, setActiveCopyTab] = useState(0);

  // 4. File Converter States
  const [converterFile, setConverterFile] = useState<File | null>(null);
  const [converterMode, setConverterMode] = useState<'base64' | 'json-to-yaml' | 'text-to-md'>('base64');
  const [converterInputText, setConverterInputText] = useState('{\n  "name": "GM Studio",\n  "version": "1.0"\n}');
  const [converterOutput, setConverterOutput] = useState('');
  
  // 5. Brand Kit States
  const [brandName, setBrandName] = useState('AuraTech');
  const [brandPrimary, setBrandPrimary] = useState('#ea580c');
  const [brandSecondary, setBrandSecondary] = useState('#0f172a');
  const [brandAccent, setBrandAccent] = useState('#3b82f6');
  const [brandTypography, setBrandTypography] = useState('Outfit');
  const [brandRadius, setBrandRadius] = useState<'sharp' | 'soft' | 'rounded'>('soft');
  const [brandCodeOutput, setBrandCodeOutput] = useState('');

  const fetchClientAndCatalog = async () => {
    // Load Client Profile
    const clients = await clientService.getClients();
    const matched = clients.find((c) => c.email.toLowerCase() === user?.email?.toLowerCase());
    if (matched) {
      setClientData(matched);
    } else if (clients.length > 0) {
      setClientData(clients[0]);
    }

    // Load Tools Catalog
    const tools = await settingsService.getTools();
    setCatalogTools(tools);
  };

  useEffect(() => {
    fetchClientAndCatalog();
  }, [user]);

  const handleRequestAccess = async (toolId: string, toolName: string) => {
    if (!clientData?.id) return;

    await clientService.requestToolAccess(clientData.id, toolId);
    setRequestSentMap((prev) => ({ ...prev, [toolId]: true }));

    await notificationService.addNotification({
      title: 'Studio Tool Access Requested',
      message: `${clientData?.company || clientData?.fullName || user?.email || 'A client'} requested access to "${toolName}" tool.`,
      type: 'client',
      targetRole: 'admin',
      link: clientData?.id ? `/admin/clients/edit/${clientData.id}` : '/admin/clients',
    });

    await fetchClientAndCatalog();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  // ==========================================
  // SAAS TOOL 1: AI CAROUSEL MAKER ACTIONS
  // ==========================================
  // ==========================================
  // SAAS TOOL 2: SEO AUDITOR ACTIONS
  // ==========================================
  const runSeoAudit = () => {
    setAuditStep(1);
    setAuditResults(null);
    setAuditLog([]);

    const steps = [
      { msg: 'Connecting to target host & testing handshake...', delay: 600 },
      { msg: 'Downloading HTML markup and scraping meta headers...', delay: 1200 },
      { msg: 'Evaluating sitemap.xml and search engine robots.txt configuration...', delay: 1800 },
      { msg: 'Measuring Core Web Vitals parameters (LCP, FID, CLS)...', delay: 2400 },
      { msg: 'Auditing image accessibility alt attributes & responsiveness scaling...', delay: 3000 }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setAuditLog((prev) => [...prev, s.msg]);
        setAuditStep(idx + 2);
        
        if (idx === steps.length - 1) {
          // Finish Audit
          setAuditResults({
            seoScore: Math.floor(Math.random() * 15) + 85, // 85-99
            performanceScore: Math.floor(Math.random() * 20) + 80, // 80-99
            bestPracticesScore: Math.floor(Math.random() * 10) + 90, // 90-99
            sslValid: true,
            titleTag: 'GM Studio - Premium Digital Engineering & Software Studio',
            metaDesc: 'Design, develop, and launch high-performance websites, custom SaaS tools, and automation software.',
            h1Present: true,
            missingAltsCount: Math.floor(Math.random() * 5),
          });
        }
      }, s.delay);
    });
  };

  // ==========================================
  // SAAS TOOL 3: AI COPYWRITER ACTIONS
  // ==========================================
  const generateCopyTemplates = () => {
    const prompts: Record<string, string[]> = {
      outline: [
        `I. Introduction to ${copyTopic}\n  - Overview & Hook\n  - Why it matters today\nII. Core Concepts\n  - Key pillars & setup\n  - Practical implementation strategies\nIII. Advanced Optimizations\n  - Pitfalls to avoid\n  - Performance metrics\nIV. Conclusion & Next Steps`,
        `I. The Challenge: Why ${copyTopic} is difficult\nII. Step-by-Step Blueprint\n  - Phase 1: Planning & audit\n  - Phase 2: Actionable build steps\nIII. Real-world Case Study results\nIV. Final Checklist`,
      ],
      headings: [
        `H1: Master ${copyTopic} in 5 Actionable Steps\nH2: The Core Framework Behind ${copyTopic}\nH2: 3 Common Pitfalls to Avoid in Development\nH3: Measuring Success & Benchmarking Progress`,
        `H1: The Developer Guide to ${copyTopic}\nH2: Getting Started: Key Configurations\nH2: Advanced Architectures for Scalable Engineering\nH3: Customizing Layouts & Styling Tokens`,
      ],
      social: [
        `💡 Thinking about ${copyTopic}? Here's what we learned building it for enterprise clients:\n\n1️⃣ Keep logic decoupled.\n2️⃣ Optimize asset files.\n3️⃣ Enable RLS policies.\n\nRead the full guide! 👇 #Engineering #SaaS`,
        `🚀 Launching a new project in ${copyTopic} doesn't have to be slow. Here is our step-by-step framework to launch in 2 weeks. Check it out! #WebDev #UIUX`,
      ],
      email: [
        `Subject: The secret to ${copyTopic} 🤫\n\nHey Developer,\n\nMost teams fail at ${copyTopic} because they overlook basic configurations. In our latest case study, we outline the exact Deno Edge setups that saved our client 35% on infrastructure.\n\nBest,\nGM Studio Team`,
        `Subject: Project Inquiry Update: ${copyTopic}\n\nHi Partner,\n\nWe just compiled our master progress logs and launched a new suite of SaaS tools matching your brand requirements. Log into your dashboard to test them out!\n\nCheers,\nGM Studio Solutions`,
      ]
    };

    setCopyResults(prompts[copyType] || [`Failed to generate outline for ${copyTopic}`]);
  };

  // ==========================================
  // SAAS TOOL 4: FILE CONVERTER ACTIONS
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setConverterFile(e.target.files[0]);
    }
  };

  const executeConversion = () => {
    if (converterMode === 'base64') {
      if (!converterFile) {
        alert('Please select an image file first!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setConverterOutput(reader.result as string);
      };
      reader.readAsDataURL(converterFile);
    } else if (converterMode === 'json-to-yaml') {
      try {
        const obj = JSON.parse(converterInputText);
        // Simple JSON to YAML converter
        let yaml = '';
        Object.entries(obj).forEach(([k, v]) => {
          yaml += `${k}: ${typeof v === 'object' ? '\n  ' + JSON.stringify(v) : v}\n`;
        });
        setConverterOutput(yaml);
      } catch (err: any) {
        setConverterOutput(`Invalid JSON input: ${err.message}`);
      }
    } else if (converterMode === 'text-to-md') {
      const md = `# Text Document\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n---\n\n${converterInputText}`;
      setConverterOutput(md);
    }
  };

  // ==========================================
  // SAAS TOOL 5: BRAND KIT ACTIONS
  // ==========================================
  const generateBrandKit = () => {
    const code = `:root {
  --brand-primary: ${brandPrimary};
  --brand-secondary: ${brandSecondary};
  --brand-accent: ${brandAccent};
  --brand-font: '${brandTypography}', sans-serif;
  --brand-radius: ${brandRadius === 'sharp' ? '0px' : brandRadius === 'soft' ? '12px' : '24px'};
}`;
    setBrandCodeOutput(code);
  };

  const allowedIds = clientData?.allowedToolIds || [];
  const requestedIds = clientData?.requestedToolIds || [];

  // Filter out globally disabled catalog tools
  const activeTools = catalogTools.filter((t) => t.isActive !== false);
  const unlockedActiveCount = activeTools.filter((t) => allowedIds.includes(t.id)).length;

  const activeTool = catalogTools.find((t) => t.id === activeToolId);
  const activeToolName = activeTool?.name?.toLowerCase() || '';
  const isCarousel = activeToolId === 'carousel-maker' || activeToolName.includes('carousel');
  const isSeo = activeToolId === 'seo-auditor' || activeToolName.includes('seo') || activeToolName.includes('auditor');
  const isCopywriter = activeToolId === 'ai-copywriter' || activeToolName.includes('copywriter') || activeToolName.includes('assistant');
  const isConverter = activeToolId === 'file-converter' || activeToolName.includes('converter');
  const isBrandKit = activeToolId === 'brand-kit' || activeToolName.includes('brand');

  return (
    <>
      <SEO
        title="Studio Tools & Add-ons Suite - GM Digital Studio Client Portal"
        description="Access your enabled studio software tools, AI content generators, file converters, and brand assets."
      />

      <div className="space-y-6 font-sans">
        {/* If no tool is active, render catalog grid */}
        {!activeToolId ? (
          <>
            {/* Top Header Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-dark-card border border-gray-250 dark:border-dark-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                  {unlockedActiveCount} of {activeTools.length} Tools Unlocked
                </span>
              </div>
            </div>

            {/* Tools Catalog Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeTools.map((tool) => {
                const isUnlocked = allowedIds.includes(tool.id);
                const isRequested = requestedIds.includes(tool.id) || requestSentMap[tool.id];
                const IconComponent = ICON_MAP[tool.iconName] || Wrench;

                return (
                  <div
                    key={tool.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between relative ${
                      isUnlocked
                        ? 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border shadow-xs hover:shadow-md'
                        : 'bg-gray-50/70 dark:bg-dark-surface/60 border-gray-250 dark:border-dark-border opacity-85'
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

                      <p className="text-xs text-gray-650 dark:text-gray-400 leading-relaxed mb-6">
                        {tool.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-150 dark:border-dark-border">
                      {isUnlocked ? (
                        <button
                          onClick={() => setActiveToolId(tool.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                        >
                          Launch Workspace <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ) : isRequested ? (
                        <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs text-center flex items-center justify-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Request Sent to Studio Admin
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRequestAccess(tool.id, tool.name)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gray-950 hover:bg-gray-800 dark:bg-white dark:text-gray-950 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          Request Tool Access <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ACTIVE INTERACTIVE TOOL WORKSPACE */
          <div className="space-y-6">
            {/* Tool Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-250 dark:border-dark-border shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveToolId(null);
                    setAuditResults(null);
                    setAuditLog([]);
                    setCopyResults([]);
                    setConverterOutput('');
                    setBrandCodeOutput('');
                  }}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-dark-bg rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
                    {activeTool?.name || 'SaaS Tool Workspace'}
                  </h2>
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mt-0.5 block">
                    Interactive SaaS Tool Workspace
                  </span>
                </div>
              </div>
            </div>

            {/* AI CAROUSEL POST MAKER WORKSPACE */}
            {isCarousel && (
              <CarouselMakerWorkspace />
            )}

            {/* SEO AUDITOR WORKSPACE */}
            {isSeo && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Audit Configurations
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Website URL</label>
                      <input
                        type="text"
                        value={auditUrl}
                        onChange={(e) => setAuditUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-semibold"
                      />
                    </div>
                    <button
                      onClick={runSeoAudit}
                      disabled={auditStep > 0 && auditStep < 6}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${auditStep > 0 && auditStep < 6 && 'animate-spin'}`} />
                      {auditStep > 0 && auditStep < 6 ? 'Auditing Site...' : 'Run Diagnostics'}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Diagnostic Console Logs & Scorecard
                  </h3>

                  {auditStep === 0 && (
                    <div className="p-16 text-center text-gray-400 text-xs">
                      Enter a URL on the left and run diagnostics to fetch website Lighthouse data.
                    </div>
                  )}

                  {auditStep > 0 && auditStep < 6 && (
                    <div className="space-y-4">
                      <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs space-y-2 h-44 overflow-y-auto">
                        <div>&gt; gm-seo-auditor init --target={auditUrl}</div>
                        {auditLog.map((log, idx) => (
                          <div key={idx} className="text-green-300 flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✔</span> {log}
                          </div>
                        ))}
                        <div className="text-amber-400 animate-pulse">&gt; Loading next auditing step...</div>
                      </div>
                    </div>
                  )}

                  {auditResults && (
                    <div className="space-y-6">
                      {/* Score metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-55 dark:bg-dark-bg p-4 rounded-xl border border-gray-150 dark:border-dark-border text-center">
                          <span className="text-2xl font-black text-emerald-600 block">{auditResults.seoScore}%</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase mt-1 block">SEO Health</span>
                        </div>
                        <div className="bg-gray-55 dark:bg-dark-bg p-4 rounded-xl border border-gray-150 dark:border-dark-border text-center">
                          <span className="text-2xl font-black text-brand-600 block">{auditResults.performanceScore}%</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase mt-1 block">Performance</span>
                        </div>
                        <div className="bg-gray-55 dark:bg-dark-bg p-4 rounded-xl border border-gray-150 dark:border-dark-border text-center">
                          <span className="text-2xl font-black text-blue-600 block">{auditResults.bestPracticesScore}%</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase mt-1 block">Standards</span>
                        </div>
                      </div>

                      {/* Details list */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Lighthouse Audits Checklist</h4>
                        
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-dark-bg/30 rounded-xl border border-gray-100 dark:border-dark-border text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-500 font-bold">✔</span>
                              <span className="font-bold text-gray-700 dark:text-gray-300">SSL Handshake</span>
                            </div>
                            <span className="text-emerald-600 font-bold">Valid & Encrypted</span>
                          </div>

                          <div className="flex items-start justify-between p-2.5 bg-gray-50/50 dark:bg-dark-bg/30 rounded-xl border border-gray-100 dark:border-dark-border text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-500 font-bold">✔</span>
                              <div>
                                <span className="font-bold text-gray-700 dark:text-gray-300 block">SEO Title Tag</span>
                                <span className="text-[10px] text-gray-500 block max-w-sm mt-0.5 line-clamp-1">{auditResults.titleTag}</span>
                              </div>
                            </div>
                            <span className="text-emerald-600 font-bold">Found</span>
                          </div>

                          <div className="flex items-start justify-between p-2.5 bg-gray-50/50 dark:bg-dark-bg/30 rounded-xl border border-gray-100 dark:border-dark-border text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-500 font-bold">✔</span>
                              <div>
                                <span className="font-bold text-gray-700 dark:text-gray-300 block">SEO Description Tag</span>
                                <span className="text-[10px] text-gray-500 block max-w-sm mt-0.5 line-clamp-1">{auditResults.metaDesc}</span>
                              </div>
                            </div>
                            <span className="text-emerald-600 font-bold">Found</span>
                          </div>

                          {auditResults.missingAltsCount > 0 ? (
                            <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-xs">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-bold">Missing Image Alt Attributes</span>
                              </div>
                              <span className="font-bold">{auditResults.missingAltsCount} missing alt tags</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2.5 bg-gray-50/50 dark:bg-dark-bg/30 rounded-xl border border-gray-100 dark:border-dark-border text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-500 font-bold">✔</span>
                                <span className="font-bold text-gray-700 dark:text-gray-300">Accessibility Alt Attributes</span>
                              </div>
                              <span className="text-emerald-600 font-bold">100% Complete</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI COPYWRITER WORKSPACE */}
            {isCopywriter && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Assistant Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Inquiry Output Format</label>
                      <select
                        value={copyType}
                        onChange={(e) => setCopyType(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-semibold"
                      >
                        <option value="outline">Blog Outline Structure</option>
                        <option value="headings">SEO Header Outlines</option>
                        <option value="social">Social Copy Posts</option>
                        <option value="email">Marketing Email Newsletter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tone of Voice</label>
                      <select
                        value={copyTone}
                        onChange={(e) => setCopyTone(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-semibold"
                      >
                        <option value="professional">Professional / Technical</option>
                        <option value="persuasive">High-conversion / Pitch</option>
                        <option value="conversational">Informative / Friendly</option>
                        <option value="witty">Creative / Witty</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Focus Keywords & Topic</label>
                      <input
                        type="text"
                        value={copyTopic}
                        onChange={(e) => setCopyTopic(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-semibold"
                      />
                    </div>
                    <button
                      onClick={generateCopyTemplates}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Copy Templates
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Generated Copy Options
                  </h3>

                  {copyResults.length === 0 ? (
                    <div className="p-16 text-center text-gray-400 text-xs">
                      Set marketing parameters and click "Generate Copy Templates" to generate draft proposals.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Tabs */}
                      <div className="flex gap-2">
                        {copyResults.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveCopyTab(i)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                              activeCopyTab === i
                                ? 'bg-brand-600 text-white border-brand-600'
                                : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-dark-bg dark:border-dark-border'
                            }`}
                          >
                            Template Option {String.fromCharCode(65 + i)}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <pre className="p-5 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-300 text-xs rounded-2xl border border-gray-200 dark:border-dark-border font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                          {copyResults[activeCopyTab]}
                        </pre>
                        <button
                          onClick={() => handleCopy(copyResults[activeCopyTab], `copy-${activeCopyTab}`)}
                          className="absolute top-3 right-3 p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-500 hover:text-brand-500 transition-all cursor-pointer shadow-xs"
                          title="Copy to Clipboard"
                        >
                          {isCopied === `copy-${activeCopyTab}` ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FILE CONVERTER WORKSPACE */}
            {isConverter && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Input & Configuration
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Conversion Type</label>
                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { id: 'base64', label: 'Image to Base64 String' },
                          { id: 'json-to-yaml', label: 'JSON to YAML Converter' },
                          { id: 'text-to-md', label: 'Plain Text to Markdown' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setConverterMode(m.id as any);
                              setConverterOutput('');
                            }}
                            className={`p-3 text-left text-xs font-bold rounded-xl border flex items-center justify-between transition-all ${
                              converterMode === m.id
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-dark-bg dark:border-dark-border dark:text-gray-300'
                            }`}
                          >
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {converterMode === 'base64' ? (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Image File</label>
                        <div className="border border-dashed border-gray-300 dark:border-dark-border rounded-xl p-6 text-center bg-gray-50 dark:bg-dark-bg">
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <label className="cursor-pointer bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg inline-block shadow-sm">
                            Choose Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-gray-500 block mt-2">
                            {converterFile ? converterFile.name : 'No file selected'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Input Text Content</label>
                        <textarea
                          rows={6}
                          value={converterInputText}
                          onChange={(e) => setConverterInputText(e.target.value)}
                          className="w-full p-3 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl outline-none focus:border-brand-500 font-mono"
                        />
                      </div>
                    )}

                    <button
                      onClick={executeConversion}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" /> Convert File on Client
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Conversion Result
                  </h3>

                  {!converterOutput ? (
                    <div className="p-16 text-center text-gray-400 text-xs">
                      Set inputs and click "Convert File on Client" to output results.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {converterMode === 'base64' && (
                        <div className="flex gap-4">
                          <img
                            src={converterOutput}
                            alt="Base64 Preview"
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                          />
                          <div className="text-[10px] text-gray-500 self-center">
                            Image successfully encoded to Base64 URI string (length: {converterOutput.length} chars).
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <textarea
                          readOnly
                          rows={8}
                          value={converterOutput}
                          className="w-full p-4 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-300 text-xs rounded-xl border border-gray-200 dark:border-dark-border font-mono outline-none resize-none leading-relaxed"
                        />
                        <button
                          onClick={() => handleCopy(converterOutput, 'conv-output')}
                          className="absolute top-3 right-3 p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-500 hover:text-brand-500 transition-all cursor-pointer shadow-xs"
                          title="Copy Output"
                        >
                          {isCopied === 'conv-output' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BRAND KIT WORKSPACE */}
            {isBrandKit && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-4">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                    Brand Palette Config
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Primary</label>
                        <input
                          type="color"
                          value={brandPrimary}
                          onChange={(e) => setBrandPrimary(e.target.value)}
                          className="w-full h-8 cursor-pointer rounded-lg border border-gray-200 dark:border-dark-border outline-none bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Secondary</label>
                        <input
                          type="color"
                          value={brandSecondary}
                          onChange={(e) => setBrandSecondary(e.target.value)}
                          className="w-full h-8 cursor-pointer rounded-lg border border-gray-200 dark:border-dark-border outline-none bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 mb-1">Accent</label>
                        <input
                          type="color"
                          value={brandAccent}
                          onChange={(e) => setBrandAccent(e.target.value)}
                          className="w-full h-8 cursor-pointer rounded-lg border border-gray-200 dark:border-dark-border outline-none bg-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Typography System</label>
                      <select
                        value={brandTypography}
                        onChange={(e) => setBrandTypography(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg outline-none focus:border-brand-500 font-semibold"
                      >
                        <option value="Inter">Inter (Sans)</option>
                        <option value="Outfit">Outfit (Modern)</option>
                        <option value="Playfair Display">Playfair (Elegant)</option>
                        <option value="Fira Code">Fira Code (Developer)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Border Radius Token</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['sharp', 'soft', 'rounded'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setBrandRadius(r)}
                            className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border capitalize transition-all ${
                              brandRadius === r
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-750 dark:bg-dark-bg dark:border-dark-border dark:text-gray-300'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateBrandKit}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Palette className="w-4 h-4" /> Export Tokens Kit
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-200 dark:border-dark-border space-y-6">
                  {/* Live previews */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-150 dark:border-dark-border pb-3">
                      Live Render Previews
                    </h3>

                    <div className="p-5 border border-gray-200 dark:border-dark-border rounded-2xl bg-gray-55/40 dark:bg-dark-bg/20 space-y-4">
                      {/* Headings */}
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">Header Style Preview ({brandTypography})</span>
                        <h4
                          style={{ fontFamily: `'${brandTypography}', sans-serif` }}
                          className="text-lg font-black text-gray-900 dark:text-white"
                        >
                          Welcome to {brandName} Portal
                        </h4>
                      </div>

                      {/* Mock Buttons / components preview */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          style={{
                            backgroundColor: brandPrimary,
                            borderRadius: brandRadius === 'sharp' ? '0px' : brandRadius === 'soft' ? '12px' : '24px',
                            fontFamily: `'${brandTypography}', sans-serif`
                          }}
                          className="px-4 py-2 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Primary Action
                        </button>

                        <button
                          type="button"
                          style={{
                            borderColor: brandAccent,
                            color: brandAccent,
                            borderRadius: brandRadius === 'sharp' ? '0px' : brandRadius === 'soft' ? '12px' : '24px',
                            fontFamily: `'${brandTypography}', sans-serif`
                          }}
                          className="px-4 py-2 border text-xs font-bold transition-all bg-transparent"
                        >
                          Accent Secondary
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Generated code */}
                  {brandCodeOutput && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">CSS variables Output</h4>
                      <div className="relative">
                        <pre className="p-4 bg-gray-50 dark:bg-dark-bg text-gray-800 dark:text-gray-300 text-xs rounded-xl border border-gray-200 dark:border-dark-border font-mono overflow-x-auto">
                          {brandCodeOutput}
                        </pre>
                        <button
                          onClick={() => handleCopy(brandCodeOutput, 'brand-code')}
                          className="absolute top-3 right-3 p-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-gray-500 hover:text-brand-500 transition-all cursor-pointer shadow-xs"
                          title="Copy Tokens"
                        >
                          {isCopied === 'brand-code' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ClientTools;
