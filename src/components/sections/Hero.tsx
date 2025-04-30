
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TypewriterEffect } from "./TypewriterEffect";

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
      className="relative min-h-screen flex items-center justify-center pt-16"
    >
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
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
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <a href="#about" aria-label="Scroll down">
            <ArrowDown />
          </a>
        </div>
      </div>
    </section>
  );
}
