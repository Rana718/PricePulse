from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random
import requests


app = Flask(__name__)
CORS(app)

def get_amazon_item_name(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
    }

    session = requests.Session()
    response = session.get(url, headers=headers)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title_tag = soup.find('span', {'id': 'productTitle'})
        if title_tag:
            return title_tag.get_text(strip=True)
        else:
            return None
    else:
        return None
    

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    return driver

def get_amazon_prices(item_name):
    try:
        driver = setup_driver()
        search_url = f"https://www.amazon.in/s?k={item_name.replace(' ', '+')}"
        driver.get(search_url)
        
        wait = WebDriverWait(driver, 10)
        
        prices = []
        current_price = None
        
        while True:
            try:
                price_elements = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'span.a-price-whole')))
                if current_price is None:
                    try:
                        first_price_element = price_elements[0]
                        current_price = float(first_price_element.text.replace('₹', '').replace(',', ''))
                    except ValueError:
                        current_price = None
                
                for price_element in price_elements:
                    try:
                        price = float(price_element.text.replace('₹', '').replace(',', ''))
                        prices.append(price)
                    except ValueError:
                        continue
            except Exception as e:
                print(f"Error retrieving prices: {e}")

            try:
                next_button = driver.find_element(By.CSS_SELECTOR, 'li.a-last a')
                if 'a-disabled' in next_button.get_attribute('class'):
                    break 
                next_button.click()
                time.sleep(random.uniform(2, 5))
            except Exception as e:
                print(f"Error navigating to next page: {e}")
                break
        
        driver.quit()
        
        if prices:
            low_price = min(prices)
            high_price = max(prices)
            return current_price, low_price, high_price
        else:
            return current_price, None, None
    except Exception as e:
        print(f"Amazon scraping error: {e}")
        return None, None, None


@app.route('/save_url', methods=['POST'])
def save_url_data():
    data = request.get_json()
    url = data.get('url')
    if url == "HOME":
        print("okokko")
        return jsonify({"error": "Home URL is not supported"}), 400
    
    else:
        try: 
            item_name = get_amazon_item_name(url)
            if item_name:
                current_price, low_price, high_price = get_amazon_prices(item_name)
                if low_price is not None and high_price is not None:
                    response = {
                        'message': 'URL received and saved successfully.',
                        'lowPrice': low_price,
                        'currentPrice': current_price,
                        'highPrice': high_price
                    }
                    return jsonify(response), 200
                else:
                    return jsonify({"error": "Failed to retrieve prices"}), 400
            else:
                return jsonify({"error": "Failed to retrieve item name from URL"}), 400
            
        except Exception as e:
            print(f"Error in save_url_data: {e}")
            return jsonify({"error": "An error occurred processing the request"}), 500
    


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)