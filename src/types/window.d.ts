interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        renderButton: (element: HTMLElement, config: any) => void;
        prompt: (notification: any) => void;
        cancel: () => void;
      };
    };
  };
} 