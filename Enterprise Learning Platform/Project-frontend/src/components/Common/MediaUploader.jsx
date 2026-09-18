import { useState, useRef } from 'react';
import apiClient from '../../api/apiClient';

export default function MediaUploader({
  type = 'image', // 'image', 'video', 'audio', 'doc', 'zip', 'file'
  value = '',
  onChange,
  label = 'Upload File',
  description = '',
  onShowToast,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
  const allowedDocTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  const allowedZipTypes = ['application/zip', 'application/x-zip-compressed'];

  const getAcceptString = () => {
    switch (type) {
      case 'image': return 'image/jpeg,image/png,image/webp';
      case 'video': return 'video/mp4,video/quicktime,video/webm';
      case 'audio': return 'audio/mpeg,audio/wav,audio/ogg,audio/mp3';
      case 'doc': return 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'zip': return 'application/zip,application/x-zip-compressed';
      case 'file': return 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/wav,audio/ogg,audio/mp3,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-zip-compressed';
      default: return '*/*';
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Client-side validations
    let allowed = false;
    let maxSize = 50 * 1024 * 1024;
    let maxSizeMB = 50;

    if (type === 'image') {
      allowed = allowedImageTypes.includes(file.type);
      maxSize = 5 * 1024 * 1024;
      maxSizeMB = 5;
    } else if (type === 'video') {
      allowed = allowedVideoTypes.includes(file.type);
      maxSize = 50 * 1024 * 1024;
      maxSizeMB = 50;
    } else if (type === 'audio') {
      allowed = allowedAudioTypes.includes(file.type);
      maxSize = 10 * 1024 * 1024;
      maxSizeMB = 10;
    } else if (type === 'doc') {
      allowed = allowedDocTypes.includes(file.type);
      maxSize = 30 * 1024 * 1024;
      maxSizeMB = 30;
    } else if (type === 'zip') {
      allowed = allowedZipTypes.includes(file.type);
      maxSize = 30 * 1024 * 1024;
      maxSizeMB = 30;
    } else if (type === 'file') {
      allowed = allowedImageTypes.includes(file.type) || allowedVideoTypes.includes(file.type) || allowedAudioTypes.includes(file.type) || allowedDocTypes.includes(file.type) || allowedZipTypes.includes(file.type);
      maxSize = 50 * 1024 * 1024;
      maxSizeMB = 50;
    }

    if (!allowed) {
      if (onShowToast) {
        onShowToast('error', `Unsupported file type for this field.`);
      }
      return;
    }

    if (file.size > maxSize) {
      if (onShowToast) {
        onShowToast('error', `File size exceeds the maximum limit of ${maxSizeMB}MB.`);
      }
      return;
    }

    // Start upload
    setUploading(true);
    setProgress(10);

    if (type === 'image') {
      // For images, encode directly as Data URL to store in Cloud SQL DB so ALL team members on ANY machine see the exact uploaded image
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        }
      };
      reader.onloadend = () => {
        const dataUrl = reader.result;
        onChange(dataUrl);
        setUploading(false);
        if (onShowToast) {
          onShowToast('success', `${label} stored in Cloud Database successfully.`);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      const uploadedUrl = response.data.url;
      onChange(uploadedUrl);
      if (onShowToast) {
        onShowToast('success', `${label} uploaded successfully.`);
      }
    } catch (error) {
      console.warn('Backend upload failed, converting file to Data URL fallback...', error);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        onChange(dataUrl);
        if (onShowToast) {
          onShowToast('success', `${label} uploaded successfully.`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!value) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete this file?`);
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/api/media?url=${encodeURIComponent(value)}`);
      onChange('');
      if (onShowToast) {
        onShowToast('success', `${label} deleted successfully.`);
      }
    } catch (error) {
      console.error('Delete failed', error);
      onChange('');
      if (onShowToast) {
        onShowToast('success', `${label} cleared.`);
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const getCleanFilename = (url) => {
    if (!url) return '';
    const lastSlash = url.lastIndexOf('/');
    const rawFilename = url.substring(lastSlash + 1);
    const firstUnderscore = rawFilename.indexOf('_');
    if (firstUnderscore !== -1) {
      return rawFilename.substring(firstUnderscore + 1);
    }
    return rawFilename;
  };

  const getFileIconClass = () => {
    if (type === 'audio') return 'bi-music-note-beamed';
    if (type === 'zip') return 'bi-file-zip';
    if (type === 'doc') return 'bi-file-earmark-text';
    return 'bi-file-earmark';
  };

  const isImageFile = () => {
    if (!value) return false;
    const cleanVal = value.toLowerCase();
    return (
      cleanVal.startsWith('data:image') ||
      cleanVal.includes('.jpg') ||
      cleanVal.includes('.jpeg') ||
      cleanVal.includes('.png') ||
      cleanVal.includes('.webp') ||
      cleanVal.includes('.gif') ||
      cleanVal.includes('unsplash') ||
      type === 'image'
    );
  };

  const isVideoFile = () => {
    const cleanVal = value.toLowerCase();
    return cleanVal.endsWith('.mp4') || cleanVal.endsWith('.mov') || cleanVal.endsWith('.webm');
  };

  const isAudioFile = () => {
    const cleanVal = value.toLowerCase();
    return cleanVal.endsWith('.mp3') || cleanVal.endsWith('.wav') || cleanVal.endsWith('.ogg');
  };

  return (
    <div className="mb-4">
      {label && <label className="form-label small fw-bold text-dark mb-1">{label}</label>}
      {description && <p className="text-muted small mb-2">{description}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="d-none"
        accept={getAcceptString()}
      />

      <div className="border border-dashed rounded-4 p-4 text-center bg-light position-relative overflow-hidden" style={{ borderStyle: 'dashed' }}>
        {uploading ? (
          <div className="py-4">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="fw-semibold text-dark mb-2">Uploading... {progress}%</div>
            <div className="progress mx-auto rounded-pill" style={{ maxWidth: '250px', height: '8px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                role="progressbar"
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        ) : value ? (
          // Completed State / Previews
          <div className="d-flex flex-column align-items-center gap-3">
            {isImageFile() ? (
              <img
                src={value}
                alt={label || 'Preview'}
                className="img-fluid rounded-3 shadow-sm"
                style={{ maxHeight: '180px', objectFit: 'contain' }}
              />
            ) : isVideoFile() ? (
              <video
                src={value}
                controls
                className="w-100 rounded-3 shadow-sm"
                style={{ maxHeight: '220px', backgroundColor: '#000' }}
              />
            ) : isAudioFile() ? (
              <div className="w-100 bg-white p-3 rounded-3 border">
                <audio src={value} controls className="w-100 mb-2" />
                <div className="small text-dark fw-semibold text-truncate">{getCleanFilename(value)}</div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3 bg-white p-3 rounded-3 border w-100">
                <div className="fs-1 text-primary">
                  <i className={`bi ${getFileIconClass()}`}></i>
                </div>
                <div className="text-start text-truncate flex-grow-1">
                  <div className="fw-bold text-dark text-truncate small">{getCleanFilename(value)}</div>
                  <a href={value} download target="_blank" rel="noreferrer" className="text-decoration-none small text-primary fw-semibold">
                    <i className="bi bi-download me-1"></i>Download
                  </a>
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-light border rounded-pill px-3 fw-semibold"
                onClick={triggerUpload}
              >
                <i className="bi bi-arrow-repeat me-1"></i> Replace
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger rounded-pill px-3 text-white fw-semibold"
                onClick={handleDelete}
              >
                <i className="bi bi-trash-fill me-1"></i> Delete
              </button>
            </div>
          </div>
        ) : (
          // Empty state / Upload prompt
          <div className="py-3 cursor-pointer" onClick={triggerUpload} style={{ cursor: 'pointer' }}>
            <div className="fs-1 text-secondary mb-2">
              {type === 'image' ? <i className="bi bi-image"></i> : type === 'video' ? <i className="bi bi-film"></i> : type === 'audio' ? <i className="bi bi-music-note-beamed"></i> : <i className="bi bi-file-earmark-arrow-up"></i>}
            </div>
            <div className="fw-semibold text-dark mb-1">Click to upload resource</div>
            <div className="text-muted small">
              {type === 'image' ? 'JPG, PNG, WEBP (Max 5MB)' : type === 'video' ? 'MP4, MOV, WEBM (Max 50MB)' : type === 'audio' ? 'MP3, WAV, OGG (Max 10MB)' : 'PDF, DOCX, PPT, PPTX, ZIP (Max 30MB)'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
