import React, { useState, useEffect } from 'react';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { useContextUrlSync } from '@/utils/pageNavigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, BookOpen, GraduationCap, User, Palette, Menu, X, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Students from '@/components/Students';
import Teachers from '@/components/Teachers';
import Parents from '@/components/Parents';
import ChildAttendance from '@/components/ChildAttendance';
import ChildResults from '@/components/ChildResults';
import VerifyImage from '@/components/VerifyImage';

import Grades from '@/components/Grades';
import Classes from '@/components/Classes';
import Subjects from '@/components/Subjects';
import Institutes from '@/components/Institutes';
import Grading from '@/components/Grading';
import Attendance from '@/components/Attendance';
import NewAttendance from '@/components/NewAttendance';
import MyAttendance from '@/components/MyAttendance';

import AttendanceMarkers from '@/components/AttendanceMarkers';
import QRAttendance from '@/components/QRAttendance';
import InstituteMarkAttendance from '@/pages/InstituteMarkAttendance';
import Lectures from '@/components/Lectures';
import LiveLectures from '@/components/LiveLectures';
import Homework from '@/components/Homework';
import Exams from '@/components/Exams';
import Results from '@/components/Results';
import Profile from '@/components/Profile';
import InstituteDetails from '@/components/InstituteDetails';
import Login from '@/components/Login';
import InstituteSelector from '@/components/InstituteSelector';
import ClassSelector from '@/components/ClassSelector';
import SubjectSelector from '@/components/SubjectSelector';
import ParentChildrenSelector from '@/components/ParentChildrenSelector';
import Organizations from '@/components/Organizations';
import Gallery from '@/components/Gallery';
import Settings from '@/components/Settings';
import Appearance from '@/components/Appearance';
import OrganizationHeader from '@/components/OrganizationHeader';
import OrganizationLogin from '@/components/OrganizationLogin';
import OrganizationSelector from '@/components/OrganizationSelector';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import OrganizationManagement from '@/components/OrganizationManagement';
import OrganizationCourses from '@/components/OrganizationCourses';
import OrganizationLectures from '@/components/OrganizationLectures';
import TeacherStudents from '@/components/TeacherStudents';
import TeacherHomework from '@/components/TeacherHomework';
import TeacherExams from '@/components/TeacherExams';
import TeacherLectures from '@/components/TeacherLectures';
import InstituteLectures from '@/components/InstituteLectures';
import AttendanceMarkerSubjectSelector from '@/components/AttendanceMarkerSubjectSelector';
import UnverifiedStudents from '@/components/UnverifiedStudents';
import EnrollClass from '@/components/EnrollClass';
import EnrollSubject from '@/components/EnrollSubject';
import InstituteUsers from '@/components/InstituteUsers';
import SetupGuide from '@/components/SetupGuide';
import InstituteProfile from '@/components/InstituteProfile';
import StudentHomeworkSubmissions from '@/components/StudentHomeworkSubmissions';
import FreeLectures from '@/components/FreeLectures';
import SMS from '@/components/SMS';
import SMSHistory from '@/pages/SMSHistory';
import MyChildren from '@/pages/MyChildren';
import ChildDashboard from '@/pages/ChildDashboard';
import ChildResultsPage from '@/pages/ChildResultsPage';
import ChildAttendancePage from '@/pages/ChildAttendancePage';
import ChildTransportPage from '@/pages/ChildTransportPage';
import InstituteOrganizations from '@/pages/InstituteOrganizations';
import InstitutePayments from '@/pages/InstitutePayments';
import SubjectPayments from '@/pages/SubjectPayments';

interface AppContentProps {
  initialPage?: string;
}

const AppContent = ({ initialPage }: AppContentProps) => {
  const { user, login, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, setSelectedOrganization, currentInstituteId } = useAuth();
  const { navigateToPage, getPageFromPath } = useAppNavigation();
  
  // Institute-specific role - always uses selectedInstitute.userRole
  const userRole = useInstituteRole();
  
  console.log('🎯 AppContent - Role:', userRole, 'Institute UserType:', selectedInstitute?.userRole);
  
  // Initialize currentPage from URL or prop or default to dashboard
  const [currentPage, setCurrentPageState] = useState(() => {
    if (initialPage) return initialPage;
    
    // Get page from current URL path
    try {
      const pathname = window.location.pathname;
      console.log('Getting page from pathname:', pathname);
      
      if (pathname === '/') return 'dashboard';
      
      // Handle nested routes
      if (pathname.startsWith('/institutes/')) {
        const parts = pathname.split('/');
        if (parts[2] === 'users') return 'institute-users';
        if (parts[2] === 'classes') return 'classes';
        return 'institutes';
      }

      // Handle child routes - e.g., /child/123/dashboard
      if (pathname.startsWith('/child/')) {
        const parts = pathname.split('/');
        if (parts.length >= 4) {
          // Return pattern like 'child/:childId/dashboard'
          return `child/:childId/${parts[3]}`;
        }
        return 'my-children';
      }
      
      // Remove leading slash and use as page name
      const pageName = pathname.slice(1);
      console.log('Final page name from URL:', pageName);
      return pageName;
    } catch (error) {
      console.error('Error getting page from URL:', error);
      return 'dashboard';
    }
  });
  
  // 🔗 Sync URL with context automatically
  useContextUrlSync(currentPage);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [organizationLoginData, setOrganizationLoginData] = useState<any>(null);
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);
  const [organizationCurrentPage, setOrganizationCurrentPage] = useState('organizations');

  // Listen to URL changes and update currentPage accordingly
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      console.log('URL changed to:', pathname);
      const pageName = getPageFromPath(pathname);
      console.log('Setting page to:', pageName);
      setCurrentPageState(pageName);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [getPageFromPath]);

  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    navigateToPage(page);
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleOrganizationLogin = (loginResponse: any) => {
    console.log('Organization login successful:', loginResponse);
    setOrganizationLoginData(loginResponse);
    setOrganizationCurrentPage('organizations');
  };

  const handleOrganizationSelect = (organization: any) => {
    console.log('Organization selected:', organization);
    setSelectedOrganization(organization);
    
    // Switch to using baseUrl2 for organization-specific API calls
    import('@/api/client').then(({ apiClient }) => {
      apiClient.setUseBaseUrl2(true);
    });
    
    setCurrentPage('dashboard');
  };

  const handleBackToOrganizationSelector = () => {
    setCurrentPage('organization-selector');
  };

  const handleBackToMain = () => {
    setOrganizationLoginData(null);
    setOrganizationCurrentPage('organizations');
    
    // Switch back to using baseUrl for main API calls
    import('@/api/client').then(({ apiClient }) => {
      apiClient.setUseBaseUrl2(false);
    });
    
    setCurrentPage('dashboard');
  };

  const handleCreateOrganization = () => {
    setShowCreateOrgForm(true);
  };

  const handleCreateOrganizationSuccess = (organization: any) => {
    console.log('Organization created successfully:', organization);
    setShowCreateOrgForm(false);
    setCurrentPage('organization-selector');
  };

  const handleCreateOrganizationCancel = () => {
    setShowCreateOrgForm(false);
  };

  // Organization-specific navigation component
  const OrganizationNavigation = () => {
    if (!organizationLoginData) return null;

    const isOrganizationManager = userRole === 'OrganizationManager';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const navigationItems = [
      {
        id: 'organizations',
        title: 'Select Organizations',
        description: 'Browse and manage organizations',
        icon: Building2,
        visible: true
      },
      {
        id: 'courses',
        title: 'Courses',
        description: 'Manage course content',
        icon: BookOpen,
        visible: isOrganizationManager
      },
      {
        id: 'lectures',
        title: 'Lectures',
        description: 'Schedule and view lectures',
        icon: GraduationCap,
        visible: isOrganizationManager
      },
      {
        id: 'profile',
        title: 'Profile',
        description: 'Manage your profile',
        icon: User,
        visible: true
      },
      {
        id: 'appearance',
        title: 'Appearance',
        description: 'Customize app appearance',
        icon: Palette,
        visible: true
      }
    ];

    const handleNavigation = (pageId: string) => {
      setOrganizationCurrentPage(pageId);
      setIsSidebarOpen(false); // Close mobile sidebar after navigation
    };

    const SidebarSection = ({ title, items }: { title: string; items: any[] }) => {
      if (items.length === 0) return null;

      return (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
            {title}
          </h3>
          <div className="space-y-1">
            {items.map((item) => (
              <Button
                key={item.id}
                variant={organizationCurrentPage === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start h-9 sm:h-10 px-3 text-sm ${
                  organizationCurrentPage === item.id 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                {item.title}
              </Button>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Organization Portal</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBackToMain}>
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-full min-h-screen">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Organization Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-50 md:relative
            w-72 sm:w-80 md:w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transform transition-transform duration-300 ease-in-out md:transform-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            flex flex-col h-screen
            overflow-hidden
          `}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 min-w-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                  Organization
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close Sidebar"
                >
                  <X className="h-4 w-4 md:hidden" />
                  <Menu className="h-4 w-4 hidden md:block" />
                </Button>
              </div>
            </div>

            {/* Context Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Management Hub
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToMain}
                  className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                  aria-label="Back to Main"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                <span className="font-medium">Module:</span> 
                <span className="ml-1 truncate">Organization System</span>
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
              <div className="space-y-2">
                {/* Main navigation items */}
                <SidebarSection title="Quick Access" items={navigationItems.filter(item => item.visible)} />
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToMain}
                className="w-full flex items-center justify-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 h-8 sm:h-9"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Back to Main</span>
              </Button>
            </div>
          </div>
          
          {/* Organization Content */}
          <div className="flex-1 overflow-auto">
            {/* Content Wrapper with responsive padding */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-full">
              {organizationCurrentPage === 'organizations' && (
                <OrganizationManagement
                  userRole={userRole || 'Student'}
                  userPermissions={organizationLoginData?.permissions}
                  currentInstituteId={currentInstituteId || undefined}
                />
              )}
              {organizationCurrentPage === 'courses' && isOrganizationManager && (
                <OrganizationCourses />
              )}
              {organizationCurrentPage === 'lectures' && isOrganizationManager && (
                <OrganizationLectures />
              )}
              {organizationCurrentPage === 'profile' && <Profile />}
              {organizationCurrentPage === 'appearance' && <Appearance />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComponent = () => {
    // Handle organization-related pages
    if (currentPage === 'organizations') {
      if (showCreateOrgForm) {
        return (
          <CreateOrganizationForm
            onSuccess={handleCreateOrganizationSuccess}
            onCancel={handleCreateOrganizationCancel}
          />
        );
      }
      
      // Show organization login for all specified user roles
      if (!organizationLoginData && ['InstituteAdmin', 'Student', 'Teacher', 'OrganizationManager'].includes(userRole || '')) {
        return (
          <OrganizationLogin
            onLogin={handleOrganizationLogin}
            onBack={handleBackToMain}
          />
        );
      }
      
      // Show organization navigation after login
      if (organizationLoginData) {
        return <OrganizationNavigation />;
      }
      
      if (!selectedOrganization) {
        return (
          <OrganizationSelector
            onOrganizationSelect={handleOrganizationSelect}
            onBack={handleBackToMain}
            onCreateOrganization={handleCreateOrganization}
            userPermissions={organizationLoginData?.permissions}
          />
        );
      }
    }

    if (currentPage === 'organization-selector') {
      return (
        <OrganizationSelector
          onOrganizationSelect={handleOrganizationSelect}
          onBack={handleBackToMain}
          onCreateOrganization={handleCreateOrganization}
          userPermissions={organizationLoginData?.permissions}
        />
      );
    }

    // For Organization Manager - show organizations list or organization-specific dashboard
    if (userRole === 'OrganizationManager') {
      if (!selectedOrganization && currentPage !== 'organizations') {
        return <Organizations />;
      }

      // Add Organization Header for specific sections
      const shouldShowOrgHeader = ['dashboard', 'students', 'lectures', 'gallery'].includes(currentPage);
      
      const getPageTitle = () => {
        switch (currentPage) {
          case 'dashboard': return 'Dashboard';
          case 'students': return 'Students';
          case 'lectures': return 'Lectures';
          case 'gallery': return 'Gallery';
          default: return 'Management';
        }
      };

      const renderWithHeader = (component: React.ReactNode) => (
        <>
          {shouldShowOrgHeader && <OrganizationHeader title={getPageTitle()} />}
          {component}
        </>
      );

      switch (currentPage) {
        case 'organizations':
          return <Organizations />;
        case 'dashboard':
          return renderWithHeader(<Dashboard />);
        case 'students':
          return renderWithHeader(<Students />);
        case 'lectures':
          return renderWithHeader(<Lectures />);
        case 'gallery':
          return renderWithHeader(<Gallery />);
        case 'appearance':
          return <Appearance />;
        case 'profile':
          return <Profile />;
        case 'settings':
          return <Settings />;
        default:
          return <Dashboard />;
      }
    }

    // For Student role - simplified interface
    if (userRole === 'Student') {
      if (!selectedInstitute && user.institutes.length === 1) {
        // Auto-select the only institute available
        // This should be handled by the auth context
      }
      
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'enroll-class':
          console.log('Student: Rendering EnrollClass component');
          return <EnrollClass />;
        case 'enroll-subject':
          console.log('Student: Rendering EnrollSubject component');
          return <EnrollSubject />;
        case 'my-attendance':
          console.log('Student: Rendering MyAttendance component');
          return <MyAttendance />;
        case 'lectures':
          return <Lectures />;
        case 'free-lectures':
          return <FreeLectures />;
        case 'homework':
          return <Homework />;
        case 'homework-submissions':
          return <StudentHomeworkSubmissions />;
        case 'exams':
          return <Exams />;
        case 'results':
          return <Results />;
        case 'institute-lectures':
          console.log('Student: Rendering InstituteLectures component');
          return <InstituteLectures />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'appearance':
          return <Appearance />;
        case 'institute-profile':
          return <InstituteProfile />;
        case 'organizations':
          return renderComponent();
        default:
          return <Dashboard />;
      }
    }

    // For Parent role
    if (userRole === 'Parent') {
      if (currentPage === 'parents') {
        return <ParentChildrenSelector />;
      }

      if (!selectedChild && currentPage !== 'parents' && currentPage !== 'profile' && currentPage !== 'appearance') {
        return <ParentChildrenSelector />;
      }

      // For Parent role, when "Select Institute" is clicked (dashboard page), 
      // use InstituteSelector but pass the selected child's ID
      if (currentPage === 'dashboard' && selectedChild && !selectedInstitute) {
        return <InstituteSelector useChildId={true} />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'homework':
          return <Homework />;
        case 'homework-submissions':
          return <StudentHomeworkSubmissions />;
        case 'results':
          return <Results />;
        case 'exams':
          return <Exams />;
        case 'profile':
          return <Profile />;
        case 'child-attendance':
          return <ChildAttendance />;
        case 'child-results':
          return <ChildResults />;
        case 'child-transport':
          return <ChildTransportPage />;
        case 'my-children':
          return <ParentChildrenSelector />;
        case 'parents':
          return <ParentChildrenSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <ParentChildrenSelector />;
      }
    }

    // For Teacher role
    if (userRole === 'Teacher') {
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <SubjectSelector />;
      }

      const classRequiredPages = ['grading'];
      if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
        return <ClassSelector />;
      }

      const subjectRequiredPages = ['lectures'];
      if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
        return <SubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'students':
          return <Students />;
        case 'unverified-students':
          return <UnverifiedStudents />;
        case 'parents':
          return <Parents />;
        case 'classes':
          return <Classes />;
        case 'subjects':
          return <Subjects />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'grading':
        case 'grades-table':
        case 'create-grade':
        case 'assign-grade-classes':
        case 'view-grade-classes':
          return <Grading />;
        case 'attendance':
          return <Attendance />;
        case 'daily-attendance':
          return <NewAttendance />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'institute-mark-attendance':
          return <InstituteMarkAttendance />;
        case 'lectures':
          return userRole === 'Teacher' ? <TeacherLectures /> : <Lectures />;
        case 'institute-lectures':
          return <InstituteLectures />;
        case 'free-lectures':
          return <FreeLectures />;
        case 'live-lectures':
          return <LiveLectures />;
        case 'homework':
          return userRole === 'Teacher' ? <TeacherHomework /> : <Homework />;
        case 'homework-submissions':
          return <StudentHomeworkSubmissions />;
        case 'exams':
          return userRole === 'Teacher' ? <TeacherExams /> : <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'appearance':
          return <Appearance />;
        case 'institute-profile':
          return <InstituteProfile />;
        default:
          return <Dashboard />;
      }
    }

    // For AttendanceMarker role
    if (userRole === 'AttendanceMarker') {
      if (!selectedInstitute && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <SubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'daily-attendance':
          return <NewAttendance />;
        case 'my-attendance':
          return <MyAttendance />;
        case 'attendance-markers':
          return <AttendanceMarkers />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'institute-mark-attendance':
          return <InstituteMarkAttendance />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'select-class':
          return <ClassSelector />;
      case 'appearance':
        return <Appearance />;
      case 'institute-profile':
        return <InstituteProfile />;
      case 'settings':
          return <Settings />;
        default:
          return <Dashboard />;
      }
    }

    // For InstituteAdmin and other roles - full access within their institute
    // Pages that don't require class/subject selection
    const pagesWithoutClassRequirement = [
      'transport', 
      'parent-transport', 
      'transport-selection', 
      'transport-attendance',
      'my-children',
      'child/:childId/dashboard',
      'child/:childId/results',
      'child/:childId/attendance',
      'child/:childId/transport',
      'institute-payments',
      'subject-payments'
    ];
    if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute' && !pagesWithoutClassRequirement.includes(currentPage)) {
      return <InstituteSelector />;
    }

    if (currentPage === 'select-class') {
      return <ClassSelector />;
    }

    if (currentPage === 'select-subject') {
      return <SubjectSelector />;
    }

    const classRequiredPages = ['grading'];
    if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage) && !pagesWithoutClassRequirement.includes(currentPage)) {
      return <ClassSelector />;
    }

    const subjectRequiredPages = ['lectures'];
    if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage) && !pagesWithoutClassRequirement.includes(currentPage)) {
      return <SubjectSelector />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'institute-users':
        return <InstituteUsers />;
      case 'verify-image':
        return <VerifyImage />;
      case 'users':
        // Show InstituteUsers for InstituteAdmin
        if (userRole === 'InstituteAdmin') {
          return <InstituteUsers />;
        }
        return <Users />;
      case 'students':
         return <Students />;
      case 'unverified-students':
        return <UnverifiedStudents />;
      case 'enroll-class':
        console.log('Rendering EnrollClass component for Student');
        return <EnrollClass />;
      case 'enroll-subject':
        console.log('Rendering EnrollSubject component for Student');
        return <EnrollSubject />;
      case 'teachers':
        return <Teachers />;
      case 'parents':
        return <Parents />;
      case 'grades':
        return <Grades />;
      case 'classes':
        return <Classes />;
      case 'subjects':
        return <Subjects />;
      case 'institutes':
        return <Institutes />;
      case 'institute-organizations':
        return <InstituteOrganizations />;
      case 'select-institute':
        return <InstituteSelector />;
      case 'grading':
      case 'grades-table':
      case 'create-grade':
      case 'assign-grade-classes':
      case 'view-grade-classes':
        return <Grading />;
      case 'attendance':
        return <Attendance />;
      case 'daily-attendance':
        return <NewAttendance />;
      case 'attendance-markers':
        return <AttendanceMarkers />;
      case 'qr-attendance':
        return <QRAttendance />;
      case 'institute-mark-attendance':
        return <InstituteMarkAttendance />;
      case 'lectures':
        return <Lectures />;
      case 'free-lectures':
        return <FreeLectures />;
      case 'institute-lectures':
        return <InstituteLectures />;
      case 'live-lectures':
        return <LiveLectures />;
      case 'homework':
        return <Homework />;
      case 'homework-submissions':
        return <StudentHomeworkSubmissions />;
      case 'exams':
        return <Exams />;
      case 'results':
        return <Results />;
      case 'teacher-students':
        return <TeacherStudents />;
      case 'teacher-homework':
        return <TeacherHomework />;
      case 'teacher-exams':
        return <TeacherExams />;
      case 'teacher-lectures':
        return <TeacherLectures />;
      case 'institute-lectures':
        return <InstituteLectures />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'setup-guide':
        return <SetupGuide />;
      case 'institute-details':
        return <InstituteDetails />;
      case 'appearance':
        return <Appearance />;
      case 'institute-profile':
        return <InstituteProfile />;
      case 'sms':
        return <SMS />;
      case 'sms-history':
        return <SMSHistory />;
      case 'institute-payments':
        return <InstitutePayments />;
      case 'subject-payments':
        return <SubjectPayments />;
      case 'my-children':
        return <MyChildren />;
      case 'child/:childId/dashboard':
        return <ChildDashboard />;
      case 'child/:childId/results':
        return <ChildResultsPage />;
      case 'child/:childId/attendance':
        return <ChildAttendancePage />;
      case 'child/:childId/transport':
        return <ChildTransportPage />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={(userData) => {
      // Login success is handled by the auth context
      console.log('User logged in successfully:', userData);
    }} loginFunction={login} />;
  }

  // If organizations page is active with login data, render organization navigation
  if (currentPage === 'organizations' && organizationLoginData) {
    return renderComponent();
  }

  // If organizations page is active without login data, render full screen
  if (currentPage === 'organizations' && !selectedOrganization && !organizationLoginData) {
    return renderComponent();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex w-full h-screen">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuClick={handleMenuClick} />
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            <div className="max-w-full">
              {renderComponent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppContent;
