import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // first hour is 12
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-0 md:p-6 overflow-x-hidden">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(15,_65,_160,_0.2),_transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(13,_130,_190,_0.15),_transparent_50%)] pointer-events-none" />

      {/* Main Container - Absolute responsiveness */}
      <div className="relative w-full md:w-[412px] h-screen md:h-[860px] md:rounded-[48px] md:border-[10px] md:border-[#1a2333] bg-[#0c1328] shadow-[0_0_80px_rgba(0,0,0,0.8)] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_40px_rgba(10,50,150,0.15)] flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Android Hardware Camera Punch-Hole (only on desktop mock margins) */}
        <div className="hidden md:block absolute top-[14px] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0f1c] border-2 border-[#1a2333] rounded-full z-50 shadow-inner" />

        {/* Dynamic Mobile Status Bar */}
        <div className="w-full px-6 pt-3 pb-1 flex justify-between items-center text-xs font-medium text-slate-400 select-none z-40 bg-[#0c1328]/80 backdrop-blur-md">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] mr-0.5">98%</span>
              <Battery className="w-4 h-4 text-slate-300 rotate-0" />
            </div>
          </div>
        </div>

        {/* Phone Frame Interactive Content Chamber */}
        <div className="flex-1 w-full flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>

        {/* Android Navigation bar mock on desktop */}
        <div className="hidden md:flex w-full h-[24px] bg-[#0c1328] items-center justify-center gap-16 pb-1 select-none border-t border-slate-900/40">
          {/* Back button */}
          <div className="w-4 h-4 border border-slate-500 rounded-sm rotate-45 opacity-50" />
          {/* Home button */}
          <div className="w-3.5 h-3.5 border-2 border-slate-500 rounded-full opacity-50" />
          {/* Recents button */}
          <div className="w-3 h-3 border border-slate-500 rounded-md opacity-50" />
        </div>
      </div>
    </div>
  );
}
