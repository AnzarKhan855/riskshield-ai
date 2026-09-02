import { z } from "zod";

export const modelRegisterFormSchema = z.object({
  model_name: z.string().min(2, "Model name must be at least 2 characters").max(100),
  model_type: z.enum([
    "Fraud Detection",
    "Chargeback Prediction",
    "Merchant Risk",
    "Customer Risk",
    "Device Risk",
    "Behaviour Analysis",
  ]),
  business_domain: z.string().default("Fraud & Risk"),
  version: z.string().min(1, "Version is required").default("v1.0.0"),
  framework: z.enum([
    "Joblib",
    "ONNX",
    "TensorFlow",
    "PyTorch",
    "XGBoost",
    "LightGBM",
  ]),
  algorithm: z.string().min(2, "Algorithm description is required"),
  description: z.string().optional(),
  training_dataset_version: z.string().default("ds_v1.0"),
  feature_version: z.string().default("v1.0"),
  input_schema_version: z.string().default("v1.0"),
  output_schema_version: z.string().default("v1.0"),
  accuracy: z.number().min(0).max(1),
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1_score: z.number().min(0).max(1),
  roc_auc: z.number().min(0).max(1),
  latency_ms: z.number().min(0),
  owner: z.string().min(2, "Owner name is required"),
});

export type ModelRegisterFormValues = z.infer<typeof modelRegisterFormSchema>;
