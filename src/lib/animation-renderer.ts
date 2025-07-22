import { StaticAsset, ElementAnimation, CustomElement, Format } from '@/types';

export class AnimationRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement;
  private imageLoaded: boolean = false;
  private startTime: number;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.image = new Image();
    this.startTime = Date.now();
  }

  async loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.image.onload = () => {
        this.imageLoaded = true;
        resolve();
      };
      this.image.onerror = reject;
      this.image.src = url;
    });
  }

  renderFrame(animations: ElementAnimation[], currentTime: number): void {
    if (!this.imageLoaded) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate image position to center it
    const scale = Math.min(
      this.canvas.width / this.image.width,
      this.canvas.height / this.image.height
    );
    const x = (this.canvas.width - this.image.width * scale) / 2;
    const y = (this.canvas.height - this.image.height * scale) / 2;

    // Save base state
    this.ctx.save();

    // Draw base image
    this.ctx.drawImage(
      this.image,
      x, y,
      this.image.width * scale,
      this.image.height * scale
    );

    // Apply animations
    animations.forEach((animation) => {
      if (animation.element.type === 'custom') {
        const element = animation.element as CustomElement;
        const bounds = element.bounds;

        // Convert percentage to pixels
        const elemX = x + (bounds.x / 100) * (this.image.width * scale);
        const elemY = y + (bounds.y / 100) * (this.image.height * scale);
        const elemWidth = (bounds.width / 100) * (this.image.width * scale);
        const elemHeight = (bounds.height / 100) * (this.image.height * scale);

        this.ctx.save();

        // Clip to element bounds
        if (element.shape === 'ellipse') {
          this.ctx.beginPath();
          this.ctx.ellipse(
            elemX + elemWidth / 2,
            elemY + elemHeight / 2,
            elemWidth / 2,
            elemHeight / 2,
            0, 0, Math.PI * 2
          );
          this.ctx.clip();
        } else {
          this.ctx.beginPath();
          this.ctx.rect(elemX, elemY, elemWidth, elemHeight);
          this.ctx.clip();
        }

        // Apply animation effect
        this.applyAnimation(
          animation,
          elemX, elemY, elemWidth, elemHeight,
          currentTime
        );

        this.ctx.restore();
      }
    });

    this.ctx.restore();
  }

  private applyAnimation(
    animation: ElementAnimation,
    x: number, y: number, width: number, height: number,
    time: number
  ): void {
    const { intensity, speed } = animation.parameters;
    const animTime = time * speed * 0.001;

    switch (animation.type) {
      case 'ripple':
        this.applyRippleEffect(x, y, width, height, animTime, intensity);
        break;
      
      case 'float':
        const floatOffset = Math.sin(animTime) * (intensity / 10);
        this.ctx.translate(0, floatOffset);
        // Redraw the element with offset
        this.ctx.drawImage(
          this.image,
          (x - (this.canvas.width - this.image.width * this.getImageScale()) / 2) / this.getImageScale(),
          (y - (this.canvas.height - this.image.height * this.getImageScale()) / 2 - floatOffset) / this.getImageScale(),
          width / this.getImageScale(),
          height / this.getImageScale(),
          x, y, width, height
        );
        break;

      case 'sway':
        const swayAngle = Math.sin(animTime) * (intensity / 100) * 0.1;
        this.ctx.translate(x + width / 2, y + height);
        this.ctx.rotate(swayAngle);
        this.ctx.translate(-(x + width / 2), -(y + height));
        // Redraw the element with rotation
        this.ctx.drawImage(
          this.image,
          (x - (this.canvas.width - this.image.width * this.getImageScale()) / 2) / this.getImageScale(),
          (y - (this.canvas.height - this.image.height * this.getImageScale()) / 2) / this.getImageScale(),
          width / this.getImageScale(),
          height / this.getImageScale(),
          x, y, width, height
        );
        break;

      case 'shimmer':
        const shimmerAlpha = 0.3 + Math.sin(animTime * 2) * 0.3 * (intensity / 100);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${shimmerAlpha})`;
        this.ctx.fillRect(x, y, width, height);
        break;

      case 'glow':
        const glowIntensity = 0.5 + Math.sin(animTime) * 0.5;
        this.ctx.shadowColor = animation.parameters.color || '#ffffff';
        this.ctx.shadowBlur = 20 * glowIntensity * (intensity / 100);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(x, y, width, height);
        break;

      case 'particle':
        this.drawParticles(x, y, width, height, animTime, intensity);
        break;
    }
  }

  private getImageScale(): number {
    return Math.min(
      this.canvas.width / this.image.width,
      this.canvas.height / this.image.height
    );
  }

  private applyRippleEffect(
    x: number, y: number, width: number, height: number,
    time: number, intensity: number
  ): void {
    // Create ripple distortion effect
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const maxRadius = Math.max(width, height) / 2;
    
    // Draw concentric circles with decreasing opacity
    for (let i = 0; i < 3; i++) {
      const phase = time - i * 0.3;
      const radius = (phase % 2) * maxRadius;
      const opacity = Math.max(0, 1 - radius / maxRadius) * (intensity / 100) * 0.3;
      
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  private drawParticles(
    x: number, y: number, width: number, height: number,
    time: number, intensity: number
  ): void {
    const particleCount = Math.floor(intensity / 10);
    
    for (let i = 0; i < particleCount; i++) {
      const particleX = x + Math.sin(time + i * 0.5) * width / 2 + width / 2;
      const particleY = y + ((time * 50 + i * height / particleCount) % height);
      const size = 2 + Math.sin(time + i) * 2;
      const opacity = 0.5 + Math.sin(time + i * 0.3) * 0.5;
      
      this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  async exportFrame(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to export frame'));
      }, 'image/png');
    });
  }

  async exportVideo(
    animations: ElementAnimation[],
    duration: number,
    fps: number = 30,
    format: Format
  ): Promise<Blob> {
    // For now, we'll export as a GIF or use a series of frames
    // In a real implementation, we'd use WebCodecs API or ffmpeg.wasm
    
    const frames: Blob[] = [];
    const totalFrames = Math.floor(duration * fps);
    
    for (let i = 0; i < totalFrames; i++) {
      const time = (i / fps) * 1000; // Convert to milliseconds
      this.renderFrame(animations, time);
      const frameBlob = await this.exportFrame();
      frames.push(frameBlob);
    }
    
    // For demo purposes, return the last frame as a static image
    // In production, you'd combine frames into a video
    return frames[frames.length - 1];
  }
}

export async function renderAnimatedImage(
  asset: StaticAsset,
  animations: ElementAnimation[],
  format: Format,
  duration: number = 5
): Promise<Blob> {
  const renderer = new AnimationRenderer(format.width, format.height);
  await renderer.loadImage(asset.originalFile.url);
  
  // For now, export as video (or fallback to animated frames)
  return renderer.exportVideo(animations, duration, 30, format);
}