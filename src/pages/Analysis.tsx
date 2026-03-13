import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  analyzeVideoWithGemini,
  VideoAnalysisResult,
} from "../services/geminiService";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  PlayCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Hash,
  MessageSquare,
  FileText,
  Video
} from "lucide-react";
import { motion } from "motion/react";

const AnalysisSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="aspect-[9/16] bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl"></div>
        </div>
      </div>
    </div>
  </div>
);

export const Analysis: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const videoUrl = queryParams.get("url") || "";

  useEffect(() => {
    if (!videoUrl) {
      navigate("/");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const data = await analyzeVideoWithGemini(videoUrl, i18n.language);
        setResult(data);
      } catch (err) {
        setError(t("errors.analysis_failed"));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [videoUrl, i18n.language, navigate, t]);

  const handleSave = async () => {
    if (!user) {
      alert(t("errors.login_required"));
      return;
    }
    if (!result) return;

    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "analyses"), {
        videoUrl,
        result,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save analysis:", err);
      alert("Failed to save analysis.");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TokTrend Pro Analysis',
          text: `Check out this analysis for ${videoUrl}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-16 mt-8">
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-spin relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-2">
              Analyzing Video Magic...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              Extracting frames, transcribing audio, and running advanced AI models to uncover viral secrets.
            </p>
          </div>
          <AnalysisSkeleton />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors px-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analysis Failed</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t("analysis.title")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 truncate max-w-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {videoUrl}
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                saved
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow"
              }`}
            >
              {saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? "Saved" : t("analysis.save_btn")}
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              {t("analysis.share_btn")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video Preview & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="aspect-[9/16] bg-gray-900 relative flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 z-10"></div>
                <PlayCircle className="w-16 h-16 text-white/50 group-hover:text-white/80 group-hover:scale-110 transition-all duration-300 z-20" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md uppercase tracking-wider">Preview</span>
                  </div>
                  <p className="text-white font-medium line-clamp-2 text-sm">
                    Simulated Video Preview
                  </p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Views</span>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold">1.2M</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Likes</span>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="font-bold">245K</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Comments</span>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-bold">12.4K</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Shares</span>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Share2 className="w-4 h-4 text-green-500" />
                    <span className="font-bold">8.2K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hook Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full"></div>
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("analysis.hook_score")}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`text-4xl font-black tracking-tighter ${result.hookScore >= 7 ? "text-green-500" : result.hookScore >= 4 ? "text-yellow-500" : "text-red-500"}`}
                  >
                    {result.hookScore}<span className="text-2xl text-gray-400 dark:text-gray-600">/10</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg relative z-10">
                {result.hookComment}
              </p>
            </motion.div>

            {/* Visual Content & Transcript */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("analysis.visual_content")}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {result.visualContent}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("analysis.transcript")}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic border-l-2 border-orange-200 dark:border-orange-800/50 pl-4 py-1">
                  "{result.transcript}"
                </p>
              </motion.div>
            </div>

            {/* Hashtags & Sentiment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("analysis.hashtags")}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {result.hashtagsAnalysis}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("analysis.sentiment")}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {result.sentiment}
                </p>
              </motion.div>
            </div>

            {/* Improvement Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                {t("analysis.tips")}
              </h3>
              <ul className="space-y-4 relative z-10">
                {result.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-indigo-50 text-sm leading-relaxed pt-1">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
