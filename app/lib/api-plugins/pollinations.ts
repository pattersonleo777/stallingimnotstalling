import axios from 'axios';
import { APIPlugin, ModelResult } from './types';

export class PollinationsPlugin implements APIPlugin {
  name = 'Pollinations';
  type: 'text-to-image' = 'text-to-image';

  async generateModel(prompt: string): Promise<ModelResult> {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      
      // Verify the image is accessible
      await axios.head(imageUrl);
      
      return {
        success: true,
        imageUrl: imageUrl,
        status: 'completed',
      };
    } catch (error: any) {
      console.error('Pollinations API error:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed',
      };
    }
  }
}
