import json
import os
from datetime import datetime
from typing import Dict, List, Optional


class Patient:
    def __init__(self,
                 name: str,
                 age: int,
                 height: float,
                 weight: float,
                 lab_results: Dict = None,
                 doctors_notes: str = "",
                 severity: str = "low",
                 patient_id: str = None):
        self.name = name
        self.age = age
        self.height = height  # in cm
        self.weight = weight  # in kg
        self.lab_results = lab_results or {}
        self.doctors_notes = doctors_notes
        self.severity = severity  # low, medium, high
        self.patient_id = patient_id or self._generate_id()

    def _generate_id(self) -> str:
        """Generate a unique ID for the patient based on name and current timestamp"""
        name_part = self.name.lower().replace(" ", "")[:5]
        time_part = str(int(datetime.now().timestamp()))
        return f"{name_part}{time_part}"

    def to_dict(self) -> Dict:
        """Convert patient object to dictionary for JSON serialization"""
        return {
            "patient_id": self.patient_id,
            "name": self.name,
            "age": self.age,
            "height": self.height,
            "weight": self.weight,
            "lab_results": self.lab_results,
            "doctors_notes": self.doctors_notes,
            "severity": self.severity
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Patient':
        """Create a Patient object from dictionary data"""
        return cls(
            name=data.get("name", ""),
            age=data.get("age", 0),
            height=data.get("height", 0.0),
            weight=data.get("weight", 0.0),
            lab_results=data.get("lab_results", {}),
            doctors_notes=data.get("doctors_notes", ""),
            severity=data.get("severity", "low"),
            patient_id=data.get("patient_id")
        )


class PatientManager:
    def __init__(self, file_path: str = "patients.json"):
        self.file_path = file_path
        self.patients: Dict[str, Patient] = {}
        self._load_patients()

    def _load_patients(self) -> None:
        """Load patients from the JSON file if it exists"""
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r') as f:
                    patients_data = json.load(f)

                for patient_id, patient_data in patients_data.items():
                    self.patients[patient_id] = Patient.from_dict(patient_data)

                print(f"Loaded {len(self.patients)} patients from {self.file_path}")
            except Exception as e:
                print(f"Error loading patients: {str(e)}")
        else:
            print(f"No patients file found at {self.file_path}. Starting with empty database.")

    def save_patients(self) -> None:
        """Save all patients to the JSON file"""
        patients_data = {patient_id: patient.to_dict()
                         for patient_id, patient in self.patients.items()}

        try:
            with open(self.file_path, 'w') as f:
                json.dump(patients_data, f, indent=2)
            print(f"Saved {len(self.patients)} patients to {self.file_path}")
        except Exception as e:
            print(f"Error saving patients: {str(e)}")

    def add_patient(self, patient: Patient) -> None:
        """Add a new patient or update an existing one"""
        self.patients[patient.patient_id] = patient
        self.save_patients()

    def get_patient(self, patient_id: str) -> Optional[Patient]:
        """Get a patient by ID"""
        return self.patients.get(patient_id)

    def get_all_patients(self) -> List[Patient]:
        """Get all patients"""
        return list(self.patients.values())

    def delete_patient(self, patient_id: str) -> bool:
        """Delete a patient by ID"""
        if patient_id in self.patients:
            del self.patients[patient_id]
            self.save_patients()
            return True
        return False

    def update_patient(self, patient_id: str, updated_data: Dict) -> bool:
        """Update a patient's information"""
        patient = self.get_patient(patient_id)
        if not patient:
            return False

        # Update patient fields
        if "name" in updated_data:
            patient.name = updated_data["name"]
        if "age" in updated_data:
            patient.age = updated_data["age"]
        if "height" in updated_data:
            patient.height = updated_data["height"]
        if "weight" in updated_data:
            patient.weight = updated_data["weight"]
        if "lab_results" in updated_data:
            patient.lab_results = updated_data["lab_results"]
        if "doctors_notes" in updated_data:
            patient.doctors_notes = updated_data["doctors_notes"]
        if "severity" in updated_data:
            patient.severity = updated_data["severity"]

        self.save_patients()
        return True


# Utility functions for frontend integration
def create_patient(name: str, age: int, height: float, weight: float,
                   lab_results: Dict = None, doctors_notes: str = "", severity: str = "low") -> Dict:
    """Create a new patient and return their data"""
    manager = PatientManager()

    patient = Patient(
        name=name,
        age=age,
        height=height,
        weight=weight,
        lab_results=lab_results or {},
        doctors_notes=doctors_notes,
        severity=severity
    )

    manager.add_patient(patient)
    return {"status": "success", "patient_id": patient.patient_id}


def get_patient_info(patient_id: str) -> Dict:
    """Get a patient's information"""
    manager = PatientManager()
    patient = manager.get_patient(patient_id)

    if patient:
        return patient.to_dict()
    return {"error": "Patient not found"}


def get_all_patients_info() -> List[Dict]:
    """Get information for all patients"""
    manager = PatientManager()
    patients = manager.get_all_patients()

    return [patient.to_dict() for patient in patients]


def update_patient_info(patient_id: str, updated_data: Dict) -> Dict:
    """Update a patient's information"""
    manager = PatientManager()
    success = manager.update_patient(patient_id, updated_data)

    if success:
        return {"status": "success", "message": "Patient information updated"}
    return {"error": "Patient not found"}


def delete_patient_record(patient_id: str) -> Dict:
    """Delete a patient's record"""
    manager = PatientManager()
    success = manager.delete_patient(patient_id)

    if success:
        return {"status": "success", "message": "Patient record deleted"}
    return {"error": "Patient not found"}


# Example usage
if __name__ == "__main__":
    # Create some example patients
    patient1_id = create_patient(
        name="John Doe",
        age=45,
        height=180.0,
        weight=85.0,
        lab_results={"cholesterol": 210, "glucose": 95},
        doctors_notes="Patient reports occasional chest pain after exercise.",
        severity="medium"
    )["patient_id"]

    create_patient(
        name="Jane Smith",
        age=35,
        height=165.0,
        weight=60.0,
        lab_results={"cholesterol": 180, "glucose": 85},
        doctors_notes="Patient in good overall health.",
        severity="low"
    )

    # List all patients
    all_patients = get_all_patients_info()
    print(f"Total patients: {len(all_patients)}")
    for patient in all_patients:
        print(f"Patient: {patient['name']}, Age: {patient['age']}, Severity: {patient['severity']}")

    # Update a patient's information
    update_patient_info(
        patient_id=patient1_id,
        updated_data={
            "weight": 83.0,
            "lab_results": {"cholesterol": 195, "glucose": 90},
            "doctors_notes": "Patient shows improvement after lifestyle changes."
        }
    )

    # Get updated information
    updated_patient = get_patient_info(patient1_id)
    print(f"\nUpdated patient information:")
    print(f"Name: {updated_patient['name']}")
    print(f"Weight: {updated_patient['weight']} kg")
    print(f"Lab Results: {updated_patient['lab_results']}")
    print(f"Doctor's Notes: {updated_patient['doctors_notes']}")