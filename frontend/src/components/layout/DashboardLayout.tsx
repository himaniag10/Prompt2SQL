import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Database, Settings, Menu, X, TerminalSquare, Bell, Sun, ChevronDown, User, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SchemaApiService } from '@/services/schema.service';
import { useAuth } from '@/context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dropdown states
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isSchemaDropdownOpen, setIsSchemaDropdownOpen] = useState(false);
  const [activeSchemaId, setActiveSchemaId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Schema migrated successfully', time: '2 hours ago', icon: 'database', color: 'bg-blue-500/10' },
    { id: 2, title: 'Team member joined project', time: '5 hours ago', icon: 'user', color: 'bg-emerald-500/10' },
    { id: 3, title: 'System update completed', time: '1 day ago', icon: 'settings', color: 'bg-primary/10' }
  ]);
  
  const { projectId } = useParams<{ projectId?: string }>();

  // Toggle dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: SchemaApiService.getProjects
  });

  const activeProject = projects?.find(p => p.id === projectId);

  const { data: schemas } = useQuery({
    queryKey: ['schemas', projectId],
    queryFn: () => SchemaApiService.getSchemas(projectId!),
    enabled: !!projectId && projectId !== 'undefined',
  });

  const activeSchema = schemas?.find(s => s.id === activeSchemaId);

  // If we navigate away from a project, reset the active schema
  useEffect(() => {
    if (!projectId) setActiveSchemaId(null);
  }, [projectId]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const projectRef = useRef<HTMLDivElement>(null);
  const schemaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotificationsOpen(false);
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) setIsProjectDropdownOpen(false);
      if (schemaRef.current && !schemaRef.current.contains(e.target as Node)) setIsSchemaDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Projects', href: '/projects', icon: LayoutDashboard },
    { name: 'Schema', href: '/schema', icon: Database },
    { name: 'Chat', href: '/chat', icon: TerminalSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-text selection:bg-primary/20">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="h-full border-r border-border bg-surface flex flex-col shadow-sm relative z-40 shrink-0 overflow-hidden"
      >
        {/* Sidebar Header / Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-max">
            <div className="w-8 h-8 rounded-[6px] bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-lg font-bold text-primary tracking-tight whitespace-nowrap overflow-hidden"
                >
                  Prompt2SQL
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-border/50 text-sm font-medium text-text transition-all hover:text-primary min-w-max"
                title={!isSidebarOpen ? item.name : undefined}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted shrink-0" />
                </div>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-2 border-t border-border flex flex-col gap-1 shrink-0 overflow-hidden">
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-border/50 text-sm font-medium text-text transition-all hover:text-primary min-w-max w-full"
            title={!isSidebarOpen ? "Toggle Theme" : undefined}
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              {isDarkMode ? <Sun className="w-5 h-5 text-muted" /> : <svg className="w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-border/50 text-sm font-medium text-text transition-all min-w-max w-full cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col whitespace-nowrap overflow-hidden pr-2"
                >
                  <span className="font-bold text-xs truncate leading-tight">{user?.name || 'User Name'}</span>
                  <span className="text-[10px] text-muted truncate leading-tight">{user?.email || 'user@example.com'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <button 
            onClick={logout}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600 transition-all min-w-max w-full"
            title={!isSidebarOpen ? "Log out" : undefined}
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Log out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        {/* Top Header - Kept slim for breadcrumbs & notifications */}
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs with Dropdowns */}
            <div className="hidden md:flex items-center gap-2 text-sm ml-2">
              <ChevronRightIcon className="w-4 h-4 text-muted/40" />
              
              {/* Project Dropdown */}
              <div className="relative" ref={projectRef}>
                <div 
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="flex flex-col cursor-pointer group px-2 py-1 rounded hover:bg-surface/80 transition-colors relative"
                >
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-[-2px]">Project</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-text">{activeProject ? activeProject.name : 'Select Project'}</span>
                    <ChevronDown className="w-3 h-3 text-muted group-hover:text-text transition-colors" />
                  </div>
                </div>
                
                <AnimatePresence>
                  {isProjectDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1 w-56 bg-surface border border-border shadow-xl rounded-lg overflow-hidden z-50"
                    >
                      <div className="max-h-64 overflow-y-auto p-1">
                        {projects?.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              navigate(`/projects/${p.id}`);
                              setIsProjectDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 ${activeProject?.id === p.id ? 'bg-primary/10 text-primary font-medium' : 'text-text hover:bg-surface/80 hover:text-primary'}`}
                          >
                            <Database className="w-3.5 h-3.5" />
                            <span className="truncate">{p.name}</span>
                          </div>
                        ))}
                        {projects?.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted text-center italic">No projects found</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {activeProject && (
                <>
                  <div className="w-px h-6 bg-border mx-2" />
                  <ChevronRightIcon className="w-4 h-4 text-muted/40" />
                  
                  {/* Schema Dropdown */}
                  <div className="relative" ref={schemaRef}>
                    <div 
                      onClick={() => setIsSchemaDropdownOpen(!isSchemaDropdownOpen)}
                      className="flex flex-col cursor-pointer group px-2 py-1 rounded hover:bg-surface/80 transition-colors relative"
                    >
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-[-2px]">Schema</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-text">{activeSchema ? activeSchema.name : 'Select Schema'}</span>
                        <ChevronDown className="w-3 h-3 text-muted group-hover:text-text transition-colors" />
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isSchemaDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full mt-1 w-56 bg-surface border border-border shadow-xl rounded-lg overflow-hidden z-50"
                        >
                          <div className="max-h-64 overflow-y-auto p-1">
                            {schemas?.map(s => (
                              <div 
                                key={s.id}
                                onClick={() => {
                                  if (!location.pathname.includes('/projects/')) navigate(`/projects/${projectId}`);
                                  setActiveSchemaId(s.id);
                                  setIsSchemaDropdownOpen(false);
                                }}
                                className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 ${activeSchema?.id === s.id ? 'bg-primary/10 text-primary font-medium' : 'text-text hover:bg-surface/80 hover:text-primary'}`}
                              >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span className="truncate">{s.name}</span>
                              </div>
                            ))}
                            {schemas?.length === 0 && (
                              <div className="px-3 py-2 text-sm text-muted text-center italic">No schemas found</div>
                            )}
                            <div className="border-t border-border mt-1 pt-1">
                              <div 
                                onClick={() => {
                                  setActiveSchemaId(null);
                                  setIsSchemaDropdownOpen(false);
                                  if (!location.pathname.includes('/projects/')) navigate(`/projects/${projectId}`);
                                }}
                                className="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 text-primary hover:bg-primary/10 font-medium"
                              >
                                <Database className="w-3.5 h-3.5" />
                                <span>Create New Schema</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-muted hover:text-text hover:bg-surface rounded-full transition-colors border border-transparent hover:border-border relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border shadow-xl rounded-xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-border bg-surface/50 flex items-center justify-between">
                      <span className="font-bold text-sm text-text">Notifications</span>
                      {notifications.length > 0 && (
                        <span 
                          onClick={() => setNotifications([])}
                          className="text-xs text-primary cursor-pointer hover:underline font-semibold"
                        >
                          Mark all as read
                        </span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-muted text-sm">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-3 border-b border-border/50 hover:bg-surface/50 cursor-pointer transition-colors flex gap-3">
                            <div className={`w-8 h-8 rounded-full ${notif.color} flex items-center justify-center shrink-0`}>
                              {notif.icon === 'database' && <Database className="w-4 h-4 text-blue-500" />}
                              {notif.icon === 'user' && <User className="w-4 h-4 text-emerald-500" />}
                              {notif.icon === 'settings' && <Settings className="w-4 h-4 text-primary" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text">{notif.title}</p>
                              <p className="text-xs text-muted">{notif.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background relative flex flex-col">
          <div className="flex-1 overflow-auto">
            <Outlet context={{ activeSchemaId, setActiveSchemaId }} />
          </div>
          {/* Fixed Footer */}
          <footer className="h-10 border-t border-border bg-surface/50 flex items-center justify-between px-6 text-xs text-muted shrink-0 z-30">
            <div>
              © Prompt2SQL 2026
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                GitHub Repository
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
