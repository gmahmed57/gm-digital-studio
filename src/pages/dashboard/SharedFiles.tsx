import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { folderService, type SharedFolder } from '../../services/folderService';
import { FolderOpen, ExternalLink, Cloud } from 'lucide-react';
import SEO from '../../components/common/SEO';

export function SharedFiles() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<SharedFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFolders = async () => {
      if (user?.id) {
        setIsLoading(true);
        const data = await folderService.getFoldersForClient(user.id);
        setFolders(data);
        setIsLoading(false);
      }
    };
    loadFolders();

    const handleUpdate = () => loadFolders();
    window.addEventListener('studio_folders_updated', handleUpdate);
    return () => window.removeEventListener('studio_folders_updated', handleUpdate);
  }, [user]);

  return (
    <>
      <SEO 
        title="Shared Files - Client Portal"
        description="Access your dedicated cloud storage folders, brand assets, and deliverables."
      />

      <div className="space-y-6 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Shared Cloud Folders
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Securely access your project deliverables, brand assets, and source files.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-dark-card rounded-3xl"></div>
            ))}
          </div>
        ) : folders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs hover:shadow-xl hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold mb-4 group-hover:scale-110 transition-transform">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {folder.folderName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Secure Google Drive Storage
                  </p>
                </div>
                
                <a
                  href={folder.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Access Folder
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-xs">
            <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-6">
              <FolderOpen className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2">
              No Folders Assigned Yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              Your studio admin has not linked any dedicated cloud folders to your account yet. Check back later or contact support if you are expecting deliverables.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
