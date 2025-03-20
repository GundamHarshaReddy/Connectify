import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import MainNav from "@/components/navigation/main-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <span className="hidden font-bold sm:inline-block">
              Service Platform
            </span>
          </Link>
          <MainNav className="hidden md:flex" />
          <MobileNav />
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
