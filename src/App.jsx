import React, { useState, useEffect, useRef } from 'react';

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
  Maximize2,
  Upload,
  X,
  ImagePlus
} from 'lucide-react';

const DEFAULT_PROMPT = "一张虚构的英语电影《回忆之味》（The Taste of Memory）的电影海报。场景设置在一个质朴的19世纪风格厨房里。画面中央，一位红棕色头发、留着小胡子的中年男子（演员阿瑟·彭哈利根饰）站在一张木桌后，他身穿白色衬衫、黑色马甲和米色围裙，正看着一位女士，手中拿着一大块生红肉，下方是一个木制切菜板。在他的右边，一位梳着高髻的黑发女子（演员埃莉诺·万斯饰）倚靠在桌子上，温柔地对他微笑。她穿着浅色衬衫和一条上白下蓝的长裙。桌上除了放有切碎的葱和卷心菜丝的切菜板外，还有一个白色陶瓷盘、新鲜香草，左侧一个木箱上放着一串深色葡萄。背景是一面粗糙的灰白色抹灰墙，墙上挂着一幅风景画。最右边的一个台面上放着一盏复古油灯。海报上有大量的文字信息。左上角是白色的无衬线字体\"ARTISAN FILMS PRESENTS\"，其下方是\"ELEANOR VANCE\"和\"ACADEMY AWARD® WINNER\"。右上角写着\"ARTHUR PENHALIGON\"和\"GOLDEN GLOBE® AWARD WINNER\"。顶部中央是圣丹斯电影节的桂冠标志，下方写着\"SUNDANCE FILM FESTIVAL GRAND JURY PRIZE 2024\"。主标题\"THE TASTE OF MEMORY\"以白色的大号衬线字体醒目地显示在下半部分。标题下方注明了\"A FILM BY Tongyi Interaction Lab\"。底部区域用白色小字列出了完整的演职员名单，包括\"SCREENPLAY BY ANNA REID\"、\"CULINARY DIRECTION BY JAMES CARTER\"以及Artisan Films、Riverstone Pictures和Heritage Media等众多出品公司标志。整体风格是写实主义，采用温暖柔和的灯光方案，营造出一种亲密的氛围。色调以棕色、米色和柔和的绿色等大地色系为主。两位演员的身体都在腰部被截断";

const DEFAULT_IMG2IMG_PROMPT = "A sunlit indoor lounge area with a pool containing a flamingo";

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <HelpCircle className="w-4 h-4 text-slate-500 cursor-help" />
    <div className="invisible group-hover:visible absolute z-10 w-48 bg-slate-800 text-slate-200 text-xs rounded p-2 bottom-full left-1/2 -translate-x-1/2 mb-2 shadow-lg border border-slate-700">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

// Image Upload Component with drag & drop
const ImageUploader = ({ image, setImage, label, required = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage({
        file: file,
        preview: e.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-400 flex items-center">
        {label} {required && <span className="text-red-400 ml-1">*</span>}
        <Tooltip text="拖拽图片到此处或点击选择文件" />
      </label>
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : image
            ? 'border-slate-600 bg-slate-900/50'
            : 'border-slate-700 hover:border-slate-600 bg-slate-950'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {image ? (
          <div className="relative aspect-square">
            <img
              src={image.preview}
              alt="Preview"
              className="w-full h-full object-contain bg-slate-950"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs text-slate-300 truncate">{image.name}</p>
            </div>
          </div>
        ) : (
          <div className="aspect-square flex flex-col items-center justify-center p-4 text-center">
            <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-indigo-400' : 'text-slate-500'}`} />
            <p className="text-xs text-slate-400">拖拽文件到此处</p>
            <p className="text-xs text-slate-500">或点击选择文件</p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  // Mode State
  const [mode, setMode] = useState('text2img'); // 'text2img' or 'img2img'

  // Configuration State
  const [apiKey, setApiKey] = useState('V5PWW7GYB8NOTZGQ6EEF4IJL3TIGXJF3YU2L371P'); // Built-in API key
  const [showSettings, setShowSettings] = useState(false);
  // Multi API Keys
  const [apiKeys, setApiKeys] = useState([]); // [{id, name, key}]
  const [activeKeyId, setActiveKeyId] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Text2Img Parameters
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('z-image-turbo');

  // img2img Parameters
  const [img2imgPrompt, setImg2imgPrompt] = useState(DEFAULT_IMG2IMG_PROMPT);
  const [sourceImage, setSourceImage] = useState(null);
  const [img2imgModel, setImg2imgModel] = useState('FLUX.1-Kontext-dev');
  const [guidanceScale, setGuidanceScale] = useState(2.5);
  const [returnImageQuality, setReturnImageQuality] = useState(80);
  const [img2imgSteps, setImg2imgSteps] = useState(20);
  const [img2imgSeed, setImg2imgSeed] = useState('');

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
    const textToCopy = mode === 'text2img' ? prompt : img2imgPrompt;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Utilities for API keys
  // Use user-selected key first, then fall back to built-in key
  const activeApiKey = (apiKeys.find(k => k.id === activeKeyId)?.key) || apiKey;
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

  // Text2Img Generation
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

  // Img2Img Generation
  const generateImg2Img = async () => {
    if (!activeApiKey) {
      setError("请输入 API Key");
      setShowSettings(true);
      return;
    }

    if (!sourceImage) {
      setError("请上传一张参考图片");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);
    setCurrentImageIndex(0);

    try {
      const formData = new FormData();
      formData.append('image', sourceImage.file);
      formData.append('prompt', img2imgPrompt);
      formData.append('model', img2imgModel);
      formData.append('size', `${width}x${height}`);
      formData.append('steps', String(img2imgSteps));
      formData.append('guidance_scale', String(guidanceScale));
      formData.append('return_image_quality', String(returnImageQuality));
      if (img2imgSeed) {
        formData.append('seed', img2imgSeed);
      }

      console.log('Sending img2img request...'); // 调试信息

      const response = await fetch("https://ai.gitee.com/v1/images/edits", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeApiKey}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `Error ${response.status}: 请求失败`);
      }

      console.log('Img2Img API Response:', data); // 调试信息

      if (data.data && data.data.length > 0) {
        const images = data.data.map(img => {
          if (img.url) return img.url;
          if (img.b64_json) return `data:image/jpeg;base64,${img.b64_json}`;
          return null;
        }).filter(Boolean);
        setGeneratedImages(images);
      } else {
        throw new Error("API 未返回任何数据");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "图生图时发生未知错误");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (mode === 'text2img') {
      generateImage();
    } else {
      generateImg2Img();
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
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-4 sm:py-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Free for art</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-[calc(100vh-140px)]">

          {/* Left Column: Scrollable Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4 lg:overflow-y-auto lg:pr-2 custom-scrollbar">

            {/* Mode Tabs */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-1 flex">
              <button
                onClick={() => setMode('text2img')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === 'text2img'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>文生图</span>
              </button>
              <button
                onClick={() => setMode('img2img')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === 'img2img'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ImagePlus className="w-4 h-4" />
                <span>图生图</span>
              </button>
            </div>

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
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-300 truncate">{k.name || '未命名 Key'}</div>
                          <div className="text-[10px] text-slate-500">{maskKey(k.key)}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
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

            {/* Text2Img Controls */}
            {mode === 'text2img' && (
              <>
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
              </>
            )}

            {/* Img2Img Controls */}
            {mode === 'img2img' && (
              <>
                {/* Image Upload Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-300 mb-4">参考图片</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploader
                      image={sourceImage}
                      setImage={setSourceImage}
                      label="源图片 (image)"
                      required={true}
                    />
                  </div>
                </div>

                {/* Prompt Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col flex-shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-indigo-400 flex items-center gap-2">
                      提示词 (Prompt)
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
                    value={img2imgPrompt}
                    onChange={(e) => setImg2imgPrompt(e.target.value)}
                    className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none scrollbar-thin scrollbar-thumb-slate-700"
                    placeholder="描述你想要的效果..."
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
                      size (尺寸) <Tooltip text="选择预设尺寸" />
                    </label>
                    <select
                      value={sizePreset}
                      onChange={handleSizePresetChange}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="1024x1024">1:1 (1024*1024)</option>
                      <option value="1152x896">4:3 (1152*896)</option>
                      <option value="768x1024">3:4 (768*1024)</option>
                      <option value="1024x576">16:9 (1024*576)</option>
                      <option value="576x1024">9:16 (576*1024)</option>
                    </select>
                  </div>

                  {/* Steps */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 flex items-center">
                        steps <Tooltip text="推理步数，通常越高细节越好" />
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={img2imgSteps}
                        onChange={(e) => setImg2imgSteps(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <input
                        type="number"
                        value={img2imgSteps}
                        onChange={(e) => setImg2imgSteps(Number(e.target.value))}
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Guidance Scale */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 flex items-center">
                        guidance_scale <Tooltip text="引导强度，越高越接近提示词描述" />
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.1"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(Number(e.target.value))}
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Seed */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                      seed <Tooltip text="随机种子，固定种子可复现相同的图" />
                    </label>
                    <textarea
                      value={img2imgSeed}
                      onChange={(e) => setImg2imgSeed(e.target.value)}
                      placeholder="留空则随机"
                      className="w-full h-16 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {/* Return Image Quality */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 flex items-center">
                        return_image_quality <Tooltip text="返回图片质量 (1-100)" />
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={returnImageQuality}
                        onChange={(e) => setReturnImageQuality(Number(e.target.value))}
                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <input
                        type="number"
                        value={returnImageQuality}
                        onChange={(e) => setReturnImageQuality(Number(e.target.value))}
                        className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Width & Height */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                        width <Tooltip text="输出图片宽度" />
                      </label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleDimensionChange('w', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="可选"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                        height <Tooltip text="输出图片高度" />
                      </label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleDimensionChange('h', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="可选"
                      />
                    </div>
                  </div>

                    </div>
                  )}
                </div>
              </>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !activeApiKey || (mode === 'img2img' && !sourceImage)}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-900/20 transition-all transform active:scale-95 flex justify-center items-center gap-2 mt-auto ${
                loading || !activeApiKey || (mode === 'img2img' && !sourceImage)
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
                  {mode === 'text2img' ? <Sparkles className="w-5 h-5" /> : <ImagePlus className="w-5 h-5" />}
                  {mode === 'text2img' ? '立即生成' : '运行'}
                </>
              )}
            </button>

          </div>

          {/* Right Column: Display Canvas */}
          <div className="lg:col-span-8 flex flex-col min-h-[300px] lg:h-full">
            <div className="flex-1 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">

              {generatedImages.length > 0 ? (
                <div className="relative w-full h-full flex flex-col">
                  {/* Image Viewer */}
                  <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative min-h-[200px]">
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
                          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === generatedImages.length - 1 ? 0 : prev + 1)}
                          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full backdrop-blur-sm transition-all"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="bg-slate-900/80 backdrop-blur border-t border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="flex gap-2 overflow-x-auto max-w-full sm:max-w-[60%] py-1 no-scrollbar">
                      {generatedImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                            currentImageIndex === idx ? 'border-indigo-500 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => window.open(currentImage, '_blank')}
                        className="p-2 sm:p-2.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        title="在新标签页打开"
                      >
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={() => handleDownload(currentImage)}
                        className="bg-white text-slate-900 hover:bg-slate-200 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm"
                      >
                        <Download className="w-4 h-4" />
                        保存图片
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 sm:p-8 max-w-md">
                  {error ? (
                    <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">生成失败</p>
                      <p className="text-xs mt-1 opacity-80 break-all">{error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700 rotate-3 group-hover:rotate-6 transition-transform">
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-medium text-slate-300 mb-2">工作区就绪</h3>
                      <p className="text-slate-500 text-xs sm:text-sm">
                        {mode === 'text2img'
                          ? '在左侧面板配置详细参数。\n支持自定义尺寸与负向提示词。'
                          : '上传参考图片，输入提示词。\n支持图片编辑与风格转换。'
                        }
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
