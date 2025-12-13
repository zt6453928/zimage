import React, { useState, useEffect, useRef } from 'react';

import {
  Image as ImageIcon,
  Download,
  Sparkles,
  AlertCircle,
  Loader2,
  Plus,
  Send,
  X,
  ImagePlus,
  RefreshCw,
  Ratio,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';

// SiliconFlow API Key for img2img
const SILICONFLOW_API_KEY = 'sk-vodfbtutaebnpafuucaouxjigetlgjqknskcatpgsskgsgum';

// Built-in API key for text2img
const DEFAULT_API_KEY = 'V5PWW7GYB8NOTZGQ6EEF4IJL3TIGXJF3YU2L371P';

const App = () => {
  // Mode State
  const [mode, setMode] = useState('text2img');

  // Chat messages for each mode
  const [text2imgMessages, setText2imgMessages] = useState([]);
  const [img2imgMessages, setImg2imgMessages] = useState([]);

  // Input state
  const [inputText, setInputText] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);

  // Parameters
  const [sizePreset, setSizePreset] = useState('1024x1024');
  const [showParams, setShowParams] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [steps, setSteps] = useState(9);
  const [seed, setSeed] = useState('');
  const [cfg, setCfg] = useState(4.0);
  const [img2imgSteps, setImg2imgSteps] = useState(20);

  // ControlNet parameters
  const [controlNetEnabled, setControlNetEnabled] = useState(false);
  const [controlImage, setControlImage] = useState(null);
  const [controlMode, setControlMode] = useState('Canny');
  const [controlContextScale, setControlContextScale] = useState(0.75);
  const [imageScale, setImageScale] = useState(1);
  const [guidanceScale, setGuidanceScale] = useState(1);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const fileInputRef = useRef(null);
  const controlImageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Size presets
  const sizePresets = [
    { value: '512x512', label: '1:1', desc: '512×512' },
    { value: '1024x1024', label: '1:1', desc: '1024×1024' },
    { value: '2048x2048', label: '1:1', desc: '2048×2048' },
    { value: '1024x768', label: '4:3', desc: '1024×768' },
    { value: '768x1024', label: '3:4', desc: '768×1024' },
    { value: '1024x576', label: '16:9', desc: '1024×576' },
    { value: '576x1024', label: '9:16', desc: '576×1024' },
    { value: '1024x640', label: '3:2', desc: '1024×640' },
    { value: '640x1024', label: '2:3', desc: '640×1024' },
  ];

  // Get current messages based on mode
  const currentMessages = mode === 'text2img' ? text2imgMessages : img2imgMessages;
  const setCurrentMessages = mode === 'text2img' ? setText2imgMessages : setImg2imgMessages;

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentMessages, loading]);

  // Handle file upload
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file: file,
            preview: e.target.result,
            base64: e.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadedImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  // Handle ControlNet image upload
  const handleControlImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Extract base64 without the data:image/xxx;base64, prefix
        const base64Full = e.target.result;
        const base64Data = base64Full.split(',')[1];
        setControlImage({
          file: file,
          preview: base64Full,
          base64: base64Data,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
    if (controlImageInputRef.current) {
      controlImageInputRef.current.value = '';
    }
  };

  const removeControlImage = () => {
    setControlImage(null);
  };

  // Generate random seed
  const generateRandomSeed = () => {
    return Math.floor(Math.random() * 9999999999);
  };

  // Text2Img Generation
  const generateText2Img = async (prompt) => {
    const [width, height] = sizePreset.split('x').map(Number);

    const payload = {
      model: 'z-image-turbo',
      prompt: prompt,
      size: `${width}x${height}`,
      num_images_per_prompt: 1,
      num_inference_steps: steps,
    };

    // Add optional parameters
    if (negativePrompt) {
      payload.negative_prompt = negativePrompt;
    }
    if (seed) {
      payload.seed = parseInt(seed);
    }

    // Add ControlNet parameters if enabled
    if (controlNetEnabled && controlImage) {
      payload.control_image = controlImage.base64;
      payload.control_mode = controlMode;
      payload.control_context_scale = controlContextScale;
      payload.image_scale = imageScale;
      payload.guidance_scale = guidanceScale;
    }

    const response = await fetch("https://ai.gitee.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEFAULT_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Error ${response.status}: 请求失败`);
    }

    if (data.data && data.data.length > 0) {
      return data.data.map(img => img.url || `data:image/jpeg;base64,${img.b64_json}`);
    }
    throw new Error("API 未返回任何数据");
  };

  // Img2Img Generation
  const generateImg2Img = async (prompt, images) => {
    const payload = {
      model: 'Qwen/Qwen-Image-Edit-2509',
      prompt: prompt || '',
      image: images[0].base64,
      num_inference_steps: img2imgSteps,
      cfg: cfg,
    };

    if (images[1]) payload.image2 = images[1].base64;
    if (images[2]) payload.image3 = images[2].base64;

    if (seed) payload.seed = parseInt(seed);
    if (negativePrompt) payload.negative_prompt = negativePrompt;

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

    if (data.images && data.images.length > 0) {
      return data.images.map(img => img.url);
    }
    throw new Error("API 未返回任何数据");
  };

  // Handle send message
  const handleSend = async () => {
    if (mode === 'img2img' && uploadedImages.length === 0) {
      setError("请先上传参考图片");
      return;
    }

    if (!inputText.trim() && mode === 'text2img') {
      setError("请输入提示词");
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      images: [...uploadedImages],
      timestamp: new Date()
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setInputText('');
    setUploadedImages([]);
    setLoading(true);
    setError(null);

    try {
      let resultImages;
      if (mode === 'text2img') {
        resultImages = await generateText2Img(inputText);
      } else {
        resultImages = await generateImg2Img(inputText, userMessage.images);
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        images: resultImages,
        timestamp: new Date()
      };

      setCurrentMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: err.message || "生成失败",
        timestamp: new Date()
      };
      setCurrentMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (url) => {
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

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const clearChat = () => {
    setCurrentMessages([]);
  };

  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Free for art</span>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMode('text2img')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'text2img'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              文生图
            </button>
            <button
              onClick={() => setMode('img2img')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'img2img'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              图生图
            </button>
          </div>

          {/* Clear button */}
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="清空对话"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50"
      >
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {currentMessages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                {mode === 'text2img' ? (
                  <Sparkles className="w-10 h-10 text-indigo-500" />
                ) : (
                  <ImagePlus className="w-10 h-10 text-indigo-500" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {mode === 'text2img' ? '文生图' : '图生图'}
              </h2>
              <p className="text-gray-500 text-sm max-w-md">
                {mode === 'text2img'
                  ? '输入提示词，AI 将为你生成精美图片'
                  : '上传参考图片，输入提示词进行图像编辑'}
              </p>
            </div>
          )}

          {currentMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.type === 'user' ? (
                <div className="max-w-[80%] space-y-2">
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {msg.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img.preview}
                          alt={`uploaded ${idx}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                      ))}
                    </div>
                  )}
                  {msg.text && (
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm">
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  )}
                </div>
              ) : msg.type === 'error' ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[80%] space-y-2">
                  {msg.images && msg.images.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`generated ${idx}`}
                        className="max-w-full rounded-2xl rounded-bl-md shadow-lg"
                        style={{ maxHeight: '400px' }}
                      />
                      <button
                        onClick={() => handleDownload(url)}
                        className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-sm text-gray-600">图片生成中...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="flex-shrink-0 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Error message */}
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Uploaded images preview */}
          {uploadedImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {uploadedImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.preview}
                    alt={img.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => removeUploadedImage(img.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Parameters row */}
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {/* Size selector */}
            <div className="relative">
              <select
                value={sizePreset}
                onChange={(e) => setSizePreset(e.target.value)}
                className="appearance-none bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {sizePresets.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label} ({preset.desc})
                  </option>
                ))}
              </select>
              <Ratio className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Parameters toggle */}
            <button
              onClick={() => setShowParams(!showParams)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showParams
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>参数</span>
            </button>

            {/* Random seed button */}
            <button
              onClick={() => setSeed(String(generateRandomSeed()))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>随机种子</span>
            </button>
          </div>

          {/* Expanded parameters */}
          {showParams && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">负面提示词</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Low quality, blurry..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Seed</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="随机"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Steps: {mode === 'text2img' ? steps : img2imgSteps}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max={mode === 'text2img' ? 50 : 100}
                    value={mode === 'text2img' ? steps : img2imgSteps}
                    onChange={(e) => mode === 'text2img' ? setSteps(Number(e.target.value)) : setImg2imgSteps(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                {mode === 'img2img' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">CFG: {cfg}</label>
                    <input
                      type="range"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={cfg}
                      onChange={(e) => setCfg(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* ControlNet Section - only for text2img */}
              {mode === 'text2img' && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="controlnet-toggle"
                      checked={controlNetEnabled}
                      onChange={(e) => setControlNetEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="controlnet-toggle" className="text-sm font-medium text-gray-700">
                      启用 ControlNet
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    ControlNet 可以让生成的图片与参考图保持相似的结构、边缘或姿态
                  </p>

                  {controlNetEnabled && (
                    <div className="space-y-3">
                      {/* Control Image Upload */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">control_image 参考图片</label>
                        <input
                          ref={controlImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleControlImageSelect}
                          className="hidden"
                        />
                        {controlImage ? (
                          <div className="relative inline-block">
                            <img
                              src={controlImage.preview}
                              alt="control"
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={removeControlImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => controlImageInputRef.current?.click()}
                            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors"
                          >
                            <Plus className="w-6 h-6" />
                            <span className="text-xs mt-1">上传图片</span>
                          </button>
                        )}
                      </div>

                      {/* Control Mode */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">control_mode 控制模式</label>
                          <select
                            value={controlMode}
                            onChange={(e) => setControlMode(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Canny">Canny (边缘检测)</option>
                            <option value="Depth">Depth (深度图)</option>
                            <option value="HED">HED (软边缘)</option>
                            <option value="MLSD">MLSD (直线检测)</option>
                            <option value="Pose">Pose (姿态检测)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            control_context_scale: {controlContextScale}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={controlContextScale}
                            onChange={(e) => setControlContextScale(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            image_scale: {imageScale}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={imageScale}
                            onChange={(e) => setImageScale(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">
                            guidance_scale: {guidanceScale}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={guidanceScale}
                            onChange={(e) => setGuidanceScale(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'text2img' ? '输入提示词描述你想要的图片...' : '输入提示词描述你想要的编辑效果...'}
                rows={1}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-[48px]"
              />
            </div>

            {/* Upload button - only show in img2img mode */}
            {mode === 'img2img' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-[48px] h-[48px] flex items-center justify-center bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={loading || (mode === 'text2img' && !inputText.trim()) || (mode === 'img2img' && uploadedImages.length === 0)}
              className={`flex-shrink-0 w-[48px] h-[48px] flex items-center justify-center rounded-xl transition-all ${
                loading || (mode === 'text2img' && !inputText.trim()) || (mode === 'img2img' && uploadedImages.length === 0)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
