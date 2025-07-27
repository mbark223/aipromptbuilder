# Social Media Ad Testing Tool

A comprehensive tool for testing and validating social media advertisements across multiple platforms with full video support.

**🚀 Live Demo**: Coming soon!

![Social Media Ad Litmus](https://img.shields.io/badge/Status-Complete-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-blue)

## ✨ Features

### 🎯 **Platform Support**
- **📷 Instagram** - Feed (Square/Portrait), Stories, Reels (Video)
- **📘 Facebook** - Feed Posts, Stories, Cover Photos, Reels (Video)
- **🐦 Twitter/X** - Post Images, Header Images
- **🎵 TikTok** - Video Format with Safety Zones
- **👻 Snapchat** - Snap Ad Format, Stories (Video/Image)
- **🎯 Google UAC** - Small Banner, Medium Rectangle, Leaderboard, Square Image, Landscape Image, Portrait Image
- **📺 YouTube** - Thumbnails, Shorts (Video)

### 🛠 **Core Functionality**
- **Drag & Drop File Upload** - Full support for images (JPG, PNG, GIF) and videos (MP4, MOV)
- **Real-time Preview** - See your ad exactly as it appears on each platform with video playback
- **Video Controls** - Play/pause videos in preview with duration display and thumbnail generation
- **Safety Zone Validation** - Visual indicators for platform-specific safe areas
- **Text Overlay Editor** - Add, edit, and position text overlays with full customization
- **Multi-format Export** - Download videos (MP4, MOV), images (PNG, JPEG), PDF, or ZIP packages with all formats
- **Platform Validation** - Real-time feedback on file size, format, duration, and content requirements

### 🎨 **Advanced Features**
- **Interactive Text Editing** - Click-to-edit text overlays with live positioning
- **Platform-specific Recommendations** - AI-powered suggestions for optimal performance
- **Aspect Ratio Management** - Automatic scaling and cropping suggestions
- **Brand Safety Checks** - Content validation against platform guidelines
- **Video Export Options** - Export original videos OR generate thumbnail images from any video frame
- **Cross-Format Compatibility** - Upload video for Reels, export as images for other formats
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🤖 **AI Video Generation (NEW!)**
- **Image-to-Video Conversion** - Transform static ads into engaging video content
- **Multiple AI Models** - Choose from 11+ state-of-the-art models including:
  - **ByteDance Seedance** - Pro and Lite versions for high-quality video generation
  - **Stable Video Diffusion** - Industry-standard image animation
  - **WaveSpeed Wan 2.1** - Fast 480p and 720p video generation
  - **Hailuo & Kling** - Premium models with excellent physics simulation
  - **Research Models** - I2VGen-XL, PIA, and more experimental options
- **Customizable Parameters** - Control duration, resolution, motion intensity, and more
- **Motion Prompts** - Guide the AI with text descriptions of desired animations
- **Direct Export** - Download generated videos in MP4 format

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/social-media-ad-litmus.git
   cd social-media-ad-litmus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   - **Replicate API Token** (for AI video generation): Get from [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
   - **Google OAuth** (optional): For user authentication
   - **Database URL**: Default SQLite configuration works out of the box

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production
```bash
npm run build
npm run start
```

## 📖 How to Use

### 1. **Select Platform & Format**
- Choose from Social Media, Professional, or Video platform categories
- Select the specific format (e.g., Instagram Feed Square, Facebook Story)
- View platform-specific requirements and dimensions

### 2. **Upload Your Creative**
- Drag and drop your image or video file
- Supports JPG, PNG, GIF, MP4, MOV formats
- Automatic file size and format validation

### 3. **Add Text Overlays**
- Click anywhere on the preview to add text
- Double-click text to edit content
- Customize font size, color, background, and weight
- Drag text to reposition

### 4. **Validate Your Ad**
- Real-time validation against platform requirements
- Safety zone warnings for text positioning
- File size and format compliance checks
- Platform-specific recommendations

### 5. **Export Your Ad**
- Choose from PNG, JPEG, PDF, or ZIP package
- High-resolution exports at platform-native dimensions
- Batch export for multiple formats

### 6. **Generate AI Videos** 🤖
- Upload a static image ad
- Select from 11+ AI models based on your needs:
  - **Quick Generation**: Wan 2.1 (480p/720p) for fast results
  - **High Quality**: Seedance Pro, Kling v2.1 for premium output
  - **Specialized**: Video-01-Live for animations, LTX-Video for real-time
- Customize video parameters:
  - Duration (5s, 10s, or custom)
  - Resolution (480p, 720p, 1080p)
  - Motion intensity and style
- Add motion prompts to guide the animation
- Download generated videos directly

## 🔧 Technical Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Export**: jsPDF, JSZip for file generation
- **Animations**: Framer Motion
- **AI Video Generation**: Replicate API
- **File Storage**: Vercel Blob Storage
- **Authentication**: NextAuth.js (optional)
- **Database**: Prisma with SQLite

## 📁 Project Structure

```
social-media-ad-litmus/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── file-upload.tsx
│   │   ├── tabs.tsx
│   │   └── switch.tsx
│   ├── ad-preview.tsx    # Main preview component
│   ├── export-panel.tsx  # Export functionality
│   ├── platform-selector.tsx
│   └── validation-panel.tsx
├── lib/                  # Utility libraries
│   ├── platform-configs.ts  # Platform definitions
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
│   └── platforms.ts
└── public/              # Static assets
```

## 🎨 Platform Specifications

### Instagram
- **Feed Square**: 1080×1080 (1:1) - Max 30MB (Image/Video)
- **Feed Portrait**: 1080×1350 (4:5) - Max 30MB (Image/Video)
- **Stories**: 1080×1920 (9:16) - Max 30MB (Image/Video)
- **Reels**: 1080×1920 (9:16) - Max 150MB (Video: MP4, MOV)

### Facebook
- **Feed**: 1080×1080 (1:1) - Max 30MB (Image/Video)
- **Stories**: 1080×1920 (9:16) - Max 30MB (Image/Video)
- **Reels**: 1080×1920 (9:16) - Max 150MB (Video: MP4, MOV)
- **Cover Photo**: 1200×315 (3.8:1) - Max 10MB (Image only)



### Twitter/X
- **Post Image**: 1200×675 (16:9) - Max 5MB
- **Header**: 1500×500 (3:1) - Max 5MB

### TikTok
- **Video**: 1080×1920 (9:16) - Max 150MB

### Snapchat
- **Story**: 1080×1920 (9:16) - Max 150MB (Image/Video)
- **Snap Ad**: 1080×1920 (9:16) - Max 150MB (Image/Video)

### Google UAC
- **Small Banner**: 320×50 (6.4:1) - Max 5MB
- **Medium Rectangle**: 300×250 (1.2:1) - Max 10MB
- **Leaderboard**: 728×90 (8.09:1) - Max 10MB
- **Square Image**: 1200×1200 (1:1) - Max 20MB
- **Landscape Image**: 1200×628 (1.91:1) - Max 20MB
- **Portrait Image**: 480×320 (1.5:1) - Max 10MB

### YouTube
- **Thumbnail**: 1280×720 (16:9) - Max 2MB
- **Shorts**: 1080×1920 (9:16) - Max 150MB

## 🔄 API & Integrations

The tool includes built-in validation for:
- File size limits per platform
- Supported file formats
- Aspect ratio requirements
- Safety zone compliance
- Text length recommendations

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Ensure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`

**File Upload Issues**
- Check file size limits (varies by platform)
- Verify file format is supported
- Ensure stable internet connection

**Export Problems**
- Allow pop-ups in your browser
- Check browser download permissions
- Verify sufficient disk space

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Platform specifications sourced from official documentation
- UI components built with Radix UI
- Icons by Lucide
- Built with ❤️ for marketers and creators

## 📞 Support

For support, please open an issue on GitHub or contact [your-email@domain.com](mailto:your-email@domain.com).

---
*Deployment ready* ✅

**Built with Next.js, TypeScript, and Tailwind CSS** 🚀 