from django.urls import path
from .views import *
# from django.urls import path
from . import views

urlpatterns =[
    path('upload_file/', upload_file),
    path('get_file_list/', get_file_list),
    path('get_column_headers/', get_column_headers),
    path('get_column_values/', get_column_values),
    path('get_batches/', get_batches),
    path('get_index/', get_index),
    path('compare_batch_with_gb/', compare_batch_with_gb),
    path('causal_graph_analysis/', causal_graph_analysis),
    path('xai/', xai_view),
    path('What_if/', whatif_view),
    path('get_column_ranges/', get_column_ranges)
]