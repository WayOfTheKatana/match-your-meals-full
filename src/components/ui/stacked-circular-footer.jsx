import { Icons } from "./icons"
import { Button } from "./button"
import { Facebook, Instagram, Linkedin, Twitter, ChefHat } from "lucide-react"

function StackedCircularFooter() {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <div className="mb-8 rounded-full bg-primary-100 p-8">
            <ChefHat className="w-6 h-6 text-primary-600" />
          </div>
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-primary-600 text-gray-700 transition-colors">Home</a>
            <a href="#features" className="hover:text-primary-600 text-gray-700 transition-colors">Features</a>
            <a href="#about" className="hover:text-primary-600 text-gray-700 transition-colors">Creator Share</a>
            <a href="#faq" className="hover:text-primary-600 text-gray-700 transition-colors">FAQ</a>
            <a href="/explore-recipes" className="hover:text-primary-600 text-gray-700 transition-colors">Explore Recipes</a>
          </nav>
          <div className="mb-8 flex space-x-4">
            <Button variant="outline" size="icon" className="rounded-full border-gray-300 text-gray-600 hover:bg-primary-50 hover:text-primary-600">
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-gray-300 text-gray-600 hover:bg-primary-50 hover:text-primary-600">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-gray-300 text-gray-600 hover:bg-primary-50 hover:text-primary-600">
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full border-gray-300 text-gray-600 hover:bg-primary-50 hover:text-primary-600">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2025 MatchMyMeals. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }