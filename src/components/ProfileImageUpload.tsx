
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Upload, User, X, Check } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getBaseUrl, getApiHeaders } from '@/contexts/utils/auth.api';

interface ProfileImageUploadProps {
  currentImageUrl?: string | null;
  onImageUpdate: (newImageUrl: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  onImageUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.includes('png')) {
        toast({
          title: "Invalid file type",
          description: "Only PNG files are supported.",
          variant: "destructive"
        });
        return;
      }

      // Check file size (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        toast({
          title: "File too large",
          description: "Maximum file size is 1MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || '');
        setShowUploadDialog(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = {
      unit: '%' as const,
      width: 50,
      height: 50,
      x: 25,
      y: 25
    };
    setCrop(crop);
  }, []);

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png', 1);
    });
  };

  const handleUpload = async () => {
    if (!completedCrop || !imgRef.current || !selectedFile || !user) {
      console.log('Missing required data for upload:', {
        completedCrop: !!completedCrop,
        imgRef: !!imgRef.current,
        selectedFile: !!selectedFile,
        user: !!user
      });
      return;
    }

    try {
      setUploading(true);
      console.log('Starting image upload process...');

      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      console.log('Cropped image blob created:', croppedImageBlob.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', croppedImageBlob, selectedFile.name);

      const baseUrl = getBaseUrl();
      const apiHeaders = getApiHeaders();
      
      // Remove Content-Type header to let browser set it automatically for FormData
      const { 'Content-Type': _, ...headersWithoutContentType } = apiHeaders;
      
      console.log('Making upload request to:', `${baseUrl}/users/${user.id}/profile-image`);
      console.log('Request headers:', headersWithoutContentType);

      const response = await fetch(`${baseUrl}/users/${user.id}/profile-image`, {
        method: 'POST',
        headers: headersWithoutContentType,
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with response:', errorText);
        throw new Error(`Upload failed with status: ${response.status}. ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload successful, received:', result);
      
      if (result.success && result.data?.publicUrl) {
        onImageUpdate(result.data.publicUrl);
        toast({
          title: "Success",
          description: "Profile image updated successfully!"
        });
        handleCloseDialog();
      } else {
        console.error('Unexpected response format:', result);
        throw new Error(result.message || 'Upload failed - unexpected response format');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setImageSrc('');
    setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
          <AvatarImage src={currentImageUrl || ''} alt="Profile" />
          <AvatarFallback className="text-lg sm:text-xl">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
        {currentImageUrl && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 rounded-full h-8 w-8 p-0"
            onClick={() => {
              onImageUpdate('');
              toast({
                title: "Image Removed",
                description: "Profile image has been removed."
              });
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Change Photo
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,image/png"
        onChange={onSelectFile}
        className="hidden"
      />

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Image</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imageSrc && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    style={{ maxHeight: '400px', maxWidth: '100%' }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!completedCrop || uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileImageUpload;
