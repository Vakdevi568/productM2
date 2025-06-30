from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({"message": "Welcome to the API! Visit /api/"})

urlpatterns = [
    path('', home_view),  # 👈 handles root URL: http://127.0.0.1:8000/
    path('admin/', admin.site.urls),
    path('api/', include('backend.urls')),  # your main API endpoints
]
