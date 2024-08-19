from django.urls import path
from . import views

urlpatterns = [
    path('add-patient-data/', views.AddPatientDataView.as_view(), name='add-patient-data'),
    path('patient-data/', views.PatientDataView.as_view(), name='patient-data'),
    path('patient-data-history/', views.PatientDataHistoryView.as_view(), name='patient-data-history'),
    path('user-type/', views.GetUserTypeView.as_view(), name='user-type'),
    path('access-requests/', views.AccessRequestsView.as_view(), name='access-requests'),
    path('approve-access/', views.ApproveAccessView.as_view(), name='approve-access'),
    path('revoke-access/', views.RevokeAccessView.as_view(), name='revoke-access'),
    path('previous-requests/', views.PreviousAccessRequestsView.as_view(), name='previous-access-requests'),
    path('doctor-requests/', views.DoctorRequestsView.as_view(), name='doctor-requests'),
    path('request-access/', views.RequestAccessView.as_view(), name='request-access'),
    path('doctor-patient-data/<str:patient_address>/', views.DoctorPatientDataView.as_view(), name='doctor-patient-data'),
]