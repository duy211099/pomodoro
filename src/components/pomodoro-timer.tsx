"use client"

import { useState, useEffect, useRef } from "react"
import { formatTime } from "@/lib/format-time"
import { Howl } from "howler"
import { Volume2, VolumeX } from "lucide-react"

type TimerMode = "pomodoro" | "shortBreak" | "longBreak"

const TIMER_CONFIG = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
}

const COLORS = {
  pomodoro: "bg-red-500",
  shortBreak: "bg-green-500",
  longBreak: "bg-blue-500",
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG[mode])
  const [isActive, setIsActive] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const alarmSound = useRef<Howl | null>(null)

  // Initialize sound
  useEffect(() => {
    alarmSound.current = new Howl({
      src: ["/alarm.mp3"],
      volume: 0.5,
    })

    return () => {
      alarmSound.current?.unload()
    }
  }, [])

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (!isMuted && alarmSound.current) {
        alarmSound.current.play()
      }

      setIsActive(false)

      if (mode === "pomodoro") {
        const newCount = completedPomodoros + 1
        setCompletedPomodoros(newCount)

        // After every 4 pomodoros, take a long break
        if (newCount % 4 === 0) {
          setMode("longBreak")
        } else {
          setMode("shortBreak")
        }
      } else {
        setMode("pomodoro")
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isActive, timeLeft, mode, completedPomodoros, isMuted])

  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(TIMER_CONFIG[mode])
    setIsActive(false)
  }, [mode])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(TIMER_CONFIG[mode])
  }

  const toggleSound = () => {
    setIsMuted(!isMuted)
  }

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode)
  }

  return (
    <div className="flex flex-col items-center max-w-md w-full">
      <h1 className="text-4xl font-black mb-8 tracking-tight">POMODORO</h1>

      <div
        className={`w-full p-6 ${COLORS[mode]} rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all`}
      >
        {/* Mode Selector */}
        <div className="flex justify-between mb-6 gap-2">
          {(["pomodoro", "shortBreak", "longBreak"] as TimerMode[]).map((timerMode) => (
            <button
              key={timerMode}
              onClick={() => changeMode(timerMode)}
              className={`
                flex-1 py-2 px-3 text-sm font-bold border-4 border-black rounded-md
                transition-all uppercase tracking-tight
                ${
                  mode === timerMode
                    ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                    : "bg-white text-black hover:bg-gray-100"
                }
              `}
            >
              {timerMode === "pomodoro" ? "Focus" : timerMode === "shortBreak" ? "Short" : "Long"}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="bg-white border-4 border-black rounded-lg p-8 mb-6 text-center">
          <div className="text-7xl font-mono font-bold tabular-nums">{formatTime(timeLeft)}</div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleTimer}
            className="px-8 py-3 bg-white border-4 border-black rounded-md font-bold text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 transition-all"
          >
            {isActive ? "PAUSE" : "START"}
          </button>

          <button
            onClick={resetTimer}
            className="px-6 py-3 bg-white border-4 border-black rounded-md font-bold text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 transition-all"
          >
            RESET
          </button>

          <button
            onClick={toggleSound}
            className="p-3 bg-white border-4 border-black rounded-md font-bold text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 transition-all"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>

      {/* Pomodoro Counter */}
      <div className="mt-8 flex items-center gap-2">
        <span className="font-bold">Completed:</span>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-black ${
                i < (completedPomodoros % 4) ? "bg-red-500" : "bg-white"
              }`}
            />
          ))}
        </div>
        <span className="font-bold ml-2">{Math.floor(completedPomodoros / 4)} sets</span>
      </div>
    </div>
  )
}

