import json
import os
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Union


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
    # Class lock for async operations
    _lock = asyncio.Lock()

    def __init__(self, file_path: str = "patients.json", verbose: bool = False):
        self.file_path = file_path
        self.patients: Dict[str, Patient] = {}
        self.verbose = verbose
        self._load_patients()

    def _log(self, message: str) -> None:
        """Log a message if verbose mode is enabled"""
        if self.verbose:
            print(message)

    def _load_patients(self) -> None:
        """Load patients from the JSON file if it exists"""
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, 'r') as f:
                    patients_data = json.load(f)

                for patient_id, patient_data in patients_data.items():
                    self.patients[patient_id] = Patient.from_dict(patient_data)

                self._log(f"Loaded {len(self.patients)} patients from {self.file_path}")
            except Exception as e:
                self._log(f"Error loading patients: {str(e)}")
        else:
            self._log(f"No patients file found at {self.file_path}. Starting with empty database.")

    def _backup_patients(self) -> bool:
        """Create a backup of the patients file before making changes"""
        if os.path.exists(self.file_path):
            backup_path = f"{self.file_path}.backup"
            try:
                with open(self.file_path, 'r') as src:
                    with open(backup_path, 'w') as dst:
                        dst.write(src.read())
                return True
            except Exception as e:
                self._log(f"Error creating backup: {str(e)}")
        return False

    def _restore_backup(self) -> bool:
        """Restore the patients file from backup if an operation fails"""
        backup_path = f"{self.file_path}.backup"
        if os.path.exists(backup_path):
            try:
                with open(backup_path, 'r') as src:
                    with open(self.file_path, 'w') as dst:
                        dst.write(src.read())
                return True
            except Exception as e:
                self._log(f"Error restoring backup: {str(e)}")
        return False

    def save_patients(self) -> bool:
        """Save all patients to the JSON file with backup support"""
        self._backup_patients()
        patients_data = {patient_id: patient.to_dict()
                         for patient_id, patient in self.patients.items()}

        try:
            with open(self.file_path, 'w') as f:
                json.dump(patients_data, f, indent=2)
            self._log(f"Saved {len(self.patients)} patients to {self.file_path}")
            return True
        except Exception as e:
            self._log(f"Error saving patients: {str(e)}")
            self._restore_backup()
            return False

    def validate_patient_data(self, data: Dict) -> Dict:
        """Validate patient data and return any errors"""
        errors = {}

        if "name" in data and not isinstance(data["name"], str):
            errors["name"] = "Name must be a string"

        if "age" in data:
            if not isinstance(data["age"], int):
                errors["age"] = "Age must be an integer"
            elif data["age"] < 0 or data["age"] > 120:
                errors["age"] = "Age must be between 0 and 120"

        if "height" in data:
            if not isinstance(data["height"], (int, float)):
                errors["height"] = "Height must be a number"
            elif data["height"] < 0 or data["height"] > 300:
                errors["height"] = "Height must be between 0 and 300 cm"

        if "weight" in data:
            if not isinstance(data["weight"], (int, float)):
                errors["weight"] = "Weight must be a number"
            elif data["weight"] < 0 or data["weight"] > 500:
                errors["weight"] = "Weight must be between 0 and 500 kg"

        if "severity" in data and data["severity"] not in ["low", "medium", "high"]:
            errors["severity"] = "Severity must be one of: low, medium, high"

        return errors

    def add_patient(self, patient: Patient) -> Dict:
        """Add a new patient or update an existing one"""
        try:
            self.patients[patient.patient_id] = patient
            success = self.save_patients()
            if success:
                return {"success": True, "patient_id": patient.patient_id}
            else:
                return {"success": False, "error": "Failed to save patient data"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_patient(self, patient_id: str) -> Optional[Patient]:
        """Get a patient by ID"""
        return self.patients.get(patient_id)

    def get_all_patients(self, skip: int = 0, limit: int = 100) -> List[Patient]:
        """
        Get all patients with pagination support

        Args:
            skip: Number of patients to skip
            limit: Maximum number of patients to return

        Returns:
            List of Patient objects
        """
        all_patients = list(self.patients.values())
        return all_patients[skip:skip + limit]

    def count_patients(self) -> int:
        """Return the total number of patients"""
        return len(self.patients)

    def delete_patient(self, patient_id: str) -> Dict:
        """Delete a patient by ID"""
        if patient_id in self.patients:
            try:
                del self.patients[patient_id]
                success = self.save_patients()
                if success:
                    return {"success": True}
                else:
                    return {"success": False, "error": "Failed to save changes"}
            except Exception as e:
                return {"success": False, "error": str(e)}
        return {"success": False, "error": "Patient not found"}

    def update_patient(self, patient_id: str, updated_data: Dict) -> Dict:
        """Update a patient's information"""
        patient = self.get_patient(patient_id)
        if not patient:
            return {"success": False, "error": "Patient not found"}

        # Validate the data
        validation_errors = self.validate_patient_data(updated_data)
        if validation_errors:
            return {"success": False, "errors": validation_errors}

        try:
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

            success = self.save_patients()
            if success:
                return {"success": True, "patient_id": patient_id}
            else:
                return {"success": False, "error": "Failed to save changes"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def search_patients(self, query: str) -> List[Patient]:
        """
        Search for patients by name

        Args:
            query: Search query string

        Returns:
            List of matching Patient objects
        """
        query = query.lower()
        return [
            patient for patient in self.patients.values()
            if query in patient.name.lower()
        ]

    def filter_patients(self, criteria: Dict) -> List[Patient]:
        """
        Filter patients based on criteria

        Args:
            criteria: Dictionary with filter criteria

        Returns:
            List of matching Patient objects
        """
        filtered_patients = list(self.patients.values())

        if "min_age" in criteria:
            filtered_patients = [p for p in filtered_patients if p.age >= criteria["min_age"]]

        if "max_age" in criteria:
            filtered_patients = [p for p in filtered_patients if p.age <= criteria["max_age"]]

        if "severity" in criteria:
            filtered_patients = [p for p in filtered_patients if p.severity == criteria["severity"]]

        return filtered_patients

    def add_patients_bulk(self, patients: List[Patient]) -> Dict:
        """
        Add multiple patients at once

        Args:
            patients: List of Patient objects to add

        Returns:
            Dictionary with success status and added patient IDs
        """
        try:
            added_ids = []
            for patient in patients:
                self.patients[patient.patient_id] = patient
                added_ids.append(patient.patient_id)

            success = self.save_patients()
            if success:
                return {"success": True, "patient_ids": added_ids}
            else:
                return {"success": False, "error": "Failed to save patients"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def export_patients_csv(self, file_path: str) -> bool:
        """
        Export all patients to a CSV file

        Args:
            file_path: Path to save the CSV file

        Returns:
            True if successful, False otherwise
        """
        try:
            import csv

            # Get all patient data
            patients = list(self.patients.values())

            # Define CSV fields
            fields = ["patient_id", "name", "age", "height", "weight",
                      "doctors_notes", "severity"]

            # Write to CSV
            with open(file_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fields)
                writer.writeheader()

                for patient in patients:
                    data = patient.to_dict()
                    # Remove lab_results as it's a complex type
                    if "lab_results" in data:
                        del data["lab_results"]
                    writer.writerow(data)

            return True
        except Exception as e:
            self._log(f"Error exporting to CSV: {str(e)}")
            return False

    # Async methods for FastAPI
    async def async_add_patient(self, patient: Patient) -> Dict:
        """Add a patient with concurrency protection"""
        async with self._lock:
            return self.add_patient(patient)

    async def async_get_patient(self, patient_id: str) -> Optional[Patient]:
        """Get a patient with concurrency protection"""
        async with self._lock:
            return self.get_patient(patient_id)

    async def async_update_patient(self, patient_id: str, updated_data: Dict) -> Dict:
        """Update a patient with concurrency protection"""
        async with self._lock:
            return self.update_patient(patient_id, updated_data)

    async def async_delete_patient(self, patient_id: str) -> Dict:
        """Delete a patient with concurrency protection"""
        async with self._lock:
            return self.delete_patient(patient_id)

    async def async_get_all_patients(self, skip: int = 0, limit: int = 100) -> List[Patient]:
        """Get all patients with concurrency protection"""
        async with self._lock:
            return self.get_all_patients(skip, limit)

    async def async_search_patients(self, query: str) -> List[Patient]:
        """Search patients with concurrency protection"""
        async with self._lock:
            return self.search_patients(query)

    async def async_filter_patients(self, criteria: Dict) -> List[Patient]:
        """Filter patients with concurrency protection"""
        async with self._lock:
            return self.filter_patients(criteria)

    async def async_count_patients(self) -> int:
        """Count patients with concurrency protection"""
        async with self._lock:
            return self.count_patients()


# Utility functions for API integration
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

    return manager.add_patient(patient)


def get_patient_info(patient_id: str) -> Dict:
    """Get a patient's information"""
    manager = PatientManager()
    patient = manager.get_patient(patient_id)

    if patient:
        return {"success": True, "patient": patient.to_dict()}
    return {"success": False, "error": "Patient not found"}


def get_all_patients_info(skip: int = 0, limit: int = 100) -> Dict:
    """Get information for all patients with pagination"""
    manager = PatientManager()
    patients = manager.get_all_patients(skip, limit)
    total = manager.count_patients()

    return {
        "success": True,
        "patients": [patient.to_dict() for patient in patients],
        "total": total,
        "skip": skip,
        "limit": limit
    }


def update_patient_info(patient_id: str, updated_data: Dict) -> Dict:
    """Update a patient's information"""
    manager = PatientManager()
    return manager.update_patient(patient_id, updated_data)


def delete_patient_record(patient_id: str) -> Dict:
    """Delete a patient's record"""
    manager = PatientManager()
    return manager.delete_patient(patient_id)


def search_patients(query: str) -> Dict:
    """Search for patients by name"""
    manager = PatientManager()
    patients = manager.search_patients(query)

    return {
        "success": True,
        "patients": [patient.to_dict() for patient in patients],
        "count": len(patients)
    }


def filter_patients(criteria: Dict) -> Dict:
    """Filter patients based on criteria"""
    manager = PatientManager()
    patients = manager.filter_patients(criteria)

    return {
        "success": True,
        "patients": [patient.to_dict() for patient in patients],
        "count": len(patients)
    }


# Async utility functions for FastAPI
async def async_create_patient(name: str, age: int, height: float, weight: float,
                               lab_results: Dict = None, doctors_notes: str = "", severity: str = "low") -> Dict:
    """Create a new patient asynchronously"""
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

    return await manager.async_add_patient(patient)


async def async_get_patient_info(patient_id: str) -> Dict:
    """Get a patient's information asynchronously"""
    manager = PatientManager()
    patient = await manager.async_get_patient(patient_id)

    if patient:
        return {"success": True, "patient": patient.to_dict()}
    return {"success": False, "error": "Patient not found"}


async def async_get_all_patients_info(skip: int = 0, limit: int = 100) -> Dict:
    """Get information for all patients with pagination asynchronously"""
    manager = PatientManager()
    patients = await manager.async_get_all_patients(skip, limit)
    total = await manager.async_count_patients()

    return {
        "success": True,
        "patients": [patient.to_dict() for patient in patients],
        "total": total,
        "skip": skip,
        "limit": limit
    }


async def async_update_patient_info(patient_id: str, updated_data: Dict) -> Dict:
    """Update a patient's information asynchronously"""
    manager = PatientManager()
    return await manager.async_update_patient(patient_id, updated_data)


async def async_delete_patient_record(patient_id: str) -> Dict:
    """Delete a patient's record asynchronously"""
    manager = PatientManager()
    return await manager.async_delete_patient(patient_id)


async def async_search_patients(query: str) -> Dict:
    """Search for patients by name asynchronously"""
    manager = PatientManager()
    patients = await manager.async_search_patients(query)

    return {
        "success": True,
        "patients": [patient.to_dict() for patient in patients],
        "count": len(patients)
    }


async def async_filter_patients(criteria: Dict) -> Dict:
    """Filter patients based on criteria asynchronously"""
    manager = PatientManager()
    patients = await manager.async_filter_patients(criteria)

    return {
        "success": True,
        "patients": [patient.to_dict() for patient in patients],
        "count": len(patients)
    }