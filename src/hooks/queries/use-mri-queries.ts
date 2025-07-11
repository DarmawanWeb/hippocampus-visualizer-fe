import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';

// Types
interface MriScan {
  id: number;
  patientId: number;
  doctorId: number;
  originalPath: string;
  segmentationPath: string | null;
  resultsJson: {
    volumes?: {
      anterior: number;
      posterior: number;
      total: number;
    };
    status?: string;
    patient_id?: string;
    timestamp?: string;
    output_files?: {
      report_dicom: string;
      report_png: string;
      slice_images: string[];
      nifti_original?: string;
      nifti_segmentation?: string;
      json_results: string;
    };
  } | null;
  status: 'processing' | 'completed' | 'failed';
  volumes: {
    anterior: number;
    posterior: number;
    total: number;
  } | null;
  processingStarted: string | null;
  processingCompleted: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    name: string;
    email: string;
  };
  doctor?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ProcessMRIRequest {
  patientId: number;
  doctorId: number;
  mriFile: File;
}

// MRI Service Class
class MriService {
  private static instance: MriService;

  static getInstance() {
    if (!MriService.instance) MriService.instance = new MriService();
    return MriService.instance;
  }

  // Get all MRI scans
  async getAllScans(): Promise<MriScan[]> {
    const response = await api.get<ApiResponse<MriScan[]>>('/mri');
    return response.data.data;
  }

  // Get MRI scan by ID
  async getScanById(id: number): Promise<MriScan> {
    const response = await api.get<ApiResponse<MriScan>>(`/mri/${id}`);
    return response.data.data;
  }

  // Get scans by patient
  async getScansByPatient(patientId: number): Promise<MriScan[]> {
    const response = await api.get<ApiResponse<MriScan[]>>(
      `/mri/patient/${patientId}`,
    );
    return response.data.data;
  }

  // Get scans by doctor
  async getScansByDoctor(doctorId: number): Promise<MriScan[]> {
    const response = await api.get<ApiResponse<MriScan[]>>(
      `/mri/doctor/${doctorId}`,
    );
    return response.data.data;
  }

  // Process MRI with file upload
  async processMRI(data: ProcessMRIRequest): Promise<MriScan> {
    const formData = new FormData();
    formData.append('mriFile', data.mriFile);
    formData.append('patientId', data.patientId.toString());
    formData.append('doctorId', data.doctorId.toString());

    const response = await api.post<ApiResponse<MriScan>>(
      '/mri/process',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data.data;
  }

  // Delete MRI scan
  async deleteScan(id: number): Promise<void> {
    await api.delete<ApiResponse<void>>(`/mri/${id}`);
  }

  // Update MRI scan (optional - for future use)
  async updateScan(
    id: number,
    updateData: Partial<Pick<MriScan, 'patientId' | 'doctorId'>>,
  ): Promise<MriScan> {
    const response = await api.put<ApiResponse<MriScan>>(
      `/mri/${id}`,
      updateData,
    );
    return response.data.data;
  }

  // Get MRI scan statistics
  async getStatistics(): Promise<{
    totalScans: number;
    completedScans: number;
    processingScans: number;
    failedScans: number;
    uniquePatients: number;
    uniqueDoctors: number;
  }> {
    const response =
      await api.get<
        ApiResponse<{
          totalScans: number;
          completedScans: number;
          processingScans: number;
          failedScans: number;
          uniquePatients: number;
          uniqueDoctors: number;
        }>
      >('/mri/statistics');
    return response.data.data;
  }
}

// Export singleton instance
export const mriService = MriService.getInstance();

// React Query hooks
export const useGetAllMriScans = () => {
  return useQuery({
    queryKey: ['mri-scans'],
    queryFn: () => mriService.getAllScans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useGetMriScan = (id: number) => {
  return useQuery({
    queryKey: ['mri-scan', id],
    queryFn: () => mriService.getScanById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGetMriScansByPatient = (patientId: number) => {
  return useQuery({
    queryKey: ['mri-scans', 'patient', patientId],
    queryFn: () => mriService.getScansByPatient(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetMriScansByDoctor = (doctorId: number) => {
  return useQuery({
    queryKey: ['mri-scans', 'doctor', doctorId],
    queryFn: () => mriService.getScansByDoctor(doctorId),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetMriStatistics = () => {
  return useQuery({
    queryKey: ['mri-statistics'],
    queryFn: () => mriService.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProcessMRI = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessMRIRequest) => mriService.processMRI(data),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['mri-scans'] });
      queryClient.invalidateQueries({ queryKey: ['mri-statistics'] });
      queryClient.invalidateQueries({
        queryKey: ['mri-scans', 'patient', data.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['mri-scans', 'doctor', data.doctorId],
      });

      toast.success('MRI processing started successfully!', {
        description: `Scan ID: ${data.id} is now being processed.`,
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to process MRI';
      toast.error('Failed to process MRI', {
        description: errorMessage,
      });
    },
  });
};

export const useDeleteMriScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mriService.deleteScan(id),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['mri-scans'] });
      queryClient.invalidateQueries({ queryKey: ['mri-statistics'] });

      toast.success('MRI scan deleted successfully!');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete MRI scan';
      toast.error('Failed to delete MRI scan', {
        description: errorMessage,
      });
    },
  });
};

export const useUpdateMriScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updateData,
    }: {
      id: number;
      updateData: Partial<Pick<MriScan, 'patientId' | 'doctorId'>>;
    }) => mriService.updateScan(id, updateData),
    onSuccess: (data) => {
      // Update specific scan in cache
      queryClient.setQueryData(['mri-scan', data.id], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['mri-scans'] });
      queryClient.invalidateQueries({
        queryKey: ['mri-scans', 'patient', data.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ['mri-scans', 'doctor', data.doctorId],
      });

      toast.success('MRI scan updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update MRI scan';
      toast.error('Failed to update MRI scan', {
        description: errorMessage,
      });
    },
  });
};

// Utility hooks for polling (useful for tracking processing status)
export const usePollingMriScan = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['mri-scan', id, 'polling'],
    queryFn: () => mriService.getScanById(id),
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      // Stop polling if scan is completed or failed
      if (
        query.state.data?.status === 'completed' ||
        query.state.data?.status === 'failed'
      ) {
        return false;
      }
      // Poll every 5 seconds for processing scans
      return 5000;
    },
  });
};

// Export types for use in components
export type { MriScan, ProcessMRIRequest };
