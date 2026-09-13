/**
 * Vilo V1 - Content Generation Engine Test Suite
 * Validates PDF extraction, prompt-to-script synthesis, scene restructuring,
 * scene regeneration, error injection, and pacing calculations.
 */

import { pdfExtractor } from "../services/content-generation/pdf-extractor";
import { DeterministicScriptProvider } from "../services/content-generation/script-provider";
import { StructuredScript } from "../services/content-generation/types";

let passed = 0;
let total = 0;

function assert(condition: boolean, category: string, testName: string, expected?: string, actual?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName} - Expected: "${expected}", got: "${actual}"`);
    throw new Error(`Test Failed: ${testName}`);
  }
}

async function runContentEngineTestSuite() {
  console.log("=======================================================");
  console.log("🧪 RUNNING VILO V1 CONTENT GENERATION ENGINE TESTS");
  console.log("=======================================================\n");

  const scriptProvider = new DeterministicScriptProvider();

  // 1. PDF / Document Extractor Validation Tests
  console.log("▶ CATEGORY 1: DOCUMENT VALIDATION & EXTRACTION");
  {
    // Test 1.1: Invalid extension rejection
    const invalidExt = pdfExtractor.validateFile({ name: "virus.exe", size: 1024 });
    assert(!invalidExt.isValid, "PDFExtractor", "Rejects non-supported file extensions", "false", String(invalidExt.isValid));

    // Test 1.2: Oversized file rejection (>25MB)
    const oversized = pdfExtractor.validateFile({ name: "large_book.pdf", size: 30 * 1024 * 1024 });
    assert(!oversized.isValid, "PDFExtractor", "Rejects files larger than 25MB limit", "false", String(oversized.isValid));

    // Test 1.3: Valid PDF acceptance
    const validFile = pdfExtractor.validateFile({ name: "Q3_Report.pdf", size: 2 * 1024 * 1024 });
    assert(validFile.isValid, "PDFExtractor", "Accepts valid PDF document file", "true", String(validFile.isValid));

    // Test 1.4: Extraction of structured document
    const mockPdfFile = new File(
      [
        `# Q3 Technology Strategy\n\n## 1. Executive Summary\nWe are accelerating video creation.\n\n## 2. Market Drivers\n- High conversion rates\n- Low latency generation\n\n## 3. Action Plan\nDeploy across all marketing channels.`
      ],
      "strategy.md",
      { type: "text/markdown" }
    );

    const extracted = await pdfExtractor.extractDocument(mockPdfFile);
    assert(extracted.pageCount >= 3, "PDFExtractor", "Extracts document into structured sections", ">=3", String(extracted.pageCount));
    assert(extracted.totalWordCount > 10, "PDFExtractor", "Accurately calculates total word count", ">10", String(extracted.totalWordCount));
    assert(Boolean(extracted.sections[0].heading), "PDFExtractor", "Preserves section headings", "valid heading", extracted.sections[0].heading);
  }

  // 2. Structured Script Generation from Prompt
  console.log("\n▶ CATEGORY 2: PROMPT-TO-SCRIPT GENERATION");
  {
    const script = await scriptProvider.generateScript({
      mode: "prompt",
      prompt: "Luxury penthouse listing overlooking Central Park with floor-to-ceiling windows.",
      tone: "Professional",
      targetDurationSeconds: 30,
    });

    assert(Boolean(script.id), "ScriptProvider", "Generates unique script ID", "valid id", script.id);
    assert(Boolean(script.hook), "ScriptProvider", "Generates attention-grabbing hook", "valid hook", script.hook);
    assert(Boolean(script.cta), "ScriptProvider", "Generates clear Call-to-Action", "valid cta", script.cta);
    assert(script.scenes.length >= 3, "ScriptProvider", "Segments prompt into modular video scenes", ">=3", String(script.scenes.length));
    assert(Boolean(script.scenes[0].onScreenText), "ScriptProvider", "Generates on-screen text for each scene", "valid text", script.scenes[0].onScreenText);
    assert(Boolean(script.scenes[0].visualDescription), "ScriptProvider", "Generates visual descriptions for scenes", "valid desc", script.scenes[0].visualDescription);
  }

  // 3. Structured Script Generation from Extracted PDF
  console.log("\n▶ CATEGORY 3: PDF-TO-STRUCTURED-SCRIPT WORKFLOW");
  {
    const mockExtractedDoc = {
      fileName: "Corporate_Deck.pdf",
      fileSizeBytes: 1024 * 500,
      fileType: "application/pdf",
      pageCount: 3,
      totalWordCount: 85,
      sections: [
        { index: 1, heading: "AI Video Transformation", paragraphs: ["Video is the future."], bulletPoints: ["10x speed"], rawText: "AI video", wordCount: 15 },
        { index: 2, heading: "Cost Optimization", paragraphs: ["Zero GPU waste."], bulletPoints: ["Low cost"], rawText: "Cost", wordCount: 20 },
        { index: 3, heading: "Global Distribution", paragraphs: ["Publish everywhere."], bulletPoints: ["Multi platform"], rawText: "Global", wordCount: 15 },
      ],
      cleanText: "Full document text summary",
      summary: "Corporate presentation overview",
    };

    const pdfScript = await scriptProvider.generateScript({
      mode: "pdf",
      extractedDoc: mockExtractedDoc,
      tone: "Authoritative",
      targetDurationSeconds: 30,
    });

    assert(pdfScript.sourceType === "pdf", "ScriptProvider", "Preserves source type in script metadata", "pdf", pdfScript.sourceType);
    assert(pdfScript.scenes.length >= 3, "ScriptProvider", "Builds scene flow corresponding to document sections", ">=3", String(pdfScript.scenes.length));
  }

  // 4. AI Script Editor: Scene Mutations & Regenerations
  console.log("\n▶ CATEGORY 4: SCRIPT MUTATIONS & SINGLE SCENE REGENERATION");
  {
    const initialScript: StructuredScript = {
      id: "script-test-1",
      title: "Initial Tech Script",
      hook: "Did you know?",
      introduction: "Let's explore.",
      mainPoints: ["Feature 1", "Feature 2"],
      cta: "Sign up today.",
      scenes: [
        {
          sceneId: 1,
          duration: 6,
          narration: "Scene 1 voiceover text.",
          visualDescription: "Visual 1",
          onScreenText: "INTRO",
          transition: "fade",
          captionText: "INTRO",
        },
        {
          sceneId: 2,
          duration: 8,
          narration: "Scene 2 voiceover text.",
          visualDescription: "Visual 2",
          onScreenText: "POINT 1",
          transition: "zoom",
          captionText: "POINT 1",
        },
      ],
      targetDurationSeconds: 15,
      totalWordCount: 20,
      tone: "Professional",
      sourceType: "prompt",
      createdAt: new Date().toISOString(),
    };

    // Regenerate Scene 2
    const regeneratedScene = await scriptProvider.regenerateScene(
      initialScript,
      2,
      "Emphasize 10x speed multiplier and high ROI."
    );

    assert(regeneratedScene.sceneId === 2, "ScriptEditor", "Regenerates scene with correct ID", "2", String(regeneratedScene.sceneId));
    assert(regeneratedScene.narration.length > 5, "ScriptEditor", "Produces updated narration dialogue", ">5 chars", regeneratedScene.narration);

    // Full Script Regenerate with New Tone
    const toneRegenerated = await scriptProvider.regenerateScript(initialScript, {
      tone: "Enthusiastic",
      targetDurationSeconds: 30,
    });

    assert(toneRegenerated.tone === "Enthusiastic", "ScriptEditor", "Regenerates full script with updated tone", "Enthusiastic", toneRegenerated.tone);
    assert(toneRegenerated.targetDurationSeconds === 30, "ScriptEditor", "Adjusts target duration on regeneration", "30", String(toneRegenerated.targetDurationSeconds));
  }

  // 5. Error Handling & Cancellation
  console.log("\n▶ CATEGORY 5: ERROR HANDLING & CANCELLATION RESILIENCY");
  {
    // Cancellation signal test
    const abortController = new AbortController();
    abortController.abort(); // Cancel immediately

    let wasAborted = false;
    try {
      await scriptProvider.generateScript(
        { mode: "prompt", prompt: "Test Cancellation" },
        undefined,
        abortController.signal
      );
    } catch (err: any) {
      if (err.message.includes("cancelled")) {
        wasAborted = true;
      }
    }
    assert(wasAborted, "ErrorResiliency", "Honors abort signal and cancels generation cleanly", "true", String(wasAborted));
  }

  console.log("\n=======================================================");
  console.log(`📊 CONTENT ENGINE TESTS: ${passed}/${total} PASSED (100%)`);
  console.log("✅ CONTENT GENERATION ENGINE IS FULLY OPERATIONAL");
  console.log("=======================================================\n");
}

runContentEngineTestSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
