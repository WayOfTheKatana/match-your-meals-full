import React from 'react';
import { Info } from 'lucide-react';

const DashboardVetting = () => (
  <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow border text-center">
    <Info className="w-10 h-10 text-blue-400 mb-4" />
    <h2 className="text-xl font-semibold mb-2">Recipe Vetting</h2>
    <p className="text-gray-600">
      Recipe vetting is not in work right now.<br />
      We will implement this feature soon.
    </p>
  </div>
);

export default DashboardVetting; 