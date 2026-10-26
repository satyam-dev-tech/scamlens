import React from 'react';
import { Globe, MessageSquare, Mail, Shield, ArrowUpRight } from 'lucide-react';
import { ScanType } from '../types/scam';

interface FeatureCardProps {
  type: 'url' | 'message' | 'email' | 'analysis';
  title: string;
  description: string;
  onClick: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  type,
  title,
  description,
  onClick,
}) => {
  const getIconConfig = () => {
    switch (type) {
      case 'url':
        return {
          icon: Globe,
          bg: 'bg-blue-50 text-blue-600 border-blue-100',
        };
      case 'message':
        return {
          icon: MessageSquare,
          bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };
      case 'email':
        return {
          icon: Mail,
          bg: 'bg-sky-50 text-sky-600 border-sky-100',
        };
      case 'analysis':
        return {
          icon: Shield,
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        };
    }
  };

  const config = getIconConfig();
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className="group relative p-5 rounded-2xl glass-panel-card glass-card-hover cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${config.bg} shadow-2xs group-hover:scale-105 transition-transform`}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-100/70 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </div>

        <h4 className="text-sm font-bold text-slate-900 mt-4 tracking-tight group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </div>
  );
};
