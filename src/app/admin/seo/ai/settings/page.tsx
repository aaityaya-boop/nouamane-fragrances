import { Settings, Zap, RefreshCw, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-8 w-8" />
        Automation Settings
      </h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Zap className="h-5 w-5 text-amber-500" />
            Content Automation
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative flex items-center mt-1">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Scheduled AI Content Gap Detection</div>
                <div className="text-sm text-gray-500">Automatically scan competitors weekly and suggest new topics.</div>
              </div>
            </label>
            
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative flex items-center mt-1">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Auto-Generate Product Descriptions</div>
                <div className="text-sm text-gray-500">Draft SEO-optimized descriptions for newly added products.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Data Sync
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative flex items-center mt-1">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Automated GSC Sync</div>
                <div className="text-sm text-gray-500">Pull latest Google Search Console data daily at midnight.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Bell className="h-5 w-5 text-purple-500" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative flex items-center mt-1">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Weekly Performance Report</div>
                <div className="text-sm text-gray-500">Email summary of SEO experiments and ranking changes.</div>
              </div>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
