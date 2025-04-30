
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Link } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl: string;
  demoUrl?: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: 1,
    title: "EVO Plan",
    description: "Led an Agile student team in developing EVO Plan using Angular and Spring Boot. Implemented Jira for sprint planning, managed Pull Requests, and resolved conflicts in a simulated company environment.",
    technologies: ["Angular", "Spring Boot", "Git", "Jira", "Agile Methodology"],
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    githubUrl: "https://github.com/kaveeshaSanjana",
    featured: true,
  },
  {
    id: 2,
    title: "CMS - Cause Management System",
    description: "A microservices-based system using React and Spring Boot with Kafka for event-driven architecture. Implemented Google and Facebook OAuth using Keycloak, API Gateway, and Twilio integration for SMS notifications.",
    technologies: ["Microservices", "React", "Spring Boot", "Kafka", "Keycloak", "Twilio"],
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    githubUrl: "https://github.com/kaveeshaSanjana",
    featured: true,
  },
  {
    id: 3,
    title: "MOS Burger POS System",
    description: "Point of Sale system built with Angular and Spring Boot using JWT authentication. Implemented AuthGuard for route protection, JasperReports for PDF/Excel report generation, email automation, and file management.",
    technologies: ["Angular", "Spring Boot", "JWT", "JasperReports", "Email Automation"],
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    githubUrl: "https://github.com/kaveeshaSanjana",
  },
  {
    id: 4,
    title: "JavaFX Library System",
    description: "Desktop application for library management built with JavaFX and SceneBuilder. Features book transaction tracking, user management, fine calculation, and database operations with MySQL.",
    technologies: ["JavaFX", "SceneBuilder", "MySQL"],
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    githubUrl: "https://github.com/kaveeshaSanjana",
  },
];

export function Projects() {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredProjects = filter
    ? projects.filter((project) =>
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(filter.toLowerCase())
        )
      )
    : projects;

  const allTechnologies = Array.from(
    new Set(projects.flatMap((project) => project.technologies))
  ).sort();

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Projects</h2>
        
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          <Button
            variant={filter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(null)}
            className="rounded-full"
          >
            All
          </Button>
          {allTechnologies.map((tech) => (
            <Button
              key={tech}
              variant={filter === tech ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filter === tech ? null : tech)}
              className="rounded-full"
            >
              {tech}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <Card
              key={project.id}
              className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                project.featured ? "border-primary/20" : ""
              }`}
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${project.imageUrl})` }}
              />
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 3 && (
                    <Badge variant="outline">
                      +{project.technologies.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  {project.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" /> View Code
                  </a>
                </Button>
                {project.demoUrl && (
                  <Button asChild size="sm">
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Link className="h-4 w-4" /> Live Demo
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
