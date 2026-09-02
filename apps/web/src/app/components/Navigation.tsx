'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'chats', label: 'Чаты', path: '/chats', icon: '💬' },
  { id: 'groups', label: 'Группы', path: '/groups', icon: '👥' },
  { id: 'channels', label: 'Каналы', path: '/channels', icon: '#️⃣' },
  { id: 'calls', label: 'Звонки', path: '/calls', icon: '📞' },
  { id: 'stories', label: 'Истории', path: '/stories', icon: '📖' },
  { id: 'contacts', label: 'Контакты', path: '/contacts', icon: '👤' },
  { id: 'settings', label: 'Параметры', path: '/settings', icon: '⚙️' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hide nav on auth pages
  if (!isAuthenticated || pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:fixed md:left-0 md:top-0 md:w-20 md:h-screen md:bg-telegram-blue md:flex md:flex-col md:items-center md:py-4 md:gap-4 md:z-40">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.id}
              href={item.path}
              title={item.label}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition transform hover:scale-110 ${
                isActive
                  ? 'bg-white bg-opacity-30'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              {item.icon}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Content Offset */}
      <div className="hidden md:block md:w-20"></div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-telegram-border flex justify-around items-center h-16 z-40">
        {NAV_ITEMS.slice(0, 6).map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition ${
                isActive
                  ? 'text-telegram-blue'
                  : 'text-telegram-text-secondary hover:text-telegram-text'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
        {/* Settings in mobile menu */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="flex-1 h-full flex flex-col items-center justify-center gap-1 text-telegram-text-secondary hover:text-telegram-text transition"
        >
          <span className="text-xl">⋯</span>
          <span className="text-xs">Меню</span>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowMobileMenu(false)}>
          <div
            className="absolute bottom-16 right-0 bg-white rounded-tl-lg rounded-tr-lg shadow-lg p-4 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              {NAV_ITEMS.slice(6).map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-telegram-bg-hover transition"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-telegram-text font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Content Bottom Padding */}
      <div className="md:hidden h-16"></div>
    </>
  );
}
