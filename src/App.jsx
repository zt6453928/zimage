import React, { useState, useEffect } from 'react';

import {
  Image as ImageIcon,
  Download,
  Settings,
  Sparkles,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2
} from 'lucide-react';

const DEFAULT_PROMPT = "一张虚构的英语电影《回忆之味》（The Taste of Memory）的电影海报。场景设置在一个质朴的19世纪风格厨房里。画面中央，一位红棕色头发、留着小胡子的中年男子（演员阿瑟·彭哈利根饰）站在一张木桌后，他身穿白色衬衫、黑色马甲和米色围裙，正看着一位女士，手中拿着一大块生红肉，下方是一个木制切菜板。在他的右边，一位梳着高髻的黑发女子（演员埃莉诺·万斯饰）倚靠在桌子上，温柔地对他微笑。她穿着浅色衬衫和一条上白下蓝的长裙。桌上除了放有切碎的葱和卷心菜丝的切菜板外，还有一个白色陶瓷盘、新鲜香草，左侧一个木箱上放着一串深色葡萄。背景是一面粗糙的灰白色抹灰墙，墙上挂着一幅风景画。最右边的一个台面上放着一盏复古油灯。海报上有大量的文字信息。左上角是白色的无衬线字体\"ARTISAN FILMS PRESENTS\"，其下方是\"ELEANOR VANCE\"和\"ACADEMY AWARD® WINNER\"。右上角写着\"ARTHUR PENHALIGON\"和\"GOLDEN GLOBE® AWARD WINNER\"。顶部中央是圣丹斯电影节的桂冠标志，下方写着\"SUNDANCE FILM FESTIVAL GRAND JURY PRIZE 2024\"。主标题\"THE TASTE OF MEMORY\"以白色的大号衬线字体醒目地显示在下半部分。标题下方注明了\"A FILM BY Tongyi Interaction Lab\"。底部区域用白色小字列出了完整的演职员名单，包括\"SCREENPLAY BY ANNA REID\"、\"CULINARY DIRECTION BY JAMES CARTER\"以及Artisan Films、Riverstone Pictures和Heritage Media等众多出品公司标志。整体风格是写实主义，采用温暖柔和的灯光方案，营造出一种亲密的氛围。色调以棕色、米色和柔和的绿色等大地色系为主。两位演员的身体都在腰部被截断";

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
    <div className="invisible group-hover:visible absolute z-10 w-48 bg-slate-800 text-slate-200 text-xs rounded p-2 bottom-full left-1/2 -translate-x-1/2 mb-2 shadow-lg border border-slate-700">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

const App = () => {
  // Configuration State
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  // Multi API Keys
  const [apiKeys, setApiKeys] = useState([]); // [{id, name, key}]
  const [activeKeyId, setActiveKeyId] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Generation Parameters
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('z-image-turbo');

  // Advanced Params
  const [sizePreset, setSizePreset] = useState('1024x1024');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  // 服务端限制：仅支持单次生成 1 张
  const [numImages, setNumImages] = useState(1);
  const [steps, setSteps] = useState(9);
  const [seed, setSeed] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]); // Array of images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  // 参数面板折叠（移动端默认收起）
  const [paramsOpen, setParamsOpen] = useState(true);

  // Load API Key
  useEffect(() => {
    // Load multiple keys (migrate from single key if present)
    try {
      const listRaw = localStorage.getItem('gitee_api_keys');
      const activeId = localStorage.getItem('gitee_active_api_key_id') || '';
      let parsed = [];
      if (listRaw) {
        parsed = JSON.parse(listRaw) || [];
      } else {
        const legacy = localStorage.getItem('gitee_api_key');
        if (legacy) {
          const id = `k_${Date.now()}`;
          parsed = [{ id, name: '默认 Key', key: legacy }];
          localStorage.setItem('gitee_api_keys', JSON.stringify(parsed));
          localStorage.removeItem('gitee_api_key');
          if (!activeId) localStorage.setItem('gitee_active_api_key_id', id);
        }
      }
      setApiKeys(parsed);
      setActiveKeyId(activeId || (parsed[0]?.id || ''));
      if (parsed.length > 0) {
        setApiKey(parsed.find(k => k.id === (activeId || parsed[0].id))?.key || '');
      }
    } catch {}
    // 初始判断是否为移动端，移动端默认收起参数面板
    try {
      if (window && window.innerWidth < 768) {
        setParamsOpen(false);
      }
    } catch {}
  }, []);

  const handleApiKeyChange = (e) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('gitee_api_key', key);
  };

  const copyToClipboard = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Utilities for API keys
  const activeApiKey = apiKeys.find(k => k.id === activeKeyId)?.key || '';
  const persistKeys = (keys, activeId = activeKeyId) => {
    setApiKeys(keys);
    setActiveKeyId(activeId);
    localStorage.setItem('gitee_api_keys', JSON.stringify(keys));
    localStorage.setItem('gitee_active_api_key_id', activeId || '');
    setApiKey(keys.find(k => k.id === activeId)?.key || '');
  };

  const maskKey = (k) => {
    if (!k || k.length < 8) return '••••';
    return `${k.slice(0, 4)}••••${k.slice(-4)}`;
  };

  const addNewApiKey = () => {
    const val = (newKeyValue || '').trim();
    if (!val) return;
    const name = (newKeyName || '').trim() || `Key ${apiKeys.length + 1}`;
    const id = `k_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const next = [...apiKeys, { id, name, key: val }];
    persistKeys(next, activeKeyId || id);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const removeApiKey = (id) => {
    const next = apiKeys.filter(k => k.id !== id);
    let nextActive = activeKeyId;
    if (activeKeyId === id) {
      nextActive = next[0]?.id || '';
    }
    persistKeys(next, nextActive);
  };

  const useThisKey = (id) => {
    if (!id) return;
    const k = apiKeys.find(k => k.id === id);
    if (!k) return;
    persistKeys(apiKeys, id);
  };

  // Sync Size Preset with Width/Height
  const handleSizePresetChange = (e) => {
    const val = e.target.value;
    setSizePreset(val);
    if (val !== 'custom') {
      const [w, h] = val.split('x').map(v => parseInt(v, 10));
      if (!isNaN(w) && !isNaN(h)) {
        setWidth(w);
        setHeight(h);
      }
    }
  };

  const handleDimensionChange = (type, val) => {
    const num = parseInt(val) || 0;
    if (type === 'w') setWidth(num);
    else setHeight(num);
    setSizePreset('custom');
  };

  const generateImage = async () => {
    if (!activeApiKey) {
      setError("请输入 API Key");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);
    setCurrentImageIndex(0);

    try {
      const payload = {
        model: model,
        prompt: prompt,
        size: `${width}x${height}`,
        // 服务端仅支持单张输出，强制为 1
        extra_body: {
          num_images_per_prompt: 1, // 强制为 1，避免 400 错误
          negative_prompt: negativePrompt || undefined,
          num_inference_steps: steps,
          seed: seed ? parseInt(seed) : undefined,
        }
      };

      console.log('Sending payload:', payload); // 调试信息

      const response = await fetch("https://ai.gitee.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${activeApiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Error ${response.status}: 请求失败`);
      }

      console.log('API Response:', data); // 调试信息
      console.log('num_images_per_prompt forced to:', 1); // 调试信息

      if (data.data && data.data.length > 0) {
        console.log('Images count:', data.data.length); // 调试信息
        const images = data.data.map(img => img.url || `data:image/jpeg;base64,${img.b64_json}`);
        setGeneratedImages(images);
      } else {
        throw new Error("API 未返回任何数据");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "生成图片时发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url) => {
    if (!url) return;
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `generated-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const objUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objUrl;
        link.download = `generated-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(objUrl);
        document.body.removeChild(link);
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const currentImage = generatedImages[currentImageIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-[1400px] mx-auto px-4 py-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Free for art</h1>
              <p className="text-slate-400 text-xs">AI Image Generator</p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              !activeApiKey ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-slate-700 bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{activeApiKey ? 'API 设置' : '配置 Key'}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">

          {/* Left Column: Scrollable Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">API Keys (Gitee AI)</label>
                  {activeApiKey ? (
                    <span className="text-[10px] text-slate-500">当前: {maskKey(activeApiKey)}</span>
                  ) : (
                    <span className="text-[10px] text-red-400">未配置</span>
                  )}
                </div>

                {/* Keys List */}
                <div className="space-y-2">
                  {apiKeys.length > 0 ? (
                    apiKeys.map((k) => (
                      <div key={k.id} className={`flex items-center justify-between bg-slate-950 border rounded-lg px-3 py-2 ${k.id === activeKeyId ? 'border-indigo-500/60' : 'border-slate-700'}`}>
                        <div>
                          <div className="text-xs font-semibold text-slate-300">{k.name || '未命名 Key'}</div>
                          <div className="text-[10px] text-slate-500">{maskKey(k.key)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {k.id === activeKeyId ? (
                            <span className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">使用中</span>
                          ) : (
                            <button onClick={() => useThisKey(k.id)} className="text-xs px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-300">使用</button>
                          )}
                          <button onClick={() => removeApiKey(k.id)} className="text-xs px-2 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-400">删除</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[12px] text-slate-500">暂无 Key，请在下方添加。</div>
                  )}
                </div>

                {/* Add New Key */}
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="可选：给 Key 起个名字（如 账号A）"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                  />
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                    />
                    <button onClick={addNewApiKey} className="px-3 py-2 text-sm rounded-lg bg-slate-200 text-slate-900 hover:bg-white font-semibold">添加</button>
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col flex-shrink-0">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                  正向提示词 (Prompt)
                </label>
                <button
                  onClick={copyToClipboard}
                  className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none scrollbar-thin scrollbar-thumb-slate-700"
                placeholder="在此输入画面描述..."
              />
            </div>

            {/* Parameters Section (Collapsible) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300">参数设置</h3>
                <button
                  onClick={() => setParamsOpen(!paramsOpen)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
                  aria-expanded={paramsOpen}
                >
                  {paramsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {paramsOpen ? '收起' : '展开'}
                </button>
              </div>
              {paramsOpen && (
                <div className="mt-4 space-y-5">

              {/* Size Preset */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                  Size (尺寸) <Tooltip text="选择预设尺寸，或者手动调整宽/高" />
                </label>
                <select
                  value={sizePreset}
                  onChange={handleSizePresetChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="256x256">1:1 (256*256)</option>
                  <option value="512x512">1:1 (512*512)</option>
                  <option value="1024x1024">1:1 (1024*1024)</option>
                  <option value="1152x896">4:3 (1152*896)</option>
                  <option value="768x1024">3:4 (768*1024)</option>
                  <option value="1024x576">16:9 (1024*576)</option>
                  <option value="576x1024">9:16 (576*1024)</option>
                  <option value="1024x640">3:2 (1024*640)</option>
                  <option value="640x1024">2:3 (640*1024)</option>
                  <option value="custom">Custom (自定义)</option>
                </select>
              </div>

              {/* Num Images */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                  num_images_per_prompt <Tooltip text="当前服务仅支持单张输出，已固定为 1" />
                </label>
                <input
                  type="number"
                  min="1"
                  max="1"
                  value={1}
                  disabled
                  className="w-full bg-slate-900 border border-slate-800 text-slate-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                />
              </div>

              {/* Negative Prompt */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                  negative_prompt <Tooltip text="不希望画面中出现的元素" />
                </label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  className="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Low quality, bad anatomy, blurry..."
                />
              </div>

              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                    width <Tooltip text="图片宽度" />
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleDimensionChange('w', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                    height <Tooltip text="图片高度" />
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleDimensionChange('h', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center">
                    num_inference_steps <Tooltip text="去噪步数，通常越高细节越好，但耗时更长" />
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <input
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Seed */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                  seed <Tooltip text="随机种子，固定种子可复现相同的图" />
                </label>
                <input
                  type="number"
                  placeholder="Random"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={generateImage}
              disabled={loading || !activeApiKey}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-900/20 transition-all transform active:scale-95 flex justify-center items-center gap-2 mt-auto ${
                loading || !activeApiKey
                  ? 'bg-slate-800 cursor-not-allowed text-slate-500'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  立即生成
                </>
              )}
            </button>

          </div>

          {/* Right Column: Display Canvas */}
          <div className="lg:col-span-8 flex flex-col h-full">
            <div className="flex-1 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">

              {generatedImages.length > 0 ? (
                <div className="relative w-full h-full flex flex-col">
                  {/* Image Viewer */}
                  <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative">
                    <img
                      src={currentImage}
                      alt={`Generated ${currentImageIndex + 1}`}
                      className="max-w-full max-h-[calc(100vh-250px)] rounded-lg shadow-2xl shadow-black/50 object-contain transition-all duration-300"
                    />

                    {/* Navigation Arrows for Multiple Images */}
                    {generatedImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === 0 ? generatedImages.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === generatedImages.length - 1 ? 0 : prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="bg-slate-900/80 backdrop-blur border-t border-slate-800 p-4 flex justify-between items-center">
                    <div className="flex gap-2 overflow-x-auto max-w-[60%] py-1 no-scrollbar">
                      {generatedImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-12 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                            currentImageIndex === idx ? 'border-indigo-500 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => window.open(currentImage, '_blank')}
                        className="p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="在新标签页打开"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(currentImage)}
                        className="bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        保存图片
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 max-w-md">
                  {error ? (
                    <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">生成失败</p>
                      <p className="text-xs mt-1 opacity-80 break-all">{error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 rotate-3 group-hover:rotate-6 transition-transform">
                        <ImageIcon className="w-10 h-10 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-300 mb-2">工作区就绪</h3>
                      <p className="text-slate-500 text-sm">
                        在左侧面板配置详细参数。<br/>
                        支持自定义尺寸与负向提示词。
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
