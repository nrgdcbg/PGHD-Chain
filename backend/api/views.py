from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.http import JsonResponse

from datetime import datetime

from .models import AuthUser
from .serializers import *  
from .services import *

class GetUserTypeView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_type = user.user_type
        return Response({'user_type': user_type})

class CreateUserView(generics.CreateAPIView):
    queryset = AuthUser.objects.all()
    serializer_class = AuthUserSerializer
    permission_classes = [AllowAny]

class AddPatientDataView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PatientDataSerializer(data = request.data)

        if serializer.is_valid():
            data = serializer.validated_data

            user_address = request.user.address
            name = request.user.first_name
            age = data.get('age')
            height = data.get('height')
            weight = data.get('weight')
            systolic = data.get('systolic')
            diastolic = data.get('diastolic')
            bloodsugar = data.get('bloodsugar')
            symptoms = data.get('symptoms')
            diet = data.get('diet')
            timestamp = int(datetime.now().timestamp())
            
            try:
                receipt = set_patient_data(
                    name,
                    age,    
                    height,
                    weight,
                    systolic,
                    diastolic,
                    bloodsugar,
                    symptoms,
                    diet,
                    timestamp,
                    user_address
                )
                return Response({'transaction_receipt': receipt}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PatientDataView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_address = request.user.address
        
        if not patient_address:
            return Response({'error': 'Patient address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = read_patient_data(patient_address, request.user.address)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PatientDataHistoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_address = request.user.address
        
        if not patient_address:
            return Response({'error': 'Patient address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data_history = get_patient_data_history(patient_address, request.user.address)
            return Response(data_history, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class AccessRequestsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_address = request.user.address
        
        if not patient_address:
            return Response({'error': 'Patient address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            access_requests = get_access_requests(patient_address)
            return Response(access_requests, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ApproveAccessView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        patient_address = request.user.address
        doctor_address = request.data.get('doctor_address')
        time_granted = int(datetime.now().timestamp())
    

        if not patient_address or not doctor_address:
            return Response({'error': 'Patient address and doctor address are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            approve_access(patient_address, doctor_address, time_granted)
            return Response({'status': 'Access granted'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RevokeAccessView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        patient_address = request.user.address
        doctor_address = request.data.get('doctor_address')
        time_revoked = int(datetime.now().timestamp())


        if not patient_address or not doctor_address:
            return Response({'error': 'Patient address and doctor address are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            revoke_access(patient_address, doctor_address, time_revoked)
            return Response({'status': 'Access revoked'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PreviousAccessRequestsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_address = request.user.address
        
        if not patient_address:
            return Response({'error': 'Patient address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            previous_requests = get_previous_requests(patient_address)
            return Response(previous_requests, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RequestAccessView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        doctor_address = request.user.address
        patient_address = request.data.get('patient_address')
        
        if not patient_address:
            return Response({'error': 'Patient address is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            request_access(patient_address, doctor_address)
            return Response({'status': 'Access request submitted'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DoctorRequestsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doctor_address = request.user.address
        
        if not doctor_address:
            return Response({'error': 'Doctor address is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            requests = get_all_requests_by_doctor(doctor_address)
            return Response(requests, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class DoctorPatientDataView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, patient_address):
        doctor_address = request.user.address

        patient = AuthUser.objects.get(address=patient_address)

        if not contract.functions.hasAccess(patient_address, doctor_address).call():
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

        data = contract.functions.readData(patient_address).call({'from': doctor_address})
        prev_data = contract.functions.getDataHistory(patient_address).call({'from': doctor_address})
        prev_data = prev_data[::-1]

        if prev_data:
            prev_data.pop()

        data = list(data)
        data[9] = datetime.fromtimestamp(data[9]).isoformat()

        prev_data = [(a, b, c, d, e, f, g, h, i, datetime.fromtimestamp(j).isoformat()) for (a, b, c, d, e, f, g, h, i, j) in prev_data]
        
        response_data = {
            'current_data': tuple(data),
            'history': prev_data
        }

        try:
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)