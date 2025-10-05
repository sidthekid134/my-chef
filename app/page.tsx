import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <h1 className="text-4xl font-bold tracking-tight">My Chef</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A modern recipe application
      </p>
      <div className="mt-8">
        <Link href="/recipes/add">
          <Button size="lg">Create New Recipe</Button>
        </Link>
      </div>
    </div>
  )
}