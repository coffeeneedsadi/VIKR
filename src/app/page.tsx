
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          VIKR Partner Hub
        </h1>
        <p className="text-xl text-muted-foreground">
          Secure access to technical documentation, training videos, and product specifications.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Partner Login <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Restricted Access: Authorized Distributors Only</p>
        <p>© {new Date().getFullYear()} VIKR Chemicals. All rights reserved.</p>
      </div>
    </div>
  )
}
