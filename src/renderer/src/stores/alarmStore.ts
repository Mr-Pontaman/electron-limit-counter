import { create } from "zustand";
import alarmMp3 from "../assets/white-noise.mp3";
import { Item } from "../../../shared/types";

type CountSnapshot = { name: string; count: number };

const toSnapshot = (items: Item[]): CountSnapshot[] =>
  items.map((i) => ({ name: i.name, count: i.count }));

const hasNewExceeded = (items: Item[], prev: Map<string, number>): boolean =>
  items.some((item) => {
    if (item.count <= item.limit) return false;
    const prevCount = prev.get(item.name);
    return prevCount !== undefined && item.count > prevCount;
  });

let audioEl: HTMLAudioElement | null = null;
const getAudio = (): HTMLAudioElement => {
  if (!audioEl) {
    audioEl = new Audio(alarmMp3);
    audioEl.loop = true;
    audioEl.volume = 0.3;
  }
  return audioEl;
};

let prevSnapshot: CountSnapshot[] = [];
let prevCounts = new Map<string, number>();
let alarmTriggered = false;

interface AlarmState {
  isAlarmOn: boolean;
  checkItems: (items: Item[]) => void;
  stopAlarmAndHide: () => void;
}

export const useAlarmStore = create<AlarmState>((set) => ({
  isAlarmOn: false,

  checkItems: (items: Item[]) => {
    const snapshot = toSnapshot(items);

    if (
      prevSnapshot.length === snapshot.length &&
      prevSnapshot.every((s, i) => s.name === snapshot[i].name && s.count === snapshot[i].count)
    ) {
      return;
    }

    prevSnapshot = snapshot;

    if (hasNewExceeded(items, prevCounts) && !alarmTriggered) {
      alarmTriggered = true;
      set({ isAlarmOn: true });
      getAudio().play().catch(console.error);
    }

    prevCounts = new Map(items.map((i) => [i.name, i.count]));
  },

  stopAlarmAndHide: () => {
    alarmTriggered = false;
    const audio = getAudio();
    audio.pause();
    audio.currentTime = 0;
    set({ isAlarmOn: false });
  }
}));
