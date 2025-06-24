"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, BookOpen, ClipboardCheck, CheckCircle, Clock, Video, FileText, Award, AlertCircle } from "lucide-react"
import type { WorkBrief } from "@/lib/work-briefs-database"
import type { Shift } from "@/lib/shifts-database"
import { useToast } from "@/components/ui/use-toast"

interface ViewBriefDialogProps {
  brief: WorkBrief
  shift?: Shift
  isManager: boolean
  onClose: () => void
}

export default function ViewBriefDialog({ brief, shift, isManager, onClose }: ViewBriefDialogProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("video")
  const [testStarted, setTestStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [testCompleted, setTestCompleted] = useState(false)
  const [testScore, setTestScore] = useState(0)

  // Mock completion status for demo
  const [completionStatus, setCompletionStatus] = useState({
    video: false,
    brand: false,
    test: false,
  })

  const handleVideoComplete = () => {
    setCompletionStatus({ ...completionStatus, video: true })
    toast({
      title: "Video completed",
      description: "Training video marked as watched",
    })
  }

  const handleBrandComplete = () => {
    setCompletionStatus({ ...completionStatus, brand: true })
    toast({
      title: "Brand guide completed",
      description: "Brand information marked as read",
    })
  }

  const startTest = () => {
    if (!completionStatus.video || !completionStatus.brand) {
      toast({
        title: "Complete prerequisites first",
        description: "Please watch the training video and read the brand guide before taking the test",
        variant: "destructive",
      })
      return
    }
    setTestStarted(true)
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(brief.test_questions.length).fill(-1))
  }

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < brief.test_questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      submitTest()
    }
  }

  const submitTest = () => {
    let correct = 0
    brief.test_questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++
      }
    })

    const score = Math.round((correct / brief.test_questions.length) * 100)
    setTestScore(score)
    setTestCompleted(true)

    if (score >= brief.passing_score) {
      setCompletionStatus({ ...completionStatus, test: true })
      toast({
        title: "Test passed!",
        description: `You scored ${score}% - Well done!`,
      })
    } else {
      toast({
        title: "Test failed",
        description: `You scored ${score}%. You need ${brief.passing_score}% to pass. Try again!`,
        variant: "destructive",
      })
    }
  }

  const retakeTest = () => {
    setTestStarted(false)
    setTestCompleted(false)
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(brief.test_questions.length).fill(-1))
  }

  const overallProgress = (Object.values(completionStatus).filter(Boolean).length / 3) * 100

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>{brief.title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {brief.brand_name} • {shift?.title}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={brief.status === "published" ? "default" : "secondary"}>{brief.status}</Badge>
            {!isManager && (
              <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                {overallProgress === 100 ? "Completed" : `${Math.round(overallProgress)}% Complete`}
              </Badge>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Progress Overview for Workers */}
        {!isManager && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Training Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    {completionStatus.video ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Training Video</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {completionStatus.brand ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Brand Guide</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {completionStatus.test ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Knowledge Test</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brief Description */}
        {brief.description && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">{brief.description}</p>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="video" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Training Video</span>
              {!isManager && completionStatus.video && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Brand Guide</span>
              {!isManager && completionStatus.brand && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4" />
              <span>Knowledge Test</span>
              {!isManager && completionStatus.test && <CheckCircle className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
          </TabsList>

          {/* Training Video Tab */}
          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>Training Video</span>
                  {brief.video_duration && <Badge variant="outline">{brief.video_duration} minutes</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.training_video_url ? (
                  <>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-muted-foreground">Video Player</p>
                        <p className="text-xs text-muted-foreground">{brief.training_video_url}</p>
                      </div>
                    </div>

                    {brief.video_description && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{brief.video_description}</p>
                      </div>
                    )}

                    {!isManager && !completionStatus.video && (
                      <Button onClick={handleVideoComplete} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Watched
                      </Button>
                    )}

                    {!isManager && completionStatus.video && (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Video Completed</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground">No training video uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Guide Tab */}
          <TabsContent value="brand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Brand Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.brand_information ? (
                  <>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{brief.brand_information}</div>
                    </div>

                    {brief.brand_guidelines && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Additional Guidelines</h4>
                        <p className="text-sm">{brief.brand_guidelines}</p>
                      </div>
                    )}

                    {brief.key_messages && brief.key_messages.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Key Messages</h4>
                        <ul className="text-sm space-y-1">
                          {brief.key_messages.map((message, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>{message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {brief.dos_and_donts && (
                      <div className="grid grid-cols-2 gap-4">
                        {brief.dos_and_donts.dos.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 text-green-800">✓ Do's</h4>
                            <ul className="text-sm space-y-1">
                              {brief.dos_and_donts.dos.map((item, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {brief.dos_and_donts.donts.length > 0 && (
                          <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 text-red-800">✗ Don'ts</h4>
                            <ul className="text-sm space-y-1">
                              {brief.dos_and_donts.donts.map((item, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {!isManager && !completionStatus.brand && (
                      <Button onClick={handleBrandComplete} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}

                    {!isManager && completionStatus.brand && (
                      <div className="flex items-center justify-center space-x-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Brand Guide Completed</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground">No brand information available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Test Tab */}
          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ClipboardCheck className="h-5 w-5" />
                  <span>Knowledge Test</span>
                  {brief.test_questions.length > 0 && (
                    <Badge variant="outline">{brief.test_questions.length} questions</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.test_questions.length > 0 ? (
                  <>
                    {!testStarted && !testCompleted && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Test Information</h4>
                          <div className="text-sm space-y-1">
                            <p>• {brief.test_questions.length} questions</p>
                            <p>• {brief.passing_score}% required to pass</p>
                            <p>• {brief.max_attempts} attempts allowed</p>
                            <p>• Complete video and brand guide first</p>
                          </div>
                        </div>

                        {!isManager && (
                          <Button
                            onClick={startTest}
                            className="w-full"
                            disabled={!completionStatus.video || !completionStatus.brand}
                          >
                            <ClipboardCheck className="h-4 w-4 mr-2" />
                            Start Test
                          </Button>
                        )}
                      </div>
                    )}

                    {testStarted && !testCompleted && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            Question {currentQuestion + 1} of {brief.test_questions.length}
                          </h4>
                          <Progress value={(currentQuestion / brief.test_questions.length) * 100} className="w-32" />
                        </div>

                        <Card>
                          <CardContent className="pt-4">
                            <h5 className="font-medium mb-4">{brief.test_questions[currentQuestion].question}</h5>
                            <div className="space-y-2">
                              {brief.test_questions[currentQuestion].options.map((option, index) => (
                                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="answer"
                                    checked={selectedAnswers[currentQuestion] === index}
                                    onChange={() => selectAnswer(index)}
                                  />
                                  <span className="text-sm">{option}</span>
                                </label>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(currentQuestion - 1)}
                          >
                            Previous
                          </Button>
                          <Button onClick={nextQuestion} disabled={selectedAnswers[currentQuestion] === -1}>
                            {currentQuestion === brief.test_questions.length - 1 ? "Submit Test" : "Next"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {testCompleted && (
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-4 text-center">
                            <div
                              className={`text-6xl font-bold mb-2 ${testScore >= brief.passing_score ? "text-green-600" : "text-red-600"}`}
                            >
                              {testScore}%
                            </div>
                            <h4 className="font-medium mb-2">
                              {testScore >= brief.passing_score ? "Test Passed!" : "Test Failed"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              You scored {testScore}% (Required: {brief.passing_score}%)
                            </p>
                          </CardContent>
                        </Card>

                        {testScore < brief.passing_score && (
                          <Button onClick={retakeTest} className="w-full">
                            Retake Test
                          </Button>
                        )}
                      </div>
                    )}

                    {isManager && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Test Questions Preview</h4>
                        <div className="space-y-2">
                          {brief.test_questions.map((question, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{index + 1}.</span> {question.question}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-muted-foreground">No test questions created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </>
  )
}
