

export const logger = {
  error: (msg: string, err?: any) => {
    let detail = '';
    let code = '';
    let status = '';
    
    if (err) {
      if (typeof err === 'string') {
        detail = err;
      } else if (err instanceof Error) {
        detail = `${err.name}: ${err.message}`;
        // Add more specific error properties if available
        if ('code' in err && err.code) code = String(err.code);
        if ('status' in err && err.status) status = String(err.status);
      } else if (typeof err === 'object') {
        try {
          const message = err.message || err.error_description || err.error?.message;
          if (message) {
            detail = message;
          } else {
            detail = JSON.stringify(err);
          }
          if (err.code) code = String(err.code);
          if (err.status) status = String(err.status);
        } catch (e) {
          detail = String(err);
        }
      } else {
        detail = String(err);
      }
    }
    
    const errorDetails = [
      detail ? `Details: ${detail}` : '',
      code ? `Code: ${code}` : '',
      status ? `Status: ${status}` : ''
    ].filter(Boolean).join(' | ');

    console.error(`[ERROR] ${msg}${errorDetails ? ` | ${errorDetails}` : ''}`);
  },
  warn: (msg: string, err?: any) => {
    let detail = '';
    let code = '';
    let status = '';

    if (err) {
      if (typeof err === 'string') {
        detail = err;
      } else if (err instanceof Error) {
        detail = `${err.name}: ${err.message}`;
        if ('code' in err && err.code) code = String(err.code);
        if ('status' in err && err.status) status = String(err.status);
      } else if (typeof err === 'object') {
        try {
          const message = err.message || err.error_description || err.error?.message;
          if (message) {
            detail = message;
          } else {
            detail = JSON.stringify(err);
          }
          if (err.code) code = String(err.code);
          if (err.status) status = String(err.status);
        } catch (e) {
          detail = String(err);
        }
      } else {
        detail = String(err);
      }
    }
    const errorDetails = [
      detail ? `Details: ${detail}` : '',
      code ? `Code: ${code}` : '',
      status ? `Status: ${status}` : ''
    ].filter(Boolean).join(' | ');
    console.warn(`[WARN] ${msg}` + (errorDetails ? ` | ${errorDetails}` : ''));
  },
  info: (msg: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${msg}`);
    }
  }
};