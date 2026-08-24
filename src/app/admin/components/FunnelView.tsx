'use client';
import React from 'react';
import { Funnel, FunnelChart, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';

export default function FunnelView({ data }: { data: any[] }) {
  const colors = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
  
  return (
    <div className="w-full h-[350px] bg-white rounded-xl border border-[#e0ddd4] p-6">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
          >
            <LabelList position="right" fill="#111" stroke="none" dataKey="name" fontSize={13} fontWeight={500} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}
