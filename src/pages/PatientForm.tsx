import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types/patient';

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    recordNumber: '',
    age: '',
    height: '',
    weight: '',
    labResults: '',
    doctorNotes: '',
    severity: '' as Patient['severity'],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.recordNumber || !formData.age || !formData.severity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would normally send data to your backend
    toast({
      title: isEditing ? "Patient Updated" : "Patient Created",
      description: isEditing 
        ? `${formData.firstName} ${formData.lastName}'s information has been updated.`
        : `${formData.firstName} ${formData.lastName} has been added to the system.`,
    });

    // Navigate back to patient list or patient details
    if (isEditing) {
      navigate(`/patient/${id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={isEditing ? `/patient/${id}` : '/'}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isEditing ? 'Back to Patient' : 'Back to Patients'}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isEditing ? 'Edit Patient' : 'Add New Patient'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isEditing ? 'Update patient information' : 'Enter patient details to create a new record'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recordNumber">Record Number *</Label>
                    <Input
                      id="recordNumber"
                      placeholder="e.g., P001"
                      value={formData.recordNumber}
                      onChange={(e) => handleInputChange('recordNumber', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      placeholder="e.g., 5'8&quot;"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      placeholder="e.g., 170 lbs"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                    />
                  </div>
                </div>

                {/* Severity */}
                <div className="space-y-2">
                  <Label htmlFor="severity">Parkinson's Severity *</Label>
                  <Select value={formData.severity} onValueChange={(value) => handleInputChange('severity', value)}>
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

                {/* Lab Results */}
                <div className="space-y-2">
                  <Label htmlFor="labResults">Lab Results</Label>
                  <Textarea
                    id="labResults"
                    placeholder="Enter lab results and findings..."
                    value={formData.labResults}
                    onChange={(e) => handleInputChange('labResults', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Doctor's Notes */}
                <div className="space-y-2">
                  <Label htmlFor="doctorNotes">Doctor's Notes</Label>
                  <Textarea
                    id="doctorNotes"
                    placeholder="Enter clinical observations, treatment notes, etc..."
                    value={formData.doctorNotes}
                    onChange={(e) => handleInputChange('doctorNotes', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Link to={isEditing ? `/patient/${id}` : '/'}>
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="bg-gradient-primary hover:bg-primary-hover">
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Patient' : 'Create Patient'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;