'use client';
import React, { useEffect, useState } from 'react';
import { Search, Filter, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export default function PagesSeoPage() {
  const [pages, setPages] = useState<any[=>[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/seo/pages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPages(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading pages...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Pages SEO Optimization</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search URLs..."
              className="pl-9 pr"�B��"&�&FW"&�&FW"�w&��#&�V�FVB��rFW�B�6�f�7W3��WFƖ�R����Rf�7W3�&��r�"f�7W3�&��r�&�6� �����F�c��'WGF��6�74��S�'�"&�&FW"&�&FW"�w&��#&�V�FVB��rFW�B�w&��c��fW#�&r�w&��S#��f��FW"6��S׳������'WGF�����F�c���F�cࠢ�F�b6�74��S�&&�&FW"&�&FW"�w&��#&�V�FVB׆��fW&f��rֆ�FFV�#��F&�R6�74��S�'r�gV��FW�B��VgB#��F�VB6�74��S�&&r�w&��S&�&FW"�"&�&FW"�w&��##��G#��F�6�74��S�'��b��2FW�BՇ2f��B��VF�V�FW�B�w&��SWW&66R#�U$���F���F�6�74��S�'��b��2FW�BՇ2f��B��VF�V�FW�B�w&��SWW&66R#�6Ɩ6�3��F���F�6�74��S�'��b��2FW�BՇ2f��B��VF�V�FW�B�w&��SWW&66R#�4T�66�&S��F���F�6�74��S�'��b��2FW�BՇ2f��B��VF�V�FW�B�w&��SWW&66R#�77VW3��F���F�6�74��S�'��b��2FW�BՇ2f��B��VF�V�FW�B�w&��SWW&66R#�7F�����F����G#���F�VC��F&�G�6�74��S�&F�f�FRגF�f�FR�w&��#��vW2��V�wF��������G#��FB6��7�׳W�6�74��S�'��b�ӂFW�B�6V�FW"FW�B�w&��S#���vW2f�V�B��V6R7��26V&6�6��6��R���FC���G#���vW2����vS�璒�����G"�W�׷vR�G�6�74��S�&��fW#�&r�w&��S#��FB6�74��S�'��b��2FW�B�6�f��B��VF�V�FW�B�w&�ӓ#���&Vc׶�'F�G��vR�W&���F&vWC�%�&��"&V��&��&VfW'&W""6�74��S�&��fW#�V�FW&Ɩ�R#��vR�W&�Т�����FC��FB6�74��S�'��b��2FW�B�6�FW�B�w&��c#�vR�6Ɩ6�7���FC��FB6�74��S�'��b��2#��F�b6�74��S�&f�W��FV�2�6V�FW"v�#��F�b6�74��S�'r�b��"&r�w&��#&�V�FVB�gV���fW&f��rֆ�FFV�#��F�b6�74��S�&��gV��&r�w&VV��S"7G��S׷�v�GF��s�RRr������F�c��7�6�74��S�'FW�Bׇ2FW�B�w&��c#�S��7����F�c���FC��FB6�74��S�'��b��2FW�B�6�#��F�b6�74��S�&f�W��FV�2�6V�FW"v�FW�B��&�vR�S#���W'EG&��v�R6��S׳G���"�77VW0���F�c���FC��FB6�74��S�'��b��2#��'WGF��6�74��S�'FW�B�6�FW�B�&�VR�c��fW#�V�FW&Ɩ�R#��F�֗�S��'WGF�����FC���G#���Т��F&�G����F&�S���F�c���F�c����Р