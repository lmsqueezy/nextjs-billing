interface Window {
  createLemonSqueezy: () => void;
  LemonSqueezy: {
    Setup: () => void;
    Refresh: () => void;
    Url: {
      Open: (url: string) => void;
      Close: () => void;
    };
    Affiliate: {
      GetID: () => string;
      Build: (url: string) => string;
    };
  };
}
