
import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { ThemeProvider } from '../context/ThemeContext';

const RootLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="gm-theme">
      <div className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors duration-300 dark:bg-dark-bg dark:text-white font-sans">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default RootLayout;
