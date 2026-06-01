import { useEffect, useRef, useState } from "react";
import alarmMp3 from "../assets/white-noise.mp3";
import { Item } from "@renderer/types";

type UseAlarmAudioResult = {
  isAlarmOn: boolean;
  stopAlarmAndHide: () => void;
};

export const useAlarmAudio = (items: Item[]): UseAlarmAudioResult => {
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);
  const startedAlarmRef = useRef(false);

  const prevCountsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const audio = new Audio(alarmMp3);
    audio.loop = true;
    audio.volume = 0.3;
    alarmRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      alarmRef.current = null;
    };
  }, []);

  useEffect(() => {
    const prevCounts = prevCountsRef.current;

    const hasNewlyExceeded = items.some((item) => {
      if (item.count <= item.limit) return false;

      const prevCount = prevCounts.get(item.name);
      if (prevCount === undefined) return false;

      return item.count > prevCount;
    });

    prevCountsRef.current = new Map(items.map((item) => [item.name, item.count]));

    if (!hasNewlyExceeded || startedAlarmRef.current) return;

    // アラーム開始
    startedAlarmRef.current = true;
    setIsAlarmOn(true);
    void alarmRef.current?.play().catch((error) => {
      console.error("Failed to play alarm:", error);
    });
  }, [JSON.stringify(items.map((i) => ({ name: i.name, count: i.count })))]);

  const stopAlarmAndHide = () => {
    if (alarmRef.current) {
      alarmRef.current.pause();
      alarmRef.current.currentTime = 0;
    }
    startedAlarmRef.current = false;
    setIsAlarmOn(false);
  };

  return { isAlarmOn, stopAlarmAndHide };
};
