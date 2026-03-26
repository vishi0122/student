// Face recognition service using face-api.js

import * as faceapi from 'face-api.js';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
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
// Firestore doesn't support nested arrays, so we store as a map: { d0: [...], d1: [...], count: N }
export const saveFaceDescriptors = async (studentDocId, descriptors) => {
  const ref = doc(db, 'students', studentDocId);
  const descriptorMap = {};
  descriptors.forEach((d, i) => { descriptorMap[`d${i}`] = Array.from(d); });
  descriptorMap.count = descriptors.length;
  // Use setDoc with merge so it works even if the doc was just created locally
  await setDoc(ref, {
    faceDescriptorMap: descriptorMap,
    faceDescriptor: Array.from(descriptors[0]),
    faceRegistered: true,
  }, { merge: true });
};

// Load all stored descriptors for a student
export const loadFaceDescriptors = async (studentDocId) => {
  const snap = await getDoc(doc(db, 'students', studentDocId));
  if (!snap.exists()) return null;
  const data = snap.data();
  // New map format
  if (data.faceDescriptorMap?.count) {
    const result = [];
    for (let i = 0; i < data.faceDescriptorMap.count; i++) {
      const arr = data.faceDescriptorMap[`d${i}`];
      if (arr) result.push(new Float32Array(arr));
    }
    return result.length ? result : null;
  }
  // Legacy single descriptor
  if (data.faceDescriptor) return [new Float32Array(data.faceDescriptor)];
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
