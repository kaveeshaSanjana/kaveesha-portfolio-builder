
import { enhancedCachedClient } from './enhancedCachedClient';
import { ApiResponse } from './client';

export interface Institute {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  type?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Class {
  id: string;
  instituteId: string;
  name: string;
  code: string;
  academicYear: string;
  level: number;
  grade: number;
  specialty: string;
  classType: string;
  capacity: number;
  classTeacherId?: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  enrollmentCode: string;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
}

export interface InstituteUser {
  instituteId: string;
  userId: string;
  userIdByInstitute: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  institute: Institute;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    dateOfBirth: string | null;
    gender: string;
    imageUrl: string | null;
    isActive: boolean;
    subscriptionPlan: string;
    paymentExpiresAt: string | null;
    createdAt: string;
    nic: string;
    birthCertificateNo: string;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string;
    district: string;
    province: string;
    postalCode: string;
    country: string;
    updatedAt: string;
    password: string;
    idUrl: string | null;
  };
}

export interface InstituteQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  userId?: string;
  role?: string;
  instituteId?: string;
  classId?: string;
}

class InstituteApi {
  async getUserInstitutes(userId: string, params?: { userId?: string; role?: string }, forceRefresh = false): Promise<Institute[]> {
    console.log('Fetching user institutes for user:', userId, { forceRefresh });
    const endpoint = `/users/${userId}/institutes`;
    
    return enhancedCachedClient.get<Institute[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 120,
      useStaleWhileRevalidate: true,
      userId: params?.userId || userId,
      role: params?.role
    });
  }

  async getInstituteClasses(
    instituteId: string, 
    params?: InstituteQueryParams, 
    forceRefresh = false
  ): Promise<ApiResponse<Class[]>> {
    console.log('Fetching institute classes:', instituteId, params, { forceRefresh });
    const endpoint = '/institute-classes';
    const requestParams = { instituteId, ...params };
    
    return enhancedCachedClient.get<ApiResponse<Class[]>>(endpoint, requestParams, { 
      forceRefresh,
      ttl: 60,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      role: params?.role
    });
  }

  async getInstituteClassSubjects(
    instituteId: string, 
    params?: { classId?: string; userId?: string; role?: string }, 
    forceRefresh = false
  ): Promise<any[]> {
    const endpoint = `/institute-class-subjects/institute/${instituteId}`;
    
    console.log('Fetching institute class subjects:', endpoint, { forceRefresh });
    
    return enhancedCachedClient.get<any[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 60,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      classId: params?.classId,
      role: params?.role
    });
  }

  async getInstituteUsers(instituteId: string, params?: { userId?: string; role?: string }, forceRefresh = false): Promise<InstituteUser[]> {
    console.log('Fetching institute users for institute:', instituteId, { forceRefresh });
    const endpoint = `/institute-users/institute/${instituteId}/users`;
    
    return enhancedCachedClient.get<InstituteUser[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 30,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      role: params?.role
    });
  }

  async getInstituteUsersByType(instituteId: string, userType: 'STUDENT' | 'TEACHER' | 'ATTENDANCE_MARKER', params?: { userId?: string; role?: string }, forceRefresh = false): Promise<{
    data: Array<{
      id: string;
      name: string;
      email?: string;
      addressLine1?: string;
      addressLine2?: string;
      phoneNumber?: string;
      imageUrl?: string;
      dateOfBirth?: string;
      userIdByInstitute?: string | null;
      verifiedBy?: string | null;
      fatherId?: string;
      motherId?: string;
      guardianId?: string;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    console.log('Fetching institute users by type:', { instituteId, userType, forceRefresh });
    const endpoint = `/institute-users/institute/${instituteId}/users/${userType}`;
    
    return enhancedCachedClient.get(endpoint, undefined, { 
      forceRefresh,
      ttl: 30,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      role: params?.role
    });
  }

  async getInstituteStudentsByClassAndSubject(
    instituteId: string, 
    classId: string, 
    subjectId: string, 
    queryParams?: { page?: number; limit?: number; userId?: string; role?: string }, 
    forceRefresh = false
  ): Promise<{
    data: Array<{
      id: string;
      name: string;
      email?: string;
      addressLine1?: string;
      addressLine2?: string;
      phoneNumber?: string;
      imageUrl?: string;
      dateOfBirth?: string;
      userIdByInstitute?: string | null;
      fatherId?: string;
      motherId?: string;
      guardianId?: string;
      emergencyContact?: string;
      medicalConditions?: string;
      allergies?: string;
      studentId?: string;
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    console.log('Fetching students for class and subject:', { instituteId, classId, subjectId, forceRefresh });
    const page = queryParams?.page || 1;
    const limit = queryParams?.limit || 10;
    const endpoint = `/institute-users/institute/${instituteId}/users/STUDENT/class/${classId}/subject/${subjectId}`;
    
    return enhancedCachedClient.get(endpoint, { page, limit }, { 
      forceRefresh,
      ttl: 30,
      useStaleWhileRevalidate: true,
      userId: queryParams?.userId,
      instituteId,
      classId,
      subjectId,
      role: queryParams?.role
    });
  }

  async getClassSubjects(instituteId: string, classId: string, params?: { userId?: string; role?: string }, forceRefresh = false): Promise<ApiResponse<any[]>> {
    console.log('Fetching class subjects:', { instituteId, classId, forceRefresh });
    const endpoint = `/institutes/${instituteId}/classes/${classId}/subjects`;
    
    return enhancedCachedClient.get<ApiResponse<any[]>>(endpoint, undefined, { 
      forceRefresh,
      ttl: 60,
      useStaleWhileRevalidate: true,
      userId: params?.userId,
      instituteId,
      classId,
      role: params?.role
    });
  }

  // Enhanced method to check if data is already cached
  async hasInstituteDataCached(userId: string, instituteId?: string, params?: { userId?: string; role?: string }): Promise<{
    institutes: boolean;
    classes: boolean;
    subjects: boolean;
    users: boolean;
  }> {
    const results = {
      institutes: false,
      classes: false,
      subjects: false,
      users: false
    };

    try {
      // Check if institutes are cached
      results.institutes = await enhancedCachedClient.hasCache(`/users/${userId}/institutes`, undefined, {
        userId: params?.userId || userId,
        role: params?.role
      });

      if (instituteId) {
        // Check if classes are cached
        results.classes = await enhancedCachedClient.hasCache('/institute-classes', { instituteId }, {
          userId: params?.userId,
          instituteId,
          role: params?.role
        });

        // Check if subjects are cached
        results.subjects = await enhancedCachedClient.hasCache(`/institute-class-subjects/institute/${instituteId}`, undefined, {
          userId: params?.userId,
          instituteId,
          role: params?.role
        });

        // Check if users are cached
        results.users = await enhancedCachedClient.hasCache(`/institute-users/institute/${instituteId}/users`, undefined, {
          userId: params?.userId,
          instituteId,
          role: params?.role
        });
      }
    } catch (error) {
      console.warn('Error checking cached data:', error);
    }

    return results;
  }

  // Method to get all cached data without API calls
  async getCachedInstituteData(userId: string, instituteId?: string, params?: { userId?: string; role?: string }): Promise<{
    institutes: Institute[] | null;
    classes: ApiResponse<Class[]> | null;
    subjects: any[] | null;
    users: InstituteUser[] | null;
  }> {
    const data = {
      institutes: null as Institute[] | null,
      classes: null as ApiResponse<Class[]> | null,
      subjects: null as any[] | null,
      users: null as InstituteUser[] | null
    };

    try {
      // Get cached institutes
      data.institutes = await enhancedCachedClient.getCachedOnly<Institute[]>(`/users/${userId}/institutes`, undefined, {
        userId: params?.userId || userId,
        role: params?.role
      });

      if (instituteId) {
        // Get cached classes
        data.classes = await enhancedCachedClient.getCachedOnly<ApiResponse<Class[]>>('/institute-classes', { instituteId }, {
          userId: params?.userId,
          instituteId,
          role: params?.role
        });

        // Get cached subjects
        data.subjects = await enhancedCachedClient.getCachedOnly<any[]>(`/institute-class-subjects/institute/${instituteId}`, undefined, {
          userId: params?.userId,
          instituteId,
          role: params?.role
        });

        // Get cached users
        data.users = await enhancedCachedClient.getCachedOnly<InstituteUser[]>(`/institute-users/institute/${instituteId}/users`, undefined, {
          userId: params?.userId,
          instituteId,
          role: params?.role
        });
      }
    } catch (error) {
      console.warn('Error getting cached institute data:', error);
    }

    return data;
  }

  // Method to preload all institute data
  async preloadInstituteData(userId: string, instituteIds: string[], params?: { userId?: string; role?: string }): Promise<void> {
    try {
      console.log('Preloading institute data for institutes:', instituteIds);

      // Preload user institutes first
      await enhancedCachedClient.get<Institute[]>(`/users/${userId}/institutes`, undefined, {
        ttl: 120,
        userId: params?.userId || userId,
        role: params?.role
      });

      // Preload data for each institute
      const preloadPromises = instituteIds.map(async (instituteId) => {
        await Promise.all([
          enhancedCachedClient.get('/institute-classes', { instituteId }, {
            ttl: 60,
            userId: params?.userId,
            instituteId,
            role: params?.role
          }),
          enhancedCachedClient.get(`/institute-class-subjects/institute/${instituteId}`, undefined, {
            ttl: 60,
            userId: params?.userId,
            instituteId,
            role: params?.role
          }),
          enhancedCachedClient.get(`/institute-users/institute/${instituteId}/users`, undefined, {
            ttl: 30,
            userId: params?.userId,
            instituteId,
            role: params?.role
          })
        ]);
      });

      await Promise.allSettled(preloadPromises);
      console.log('Institute data preloading completed');
    } catch (error) {
      console.warn('Error preloading institute data:', error);
    }
  }

  // Method to force refresh all institute data
  async refreshAllInstituteData(userId: string, instituteId?: string, params?: { userId?: string; role?: string }): Promise<void> {
    console.log('Force refreshing all institute data...', { userId, instituteId });
    
    // Refresh user institutes
    await this.getUserInstitutes(userId, params, true);
    
    if (instituteId) {
      // Refresh all data for the institute in parallel
      await Promise.all([
        this.getInstituteClasses(instituteId, { ...params, instituteId }, true),
        this.getInstituteClassSubjects(instituteId, params, true),
        this.getInstituteUsers(instituteId, params, true)
      ]);
    }
  }
}

export const instituteApi = new InstituteApi();
