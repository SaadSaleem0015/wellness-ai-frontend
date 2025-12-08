import { useState, useEffect } from "react";
import { Button } from "../Components/Button";
import { backendRequest } from "../Helpers/backendRequest";
import { notyf } from "../Helpers/notyf";
import { API_BASE_URL } from "../Helpers/constants";

interface GeneratedContent {
  text: string;
  imageUrl: string; 
  video_url: string;
  content_type: 'image' | 'video';// backend returns filename; we will route via image/video helpers
}

interface ContentHistoryItem {
  id: number;
  input_prompt: string;
  generated_text: string;
  image_url: string;
  video_url: string;
  content_type: 'image' | 'video';
  created_at: string;
}

const getcontentimage = (filename: string): string => {
  return `${API_BASE_URL}/content-image/${filename}`;
}; 
const getcontentvideo = (filename: string): string => {
  return `${API_BASE_URL}/content-video/${filename}`;
};
export function ContentManagement() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [contentType, setContentType] = useState<'image' | 'video'>('image');
  const [progress, setProgress] = useState<number>(0);
  const [stage, setStage] = useState<string>("Initializing...");

  // Progress animation while generating
  useEffect(() => {
    if (!isGenerating) return;
    setProgress(0);
    setStage("Initializing...");
    const stages = [
      "Analyzing prompt",
      "Brainstorming ideas",
      "Drafting content",
      "Refining tone & style",
      contentType === 'video' ? "Rendering video" : "Composing image",
      "Finalizing output"
    ];
    let i = 0;
    const stageInterval = setInterval(() => {
      i = (i + 1) % stages.length;
      setStage(stages[i]);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        // Slow to 90% max until the request finishes
        const cap = 90;
        const next = p + Math.max(1, Math.round((100 - p) * 0.05));
        return Math.min(next, cap);
      });
    }, 300);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isGenerating, contentType]);

  // Fetch content history
  const fetchContentHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await backendRequest<{ items: ContentHistoryItem[] }>(
        "GET",
        "/content/all"
      );

      if ('items' in response) {
        setContentHistory(response.items);
      } else {
        notyf.error("Failed to load content history");
      }
    } catch (error) {
      console.error("Error fetching content history:", error);
      notyf.error("An error occurred while loading content history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load content history on component mount
  useEffect(() => {
    fetchContentHistory();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      notyf.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await backendRequest<{
        text: string;
        content_type: 'image' | 'video';
        image_url?: string | null;
        video_url?: string | null;
      }>(
        "POST",
        "/content/generate",
        { prompt: prompt.trim(), content_type: contentType }
      );
      console.log("respone0---", response)
      const normalized = {
        text: (response as any).text,
        content_type: (response as any).content_type || (response as any).contentType,
        image_url: (response as any).image_url || (response as any).imageUrl,
        video_url: (response as any).video_url || (response as any).videoUrl
      };
      
      if (normalized.text && normalized.content_type) {
        const gen: GeneratedContent = {
          text: normalized.text,
          content_type: normalized.content_type,
          imageUrl: normalized.image_url || "",
          video_url: normalized.video_url || "",
        };
        setGeneratedContent(gen);
        setProgress(100);
        setStage("Completed");
        setActiveTab("history")
        notyf.success("Content generated successfully!");
        fetchContentHistory();
      } else {
        notyf.error("Failed to generate content. Please try again.");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      notyf.error("An error occurred while generating content");
    } finally {
      setTimeout(() => setIsGenerating(false), 400);
    }
  };

  const handleCopyText = () => {
    if (generatedContent?.text) {
      navigator.clipboard.writeText(generatedContent.text);
      notyf.success("Text copied to clipboard!");
    }
  };

  const handleDownloadMedia = () => {
    if (!generatedContent) return;
    const isVideo = generatedContent.content_type === 'video';
    const filename = isVideo ? generatedContent.video_url : generatedContent.imageUrl;
    if (!filename) return;
    const url = isVideo ? getcontentvideo(filename) : getcontentimage(filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = isVideo ? 'generated-video.mp4' : 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notyf.success(`${isVideo ? 'Video' : 'Image'} download started!`);
  };

  const handleCopyHistoryText = (text: string) => {
    navigator.clipboard.writeText(text);
    notyf.success("Text copied to clipboard!");
  };

  const handleDownloadHistoryMedia = (type: 'image' | 'video', filename: string | null) => {
    if (!filename) return;
    const url = type === 'video' ? getcontentvideo(filename) : getcontentimage(filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = type === 'video' ? 'generated-video.mp4' : 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notyf.success(`${type === 'video' ? 'Video' : 'Image'} download started!`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
        <p className="text-gray-600">Generate AI-powered content and images for your wellness campaigns</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Generate Content
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Content History ({contentHistory.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Generate Content Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Prompt Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Content</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the content you want to generate... (e.g., 'Create a motivational post about healthy eating habits for busy professionals')"
                  className="w-full p-4 border rounded-lg outline-none ring-1 ring-gray-300 focus:ring-primary resize-none"
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              {/* Content type selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700 font-medium">Content type:</span>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="content_type"
                    value="image"
                    checked={contentType === 'image'}
                    onChange={() => setContentType('image')}
                    disabled={isGenerating}
                  />
                  Image
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="content_type"
                    value="video"
                    checked={contentType === 'video'}
                    onChange={() => setContentType('video')}
                    disabled={isGenerating}
                  />
                  Video
                </label>
              </div>
              
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </div>
          </div>

          {/* Generated Content Display */}
          {generatedContent && (
            <div className="space-y-6">
              {/* Generated Text */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated Text</h3>
                  <Button
                    onClick={handleCopyText}
                    className="px-4 py-2 text-sm"
                    varient="primary"
                  >
                    Copy Text
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {generatedContent.text}
                  </p>
                </div>
              </div>

              {/* Generated Media (Image or Video) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Generated {generatedContent.content_type === 'video' ? 'Video' : 'Image'}</h3>
                  <Button
                    onClick={handleDownloadMedia}
                    className="px-4 py-2 text-sm"
                    varient="primary"
                  >
                    Download {generatedContent.content_type === 'video' ? 'Video' : 'Image'}
                  </Button>
                </div>
                <div className="flex justify-center">
                  {generatedContent.content_type === 'video' ? (
                    <video
                      controls
                      className="max-w-full rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-center text-gray-500 py-8">Video failed to load</div>';
                        }
                      }}
                    >
                      <source src={getcontentvideo(generatedContent.video_url)} />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img
                      src={getcontentimage(generatedContent.imageUrl)}
                      alt="Generated content"
                      className="max-w-full h-auto rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-center text-gray-500 py-8">Image failed to load</div>';
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {isGenerating && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary bg-opacity-10 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Generating {contentType === 'video' ? 'Video' : 'Image'} Content</h3>
                <p className="text-gray-600 mb-4">{stage}</p>

                {/* Progress bar */}
                <div className="w-full max-w-xl mx-auto">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{progress}%</div>
                </div>

                {/* Skeleton previews */}
                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                    <div className="h-24 bg-gray-100 rounded" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
                    <div className="h-24 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

{activeTab === 'history' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">Content History</h2>
      <Button
        onClick={fetchContentHistory}
        disabled={isLoadingHistory}
        className="px-4 py-2 text-sm"
        varient="primary"
      >
        {isLoadingHistory ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Loading...
          </div>
        ) : (
          "Refresh"
        )}
      </Button>
    </div>

    {isLoadingHistory ? (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content history...</p>
        </div>
      </div>
    ) : contentHistory.length === 0 ? (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No content generated yet</p>
          <p>Switch to the "Generate Content" tab to create your first piece of content.</p>
        </div>
      </div>
    ) : (
      <div className="grid gap-6">
        {contentHistory.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Section */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{item.id}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(item.created_at)}</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {item.content_type === 'video' ? 'Video' : 'Image'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleCopyHistoryText(item.generated_text)}
                    className="px-3 py-1.5 text-xs"
                    varient="outline"
                  >
                    Copy Text
                  </Button>
                  <Button
                    onClick={() => handleDownloadHistoryMedia(item.content_type, item.content_type === 'video' ? item.video_url : item.image_url)}
                    className="px-3 py-1.5 text-xs"
                    varient="primary"
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {/* Prompt Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Prompt</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {item.input_prompt}
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Generated Text */}
                <div className="lg:border-r lg:border-gray-200 lg:pr-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Generated Text</h4>
                    <div className="text-xs text-gray-500">
                      {item.generated_text?.length || 0} characters
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-64 overflow-y-auto">
                    <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {item.generated_text}
                    </pre>
                  </div>
                </div>

                {/* Generated Media */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Generated Media</h4>
                    <span className="text-xs text-gray-500 capitalize">{item.content_type}</span>
                  </div>
                  <div className="relative bg-gray-300 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden min-h-[300px] flex items-center justify-center">
                    {item.content_type === 'video' ? (
                      item.video_url ? (
                        <div className="w-full">
                          <video
                            controls
                            className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                            poster={item.thumbnail_url || undefined}
                            onError={(e) => {
                              const target = e.target as HTMLVideoElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="text-center p-8">
                                    <div class="text-red-500 mb-2">
                                      <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <p class="text-gray-700 font-medium">Video not available</p>
                                    <p class="text-gray-500 text-sm mt-1">The video could not be loaded</p>
                                  </div>
                                `;
                              }
                            }}
                          >
                            <source src={getcontentvideo(item.video_url)} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="text-center p-8">
                          <div className="text-gray-400 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-600 font-medium">No video available</p>
                          <p className="text-gray-500 text-sm mt-1">Video URL is missing</p>
                        </div>
                      )
                    ) : (
                      item.image_url ? (
                        <img
                          src={getcontentimage(item.image_url)}
                          alt={`Generated content for: ${item.input_prompt}`}
                          className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="text-center p-8">
                                  <div class="text-red-500 mb-2">
                                    <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <p class="text-gray-700 font-medium">Image not available</p>
                                  <p class="text-gray-500 text-sm mt-1">The image could not be loaded</p>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="text-center p-8">
                          <div className="text-gray-400 mb-3">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-600 font-medium">No image available</p>
                          <p className="text-gray-500 text-sm mt-1">Image URL is missing</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
}
