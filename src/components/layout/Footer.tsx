
export function Footer() {
  return (
    <footer className="bg-secondary py-8">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2023 Kaveesha Sanjana. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/kaveeshaSanjana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <img src="https://img.icons8.com/color/24/null/github.png" alt="GitHub" className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/kaveeshasanjana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <img src="https://img.icons8.com/color/24/null/linkedin.png" alt="LinkedIn" className="h-5 w-5" />
            </a>
            <a
              href="mailto:kavishasanjana@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <img src="https://img.icons8.com/color/24/null/gmail.png" alt="Email" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
