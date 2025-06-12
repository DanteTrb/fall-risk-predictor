from django.urls import path
from .views import predict_fall_risk, get_feature_ranges

urlpatterns = [
    path('predict/', predict_fall_risk, name='predict_fall_risk'),
    path('ranges/', get_feature_ranges, name='get_feature_ranges'),
]
