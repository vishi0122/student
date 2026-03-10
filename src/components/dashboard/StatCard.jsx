import React from 'react';
import Card from '../ui/Card';

const StatCard = ({ label, value, trend, icon: Icon, color, bg }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={24} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">{trend}</p>
      </div>
    </Card>
  );
};

export default StatCard;
