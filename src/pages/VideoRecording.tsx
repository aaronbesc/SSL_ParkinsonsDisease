import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Square, RotateCcw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AVAILABLE_TESTS } from '@/types/patient';

const VideoRecording = () => {
  const { id, testId } = useParams<{ id: string; testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const selectedTests = location.state?.selectedTests || [];
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  const currentTest = AVAILABLE_TESTS.find(test => test.id === selectedTests[currentTestIndex]);
  const totalTests = selectedTests.length;
  const progress = ((currentTestIndex + (completedTests.includes(selectedTests[currentTestIndex]) ? 1 : 0)) / totalTests) * 100;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast({
          title: "Camera Access Denied",
          description: "You need to allow camera access to record the test.",
          variant: "destructive",
        });
      }
    };

    startCamera();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
  setIsRecording(true);
  setIsPaused(false);
  setRecordingTime(0);

  if (videoRef.current && videoRef.current.srcObject) {
    recordedChunks.current = [];

    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
  }
};

  const handlePauseRecording = () => {
  if (!mediaRecorderRef.current) return;
  if (isPaused) {
    mediaRecorderRef.current.resume();
  } else {
    mediaRecorderRef.current.pause();
  }
  setIsPaused(!isPaused);
};

  const handleStopRecording = async () => {
  if (!mediaRecorderRef.current) return;

  return new Promise<void>((resolve) => {
    mediaRecorderRef.current!.onstop = async () => {
      setIsRecording(false);
      setIsPaused(false);

      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });

      const formData = new FormData();
      formData.append("patient_id", id || '');
      formData.append("test_name", currentTest?.name || 'unknown');
      formData.append("video", blob, "recording.webm");

      try {
        const response = await fetch('http://localhost:8000/upload-video/', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: "Recording Saved",
            description: `Saved as ${data.filename}`,
          });
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast({
          title: "Upload Error",
          description: "Could not upload the video.",
          variant: "destructive",
        });
      }

      setCompletedTests(prev => [...prev, currentTest?.id || '']);
      resolve();
    };

    mediaRecorderRef.current!.stop(); // Triggers .onstop
  });
};


  const handleNextTest = () => {
    if (currentTestIndex < selectedTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
      setRecordingTime(0);
    } else {
      navigate(`/patient/${id}/video-summary/${testId}`);
    }
  };

  const handleReset = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTestInstructions = (testType: string) => {
    switch (testType) {
      case 'stand-and-sit':
        return [
          "Start in a seated position",
          "Stand up slowly when ready",
          "Hold standing position for 3 seconds",
          "Sit back down slowly",
          "Repeat 3-5 times"
        ];
      case 'palm-open':
        return [
          "Extend both arms forward",
          "Keep palms facing camera",
          "Open and close hands repeatedly",
          "Maintain steady arm position",
          "Continue for 30 seconds"
        ];
      case 'finger-tapping':
        return [
          "Place your hand in view of the camera.",
          "Tap your index finger and thumb together as quickly as possible.",
          "Continue tapping for the duration of the test."
        ];
      case 'fist-open-close':
        return [
          "Place your hand in view of the camera.",
          "Open your hand wide, then close it into a fist.",
          "Repeat opening and closing your hand for the duration of the test."
        ];
      default:
        return ["Follow the on-screen instructions"];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/patient/${id}/test-selection`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Selection
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Video Recording</h1>
                <p className="text-muted-foreground mt-1">
                  Test {currentTestIndex + 1} of {totalTests}: {currentTest?.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{formatTime(recordingTime)}</div>
              <Progress value={progress} className="w-32 mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test List and Instructions */}
          <div className="lg:order-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedTests.map((testId, index) => {
                    const test = AVAILABLE_TESTS.find(t => t.id === testId);
                    const isCompleted = completedTests.includes(testId);
                    const isCurrent = index === currentTestIndex;

                    return (
                      <div
                        key={testId}
                        className={`p-3 rounded-lg border ${
                          isCurrent
                            ? 'border-primary bg-medical-light'
                            : isCompleted
                            ? 'border-success bg-success/10'
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{test?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Test {index + 1} of {totalTests}
                            </p>
                          </div>
                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-success" />
                          )}
                          {isCurrent && !isCompleted && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                              Current
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentTest && getTestInstructions(currentTest.id).map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-primary font-bold text-sm mt-0.5">{index + 1}.</span>
                      <span className="text-sm">{instruction}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Feed and Controls */}
          <div className="lg:col-span-2 lg:order-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Video Feed</span>
                  <Badge variant="secondary" className={
                    isRecording
                      ? isPaused
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-destructive text-destructive-foreground animate-pulse'
                      : 'bg-muted text-muted-foreground'
                  }>
                    {isRecording ? (isPaused ? 'PAUSED' : 'RECORDING') : 'STOPPED'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg aspect-video mb-6 overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <Button onClick={handleStartRecording} className="bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--primary-hover))] hover:text-white">
                      <Play className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handlePauseRecording} variant="outline">
                        {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button onClick={handleStopRecording} variant="destructive">
                        <Square className="mr-2 h-4 w-4" />
                        Stop
                      </Button>
                      <Button onClick={handleReset} variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </>
                  )}
                </div>

                {completedTests.includes(selectedTests[currentTestIndex]) && (
                  <div className="mt-6 text-center">
                    <div className="bg-success/10 border border-success rounded-lg p-4 mb-4">
                      <CheckCircle className="mx-auto h-8 w-8 text-success mb-2" />
                      <p className="text-success font-semibold">Test Completed Successfully!</p>
                    </div>
                    {currentTestIndex < selectedTests.length - 1 ? (
                      <Button onClick={handleNextTest} className="bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--primary-hover))] hover:text-white">
                        Next Test ({currentTestIndex + 2} of {totalTests})
                      </Button>
                    ) : (
                      <Button onClick={() => navigate(`/patient/${id}/video-summary/${testId}`)} className="bg-primary hover:bg-primary-hover">
                        View Summary
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRecording;
