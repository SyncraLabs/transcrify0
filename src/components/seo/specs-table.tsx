import React from "react";
import {
  Monitor,
  Clock,
  FileText,
  Globe,
  Video,
  Music,
  Languages,
  Zap,
} from "lucide-react";

interface SpecsTableProps {
  specs: { label: string; value: string; icon: string }[];
}

const iconMap: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Monitor,
  Clock,
  FileText,
  Globe,
  Video,
  Music,
  Languages,
  Zap,
};

export default function SpecsTable({ specs }: SpecsTableProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-8">Specifications</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specs.map((spec, i) => {
          const IconComponent = iconMap[spec.icon];

          return (
            <div
              key={i}
              className="bg-neutral-900/50 border border-white/10 rounded-xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                {IconComponent && (
                  <IconComponent size={20} className="text-[#0079da]" />
                )}
                <span className="text-sm text-neutral-400">{spec.label}</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {spec.value}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
