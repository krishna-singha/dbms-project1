"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, X, Edit, Trash2, FileText, Video, 
  BookOpen, ExternalLink, Hash, ChevronDown, ChevronUp 
} from "lucide-react";

const CONTENT_TYPES = {
  BOOK: { icon: BookOpen, label: "Book/Reading", color: "text-blue-600 bg-blue-50" },
  VIDEO: { icon: Video, label: "Video", color: "text-purple-600 bg-purple-50" },
  NOTES: { icon: FileText, label: "Notes", color: "text-emerald-600 bg-emerald-50" },
};

function ExpandableNotes({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > 300;

  return (
    <div>
      <p className={`text-slate-700 whitespace-pre-wrap leading-relaxed transition-all ${!isExpanded && isLong ? "line-clamp-3" : ""}`}>
        {text}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {isExpanded ? (
            <><ChevronUp size={16} /> Show Less</>
          ) : (
            <><ChevronDown size={16} /> Read Full Note</>
          )}
        </button>
      )}
    </div>
  );
}

export default function CourseContent({ courseId, contents: initialContents, isInstructor }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [form, setForm] = useState({ type: "NOTES", body: "" });
  const [submitting, setSubmitting] = useState(false);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const renderBody = (content) => {
    if (content.type === "BOOK" && content.body.startsWith("<") && content.body.endsWith(">")) {
      const parts = content.body.slice(1, -1).split(",");
      return (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{parts[0]?.trim()}</span>
          <span className="text-sm text-slate-500 italic">by {parts[1]?.trim() || "Unknown Author"}</span>
        </div>
      );
    }
    if (content.type === "VIDEO") {
      return (
        <a href={content.body} target="_blank" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all">
          <ExternalLink size={14} /> Watch Lesson
        </a>
      );
    }
    return <ExpandableNotes text={content.body} />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const url = editingContent ? `/api/courses/${courseId}/contents/${editingContent.id}` : `/api/courses/${courseId}/contents`;
    const res = await fetch(url, {
      method: editingContent ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setForm({ type: "NOTES", body: "" });
      router.refresh();
    } else {
      alert("Error saving content");
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Curriculum</h3>
          <p className="text-sm text-slate-500 font-medium">Materials and resources for this course</p>
        </div>
        {isInstructor && (
          <button 
            onClick={() => { setEditingContent(null); setForm({ type: "NOTES", body: "" }); setShowModal(true); }}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
          >
            <Plus size={18} /> Add Material
          </button>
        )}
      </div>

      <div className="space-y-6">
        {initialContents.length > 0 ? (
          initialContents.map((content) => {
            const Config = CONTENT_TYPES[content.type];
            return (
              <div key={content.id} className="group relative flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-md">
                <div className={`rounded-2xl p-4 shrink-0 ${Config?.color}`}>
                  {Config && <Config.icon size={24} />}
                </div>
                <div className="flex-1 pr-12">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {Config?.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-300">
                      • {mounted ? new Date(content.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  {renderBody(content)}
                </div>
                
                {isInstructor && (
                  <div className="absolute right-6 top-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingContent(content); setForm({ type: content.type, body: content.body }); setShowModal(true); }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={async () => { if(confirm("Delete content?")) { await fetch(`/api/courses/${courseId}/contents/${content.id}`, { method: "DELETE" }); router.refresh(); } }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium italic">No curriculum materials uploaded yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-[2.5rem] bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
              <h2 className="text-xl font-bold">{editingContent ? "Edit Material" : "New Material"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(CONTENT_TYPES).map(([key, value]) => (
                  <button key={key} type="button" onClick={() => setForm({...form, type: key})}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${form.type === key ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                    <value.icon size={20} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{value.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {form.type === "BOOK" ? "Book Details (Name, Author)" : form.type === "VIDEO" ? "Video URL" : "Note Content"}
                </label>
                
                {form.type === "VIDEO" && (
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required value={form.body} onChange={e => setForm({...form, body: e.target.value})}
                      placeholder="https://youtube.com/..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                  </div>
                )}

                {form.type === "BOOK" && (
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required 
                      value={form.body.startsWith("<") ? form.body.slice(1,-1) : form.body}
                      onChange={e => setForm({...form, body: `<${e.target.value}>`})}
                      placeholder="Atomic Habits, James Clear"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" />
                  </div>
                )}

                {form.type === "NOTES" && (
                  <textarea required value={form.body} onChange={e => setForm({...form, body: e.target.value})}
                    placeholder="Enter lecture notes..." rows={8}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none" />
                )}
              </div>

              <button disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {submitting ? "Saving..." : "Publish Material"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}