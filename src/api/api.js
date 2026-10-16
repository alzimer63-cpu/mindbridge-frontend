import axios from "axios";

// Express backend (auth + Firebase CRUD)
const nodeApi = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

// FastAPI — clinical-data prediction + dataset lookup (separate deployable service)
const clinicalApi = axios.create({ baseURL: import.meta.env.VITE_CLINICAL_API_URL || "" });

// FastAPI — MRI/CNN classification (separate deployable service, independent
// of clinicalApi so each can be sized/scaled/deployed on its own)
const mriApi = axios.create({ baseURL: import.meta.env.VITE_MRI_API_URL || "" });

// Attach JWT to every request — all three APIs require authentication.
const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
nodeApi.interceptors.request.use(attachToken);
clinicalApi.interceptors.request.use(attachToken);
mriApi.interceptors.request.use(attachToken);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const registerPatient = (data) =>
  nodeApi.post("/auth/patient/register", data);

export const loginPatient = (data) =>
  nodeApi.post("/auth/patient/login", data);

export const loginDoctor = (data) =>
  nodeApi.post("/auth/doctor/login", data);

// ── Doctors list ─────────────────────────────────────────────────────────────
export const fetchDoctors = () => nodeApi.get("/doctors");

// ── Submissions ───────────────────────────────────────────────────────────────
export const saveSubmission = (data) => nodeApi.post("/submissions", data);

export const fetchMySubmissions = () => nodeApi.get("/submissions/my");

// ── Doctor dashboard ─────────────────────────────────────────────────────────
export const fetchDoctorSubmissions = () => nodeApi.get("/doctor/submissions");

export const fetchSubmissionDetail = (id) =>
  nodeApi.get(`/doctor/submissions/${id}`);

export const saveReview = (id, data) =>
  nodeApi.put(`/doctor/submissions/${id}/review`, data);

export const saveMriResult = (id, mriPrediction) =>
  nodeApi.put(`/submissions/${id}/mri`, { mriPrediction });

// ── Clinical-data prediction (clinical-api service) ────────────────────────────
export const predictAlzheimer = (patientData) =>
  clinicalApi.post("/predict", patientData);

export const fetchPatientRecord = (recordNumber) =>
  clinicalApi.get(`/patient-record/${recordNumber}`);

// ── MRI classification (mri-api service) ────────────────────────────────────────
export const predictMRI = (imageFile) => {
  const fd = new FormData();
  fd.append("file", imageFile);
  return mriApi.post("/predict-mri", fd);
};
