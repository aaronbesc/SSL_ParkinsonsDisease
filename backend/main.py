# # main.py
# from patient_manager import Patient, PatientManager
# import json
# from pprint import pprint
#
#
# def demonstrate_patient_manager_usage():
#     """
#     This function demonstrates all the functionality of the PatientManager class.
#     It can be used as a reference for integrating with FastAPI.
#     """
#     print("=" * 50)
#     print("PATIENT MANAGEMENT SYSTEM DEMONSTRATION")
#     print("=" * 50)
#
#     # Initialize the patient manager
#     manager = PatientManager()
#     print("\n1. Patient Manager Initialized")
#
#     # Create patients
#     print("\n2. Creating Patients")
#     # Create first patient
#     patient1 = Patient(
#         name="John Doe",
#         age=45,
#         height=180.0,  # cm
#         weight=85.0,  # kg
#         lab_results={"cholesterol": 210, "glucose": 95, "blood_pressure": "140/90"},
#         doctors_notes="Patient reports occasional chest pain after exercise.",
#         severity="medium"
#     )
#
#     # Create second patient
#     patient2 = Patient(
#         name="Jane Smith",
#         age=35,
#         height=165.0,
#         weight=60.0,
#         lab_results={"cholesterol": 180, "glucose": 85, "blood_pressure": "120/80"},
#         doctors_notes="Patient in good overall health.",
#         severity="low"
#     )
#
#     # Create third patient
#     patient3 = Patient(
#         name="Robert Johnson",
#         age=52,
#         height=175.0,
#         weight=95.0,
#         lab_results={"cholesterol": 240, "glucose": 110, "blood_pressure": "150/95"},
#         doctors_notes="Patient has high blood pressure and elevated cholesterol.",
#         severity="high"
#     )
#
#     # Add patients to the manager
#     print("\n3. Adding Patients to the Manager")
#     manager.add_patient(patient1)
#     print(f"Added patient: {patient1.name} with ID: {patient1.patient_id}")
#
#     manager.add_patient(patient2)
#     print(f"Added patient: {patient2.name} with ID: {patient2.patient_id}")
#
#     manager.add_patient(patient3)
#     print(f"Added patient: {patient3.name} with ID: {patient3.patient_id}")
#
#     # Get all patients
#     print("\n4. Getting All Patients")
#     all_patients = manager.get_all_patients()
#     print(f"Retrieved {len(all_patients)} patients:")
#     for patient in all_patients:
#         print(f"  - {patient.name} (ID: {patient.patient_id})")
#
#     # Get a specific patient
#     print("\n5. Getting a Specific Patient")
#     retrieved_patient = manager.get_patient(patient1.patient_id)
#     if retrieved_patient:
#         print(f"Retrieved patient: {retrieved_patient.name}")
#         print("Patient details:")
#         pprint(retrieved_patient.to_dict())
#     else:
#         print("Patient not found")
#
#     # Update a patient
#     print("\n6. Updating a Patient")
#     update_data = {
#         "weight": 83.0,  # Patient lost 2kg
#         "lab_results": {
#             "cholesterol": 195,  # Improved cholesterol
#             "glucose": 90,  # Improved glucose
#             "blood_pressure": "135/85"  # Improved blood pressure
#         },
#         "doctors_notes": "Patient shows improvement after lifestyle changes and medication."
#     }
#
#     success = manager.update_patient(patient1.patient_id, update_data)
#     if success:
#         print(f"Successfully updated patient: {patient1.name}")
#         # Get the updated patient
#         updated_patient = manager.get_patient(patient1.patient_id)
#         print("Updated patient details:")
#         pprint(updated_patient.to_dict())
#     else:
#         print("Failed to update patient")
#
#     # Delete a patient
#     print("\n7. Deleting a Patient")
#     success = manager.delete_patient(patient3.patient_id)
#     if success:
#         print(f"Successfully deleted patient with ID: {patient3.patient_id}")
#     else:
#         print("Failed to delete patient")
#
#     # Verify deletion by getting all patients again
#     remaining_patients = manager.get_all_patients()
#     print(f"Remaining patients: {len(remaining_patients)}")
#     for patient in remaining_patients:
#         print(f"  - {patient.name} (ID: {patient.patient_id})")
#
#     # Demonstrate to_dict and from_dict methods
#     print("\n8. Converting Between Patient Objects and Dictionaries")
#     patient_dict = patient2.to_dict()
#     print("Patient as dictionary:")
#     pprint(patient_dict)
#
#     # Create a new patient from the dictionary
#     new_patient = Patient.from_dict(patient_dict)
#     print(f"Recreated patient from dictionary: {new_patient.name} (ID: {new_patient.patient_id})")
#
#     # Save and load demonstration
#     print("\n9. Save and Load Demonstration")
#     print("The following operations were already performed automatically:")
#     print("  - Patients were saved to the JSON file when added")
#     print("  - Patient updates were saved automatically")
#     print("  - Patient deletions were saved automatically")
#
#     # Show the contents of the JSON file
#     try:
#         with open(manager.file_path, 'r') as f:
#             json_data = json.load(f)
#
#         print(f"Contents of {manager.file_path} (IDs only):")
#         for patient_id in json_data.keys():
#             print(f"  - {patient_id}")
#     except Exception as e:
#         print(f"Error reading JSON file: {str(e)}")
#
#     print("\n10. Creating a New Manager Instance to Demonstrate Loading")
#     new_manager = PatientManager()  # This will load the saved patients
#     loaded_patients = new_manager.get_all_patients()
#     print(f"Loaded {len(loaded_patients)} patients from the JSON file:")
#     for patient in loaded_patients:
#         print(f"  - {patient.name} (ID: {patient.patient_id})")
#
#     print("\n" + "=" * 50)
#     print("DEMONSTRATION COMPLETE")
#     print("=" * 50)
#
#
# def fastapi_usage_examples():
#     """
#     Example functions that could be used directly with FastAPI endpoints.
#     """
#     print("\nFASTAPI INTEGRATION EXAMPLES")
#     print("=" * 50)
#
#     # Example function for a POST endpoint to create a new patient
#     def create_patient_endpoint(patient_data: dict):
#         """Example for POST /patients/"""
#         try:
#             patient = Patient(
#                 name=patient_data.get("name", ""),
#                 age=patient_data.get("age", 0),
#                 height=patient_data.get("height", 0.0),
#                 weight=patient_data.get("weight", 0.0),
#                 lab_results=patient_data.get("lab_results", {}),
#                 doctors_notes=patient_data.get("doctors_notes", ""),
#                 severity=patient_data.get("severity", "low")
#             )
#
#             manager = PatientManager()
#             manager.add_patient(patient)
#
#             return {"status": "success", "patient_id": patient.patient_id}
#         except Exception as e:
#             return {"status": "error", "message": str(e)}
#
#     # Example function for a GET endpoint to retrieve all patients
#     def get_all_patients_endpoint():
#         """Example for GET /patients/"""
#         try:
#             manager = PatientManager()
#             patients = manager.get_all_patients()
#
#             # Convert Patient objects to dictionaries for JSON serialization
#             return {
#                 "status": "success",
#                 "patients": [patient.to_dict() for patient in patients]
#             }
#         except Exception as e:
#             return {"status": "error", "message": str(e)}
#
#     # Example function for a GET endpoint to retrieve a specific patient
#     def get_patient_endpoint(patient_id: str):
#         """Example for GET /patients/{patient_id}"""
#         try:
#             manager = PatientManager()
#             patient = manager.get_patient(patient_id)
#
#             if patient:
#                 return {"status": "success", "patient": patient.to_dict()}
#             else:
#                 return {"status": "error", "message": "Patient not found"}
#         except Exception as e:
#             return {"status": "error", "message": str(e)}
#
#     # Example function for a PUT endpoint to update a patient
#     def update_patient_endpoint(patient_id: str, update_data: dict):
#         """Example for PUT /patients/{patient_id}"""
#         try:
#             manager = PatientManager()
#             success = manager.update_patient(patient_id, update_data)
#
#             if success:
#                 updated_patient = manager.get_patient(patient_id)
#                 return {"status": "success", "patient": updated_patient.to_dict()}
#             else:
#                 return {"status": "error", "message": "Patient not found"}
#         except Exception as e:
#             return {"status": "error", "message": str(e)}
#
#     # Example function for a DELETE endpoint to delete a patient
#     def delete_patient_endpoint(patient_id: str):
#         """Example for DELETE /patients/{patient_id}"""
#         try:
#             manager = PatientManager()
#             success = manager.delete_patient(patient_id)
#
#             if success:
#                 return {"status": "success", "message": "Patient deleted successfully"}
#             else:
#                 return {"status": "error", "message": "Patient not found"}
#         except Exception as e:
#             return {"status": "error", "message": str(e)}
#
#     print("\nThe above function examples show how to integrate the PatientManager")
#     print("with FastAPI endpoints. Each function can be used directly with a")
#     print("FastAPI route by adding the appropriate decorators.")
#
#     print("\nExample FastAPI implementation:")
#     print("""
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import Dict, Optional, List
#
# app = FastAPI()
#
# # Pydantic models for request validation
# class PatientCreate(BaseModel):
#     name: str
#     age: int
#     height: float
#     weight: float
#     lab_results: Dict = {}
#     doctors_notes: str = ""
#     severity: str = "low"
#
# class PatientUpdate(BaseModel):
#     name: Optional[str] = None
#     age: Optional[int] = None
#     height: Optional[float] = None
#     weight: Optional[float] = None
#     lab_results: Optional[Dict] = None
#     doctors_notes: Optional[str] = None
#     severity: Optional[str] = None
#
# # Routes
# @app.post("/patients/")
# def create_patient(patient: PatientCreate):
#     return create_patient_endpoint(patient.dict())
#
# @app.get("/patients/")
# def get_all_patients():
#     return get_all_patients_endpoint()
#
# @app.get("/patients/{patient_id}")
# def get_patient(patient_id: str):
#     response = get_patient_endpoint(patient_id)
#     if response["status"] == "error":
#         raise HTTPException(status_code=404, detail=response["message"])
#     return response
#
# @app.put("/patients/{patient_id}")
# def update_patient(patient_id: str, update_data: PatientUpdate):
#     response = update_patient_endpoint(patient_id, update_data.dict(exclude_unset=True))
#     if response["status"] == "error":
#         raise HTTPException(status_code=404, detail=response["message"])
#     return response
#
# @app.delete("/patients/{patient_id}")
# def delete_patient(patient_id: str):
#     response = delete_patient_endpoint(patient_id)
#     if response["status"] == "error":
#         raise HTTPException(status_code=404, detail=response["message"])
#     return response
#     """)
#
#     print("\n" + "=" * 50)
#
#
# if __name__ == "__main__":
#     # Run the demonstration
#     demonstrate_patient_manager_usage()
#
#     # Show FastAPI examples
#     fastapi_usage_examples()

# main.py
from patient_manager import Patient, PatientManager
import json
from pprint import pprint

def demonstrate_patient_manager_usage():
    """
    This function demonstrates all the functionality of the PatientManager class.
    It can be used as a reference for integrating with FastAPI.
    """
    print("=" * 50)
    print("PATIENT MANAGEMENT SYSTEM DEMONSTRATION")
    print("=" * 50)

    manager = PatientManager(verbose=True)
    print("\n1. Patient Manager Initialized")

    # 2. Create and Add Patients
    print("\n2. Creating and Adding Patients")
    patients = [
        Patient("Alice Doe", 30, 165, 65, {"glucose": 90}, "Healthy", "low"),
        Patient("Bob Smith", 42, 178, 82, {"glucose": 100}, "Slightly overweight", "medium"),
        Patient("Charlie Brown", 50, 170, 90, {"glucose": 110}, "High blood pressure", "high")
    ]
    for p in patients:
        result = manager.add_patient(p)
        print(f"Added {p.name} (ID: {p.patient_id}) -> {result}")

    # 3. Search Patients
    print("\n3. Searching for Patients (query: 'Bob')")
    search_results = manager.search_patients("Bob")
    for p in search_results:
        pprint(p.to_dict())

    # 4. Filter Patients
    print("\n4. Filtering Patients (min_age: 40, severity: 'medium')")
    filtered = manager.filter_patients({"min_age": 40, "severity": "medium"})
    for p in filtered:
        pprint(p.to_dict())

    # 5. Get All with Pagination
    print("\n5. Getting All Patients with Pagination (limit=2)")
    paged = manager.get_all_patients(limit=2)
    for p in paged:
        pprint(p.to_dict())

    # 6. Count
    print("\n6. Total Patients Count")
    print(manager.count_patients())

    # 7. Update a Patient
    print("\n7. Updating Patient")
    update_result = manager.update_patient(patients[0].patient_id, {"weight": 63.5, "severity": "medium"})
    print(update_result)

    # 8. Delete a Patient
    print("\n8. Deleting a Patient")
    delete_result = manager.delete_patient(patients[2].patient_id)
    print(delete_result)

    # 9. Export to CSV
    print("\n9. Exporting to CSV")
    success = manager.export_patients_csv("patients_demo_export.csv")
    print("Export successful?", success)

    # 10. Add in Bulk
    print("\n10. Adding Patients in Bulk")
    bulk_result = manager.add_patients_bulk([
        Patient("David Blue", 28, 180, 75),
        Patient("Eve Green", 38, 160, 62)
    ])
    print(bulk_result)

    # 11. Dictionary Conversions
    print("\n11. Converting to/from Dictionary")
    p_dict = patients[1].to_dict()
    print("As dict:", p_dict)
    restored = Patient.from_dict(p_dict)
    print("Restored name:", restored.name)

    print("\n12. JSON File Contents")
    try:
        with open(manager.file_path, 'r') as f:
            data = json.load(f)
            print("Saved patient IDs:", list(data.keys()))
    except Exception as e:
        print("Failed to read JSON:", e)

    print("\n" + "=" * 50)
    print("DEMONSTRATION COMPLETE")
    print("=" * 50)


def fastapi_usage_examples():
    """
    This section shows example endpoint functions for a FastAPI app
    and prints out a FastAPI-compatible implementation stub with comments.
    """
    print("\nFASTAPI INTEGRATION EXAMPLES")
    print("=" * 50)

    print("""
# Example FastAPI app:
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict
from patient_manager import async_create_patient, async_get_patient_info

app = FastAPI()

class PatientCreate(BaseModel):
    name: str
    age: int = Field(..., ge=0, le=120)
    height: float = Field(..., ge=0, le=300)
    weight: float = Field(..., ge=0, le=500)
    lab_results: Optional[Dict] = {}
    doctors_notes: Optional[str] = ""
    severity: str = Field("low", regex="^(low|medium|high)$")

@app.post("/patients/")
async def create(patient: PatientCreate):
    result = await async_create_patient(**patient.dict())
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/patients/{patient_id}")
async def get(patient_id: str):
    result = await async_get_patient_info(patient_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["error"])
    return result
    """)

    print("\n" + "=" * 50)


if __name__ == "__main__":
    demonstrate_patient_manager_usage()
    fastapi_usage_examples()
