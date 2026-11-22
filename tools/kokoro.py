import sys, soundfile as sf, numpy as np
from kokoro import KPipeline
lang, voice, text, out = sys.argv[1:5]
p = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
a = np.concatenate([x.audio.numpy() for x in p(text, voice=voice, speed=1.05)])
sf.write(out, a, 24000)
