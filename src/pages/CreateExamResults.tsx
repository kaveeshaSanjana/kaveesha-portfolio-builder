import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, RefreshCw } from 'lucide-react';
import donutChartIcon from '@/assets/donut-chart.png';
import { examApi } from '@/api/exam.api';
import { examResultsApi } from '@/api/examResults.api';
import { instituteApi } from '@/api/institute.api';
import AppLayout from '@/components/layout/AppLayout';
import GradeConfigurationCard, { GradeRange } from '@/components/GradeConfigurationCard';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  userIdByInstitute: string;
}

interface StudentResult {
  studentId: string;
  score: string;
  grade: string;
  remarks: string;
}

const defaultGradeRanges: GradeRange[] = [
  { grade: 'A', minScore: 75, maxScore: 100 },
  { grade: 'B', minScore: 65, maxScore: 74 },
  { grade: 'C', minScore: 55, maxScore: 64 },
  { grade: 'S', minScore: 40, maxScore: 54 },
  { grade: 'F', minScore: 0, maxScore: 39 }
];

const defaultRemarks: Record<string, string> = {
  'A': 'Excellent',
  'B': 'Very Good',
  'C': 'Credit Pass',
  'S': 'Ordinary Pass (Satisfactory)',
  'F': 'Fail'
};

const CreateExamResults = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Record<string, StudentResult>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gradeRanges, setGradeRanges] = useState<GradeRange[]>(defaultGradeRanges);
  const [gradeConfigOpen, setGradeConfigOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [examId, currentInstituteId, currentClassId, currentSubjectId]);

  const loadData = async () => {
    if (!examId || !currentInstituteId || !currentClassId || !currentSubjectId) {
      toast({
        title: "Missing Information",
        description: "Institute, class, and subject must be selected.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Load exam details from the exams list to avoid 403 error on single exam endpoint
      const examsResponse = await examApi.getExams({
        instituteId: currentInstituteId,
        classId: currentClassId,
        subjectId: currentSubjectId,
        page: 1,
        limit: 50
      });
      
      // Find the specific exam from the list
      const examData = examsResponse.data.find((exam: any) => exam.id === examId);
      if (examData) {
        setExam(examData);
      }

      // Load students from API
      const response = await instituteApi.getInstituteStudentsByClassAndSubject(
        currentInstituteId,
        currentClassId,
        currentSubjectId,
        { page: 1, limit: 100 }
      );

      // Map the API response to Student interface
      const studentsData: Student[] = response.data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email || '',
        imageUrl: item.imageUrl,
        userIdByInstitute: item.userIdByInstitute || item.studentId || ''
      })) || [];

      setStudents(studentsData);

      // Initialize results object
      const initialResults: Record<string, StudentResult> = {};
      studentsData.forEach((student: Student) => {
        initialResults[student.id] = {
          studentId: student.id,
          score: '',
          grade: '',
          remarks: ''
        };
      });
      setResults(initialResults);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeAndRemarks = (score: string): { grade: string; remarks: string } => {
    const numScore = parseFloat(score);
    
    if (isNaN(numScore) || numScore < 0) {
      return { grade: '', remarks: '' };
    }
    
    // Find the matching grade range
    for (const range of gradeRanges) {
      if (numScore >= range.minScore && numScore <= range.maxScore) {
        return { grade: range.grade, remarks: defaultRemarks[range.grade] || '' };
      }
    }
    
    return { grade: '', remarks: '' };
  };

  const handleResultChange = (studentId: string, field: keyof StudentResult, value: string) => {
    setResults(prev => {
      const updatedResult = {
        ...prev[studentId],
        [field]: value
      };
      
      // Auto-calculate grade and remarks when score changes
      if (field === 'score' && value) {
        const { grade, remarks } = calculateGradeAndRemarks(value);
        updatedResult.grade = grade;
        updatedResult.remarks = remarks;
      }
      
      return {
        ...prev,
        [studentId]: updatedResult
      };
    });
  };

  const handleSubmit = async () => {
    if (!examId || !currentInstituteId || !currentClassId || !currentSubjectId) {
      return;
    }

    // Filter out students without scores
    const validResults = Object.values(results).filter(result => result.score !== '');

    if (validResults.length === 0) {
      toast({
        title: "No Results",
        description: "Please enter at least one student's result.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      await examResultsApi.createBulkResults({
        instituteId: currentInstituteId,
        classId: currentClassId,
        subjectId: currentSubjectId,
        examId: examId,
        results: validResults
      });

      toast({
        title: "Success",
        description: `Results created for ${validResults.length} student(s).`
      });

      navigate('/exams');
    } catch (error) {
      console.error('Error creating results:', error);
      toast({
        title: "Error",
        description: "Failed to create results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/exams')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Create Exam Results</h1>
            {exam && (
              <p className="text-muted-foreground mt-1">
                {exam.title} - Enter marks for each student
              </p>
            )}
          </div>
          <Dialog open={gradeConfigOpen} onOpenChange={setGradeConfigOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <img src={donutChartIcon} alt="Grade Configuration" className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Grade Configuration</DialogTitle>
              </DialogHeader>
              <GradeConfigurationCard
                gradeRanges={gradeRanges}
                onGradeRangesChange={setGradeRanges}
                onReset={() => setGradeRanges(defaultGradeRanges)}
                onSave={() => {
                  toast({
                    title: "Success",
                    description: "Grade configuration saved successfully",
                  });
                  setGradeConfigOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No students found for this class and subject.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={student.imageUrl} alt={student.name} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {student.userIdByInstitute} • {student.email}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`score-${student.id}`}>Score</Label>
                      <Input
                        id={`score-${student.id}`}
                        type="number"
                        placeholder="Enter score"
                        value={results[student.id]?.score || ''}
                        onChange={(e) => handleResultChange(student.id, 'score', e.target.value)}
                        className={cn(
                          "font-bold",
                          results[student.id]?.grade === 'A' && "text-green-600 dark:text-green-400 border-green-500",
                          results[student.id]?.grade === 'B' && "text-blue-600 dark:text-blue-400 border-blue-500",
                          results[student.id]?.grade === 'C' && "text-teal-600 dark:text-teal-400 border-teal-500",
                          results[student.id]?.grade === 'S' && "text-yellow-600 dark:text-yellow-400 border-yellow-500",
                          results[student.id]?.grade === 'F' && "text-red-600 dark:text-red-400 border-red-500"
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`grade-${student.id}`}>Grade (Auto)</Label>
                      <Input
                        id={`grade-${student.id}`}
                        placeholder="Auto-filled"
                        value={results[student.id]?.grade || ''}
                        readOnly
                        className={cn(
                          "bg-muted font-bold",
                          results[student.id]?.grade === 'A' && "text-green-600 dark:text-green-400",
                          results[student.id]?.grade === 'B' && "text-blue-600 dark:text-blue-400",
                          results[student.id]?.grade === 'C' && "text-teal-600 dark:text-teal-400",
                          results[student.id]?.grade === 'S' && "text-yellow-600 dark:text-yellow-400",
                          results[student.id]?.grade === 'F' && "text-red-600 dark:text-red-400"
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`remarks-${student.id}`}>Remarks</Label>
                      <Input
                        id={`remarks-${student.id}`}
                        placeholder="Enter or auto-fill remarks"
                        value={results[student.id]?.remarks || ''}
                        onChange={(e) => handleResultChange(student.id, 'remarks', e.target.value)}
                        className={cn(
                          "font-medium",
                          results[student.id]?.grade === 'A' && "text-green-600 dark:text-green-400",
                          results[student.id]?.grade === 'B' && "text-blue-600 dark:text-blue-400",
                          results[student.id]?.grade === 'C' && "text-teal-600 dark:text-teal-400",
                          results[student.id]?.grade === 'S' && "text-yellow-600 dark:text-yellow-400",
                          results[student.id]?.grade === 'F' && "text-red-600 dark:text-red-400"
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/exams')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Results
                </>
              )}
            </Button>
          </div>
        </>
      )}
      </div>
    </AppLayout>
  );
};

export default CreateExamResults;
