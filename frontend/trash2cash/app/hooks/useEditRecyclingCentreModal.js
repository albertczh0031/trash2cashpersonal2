import { create } from "zustand";

const useEditRecyclingCentreModal = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export default useEditRecyclingCentreModal;
