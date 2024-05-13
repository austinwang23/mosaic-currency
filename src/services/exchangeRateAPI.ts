export interface SymbolsResponse {
  success: boolean;
  symbols: { [key: string]: string };
}

export interface LatestRatesResponse {
  success: boolean;
  base: string;
  date: string;
  rates: { [key: string]: number };
}

const API_KEY = ''; // TODO: store in .env
const BASE_URL = 'https://api.apilayer.com/exchangerates_data';

const myHeaders = new Headers();
myHeaders.append('apikey', API_KEY);

const requestOptions = {
  method: 'GET',
  redirect: 'follow' as RequestRedirect,
  headers: myHeaders,
};

export const fetchSymbols = (): Promise<SymbolsResponse> => {
  return fetch(`${BASE_URL}/symbols`, requestOptions).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }
    return response.json();
  });
};

export const fetchLatestRates = (
  base: string,
  symbols: string[]
): Promise<LatestRatesResponse> => {
  const symbolsQuery = symbols.join('%2C');
  return fetch(
    `${BASE_URL}/latest?symbols=${symbolsQuery}&base=${base}`,
    requestOptions
  ).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to fetch latest rates');
    }
    return response.json();
  });
};
