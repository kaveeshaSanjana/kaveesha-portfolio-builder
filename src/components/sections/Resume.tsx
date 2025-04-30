
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

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
    <section id="resume" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Resume</h2>
          <Button asChild className="mt-4 md:mt-0 flex items-center gap-2">
            <a href="/kaveesha_resume.pdf" download>
              <Download className="h-4 w-4" /> Download CV
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">Education</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
              {education.map((item, index) => (
                <div
                  key={item.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-muted bg-card shadow-sm group-odd:md:translate-x-1/2 group-even:md:-translate-x-1/2">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-1">
                        <span className="font-semibold">{item.degree}</span>
                      </div>
                      <div className="mb-2 text-sm text-muted-foreground">
                        {item.institution}
                      </div>
                      <div className="mb-3 text-xs text-muted-foreground">
                        {item.period}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6">Experience</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
              {experience.map((item, index) => (
                <div
                  key={item.id}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-muted bg-card shadow-sm group-odd:md:translate-x-1/2 group-even:md:-translate-x-1/2">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] shadow-sm">
                    <CardContent className="p-4">
                      <div className="mb-1">
                        <span className="font-semibold">{item.position}</span>
                      </div>
                      <div className="mb-2 text-sm text-muted-foreground">
                        {item.company}
                      </div>
                      <div className="mb-3 text-xs text-muted-foreground">
                        {item.period}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-2 py-1 rounded-full bg-secondary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
