import wave
import struct
import math
import random
import os

SAMPLE_RATE = 44100

def write_wav(filename, samples, num_channels=2):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'wb') as wav:
        wav.setnchannels(num_channels)
        wav.setsampwidth(2) # 16-bit
        wav.setframerate(SAMPLE_RATE)
        
        frames = bytearray()
        for sample in samples:
            if num_channels == 2:
                left, right = sample
            else:
                left = right = sample
            # Clamp between -1.0 and 1.0
            left = max(-1.0, min(1.0, left))
            right = max(-1.0, min(1.0, right))
            
            i_left = int(left * 32767.0)
            i_right = int(right * 32767.0)
            frames.extend(struct.pack('<hh', i_left, i_right))
        wav.writeframes(frames)
    print(f"Generated {filename} ({len(samples)/SAMPLE_RATE:.1f}s)")

# 1. 432Hz Zen Binaural (5 seconds seamless loop)
def gen_zen():
    duration = 5.0
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        # Binaural beat: 432Hz on left, 436Hz on right (4Hz Theta wave)
        drone_l = 0.35 * math.sin(2 * math.pi * 432.0 * t) + 0.25 * math.sin(2 * math.pi * 108.0 * t) + 0.15 * math.sin(2 * math.pi * 216.0 * t)
        drone_r = 0.35 * math.sin(2 * math.pi * 436.0 * t) + 0.25 * math.sin(2 * math.pi * 108.0 * t) + 0.15 * math.sin(2 * math.pi * 216.0 * t)
        # Gentle swell envelope
        mod = 0.85 + 0.15 * math.sin(2 * math.pi * 0.2 * t)
        samples.append((drone_l * mod, drone_r * mod))
    return samples

# 2. Rain Soundscape (4 seconds loop)
def gen_rain():
    duration = 4.0
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    b0_l, b1_l, b2_l = 0.0, 0.0, 0.0
    b0_r, b1_r, b2_r = 0.0, 0.0, 0.0
    for i in range(total_samples):
        # Pink noise generator
        w_l = random.uniform(-1.0, 1.0)
        w_r = random.uniform(-1.0, 1.0)
        b0_l = 0.99765 * b0_l + w_l * 0.0990460
        b1_l = 0.96300 * b1_l + w_l * 0.2965164
        b2_l = 0.57000 * b2_l + w_l * 1.0526913
        pink_l = b0_l + b1_l + b2_l + w_l * 0.1848

        b0_r = 0.99765 * b0_r + w_r * 0.0990460
        b1_r = 0.96300 * b1_r + w_r * 0.2965164
        b2_r = 0.57000 * b2_r + w_r * 1.0526913
        pink_r = b0_r + b1_r + b2_r + w_r * 0.1848

        # Occasional droplet patter
        patter_l = 0.3 * (random.random() > 0.998) * random.uniform(-1.0, 1.0)
        patter_r = 0.3 * (random.random() > 0.998) * random.uniform(-1.0, 1.0)

        samples.append(((pink_l * 0.08 + patter_l), (pink_r * 0.08 + patter_r)))
    return samples

# 3. Night Breeze (4 seconds loop)
def gen_breeze():
    duration = 4.0
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    last_l, last_r = 0.0, 0.0
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        w_l = random.uniform(-1.0, 1.0)
        w_r = random.uniform(-1.0, 1.0)
        # Lowpass filter
        last_l = (last_l + 0.04 * w_l) / 1.04
        last_r = (last_r + 0.04 * w_r) / 1.04
        swell = 0.5 + 0.5 * math.sin(2 * math.pi * 0.25 * t)
        samples.append((last_l * 2.5 * swell, last_r * 2.5 * swell))
    return samples

# 4. Stream / Water (4 seconds loop)
def gen_stream():
    duration = 4.0
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    l1, l2 = 0.0, 0.0
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        w1 = random.uniform(-1.0, 1.0)
        w2 = random.uniform(-1.0, 1.0)
        l1 = (l1 + 0.08 * w1) / 1.08
        l2 = (l2 + 0.08 * w2) / 1.08
        # Bubbling micro-fluctuations
        ripple = 0.7 + 0.3 * math.sin(2 * math.pi * 3.5 * t)
        samples.append((l1 * 2.0 * ripple, l2 * 2.0 * ripple))
    return samples

# 5. Brown Noise (3 seconds loop)
def gen_brown():
    duration = 3.0
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    last_l, last_r = 0.0, 0.0
    for _ in range(total_samples):
        w_l = random.uniform(-1.0, 1.0)
        w_r = random.uniform(-1.0, 1.0)
        last_l = (last_l + 0.02 * w_l) / 1.02
        last_r = (last_r + 0.02 * w_r) / 1.02
        samples.append((last_l * 3.8, last_r * 3.8))
    return samples

# 6. Singing Bowl Chime (1.5 seconds)
def gen_chime():
    duration = 1.5
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-3.5 * t)
        tone = (
            0.5 * math.sin(2 * math.pi * 528.0 * t) +
            0.3 * math.sin(2 * math.pi * 1056.0 * t) +
            0.2 * math.sin(2 * math.pi * 1584.0 * t)
        )
        samples.append((tone * env, tone * env))
    return samples

# 7. Paper Disintegrate (0.4s)
def gen_paper():
    duration = 0.4
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-12.0 * t)
        noise = random.uniform(-1.0, 1.0) * (0.8 + 0.2 * math.sin(2 * math.pi * 80.0 * t))
        samples.append((noise * env * 0.6, noise * env * 0.6))
    return samples

# 8. Typewriter Mechanical Click (0.15s)
def gen_typewriter():
    duration = 0.15
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-35.0 * t)
        click = math.sin(2 * math.pi * 1800.0 * t) + 0.5 * math.sin(2 * math.pi * 900.0 * t) + random.uniform(-0.3, 0.3)
        samples.append((click * env * 0.7, click * env * 0.7))
    return samples

# Pentatonic scale frequencies for notes 0-9
SCALE_FREQS = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]

def gen_classic(note_idx):
    duration = 0.04
    total_samples = int(duration * SAMPLE_RATE)
    freq = 400.0 + note_idx * 75.0
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-70.0 * t)
        click = math.sin(2 * math.pi * freq * t) * 0.7 + math.sin(2 * math.pi * (freq * 2.2) * t) * 0.3 + random.uniform(-0.15, 0.15)
        samples.append((click * env * 0.75, click * env * 0.75))
    return samples

def gen_typewriter_note(note_idx):
    duration = 0.055
    total_samples = int(duration * SAMPLE_RATE)
    strike_freq = 900.0 + note_idx * 110.0
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-50.0 * t)
        clack = (1.0 if math.sin(2 * math.pi * strike_freq * t) > 0 else -1.0) * 0.5 + math.sin(2 * math.pi * (strike_freq * 0.5) * t) * 0.3 + random.uniform(-0.2, 0.2)
        samples.append((clack * env * 0.7, clack * env * 0.7))
    return samples

def gen_typewriter_bell():
    duration = 0.35
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-12.0 * t)
        bell = 0.6 * math.sin(2 * math.pi * 2093.0 * t) + 0.3 * math.sin(2 * math.pi * 4186.0 * t)
        mech_env = math.exp(-60.0 * t)
        mech = (random.uniform(-0.5, 0.5) + math.sin(2 * math.pi * 320.0 * t)) * mech_env * 0.4
        val = bell * env * 0.8 + mech
        samples.append((val, val))
    return samples

def gen_mechanical_note(note_idx):
    duration = 0.065
    total_samples = int(duration * SAMPLE_RATE)
    base_thock = 130.0 + note_idx * 22.0
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-42.0 * t)
        thock = math.sin(2 * math.pi * base_thock * t) * 0.65 + math.sin(2 * math.pi * (base_thock * 2.8) * t) * 0.35
        # Initial tactile bump transient
        bump = math.sin(2 * math.pi * 1400.0 * t) * math.exp(-120.0 * t) * 0.35
        val = (thock + bump) * env * 0.85
        samples.append((val, val))
    return samples

def gen_waterdrop_note(note_idx):
    duration = 0.1
    total_samples = int(duration * SAMPLE_RATE)
    freq = SCALE_FREQS[note_idx]
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-28.0 * t)
        # Rising chirp
        current_freq = freq * (1.0 + 0.5 * (1.0 - math.exp(-40.0 * t)))
        drop = math.sin(2 * math.pi * current_freq * t)
        samples.append((drop * env * 0.8, drop * env * 0.8))
    return samples

def gen_waterdrop_chord():
    duration = 0.16
    total_samples = int(duration * SAMPLE_RATE)
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env1 = math.exp(-22.0 * t)
        t2 = max(0.0, t - 0.045)
        env2 = math.exp(-22.0 * t2) if t >= 0.045 else 0.0
        d1 = math.sin(2 * math.pi * 523.25 * (1.0 + 0.4 * t) * t) * env1 * 0.55
        d2 = math.sin(2 * math.pi * 783.99 * (1.0 + 0.4 * t2) * t2) * env2 * 0.55
        val = d1 + d2
        samples.append((val, val))
    return samples

def gen_bubble_note(note_idx):
    duration = 0.075
    total_samples = int(duration * SAMPLE_RATE)
    base_freq = 320.0 + note_idx * 55.0
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-45.0 * t)
        current_freq = base_freq * (1.0 + 1.2 * (t / duration))
        pop = math.sin(2 * math.pi * current_freq * t)
        samples.append((pop * env * 0.8, pop * env * 0.8))
    return samples

def gen_kalimba_note(note_idx):
    duration = 0.28
    total_samples = int(duration * SAMPLE_RATE)
    freq = SCALE_FREQS[note_idx]
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-12.0 * t)
        tine = (
            math.sin(2 * math.pi * freq * t) * 0.7 +
            math.sin(2 * math.pi * (freq * 2.0) * t) * 0.2 +
            math.sin(2 * math.pi * (freq * 3.0) * t) * 0.1
        )
        samples.append((tine * env * 0.85, tine * env * 0.85))
    return samples

def gen_kalimba_chord():
    duration = 0.45
    total_samples = int(duration * SAMPLE_RATE)
    chord = [523.25, 659.25, 783.99] # C5, E5, G5 triad
    samples = []
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-7.5 * t)
        tone = (
            math.sin(2 * math.pi * chord[0] * t) * 0.4 +
            math.sin(2 * math.pi * chord[1] * t) * 0.35 +
            math.sin(2 * math.pi * chord[2] * t) * 0.25
        )
        samples.append((tone * env * 0.85, tone * env * 0.85))
    return samples

dirs = [
    '/Users/madanthambisetty/Downloads/undo/undo-mobile/assets/sounds',
    '/Users/madanthambisetty/Downloads/undo/public/sounds'
]

generators = {
    'zen432.wav': gen_zen,
    'rain.wav': gen_rain,
    'breeze.wav': gen_breeze,
    'stream.wav': gen_stream,
    'brown.wav': gen_brown,
    'chime.wav': gen_chime,
    'paper.wav': gen_paper,
    'typewriter.wav': gen_typewriter,
    'typewriter_bell.wav': gen_typewriter_bell,
    'waterdrop_chord.wav': gen_waterdrop_chord,
    'kalimba_chord.wav': gen_kalimba_chord,
}

for i in range(10):
    generators[f'classic_{i}.wav'] = (lambda idx=i: gen_classic(idx))
    generators[f'typewriter_{i}.wav'] = (lambda idx=i: gen_typewriter_note(idx))
    generators[f'mechanical_{i}.wav'] = (lambda idx=i: gen_mechanical_note(idx))
    generators[f'waterdrop_{i}.wav'] = (lambda idx=i: gen_waterdrop_note(idx))
    generators[f'bubble_{i}.wav'] = (lambda idx=i: gen_bubble_note(idx))
    generators[f'kalimba_{i}.wav'] = (lambda idx=i: gen_kalimba_note(idx))

for d in dirs:
    for name, gen in generators.items():
        write_wav(os.path.join(d, name), gen())

print("All audio files generated locally!")
