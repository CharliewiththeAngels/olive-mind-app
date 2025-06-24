"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trash2, Upload, Video, BookOpen, ClipboardCheck } from "lucide-react"
import type { Shift } from "@/lib/shifts-database"
import type { WorkBrief, TestQuestion } from "@/lib/work-briefs-database"

interface EditBriefDialogProps {
  brief: WorkBrief
  shifts: Shift[]
  onEditBrief: (brief: any) => void
  onDeleteBrief: (briefId: string) => void
  onCancel: () => void
}

export default function EditBriefDialog({ brief, shifts, onEditBrief, onDeleteBrief, onCancel }: EditBriefDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    id: brief.id,
    shift_id: brief.shift_id,
    title: brief.title,
    description: brief.description,

    // Training Video
    training_video_url: brief.training_video_url || "",
    video_duration: brief.video_duration || 0,
    video_description: brief.video_description || "",

    // Brand Information
    brand_information: brief.brand_information || "",
    brand_guidelines: brief.brand_guidelines || "",
    key_messages: brief.key_messages || [""],
    dos: brief.dos_and_donts?.dos || [""],
    donts: brief.dos_and_donts?.donts || [""],

    // Test
    test_questions: brief.test_questions || [],
    passing_score: brief.passing_score,
    max_attempts: brief.max_attempts,

    status: brief.status,
  })

  const selectedShift = shifts.find((s) => s.id === formData.shift_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.shift_id || !formData.title) {
        throw new Error("Please fill in all required fields")
      }

      const briefData = {
        id: formData.id,
        shift_id: formData.shift_id,
        title: formData.title,
        brand_name: selectedShift?.brand_name || brief.brand_name,
        shift_title: selectedShift?.title || brief.shift_title,
        description: formData.description,

        training_video_url: formData.training_video_url || null,
        video_duration: formData.video_duration,
        video_description: formData.video_description,

        brand_information: formData.brand_information || null,
        brand_guidelines: formData.brand_guidelines,
        key_messages: formData.key_messages.filter((msg) => msg.trim()),
        dos_and_donts: {
          dos: formData.dos.filter((item) => item.trim()),
          donts: formData.donts.filter((item) => item.trim()),
        },

        test_questions: formData.test_questions,
        passing_score: formData.passing_score,
        max_attempts: formData.max_attempts,

        status: formData.status,
      }

      onEditBrief(briefData)
    } catch (error: any) {
      toast({
        title: "Error updating brief",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this work brief? This action cannot be undone.")) {
      onDeleteBrief(brief.id)
    }
  }

  // Helper functions for managing arrays (same as create dialog)
  const addKeyMessage = () => {
    setFormData({ ...formData, key_messages: [...formData.key_messages, ""] })
  }

  const updateKeyMessage = (index: number, value: string) => {
    const updated = [...formData.key_messages]
    updated[index] = value
    setFormData({ ...formData, key_messages: updated })
  }

  const removeKeyMessage = (index: number) => {
    setFormData({ ...formData, key_messages: formData.key_messages.filter((_, i) => i !== index) })
  }

  const addDo = () => {
    setFormData({ ...formData, dos: [...formData.dos, ""] })
  }

  const updateDo = (index: number, value: string) => {
    const updated = [...formData.dos]
    updated[index] = value
    setFormData({ ...formData, dos: updated })
  }

  const removeDo = (index: number) => {
    setFormData({ ...formData, dos: formData.dos.filter((_, i) => i !== index) })
  }

  const addDont = () => {
    setFormData({ ...formData, donts: [...formData.donts, ""] })
  }

  const updateDont = (index: number, value: string) => {
    const updated = [...formData.donts]
    updated[index] = value
    setFormData({ ...formData, donts: updated })
  }

  const removeDont = (index: number) => {
    setFormData({ ...formData, donts: formData.donts.filter((_, i) => i !== index) })
  }

  const addTestQuestion = () => {
    const newQuestion: TestQuestion = {
      id: Date.now().toString(),
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      explanation: "",
    }
    setFormData({ ...formData, test_questions: [...formData.test_questions, newQuestion] })
  }

  const updateTestQuestion = (index: number, field: keyof TestQuestion, value: any) => {
    const updated = [...formData.test_questions]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, test_questions: updated })
  }

  const removeTestQuestion = (index: number) => {
    setFormData({ ...formData, test_questions: formData.test_questions.filter((_, i) => i !== index) })
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Edit Work Brief</DialogTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={brief.status === "published" ? "default" : "secondary"}>{brief.status}</Badge>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shift_id">Select Shift *</Label>
            <Select value={formData.shift_id} onValueChange={(value) => setFormData({ ...formData, shift_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.title} - {shift.brand_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Brief Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Training Video Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Training Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training_video_url">Video URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="training_video_url"
                  value={formData.training_video_url}
                  onChange={(e) => setFormData({ ...formData, training_video_url: e.target.value })}
                  placeholder="https://example.com/training-video.mp4"
                />
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video_duration">Duration (minutes)</Label>
                <Input
                  id="video_duration"
                  type="number"
                  min="0"
                  value={formData.video_duration}
                  onChange={(e) => setFormData({ ...formData, video_duration: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_description">Video Description</Label>
              <Textarea
                id="video_description"
                value={formData.video_description}
                onChange={(e) => setFormData({ ...formData, video_description: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Brand Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand_information">Brand Guide (Markdown supported)</Label>
              <Textarea
                id="brand_information"
                value={formData.brand_information}
                onChange={(e) => setFormData({ ...formData, brand_information: e.target.value })}
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_guidelines">Additional Guidelines</Label>
              <Textarea
                id="brand_guidelines"
                value={formData.brand_guidelines}
                onChange={(e) => setFormData({ ...formData, brand_guidelines: e.target.value })}
                rows={3}
              />
            </div>

            {/* Key Messages */}
            <div className="space-y-2">
              <Label>Key Messages</Label>
              {formData.key_messages.map((message, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => updateKeyMessage(index, e.target.value)}
                    placeholder="Enter key message"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeKeyMessage(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addKeyMessage}>
                <Plus className="h-4 w-4 mr-2" />
                Add Key Message
              </Button>
            </div>

            {/* Dos and Don'ts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Do's</Label>
                {formData.dos.map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={item}
                      onChange={(e) => updateDo(index, e.target.value)}
                      placeholder="What should workers do?"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeDo(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDo}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Do
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Don'ts</Label>
                {formData.donts.map((item, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={item}
                      onChange={(e) => updateDont(index, e.target.value)}
                      placeholder="What should workers avoid?"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeDont(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDont}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Don't
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Test Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5" />
              <span>Knowledge Test</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: Number.parseInt(e.target.value) || 80 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_attempts">Max Attempts</Label>
                <Input
                  id="max_attempts"
                  type="number"
                  min="1"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({ ...formData, max_attempts: Number.parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>

            {/* Test Questions */}
            <div className="space-y-4">
              <Label>Test Questions</Label>
              {formData.test_questions.map((question, qIndex) => (
                <Card key={qIndex}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <Label>Question {qIndex + 1}</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeTestQuestion(qIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Input
                      value={question.question}
                      onChange={(e) => updateTestQuestion(qIndex, "question", e.target.value)}
                      placeholder="Enter your question"
                    />

                    <div className="space-y-2">
                      <Label>Answer Options</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex space-x-2 items-center">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correct_answer === oIndex}
                            onChange={() => updateTestQuestion(qIndex, "correct_answer", oIndex)}
                          />
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options]
                              newOptions[oIndex] = e.target.value
                              updateTestQuestion(qIndex, "options", newOptions)
                            }}
                            placeholder={`Option ${oIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Explanation (optional)</Label>
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) => updateTestQuestion(qIndex, "explanation", e.target.value)}
                        placeholder="Explain why this is the correct answer"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addTestQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "draft" | "published") => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Brief"
            )}
          </Button>
        </div>
      </form>
    </>
  )
}
