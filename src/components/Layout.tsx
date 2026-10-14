import React from 'react';
import {
  LayoutDashboard, FilePlus, FileText, BookOpen,
  Layout, Settings, ChevronRight, X, Menu
} from 'lucide-react';
import { useStore } from '../store';
import type { Page } from '../types';

const NAV_ITEMS: { icon: React.ReactNode; label: string; page: Page }[] = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', page: 'dashboard' },
  { icon: <FilePlus size={18} />, label: 'Create Paper', page: 'create' },
  { icon: <FileText size={18} />, label: 'My Papers', page: 'my-papers' },
  { icon: <BookOpen size={18} />, label: 'Question Bank', page: 'question-bank' },
  { icon: <Layout size={18} />, label: 'Templates', page: 'templates' },
  { icon: <Settings size={18} />, label: 'Settings', page: 'settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { currentPage, setPage, resetWizard } = useStore();

  const handleNav = (page: Page) => {
    if (page === 'create') resetWizard();
    setPage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          width: 240,
          background: 'white',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 40,
          transform: mobileOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease',
        }}
        className={!mobileOpen ? 'max-lg:translate-x-[-100%]' : ''}
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--color-terra)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 16,
              }}>Q</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-charcoal)', lineHeight: 1.2 }}>PaperGen</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Question Paper Builder</div>
              </div>
            </div>
            <button className="btn-ghost lg:hidden" onClick={onClose} style={{ padding: 6 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <div className="section-header-label" style={{ marginBottom: 10, marginTop: 4 }}>Navigation</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              className={`sidebar-link ${currentPage === item.page ? 'active' : ''}`}
              onClick={() => handleNav(item.page)}
            >
              {item.icon}
              {item.label}
              {currentPage === item.page && (
                <ChevronRight size={14} style={{ marginLeft: 'auto', color: 'var(--color-terra)' }} />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{
            background: 'var(--color-terra-bg)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-terra-dark)', marginBottom: 4 }}>
              PaperGen Pro
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.4 }}>
              Unlimited papers, question bank & PDF exports.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface TopBarProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  create: 'Create Question Paper',
  'my-papers': 'My Question Papers',
  'question-bank': 'Question Bank',
  templates: 'Templates',
  settings: 'Settings',
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { currentPage, teacher } = useStore();

  return (
    <header style={{
      height: 64,
      background: 'white',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 20,
      paddingRight: 24,
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      <button className="btn-ghost lg:hidden" onClick={onMenuClick} style={{ padding: 8 }}>
        <Menu size={20} />
      </button>

      <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-charcoal)', flex: 1 }}>
        {PAGE_TITLES[currentPage]}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Online Cloud indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          background: 'var(--color-green-light)',
          color: 'var(--color-green)',
          fontSize: 12,
          fontWeight: 600,
          border: '1px solid rgba(45, 122, 79, 0.2)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block' }} />
          Cloud Online
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
          onClick={() => useStore.getState().setPage('settings')}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-cream)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Profile & Settings"
        >
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--color-terra)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600,
          }}>
            {teacher.avatar || teacher.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-charcoal)', lineHeight: 1.2 }}>
              {teacher.name}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Educator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
