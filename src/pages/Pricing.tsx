/// <reference types="vite/client" />
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { Check, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "motion/react";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_dummy",
);

export const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const { user, isPro, login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      await login();
      return;
    }

    setLoading(planName);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user.uid,
        }),
      });

      const session = await response.json();
      if (session.error) {
        throw new Error(session.error);
      }

      const stripe = await stripePromise;
      if (stripe) {
        // @ts-ignore
        await stripe.redirectToCheckout({ sessionId: session.id });
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm mb-8 border border-indigo-200 dark:border-indigo-800/50"
        >
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black text-gray-900 dark:text-white sm:text-5xl lg:text-6xl tracking-tight"
        >
          {t("pricing.title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl text-gray-600 dark:text-gray-400 mx-auto"
        >
          Choose the perfect plan to unlock the secrets of TikTok virality and skyrocket your growth.
        </motion.p>

        <div className="mt-20 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8 max-w-6xl mx-auto items-center">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="flex-1 text-left">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("pricing.free.name")}
              </h3>
              <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                <span className="text-5xl font-black tracking-tight">
                  {t("pricing.free.price")}
                </span>
                <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </p>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">Perfect for getting started and testing the waters.</p>
              <ul className="mt-8 space-y-4">
                {(
                  t("pricing.free.features", {
                    returnObjects: true,
                  }) as string[]
                ).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              disabled
              className="mt-8 block w-full bg-gray-100 dark:bg-gray-800 border border-transparent rounded-xl py-4 px-6 text-center font-bold text-gray-500 dark:text-gray-400 cursor-not-allowed"
            >
              {isPro ? "Included" : t("pricing.current_plan")}
            </button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative p-8 bg-gradient-to-b from-indigo-600 to-purple-700 dark:from-indigo-900 dark:to-purple-900 border border-indigo-500 dark:border-indigo-700 rounded-3xl shadow-2xl flex flex-col transform md:-translate-y-4 h-full z-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute top-0 inset-x-0 flex justify-center -translate-y-1/2">
              <span className="inline-flex rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-1 text-sm font-bold tracking-wider text-white uppercase shadow-lg">
                Most Popular
              </span>
            </div>
            <div className="flex-1 text-left relative z-10 mt-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {t("pricing.premium.name")}
              </h3>
              <p className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-black tracking-tight">
                  {t("pricing.premium.price")}
                </span>
                <span className="ml-1 text-xl font-medium text-indigo-200">/mo</span>
              </p>
              <p className="mt-4 text-indigo-100 text-sm">Everything you need to consistently go viral.</p>
              <ul className="mt-8 space-y-4">
                {(
                  t("pricing.premium.features", {
                    returnObjects: true,
                  }) as string[]
                ).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5 backdrop-blur-sm">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="ml-3 text-white">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("price_premium_dummy", "premium")}
              disabled={loading === "premium" || isPro}
              className={`mt-8 block w-full rounded-xl py-4 px-6 text-center font-bold transition-all duration-200 relative z-10 ${
                isPro
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-white text-indigo-600 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading === "premium" ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : isPro ? (
                t("pricing.current_plan")
              ) : (
                t("pricing.subscribe_btn")
              )}
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
          >
            <div className="flex-1 text-left">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
                <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("pricing.pro.name")}
              </h3>
              <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                <span className="text-5xl font-black tracking-tight">
                  {t("pricing.pro.price")}
                </span>
                <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </p>
              <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm">For agencies and serious content creators.</p>
              <ul className="mt-8 space-y-4">
                {(
                  t("pricing.pro.features", { returnObjects: true }) as string[]
                ).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("price_pro_dummy", "pro")}
              disabled={loading === "pro"}
              className="mt-8 block w-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl py-4 px-6 text-center font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              {loading === "pro" ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                t("pricing.subscribe_btn")
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
