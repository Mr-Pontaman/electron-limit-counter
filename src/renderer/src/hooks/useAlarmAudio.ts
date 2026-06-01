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
  // プリミティブ値で保持することでミューテーションの影響を受けない
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

    const newlyExceeded = items.some((item) => {
      if (item.count <= item.limit) return false;
      const prevCount = prevCounts.get(item.name);
      if (prevCount === undefined) return false;
      // カウントが増加した結果、制限を超えている（超過中も毎回検知）
      return item.count > prevCount;
    });

    // チェック後にスナップショットを更新（プリミティブ値なのでミューテーション不問）
    prevCountsRef.current = new Map(items.map((item) => [item.name, item.count]));

    if (!newlyExceeded || startedAlarmRef.current) {
      return;
    }

    startedAlarmRef.current = true;
    setIsAlarmOn(true);
    void alarmRef.current?.play().catch((e) => {
      console.error("Failed to play alarm:", e);
    });
  }, [items]);

  const stopAlarmAndHide = () => {
    alarmRef.current?.pause();
    if (alarmRef.current) {
      alarmRef.current.currentTime = 0;
    }

    startedAlarmRef.current = false;
    setIsAlarmOn(false);
  };

  return { isAlarmOn, stopAlarmAndHide };
};
