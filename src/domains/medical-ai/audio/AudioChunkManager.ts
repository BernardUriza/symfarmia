export type ChunkCallback = (chunk: Float32Array, chunkId: number) => void;

export interface AudioChunkManagerOptions {
  chunkSize: number;
  onChunk: ChunkCallback;
}

export class AudioChunkManager {
  private buffers: Float32Array[] = [];
  private chunkSize: number;
  private onChunk: ChunkCallback;
  private chunkCount = 0;

  constructor(options: AudioChunkManagerOptions) {
    this.chunkSize = options.chunkSize;
    this.onChunk = options.onChunk;
  }

  addData(data: Float32Array) {
    this.buffers.push(data);
    const total = this.buffers.reduce((sum, b) => sum + b.length, 0);

    if (total >= this.chunkSize) {
      const combined = new Float32Array(total);
      let offset = 0;
      for (const b of this.buffers) {
        combined.set(b, offset);
        offset += b.length;
      }
      const chunk = combined.slice(0, this.chunkSize);
      const remaining = combined.slice(this.chunkSize);
      this.buffers = remaining.length ? [remaining] : [];
      this.chunkCount += 1;
      this.onChunk(chunk, this.chunkCount);
    }
  }

  flush() {
    const total = this.buffers.reduce((s, b) => s + b.length, 0);
    if (total > 0) {
      const combined = new Float32Array(total);
      let offset = 0;
      for (const b of this.buffers) {
        combined.set(b, offset);
        offset += b.length;
      }
      this.chunkCount += 1;
      this.onChunk(combined, this.chunkCount);
      this.buffers = [];
    }
  }

  get count() {
    return this.chunkCount;
  }
}
