import { create } from "zustand";
import { useUserStore } from "./userStore";

export const usechatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,

  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    if (!user || !currentUser) return;

    // Check if the current user is blocked by the receiver
    if (user.blocked.includes(currentUser.id)) {
      set({
        chatId: null,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }
    // Check if the receiver is blocked by the current user
    else if (currentUser.blocked.includes(user.id)) {
      set({
        chatId: null,
        user: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    }
    // If neither is blocked
    else {
      set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
}));
