# YouTube to MP3 Converter

A modern, beautiful web application that converts YouTube videos to MP3 audio files. Built with vanilla JavaScript and deployed on Vercel.

## Features

- ⚡ **Lightning Fast** - Convert videos in seconds
- 🎵 **High Quality** - Downloads the highest quality audio available
- 🔒 **Secure & Private** - No data is stored on servers
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- 📱 **Responsive** - Works perfectly on all devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Vercel Serverless Functions
- **YouTube Downloader**: @distube/ytdl-core
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd youTube-JS-final
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
npm run deploy
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

## Project Structure

```
youTube-JS-final/
├── api/
│   └── download.js          # Serverless function for YouTube download
├── public/
│   ├── index.html           # Main HTML file
│   ├── style.css            # Styles with modern design
│   └── script.js            # Frontend JavaScript
├── package.json             # Dependencies and scripts
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

## How It Works

1. User enters a YouTube URL in the input field
2. Frontend validates the URL format
3. Request is sent to the `/api/download` serverless function
4. Backend uses `@distube/ytdl-core` to extract audio stream
5. Audio is streamed back to the client as MP3
6. Browser automatically downloads the file

## Environment Variables

No environment variables are required for basic functionality.

## Limitations

- Maximum video length depends on Vercel's serverless function timeout (60 seconds)
- Some videos may be restricted due to YouTube's policies
- Age-restricted or private videos cannot be downloaded

## Troubleshooting

### "Failed to extract player data" error
This usually means YouTube has updated their API. Try updating `@distube/ytdl-core`:
```bash
npm update @distube/ytdl-core
```

### Download not starting
- Check browser console for errors
- Ensure popup blockers are disabled
- Try a different YouTube URL

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
