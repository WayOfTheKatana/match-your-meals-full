import React from "react";
import { Check } from "lucide-react";
import { Badge } from "./badge";

function Feature() {
  return (
    <div className="mw-full mx-auto py-10 lg:py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid border rounded-lg container p-8 grid-cols-1 gap-8 items-center lg:grid-cols-2">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              <div>
                <Badge variant="outline">Creator Revenue Share</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h2 className="text-3xl lg:text-5xl tracking-normal max-w-2xl text-left font-urbanist text-gray-900">
                  Earn While You Create
                </h2>
                <p className="text-lg leading-relaxed tracking-tight text-gray-600 max-w-xl text-left font-sans">
                  Start sharing today, start earning tomorrow. Our creator economy launches Q1 2026 with multiple ways to monetize your passion.
                </p>
              </div>
            </div>
            <div className="grid lg:pl-6 grid-cols-1 sm:grid-cols-3 items-start lg:grid-cols-1 gap-6">
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary-600" />
                <div className="flex flex-col gap-1">
                  <p className="text-gray-900 font-medium">Early Creator Advantage</p>
                  <p className="text-gray-600 text-sm">
                    Join now to secure priority access and exclusive benefits
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary-600" />
                <div className="flex flex-col gap-1">
                  <p className="text-gray-900 font-medium">Professional Support</p>
                  <p className="text-gray-600 text-sm">
                    Get dedicated creator tools and resources.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary-600" />
                <div className="flex flex-col gap-1">
                  <p className="text-gray-900 font-medium">Analytics Dashboard</p>
                  <p className="text-gray-600 text-sm">
                    Track views, engagement, and audience growth in real-time
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-md overflow-hidden flex items-center justify-center">
            <img 
              src="/Social share-cuate.svg" 
              alt="Creator Revenue Share" 
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };