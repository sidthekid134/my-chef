# SousChef

A mobile app for managing cooking recipes built with Expo, React Native, and TypeScript.

## Features

- Store and manage your favorite recipes
- Search and filter recipes
- Import recipes from URLs
- Create shopping lists based on recipes

## Tech Stack

- Expo
- React Native
- TypeScript
- React Navigation
- SQLite for local database

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository

```
git clone https://github.com/sidthekid134/my-chef.git
cd SousChef
```

2. Install dependencies

```
npm install
# or
yarn install
```

3. Start the development server

```
npm start
# or
yarn start
```

4. Run on iOS or Android

```
npm run ios
# or
npm run android
```

## Project Structure

```
SousChef/
├── assets/              # Images, fonts, and other static assets
├── src/
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # Screen components
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and constants
├── App.tsx              # Root component
├── app.json             # Expo configuration
└── tsconfig.json        # TypeScript configuration
```

## Development

```
npm run lint          # Run ESLint
npm run format        # Run Prettier
```

## License

This project is licensed under the MIT License.