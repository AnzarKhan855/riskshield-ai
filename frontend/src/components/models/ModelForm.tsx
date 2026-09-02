"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  modelRegisterFormSchema,
  ModelRegisterFormValues,
} from "@/validators/model_registry";
import { Cpu, Save } from "lucide-react";

interface ModelFormProps {
  onSubmit: (values: ModelRegisterFormValues) => void;
  isLoading: boolean;
}

export default function ModelForm({ onSubmit, isLoading }: ModelFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ModelRegisterFormValues>({
    resolver: zodResolver(modelRegisterFormSchema),
    defaultValues: {
      model_name: "",
      model_type: "Fraud Detection",
      business_domain: "Fraud & Risk",
      version: "v1.0.0",
      framework: "XGBoost",
      algorithm: "XGBoost Classifier",
      description: "",
      training_dataset_version: "ds_v1.0",
      feature_version: "v1.0",
      input_schema_version: "v1.0",
      output_schema_version: "v1.0",
      accuracy: 0.95,
      precision: 0.94,
      recall: 0.92,
      f1_score: 0.93,
      roc_auc: 0.97,
      latency_ms: 12.5,
      owner: "ML Ops Team",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-graphite-900 border border-graphite-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-graphite-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-copper-400" />
            <span>Model Artifact Specification</span>
          </h2>
          <p className="text-xs text-graphite-400 mt-1">
            Specify model metadata, target domain, framework, and performance evaluation metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Model Name *
            </label>
            <input
              type="text"
              {...register("model_name")}
              placeholder="e.g. XGBoost Fraud Classifier v2"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
            {errors.model_name && (
              <p className="text-xs text-rose-400 mt-1">{errors.model_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Model Type *
            </label>
            <select
              {...register("model_type")}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            >
              <option value="Fraud Detection">Fraud Detection</option>
              <option value="Chargeback Prediction">Chargeback Prediction</option>
              <option value="Merchant Risk">Merchant Risk</option>
              <option value="Customer Risk">Customer Risk</option>
              <option value="Device Risk">Device Risk</option>
              <option value="Behaviour Analysis">Behaviour Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Framework *
            </label>
            <select
              {...register("framework")}
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            >
              <option value="XGBoost">XGBoost</option>
              <option value="ONNX">ONNX</option>
              <option value="Joblib">Joblib</option>
              <option value="PyTorch">PyTorch</option>
              <option value="TensorFlow">TensorFlow</option>
              <option value="LightGBM">LightGBM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Algorithm *
            </label>
            <input
              type="text"
              {...register("algorithm")}
              placeholder="e.g. XGBoost Gradient Boosting Tree"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Semantic Version *
            </label>
            <input
              type="text"
              {...register("version")}
              placeholder="e.g. v1.0.0"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-graphite-300 mb-1">
              Owner Team / Engineer *
            </label>
            <input
              type="text"
              {...register("owner")}
              placeholder="e.g. Risk ML Engineering"
              className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-copper-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Evaluation Metrics Sub-section */}
        <div className="border-t border-graphite-800 pt-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase text-copper-400 tracking-wider">
            Evaluation & Validation Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1">
                Accuracy (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.001"
                {...register("accuracy", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1">
                Precision (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.001"
                {...register("precision", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1">
                Recall (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.001"
                {...register("recall", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1">
                F1 Score (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.001"
                {...register("f1_score", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1">
                ROC AUC (0.0 - 1.0)
              </label>
              <input
                type="number"
                step="0.001"
                {...register("roc_auc", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-graphite-300 mb-1">
                Inference Latency (ms)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("latency_ms", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-graphite-950 border border-graphite-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-graphite-800">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-copper-500 hover:bg-copper-400 text-graphite-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? "Registering Model..." : "Register Model"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
