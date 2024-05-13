import React, { useState, useEffect } from 'react';
import {
  LatestRatesResponse,
  fetchLatestRates,
} from '../services/exchangeRateAPI';
import { CurrencyConfig } from './Dashboard';

interface CurrencyWidgetProps {
  config: CurrencyConfig;
  editMode: boolean;
  onDelete: () => void;
}

const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({
  config,
  editMode,
  onDelete,
}) => {
  const { baseCurrency, targetCurrencies } = config;

  const [rates, setRates] = useState<{ [key: string]: number }>({
    // TODO: Remove
    // JPY: 114.25988,
    // USD: 0.731331,
  });
  const [error, setError] = useState<string | null>(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [amount, setAmount] = useState<string>('');

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    setAmount(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response: LatestRatesResponse = await fetchLatestRates(
          baseCurrency,
          targetCurrencies
        );
        setRates(response.rates);
        setError(null);
      } catch (error) {
        setError('Failed to fetch data');
        console.error(error);
      }
    };

    fetchData();

    let intervalId: number | null = null;
    if (isRealTime) {
      intervalId = setInterval(fetchData, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [baseCurrency, targetCurrencies, isRealTime]);

  return (
    <div
      className={`p-4 border rounded shadow-sm bg-white ${
        editMode ? 'bg-blue-100' : ''
      }`}
    >
      {editMode && <div className='text-sm text-blue-700'>Editing...</div>}
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-lg'>{baseCurrency} Exchange Rates</h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none'
        >
          Delete
        </button>
      </div>
      <input
        type='number'
        value={amount}
        onChange={handleAmountChange}
        placeholder='Enter amount'
        className='mt-2 mb-4 w-full p-2 border rounded'
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
      <label className='inline-flex items-center mt-3'>
        <input
          type='checkbox'
          className='form-checkbox h-5 w-5 text-blue-600'
          checked={isRealTime}
          onChange={() => setIsRealTime(!isRealTime)}
        />
        <span className='ml-2 text-gray-700'>Real-Time Updates</span>
      </label>
      {error ? (
        <p className='text-red-500'>{error}</p>
      ) : (
        <ul>
          {Object.keys(rates).map((key) => (
            <li key={key} className='text-sm'>
              {key}:
              {` ${(rates[key] * parseFloat(amount ? amount : '1')).toFixed(
                2
              )} per ${amount ? amount : '1'} ${baseCurrency}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrencyWidget;
