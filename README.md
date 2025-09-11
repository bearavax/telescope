# Telescope Platform

A Web3 platform for discovering and voting on Avalanche projects, featuring NFT galleries, KOL token tracking, and community-driven project curation.

## 🌟 Features

### Core Functionality
- **Project Discovery**: Browse and vote on Avalanche ecosystem projects
- **NFT Gallery**: Explore NFT collections with advanced filtering and search
- **KOL Tracking**: Monitor Key Opinion Leader tokens and their market performance
- **User Profiles**: Track XP, voting history, and wallet class badges
- **Seasonal Voting**: Multi-season project voting system with different categories

### Technical Features
- **Web3 Integration**: Wallet connection via RainbowKit and Wagmi
- **Real-time Data**: Live price monitoring and market data updates
- **Discord Integration**: User authentication and reward distribution
- **Admin Panel**: Project management and voting controls
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: TanStack Query for server state
- **Web3**: RainbowKit + Wagmi for wallet integration
- **UI Components**: Radix UI primitives with custom styling

### Backend
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with Discord provider
- **API Routes**: Next.js API routes for data fetching
- **External APIs**: DexScreener, CoinGecko, YourWorth integration

### Data Models
- **Users**: Wallet addresses, XP, voting history, Discord integration
- **Projects**: Project metadata, social links, voting statistics
- **KOLs**: Token data, market caps, price tracking
- **Votes**: User voting history and streak tracking
- **Art Submissions**: Community art submissions and voting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Discord Developer Application
- WalletConnect Project ID

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd telescope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
   DISCORD_CLIENT_ID="your_discord_client_id"
   DISCORD_CLIENT_SECRET="your_discord_client_secret"
   DISCORD_BOT_TOKEN="your_discord_bot_token"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_wc_project_id"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
telescope/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── kol/           # KOL token management
│   │   │   ├── monitoring/    # Price monitoring
│   │   │   ├── nft-collections/ # NFT collection APIs
│   │   │   ├── projects/      # Project management
│   │   │   └── users/         # User data endpoints
│   │   ├── admin/             # Admin dashboard
│   │   ├── artists/           # Artists page
│   │   ├── gallery/           # NFT gallery
│   │   ├── kol/               # KOL tokens page
│   │   ├── news/              # News feed
│   │   ├── profile/           # User profiles
│   │   └── projects/          # Projects page
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── admin/             # Admin-specific components
│   │   └── *.tsx              # Feature components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── services/              # External service integrations
│   └── types/                 # TypeScript type definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
│   ├── avatars/              # User avatars
│   ├── puppets/              # NFT images and metadata
│   └── stickers/             # UI stickers
└── package.json
```

## 🔧 Key Components

### Pages
- **Home**: Project showcase, news feed, and featured content
- **Gallery**: NFT collection browser with filtering
- **Artists**: Community artist showcase
- **Projects**: Project voting and discovery
- **KOL**: Key Opinion Leader token tracking
- **Profile**: User profile with voting history and stats

### API Endpoints
- **Authentication**: Discord OAuth integration
- **Projects**: CRUD operations for project management
- **KOLs**: Token data fetching and price monitoring
- **NFTs**: Collection data and search functionality
- **Users**: Profile data and voting statistics

### Services
- **Price Monitor**: Real-time token price updates
- **YourWorth Scraper**: KOL data extraction
- **Blockchain Monitor**: On-chain data tracking

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Custom palette with dark/light mode support
- **Typography**: Geist font family for modern readability
- **Components**: Consistent design language across all pages
- **Responsive**: Mobile-first design with tablet/desktop optimization

### User Experience
- **Wallet Integration**: Seamless Web3 wallet connection
- **Real-time Updates**: Live data without page refreshes
- **Intuitive Navigation**: Clear information architecture
- **Performance**: Optimized loading and caching strategies

## 🔐 Security

### Authentication
- **Discord OAuth**: Secure user authentication
- **Wallet Verification**: Message signing for wallet ownership
- **Admin Controls**: Role-based access control

### Data Protection
- **Environment Variables**: Sensitive data in environment files
- **API Security**: Rate limiting and input validation
- **Database Security**: MongoDB Atlas with proper access controls

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`
3. Configure your web server to serve the application

## 📊 Monitoring

### Price Monitoring
- **Real-time Updates**: Token prices updated every 2 minutes
- **Multiple Sources**: DexScreener, CoinGecko, and Moralis APIs
- **Error Handling**: Graceful fallbacks for API failures

### User Analytics
- **Voting Patterns**: Track user engagement and preferences
- **Performance Metrics**: Monitor application performance
- **Error Tracking**: Comprehensive error logging and monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Component Structure**: Consistent component organization

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Avalanche Community**: For the vibrant ecosystem
- **Open Source Libraries**: All the amazing tools that make this possible
- **Contributors**: Everyone who helps improve the platform

## 📞 Support

For support, questions, or feature requests:
- **Discord**: Join our community server
- **GitHub Issues**: Report bugs or request features
- **Email**: Contact the development team

---

Built with ❤️ by the Isbjorn team