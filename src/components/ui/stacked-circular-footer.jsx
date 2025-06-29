import { Icons } from "./icons"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

function StackedCircularFooter() {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <div className="mb-8 rounded-full bg-primary-100 p-8">
          <Icons.logo className="icon-class w-6 text-primary-600" />
          </div>
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-primary-600 text-gray-700 transition-colors">Home</a>
            <a href="#" className="hover:text-primary-600 text-gray-700 transition-colors">About</a>
            <a href="#" className="hover:text-primary-600 text-gray-700 transition-colors">Services</a>
            <a href="#" className="hover:text-primary-600 text-gray-700 transition-colors">Products</a>
            <a href="#" className="hover:text-primary-600 text-gray-700 transition-colors">Contact</a>
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
          <div className="mb-8 w-full max-w-md">
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input id="email" placeholder="Enter your email" type="email" className="rounded-full border-gray-300 focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <Button type="submit" className="rounded-full bg-primary-600 hover:bg-primary-700">Subscribe</Button>
            </form>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              © 2024 Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }