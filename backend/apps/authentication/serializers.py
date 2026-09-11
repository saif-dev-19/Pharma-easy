from django.contrib.auth import authenticate
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user
        return attrs



from .models import User


class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=6,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "role",
            "branch",
            "is_active",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        role = attrs.get("role")
        branch = attrs.get("branch")

        # Admin account should not be created/managed
        if role == User.Role.ADMIN:
            raise serializers.ValidationError(
                "Admin user cannot be created through this API."
            )

        # Manager/Staff must have a branch
        if role in [User.Role.MANAGER, User.Role.STAFF] and not branch:
            raise serializers.ValidationError(
                "Manager and Staff must be assigned to a branch."
            )

        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance