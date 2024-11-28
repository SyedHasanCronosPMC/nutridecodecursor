interface Window {
  google: {
    accounts: {
      id: any;
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: {
            access_token: string;
            error?: string;
          }) => void;
        }) => {
          requestAccessToken: () => void;
        };
      };
    };
  };
}