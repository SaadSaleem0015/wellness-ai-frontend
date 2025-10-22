import "./styles.css";
import AudioPlayer from "react-modern-audio-player";
import { useState } from "react";
import React from "react";

interface PlaylistItem {
    id: number;
    name: string;
    src: string;
  }

const playList: PlaylistItem[] = [
    {
      id: 1,
      name: "music - 1",
      src: "https://cdn.pixabay.com/audio/2022/08/23/audio_d16737dc28.mp3",
    },
  ];
export default function ShowCallLogModal() {
  const [progressType, setProgressType] = useState<"waveform" | "bar">("waveform");
  const [playerPlacement, setPlayerPlacement] = useState<
    "static" | "top-left" | "bottom-left"
  >("static");

  return (
    <div
      className="App"
      style={{
        width: "100%",
        height: "calc(100vh - 16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "40px",
        flexDirection: "column",
      }}
    >
      <div>
        <h3>React Modern Audio Player</h3>
        <button
          onClick={() =>
            setProgressType((prev) => (prev === "bar" ? "waveform" : "bar"))
          }
        >
          change progress type
        </button>
        <button
          onClick={() => {
            switch (playerPlacement) {
              case "static":
                setPlayerPlacement("top-left");
                break;
              case "top-left":
                setPlayerPlacement("bottom-left");
                break;
              case "bottom-left":
                setPlayerPlacement("static");
                break;
              default:
                break;
            }
          }}
        >
          change player placement
        </button>
      </div>
      <AudioPlayer
        playList={playList}
        activeUI={{
          all: true,
          progress: progressType,
        }}
        placement={{
          player: playerPlacement,
        }}
      />
    </div>
  );
}
