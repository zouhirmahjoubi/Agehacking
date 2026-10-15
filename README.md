# 🛡️ AegisAI // Visual LLM Red-Teaming & Auto-Patch Sandbox

> ⚡ **JUDGES QUICK-START (Zero Setup Required):**  
> 1. Open the live app and click **"🎯 Judge Tour"** in the top bar for a 30-second guided spotlight walkthrough!  
> 2. Or immediately click **"Launch Red-Team Assault"** in the top right corner!  
> We built an **Instant Tactical Simulation Mode** right into the default view—no API keys, no sign-ups, and no configuration needed to experience the full **Attack ➔ Breach ➔ 1-Click Auto-Patch ➔ 98% Verified Defense** loop in under 30 seconds. *(Make sure your sound is ON 🔊 to experience the native Web Audio synthesizer!)*

---

## 🚨 Inspiration & The Problem
Every day, startups and enterprises deploy AI agents with a critical blind spot: **Prompt Injection and System Prompt Leakage**. A single clever jailbreak or Base64 payload can trick a FinTech bot into authorizing wire transfers or force a Healthcare agent to leak sensitive patient data.

Right now, LLM security testing happens in dry, complex CLI tools that only specialized security researchers understand. Meanwhile, frontend and product engineers shipping AI features have **zero visual visibility** into how their prompts break—and no automated way to fix them. 

We built **AegisAI** to transform AI safety from a tedious command-line chore into an interactive, cinematic **Tactical Operations Center**.

---

## ✨ What AegisAI Does (Enterprise Suite)

1. **🎯 Multi-Agent Autonomous Red-Teaming:**  
   Instead of testing prompts manually, AegisAI deploys 4 specialized adversarial agents simultaneously against your System Prompt and secret **Canary Token** (`FLAG{AEGIS_9942_X}`):
   - 🎭 **Persona Hijacker:** Executes DAN and complex executive roleplay jailbreaks.
   - 💉 **Payload Injector:** Fires Base64 encodings, delimiter overrides, and markdown smuggling.
   - 🧠 **Logic Exploiter:** Uses reverse psychology and hypothetical framing traps.
   - 🔓 **System Extractor:** Attempts direct instruction and Canary Token exfiltration.

2. **🕸️ Real-Time Visual Attack Graph & Battle Terminal:**  
   Watch the assault unfold live on an interactive node graph (`@xyflow/react`) paired with a streaming intercept terminal that logs every adversarial turn, payload vector, and security breach with microsecond timestamps and filter controls.

3. **🔥 Live Token-Level Threat Heatmap (Explainable AI Security):**  
   Toggle directly between the raw System Prompt and a live Threat Heatmap that highlights vulnerable directives in pulsing Crimson badges (with CWE/OWASP exploit tooltips) and visualizes hardened XML/Canary defenses in Emerald shields.

4. **🧪 Interactive Judge Playground & Payload Obfuscator:**  
   Want to try breaking the AI yourself? Use the docked `root@redteam:~#` console at the bottom of the terminal to type custom jailbreaks, fire 1-click exploit chips, or transform your payload into **Base64, ROT13, Leetspeak (L33T), or Hex Dump** before firing!

5. **🪄 The Hero Feature: 1-Click "Auto-Patch" Engine:**  
   Finding vulnerabilities is only half the battle. When a breach occurs, AegisAI unlocks the **Auto-Harden System Prompt** engine. It opens a **Side-by-Side Diff Viewer** comparing your vulnerable prompt with an AI-hardened architecture (injecting XML data sandboxing `<system_instructions>`, strict instruction hierarchy, sandwich defense, and canary traps). Clicking **"Apply Patch & Re-Test"** automatically updates the prompt and re-runs the assault—turning crimson breaches into 100% emerald deflections with a **98% Resilience Score**.

6. **📄 Executive OWASP LLM Top 10 Audit & CI/CD Export:**  
   With one click, generate an executive compliance certificate mapping your model against the **OWASP LLM Top 10** (`LLM01`, `LLM02`, `LLM06`, `LLM07`), complete with working downloads for **Markdown Audit Reports (`.md`)** and **JSON CI/CD Telemetry (`.json`)**.

7. **⚡ 1-Click DevSecOps SDK & GitHub Actions Generator:**  
   Export your hardened configuration directly into production-ready **TypeScript/Express middleware**, **Python (FastAPI/LangChain) guardrails**, or an automated **GitHub Actions CI/CD workflow (`.github/workflows/aegis-redteam.yml`)** that blocks PR merges if prompt resilience drops below 90%.

8. **🎯 30s Guided Judge Quick-Tour:**  
   A dedicated 4-step interactive spotlight tour guiding evaluators through the assault launch, threat heatmap, auto-patch loop, and DevSecOps export.

---

## 🛠️ How We Built It
- **Frontend & Tactical UI:** Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**, styled in a high-contrast Palantir/Linear dark obsidian theme (`#090D16`).
- **Interactive Node Canvas:** Powered by **`@xyflow/react`** with custom node types, animated pulsing edges, and reactive state changes.
- **Cinematic Animations:** **`gsap`** handles viewport screen-shaking on critical breach events and score tweening.
- **Procedural Web Audio API Synthesizer (`soundEngine.ts`):**  
  Without loading a single external `.mp3` or `.wav` file, we built a custom synthesizer using native browser `AudioContext` and `OscillatorNode` to generate real-time UI micro-chirps, radar sweeps, breach sirens, and patch-success chords.
- **Dual Execution Engine:** Supports both **Instant Simulation Mode** (for instant deterministic testing and demos) and **Live API Mode** (connecting directly to OpenAI/Anthropic/Gemini endpoints in the browser).

---

## 🎬 2-Minute Pitch & Demo Script (For Evaluators)
- **0:00 - 0:20 (The Threat):** Load *FinTech Wire Bot* preset and click **"Launch Red-Team Assault"**. Watch nodes pulse amber, then turn crimson with an audible breach alarm as the Canary Token leaks.
- **0:20 - 0:45 (The Threat Heatmap):** Switch to **"🔥 Threat Heatmap"** in the left pane to pinpoint the exact authority directives that allowed the jailbreak.
- **0:45 - 1:15 (The Hero Moment):** Click **"✨ Auto-Harden System Prompt"** and review the Side-by-Side Diff. Click **"Apply Patch & Re-Test"**—watch all 4 nodes turn Emerald Green with a triumphant audio chime and 98% Resilience Score.
- **1:15 - 1:40 (Judge Playground):** Try typing a custom injection in `root@redteam:~#`, click `Base64` or `L33T`, and fire it to verify the hardened model deflects it.
- **1:40 - 2:00 (Enterprise Export):** Open **"⚡ Deploy Guardrails (SDK)"** for GitHub Actions YAML and **"📄 Audit Report"** for one-click compliance export.
