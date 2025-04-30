
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Resume() {
  const education = [
    {
      id: 1,
      degree: "Diploma in Information Technology",
      institution: "ICET",
      period: "2022 - 2023",
      description: "Focused on Spring Boot, Angular, and React development",
    },
    {
      id: 2,
      degree: "Diploma in HRM",
      institution: "Institute of Management & Business Studies",
      period: "2021 - 2022",
      description: "Human Resource Management principles and practices",
    },
    {
      id: 3,
      degree: "Diploma in Psychological Counseling",
      institution: "Institute of Management & Business Studies",
      period: "2020 - 2021",
      description: "Fundamentals of psychological counseling and support",
    },
  ];

  const experience = [
    {
      id: 1,
      position: "Software Engineering Intern",
      company: "Tech Solutions",
      period: "2023 - Present",
      description:
        "Working on full-stack development using Spring Boot and Angular. Implementing features, fixing bugs, and collaborating with the development team.",
      technologies: ["Java", "Spring Boot", "Angular", "Git"],
    },
    {
      id: 2,
      position: "Student Group Leader",
      company: "EVO Plan Project",
      period: "2022 - 2023",
      description:
        "Led a team of 5 students in developing the EVO Plan application using Agile methodology. Managed sprints, code reviews, and conflict resolution.",
      technologies: ["Angular", "Spring Boot", "Jira", "GitHub"],
    },
  ];

  return (
    <section id="resume" className="py-20 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Resume</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            My educational background and professional experience in software engineering and development.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-6">
            <Button asChild variant="outline" className="flex items-center gap-2">
              <a href="/kaveesha_resume.pdf" download>
                <FileText className="h-4 w-4" /> Download Full Resume
              </a>
            </Button>
          </div>
          
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
            </TabsList>
            
            <TabsContent value="experience" className="space-y-6">
              {experience.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-6 bg-card transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.position}</h3>
                      <p className="text-muted-foreground">{item.company}</p>
                      <p className="text-sm text-muted-foreground mb-4">{item.period}</p>
                      <p className="mb-4">{item.description}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                        {item.period}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-3 py-1 rounded-full bg-secondary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="education" className="space-y-6">
              {education.map((item) => (
                <div key={item.id} className="border border-border rounded-lg p-6 bg-card transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.degree}</h3>
                      <p className="text-muted-foreground">{item.institution}</p>
                      <p className="text-sm text-muted-foreground mb-4">{item.period}</p>
                      <p>{item.description}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                        {item.period}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
