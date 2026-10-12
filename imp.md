# Dashboard Implementation Guide

## Quick Setup

Copy the code from the files below into your project:

### 1. Main Dashboard Component

**File:** `src/components/Dashboard.tsx` (or wherever you want)

```tsx
import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface CareerLevel {
  id: string;
  title: string;
  icon: string;
  status: "completed" | "current" | "locked";
  requirement?: string;
}

interface DashboardProps {
  onStartGame: () => void;
}

export function Dashboard({ onStartGame }: DashboardProps) {
  const careerLevels: CareerLevel[] = [
    { id: "1", title: "Aaramth Grihastha", icon: "📊", status: "current", requirement: "Level 3 ~ Good Start!" },
    { id: "2", title: "Brahmacharya", icon: "💼", status: "completed", requirement: "Level 2 ~ Great Finish!" },
    { id: "3", title: "Vidyarth Yeva", icon: "📚", status: "completed", requirement: "Level 1 ~ Completed!" },
    { id: "4", title: "Asvanda Grihastha", icon: "🏦", status: "locked", requirement: "Not Investing" },
    { id: "5", title: "Grihastha Dharma", icon: "🏛️", status: "locked", requirement: "Not Yet & Dividend" },
    { id: "6", title: "Vanaprastha", icon: "🎯", status: "locked", requirement: "Target 70%" },
  ];

  const currentLevel = careerLevels.find(l => l.status === "current");
  const completedCount = careerLevels.filter(l => l.status === "completed").length;
  const totalLevels = careerLevels.length;
  const progressPercentage = (completedCount / totalLevels) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-emerald-100 flex flex-col relative overflow-hidden">
      {/* Mountain Silhouettes Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 left-0 right-0 w-full h-64 opacity-20" viewBox="0 0 1440 320">
          <path fill="#10b981" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,122.7C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <svg className="absolute bottom-0 left-0 right-0 w-full h-48 opacity-15" viewBox="0 0 1440 320">
          <path fill="#14b8a6" d="M0,224L48,208C96,192,192,160,288,154.7C384,149,480,171,576,165.3C672,160,768,128,864,128C960,128,1056,160,1152,165.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="text-sm">💰</span>
          </div>
          <div>
            <h1 className="font-bold text-emerald-900 text-sm">Paisa War</h1>
            <p className="text-[10px] text-emerald-700">It's your turn</p>
          </div>
        </div>
        <div className="bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
          <span className="text-teal-800 font-bold text-xs">Level 3</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-emerald-800 text-xs font-semibold">Active Paisa Progress</span>
          <span className="text-emerald-700 text-xs">{completedCount}/{totalLevels} Complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content - Leaderboard Style */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-3">
          {careerLevels.map((level, index) => (
            <LeaderboardCard
              key={level.id}
              level={level}
              position={index + 1}
              onClick={level.status === "current" ? onStartGame : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardCard({
  level,
  position,
  onClick
}: {
  level: CareerLevel;
  position: number;
  onClick?: () => void;
}) {
  const getCardStyle = () => {
    if (position === 1 && level.status === "current") {
      return {
        bg: "bg-gradient-to-r from-orange-100 to-amber-100",
        border: "border-orange-300",
        positionBg: "bg-orange-500",
        avatarBg: "bg-orange-200",
        buttonBg: "bg-orange-500",
        textColor: "text-orange-900",
      };
    } else if (level.status === "completed") {
      return {
        bg: "bg-gradient-to-r from-cyan-50 to-teal-50",
        border: "border-cyan-300",
        positionBg: "bg-cyan-600",
        avatarBg: "bg-cyan-100",
        buttonBg: "bg-cyan-500",
        textColor: "text-cyan-900",
      };
    } else {
      return {
        bg: "bg-gradient-to-r from-gray-50 to-gray-100",
        border: "border-gray-300",
        positionBg: "bg-gray-500",
        avatarBg: "bg-gray-100",
        buttonBg: "bg-gray-400",
        textColor: "text-gray-700",
      };
    }
  };

  const style = getCardStyle();
  const isClickable = onClick !== undefined;

  const cardContent = (
    <div className={`flex items-center gap-3 p-3 rounded-2xl ${style.bg} border-2 ${style.border} shadow-md transition-all ${isClickable ? "active:scale-[0.98]" : ""}`}>
      {/* Position Badge */}
      <div className={`size-8 ${style.positionBg} rounded-full flex items-center justify-center shrink-0`}>
        <span className="text-white font-bold text-sm">{position}</span>
      </div>

      {/* Avatar */}
      <div className={`size-12 ${style.avatarBg} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
        {level.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-sm ${style.textColor} truncate`}>{level.title}</h3>
        <p className="text-xs text-gray-600 truncate">{level.requirement}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">📈</span>
            <span className="text-[10px] text-gray-600">Loan Investing</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-500">💰</span>
            <span className="text-[10px] text-gray-600">
              {level.status === "current" ? "Board 95%" : level.status === "completed" ? "Board 87%" : "Target 90%"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        className={`size-10 ${style.buttonBg} rounded-full flex items-center justify-center shrink-0 shadow-md ${isClickable ? "active:scale-90" : "opacity-50 cursor-not-allowed"} transition-all`}
        disabled={!isClickable}
      >
        <span className="text-white text-lg">{isClickable ? "▶️" : "🔒"}</span>
      </button>
    </div>
  );

  if (isClickable) {
    return (
      <button onClick={onClick} className="w-full">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}
```

---

### 2. CSS Animations (if needed)

**File:** `src/styles/animations.css` (or add to your existing CSS file)

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-25px) rotate(-5deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 8s ease-in-out infinite;
}
```

---

### 3. Usage Example

**In your main App.tsx or wherever you handle routing:**

```tsx
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { GameView } from "./components/GameView"; // Your game component

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "game">("dashboard");

  if (currentView === "dashboard") {
    return <Dashboard onStartGame={() => setCurrentView("game")} />;
  }

  return <GameView onBackToDashboard={() => setCurrentView("dashboard")} />;
}
```

---

## What You Need:

1. **Tailwind CSS** installed and configured
2. **lucide-react** for icons (or remove the TrendingUp import if not using)

Install if needed:
```bash
npm install lucide-react
# or
pnpm add lucide-react
```

---

## Customization Tips:

1. **Change level data**: Edit the `careerLevels` array in the Dashboard component
2. **Change colors**: Modify the color classes in `getCardStyle()` function
3. **Change header text**: Edit "Paisa War" and "It's your turn" in the header
4. **Add more stats**: Add more items in the stats row (where "📈 Loan Investing" is)

---

## That's it! 

Copy the Dashboard component code above and paste it into a new file in your project. Then import and use it wherever you need the dashboard view.