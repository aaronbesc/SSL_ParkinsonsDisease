import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, FileText, Activity, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Patient, Test, AVAILABLE_TESTS } from '@/types/patient';

// Mock data
const mockPatient: Patient = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  recordNumber: 'P001',
  age: 65,
  height: '5\'8"',
  weight: '170 lbs',
  labResults: 'Normal CBC, elevated dopamine markers',
  doctorNotes: 'Patient shows mild tremor in right hand',
  severity: 'Mild',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20'),
};

const mockTestHistory: Test[] = [
  {
    id: 'test1',
    patientId: '1',
    name: 'Stand and Sit Assessment',
    type: 'stand-and-sit',
    date: new Date('2024-01-20'),
    status: 'completed',
  },
  {
    id: 'test2',
    patientId: '1',
    name: 'Palm Open Evaluation',
    type: 'palm-open',
    date: new Date('2024-01-18'),
    status: 'completed',
  },
];

const TestSelection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient] = useState<Patient>(mockPatient);
  const [testHistory] = useState<Test[]>(mockTestHistory);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const handleTestSelection = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(t => t !== testId)
        : [...prev, testId]
    );
  };

  const handleStartRecording = () => {
    if (selectedTests.length === 0) {
      toast({
        title: "No Tests Selected",
        description: "Please select at least one test to proceed.",
        variant: "destructive",
      });
      return;
    }

    // Create a test session with selected tests
    const testId = `test-${Date.now()}`;
    navigate(`/patient/${id}/video-recording/${testId}`, {
      state: { selectedTests }
    });
  };

  const getSeverityColor = (severity: Patient['severity']) => {
    switch (severity) {
      case 'Mild': return 'bg-success text-success-foreground';
      case 'Moderate': return 'bg-warning text-warning-foreground';
      case 'Severe': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/patient/${id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Patient
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Test Selection</h1>
                <p className="text-muted-foreground mt-1">
                  {patient.firstName} {patient.lastName} - {patient.recordNumber}
                </p>
              </div>
            </div>
            <Badge className={getSeverityColor(patient.severity)}>
              {patient.severity}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Summary - Left Side */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="font-semibold">{patient.age} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Record Number</p>
                  <p className="font-semibold">{patient.recordNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Severity</p>
                  <Badge className={getSeverityColor(patient.severity)} variant="secondary">
                    {patient.severity}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Recent Notes</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">{patient.doctorNotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Previous Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testHistory.slice(-3).map((test) => (
                    <div key={test.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{test.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {test.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {testHistory.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No previous tests recorded
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Selection - Right Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Select Tests to Perform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {AVAILABLE_TESTS.map((test) => (
                    <div
                      key={test.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTests.includes(test.id)
                          ? 'border-primary bg-medical-light'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleTestSelection(test.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{test.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {test.description}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedTests.includes(test.id)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}>
                          {selectedTests.includes(test.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recording Options */}
            <Card>
              <CardHeader>
                <CardTitle>Recording Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleStartRecording}
                    disabled={selectedTests.length === 0}
                    className="h-24 flex-col bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--primary-hover))] hover:text-white"
                  >
                    <Video className="h-8 w-8 mb-2" />
                    <span className="font-semibold">Record New Video</span>
                    <span className="text-xs opacity-90">Live recording with keypoints</span>
                  </Button>

                  <Button
                    variant="outline"
                    disabled={selectedTests.length === 0}
                    className="h-24 flex-col"
                  >
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="font-semibold">Upload Video</span>
                    <span className="text-xs text-muted-foreground">Upload existing video file</span>
                  </Button>
                </div>

                {selectedTests.length > 0 && (
                  <div className="mt-4 p-4 bg-medical-light rounded-lg">
                    <p className="text-sm font-medium text-medical-blue mb-2">
                      Selected Tests ({selectedTests.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTests.map(testId => {
                        const test = AVAILABLE_TESTS.find(t => t.id === testId);
                        return (
                          <Badge key={testId} variant="secondary" className="bg-primary text-primary-foreground">
                            {test?.name}
                          </Badge>
                        );
                      })}
                    </div>
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

export default TestSelection;