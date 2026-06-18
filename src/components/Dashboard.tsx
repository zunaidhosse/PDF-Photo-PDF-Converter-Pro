import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, FileImage, Layers, Sparkles, ChevronRight } from 'lucide-react';
import { ActiveTab } from '../types';
import { useTranslation } from '../lib/i18n';

interface DashboardProps {
  onSelectTab: (tab: ActiveTab) => void;
  isBrandingEnabled: boolean;
}

export default function Dashboard({ onSelectTab, isBrandingEnabled }: DashboardProps) {
  const { t } = useTranslation();

  const cards = [
    {
      id: 'photo-to-pdf' as ActiveTab,
      title: t.photoToPdfTitle,
      description: t.photoToPdfDesc,
      icon: ImageIcon,
      gradient: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/30',
      badge: t.fastBadge,
    },
    {
      id: 'pdf-to-photo' as ActiveTab,
      title: t.pdfToPhotoTitle,
      description: t.pdfToPhotoDesc,
      icon: FileImage,
      gradient: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-indigo-500/30',
      badge: t.hqRenderBadge,
    },
    ...(isBrandingEnabled ? [
      {
        id: 'add-logo' as ActiveTab,
        title: t.pdfLogoPdfTitle,
        description: t.pdfLogoPdfDesc,
        icon: Layers,
        gradient: 'from-emerald-400 to-teal-600',
        shadow: 'shadow-emerald-500/30',
        badge: t.newModeBadge,
      },
      {
        id: 'add-logo' as ActiveTab,
        title: t.addLogoTitle,
        description: t.addLogoDesc,
        icon: Layers,
        gradient: 'from-orange-400 to-pink-500',
        shadow: 'shadow-orange-500/30',
        badge: t.editorBadge,
      }
    ] : [
      {
        id: 'add-logo' as ActiveTab,
        title: t.addLogoTitle,
        description: t.addLogoDesc,
        icon: Layers,
        gradient: 'from-orange-400 to-pink-500',
        shadow: 'shadow-orange-500/30',
        badge: t.editorBadge,
      }
    ])
  ];

  return (
    <div className="flex-1 px-6 py-8 flex flex-col justify-between" id="app_dashboard">
      <div>
        {/* Vibrant Palette Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3.5">
            {/* Logo Container matching Vibrant Palette icon */}
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            
            <div>
              <h1 className="font-display font-extrabold text-base text-slate-100 tracking-tight leading-tight">
                {t.appName}
              </h1>
              <p className="font-sans font-bold text-[10px] text-indigo-400 tracking-wider">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">{t.premiumMember}</span>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            {t.welcomeUser}
          </h2>
          <p className="font-sans text-[13px] text-slate-400 mt-2 leading-relaxed">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="space-y-4">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={`${card.id}_${index}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                onClick={() => onSelectTab(card.id)}
                className="w-full text-left rounded-[32px] p-5 bg-white/5 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-white/10 flex gap-4 items-start relative overflow-hidden group cursor-pointer"
                id={`card_btn_${card.id}_${index}`}
              >
                {/* Icon Chamber with Custom Glowing Background */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-xl ${card.shadow} text-white shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 stroke-[2]" />
                </div>

                {/* Card Main Body */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-extrabold text-lg text-white group-hover:text-indigo-200 transition-colors">
                      {card.title}
                    </h3>
                  </div>
                  <p className="font-sans text-xs text-slate-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Forward Arrow */}
                <div className="self-center w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                  <ChevronRight className="w-4.5 h-4.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Footer Info Container */}
      <div className="mt-8 border-t border-white/5 pt-5 text-center flex justify-between items-center text-slate-500 text-[11px] font-medium px-1">
        <div className="flex gap-3">
          <span>Version 2.4.0</span>
          <span>•</span>
          <span>Cloud Sync Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-500" />
          <span>Pro Mode</span>
        </div>
      </div>
    </div>
  );
}
