import React, { useState } from "react";
import LoadingScreen from "./Loading";

const Popup = () => {
    const [url, setUrl] = useState('Click the button to check the price...');
    const [lowPrice, setLowPrice] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [highPrice, setHighPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getUrl = () => {
        setLoading(true);
        setError('');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = tabs[0].url;
            if (url.includes("amazon.in")) {
                let message;
                if (url.includes("/s?k=")) {
                    message = "HOME";
                    sendMessageToServer(message);
                } else {
                    message = url;
                    chrome.storage.local.set({ amazonURL: message }, () => {
                        sendMessageToServer(message);
                    });
                }
            } else {
                setUrl("Unable to check the price for this URL.");
                setLoading(false);
            }
        });
    };

    const sendMessageToServer = (message) => {
        fetch('http://localhost:5000/save_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                setError(data.error);
                setLowPrice('');
                setCurrentPrice('');
                setHighPrice('');
            } else {
                if (data.lowPrice !== undefined && data.currentPrice !== undefined && data.highPrice !== undefined) {
                    setLowPrice(`Lowest Price: ${data.lowPrice}`);
                    setCurrentPrice(`Current Price: ${data.currentPrice}`);
                    setHighPrice(`Highest Price: ${data.highPrice}`);
                }
                setLoading(false);
                setUrl("Price details for your item:");
            }
        })
        .catch(e => {
            setError(`Error: ${e.message}`);
            setLoading(false);
        });
    }

    return (
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg text-center h-60 w-60 mx-auto my-auto flex flex-col justify-center items-center animate-fade-in">
            <h1 className="text-4xl font-extrabold mb-6 text-white animate-pulse bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent shadow-lg shadow-blue-500/50 hover:shadow-purple-500/50 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
                PricePulse
            </h1>

            <p id="url" className="mb-2 text-white font-medium">{url}</p>
            <p id="lowPrice" className="mb-2 text-green-200 font-bold">{lowPrice}</p>
            <p id="currentPrice" className="mb-2 text-blue-200 font-bold">{currentPrice}</p>
            <p id="highPrice" className="mb-2 text-red-200 font-bold">{highPrice}</p>
            {error && <p className="text-red-500 font-bold">{error}</p>}
            {loading ? (
                <LoadingScreen />
            ) : (
                <button 
                    id="getUrlButton" 
                    className="mt-4 px-6 py-2 bg-blue-700 text-white font-semibold rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-300 ease-in-out animate-bounce"
                    onClick={getUrl}
                >
                    Check Price Now!
                </button>
            )}
        </div>
    );
}

export default Popup;
