declare const DiscordNative: {
  clipboard: {
    copy: (content: string) => void;
    copyImage: (content: Url|Blob) => void;
    cut: () => void;
    paste: () => void;
    read: () => string;
  };
};
