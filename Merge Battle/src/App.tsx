import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SplashScreen } from "./components/screens/SplashScreen";
import { Onboarding } from "./components/screens/Onboarding";
import { MainMenu } from "./components/screens/MainMenu";
import { GameScreen } from "./components/screens/GameScreen";
import { PvPLobby } from "./components/screens/PvPLobby";
import { Leaderboard } from "./components/screens/Leaderboard";
import { Shop } from "./components/screens/Shop";
import { Settings } from "./components/screens/Settings";
import { Profile } from "./components/screens/Profile";
import { Challenges } from "./components/screens/Challenges";
import { Statistics } from "./components/screens/Statistics";
import { DailyRewardModal } from "./components/DailyRewardModal";
import { AchievementToast } from "./components/AchievementToast";
import { TutorialOverlay } from "./components/TutorialOverlay";
import { GridSizeSelector } from "./components/GridSizeSelector";
import { availableTileBlocks, availableBackgrounds } from "./components/tileBlockData";
import "./styles/globals.css";

type Screen =
  | "splash"
  | "onboarding"
  | "menu"
  | "game"
  | "pvp"
  | "leaderboard"
  | "shop"
  | "settings"
  | "profile"
  | "challenges"
  | "statistics";

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<Screen>("splash");
  const [coins, setCoins] = useState(1500);
  const [transitionDirection, setTransitionDirection] =
    useState<"left" | "right">("left");
  const [activeTheme, setActiveTheme] = useState("neon-cyber");
  const [ownedThemes, setOwnedThemes] = useState<string[]>(["neon-cyber"]);
  const [ownedTileBlocks, setOwnedTileBlocks] = useState<string[]>(["neon-classic"]);
  const [activeTileBlock, setActiveTileBlock] = useState("neon-classic");
  const [ownedBackgrounds, setOwnedBackgrounds] = useState<string[]>(["default-dark"]);
  const [activeBackground, setActiveBackground] = useState("default-dark");
  const [selectedGridSize, setSelectedGridSize] = useState<4 | 5 | 6 | 7 | 8 | 9 | 10>(4);
  const [showGridSizeSelector, setShowGridSizeSelector] = useState(false);
  const [pendingScreen, setPendingScreen] = useState<"game" | "pvp" | null>(null);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [dailyRewardDay, setDailyRewardDay] = useState(1);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [achievementToast, setAchievementToast] = useState<{
    icon: string;
    name: string;
    description: string;
  } | null>(null);

  // Check if user has seen onboarding
  useEffect(() => {
    const seen = localStorage.getItem("hasSeenOnboarding");
    setHasSeenOnboarding(seen === "true");
  }, []);

  // Show daily reward after a delay on menu screen
  useEffect(() => {
    if (currentScreen === "menu" && hasSeenOnboarding) {
      const timer = setTimeout(() => {
        const lastClaim = localStorage.getItem("lastDailyReward");
        const today = new Date().toDateString();
        
        if (lastClaim !== today) {
          setShowDailyReward(true);
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentScreen, hasSeenOnboarding]);

  const handleDailyRewardClaim = (rewardCoins: number) => {
    setCoins(coins + rewardCoins);
    localStorage.setItem("lastDailyReward", new Date().toDateString());
    
    // Show achievement toast
    setAchievementToast({
      icon: "💰",
      name: "Daily Reward Claimed!",
      description: `You earned ${rewardCoins} coins`,
    });
    
    setTimeout(() => setAchievementToast(null), 4000);
    
    // Increment day (loop back to 1 after 7)
    setDailyRewardDay((prev) => (prev >= 7 ? 1 : prev + 1));
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setHasSeenOnboarding(true);
    setCurrentScreen("menu");
  };

  const handleNavigate = (screen: Screen) => {
    // Determine transition direction
    const screenOrder: Screen[] = [
      "menu",
      "game",
      "pvp",
      "leaderboard",
      "shop",
      "settings",
      "profile",
      "challenges",
      "statistics",
    ];
    const currentIndex = screenOrder.indexOf(currentScreen);
    const nextIndex = screenOrder.indexOf(screen);

    if (currentIndex !== -1 && nextIndex !== -1) {
      setTransitionDirection(
        nextIndex > currentIndex ? "left" : "right",
      );
    }

    setCurrentScreen(screen);
  };

  const variants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "left" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0B0F19] to-[#1A1A1A]">
      <AnimatePresence mode="wait" custom={transitionDirection}>
        <motion.div
          key={currentScreen}
          custom={transitionDirection}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {currentScreen === "splash" && (
            <SplashScreen
              onComplete={() => 
                setCurrentScreen(hasSeenOnboarding ? "menu" : "onboarding")
              }
            />
          )}

          {currentScreen === "onboarding" && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}

          {currentScreen === "menu" && (
            <MainMenu
              onNavigate={(screen) => {
                if (screen === "game" || screen === "pvp") {
                  setPendingScreen(screen);
                  setShowGridSizeSelector(true);
                } else {
                  handleNavigate(screen as Screen);
                }
              }}
              coins={coins}
              onDailyRewardClick={() => setShowDailyReward(true)}
              onTutorialClick={() => setShowTutorial(true)}
            />
          )}

          {currentScreen === "game" && (
            <GameScreen
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
              gridSize={selectedGridSize}
              targetTile={2048}
              timedMode={false}
              tileBlock={availableTileBlocks.find(b => b.id === activeTileBlock)}
              background={availableBackgrounds.find(b => b.id === activeBackground)}
            />
          )}

          {currentScreen === "pvp" && (
            <PvPLobby
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
              gridSize={selectedGridSize}
            />
          )}

          {currentScreen === "leaderboard" && (
            <Leaderboard
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
            />
          )}

          {currentScreen === "shop" && (
            <Shop
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
              coins={coins}
              onCoinsChange={setCoins}
              ownedThemes={ownedThemes}
              onThemePurchase={(themeId) => {
                if (!ownedThemes.includes(themeId)) {
                  setOwnedThemes([...ownedThemes, themeId]);
                }
              }}
              ownedTileBlocks={ownedTileBlocks}
              onTileBlockPurchase={(blockId) => {
                if (!ownedTileBlocks.includes(blockId)) {
                  setOwnedTileBlocks([...ownedTileBlocks, blockId]);
                  setActiveTileBlock(blockId);
                }
              }}
              ownedBackgrounds={ownedBackgrounds}
              onBackgroundPurchase={(backgroundId) => {
                if (!ownedBackgrounds.includes(backgroundId)) {
                  setOwnedBackgrounds([...ownedBackgrounds, backgroundId]);
                  setActiveBackground(backgroundId);
                }
              }}
            />
          )}

          {currentScreen === "settings" && (
            <Settings
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
            />
          )}

          {currentScreen === "profile" && (
            <Profile
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
              activeTheme={activeTheme}
              onThemeChange={setActiveTheme}
              ownedThemes={ownedThemes}
              activeTileBlock={activeTileBlock}
              onTileBlockChange={setActiveTileBlock}
              ownedTileBlocks={ownedTileBlocks}
              activeBackground={activeBackground}
              onBackgroundChange={setActiveBackground}
              ownedBackgrounds={ownedBackgrounds}
            />
          )}

          {currentScreen === "challenges" && (
            <Challenges
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
              coins={coins}
              onCoinsChange={setCoins}
            />
          )}

          {currentScreen === "statistics" && (
            <Statistics
              onNavigate={(screen) =>
                handleNavigate(screen as Screen)
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Daily Reward Modal */}
      <DailyRewardModal
        isOpen={showDailyReward}
        onClose={() => setShowDailyReward(false)}
        onClaim={handleDailyRewardClaim}
        currentDay={dailyRewardDay}
      />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={achievementToast}
        onClose={() => setAchievementToast(null)}
      />

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={() => {
          localStorage.setItem("hasCompletedTutorial", "true");
          setShowTutorial(false);
        }}
      />

      {/* Grid Size Selector */}
      <GridSizeSelector
        isOpen={showGridSizeSelector}
        onClose={() => {
          setShowGridSizeSelector(false);
          setPendingScreen(null);
        }}
        onSelect={(size) => {
          setSelectedGridSize(size);
          setShowGridSizeSelector(false);
          if (pendingScreen) {
            handleNavigate(pendingScreen);
            setPendingScreen(null);
          }
        }}
      />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating orbs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#00FFFF] blur-[100px]"
        />

        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#A100FF] blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-[#FF00FF] blur-[150px]"
        />
      </div>
    </div>
  );
}