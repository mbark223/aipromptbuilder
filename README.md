# AI Prompt Builder for Video Generation

A Next.js application for creating, managing, and optimizing prompts for AI video generation platforms like Veo and Flows, with integrated Replicate API support for video generation.

## Features

### Core Functionality
- **Format Management**: Support for multiple aspect ratios (1:1, 9:16, 16:9, 4:5) with custom dimensions
- **Structured Prompt Builder**: Organized sections for subject, style, composition, lighting, motion, and technical specs
- **Consistency Engine**: Maintain visual coherence with seed IDs, locked parameters, and color palettes
- **Project Organization**: Group prompts by projects for better management
- **Export Options**: Export to JSON, CSV, or TXT formats for different platforms

### Static-to-Motion Converter
- **Replicate API Integration**: Generate videos using state-of-the-art models
- **Multiple Model Support**:
  - Google Veo-3-Fast (Text-to-Video with native audio)
  - Google Veo-3 (Premium quality with native audio)
  - ByteDance Seedance-1-Pro (Image-to-Video support, $0.40/second)
  - MiniMax Hailuo-02 (Excellent physics simulation)
- **Dynamic Input Fields**: Model-specific parameters automatically adjust
- **Batch Processing**: Queue multiple videos for generation
- **Real-time Progress**: Track generation status and download results

### User Interface
- Clean, modern design with shadcn/ui components
- Responsive layout that works on desktop and mobile
- Real-time preview of format dimensions
- Dark mode support (CSS variables ready)

## Tech Stack

- **Framework**: Next.js 15.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand with persistence
- **Development**: Turbopack for fast refresh

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mbark223/aipromptbuilder.git
cd aipromptbuilder
```

2. Install dependencies:
```bash
npm install
```

3. Configure Replicate API (for video generation):
```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local and add your Replicate API token
# Get your token from: https://replicate.com/account/api-tokens
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Prompt
1. Select a format from the preset options or create a custom size
2. Fill in the structured sections with your prompt details
3. Configure consistency settings if creating multiple related prompts
4. Save your prompt to a project

### Managing Projects
- Create projects to organize related prompts
- View all prompts within a project
- Filter and search through your prompt library

### Exporting Prompts
1. Navigate to the Export page
2. Select the prompts you want to export
3. Choose your platform and format
4. Download the exported file

### Using Static-to-Motion Converter
1. Navigate to the Static-to-Motion page
2. Upload your static images
3. Select an AI model:
   - **Veo-3-Fast**: Fastest option with native audio
   - **Veo-3**: Premium quality with audio
   - **Seedance-1-Pro**: Supports image-to-video conversion
   - **Hailuo-02**: Best for realistic physics
4. Configure model-specific parameters
5. Choose animation style and output formats
6. Start processing and monitor the queue
7. Download generated videos when complete

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── api/         # API routes (Replicate integration)
│   └── static-to-motion/ # Video generation page
├── components/       # React components
│   ├── consistency/  # Consistency engine components
│   ├── format/       # Format selection components
│   ├── layout/       # Layout components
│   ├── prompt/       # Prompt builder components
│   ├── static-to-motion/ # Video generation components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── store/           # Zustand store
├── types/           # TypeScript type definitions
└── lib/             # Utility functions
    └── replicate.ts # Replicate API service
```

## Development

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features
1. Types are defined in `src/types/index.ts`
2. State management is handled in `src/store/promptStore.ts`
3. Components follow a modular structure in `src/components/`

## Roadmap

### Planned Features
- [ ] AI-powered prompt suggestions
- [ ] Visual similarity scoring
- [ ] Batch creation with variations
- [ ] Template marketplace
- [ ] Team collaboration features
- [ ] API integrations with Veo and Flows
- [ ] Advanced analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
