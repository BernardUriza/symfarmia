// audioHelpers.js
export function resampleTo16kHz(input, originalSampleRate) {
  if (originalSampleRate === 16000) return input;
  const ratio = originalSampleRate / 16000;
  const newLength = Math.round(input.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    result[i] = input[Math.floor(i * ratio)] || 0;
  }
  return result;
}

export function normalizeFloat32(array) {
  let max = 0;
  for (let i = 0; i < array.length; i++) {
    if (Math.abs(array[i]) > max) max = Math.abs(array[i]);
  }
  if (max === 0) return array;
  const result = new Float32Array(array.length);
  for (let i = 0; i < array.length; i++) {
    result[i] = array[i] / max;
  }
  return result;
}
