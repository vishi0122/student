// Face recognition service using face-api.js

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

// Single descriptor from video element
export const getFaceDescriptor = async (videoEl) => {
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? detection.descriptor : null;
};

// Capture N raw descriptors (no averaging) — more accurate for registration
export const captureMultipleDescriptors = async (videoEl, count = 8, onProgress) => {
  const descriptors = [];
  for (let i = 0; i < count; i++) {
    if (onProgress) onProgress(i + 1, count);
    const d = await getFaceDescriptor(videoEl);
    if (d) descriptors.push(Array.from(d));
    await new Promise(r => setTimeout(r, 400));
  }
  return descriptors; // array of plain number arrays
};

// Save multiple raw descriptors to Firestore
export const saveFaceDescriptors = async (studentDocId, descriptors) => {
  const ref = doc(db, 'students', studentDocId);
  await updateDoc(ref, {
    faceDescriptors: descriptors,      // array of arrays
    faceDescriptor: descriptors[0],    // keep legacy single field for old code
    faceRegistered: true,
  });
};

// Load all stored descriptors for a student
export const loadFaceDescriptors = async (studentDocId) => {
  const snap = await getDoc(doc(db, 'students', studentDocId));
  if (!snap.exists()) return null;
  const data = snap.data();
  // Support both new multi-descriptor and legacy single-descriptor
  if (data.faceDescriptors?.length) {
    return data.faceDescriptors.map(d => new Float32Array(d));
  }
  if (data.faceDescriptor) {
    return [new Float32Array(data.faceDescriptor)];
  }
  return null;
};

// Legacy single-descriptor load (used by StudentScanner verify step)
export const loadFaceDescriptor = async (studentDocId) => {
  const all = await loadFaceDescriptors(studentDocId);
  return all ? all[0] : null;
};

// Compare live descriptor against ONE stored descriptor
export const compareFaces = (live, stored, threshold = 0.5) => {
  const distance = faceapi.euclideanDistance(live, stored);
  return { match: distance < threshold, distance: parseFloat(distance.toFixed(3)) };
};

// Compare live descriptor against ALL stored descriptors — returns best (minimum) distance
// This is the key accuracy improvement: best-of-N matching
export const compareFacesMulti = (live, storedDescriptors, threshold = 0.5) => {
  let best = Infinity;
  for (const stored of storedDescriptors) {
    const dist = faceapi.euclideanDistance(live, stored);
    if (dist < best) best = dist;
  }
  return { match: best < threshold, distance: parseFloat(best.toFixed(3)) };
};

// Legacy averaged descriptor save (kept for compatibility)
export const saveFaceDescriptor = async (studentDocId, descriptor) => {
  await saveFaceDescriptors(studentDocId, [Array.from(descriptor)]);
};

// Legacy averaged capture (kept for compatibility)
export const getAveragedFaceDescriptor = async (videoEl, samples = 5) => {
  const descriptors = [];
  for (let i = 0; i < samples; i++) {
    const d = await getFaceDescriptor(videoEl);
    if (d) descriptors.push(d);
    await new Promise(r => setTimeout(r, 300));
  }
  if (descriptors.length === 0) return null;
  const avg = new Float32Array(128);
  for (const desc of descriptors) for (let j = 0; j < 128; j++) avg[j] += desc[j];
  for (let j = 0; j < 128; j++) avg[j] /= descriptors.length;
  return { descriptor: avg, sampleCount: descriptors.length };
};
