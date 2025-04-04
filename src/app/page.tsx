import PomodoroTimer from "@/components/pomodoro-timer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-yellow-50">
      <PomodoroTimer />
    </main>
  )
}

