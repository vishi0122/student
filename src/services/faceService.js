// Face recognition service using face-api.js
// Handles model loading, face registration, and face verification

import * as faceapi from 'face-api.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const MODEL_URL = '/models';
let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
};

// Capture face descriptor from a video element
// Returns Float32Array (128-dim) or null if no face detected
export const getFaceDescriptor = async (videoEl) => {
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
};

// Save face descriptor to Firestore for a student (keyed by uid field)
export const saveFaceDescriptor = async (studentDocId, descriptor) => {
  const ref = doc(db, 'students', studentDocId);
  // Store as plain array — Firestore doesn't support Float32Array directly
  await updateDoc(ref, { faceDescriptor: Array.from(descriptor), faceRegistered: true });
};

// Load stored face descriptor for a student doc
export const loadFaceDescriptor = async (studentDocId) => {
  const snap = await getDoc(doc(db, 'students', studentDocId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.faceDescriptor) return null;
  return new Float32Array(data.faceDescriptor);
};

// Compare live descriptor against stored descriptor
// Returns { match: bool, distance: number }
export const compareFaces = (liveDescriptor, storedDescriptor, threshold = 0.65) => {
  const distance = faceapi.euclideanDistance(liveDescriptor, storedDescriptor);
  return { match: distance < threshold, distance: parseFloat(distance.toFixed(3)) };
};

// Capture multiple descriptors and return the averaged one (more stable)
export const getAveragedFaceDescriptor = async (videoEl, samples = 5) => {
  const descriptors = [];
  for (let i = 0; i < samples; i++) {
    const d = await getFaceDescriptor(videoEl);
    if (d) descriptors.push(d);
    await new Promise(r => setTimeout(r, 300)); // small gap between samples
  }
  if (descriptors.length === 0) return null;

  // Average all captured descriptors element-wise
  const avg = new Float32Array(128);
  for (const desc of descriptors) {
    for (let j = 0; j < 128; j++) avg[j] += desc[j];
  }
  for (let j = 0; j < 128; j++) avg[j] /= descriptors.length;
  return { descriptor: avg, sampleCount: descriptors.length };
};
