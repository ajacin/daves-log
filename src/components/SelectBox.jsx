import React from 'react';

const SelectBox = ({ onChange, value, options }) => {
    return (
        <div className="inline-block relative w-64">
            <select 
                onChange={onChange} 
                value={value} 
                className="block appearance-none w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
                {options.map(option=>{return <option key={option} value={option}>{option}</option>})}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.305 7.695a.999.999 0 0 0 0 1.41l4.597 4.596a1 1 0 0 0 1.414 0l4.596-4.596a.999.999 0 1 0-1.414-1.41L10 11.587 6.719 7.695a.997.997 0 0 0-1.414 0z"/></svg>
            </div>
        </div>
    );
};

export default SelectBox;