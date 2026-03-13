import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { VideoAnalysisResult } from "../services/geminiService";
import { LayoutDashboard, Trash2, RefreshCw, PlayCircle, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface SavedAnalysis {
  id: string;
  videoUrl: string;
  result: VideoAnalysisResult;
  createdAt: any;
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "analyses"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedAnalysis[];
      setAnalyses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "analyses", id));
    } catch (error) {
      console.error("Error deleting analysis:", error);
    }
  };

  const avgHookScore =
    analyses.length > 0
      ? (
          analyses.reduce((acc, curr) => acc + curr.result.hookScore, 0) /
          analyses.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="relative">
          <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 relative z-10"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("dashboard.title")}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {t("dashboard.total_analyses")}
              </h3>
              <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
                {analyses.length}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                {t("dashboard.avg_hook_score")}
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </h3>
              <div className="flex items-baseline gap-1">
                <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                  {avgHookScore}
                </p>
                <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">/10</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            {t("dashboard.saved_analyses")}
          </h2>
        </div>

        {analyses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 dark:from-indigo-900/10 via-transparent to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                <PlayCircle className="w-12 h-12 text-indigo-300 dark:text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No analyses yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                Start analyzing TikTok videos to uncover viral trends, get AI-powered insights, and track your performance over time.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 group"
              >
                Analyze Your First Video
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all duration-300 group"
              >
                <div className="p-6 flex-grow relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 dark:from-gray-800/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-inner ${
                          analysis.result.hookScore >= 7
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                            : analysis.result.hookScore >= 4
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50"
                              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                        }`}
                      >
                        {analysis.result.hookScore}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">
                          Hook Score
                        </p>
                        <p
                          className="text-sm text-gray-900 dark:text-white font-medium truncate w-32 sm:w-40"
                          title={analysis.videoUrl}
                        >
                          {analysis.videoUrl.replace(
                            "https://www.tiktok.com/",
                            "",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-6 relative z-10">
                    {analysis.result.hookComment}
                  </p>

                  <div className="space-y-2 relative z-10">
                    <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Top Tip
                    </p>
                    <p className="text-sm text-indigo-900 dark:text-indigo-200 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30 p-4 rounded-2xl line-clamp-2">
                      {analysis.result.tips[0]}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/30 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <button
                    onClick={() =>
                      navigate(
                        `/analysis?url=${encodeURIComponent(analysis.videoUrl)}`,
                      )
                    }
                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t("dashboard.reanalyze")}
                  </button>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="text-sm font-bold text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t("dashboard.delete")}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
