'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface DropZoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  error?: string | null
}

export function DropZone({ onFileSelect, selectedFile, error }: DropZoneProps) {
  const t = useTranslations('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [dragError, setDragError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSelect = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.txt')) {
        setDragError('Only .txt files are accepted.')
        return
      }
      setDragError(null)
      onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndSelect(file)
    },
    [validateAndSelect]
  )

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSelect(file)
  }

  const displayError = error ?? dragError

  return (
    <div className="flex flex-col gap-2">
      <motion.div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={{
          borderColor: isDragging
            ? 'var(--accent)'
            : selectedFile
            ? 'var(--text-muted)'
            : 'var(--border)',
          backgroundColor: isDragging ? '#141414' : 'transparent',
        }}
        transition={{ duration: 0.2 }}
        className="relative border border-dashed cursor-pointer px-6 py-12 md:px-8 md:py-16 min-h-[180px] flex flex-col items-center justify-center gap-3 select-none"
        style={{ borderColor: 'var(--border)' }}
        whileHover={{
          borderColor: 'var(--text-muted)',
          backgroundColor: '#141414',
        }}
      >
        {isDragging && (
          <motion.div
            className="absolute inset-0 border border-dashed border-[var(--accent)]"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFileChange}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="text-sm font-mono text-[var(--text-primary)] tracking-wide">
                {selectedFile.name}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {(selectedFile.size / 1024).toFixed(1)} KB — click to change
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className="text-sm font-mono text-[var(--text-primary)] tracking-wide">
                {t('dropzone')}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {t('dropzoneSub')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {displayError && (
        <span className="text-xs font-mono text-[var(--destructive)]">{displayError}</span>
      )}
    </div>
  )
}
