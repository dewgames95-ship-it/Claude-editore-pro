// Usage: node transcribe.mjs public/aroll/clip.mp4
// A-roll ka word-by-word transcript -> public/captions.json
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const input = process.argv[2];
if (!input) throw new Error("Video path do: node transcribe.mjs public/aroll/clip.mp4");
const dir = path.join(process.cwd(), "whisper.cpp");
const model = "medium"; // Hinglish ke liye medium (multilingual)

await installWhisperCpp({ to: dir, version: "1.5.5" });
await downloadWhisperModel({ model, folder: dir });
execSync(`ffmpeg -y -i "${input}" -ar 16000 -ac 1 /tmp/audio16k.wav`, { stdio: "ignore" });
const out = await transcribe({
  inputPath: "/tmp/audio16k.wav",
  whisperPath: dir,
  whisperCppVersion: "1.5.5",
  model,
  language: "hi",
  tokenLevelTimestamps: true,
});
const { captions } = toCaptions({ whisperCppOutput: out });
fs.writeFileSync("public/captions.json", JSON.stringify(captions, null, 2));
console.log(`Done: ${captions.length} words -> public/captions.json`);
