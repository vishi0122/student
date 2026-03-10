import React from 'react';
import Card from '../ui/Card';

const BarChart = ({ title, data = [60, 80, 40, 90, 75, 85, 95] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="col-span-2 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between gap-2 pt-6">
        {data.map((height, i) => (
          <div key={i} className="w-full bg-gray-100 rounded-t-sm relative group">
            <div 
              className="absolute bottom-0 w-full bg-[#1E3A8A] rounded-t-sm transition-all duration-500 group-hover:bg-[#10B981]" 
              style={{ height: `${height}%` }}
            ></div>
            <div className="absolute -bottom-6 w-full text-center text-xs text-gray-500">
              {days[i]}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BarChart;
