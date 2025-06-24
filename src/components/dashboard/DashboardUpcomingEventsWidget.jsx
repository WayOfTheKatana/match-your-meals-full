import React from 'react';
import { Calendar } from 'lucide-react';

const DashboardUpcomingEventsWidget = ({ isCreatorMode, upcomingEvents }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
        {isCreatorMode ? 'Creator Events' : 'Upcoming Events'}
      </h4>
      <div className="space-y-3">
        {upcomingEvents.map((event, index) => (
          <div key={index} className="bg-white rounded-lg p-3">
            <h5 className="font-medium text-gray-900 text-sm mb-1">{event.title}</h5>
            <div className="flex items-center text-xs text-gray-600">
              <span>{event.date}</span>
              <span className="mx-2">•</span>
              <span>{event.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardUpcomingEventsWidget;