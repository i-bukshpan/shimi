import { Composition } from "remotion";
import { BirthdayVideo, BirthdayVideoProps } from "./BirthdayVideo";
import React from "react";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShimiBirthday"
        component={BirthdayVideo}
        durationInFrames={1800} // Dynamic, will be overridden during render
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          creations: []
        }}
      />
    </>
  );
};
