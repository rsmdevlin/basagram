import React, { useState } from 'react';
import { MenuIcon, CloseIcon } from '@basagram/ui';

interface LayoutProps {
  children: React.ReactNode;
}

export const RootLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-neutral-950">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white">Basagram</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          {sidebarOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav
        className={`
          fixed md:static md:w-64 w-full h-screen md:h-auto top-12 md:top-0 left-0 right-0
          bg-neutral-900 border-r border-neutral-800 z-40
          transform transition-transform duration-300 md:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="hidden md:flex items-center px-6 py-8">
          <h1 className="text-2xl font-bold text-white">Basagram</h1>
        </div>

        <div className="flex flex-col h-full overflow-y-auto">
          {/* Navigation Items */}
          <div className="px-4 py-6 space-y-2">
            <NavItem icon="💬" label="Чаты" href="/chats" />
            <NavItem icon="📞" label="Звонки" href="/calls" />
            <NavItem icon="📖" label="Истории" href="/stories" />
            <NavItem icon="📢" label="Каналы" href="/channels" />
            <NavItem icon="👥" label="Группы" href="/groups" />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Navigation */}
          <div className="px-4 py-6 space-y-2 border-t border-neutral-800">
            <NavItem icon="⚙️" label="Настройки" href="/settings" />
            <NavItem icon="👤" label="Профиль" href="/profile" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href }) => {
  return (
    <a
      href={href}
      className="flex items-center px-4 py-3 rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
    >
      <span className="text-xl mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
};
