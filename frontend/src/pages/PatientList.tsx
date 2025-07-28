import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, FileText, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types/patient';

// Mock data - replace with actual data fetching
const mockPatients: Patient[] = [
  {
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
  },
  {
    id: '2',
    firstName: 'Mary',
    lastName: 'Johnson',
    recordNumber: 'P002',
    age: 72,
    height: '5\'4"',
    weight: '145 lbs',
    labResults: 'Low dopamine levels, normal other markers',
    doctorNotes: 'Progressive symptoms, balance issues noted',
    severity: 'Moderate',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Davis',
    recordNumber: 'P003',
    age: 68,
    height: '6\'0"',
    weight: '180 lbs',
    labResults: 'Significantly reduced dopamine, elevated inflammation',
    doctorNotes: 'Advanced symptoms, mobility assistance required',
    severity: 'Severe',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22'),
  },
];

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  // Quick add form state
  const [quickFormData, setQuickFormData] = useState({
    firstName: '',
    lastName: '',
    recordNumber: '',
    age: '',
    severity: '' as Patient['severity'],
  });

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.recordNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickFormChange = (field: string, value: string) => {
    setQuickFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!quickFormData.firstName || !quickFormData.lastName || !quickFormData.recordNumber || !quickFormData.age || !quickFormData.severity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Create new patient
    const newPatient: Patient = {
      id: (patients.length + 1).toString(),
      firstName: quickFormData.firstName,
      lastName: quickFormData.lastName,
      recordNumber: quickFormData.recordNumber,
      age: parseInt(quickFormData.age),
      height: '',
      weight: '',
      labResults: '',
      doctorNotes: '',
      severity: quickFormData.severity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setPatients(prev => [...prev, newPatient]);
    setIsModalOpen(false);
    setQuickFormData({
      firstName: '',
      lastName: '',
      recordNumber: '',
      age: '',
      severity: '' as Patient['severity'],
    });

    toast({
      title: "Patient Added",
      description: `${newPatient.firstName} ${newPatient.lastName} has been added successfully.`,
    });
  };

  const getSeverityColor = (severity: Patient['severity']) => {
    switch (severity) {
      case 'Mild':
        return 'bg-success text-success-foreground';
      case 'Moderate':
        return 'bg-warning text-warning-foreground';
      case 'Severe':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
              <p className="text-muted-foreground mt-1">Parkinson's Disease Monitoring System</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Quick Add Modal */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Quick Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Quick Add Patient</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleQuickSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quick-firstName">First Name *</Label>
                        <Input
                          id="quick-firstName"
                          placeholder="John"
                          value={quickFormData.firstName}
                          onChange={(e) => handleQuickFormChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quick-lastName">Last Name *</Label>
                        <Input
                          id="quick-lastName"
                          placeholder="Smith"
                          value={quickFormData.lastName}
                          onChange={(e) => handleQuickFormChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quick-recordNumber">Record Number *</Label>
                        <Input
                          id="quick-recordNumber"
                          placeholder="P004"
                          value={quickFormData.recordNumber}
                          onChange={(e) => handleQuickFormChange('recordNumber', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quick-age">Age *</Label>
                        <Input
                          id="quick-age"
                          type="number"
                          placeholder="65"
                          value={quickFormData.age}
                          onChange={(e) => handleQuickFormChange('age', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quick-severity">Parkinson's Severity *</Label>
                      <Select value={quickFormData.severity} onValueChange={(value) => handleQuickFormChange('severity', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mild">Mild</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-primary hover:bg-primary-hover">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Patient
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Full Form Link */}
              <Link to="/patient-form">
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Detailed Form
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients by name or record number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Link key={patient.id} to={`/patient/${patient.id}`}>
              <Card className="hover:shadow-medical transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-medical-light">
                        <User className="h-5 w-5 text-medical-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {patient.firstName} {patient.lastName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Record: {patient.recordNumber}
                        </p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(patient.severity)}>
                      {patient.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="mr-2 h-4 w-4" />
                      Age: {patient.age} years
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Last updated: {patient.updatedAt.toLocaleDateString()}
                    </div>
                    {patient.doctorNotes && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          "{patient.doctorNotes.length > 60 
                            ? patient.doctorNotes.substring(0, 60) + '...' 
                            : patient.doctorNotes}"
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first patient.'}
            </p>
            <Link to="/patient-form">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Patient
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;