import { supabase } from "@/utils/supabase/client";

export async function generateTTS(text: string): Promise<string | null> {
  const magnificKey = process.env.MAGNIFIC_API_KEY;
  if (!magnificKey || !text.trim()) return null;

  try {
    // 1. Trigger the Generation
    const startRes = await fetch("https://api.magnific.com/v1/ai/voiceover/elevenlabs-turbo-v2-5", {
      method: "POST",
      headers: {
        "x-magnific-api-key": magnificKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        voice_id: "2EiwWnXFnvU5JabPnv8n", // Clyde (Deep Male)
      })
    });

    if (!startRes.ok) {
      console.error(`Magnific TTS Start Failed:`, await startRes.text());
      return null;
    }

    const startData = await startRes.json();
    const taskId = startData.data?.task_id || startData.task_id; // accommodate potential api response formats
    if (!taskId) return null;

    // 2. Poll for Completion (up to 30 seconds)
    let status = "IN_PROGRESS";
    let attempts = 0;
    let ttsUrl = "";
    
    while (status !== "COMPLETED" && status !== "FAILED" && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      const checkRes = await fetch(`https://api.magnific.com/v1/ai/voiceover/elevenlabs-turbo-v2-5/${taskId}`, {
        method: "GET",
        headers: { "x-magnific-api-key": magnificKey }
      });

      if (checkRes.ok) {
        const checkData = await checkRes.json();
        // Adjust depending on actual API response shape for Voiceover
        status = checkData.data?.status || checkData.status;
        if (status === "COMPLETED") {
           ttsUrl = checkData.data?.generated?.[0] || checkData.audio_url || checkData.url || "";
           break;
        }
      }
    }

    if (!ttsUrl) return null;

    // 3. Upload to Supabase Storage
    const fileRes = await fetch(ttsUrl);
    const fileBlob = await fileRes.blob();
    
    const fileName = `tts_${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, fileBlob, {
        contentType: fileBlob.type || "audio/mpeg",
      });
      
    if (uploadError) {
      console.error("Storage upload failed for TTS, using temp URL.", uploadError);
      return ttsUrl; // return temporary url if upload fails
    } else {
      const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    }
  } catch (error) {
    console.error("Generate TTS Error:", error);
    return null; // Return null so we don't block the main flow
  }
}
