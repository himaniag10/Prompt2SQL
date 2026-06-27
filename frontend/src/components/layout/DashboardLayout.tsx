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
    { id: 3, title: 'System update completed', time: '1 day ago', icon: 'settings', color: 'bg-[#591C26]/10' }
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
    <div className="flex flex-col h-screen bg-background overflow-hidden text-text selection:bg-primary/20">
      
      {/* Global Navbar */}
      <header className="h-14 border-b border-border bg-white flex items-center justify-between px-4 shrink-0 z-50">
        
        {/* Left: Logo and Menu and Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[6px] bg-[#591C26] text-white flex items-center justify-center shadow-sm">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-[#591C26] tracking-tight">Prompt2SQL</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs moved to the left */}
          <div className="hidden md:flex items-center gap-2 text-sm ml-2">
            <ChevronRightIcon className="w-4 h-4 text-muted/40" />
            
            {/* Project Dropdown */}
            <div className="relative" ref={projectRef}>
              <div 
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="flex flex-col cursor-pointer group px-2 py-1 rounded hover:bg-surface transition-colors relative"
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
                    className="absolute left-0 top-full mt-1 w-56 bg-white border border-border shadow-xl rounded-lg overflow-hidden z-50"
                  >
                    <div className="max-h-64 overflow-y-auto p-1">
                      {projects?.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            navigate(`/projects/${p.id}`);
                            setIsProjectDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 ${activeProject?.id === p.id ? 'bg-[#591C26]/10 text-[#591C26] font-medium' : 'text-text hover:bg-surface hover:text-[#591C26]'}`}
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
                    className="flex flex-col cursor-pointer group px-2 py-1 rounded hover:bg-surface transition-colors relative"
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
                        className="absolute left-0 top-full mt-1 w-56 bg-white border border-border shadow-xl rounded-lg overflow-hidden z-50"
                      >
                        <div className="max-h-64 overflow-y-auto p-1">
                          {schemas?.map(s => (
                            <div 
                              key={s.id}
                              onClick={() => {
                                // If not on schema page, go there first
                                if (!location.pathname.includes('/projects/')) {
                                  navigate(`/projects/${projectId}`);
                                }
                                setActiveSchemaId(s.id);
                                setIsSchemaDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 ${activeSchema?.id === s.id ? 'bg-[#591C26]/10 text-[#591C26] font-medium' : 'text-text hover:bg-surface hover:text-[#591C26]'}`}
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
                                // Redirect to create new schema context ( handled in SchemaBuilderPage normally, 
                                // but we can clear active schema to show the empty state where users can create )
                                setActiveSchemaId(null);
                                setIsSchemaDropdownOpen(false);
                                if (!location.pathname.includes('/projects/')) {
                                  navigate(`/projects/${projectId}`);
                                }
                              }}
                              className="px-3 py-2 text-sm rounded-md cursor-pointer flex items-center gap-2 text-[#591C26] hover:bg-[#591C26]/10 font-medium"
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

        {/* Center: Empty (to push right actions) */}
        <div className="flex-1" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-muted hover:text-text hover:bg-surface rounded-full transition-colors border border-transparent hover:border-border"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
          
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
                  className="absolute right-0 top-full mt-2 w-80 bg-white border border-border shadow-xl rounded-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border bg-surface/50 flex items-center justify-between">
                    <span className="font-bold text-sm text-text">Notifications</span>
                    {notifications.length > 0 && (
                      <span 
                        onClick={() => setNotifications([])}
                        className="text-xs text-[#591C26] cursor-pointer hover:underline font-semibold"
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
                            {notif.icon === 'settings' && <Settings className="w-4 h-4 text-[#591C26]" />}
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

          {/* Profile Dropdown */}
          <div className="relative ml-2" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-surface border border-transparent hover:border-border transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-[#591C26] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-border shadow-xl rounded-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border bg-surface/50">
                    <p className="text-sm font-bold text-text truncate">{user?.name || 'User Name'}</p>
                    <p className="text-xs text-muted truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="p-1.5">
                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface hover:text-[#591C26] rounded-md flex items-center gap-2 transition-colors">
                      <User className="w-4 h-4" /> Profile Settings
                    </Link>
                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface hover:text-[#591C26] rounded-md flex items-center gap-2 transition-colors">
                      <Settings className="w-4 h-4" /> Preferences
                    </Link>
                  </div>
                  <div className="p-1.5 border-t border-border">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full border-r border-border bg-surface flex flex-col shadow-sm relative z-40"
            >
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-border/50 text-sm font-medium text-text transition-all hover:text-[#591C26]"
                    >
                      <Icon className="w-4 h-4 text-muted shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto bg-background relative">
          <Outlet context={{ activeSchemaId, setActiveSchemaId }} />
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
