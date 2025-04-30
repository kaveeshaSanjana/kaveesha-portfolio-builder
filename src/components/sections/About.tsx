
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const techSkills = {
  languages: ["Java", "JavaScript", "SQL"],
  frameworks: ["Spring Boot", "Angular", "React", "JavaFX"],
  databases: ["MySQL", "PostgreSQL"],
  concepts: [
    "OOP",
    "ORM (Hibernate)",
    "Event-Driven Architecture",
    "JWT",
    "API Integration",
    "Kafka",
    "OAuth",
    "JasperReports",
  ],
  tools: ["Git", "GitHub", "Jira", "Keycloak", "Twilio", "Postman"],
};

const softSkills = [
  "Teamwork",
  "Leadership",
  "Communication",
  "Time Management",
  "Conflict Solving",
];

export function About() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <section id="about" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">About Me</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="bg-card rounded-xl p-6 shadow-md">
              <div className="mb-8 space-y-4">
                <h3 className="text-xl font-bold">Kaveesha Sanjana</h3>
                <p className="text-muted-foreground">
                  Software Engineer Intern
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:kavishasanjana@gmail.com" className="text-sm">
                      kavishasanjana@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">07777777777</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="text-sm">
                      <p>Diploma in Information Technology</p>
                      <p>Diploma in HRM</p>
                      <p>Diploma in Psychological Counseling</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <a href="https://linkedin.com/in/kaveeshasanjana" target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <a href="https://github.com/kaveeshaSanjana" target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs defaultValue="about" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-8">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="techSkills">Technical Skills</TabsTrigger>
                <TabsTrigger value="softSkills">Soft Skills</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4 animate-fade-in">
                <p>
                  I'm a motivated software engineering intern passionate about modern technologies, 
                  full-stack development, and building scalable systems. My focus is on creating 
                  effective, user-friendly applications using the latest industry standards and practices.
                </p>
                <p>
                  With expertise in Java and Spring Boot on the backend, and Angular and React for 
                  frontend development, I strive to deliver complete solutions that meet both technical 
                  requirements and user needs.
                </p>
                <p>
                  I'm particularly interested in AI-driven solutions and how they can improve productivity 
                  and streamline workflows. Always eager to learn new technologies and methodologies, 
                  I enjoy staying ahead of the curve in the rapidly evolving tech landscape.
                </p>
              </TabsContent>
              
              <TabsContent value="techSkills" className="space-y-8 animate-fade-in">
                <div>
                  <h4 className="mb-3 text-lg font-semibold">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {techSkills.languages.map((skill) => (
                      <span key={skill} className="tech-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-3 text-lg font-semibold">Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {techSkills.frameworks.map((skill) => (
                      <span key={skill} className="tech-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-3 text-lg font-semibold">Databases</h4>
                  <div className="flex flex-wrap gap-2">
                    {techSkills.databases.map((skill) => (
                      <span key={skill} className="tech-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-3 text-lg font-semibold">Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {techSkills.concepts.map((skill) => (
                      <span key={skill} className="tech-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="mb-3 text-lg font-semibold">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {techSkills.tools.map((skill) => (
                      <span key={skill} className="tech-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="softSkills" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {softSkills.map((skill, index) => (
                    <div
                      key={skill}
                      className="bg-card p-4 rounded-lg shadow-sm flex items-center gap-3"
                    >
                      <div className="bg-primary/10 p-2 rounded-full">
                        <svg
                          className="h-5 w-5 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
