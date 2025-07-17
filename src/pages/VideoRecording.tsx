import { useState, useEffect } from 'react';
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

  // Mock keypoints for demonstration
  const [keypoints] = useState([
    { x: 150, y: 200, confidence: 0.9, label: 'head' },
    { x: 148, y: 250, confidence: 0.85, label: 'neck' },
    { x: 145, y: 300, confidence: 0.92, label: 'shoulder_left' },
    { x: 155, y: 300, confidence: 0.88, label: 'shoulder_right' },
    { x: 150, y: 400, confidence: 0.87, label: 'hip_center' },
    { x: 140, y: 500, confidence: 0.91, label: 'knee_left' },
    { x: 160, y: 500, confidence: 0.89, label: 'knee_right' },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    
    // Mark current test as completed
    const currentTestId = selectedTests[currentTestIndex];
    setCompletedTests(prev => [...prev, currentTestId]);
    
    toast({
      title: "Recording Completed",
      description: `${currentTest?.name} recording saved successfully.`,
    });
  };

  const handleNextTest = () => {
    if (currentTestIndex < selectedTests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
      setRecordingTime(0);
    } else {
      // All tests completed, navigate to summary
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

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test List - Right 1/3 */}
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

            {/* Instructions */}
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

          {/* Video Feed - Left 2/3 */}
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
                {/* Mock Video Display */}
                <div className="relative bg-black rounded-lg aspect-video mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-lg font-semibold mb-2">Camera Feed</div>
                      <div className="text-sm opacity-75">Live video would display here</div>
                    </div>
                  </div>
                  
                  {/* Keypoints Overlay */}
                  {isRecording && !isPaused && (
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 640 480">
                      {keypoints.map((point, index) => (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#00ff00"
                          stroke="#ffffff"
                          strokeWidth="1"
                          opacity={point.confidence}
                        />
                      ))}
                      {/* Connect keypoints with lines */}
                      <path
                        d={`M ${keypoints[0]?.x} ${keypoints[0]?.y} L ${keypoints[1]?.x} ${keypoints[1]?.y} L ${keypoints[4]?.x} ${keypoints[4]?.y}`}
                        stroke="#00ff00"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                      />
                    </svg>
                  )}
                </div>

                {/* Recording Controls */}
                <div className="flex justify-center space-x-4">
                  {!isRecording ? (
                    <Button onClick={handleStartRecording} className="bg-gradient-primary hover:bg-primary-hover">
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
                      <Button onClick={handleNextTest} className="bg-gradient-primary hover:bg-primary-hover">
                        Next Test ({currentTestIndex + 2} of {totalTests})
                      </Button>
                    ) : (
                      <Button onClick={() => navigate(`/patient/${id}/video-summary/${testId}`)} className="bg-gradient-primary hover:bg-primary-hover">
                        View Summary & Results
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