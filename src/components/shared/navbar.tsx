'use client';

import { Dog, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/provider/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuthContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const formatTime = (date: Date): string => date.toUTCString().slice(17, 25);
  const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="fixed top-0 right-0 left-0 z-40 w-full border-slate-700/50 border-b bg-slate-800/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-28">
        <section className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
              <Dog size={20} className="text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">
                UTC TIME
              </p>
              <p className="font-mono text-sm text-white">
                {formatTime(currentTime)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">
              DATE
            </p>
            <p className="font-mono text-sm text-white">
              {formatDate(currentTime)}
            </p>
          </div>
        </section>

        <section className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            <Dog size={24} className="text-orange-500" />
            <div>
              <p className="font-bold text-lg text-white">HotDogTracker</p>
              <p className="text-slate-400 text-xs">
                Real-time Monitoring Platform
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 border border-slate-600">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-sm text-white">
                {getInitials(user?.name || 'Unknown User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm text-white">{user?.name}</p>
              <p className="text-slate-400 text-xs">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-slate-400 hover:text-white"
          >
            <LogOut size={16} />
          </Button>
        </section>
      </div>
    </nav>
  );
}
