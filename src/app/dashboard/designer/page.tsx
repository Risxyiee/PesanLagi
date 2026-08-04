'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { Sparkles, Wand2, Lock, Palette, Image as ImageIcon, Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Deterministic QR Pattern Generator (No hydration mismatch)
const isFinderPattern = (r: number, c: number): boolean | null => {
  if (r < 7 && c < 7) {
    return (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
  }
  if (r < 7 && c >= 18) {
    return (r === 0 || r === 6 || c === 18 || c === 24) || (r >= 2 && r <= 4 && c >= 20 && c <= 22);
  }
  if (r >= 18 && c < 7) {
    return (r === 18 || r === 24 || c === 0 || c === 6) || (r >= 20 && r <= 22 && c >= 2 && c <= 4);
  }
  return null;
};

const QrMock = ({ color }: { color: string }) => {
  const cells = Array.from({ length: 625 }, (_, i) => {
    const r = Math.floor(i / 25);
    const c = i % 25;
    const finder = isFinderPattern(r, c);
    if (finder !== null) return finder;
    return ((r * 31 + c * 17) % 3) === 0; // Pseudo-random
  });

  return (
    <div 
      style={{ gridTemplateColumns: 'repeat(25, 1fr)', gridTemplateRows: 'repeat(25, 1fr)' }} 
      className="grid w-44 h-44"
    >
      {cells.map((isBlack, i) => (
        <div key={i} style={{ backgroundColor: isBlack ? color : 'transparent' }} />
      ))}
    </div>
  );
};

export default function QrDesignerPage() {
  const [isPro, setIsPro] = useState(true); // Toggle untuk testing
  const [activeTab, setActiveTab] = useState('ai');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrColor, setQrColor] = useState('#0F172A');
  const [textColor, setTextColor] = useState('#0F172A');
  const [accentColor, setAccentColor] = useState('#F59E0B');
  const [activeTemplate, setActiveTemplate] = useState('minimalist');
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleTabClick = (tab: string) => {
    // FREE bisa akses: presets, templates. PRO bisa akses semua.
    if (!isPro && (tab === 'ai' || tab === 'custom')) {
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAIGenerate = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (!aiPrompt.trim()) {
      showToast('Tulis deskripsi warungmu dulu!');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Gagal generate desain');
      }
      const data = await res.json();
      setBgColor(data.bgColor);
      setQrColor(data.qrColor);
      setTextColor(data.textColor);
      setAccentColor(data.accentColor);
      setActiveTemplate(data.template);
      showToast(data.reason || 'Desain AI berhasil digenerate!');
    } catch (err: any) {
      showToast(err.message || 'Gagal generate desain');
    } finally {
      setIsGenerating(false);
    }
  };

  const presets = [
    { name: 'Kopi Susu', bg: '#F5F1EB', qr: '#4B3621', text: '#4B3621', acc: '#C8825A' },
    { name: 'Sage Segar', bg: '#F0FDF4', qr: '#166534', text: '#166534', acc: '#22C55E' },
    { name: 'Midnight Slate', bg: '#0F172A', qr: '#F1F5F9', text: '#F1F5F9', acc: '#64748B' },
    { name: 'Terracotta', bg: '#FFF7ED', qr: '#9A3412', text: '#9A3412', acc: '#EA580C' },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setBgColor(preset.bg); setQrColor(preset.qr); setTextColor(preset.text); setAccentColor(preset.acc);
    setActiveTemplate('minimalist');
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBgImage(event.target?.result as string);
        setActiveTemplate('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const getTemplateClass = () => {
    switch (activeTemplate) {
      case 'rustic': return 'rounded-xl shadow-sm border border-amber-100';
      case 'dark_gold': return 'rounded-xl shadow-2xl';
      case 'acrylic': return 'rounded-xl shadow-2xl border-t-8 border-b-8 border-slate-100 overflow-hidden';
      case 'custom': return 'rounded-xl shadow-sm';
      default: return 'rounded-xl shadow-sm border border-slate-200';
    }
  };

  const getTemplateStyle = (): React.CSSProperties => {
    switch (activeTemplate) {
      case 'rustic':
        return {
          backgroundColor: bgColor,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.05) 0px, rgba(139, 90, 43, 0.05) 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, rgba(139, 90, 43, 0.05) 0px, rgba(139, 90, 43, 0.05) 2px, transparent 2px, transparent 10px)`,
        };
      case 'custom':
        return customBgImage ? {
          backgroundImage: `url(${customBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : { backgroundColor: bgColor };
      default:
        return { backgroundColor: bgColor };
    }
  };

  const handleExport = async (format: 'PNG' | 'PDF') => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    if (!exportRef.current) return;
    
    showToast('Menyiapkan file download...');
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      if (format === 'PNG') {
        const link = document.createElement('a');
        link.download = 'qr-pesanlagi.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a6');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('qr-pesanlagi.pdf');
      }
      showToast(`Berhasil di-download sebagai ${format}!`);
    } catch (error) {
      showToast('Gagal mengunduh file.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">QR Designer</h1>
            <p className="text-slate-500 mt-1">Buat dan kustomisasi kartu QR Menu Anda</p>
          </div>
          <button 
            onClick={() => setIsPro(!isPro)}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isPro ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white border border-slate-200 text-slate-700'}`}
          >
            Mode: {isPro ? 'PRO' : 'FREE'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Live Preview */}
          <div className="md:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Live Preview</h2>
              <div ref={exportRef} style={getTemplateStyle()} className={`relative w-full aspect-[105/148] flex flex-col items-center justify-center p-6 ${getTemplateClass()}`}>
                {/* Watermark for Free — di bawah, lurus */}
                {!isPro && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-10">
                    <span className="text-[10px] font-semibold text-slate-400/60">
                      Dibuat dengan PesanLagi.com
                    </span>
                  </div>
                )}
                
                <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md mb-4 z-0">
                  <img src="https://picsum.photos/seed/warung-barokah-logo/80/80" crossOrigin="anonymous" className="w-full h-full rounded-full object-cover" alt="Logo" />
                </div>

                <h3 style={{ color: textColor }} className="text-lg font-extrabold mb-1 text-center z-0">
                  Warung Makan Barokah
                </h3>
                <p style={{ color: textColor }} className="text-xs mb-4 opacity-80 z-0">Scan untuk lihat menu</p>

                <div className={`p-2 bg-white shadow-sm z-0 ${activeTemplate === 'dark_gold' ? 'border-[3px] border-amber-500 rounded-lg' : 'rounded-lg'}`}>
                  <QrMock color={qrColor} />
                </div>

                <div style={{ color: accentColor }} className="mt-4 text-xs font-bold z-0 flex items-center gap-1">
                  <Sparkles size={12} /> Powered by PesanLagi
                </div>
              </div>

              {/* Export Buttons */}
              <div className="mt-6 space-y-2">
                <button onClick={() => handleExport('PDF')} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                  <Download size={16} /> Download PDF (A6)
                </button>
                <button onClick={() => handleExport('PNG')} className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:border-slate-300 transition-colors">
                  <Download size={16} /> Download PNG
                </button>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="md:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6">
              {['ai', 'presets', 'custom', 'templates'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
                  }`}
                >
                  {tab === 'ai' && <><Sparkles size={14} /> AI Theme</>}
                  {tab === 'presets' && <><Palette size={14} /> Presets</>}
                  {tab === 'custom' && <><Palette size={14} /> Custom</>}
                  {tab === 'templates' && <><ImageIcon size={14} /> Templates</>}
                  {!isPro && (tab === 'ai' || tab === 'custom') && <Lock size={10} className="text-amber-500" />}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[400px] relative">
              
              {/* AI Theme Tab */}
              {activeTab === 'ai' && (
                <div className="relative">
                  {!isPro && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-amber-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Khusus Pengguna Pro</p>
                      <button onClick={() => setShowUpgradeModal(true)} className="mt-2 text-xs font-bold text-amber-600">Upgrade Sekarang</button>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-3xl"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">AI QR Theme Generator</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">Deskripsikan konsep warungmu, AI akan otomatis memilih warna & template terbaik.</p>
                      <textarea 
                        className="w-full p-3 rounded-xl border border-amber-200 bg-white/80 focus:ring-2 focus:ring-amber-400 outline-none text-sm text-slate-700 resize-none"
                        rows={3}
                        placeholder="Contoh: Kafe matcha kekinian nuansa kayu estetik"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <button 
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generasi Desain...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>Generasi Desain & Warna via AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Presets Tab */}
              {activeTab === 'presets' && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Pilih Preset Warna Standar</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {presets.map((preset) => (
                      <button 
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="p-4 border border-slate-200 rounded-xl hover:border-amber-400 transition-all text-left"
                      >
                        <div className="flex gap-1 mb-3">
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.bg, border: '1px solid #E2E8F0' }}></div>
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.qr }}></div>
                          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: preset.acc }}></div>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Color Tab */}
              {activeTab === 'custom' && (
                <div className="relative">
                  {!isPro && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-amber-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">Khusus Pengguna Pro</p>
                      <button onClick={() => setShowUpgradeModal(true)} className="mt-2 text-xs font-bold text-amber-600">Upgrade Sekarang</button>
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Custom Color Pickers</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Warna Background Card</label>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Warna Mode QR</label>
                      <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Warna Teks / Judul</label>
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Warna Aksesori</label>
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-200" />
                    </div>
                  </div>
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="relative">
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Background & Frame Templates</h3>
                  <p className="text-xs text-slate-400 mb-4">Pilih tampilan kartu QR Anda</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveTemplate('minimalist')} className={`p-4 border rounded-xl text-left transition-all ${activeTemplate === 'minimalist' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="w-full h-12 bg-white border border-slate-200 rounded mb-2"></div>
                      <span className="text-xs font-bold text-slate-900">Modern Minimalist</span>
                    </button>
                    <button onClick={() => setActiveTemplate('rustic')} className={`p-4 border rounded-xl text-left transition-all ${activeTemplate === 'rustic' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="w-full h-12 bg-[#FDFBF7] rounded mb-2" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.1) 0px, rgba(139, 90, 43, 0.1) 2px, transparent 2px, transparent 6px)' }}></div>
                      <span className="text-xs font-bold text-slate-900">Rustic Wood Grain</span>
                    </button>
                    <button onClick={() => setActiveTemplate('dark_gold')} className={`p-4 border rounded-xl text-left transition-all ${activeTemplate === 'dark_gold' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="w-full h-12 bg-slate-900 rounded mb-2 border-2 border-amber-500"></div>
                      <span className="text-xs font-bold text-slate-900">Dark Gold Elegance</span>
                    </button>
                    <button onClick={() => setActiveTemplate('acrylic')} className={`p-4 border rounded-xl text-left transition-all ${activeTemplate === 'acrylic' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="w-full h-12 bg-white rounded mb-2 border-t-4 border-b-4 border-slate-100"></div>
                      <span className="text-xs font-bold text-slate-900">Acrylic Table Stand</span>
                    </button>
                    {/* Upload Custom — PRO only */}
                    <button
                      onClick={() => {
                        if (!isPro) { setShowUpgradeModal(true); return; }
                        fileInputRef.current?.click();
                      }}
                      className={`p-4 border rounded-xl text-left transition-all relative ${activeTemplate === 'custom' ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="w-full h-12 bg-slate-100 rounded mb-2 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Upload Custom</span>
                      {!isPro && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Lock size={8} /> PRO
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl border border-amber-200">
            <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Lock className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Upgrade ke Pro</h3>
            <p className="text-slate-500 mt-2 text-sm">Fitur AI QR Designer dan Custom Background hanya tersedia untuk pengguna Pro.</p>
            <button onClick={() => setShowUpgradeModal(false)} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition-transform">
              Upgrade Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-2xl z-[60] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
