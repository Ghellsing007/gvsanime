import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Github } from "lucide-react"
import { SITE_NAME } from "../lib/siteConfig"

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-4">
          <div className="text-center lg:text-left">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">{SITE_NAME}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              The ultimate platform for anime fans, providing detailed information, community discussions, and personalized recommendations.
            </p>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/explorar/generos" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Géneros
                </Link>
              </li>
              <li>
                <Link href="/explorar/seasons" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Temporadas
                </Link>
              </li>
              <li>
                <Link href="/forums" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Foros
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Legal</h3>
            <ul className="space-y-1 sm:space-y-2">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center lg:text-left">
            <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4">Connect With Us</h3>
            <div className="flex justify-center lg:justify-start space-x-3 sm:space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
            <div className="mt-4">
              <h4 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Subscribe to our newsletter</h4>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 bg-background border rounded-md sm:rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md sm:rounded-r-md hover:bg-primary/90 transition-colors w-full sm:w-auto mt-2 sm:mt-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-muted-foreground">
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="text-xs mt-2">
            Provided by{" "}
            <a
              href="https://gvservices.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Gvservices
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

