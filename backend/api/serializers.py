from .models import AuthUser, Patient, Doctor
from rest_framework import serializers

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ['id', 'first_name', 'last_name','username', 'email', 'user_type', 'address', 'password']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user_type = validated_data.pop('user_type')
        user = AuthUser.objects.create_user(**validated_data)

        user.user_type = user_type
        user.save()

        if user_type == 1:
            Doctor.objects.create(user=user)
        elif user_type == 2:
            Patient.objects.create(user=user)

        return user

class PatientSerializer(serializers.ModelSerializer):
    user = AuthUserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'user']

class DoctorSerializer(serializers.ModelSerializer):
    user = AuthUserSerializer(read_only=True)

    class Meta:
        model = Doctor
        fields = ['id', 'user']

class PatientDataSerializer(serializers.Serializer):
    age = serializers.IntegerField(label = "Age")
    height = serializers.IntegerField(label = "Height (in cm)")
    weight = serializers.IntegerField(label = "Weight (in kg)")
    systolic = serializers.IntegerField(label = "Systolic Blood Pressure (in mmHg)")
    diastolic = serializers.IntegerField(label = "Diastolic Blood Pressure (in mmHg)")
    bloodsugar = serializers.IntegerField(label = "Blood Sugar Level in (mg/dL)")
    symptoms = serializers.CharField(label = "Symptoms", max_length=100)
    diet = serializers.CharField(label = "Diet", max_length=100)