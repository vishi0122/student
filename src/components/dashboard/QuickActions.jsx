import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

const QuickActions = ({ actions }) => {
  return (
    <Card className="p-6 flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="flex-1 space-y-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#1E3A8A] hover:shadow-sm transition-all text-left group bg-white"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${action.bg} ${action.color}`}>
                <action.icon size={18}/>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-[#1E3A8A]">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500">{action.desc}</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
