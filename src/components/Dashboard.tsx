import React, { useState, useEffect } from 'react';
import CurrencyWidget from './CurrencyWidget';
import { fetchSymbols } from '../services/exchangeRateAPI';

export interface CurrencyConfig {
  id: number;
  baseCurrency: string;
  targetCurrencies: string[];
}

// TODO: Remove dummy data
// const SYMBOLS_DATA = {
//   success: true,
//   symbols: {
//     AED: 'United Arab Emirates Dirham',
//     AFN: 'Afghan Afghani',
//     ALL: 'Albanian Lek',
//     AMD: 'Armenian Dram',
//     ANG: 'Netherlands Antillean Guilder',
//     AOA: 'Angolan Kwanza',
//   },
// };

const Dashboard: React.FC = () => {
  const [currencyWidgets, setCurrencyWidgets] = useState<CurrencyConfig[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState<string>('');
  const [selectedTargetCurrencies, setSelectedTargetCurrencies] = useState<
    string[]
  >([]);
  const [editingWidgetId, setEditingWidgetId] = useState<number | null>(null);

  useEffect(() => {
    // TODO: Remove. For dummy data
    // setAvailableCurrencies(Object.keys(SYMBOLS_DATA.symbols));
    // setSelectedBaseCurrency(Object.keys(SYMBOLS_DATA.symbols)[0]);
    // setSelectedTargetCurrencies(Object.keys(SYMBOLS_DATA.symbols).slice(1, 4));

    // --------

    fetchSymbols()
      .then((data) => {
        setAvailableCurrencies(Object.keys(data.symbols));
        setSelectedBaseCurrency(Object.keys(data.symbols)[0]);
        setSelectedTargetCurrencies(Object.keys(data.symbols).slice(1, 4));
      })
      .catch((error) => {
        console.error('Error fetching symbols:', error);
      });
  }, []);

  const handleBaseCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedBaseCurrency(event.target.value);
  };

  const handleTargetCurrenciesChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const options = event.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setSelectedTargetCurrencies(value);
  };

  const handleWidgetSelection = (widget: CurrencyConfig) => {
    if (!editingWidgetId) {
      setSelectedBaseCurrency(widget.baseCurrency);
      setSelectedTargetCurrencies(widget.targetCurrencies);
      setEditingWidgetId(widget.id);
    } else {
      setEditingWidgetId(null);
    }
  };

  const addOrUpdateWidget = () => {
    if (editingWidgetId === null) {
      const newWidget: CurrencyConfig = {
        id: Date.now(),
        baseCurrency: selectedBaseCurrency,
        targetCurrencies: selectedTargetCurrencies,
      };
      setCurrencyWidgets([...currencyWidgets, newWidget]);
    } else {
      const updatedWidgets = currencyWidgets.map((widget) =>
        widget.id === editingWidgetId
          ? {
              ...widget,
              baseCurrency: selectedBaseCurrency,
              targetCurrencies: selectedTargetCurrencies,
            }
          : widget
      );
      setCurrencyWidgets(updatedWidgets);
      setEditingWidgetId(null); // Reset editing ID after update
    }
  };

  const removeWidget = (widgetId: number) => {
    if (editingWidgetId === widgetId) {
      setEditingWidgetId(null);
    }
    setCurrencyWidgets(
      currencyWidgets.filter((widget) => widget.id !== widgetId)
    );
  };

  const buttonText = editingWidgetId === null ? 'Add Widget' : 'Update Widget';

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold text-center my-6'>
        Currency Exchange Dashboard
      </h1>
      <div className='flex items-start mb-2'>
        <select
          value={selectedBaseCurrency}
          onChange={handleBaseCurrencyChange}
          className='p-2 border rounded'
        >
          {availableCurrencies.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <select
          multiple={true}
          value={selectedTargetCurrencies}
          onChange={handleTargetCurrenciesChange}
          className='ml-2 p-2 border rounded h-40'
        >
          {availableCurrencies
            .filter((currency) => currency !== selectedBaseCurrency) // Can't convert to same currency
            .map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
        </select>
        <button
          onClick={addOrUpdateWidget}
          className='ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          {buttonText}
        </button>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {currencyWidgets.map((widget) => (
          <div onClick={() => handleWidgetSelection(widget)} key={widget.id}>
            <CurrencyWidget
              config={widget}
              editMode={editingWidgetId === widget.id}
              onDelete={() => removeWidget(widget.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
