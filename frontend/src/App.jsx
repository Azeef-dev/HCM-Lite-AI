import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast, { Toaster } from "react-hot-toast"
import { ChevronDown, Rocket } from "lucide-react"

export default function App() {
  const showToast = () => {
    toast.success("Hackathon setup successfully connected!")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      {/* Toast Container */}
      <Toaster position="top-center" />

      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600" />
            Saylani Hackathon Ready
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Input field */}
          <Input placeholder="Project title enter karein..." />

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Category Select Karein
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>Web Development</DropdownMenuItem>
              <DropdownMenuItem>AI / Machine Learning</DropdownMenuItem>
              <DropdownMenuItem>Mobile App</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Skeleton Example */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted-foreground">Loading Skeleton Preview:</p>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Toast Action Button */}
          <Button onClick={showToast} className="w-full mt-4">
            Test Hot Toast
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}