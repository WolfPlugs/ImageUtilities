declare const DiscordNative: {
  clipboard: {
    copy: (content: string) => void;
    copyImage: (content: Blob) => void;
    cut: () => void;
    paste: () => void;
    read: () => string;
  };
}

