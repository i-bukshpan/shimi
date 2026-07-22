import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, useCurrentFrame, useVideoConfig, Video } from "remotion";
import { loadFont } from "@remotion/google-fonts/VarelaRound";

// Load the Varela Round font
loadFont();

export type AICreation = {
  id: string;
  created_at: string;
  author: string;
  raw_blessing: string;
  generated_media_url: string;
  tts_media_url: string;
  media_type: string;
};

export type BirthdayVideoProps = {
  creations: AICreation[];
};

// We will allocate 6 seconds (180 frames at 30fps) per image/text slide.
const FRAMES_PER_SLIDE = 180;

export const BirthdayVideo: React.FC<BirthdayVideoProps> = ({ creations }) => {
  const { fps } = useVideoConfig();
  
  if (!creations || creations.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#fafaf9", justifyContent: "center", alignItems: "center" }}>
        <h1 style={{ fontFamily: "Varela Round", fontSize: 60, color: "#444" }}>אין יצירות להציג</h1>
      </AbsoluteFill>
    );
  }

  // Calculate starting frames for each sequence
  let currentStartFrame = 0;
  const sequences = creations.map((creation) => {
    // For simplicity, we assign a fixed 6 seconds (180 frames) to every item unless we know its exact duration.
    // In a production app, we would measure video duration first, but for this demo 6s is safe.
    const duration = FRAMES_PER_SLIDE;
    const start = currentStartFrame;
    currentStartFrame += duration;
    
    return { ...creation, startFrame: start, durationInFrames: duration };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#fafaf9" }}>
      
      {/* Background Music - loops across the entire video */}
      <Audio 
        src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=happy-birthday-113974.mp3" 
        loop
        volume={0.1}
      />

      {sequences.map((creation, index) => {
        return (
          <Sequence
            key={creation.id}
            from={creation.startFrame}
            durationInFrames={creation.durationInFrames}
          >
            <Slide creation={creation} />
          </Sequence>
        );
      })}
      
    </AbsoluteFill>
  );
};

const Slide: React.FC<{ creation: AICreation }> = ({ creation }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(1, frame / 15); // fade in over 15 frames

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" }}>
      
      {/* Play TTS if available */}
      {creation.tts_media_url && (
         <Audio src={creation.tts_media_url} volume={1} />
      )}

      {/* Play User Audio if available */}
      {creation.media_type === "audio" && creation.generated_media_url && (
         <Audio src={creation.generated_media_url} volume={1} />
      )}

      {/* Render Media */}
      {creation.media_type === "video" && creation.generated_media_url ? (
        <Video src={creation.generated_media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : creation.media_type === "image" && creation.generated_media_url ? (
        <Img src={creation.generated_media_url} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute" }} />
      ) : null}

      {/* Floating Emojis Overlay */}
      {['🎈', '🎉', '✨', '🎈', '⭐'].map((emoji, i) => {
        const xOffset = 100 + (i * 200);
        const yOffset = 1920 - ((frame * 10) % 2200) + (i * 150);
        const float = Math.sin((frame + i * 20) / 10) * 30;
        
        return (
          <div key={i} style={{
            position: "absolute",
            left: xOffset + float,
            top: yOffset,
            fontSize: "80px",
            zIndex: 10
          }}>
            {emoji}
          </div>
        )
      })}

      {/* Render Text Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 50,
          right: 50,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: "40px",
          borderRadius: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Varela Round, sans-serif",
          textAlign: "center"
        }}
        dir="rtl"
      >
        <h2 style={{ margin: 0, fontSize: "50px", color: "#1e3a8a", fontWeight: "bold" }}>{creation.author}</h2>
        <p style={{ margin: "20px 0 0 0", fontSize: "40px", color: "#333", lineHeight: "1.4" }}>{creation.raw_blessing}</p>
      </div>

    </AbsoluteFill>
  );
};
