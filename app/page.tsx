import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to My Chef
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          A modern web application for recipes
        </p>
        <div className="mt-6">
          <Button>Get Started</Button>
        </div>
      </div>
    </main>
  )
}