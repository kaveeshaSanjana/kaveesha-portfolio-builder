
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypewriterEffect } from "./TypewriterEffect";
import { FloatingTechLogos } from "./FloatingTechLogos";

export function Hero() {
  const developerTitles = [
    "Full Stack Developer",
    "Java Developer", 
    "Angular Developer", 
    "Spring Boot Developer", 
    "React Developer", 
    "Backend Developer"
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Floating Tech Logos Background */}
      <FloatingTechLogos />
      
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center text-center lg:text-left gap-12 relative z-10">
        {/* Profile Image */}
        <div className="flex-shrink-0 animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
          <div className="relative">
            <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
              <img 
                src="/kaveesha-profile.png" 
                alt="Kaveesha Sanjana" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Decorative ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.2s" }}>
            <h1 className="mb-6">
              Hello, I'm <span className="text-primary">Kaveesha Sanjana</span>
            </h1>
          </div>
          
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.4s" }}>
            <h2 className="mb-8 text-2xl md:text-3xl font-medium text-muted-foreground">
              Software Engineer Intern | <TypewriterEffect titles={developerTitles} />
            </h2>
          </div>
          
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.6s" }}>
            <p className="mb-12 max-w-2xl text-muted-foreground">
              I'm a motivated software engineer intern passionate about modern technologies, 
              full-stack development, and building scalable systems. Always excited to explore 
              the latest tech before anyone else.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in opacity-0" style={{ animationDelay: "0.8s" }}>
            <Button asChild size="lg" className="rounded-full">
              <a href="/kaveesha_resume.pdf" download>
                Download CV
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <a href="#projects">View Projects</a>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center lg:justify-start gap-4 animate-fade-in opacity-0" style={{ animationDelay: "1s" }}>
            <Button asChild variant="outline" size="icon" className="rounded-full">
              <a
                href="https://github.com/kaveeshaSanjana"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="icon" className="rounded-full">
              <a
                href="https://linkedin.com/in/kaveeshasanjana"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </Button>
            <Button asChild variant="outline" size="icon" className="rounded-full">
              <a
                href="mailto:kavishasanjana@gmail.com"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <a href="#about" aria-label="Scroll down">
          <ArrowDown />
        </a>
      </div>
    </section>
  );
}
