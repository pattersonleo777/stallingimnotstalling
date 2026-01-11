export interface APIPlugin {
  name: string;
  type: 'image-to-3d' | 'text-to-3d' | 'text-to-image';
  generateModel: (input: string) => Promise<ModelResult>;
  checkStatus?: (jobId: string) => Promise<ModelResult>;
}

export interface ModelResult {
  success: boolean;
  modelUrl?: string;
  imageUrl?: string;
  jobId?: string;
  status?: 'processing' | 'completed' | 'failed';
  error?: string;
}
