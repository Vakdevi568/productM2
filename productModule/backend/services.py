from django.db import connection

def fetch_all(query, params=None):
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


# 📦 KPI Summary
def get_kpis_summary(category=None, start=None, end=None):
    filters = []
    params = []
    if category:
        filters.append("c.name = %s")
        params.append(category)
    if start:
        filters.append("o.delivery_date >= %s")
        params.append(start)
    if end:
        filters.append("o.delivery_date <= %s")
        params.append(end)
    filter_sql = " AND " + " AND ".join(filters) if filters else ""

    query = f"""
        SELECT
            SUM(oi.quantity) AS total_units_sold,
            SUM(oi.quantity * COALESCE(oi.discounted_price, oi.price)) AS total_revenue,
            COUNT(DISTINCT p.id) AS sku_count,
            COUNT(DISTINCT rr.id) AS total_returns
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN return_requests rr ON rr.order_item_id = oi.id
        WHERE p.status = 1 {filter_sql}
    """
    result = fetch_all(query, params)[0]

    stock_query = f"""
        SELECT COUNT(*) AS out_of_stock_count
        FROM (
            SELECT p.id
            FROM products p
            JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE pv.stock = 0 AND p.status = 1 {filter_sql}
            GROUP BY p.id
            HAVING SUM(pv.stock) = 0
        ) AS out_of_stock
    """
    out_of_stock = fetch_all(stock_query, params)[0]

    units_sold = result['total_units_sold'] or 0
    total_revenue = result['total_revenue'] or 0
    sku_count = result['sku_count'] or 1
    total_returns = result['total_returns'] or 0
    out_of_stock_count = out_of_stock['out_of_stock_count'] or 0

    return {
        "units_sold": int(units_sold),
        "revenue_per_sku": round(total_revenue / sku_count, 2),
        "return_percent": round((total_returns / units_sold) * 100, 2) if units_sold else 0,
        "out_of_stock_count": out_of_stock_count
    }


# 📊 Top Products
def get_top_products(category=None, start=None, end=None, limit=10):
    filters = []
    params = []
    if category:
        filters.append("c.name = %s")
        params.append(category)
    if start:
        filters.append("o.delivery_date >= %s")
        params.append(start)
    if end:
        filters.append("o.delivery_date <= %s")
        params.append(end)
    filter_sql = " AND " + " AND ".join(filters) if filters else ""

    query = f"""
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            c.name AS category_name,
            SUM(oi.quantity) AS units_sold,
            SUM(oi.quantity * COALESCE(oi.discounted_price, oi.price)) AS revenue,
            COUNT(rr.id) AS return_count,
            SUM(pv.stock) AS current_stock
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN return_requests rr ON rr.order_item_id = oi.id
        WHERE p.status = 1 {filter_sql}
        GROUP BY p.id, p.name, c.name
        ORDER BY revenue DESC
        LIMIT %s
    """
    params.append(limit)
    return fetch_all(query, params)


# 📉 Least Sold Products
def get_least_sold_products(category=None, start=None, end=None, limit=20):
    filters = []
    params = []
    if category:
        filters.append("c.name = %s")
        params.append(category)
    if start:
        filters.append("o.delivery_date >= %s")
        params.append(start)
    if end:
        filters.append("o.delivery_date <= %s")
        params.append(end)
    filter_sql = " AND " + " AND ".join(filters) if filters else ""

    query = f"""
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            c.name AS category_name,
            COALESCE(SUM(oi.quantity), 0) AS units_sold,
            COALESCE(SUM(oi.quantity * COALESCE(oi.discounted_price, oi.price)), 0) AS revenue,
            COUNT(DISTINCT rr.id) AS return_count,
            SUM(pv.stock) AS current_stock
        FROM products p
        JOIN product_variants pv ON pv.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN order_items oi ON oi.product_variant_id = pv.id
        LEFT JOIN orders o ON o.id = oi.order_id
        LEFT JOIN return_requests rr ON rr.order_item_id = oi.id
        WHERE p.status = 1 {filter_sql}
        GROUP BY p.id, p.name, c.name
        ORDER BY units_sold ASC, p.id ASC
        LIMIT %s
    """
    params.append(limit)
    return fetch_all(query, params)



# 🧱 Category Comparison
def get_category_comparison(category=None, start=None, end=None):
    filters = []
    params = []
    if category:
        filters.append("c.name = %s")
        params.append(category)
    if start:
        filters.append("o.delivery_date >= %s")
        params.append(start)
    if end:
        filters.append("o.delivery_date <= %s")
        params.append(end)
    filter_sql = " AND " + " AND ".join(filters) if filters else ""

    query = f"""
        SELECT 
            c.name AS category_name,
            SUM(oi.quantity) AS total_units_sold,
            SUM(oi.quantity * COALESCE(oi.discounted_price, oi.price)) AS total_revenue,
            COUNT(DISTINCT rr.id) AS total_returns
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN return_requests rr ON rr.order_item_id = oi.id
        WHERE p.status = 1 {filter_sql}
        GROUP BY c.name
        ORDER BY total_revenue DESC
    """
    return fetch_all(query, params)


# 📂 Category Filters
def get_all_categories():
    return fetch_all("SELECT DISTINCT name FROM categories WHERE name IS NOT NULL")
