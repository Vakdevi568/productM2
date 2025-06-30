from django.urls import path
from . import views

urlpatterns = [
    path('kpis/', views.KpiSummaryView.as_view()),
    path('top-products/', views.TopProductsView.as_view()),
    path('least-sold-products/', views.LeastSoldProductsView.as_view()),
    path('category-comparison/', views.CategoryComparisonView.as_view()),
    path('filters/', views.FiltersView.as_view()),
]
