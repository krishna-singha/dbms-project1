import { BarChart3, TrendingUp, Users, Target, Download } from "lucide-react";
import Card from "@/ui/Card";

export default function DataAnalystDashboard() {
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900">Marketplace Insights</h1>
        <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card title="DAU" value="3,245" icon={<Users size={18} />} />
        <Card title="Completion" value="62%" icon={<Target size={18} />} />
        <Card title="Avg Session" value="18m" icon={<TrendingUp size={18} />} />
        <Card title="Churn" value="3.2%" icon={<BarChart3 size={18} />} />
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10">
        <h3 className="text-xl font-black mb-6">Top Performing Universities</h3>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">{i}</div>
                <div>
                  <p className="font-bold text-slate-900">Partner Institution {i}</p>
                  <p className="text-xs text-slate-400 font-medium">94% Student Satisfaction</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-600">+12.4%</p>
                <p className="text-[10px] font-black uppercase text-slate-300">Growth</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}