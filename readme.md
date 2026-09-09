# 📚 Readers

> A modern social reading platform for discovering, reading, tracking, and discussing books in one place.

**Readers** is a full-stack web application that combines a digital book library with reading progress, communities, discussion channels, comments, competitions, profiles, multilingual books, and premium content.

## ✨ Features

### 📖 Digital Library
- Browse and discover books
- Book covers, authors, descriptions, and chapters
- EPUB reading support
- Language-based categorization
- Free and premium books
- Book search and discovery

### 📚 Reading Experience
- Read books directly in the browser
- EPUB rendering with `epub.js`
- Track reading activity
- Track time spent reading
- Track pages read
- Continue reading from previous activity

### 👤 User Accounts
- Signup and login
- Supabase authentication
- User profiles
- Username and avatar
- Profile bio and banner customization
- Region information
- User roles
- Premium status

### 💬 Communities
Readers includes a social community system where users can:
- Create communities
- Join communities
- Create discussion channels
- Send messages
- Discuss books and reading
- View community members
- Organize communities by region and genre

### 💭 Book Comments
- Add comments to books
- View community discussions
- Delete your own comments
- Timestamped comments

### 🏆 Reading Competitions
Competition entries track:
- User
- Region
- Month
- Selected books
- Total reading time

### 💎 Premium Content
The application supports premium books and premium user status. Razorpay is included for payment functionality.

### 🔐 Security
Supabase Row Level Security (RLS) is used for database protection. Policies cover users, books, communities, channels, messages, reading logs, community membership, comments, and competition entries.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Full-stack React framework |
| **React 19** | UI development |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Styling |
| **Supabase** | Authentication and backend services |
| **PostgreSQL** | Relational database |
| **epub.js** | EPUB book rendering |
| **Zustand** | State management |
| **Lucide React** | Icons |
| **Razorpay** | Payment processing |
| **ESLint** | Code quality |

The repository currently contains a Next.js application under `docs/my-app`, with authentication routes, dashboard routes, API routes, components, state management, utilities, and Supabase migrations.

---

## 🏗️ Architecture

```text
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   NEXT.JS / REACT   │
                       │     FRONTEND        │
                       └──────────┬──────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              Authentication   Books        Social
               (Supabase)     & Reader     Features
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
                       ┌─────────────────────┐
                       │      SUPABASE       │
                       │ PostgreSQL + Auth   │
                       └─────────────────────┘
```

---

## 🗄️ Database

The current database design includes:

```text
users
books
communities
channels
messages
reading_logs
competition_entries
community_members
comments
```

### Core relationships

```text
USER ─────────────── READING_LOG ─────────────── BOOK
 │
 ├────────────────── COMPETITION_ENTRY
 │
 ├────────────────── COMMENT ────────────────── BOOK
 │
 └────────────────── COMMUNITY_MEMBER ───────── COMMUNITY
                                                    │
                                                    ▼
                                                 CHANNEL
                                                    │
                                                    ▼
                                                 MESSAGE
```

The Supabase migrations also contain profile fields, book language support, community membership, comments, security hardening, and Row Level Security policies.

---

## 📂 Project Structure

```text
Readers/
└── docs/
    └── my-app/
        ├── public/
        ├── src/
        │   ├── app/
        │   │   ├── (dashboard)/
        │   │   ├── api/
        │   │   ├── auth/
        │   │   ├── forgot-password/
        │   │   ├── login/
        │   │   ├── reset-password/
        │   │   └── signup/
        │   ├── components/
        │   │   ├── profile/
        │   │   ├── social/
        │   │   └── ui/
        │   ├── store/
        │   ├── types/
        │   ├── utils/
        │   └── middleware.ts
        ├── supabase/
        │   └── migrations/
        ├── package.json
        ├── next.config.ts
        ├── tsconfig.json
        └── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/danishk15/Readers.git
cd Readers
```

### 2. Enter the application

```bash
cd docs/my-app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create `.env.local` inside `docs/my-app`.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> Never commit real API keys, passwords, service-role keys, or payment secrets.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 📦 Available Scripts

```bash
npm run dev
```
Starts the development server.

```bash
npm run build
```
Creates a production build.

```bash
npm start
```
Starts the production server.

```bash
npm run lint
```
Runs ESLint.

---

## 🔐 Authentication Flow

```text
Signup / Login
      ↓
Supabase Authentication
      ↓
Authenticated Session
      ↓
User Profile
      ↓
Dashboard
```

The application includes login, signup, forgot-password, reset-password, and authentication callback routes.

---

## 📖 Reading Flow

```text
Select Book
    ↓
Open Reader
    ↓
epub.js renders EPUB
    ↓
User Reads
    ↓
Reading Activity
    ↓
Reading Logs
    ↓
Progress / Statistics
```

Reading logs record the user, book, time spent, pages read, and timestamp.

---

## 💬 Community Flow

```text
User
 ↓
Create / Join Community
 ↓
Community
 ↓
Channels
 ↓
Messages
 ↓
Discussion
```

A `community_members` join table allows users to belong to multiple communities.

---

## 🏆 Competition Flow

```text
User
 ↓
Select Competition
 ↓
Select Books
 ↓
Read
 ↓
Reading Time Tracked
 ↓
Competition Entry
```

Competition entries are associated with a user and month and store selected books and total reading time.

---

## 💳 Premium System

```text
Free User
    │
    ▼
Premium Book
    │
    ▼
Upgrade / Payment
    │
    ▼
Razorpay
    │
    ▼
Premium Status
```

The database includes `premium_status` for users and `is_premium` for books.

---

## 🔒 Security

Readers uses Supabase Row Level Security to control access to application data.

Examples include:
- Users can update their own profiles.
- Users can access their own reading logs.
- Authenticated users can post messages.
- Users can join and leave communities.
- Users can delete their own comments.
- Competition entries are protected for their associated users.

---

## 🌍 Book Languages

Books include a `language` field, allowing the catalogue to support multiple languages and language-based discovery.

Book records can include:
- Title
- Author
- Cover
- File URL
- Description
- Language
- Premium status
- Chapters

---

## 🔮 Future Scope

- 📱 Mobile application
- 🎧 Audiobook support
- 🎤 Voice-based search
- 🤖 AI-powered recommendations
- 🌍 Expanded multilingual support
- 📊 Advanced reading analytics
- 🏆 Regional and global leaderboards
- 🔔 Notifications
- 📚 Personalized reading plans
- 🔖 Advanced bookmarks and annotations
- ☁️ Cross-device synchronization
- 👥 Advanced community moderation
- 💬 Real-time social features

---

## 👨‍💻 Author

**Danish Khan**

GitHub: https://github.com/danishk15

Repository: https://github.com/danishk15/Readers

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the application
5. Commit your changes
6. Push your branch
7. Open a Pull Request

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## 📄 License

License information should be added once the project's license is finalized.

<p align="center">
  Built with ❤️ for readers and book communities.
</p>
