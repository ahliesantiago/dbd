'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, ListTodo, ChevronRight } from 'lucide-react'
import { AppWrapper } from '@/components/app-wrapper'
import { Block, BlockCreateInput, BlockType, Priority, RecurrenceType } from '@shared/types/types'
import { blocksApi } from '@/lib/api'

interface BlockFormData {
  title: string
  type: BlockType
  description: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  tags: string[]
  categories: string[]
  priority: Priority
  recurrence: RecurrenceType
}

const initialFormData: BlockFormData = {
  title: '',
  type: 'task',
  description: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  tags: [],
  categories: [],
  priority: 'none',
  recurrence: 'one-time',
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<BlockFormData>(initialFormData)
  const [creating, setCreating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCreateForm) {
        setShowCreateForm(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowCreateForm(false)
      }
    }

    if (showCreateForm) {
      // Close modal on Escape key press
      document.addEventListener('keydown', handleEscape)
      // Close modal on backdrop click
      document.addEventListener('click', handleClickOutside)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [showCreateForm])

  // Load blocks on component mount
  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    try {
      setLoading(true)
      const response = await blocksApi.getBlocks()
      setBlocks(response.data || [])
      setError(null)
    } catch (err) {
      console.error('Error loading blocks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load blocks')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleQuickAdd()
  }

  const handleQuickAdd = async () => {
    if (!formData.title.trim()) return

    try {
      setCreating(true)

      const blockData: BlockCreateInput = {
        title: formData.title.trim(),
        type: formData.type,
        priority: 'none',
        recurrence: 'one-time',
      }

      const response = await blocksApi.createBlock(blockData)

      if (response.success && response.data) {
        setBlocks(prev => [response.data!, ...prev])
        setFormData(prev => ({ ...prev, title: '', type: 'task' }))
      }
    } catch (err) {
      console.error('Error creating block:', err)
      setError(err instanceof Error ? err.message : 'Failed to create block')
    } finally {
      setCreating(false)
    }
  }

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setCreating(true)

      const blockData: BlockCreateInput = {
        title: formData.title,
        type: formData.type,
        description: formData.description || undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        categories: formData.categories.length > 0 ? formData.categories : undefined,
        priority: formData.priority,
        recurrence: formData.recurrence,
      }

      const response = await blocksApi.createBlock(blockData)

      if (response.success && response.data) {
        setBlocks(prev => [response.data!, ...prev])
        setFormData(initialFormData)
        setShowCreateForm(false)
      }
    } catch (err) {
      console.error('Error creating block:', err)
      setError(err instanceof Error ? err.message : 'Failed to create block')
    } finally {
      setCreating(false)
    }
  }

  const handleInputChange = (field: keyof BlockFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({
      ...prev,
      tags
    }))
  }

  const handleCategoriesChange = (value: string) => {
    const categories = value.split(',').map(cat => cat.trim()).filter(cat => cat.length > 0)
    setFormData(prev => ({
      ...prev,
      categories
    }))
  }

  return (
    <AppWrapper>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Blocks
            </h1>
            <p className="text-muted-foreground">
              Manage your tasks, habits, events, and appointments
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickAddSubmit} className='flex items-center justify-between mx-4 my-2 border border-border rounded-lg'>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Add block"
            className='flex-1 px-4 py-2 focus:outline-none bg-transparent'
            disabled={creating}
          />
          <div className="flex items-center">
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as BlockType }))}
              className="p-2 text-sm border-none focus:outline-none mr-1"
              disabled={creating}
            >
              <option value="task">Task</option>
              <option value="habit">Habit</option>
              <option value="event">Event</option>
              <option value="appointment">Appointment</option>
            </select>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="flex items-center justify-center p-2 mr-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Open detailed form"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Content */}
        <div className="flex-1 p-6">
          {error && (
            <div className="mb-6 p-4 bg-destructive/15 border border-destructive/20 rounded-lg text-destructive">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Create Form Modal */}
          {showCreateForm && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 pb-20 sm:p-6 sm:pb-6"
            >
              <div
                ref={modalRef}
                className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[calc(100vh-8rem)] sm:max-h-[85vh] flex flex-col my-auto"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                {/* Fixed Header */}
                <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
                  <h2 id="modal-title" className="text-xl font-semibold">Create New Block</h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="p-1 rounded-lg hover:bg-accent transition-colors"
                    aria-label="Close modal"
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                  <form id="create-block-form" onSubmit={handleCreateBlock} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="block-title" className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      id="block-title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter block title"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label htmlFor="block-type" className="block text-sm font-medium mb-1">Type *</label>
                    <select
                      id="block-type"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value as BlockType)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="task">Task</option>
                      <option value="habit">Habit</option>
                      <option value="event">Event</option>
                      <option value="appointment">Appointment</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="block-description" className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      id="block-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Optional description or notes"
                    />
                  </div>

                  {/* Priority and Recurrence */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="block-priority" className="block text-sm font-medium mb-1">Priority</label>
                      <select
                        id="block-priority"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="none">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="block-recurrence" className="block text-sm font-medium mb-1">Recurrence</label>
                      <select
                        id="block-recurrence"
                        value={formData.recurrence}
                        onChange={(e) => handleInputChange('recurrence', e.target.value as RecurrenceType)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="one-time">One-time</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="occasional">Occasional</option>
                        <option value="frequent">Frequent</option>
                      </select>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="block-start-date" className="block text-sm font-medium mb-1">
                        Start Date{' '}
                        <span className='text-muted-foreground'>(optional)</span>
                      </label>
                      <input
                        id="block-start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="block-end-date" className="block text-sm font-medium mb-1">
                        End Date{' '}
                        <span className='text-muted-foreground'>(optional)</span>
                      </label>
                      <input
                        id="block-end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="block-start-time" className="block text-sm font-medium mb-1">
                        Start Time{' '}
                        <span className='text-muted-foreground'>(optional)</span>
                      </label>
                      <input
                        id="block-start-time"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="block-end-time" className="block text-sm font-medium mb-1">
                        End Time{' '}
                        <span className='text-muted-foreground'>(optional)</span>
                      </label>
                      <input
                        id="block-end-time"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Tags and Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="block-tags" className="block text-sm font-medium mb-1">Tags</label>
                      <input
                        id="block-tags"
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., urgent, personal, work"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas</p>
                    </div>
                    <div>
                      <label htmlFor="block-categories" className="block text-sm font-medium mb-1">Categories</label>
                      <input
                        id="block-categories"
                        type="text"
                        value={formData.categories.join(', ')}
                        onChange={(e) => handleCategoriesChange(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Work, Health, Learning"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate multiple categories with commas</p>
                    </div>
                  </div>

                  </form>
                </div>

                {/* Fixed Footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-card">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="create-block-form"
                      disabled={creating || !formData.title.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleCreateBlock}
                    >
                      {creating ? 'Creating...' : 'Create Block'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blocks List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading blocks...</div>
            </div>
          ) : (
            <>
              {blocks.length === 0 ? (
                <div className="text-center py-12">
                  <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No blocks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first block to get started with organizing your tasks and events.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Block</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Recent Blocks</h2>
                  <div className="grid gap-4">
                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        className="border-b mx-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p>{block.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppWrapper>
  )
}
