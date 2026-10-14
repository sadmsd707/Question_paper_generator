import { useState, useEffect } from 'react';
import { Sidebar, TopBar } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreatePaper } from './pages/CreatePaper';
import { MyPapers } from './pages/MyPapers';
import { QuestionBank } from './pages/QuestionBank';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { useStore } from './store';

export default function App() {
  const { currentPage, fetchOnlineData } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchOnlineData();
  }, [fetchOnlineData]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':     return <Dashboard />;
      case 'create':        return <CreatePaper />;
      case 'my-papers':     return <MyPapers />;
      case 'question-bank': return <QuestionBank />;
      case 'templates':     return <Templates />;
      case 'settings':      return <Settings />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-warm-white)' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main content */}
      <div style={{
        flex: 1,
        marginLeft: 240,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}
        className="max-lg:ml-0"
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
