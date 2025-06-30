import requests

BASE_URL = "http://127.0.0.1:8000"

def safe_json(res):
    try:
        return res.json()
    except Exception as e:
        print("⚠️ JSON decode error:", e)
        print("🔍 Response Text:", res.text.strip())
        return None

def test_welcome():
    print("\n🔹 Testing Welcome Endpoint:")
    res = requests.get(f"{BASE_URL}/api/")
    data = safe_json(res)
    print("✅ Welcome:", res.status_code, data)

def test_top_products():
    print("\n🔹 Testing Top Products Endpoint:")
    res = requests.get(f"{BASE_URL}/api/top-products/")
    data = safe_json(res)
    print("📦 Top Products:", res.status_code, data)

def test_least_sold():
    print("\n🔹 Testing Least Sold Products Endpoint:")
    res = requests.get(f"{BASE_URL}/api/least-sold/")
    data = safe_json(res)
    print("📉 Least Sold Products:", res.status_code, data)

def test_out_of_stock():
    print("\n🔹 Testing Out of Stock Endpoint:")
    res = requests.get(f"{BASE_URL}/api/out-of-stock/")
    data = safe_json(res)
    print("📛 Out of Stock:", res.status_code, data)

if __name__ == "__main__":
    test_welcome()
    test_top_products()
    test_least_sold()
    test_out_of_stock()


