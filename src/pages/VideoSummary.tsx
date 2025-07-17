import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Download, Calendar, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Test } from '@/types/patient';

// Mock data for demonstration
const mockTestHistory: Test[] = [
  {
    id: 'test1',
    patientId: '1',
    name: 'Stand and Sit Assessment',
    type: 'stand-and-sit',
    date: new Date('2024-01-20'),
    status: 'completed',
    results: {
      duration: 45,
      score: 78,
      keypoints: [],
      analysis: 'Moderate improvement in mobility'
    }
  },
  {
    id: 'test2',
    patientId: '1',
    name: 'Palm Open Evaluation',
    type: 'palm-open',
    date: new Date('2024-01-18'),
    status: 'completed',
    results: {
      duration: 30,
      score: 82,
      keypoints: [],
      analysis: 'Good hand dexterity maintained'
    }
  },
  {
    id: 'test3',
    patientId: '1',
    name: 'Stand and Sit Assessment',
    type: 'stand-and-sit',
    date: new Date('2024-01-15'),
    status: 'completed',
    results: {
      duration: 52,
      score: 71,
      keypoints: [],
      analysis: 'Baseline assessment completed'
    }
  },
];

const mockStats = {
  averageScore: 77,
  improvement: '+8%',
  totalTests: 12,
  averageDuration: '42s',
  tremor: 'Mild',
  balance: 'Good',
  coordination: 'Moderate',
  mobility: 'Good'
};

const VideoSummary = () => {
  const { id, testId } = useParams<{ id: string; testId: string }>();
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState('all');
  const [testHistory] = useState<Test[]>(mockTestHistory);

  const currentTest = testHistory[0]; // Most recent test
  const filteredHistory = testHistory.filter(test => 
    selectedHistoryFilter === 'all' || test.type === selectedHistoryFilter
  );

  // Mock chart data points for demonstration
  const chartData = [
    { test: 1, score: 71, date: '2024-01-15' },
    { test: 2, score: 75, date: '2024-01-17' },
    { test: 3, score: 82, date: '2024-01-18' },
    { test: 4, score: 78, date: '2024-01-20' },
  ];

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
                <h1 className="text-3xl font-bold text-foreground">Video Processing Summary</h1>
                <p className="text-muted-foreground mt-1">Analysis and Results</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Link to={`/patient/${id}/test-selection`}>
                <Button className="bg-gradient-primary hover:bg-primary-hover">
                  New Test Session
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Top Left - Video Player */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recorded Video
                  <Badge variant="secondary" className="bg-success text-success-foreground">
                    Processed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg aspect-video mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
                      <Play className="mr-2 h-4 w-4" />
                      Play Recording
                    </Button>
                  </div>
                  {/* Mock keypoints overlay */}
                  <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 640 480">
                    <circle cx="150" cy="200" r="3" fill="#00ff00" />
                    <circle cx="148" cy="250" r="3" fill="#00ff00" />
                    <circle cx="145" cy="300" r="3" fill="#00ff00" />
                    <circle cx="155" cy="300" r="3" fill="#00ff00" />
                    <path d="M 150 200 L 148 250 L 150 400" stroke="#00ff00" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duration: {currentTest?.results?.duration || 45}s</span>
                  <span>Resolution: 1920x1080</span>
                  <span>Keypoints: Detected</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Right - Performance Graph */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  {/* Mock Chart */}
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[...Array(5)].map((_, i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="360"
                        y2={40 + i * 30}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Chart line */}
                    <path
                      d="M 80 120 L 160 100 L 240 70 L 320 85"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      fill="none"
                    />
                    
                    {/* Fill area */}
                    <path
                      d="M 80 120 L 160 100 L 240 70 L 320 85 L 320 160 L 80 160 Z"
                      fill="url(#gradient)"
                    />
                    
                    {/* Data points */}
                    {chartData.map((point, i) => (
                      <circle
                        key={i}
                        cx={80 + i * 80}
                        cy={200 - point.score * 1.5}
                        r="4"
                        fill="hsl(var(--primary))"
                        stroke="white"
                        strokeWidth="2"
                      />
                    ))}
                    
                    {/* Y-axis labels */}
                    {[100, 80, 60, 40, 20].map((value, i) => (
                      <text
                        key={i}
                        x="25"
                        y={45 + i * 30}
                        fontSize="12"
                        fill="hsl(var(--muted-foreground))"
                        textAnchor="middle"
                      >
                        {value}
                      </text>
                    ))}
                  </svg>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-4">
                  <span>Score Trend: {mockStats.improvement}</span>
                  <span>Average: {mockStats.averageScore}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Left - Test History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Test History
                  </span>
                  <Select value={selectedHistoryFilter} onValueChange={setSelectedHistoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tests</SelectItem>
                      <SelectItem value="stand-and-sit">Stand & Sit</SelectItem>
                      <SelectItem value="palm-open">Palm Open</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredHistory.map((test) => (
                    <div key={test.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{test.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {test.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-success text-success-foreground">
                          Score: {test.results?.score || 0}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {test.results?.analysis || 'Analysis pending'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Right - Statistics Table */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Overall Score</TableCell>
                      <TableCell>{currentTest?.results?.score || 78}</TableCell>
                      <TableCell className="text-success">+6</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Duration</TableCell>
                      <TableCell>{mockStats.averageDuration}</TableCell>
                      <TableCell className="text-success">-3s</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Tremor Level</TableCell>
                      <TableCell>{mockStats.tremor}</TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Balance</TableCell>
                      <TableCell>{mockStats.balance}</TableCell>
                      <TableCell className="text-success">+1</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Coordination</TableCell>
                      <TableCell>{mockStats.coordination}</TableCell>
                      <TableCell className="text-warning">±0</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Mobility</TableCell>
                      <TableCell>{mockStats.mobility}</TableCell>
                      <TableCell className="text-success">+2</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-medical-light rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-medical-blue mt-0.5" />
                    <div>
                      <p className="font-medium text-medical-blue mb-1">Clinical Summary</p>
                      <p className="text-sm text-muted-foreground">
                        {currentTest?.results?.analysis || 
                        "Patient shows continued improvement in motor function. Tremor remains mild and controlled. Recommend maintaining current treatment protocol."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSummary;