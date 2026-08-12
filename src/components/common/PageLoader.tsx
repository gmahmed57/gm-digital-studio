import logo from '../../assets/icon-logo.png';

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-colors duration-300 dark:bg-[#090d16]">
      {/* Top Animated Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <div className="h-full w-full origin-left animate-[pulse_1.2s_ease-in-out_infinite] bg-brand-500" />
      </div>

      {/* Centered Brand Loading Card */}
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 p-3 shadow-md ring-1 ring-gray-200/50 dark:bg-gray-900 dark:ring-gray-800">
          <img
            src={logo}
            alt="GM Digital Studio"
            className="h-10 w-10 animate-pulse object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-outfit text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">
            GM Digital Studio
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Loading workspace application...
          </p>
        </div>

        {/* Subtle Loading Spinner */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-2 w-2 animate-ping rounded-full bg-brand-500" />
          <span className="h-2 w-2 animate-ping rounded-full bg-brand-500 [animation-delay:0.2s]" />
          <span className="h-2 w-2 animate-ping rounded-full bg-brand-500 [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
