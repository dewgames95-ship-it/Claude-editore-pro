import { Config } from "@remotion/cli/config";
import fs from "fs";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

// Cloud container: pehle se installed Chromium use karo (local PC par ignore)
const cloudChrome =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (fs.existsSync(cloudChrome)) {
  Config.setBrowserExecutable(cloudChrome);
}
