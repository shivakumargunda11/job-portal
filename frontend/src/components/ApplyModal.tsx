import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

interface ApplyModalProps {
  opportunity: {
    id: number
    title: string
    organization: string
    category?: string
  }
  onClose: () => void
  onSuccess: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_EXTS = ['.pdf', '.doc', '.docx']

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

export default function ApplyModal({ opportunity, onClose, onSuccess }: ApplyModalProps) {
  const { user } = useAuth()
  const nav = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [coverNote, setCoverNote] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateAndSetFile = (selectedFile: File) => {
    setError(null)
    const name = selectedFile.name.toLowerCase()
    const hasValidExt = ALLOWED_EXTS.some(ext => name.endsWith(ext))

    if (!hasValidExt) {
      setError('Invalid file type. Only PDF, DOC, and DOCX files are allowed.')
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size (${formatFileSize(selectedFile.size)}) exceeds the maximum limit of 5 MB.`)
      return
    }

    setFile(selectedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Resume upload is mandatory. Please attach your resume before submitting.')
      return
    }

    setUploading(true)
    setError(null)
    setProgress(15)

    const formData = new FormData()
    formData.append('resume', file)
    if (coverNote.trim()) {
      formData.append('coverNote', coverNote.trim())
    }

    try {
      await api.post(`/applications/apply/${opportunity.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setProgress(Math.max(percent, 20))
          }
        },
      })

      setProgress(100)
      setSuccess(true)
      onSuccess()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to submit application'
      setError(typeof msg === 'string' ? msg : 'Failed to submit application. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Apply for Opportunity</h2>
            <p className="modal-subtitle">
              {opportunity.title} &bull; <span style={{ color: 'var(--primary)' }}>{opportunity.organization}</span>
            </p>
          </div>
          <button className="modal-close" onClick={onClose} disabled={uploading}>
            &times;
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--success)' }}>
              Application Submitted Successfully!
            </h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: 24 }}>
              Your resume has been uploaded and sent to <strong>{opportunity.organization}</strong>. You can track your application status anytime in your student dashboard.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose()
                  nav('/dashboard/student')
                }}
              >
                📋 View in My Applications
              </button>
              <button className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Student details display */}
            <div
              style={{
                background: 'var(--bg3)',
                padding: '12px 16px',
                borderRadius: 10,
                marginBottom: 20,
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.fullName || user?.username}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Applying as Student &bull; {user?.email}</div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Resume Upload Field (Mandatory) */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Resume / CV (PDF, DOC, DOCX) <span style={{ color: 'var(--danger)' }}>*</span></span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Max 5 MB</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={uploading}
              />

              {!file ? (
                <div
                  className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="upload-icon">📄</div>
                  <div className="upload-prompt">
                    Drag & drop your resume here, or <span>browse</span>
                  </div>
                  <div className="upload-hint">Supports PDF, DOC, and DOCX (Up to 5 MB)</div>
                </div>
              ) : (
                <div className="file-preview-card">
                  <div className="file-preview-info">
                    <div className="file-preview-icon">
                      {file.name.toLowerCase().endsWith('.pdf') ? '📕' : '📘'}
                    </div>
                    <div>
                      <div className="file-preview-name" title={file.name}>
                        {file.name}
                      </div>
                      <div className="file-preview-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <div className="file-preview-actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      title="Select a different resume"
                    >
                      ✏️ Change
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleRemoveFile}
                      disabled={uploading}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Cover Note */}
            <div className="form-group">
              <label className="form-label">
                Cover Note / Message <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Share a brief introduction or why you are a great fit..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                disabled={uploading}
                style={{ minHeight: 80 }}
              />
            </div>

            {/* Upload progress indicator */}
            {uploading && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text2)', marginBottom: 6 }}>
                  <span>Uploading resume & submitting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={uploading}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !file}
                style={{ minWidth: 160 }}
              >
                {uploading ? 'Submitting...' : '🚀 Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
