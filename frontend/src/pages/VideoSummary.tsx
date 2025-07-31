import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Test } from '@/types/patient';

const mockTestHistory: Test[] = [
  {
    id: 'stand-and-sit',
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
    id: 'palm-open',
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
  }
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

  const [videoList, setVideoList] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const currentTest = testHistory.find(t => t.type === testId) || testHistory[0];
  const filteredHistory = testHistory.filter(test =>
    selectedHistoryFilter === 'all' || test.type === selectedHistoryFilter
  );

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch(`/api/videos/${id}/${testId}`);
        const data = await res.json();
        if (data.success && data.videos.length > 0) {
          setVideoList(data.videos);
          setSelectedVideo(data.videos[0]); // Most recent
        }
      } catch (err) {
        console.error("Failed to fetch video list", err);
      }
    };

    fetchVideos();
  }, [id, testId]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
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

      <div className="container mx-auto px-6 py-8 grid grid-cols-2 gap-8">
        {/* Video */}
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
              {selectedVideo ? (
                <video controls className="w-full rounded-lg aspect-video mb-4">
                  <source src={`/api/recordings/${selectedVideo}`} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="bg-gray-900 text-white text-center py-8 rounded-lg">
                  No video available.
                </div>
              )}

              {videoList.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-1">Select Recording:</label>
                  <select
                    value={selectedVideo || ''}
                    onChange={(e) => setSelectedVideo(e.target.value)}
                    className="border p-2 rounded-md text-sm"
                  >
                    {videoList.map((video, idx) => (
                      <option key={idx} value={video}>
                        {video}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Duration: {currentTest?.results?.duration || 0}s</span>
                <span>Resolution: 1920x1080</span>
                <span>Keypoints: Detected</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add your chart or keep mock here */}
              <p className="text-sm text-muted-foreground">Chart Placeholder</p>
            </CardContent>
          </Card>
        </div>

        {/* Test History */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
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
              {filteredHistory.map((test) => (
                <div key={test.id} className="border p-3 rounded-lg mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{test.name}</p>
                      <p className="text-xs text-muted-foreground">{test.date.toDateString()}</p>
                    </div>
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      Score: {test.results?.score}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{test.results?.analysis}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Table */}
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
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Overall Score</TableCell>
                    <TableCell>{currentTest?.results?.score}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Duration</TableCell>
                    <TableCell>{mockStats.averageDuration}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tremor</TableCell>
                    <TableCell>{mockStats.tremor}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <FileText className="inline mr-2 text-primary" />
                <span className="text-sm">{currentTest?.results?.analysis}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoSummary;
