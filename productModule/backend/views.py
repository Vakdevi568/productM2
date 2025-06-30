from rest_framework.views import APIView
from rest_framework.response import Response
from . import services

class KpiSummaryView(APIView):
    def post(self, request):
        data = request.data
        category = data.get("category")
        start = data.get("start")
        end = data.get("end")
        return Response(services.get_kpis_summary(category, start, end))

class TopProductsView(APIView):
    def post(self, request):
        data = request.data
        category = data.get("category")
        start = data.get("start")
        end = data.get("end")
        limit = data.get("limit", 10)
        return Response(services.get_top_products(category, start, end, limit))

class LeastSoldProductsView(APIView):
    def post(self, request):
        data = request.data
        category = data.get("category")
        start = data.get("start")
        end = data.get("end")
        limit = data.get("limit", 10)
        return Response(services.get_least_sold_products(category, start, end, limit))

class CategoryComparisonView(APIView):
    def post(self, request):
        data = request.data
        category = data.get("category")
        start = data.get("start")
        end = data.get("end")
        return Response(services.get_category_comparison(category, start, end))

class FiltersView(APIView):
    def get(self, request):
        return Response({
            "categories": services.get_all_categories()
        })
