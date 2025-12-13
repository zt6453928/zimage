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
  ImagePlus,
  RefreshCw
} from 'lucide-react';

// SiliconFlow API Key for img2img
const SILICONFLOW_API_KEY = 'sk-vodfbtutaebnpafuucaouxjigetlgjqknskcatpgsskgsgum';

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
        base64: e.target.result, // Full data URL for API
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
  const [apiKey, setApiKey] = useState('V5PWW7GYB8NOTZGQ6EEF4IJL3TIGXJF3YU2L371P'); // Built-in API key for text2img
  const [showSettings, setShowSettings] = useState(false);
  // Multi API Keys
  const [apiKeys, setApiKeys] = useState([]); // [{id, name, key}]
  const [activeKeyId, setActiveKeyId] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Text2Img Parameters
  const [prompt, setPrompt] = useState(''); // No default prompt
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('z-image-turbo');

  // img2img Parameters (SiliconFlow Qwen-Image-Edit-2509)
  const [img2imgPrompt, setImg2imgPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceImage2, setSourceImage2] = useState(null);
  const [sourceImage3, setSourceImage3] = useState(null);
  const [img2imgModel] = useState('Qwen/Qwen-Image-Edit-2509');
  const [cfg, setCfg] = useState(4.0);
  const [img2imgSteps, setImg2imgSteps] = useState(20);
  const [img2imgSeed, setImg2imgSeed] = useState('');
  const [img2imgNegativePrompt, setImg2imgNegativePrompt] = useState('');

  // Advanced Params
  const [sizePreset, setSizePreset] = useState('1024x1024');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [numImages, setNumImages] = useState(1);
  const [steps, setSteps] = useState(9);
  const [seed, setSeed] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paramsOpen, setParamsOpen] = useState(true);

  // Load API Key
  useEffect(() => {
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
    try {
      if (window && window.innerWidth < 768) {
        setParamsOpen(false);
      }
    } catch {}
  }, []);

  const copyToClipboard = () => {
    const textToCopy = mode === 'text2img' ? prompt : img2imgPrompt;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  // Generate random seed
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 9999999999);
    setImg2imgSeed(String(randomSeed));
  };

  // Text2Img Generation (Gitee AI)
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
        extra_body: {
          num_images_per_prompt: 1,
          negative_prompt: negativePrompt || undefined,
          num_inference_steps: steps,
          seed: seed ? parseInt(seed) : undefined,
        }
      };

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

      if (data.data && data.data.length > 0) {
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

  // Img2Img Generation (SiliconFlow API)
  const generateImg2Img = async () => {
    if (!sourceImage) {
      setError("请上传至少一张参考图片");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);
    setCurrentImageIndex(0);

    try {
      const payload = {
        model: img2imgModel,
        prompt: img2imgPrompt || '',
        image: sourceImage.base64,
        num_inference_steps: img2imgSteps,
        cfg: cfg,
      };

      // Add optional images
      if (sourceImage2) {
        payload.image2 = sourceImage2.base64;
      }
      if (sourceImage3) {
        payload.image3 = sourceImage3.base64;
      }

      // Add optional parameters
      if (img2imgSeed) {
        payload.seed = parseInt(img2imgSeed);
      }
      if (img2imgNegativePrompt) {
        payload.negative_prompt = img2imgNegativePrompt;
      }

      console.log('Sending img2img request to SiliconFlow...', {
        model: payload.model,
        hasImage: !!payload.image,
        hasImage2: !!payload.image2,
        hasImage3: !!payload.image3,
        steps: payload.num_inference_steps,
        cfg: payload.cfg
      });

      const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SILICONFLOW_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `Error ${response.status}: 请求失败`);
      }

      console.log('SiliconFlow API Response:', data);

      if (data.images && data.images.length > 0) {
        const images = data.images.map(img => img.url);
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

            {/* Settings Panel (only for text2img) */}
            {showSettings && mode === 'text2img' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">API Keys (Gitee AI)</label>
                  {activeApiKey ? (
                    <span className="text-[10px] text-slate-500">当前: {maskKey(activeApiKey)}</span>
                  ) : (
                    <span className="text-[10px] text-red-400">未配置</span>
                  )}
                </div>

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
                    placeholder="请输入提示词..."
                  />
                </div>

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
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                          Size (尺寸) <Tooltip text="选择预设尺寸" />
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
                          <option value="custom">Custom (自定义)</option>
                        </select>
                      </div>

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

                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-400 flex items-center">
                            num_inference_steps <Tooltip text="去噪步数" />
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

                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                          seed <Tooltip text="随机种子" />
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

            {/* Img2Img Controls (SiliconFlow) */}
            {mode === 'img2img' && (
              <>
                {/* Model Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-slate-400">Model</label>
                      <p className="text-sm text-indigo-400 font-medium mt-1">{img2imgModel}</p>
                    </div>
                    <div className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">SiliconFlow</div>
                  </div>
                </div>

                {/* Image Upload Section - 3 slots */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-300 mb-4">参考图片</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <ImageUploader
                      image={sourceImage}
                      setImage={setSourceImage}
                      label="Image"
                      required={true}
                    />
                    <ImageUploader
                      image={sourceImage2}
                      setImage={setSourceImage2}
                      label="Image 2"
                      required={false}
                    />
                    <ImageUploader
                      image={sourceImage3}
                      setImage={setSourceImage3}
                      label="Image 3"
                      required={false}
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
                    placeholder="请输入提示词..."
                  />
                </div>

                {/* Parameters Section */}
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

                      {/* Seed with random button */}
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                          Seed <Tooltip text="随机种子 (0-9999999999)" />
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={img2imgSeed}
                            onChange={(e) => setImg2imgSeed(e.target.value)}
                            placeholder="留空则随机"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={generateRandomSeed}
                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                            title="生成随机种子"
                          >
                            <RefreshCw className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>
                      </div>

                      {/* CFG */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-400 flex items-center">
                            cfg <Tooltip text="Classifier-free guidance (0.1-20)" />
                          </label>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0.1"
                            max="20"
                            step="0.1"
                            value={cfg}
                            onChange={(e) => setCfg(Number(e.target.value))}
                            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={cfg}
                            onChange={(e) => setCfg(Number(e.target.value))}
                            className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Inference Steps */}
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-xs font-semibold text-slate-400 flex items-center">
                            Inference Steps <Tooltip text="推理步数 (1-100)" />
                          </label>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="100"
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

                      {/* Negative Prompt */}
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 flex items-center">
                          Negative Prompt <Tooltip text="不希望出现的元素" />
                        </label>
                        <textarea
                          value={img2imgNegativePrompt}
                          onChange={(e) => setImg2imgNegativePrompt(e.target.value)}
                          placeholder="Low quality, blurry..."
                          className="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>

                    </div>
                  )}
                </div>
              </>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || (mode === 'text2img' && !activeApiKey) || (mode === 'img2img' && !sourceImage)}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-900/20 transition-all transform active:scale-95 flex justify-center items-center gap-2 mt-auto ${
                loading || (mode === 'text2img' && !activeApiKey) || (mode === 'img2img' && !sourceImage)
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

              {/* Loading State */}
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/80 backdrop-blur-sm">
                  <div className="relative">
                    {/* Animated rings */}
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 animate-ping absolute inset-0"></div>
                    <div className="w-24 h-24 rounded-full border-4 border-t-indigo-500 border-r-indigo-500/50 border-b-indigo-500/20 border-l-indigo-500/20 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-lg font-semibold text-white mb-2">图片生成中...</p>
                    <p className="text-sm text-slate-400">AI 正在创作您的图像</p>
                    <div className="mt-4 flex items-center justify-center gap-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}

              {generatedImages.length > 0 && !loading ? (
                <div className="relative w-full h-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] relative min-h-[200px]">
                    <img
                      src={currentImage}
                      alt={`Generated ${currentImageIndex + 1}`}
                      className="max-w-full max-h-[calc(100vh-250px)] rounded-lg shadow-2xl shadow-black/50 object-contain transition-all duration-300"
                    />

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
              ) : !loading && (
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
                          ? '在左侧面板输入提示词和参数。'
                          : '上传参考图片，输入提示词开始编辑。\n支持最多 3 张参考图片。'
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
